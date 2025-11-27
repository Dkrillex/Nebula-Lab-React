import { useState, useRef, useCallback, useEffect } from 'react';
import { videoGenerateService } from '../../../../../services/videoGenerateService';
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
      const prompt = `${scene.lines} --ratio 3:4 --dur 5`;

      // 提交视频生成任务
      const submitResponse = await videoGenerateService.submitVideoTask({
        model: 'doubao-seedance-1-0-pro-250528',
        prompt,
        content: [
          {
            type: 'text',
            text: prompt,
          },
          ...(imageUrl ? [{
            type: 'image_url' as const,
            image_url: {
              url: imageUrl,
            },
            role: 'reference_image' as const,
          }] : []),
        ],
      });

      if (submitResponse.code !== 200 || !submitResponse.data?.task_id) {
        throw new Error(submitResponse.msg || '提交视频生成任务失败');
      }

      const taskId = submitResponse.data.task_id;
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
        
        if (response.code !== 200 || !response.data) {
          throw new Error(response.msg || '查询任务状态失败');
        }

        const { status, video_url, progress, error } = response.data;

        setStoryboardVideos((prev) => ({
          ...prev,
          [sceneId]: {
            ...prev[sceneId],
            status: status as VideoStatus,
            progress: progress || 0,
          },
        }));

        if (status === 'succeeded' && video_url) {
          setStoryboardVideos((prev) => ({
            ...prev,
            [sceneId]: {
              url: video_url,
              status: 'succeeded',
              progress: 100,
            },
          }));
          setGeneratingScenes((prev) => prev.filter(id => id !== sceneId));
          clearInterval(videoPollingIntervals.current[sceneId]);
          delete videoPollingIntervals.current[sceneId];
          toast.success(`分镜 ${sceneId} 视频生成完成`);
        } else if (status === 'failed') {
          setStoryboardVideos((prev) => ({
            ...prev,
            [sceneId]: { status: 'failed' },
          }));
          setGeneratingScenes((prev) => prev.filter(id => id !== sceneId));
          clearInterval(videoPollingIntervals.current[sceneId]);
          delete videoPollingIntervals.current[sceneId];
          toast.error(`分镜 ${sceneId} 视频生成失败: ${error || '未知错误'}`);
        } else {
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
    generatingScenes,
    generateSceneVideo,
    generateAllSceneVideos,
  };
};

