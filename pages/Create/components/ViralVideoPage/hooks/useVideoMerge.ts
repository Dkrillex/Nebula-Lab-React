import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Storyboard } from '../types';
import { StoryboardVideo } from '../types';
import { mergeVideosWithServer, VideoMergeSegment } from '@/services/videoMergeService';

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
    console.log(storyboard, editedStoryboard, storyboardVideos);

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
      // 按顺序构建 segments 数组，包含视频URL和文案
      const segments: VideoMergeSegment[] = currentStoryboard.scenes
        .map((scene) => {
          const video = storyboardVideos[scene.id];
          if (!video || !video.url) {
            return null;
          }

          const segment: VideoMergeSegment = {
            video: video.url,
            text: scene.lines || '', // 使用场景的文案
            duration: 5, // 默认5秒，可以根据实际视频时长调整
          };
          return segment;
        })
        .filter((segment): segment is VideoMergeSegment => segment !== null);

      if (segments.length === 0) {
        throw new Error('没有可合并的视频');
      }

      // ========== 详细调试日志 ==========
      console.log('========== 视频合并调试信息 ==========');
      console.log('📋 Segments 详细信息:', JSON.stringify(segments, null, 2));
      console.log('📹 视频URL列表:', segments.map((s) => s.video));
      console.log('📝 文案列表:', segments.map((s) => s.text));
      console.log('⏱️ 时长列表:', segments.map((s) => s.duration));

      // 请求参数
      const requestSettings = {
        resolution: '1080p',
        format: 'mp4',
        fps: 30,
        quality: 'high',
      };
      const segmentDuration = 5;

      console.log('⚙️ 请求参数 Settings:', JSON.stringify(requestSettings, null, 2));
      console.log('⏱️ Segment Duration:', segmentDuration);
      console.log('📊 Segments 数量:', segments.length);
      console.log('=====================================');

      // 显示开始合并提示
      toast.loading('开始合并视频，请稍候...', { id: 'video-merge' });

      // 合并视频（使用服务器接口）
      console.log('🚀 开始调用 mergeVideosWithServer...');
      const mergedVideoUrl: string = await mergeVideosWithServer(
        segments,
        requestSettings,
        segmentDuration,
        (progress, message) => {
          // 进度回调（可选，用于显示进度）
          console.log(`📈 视频合并进度: ${progress}% - ${message}`);
        }
      );

      // ========== 响应数据日志 ==========
      console.log('✅ mergeVideosWithServer 调用成功');
      console.log('📦 响应数据 (mergedVideoUrl):', mergedVideoUrl);
      console.log('📦 响应数据类型:', typeof mergedVideoUrl);
      console.log('=====================================');

      setFinalVideoUrl(mergedVideoUrl);

      // 生成视频ID
      const newVideoId = `VID${Date.now()}`;
      setVideoId(newVideoId);

      // 关闭加载提示并显示成功消息
      toast.dismiss('video-merge');
      toast.success('视频合并完成');

      // 调用回调函数
      if (onMergeComplete) {
        onMergeComplete(mergedVideoUrl, newVideoId);
      }
    } catch (error: any) {
      console.error('视频合并失败:', error);

      // 关闭加载提示
      toast.dismiss('video-merge');

      // 根据错误类型显示不同的错误消息
      let errorMessage = '视频合并失败，请重试';
      if (error.message) {
        errorMessage = error.message;
        // 如果是连接错误，提供更友好的提示
        if (error.message.includes('无法连接') || error.message.includes('ECONNREFUSED')) {
          errorMessage = '无法连接到视频合并服务器，请确保服务器已启动（http://localhost:3001）';
        } else if (error.message.includes('超时')) {
          errorMessage = '视频合并超时，请稍后重试';
        }
      }

      toast.error(errorMessage);
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

