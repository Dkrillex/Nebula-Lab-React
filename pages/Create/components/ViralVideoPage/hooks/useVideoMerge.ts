import { useState, useCallback } from 'react';
import { mergeVideos } from '../../../../../utils/videoUtils';
import toast from 'react-hot-toast';
import { Storyboard } from '../types';
import { StoryboardVideo } from '../types';

interface UseVideoMergeOptions {
  onMergeComplete?: (videoUrl: string, videoId: string) => void;
}

export const useVideoMerge = (options: UseVideoMergeOptions = {}) => {
  const { onMergeComplete } = options;
  const [isMerging, setIsMerging] = useState(false);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string>('');
  const [videoId, setVideoId] = useState<string>('');

  const mergeAllVideos = useCallback(async (
    storyboard: Storyboard | null,
    editedStoryboard: Storyboard | null,
    storyboardVideos: Record<number, StoryboardVideo>
  ) => {
    const currentStoryboard = editedStoryboard || storyboard;
    if (!currentStoryboard || !currentStoryboard.scenes) {
      toast.error('分镜数据不存在');
      return;
    }

    // 检查所有分镜视频是否都已生成
    const allVideosReady = currentStoryboard.scenes.every((scene) => {
      const video = storyboardVideos[scene.id];
      return video && video.status === 'succeeded' && video.url;
    });

    if (!allVideosReady) {
      toast.error('请先完成所有分镜视频的生成');
      return;
    }

    setIsMerging(true);
    try {
      // 按顺序获取所有视频URL
      const videoUrls = currentStoryboard.scenes
        .map((scene) => storyboardVideos[scene.id]?.url)
        .filter(Boolean) as string[];

      if (videoUrls.length === 0) {
        throw new Error('没有可合并的视频');
      }

      toast.info('开始合并视频，请稍候...');
      
      // 合并视频
      const mergedVideoUrl = await mergeVideos(videoUrls);
      setFinalVideoUrl(mergedVideoUrl);
      
      // 生成视频ID
      const newVideoId = `VID${Date.now()}`;
      setVideoId(newVideoId);
      
      toast.success('视频合并完成');
      
      // 调用回调函数
      if (onMergeComplete) {
        onMergeComplete(mergedVideoUrl, newVideoId);
      }
    } catch (error: any) {
      console.error('视频合并失败:', error);
      toast.error(error.message || '视频合并失败，请重试');
      throw error;
    } finally {
      setIsMerging(false);
    }
  }, [onMergeComplete]);

  return {
    isMerging,
    finalVideoUrl,
    videoId,
    setFinalVideoUrl,
    setVideoId,
    mergeAllVideos,
  };
};

