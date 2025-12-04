/**
 * 视频合并服务
 * 调用 Jackie-Cloud-Video-Editor/server 的接口进行视频合并
 */

// 服务器配置 - 默认使用 localhost:3001
const VIDEO_MERGE_SERVER_URL = import.meta.env.VITE_VIDEO_MERGE_SERVER_URL || 'http://localhost:3001';

// 轮询配置
const POLL_INTERVAL = 2000; // 2秒
const POLL_TIMEOUT = 300000; // 5分钟超时
const MAX_CONSECUTIVE_ERRORS = 3; // 最大连续错误次数
const STATUS_CHECK_TIMEOUT = 10000; // 状态查询超时时间（10秒）

// 视频合并请求参数
export interface VideoMergeSegment {
    video: string; // 视频URL
    text: string; // 文案
    duration?: number; // 视频时长（秒），可选
    subtitleStyle?: {
        fontSize?: number;
        fontColor?: string;
        strokeColor?: string;
        strokeWidth?: number;
        fontWeight?: string;
    };
    textEffects?: Array<{
        type: string;
        duration?: number;
        delay?: number;
    }>;
}

export interface VideoMergeRequest {
    settings?: {
        resolution?: string;
        format?: string;
        fps?: number;
        quality?: string;
    };
    segments: VideoMergeSegment[];
    segmentDuration?: number; // 默认片段时长（秒）
}

// 创建任务响应
export interface CreateTaskResponse {
    success: boolean;
    taskId: string;
    message?: string;
}

// 任务状态响应
export interface TaskStatusResponse {
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress: number;
    message: string;
    error?: string;
    elapsed?: number;
    outputFile?: string;
}

// 任务结果响应
export interface TaskResultResponse {
    success: boolean;
    data?: string; // Base64 视频数据
    outputFile?: string; // 输出文件路径
    error?: string;
}

/**
 * 检查服务器健康状态
 */
export async function checkServerHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${VIDEO_MERGE_SERVER_URL}/api/health`, {
            signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
            const health = await response.json();
            console.log('✅ 视频合并服务器运行正常', health);
            return true;
        } else {
            console.error(`❌ 服务器响应异常: HTTP ${response.status}`);
            return false;
        }
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error('❌ 服务器响应超时');
        } else if (error.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
            console.error('❌ 无法连接到视频合并服务器');
        } else {
            console.error('❌ 检查服务器状态失败:', error.message);
        }
        return false;
    }
}

/**
 * 创建视频合并任务
 */
export async function createVideoMergeTask(request: VideoMergeRequest): Promise<string> {
    try {
        const endpoint = `${VIDEO_MERGE_SERVER_URL}/api/video/create`;
        console.log('📤 正在创建视频合并任务...', {
            片段数量: request.segments.length,
            接口地址: endpoint,
        });

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result: CreateTaskResponse = await response.json();

        if (result.success) {
            console.log('✅ 任务创建成功！', { taskId: result.taskId });
            return result.taskId;
        } else {
            throw new Error(result.message || '创建任务失败');
        }
    } catch (error: any) {
        console.error('❌ 创建任务失败:', error.message);
        if (error.code === 'ECONNREFUSED') {
            throw new Error('无法连接到视频合并服务器，请确保服务器已启动');
        }
        throw error;
    }
}

/**
 * 查询任务状态
 */
export async function pollVideoMergeStatus(taskId: string): Promise<TaskStatusResponse> {
    try {
        const response = await fetch(`${VIDEO_MERGE_SERVER_URL}/api/video/${taskId}/status`, {
            signal: AbortSignal.timeout(STATUS_CHECK_TIMEOUT),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return await response.json();
    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw new Error('查询状态超时: 服务器响应时间过长');
        } else if (error.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
            throw new Error('查询状态失败: 无法连接到服务器');
        } else {
            throw error;
        }
    }
}

/**
 * 获取合并结果
 */
export async function getVideoMergeResult(taskId: string): Promise<TaskResultResponse> {
    try {
        const response = await fetch(`${VIDEO_MERGE_SERVER_URL}/api/video/${taskId}/result`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error('❌ 获取结果失败:', error.message);
        throw error;
    }
}

/**
 * 轮询任务状态直到完成
 */
export async function pollTaskUntilComplete(
    taskId: string,
    onProgress?: (progress: number, message: string) => void
): Promise<TaskStatusResponse> {
    const startTime = Date.now();
    let lastProgress = 0;
    let consecutiveErrors = 0;

    while (true) {
        // 检查超时
        const elapsed = Date.now() - startTime;
        if (elapsed > POLL_TIMEOUT) {
            throw new Error(`任务超时: 超过 ${POLL_TIMEOUT / 1000} 秒未完成`);
        }

        try {
            const status = await pollVideoMergeStatus(taskId);
            consecutiveErrors = 0; // 重置错误计数

            // 显示进度变化
            if (status.progress !== lastProgress && onProgress) {
                onProgress(status.progress, status.message);
                lastProgress = status.progress;
            }

            if (status.status === 'completed') {
                console.log('✅ 任务完成！', {
                    总耗时: status.elapsed || Math.round(elapsed / 1000) + '秒',
                    输出文件: status.outputFile,
                });
                return status;
            } else if (status.status === 'error') {
                throw new Error(status.error || '任务失败');
            }

            // 等待后继续查询
            await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
        } catch (error: any) {
            consecutiveErrors++;
            const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
            console.error(`[${elapsedSeconds}秒] 轮询错误 (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}):`, error.message);

            if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                throw new Error('连续失败次数过多，停止轮询。请检查服务器是否正常运行');
            }

            // 等待后重试
            await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
        }
    }
}

/**
 * 合并视频（完整流程）
 */
export async function mergeVideosWithServer(
    segments: VideoMergeSegment[],
    settings?: VideoMergeRequest['settings'],
    segmentDuration: number = 5,
    onProgress?: (progress: number, message: string) => void
): Promise<string> {
    // 1. 检查服务器健康状态（可选，如果失败可以继续尝试）
    try {
        await checkServerHealth();
    } catch (error) {
        console.warn('⚠️ 服务器健康检查失败，继续尝试创建任务...');
    }

    // 2. 构建请求
    const request: VideoMergeRequest = {
        settings: settings || {
            resolution: '1080p',
            format: 'mp4',
            fps: 30,
            quality: 'high',
        },
        segments,
        segmentDuration,
    };

    // 3. 创建任务
    const taskId = await createVideoMergeTask(request);

    // 4. 轮询状态
    const status = await pollTaskUntilComplete(taskId, onProgress);

    // 5. 获取结果
    const result = await getVideoMergeResult(taskId);

    if (!result.success) {
        throw new Error(result.error || '获取结果失败');
    }

    // 6. 返回视频URL
    // 优先使用 outputFile 构建完整URL，如果没有则使用 base64 数据
    if (result.outputFile) {
        // 如果 outputFile 已经是完整URL，直接返回
        if (result.outputFile.startsWith('http://') || result.outputFile.startsWith('https://')) {
            return result.outputFile;
        }
        // 否则拼接服务器URL
        return `${VIDEO_MERGE_SERVER_URL}${result.outputFile}`;
    } else if (result.data) {
        // 如果有 base64 数据，转换为 Blob URL
        const binaryString = atob(result.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'video/mp4' });
        return URL.createObjectURL(blob);
    } else {
        throw new Error('未获取到视频数据');
    }
}

