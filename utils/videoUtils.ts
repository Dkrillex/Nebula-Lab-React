/**
 * 视频处理工具函数
 */

/**
 * 合并多个视频片段
 * @param videoUrls 视频URL数组
 * @returns 合并后的视频Blob URL
 */
export async function mergeVideos(videoUrls: string[]): Promise<string> {
  if (videoUrls.length === 0) {
    throw new Error('没有视频片段可合并');
  }

  if (videoUrls.length === 1) {
    return videoUrls[0];
  }

  try {
    // 加载所有视频
    const videos = await Promise.all(
      videoUrls.map((url) => {
        return new Promise<HTMLVideoElement>((resolve, reject) => {
          const video = document.createElement('video');
          video.crossOrigin = 'anonymous';
          video.src = url;
          video.preload = 'metadata';
          
          video.onloadedmetadata = () => {
            resolve(video);
          };
          
          video.onerror = (error) => {
            reject(new Error(`加载视频失败: ${url}`));
          };
        });
      })
    );

    // 获取第一个视频的尺寸作为输出尺寸
    const firstVideo = videos[0];
    const width = firstVideo.videoWidth || 720;
    const height = firstVideo.videoHeight || 1280;

    // 创建Canvas用于绘制视频帧
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('无法创建Canvas上下文');
    }

    // 创建MediaRecorder用于录制合并后的视频
    const stream = canvas.captureStream(30); // 30fps
    
    // 检查MediaRecorder支持，选择最佳编码格式
    const mimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
    ];
    
    const supportedMimeType = mimeTypes.find(mimeType => 
      MediaRecorder.isTypeSupported(mimeType)
    );
    
    if (!supportedMimeType) {
      throw new Error('浏览器不支持视频录制功能，请使用Chrome或Firefox浏览器');
    }

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: supportedMimeType,
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    return new Promise<string>((resolve, reject) => {
      let timeout: NodeJS.Timeout | null = null;
      let animationFrameId: number | null = null;

      // 设置超时保护（最多10分钟）
      timeout = setTimeout(() => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        mediaRecorder.stop();
        reject(new Error('视频合并超时，请重试'));
      }, 10 * 60 * 1000);

      mediaRecorder.onstop = () => {
        if (timeout) {
          clearTimeout(timeout);
        }
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        const blob = new Blob(chunks, { type: supportedMimeType });
        const url = URL.createObjectURL(blob);
        resolve(url);
      };

      mediaRecorder.onerror = (error) => {
        if (timeout) {
          clearTimeout(timeout);
        }
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        reject(new Error('视频录制失败'));
      };

      mediaRecorder.start();

      // 按顺序播放并录制每个视频
      let currentIndex = 0;

      const playNextVideo = () => {
        if (currentIndex >= videos.length) {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
          mediaRecorder.stop();
          return;
        }

        const video = videos[currentIndex];
        video.currentTime = 0;

        const drawFrame = () => {
          // 检查视频是否已结束
          if (video.ended) {
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
              animationFrameId = null;
            }
            currentIndex++;
            playNextVideo();
            return;
          }

          // 检查视频是否出错
          if (video.error) {
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
            }
            reject(new Error(`视频播放出错: ${video.error.message || '未知错误'}`));
            return;
          }

          // 绘制当前帧
          try {
            ctx.drawImage(video, 0, 0, width, height);
            animationFrameId = requestAnimationFrame(drawFrame);
          } catch (error: any) {
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
            }
            reject(new Error(`绘制视频帧失败: ${error.message}`));
          }
        };

        // 监听视频结束事件
        const onVideoEnded = () => {
          video.removeEventListener('ended', onVideoEnded);
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
          currentIndex++;
          playNextVideo();
        };

        video.addEventListener('ended', onVideoEnded);

        // 开始播放
        video.play().then(() => {
          drawFrame();
        }).catch((error) => {
          video.removeEventListener('ended', onVideoEnded);
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
          reject(new Error(`播放视频失败: ${error.message}`));
        });
      };

      playNextVideo();
    });
  } catch (error: any) {
    console.error('视频合并失败:', error);
    throw new Error(error.message || '视频合并失败');
  }
}

/**
 * 下载视频
 * @param videoUrl 视频URL（Blob URL或普通URL）
 * @param filename 文件名
 */
export async function downloadVideo(videoUrl: string, filename: string = 'video.mp4'): Promise<void> {
  try {
    // 如果是Blob URL，直接下载
    if (videoUrl.startsWith('blob:')) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // 如果是普通URL，先获取Blob
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error('下载视频失败');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 清理Blob URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error: any) {
    console.error('下载视频失败:', error);
    throw new Error(error.message || '下载视频失败');
  }
}

/**
 * 格式化时长显示
 * @param seconds 秒数
 * @returns 格式化后的字符串（如：00:36）
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * 获取视频时长
 * @param videoUrl 视频URL
 * @returns 视频时长（秒）
 */
export function getVideoDuration(videoUrl: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      resolve(video.duration);
    };

    video.onerror = (error) => {
      reject(new Error('获取视频时长失败'));
    };
  });
}


