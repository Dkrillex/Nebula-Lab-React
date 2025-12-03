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
  const videoPollingIntervals = useRef<Record<number, NodeJS.Timeout>>({});
  const audioBlobUrls = useRef<Record<number, string>>({}); // 存储生成的音频blob URL，用于清理

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
    }
  }, [uploadedImages, generateAudioFromText]);

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

  // 清理轮询定时器和音频blob URL
  useEffect(() => {
    return () => {
      // 清理轮询定时器
      Object.values(videoPollingIntervals.current).forEach((interval: NodeJS.Timeout) => {
        clearInterval(interval);
      });
      // 清理音频blob URL
      Object.values(audioBlobUrls.current).forEach((url) => {
        if (url.startsWith('blob:')) {
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
  };
};

