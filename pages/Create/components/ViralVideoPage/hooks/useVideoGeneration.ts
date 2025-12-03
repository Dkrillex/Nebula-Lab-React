import { useState, useRef, useCallback, useEffect } from 'react';
import { videoGenerateService } from '@/services/videoGenerateService';
import toast from 'react-hot-toast';
import { StoryboardVideo, VideoStatus, Storyboard, StoryboardScene } from '../types';
import { UploadedImage } from '../types';

interface UseVideoGenerationOptions {
  uploadedImages: UploadedImage[];
  initialVideos?: Record<number, StoryboardVideo>; // 初始视频状态（用于项目恢复）
}

export const useVideoGeneration = (options: UseVideoGenerationOptions) => {
  const { uploadedImages, initialVideos } = options;
  const [storyboardVideos, setStoryboardVideos] = useState<Record<number, StoryboardVideo>>(initialVideos || {});
  const [generatingScenes, setGeneratingScenes] = useState<number[]>([]);
  const videoPollingIntervals = useRef<Record<number, NodeJS.Timeout>>({});

  // 生成单个分镜视频
  const generateSceneVideo = useCallback(async (
    sceneId: number,
    storyboard: Storyboard | null,
    editedStoryboard: Storyboard | null
  ) => {
    const currentStoryboard = editedStoryboard || storyboard;
    if (!currentStoryboard) {
      toast.error('分镜数据不存在');
      return;
    }

    const scene = currentStoryboard.scenes.find((s: StoryboardScene) => s.id === sceneId);
    if (!scene) {
      toast.error('分镜不存在');
      return;
    }

    setGeneratingScenes((prev) => [...prev, sceneId]);
    setStoryboardVideos((prev) => ({
      ...prev,
      [sceneId]: { status: 'pending' },
    }));

    try {
      // 构建视频生成prompt（使用分镜的图片和台词）
      const imageUrl = scene.shots[0]?.img || uploadedImages[0]?.url || '';
      const prompt = scene.lines || '生成视频';

      // doubao-seedance-1-0-lite-i2v-250428 模型参数配置
      // 根据分镜特点：3:4 宽高比，720p 分辨率，5秒时长
      const videoAspectRatio = '3:4';
      const videoResolution = '720p';
      const videoDuration = 5;
      
      // 计算视频尺寸（3:4 宽高比，720p 分辨率）
      const [width, height] = videoAspectRatio === '3:4'
        ? videoResolution === '720p' ? [720, 960] : [1080, 1440]
        : [720, 960]; // 默认值

      // 构建 content 数组（doubao-seedance 系列使用 content 格式）
      const content: Array<{
        type: 'text' | 'image_url';
        text?: string;
        image_url?: {
          url: string;
        };
        role?: 'first_frame' | 'last_frame' | 'reference_image';
      }> = [
        {
          type: 'text',
          text: prompt,
        },
      ];

      // 添加图片（首帧模式）
      if (imageUrl) {
        content.push({
          type: 'image_url',
          image_url: {
            url: imageUrl,
          },
          role: 'first_frame', // 使用首帧模式
        });
      }

      // 提交视频生成任务
      const submitResponse = await videoGenerateService.submitVideoTask({
        model: 'doubao-seedance-1-0-lite-i2v-250428',
        prompt,
        width,
        height,
        seconds: videoDuration,
        resolution: videoResolution,
        aspectRatio: videoAspectRatio,
        duration: videoDuration,
        watermark: false, // 默认不加水印
        content,
      });

      // request.ts 在成功时会返回 resData.data，所以 submitResponse 已经是 data 对象
      // 根据实际响应结构，task_id 可能在 submitResponse.task_id 或 submitResponse.output.task_id
      const taskId = (submitResponse as any)?.task_id || (submitResponse as any)?.output?.task_id;
        
      if (!taskId) {
        throw new Error('提交视频生成任务失败：未返回 task_id');
      }

      setStoryboardVideos((prev) => ({
        ...prev,
        [sceneId]: { taskId, status: 'processing', progress: 0 },
      }));

      // 开始轮询任务状态
      pollVideoTask(sceneId, taskId);
    } catch (error: any) {
      console.error('生成视频失败:', error);
      setStoryboardVideos((prev) => ({
        ...prev,
        [sceneId]: { status: 'failed' },
      }));
      setGeneratingScenes((prev) => prev.filter(id => id !== sceneId));
      toast.error(error.message || '生成视频失败，请重试');
    }
  }, [uploadedImages]);

  // 轮询视频生成任务状态
  const pollVideoTask = useCallback((sceneId: number, taskId: string) => {
    // 清除之前的轮询
    if (videoPollingIntervals.current[sceneId]) {
      clearInterval(videoPollingIntervals.current[sceneId]);
    }

    let pollCount = 0;
    const maxPolls = 120; // 最多轮询120次（约10分钟）
    const pollInterval = 5000; // 5秒轮询一次

    const poll = async () => {
      try {
        const response = await videoGenerateService.queryVideoTask(taskId);
        
        // request.ts 在成功时会返回 resData.data，所以 response 已经是 data 对象
        // 如果请求失败，request.ts 会抛出 ApiError，不会到达这里
        // 使用 video_url 或 url（不同模型可能使用不同的字段名）
        const { status, video_url, url, error, progress } = response as any;
        const finalVideoUrl = video_url || url;
        
        console.log('📊 分镜视频任务状态:', status, '完整结果:', response);

        // 更新状态和进度
        setStoryboardVideos((prev) => ({
          ...prev,
          [sceneId]: {
            ...prev[sceneId],
            status: status as VideoStatus,
            progress: progress || 0,
          },
        }));

        switch (status) {
          case 'queued':
          case 'submitted': {
            console.log('📋 任务排队中...');
            pollCount++;
            if (pollCount >= maxPolls) {
              clearInterval(videoPollingIntervals.current[sceneId]);
              delete videoPollingIntervals.current[sceneId];
              setStoryboardVideos((prev) => ({
                ...prev,
                [sceneId]: { status: 'failed' },
              }));
              setGeneratingScenes((prev) => prev.filter(id => id !== sceneId));
              toast.error(`分镜 ${sceneId} 视频生成超时`);
            }
            break;
          }

          case 'in_progress':
          case 'processing': {
            console.log('⚙️ 任务执行中...');
            pollCount++;
            if (pollCount >= maxPolls) {
              clearInterval(videoPollingIntervals.current[sceneId]);
              delete videoPollingIntervals.current[sceneId];
              setStoryboardVideos((prev) => ({
                ...prev,
                [sceneId]: { status: 'failed' },
              }));
              setGeneratingScenes((prev) => prev.filter(id => id !== sceneId));
              toast.error(`分镜 ${sceneId} 视频生成超时`);
            }
            break;
          }

          case 'succeeded': {
            console.log('✅ 视频生成成功:', response);
            setStoryboardVideos((prev) => ({
              ...prev,
              [sceneId]: {
                url: finalVideoUrl || '',
                status: 'succeeded',
                progress: 100,
              },
            }));
            setGeneratingScenes((prev) => prev.filter(id => id !== sceneId));
            clearInterval(videoPollingIntervals.current[sceneId]);
            delete videoPollingIntervals.current[sceneId];
            toast.success(`分镜 ${sceneId} 视频生成完成`);
            return; // 停止轮询
          }

          case 'failed': {
            console.error('❌ 视频生成失败:', response);
            // 提取错误消息
            const errorMsg = typeof error === 'string' 
              ? error 
              : error?.message || (response as any).metadata?.reason || '视频生成失败';
            
            setStoryboardVideos((prev) => ({
              ...prev,
              [sceneId]: { status: 'failed' },
            }));
            setGeneratingScenes((prev) => prev.filter(id => id !== sceneId));
            clearInterval(videoPollingIntervals.current[sceneId]);
            delete videoPollingIntervals.current[sceneId];
            toast.error(`分镜 ${sceneId} 视频生成失败: ${errorMsg}`);
            return; // 停止轮询
          }

          default: {
            // 未知状态，继续轮询
            console.log(`⚠️ 未知状态: ${status}，继续轮询...`);
            pollCount++;
            if (pollCount >= maxPolls) {
              clearInterval(videoPollingIntervals.current[sceneId]);
              delete videoPollingIntervals.current[sceneId];
              setStoryboardVideos((prev) => ({
                ...prev,
                [sceneId]: { status: 'failed' },
              }));
              setGeneratingScenes((prev) => prev.filter(id => id !== sceneId));
              toast.error(`分镜 ${sceneId} 视频生成超时`);
            }
            break;
          }
        }
      } catch (error: any) {
        console.error('轮询任务状态失败:', error);
        clearInterval(videoPollingIntervals.current[sceneId]);
        delete videoPollingIntervals.current[sceneId];
        setStoryboardVideos((prev) => ({
          ...prev,
          [sceneId]: { status: 'failed' },
        }));
        setGeneratingScenes((prev) => prev.filter(id => id !== sceneId));
        toast.error('查询任务状态失败');
      }
    };

    // 立即执行一次
    poll();
    
    // 设置定时轮询
    videoPollingIntervals.current[sceneId] = setInterval(poll, pollInterval);
  }, []);

  // 批量生成所有分镜视频
  const generateAllSceneVideos = useCallback(async (
    storyboard: Storyboard | null,
    editedStoryboard: Storyboard | null
  ) => {
    const currentStoryboard = editedStoryboard || storyboard;
    if (!currentStoryboard || !currentStoryboard.scenes) {
      toast.error('分镜数据不存在');
      return;
    }

    const scenesToGenerate = currentStoryboard.scenes.filter((scene: StoryboardScene) => {
      const video = storyboardVideos[scene.id];
      return !video || video.status !== 'succeeded';
    });

    if (scenesToGenerate.length === 0) {
      toast.info('所有分镜视频已生成');
      return;
    }

    toast.info(`开始批量生成 ${scenesToGenerate.length} 个分镜视频`);
    
    // 依次生成（避免并发过多）
    for (const scene of scenesToGenerate) {
      await generateSceneVideo(scene.id, storyboard, editedStoryboard);
      // 每个视频之间间隔1秒
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }, [storyboardVideos, generateSceneVideo]);

  // 清理轮询定时器
  useEffect(() => {
    return () => {
      Object.values(videoPollingIntervals.current).forEach((interval: NodeJS.Timeout) => {
        clearInterval(interval);
      });
    };
  }, []);

  return {
    storyboardVideos,
    setStoryboardVideos, // 添加设置函数，用于外部恢复状态
    generatingScenes,
    generateSceneVideo,
    generateAllSceneVideos,
  };
};

