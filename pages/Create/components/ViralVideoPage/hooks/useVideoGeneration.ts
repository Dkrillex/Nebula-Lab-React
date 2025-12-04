import { useState, useRef, useCallback, useEffect } from 'react';
import { videoGenerateService } from '@/services/videoGenerateService';
import { ttsService } from '@/services/ttsService';
import toast from 'react-hot-toast';
import { StoryboardVideo, VideoStatus, Storyboard, StoryboardScene } from '../types';
import { UploadedImage } from '../types';

interface UseVideoGenerationOptions {
  uploadedImages: UploadedImage[];
}

export const useVideoGeneration = (options: UseVideoGenerationOptions) => {
  const { uploadedImages } = options;
  const [storyboardVideos, setStoryboardVideos] = useState<Record<number, StoryboardVideo>>({});
  const [generatingScenes, setGeneratingScenes] = useState<number[]>([]);

  // 同步 generatingScenes 到 ref
  useEffect(() => {
    generatingScenesRef.current = generatingScenes;
  }, [generatingScenes]);
  const videoPollingIntervals = useRef<Record<number, NodeJS.Timeout>>({});
  const audioBlobUrls = useRef<Record<number, string>>({}); // 存储生成的音频blob URL，用于清理

  // 队列管理
  const taskQueue = useRef<Array<{ sceneId: number; storyboard: Storyboard | null; editedStoryboard: Storyboard | null }>>([]);
  const isProcessingQueue = useRef<boolean>(false);
  const currentTaskRef = useRef<number | null>(null); // 当前正在处理的任务 sceneId
  const generatingScenesRef = useRef<number[]>([]); // 用于跟踪正在生成中的场景
  const processNextInQueueRef = useRef<(() => void) | null>(null); // 用于存储队列处理函数引用

  // 生成音频（TTS）
  const generateAudioFromText = useCallback(async (text: string): Promise<string | null> => {
    if (!text || !text.trim()) {
      return null;
    }

    return new Promise((resolve) => {
      const audioChunks: Uint8Array[] = [];
      let audioUrl: string | null = null;

      const controller = ttsService.generateStream(
        {
          text: text.trim(),
          voice: 'CHERRY', // 默认语音
          language_type: 'Auto',
          score: 1,
        },
        // onChunk
        (chunk: Uint8Array) => {
          audioChunks.push(chunk);
        },
        // onComplete
        (audioInfo: { audioUrl?: string; requestId?: string }) => {
          if (audioInfo.audioUrl) {
            // 使用服务器返回的URL
            audioUrl = audioInfo.audioUrl;
            resolve(audioUrl);
          } else if (audioChunks.length > 0) {
            // 拼接所有chunks并创建blob URL
            const completeAudio = new Uint8Array(
              audioChunks.reduce((acc, chunk) => acc + chunk.length, 0)
            );
            let offset = 0;
            for (const chunk of audioChunks) {
              completeAudio.set(chunk, offset);
              offset += chunk.length;
            }
            const blob = new Blob([completeAudio], { type: 'audio/wav' });
            audioUrl = URL.createObjectURL(blob);
            resolve(audioUrl);
          } else {
            resolve(null);
          }
        },
        // onError
        (error: Error) => {
          console.warn('TTS生成失败:', error);
          resolve(null); // TTS失败不影响视频生成
        }
      );
    });
  }, []);

  // 生成单个分镜视频（先定义，不依赖队列处理函数）
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
      // 构建视频生成参数
      const imageUrl = scene.shots[0]?.img || uploadedImages[0]?.url || '';
      if (!imageUrl) {
        throw new Error('缺少图片，无法生成视频');
      }

      // 1. 先调用TTS将台词转为音频
      let audioUrl: string | null = null;
      if (scene.lines && scene.lines.trim()) {
        try {
          toast.loading('正在生成音频...', { id: `tts-${sceneId}` });
          audioUrl = await generateAudioFromText(scene.lines);
          toast.dismiss(`tts-${sceneId}`);
          if (audioUrl) {
            // 如果是blob URL，保存起来以便后续清理
            if (audioUrl.startsWith('blob:')) {
              audioBlobUrls.current[sceneId] = audioUrl;
            }
            console.log('✅ 音频生成成功:', audioUrl);
          } else {
            console.warn('⚠️ 音频生成失败，将生成无音频视频');
          }
        } catch (error: any) {
          console.warn('TTS生成失败:', error);
          toast.dismiss(`tts-${sceneId}`);
          // TTS失败不影响视频生成，继续执行
        }
      }

      // 2. 使用 wan2.5-i2v-preview 模型生成视频
      const videoDuration = 5;
      const videoResolution = '720p'; // 固定使用720p

      // wan2.5-i2v-preview 模型参数配置
      const requestData: any = {
        model: 'wan2.5-i2v-preview',
        prompt: scene.lines || '生成视频',
        duration: videoDuration,
        resolution: videoResolution,
        image: imageUrl,
        smart_rewrite: false,
        generate_audio: false, // 因为我们已经传入音频
      };

      // 如果TTS成功，添加音频URL
      if (audioUrl) {
        requestData.audio_url = audioUrl;
        console.log('🎵 添加音频URL到视频生成请求:', audioUrl);
      }

      // 提交视频生成任务
      const submitResponse = await videoGenerateService.submitVideoTask(requestData);

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

      // 如果是队列任务，处理下一个任务（通过 ref 调用）
      if (currentTaskRef.current === sceneId) {
        currentTaskRef.current = null;
        isProcessingQueue.current = false;
        if (processNextInQueueRef.current) {
          processNextInQueueRef.current();
        }
      }
    }
  }, [uploadedImages, generateAudioFromText]);

  // 队列处理函数 - 处理下一个任务（在 generateSceneVideo 之后定义）
  const processNextInQueue = useCallback(() => {
    // 如果正在处理队列或队列为空，直接返回
    if (isProcessingQueue.current || taskQueue.current.length === 0) {
      return;
    }

    // 如果当前有任务正在执行（通过 currentTaskRef 判断），等待它完成
    // 注意：不检查 generatingScenesRef，因为任务在队列中时也会显示加载状态
    if (currentTaskRef.current !== null) {
      console.log(`队列中有 ${taskQueue.current.length} 个任务等待，当前任务 ${currentTaskRef.current} 正在执行`);
      return;
    }

    const task = taskQueue.current.shift();
    if (!task) {
      isProcessingQueue.current = false;
      return;
    }

    isProcessingQueue.current = true;
    const { sceneId, storyboard, editedStoryboard } = task;
    currentTaskRef.current = sceneId;

    // 开始生成视频（不等待完成，完成时会通过 pollVideoTask 的回调触发下一个任务）
    generateSceneVideo(sceneId, storyboard, editedStoryboard).catch((error) => {
      console.error('队列任务执行失败:', error);
      // 任务失败时，清除当前任务并处理下一个（通过 ref 调用，避免循环依赖）
      currentTaskRef.current = null;
      isProcessingQueue.current = false;
      // 使用 setTimeout 确保在下一个事件循环中调用，避免在 catch 中直接递归
      setTimeout(() => {
        if (processNextInQueueRef.current) {
          processNextInQueueRef.current();
        }
      }, 0);
    });
  }, [generateSceneVideo]);

  // 更新 ref，使 generateSceneVideo 可以通过 ref 调用 processNextInQueue
  useEffect(() => {
    processNextInQueueRef.current = processNextInQueue;
  }, [processNextInQueue]);

  // 将任务添加到队列
  const addToQueue = useCallback((
    sceneId: number,
    storyboard: Storyboard | null,
    editedStoryboard: Storyboard | null
  ) => {
    // 检查视频是否已经成功生成
    const video = storyboardVideos[sceneId];
    if (video && video.status === 'succeeded') {
      console.log(`场景 ${sceneId} 已成功生成，跳过`);
      return; // 已经成功生成，不需要再生成
    }

    // 检查是否已经在队列中
    if (taskQueue.current.some(task => task.sceneId === sceneId)) {
      console.log(`场景 ${sceneId} 已在队列中，跳过`);
      return; // 已经在队列中，不重复添加
    }

    // 检查是否正在生成中（如果正在生成中，不应该再添加到队列）
    if (generatingScenesRef.current.includes(sceneId) || currentTaskRef.current === sceneId) {
      console.log(`场景 ${sceneId} 正在生成中，跳过添加到队列`);
      return; // 正在生成中，不添加到队列
    }

    // 添加到队列
    taskQueue.current.push({ sceneId, storyboard, editedStoryboard });
    console.log(`场景 ${sceneId} 已添加到队列，当前队列长度: ${taskQueue.current.length}`);

    // 设置视频状态为 pending（如果还没有状态），用于显示加载状态
    setStoryboardVideos((prev) => {
      if (!prev[sceneId] || prev[sceneId].status !== 'pending') {
        return {
          ...prev,
          [sceneId]: { status: 'pending' },
        };
      }
      return prev;
    });

    // 尝试处理队列（通过 ref 调用）
    // 使用 setTimeout 确保在下一个事件循环中调用，避免在回调中直接调用
    setTimeout(() => {
      if (processNextInQueueRef.current) {
        processNextInQueueRef.current();
      }
    }, 0);
  }, [storyboardVideos]);


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
        const { status, video_url, url, error, progress, metadata } = response as any;
        const finalVideoUrl = video_url || url;

        // 如果 status 是 unknown，尝试从 metadata.output.task_status 获取真实状态
        let actualStatus = status;
        if (status === 'unknown' && metadata?.output?.task_status) {
          const taskStatus = metadata.output.task_status;
          // 将后端的状态映射到前端状态
          if (taskStatus === 'PENDING') {
            actualStatus = 'pending';
          } else if (taskStatus === 'IN_PROGRESS' || taskStatus === 'PROCESSING') {
            actualStatus = 'processing';
          } else if (taskStatus === 'SUCCEEDED' || taskStatus === 'COMPLETED') {
            actualStatus = 'succeeded';
          } else if (taskStatus === 'FAILED') {
            actualStatus = 'failed';
          } else {
            actualStatus = 'pending'; // 默认当作 pending 处理
          }
          console.log(`状态映射: ${status} (${taskStatus}) -> ${actualStatus}`);
        }

        console.log('📊 分镜视频任务状态:', actualStatus, '原始状态:', status, '完整结果:', response);

        // 更新状态和进度
        setStoryboardVideos((prev) => ({
          ...prev,
          [sceneId]: {
            ...prev[sceneId],
            status: actualStatus as VideoStatus,
            progress: progress || 0,
          },
        }));

        switch (actualStatus) {
          case 'queued':
          case 'submitted':
          case 'pending': {
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

              // 如果是队列任务，处理下一个任务（通过 ref 调用）
              if (currentTaskRef.current === sceneId) {
                currentTaskRef.current = null;
                isProcessingQueue.current = false;
                if (processNextInQueueRef.current) {
                  processNextInQueueRef.current();
                }
              }
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

              // 如果是队列任务，处理下一个任务（通过 ref 调用）
              if (currentTaskRef.current === sceneId) {
                currentTaskRef.current = null;
                isProcessingQueue.current = false;
                if (processNextInQueueRef.current) {
                  processNextInQueueRef.current();
                }
              }
            }
            break;
          }

          case 'succeeded': {
            console.log('✅ 视频生成成功:', response);
            // 先更新视频状态
            setStoryboardVideos((prev) => ({
              ...prev,
              [sceneId]: {
                url: finalVideoUrl || '',
                status: 'succeeded',
                progress: 100,
              },
            }));
            // 然后从生成中状态移除
            setGeneratingScenes((prev) => {
              const newScenes = prev.filter(id => id !== sceneId);
              console.log(`场景 ${sceneId} 生成完成，从生成列表中移除。剩余生成中:`, newScenes);
              return newScenes;
            });
            clearInterval(videoPollingIntervals.current[sceneId]);
            delete videoPollingIntervals.current[sceneId];
            toast.success(`分镜 ${sceneId} 视频生成完成`);

            // 如果是队列任务，处理下一个任务（通过 ref 调用）
            if (currentTaskRef.current === sceneId) {
              currentTaskRef.current = null;
              isProcessingQueue.current = false;
              if (processNextInQueueRef.current) {
                processNextInQueueRef.current();
              }
            }
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

            // 如果是队列任务，处理下一个任务（通过 ref 调用）
            if (currentTaskRef.current === sceneId) {
              currentTaskRef.current = null;
              isProcessingQueue.current = false;
              if (processNextInQueueRef.current) {
                processNextInQueueRef.current();
              }
            }
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

              // 如果是队列任务，处理下一个任务（通过 ref 调用）
              if (currentTaskRef.current === sceneId) {
                currentTaskRef.current = null;
                isProcessingQueue.current = false;
                if (processNextInQueueRef.current) {
                  processNextInQueueRef.current();
                }
              }
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

        // 如果是队列任务，处理下一个任务（通过 ref 调用）
        if (currentTaskRef.current === sceneId) {
          currentTaskRef.current = null;
          isProcessingQueue.current = false;
          if (processNextInQueueRef.current) {
            processNextInQueueRef.current();
          }
        }
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

    // 跳过已成功生成的分镜，只处理未生成或失败的分镜
    const scenesToGenerate = currentStoryboard.scenes.filter((scene: StoryboardScene) => {
      const video = storyboardVideos[scene.id];
      return !video || video.status !== 'succeeded';
    });

    if (scenesToGenerate.length === 0) {
      toast.success('所有分镜视频已生成');
      return;
    }

    toast(`开始批量生成 ${scenesToGenerate.length} 个分镜视频`);

    // 将所有任务加入队列
    scenesToGenerate.forEach((scene) => {
      addToQueue(scene.id, storyboard, editedStoryboard);
    });
  }, [storyboardVideos, addToQueue]);

  // 清理轮询定时器和音频blob URL
  useEffect(() => {
    return () => {
      // 清理轮询定时器
      Object.values(videoPollingIntervals.current).forEach((interval: NodeJS.Timeout) => {
        clearInterval(interval);
      });
      // 清理音频blob URL
      Object.values(audioBlobUrls.current).forEach((url) => {
        if (typeof url === 'string' && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  return {
    storyboardVideos,
    setStoryboardVideos, // 导出设置函数，用于恢复项目状态
    generatingScenes,
    generateSceneVideo,
    generateAllSceneVideos,
    addToQueue, // 导出队列添加函数，用于单个卡片按钮
  };
};

