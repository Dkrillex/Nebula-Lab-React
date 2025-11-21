import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Play, Pause, Trash2, Eye } from 'lucide-react';

interface VideoEditingModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  onSave?: (markers: VideoMarker[]) => void;
}

export interface VideoMarker {
  id: string;
  time: number; // 时间点（秒）
  type: 'modify' | 'protect'; // 修改区域或保护区域
  x: number; // 视频上的x坐标
  y: number; // 视频上的y坐标
  radius: number; // 标记点半径
}

const POINT_RADIUS = 6;

const VideoEditingModal: React.FC<VideoEditingModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  onSave,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const markCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const timelineTrackRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [markers, setMarkers] = useState<VideoMarker[]>([]);
  const [markingMode, setMarkingMode] = useState<'modify' | 'protect'>('modify');
  const [selectedMarkId, setSelectedMarkId] = useState<string | null>(null);
  const [hoveredMarkId, setHoveredMarkId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [videoThumbnail, setVideoThumbnail] = useState<string>('');

  // 初始化视频
  const initVideo = useCallback(async () => {
    if (!videoRef.current || !videoUrl) return;
    
    try {
      const video = videoRef.current;
      video.crossOrigin = 'anonymous';
      video.load();
      
      // 等待视频元数据加载
      await new Promise((resolve) => {
        if (video.readyState >= 2) {
          resolve(void 0);
        } else {
          video.addEventListener('loadedmetadata', resolve, { once: true });
        }
      });
      
      // 生成第一帧缩略图
      const canvas = document.createElement('canvas');
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      const targetWidth = 160;
      const targetHeight = 90;
      
      let canvasWidth = targetWidth;
      let canvasHeight = targetHeight;
      
      if (videoWidth && videoHeight) {
        const videoAspect = videoWidth / videoHeight;
        const targetAspect = targetWidth / targetHeight;
        
        if (videoAspect > targetAspect) {
          canvasHeight = targetHeight;
          canvasWidth = targetHeight * videoAspect;
        } else {
          canvasWidth = targetWidth;
          canvasHeight = targetWidth / videoAspect;
        }
      }
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        video.currentTime = 0;
        await new Promise((resolve) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            resolve(void 0);
          };
          video.addEventListener('seeked', onSeeked, { once: true });
          setTimeout(() => {
            if (video.readyState >= 2) {
              video.removeEventListener('seeked', onSeeked);
              resolve(void 0);
            }
          }, 100);
        });
        
        ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);
        setVideoThumbnail(canvas.toDataURL('image/jpeg', 0.9));
      }
    } catch (error) {
      console.error('初始化视频失败:', error);
    }
  }, [videoUrl]);

  // 初始化画布
  const initCanvas = useCallback(() => {
    if (!markCanvasRef.current || !videoRef.current || !videoContainerRef.current) return;
    
    const canvas = markCanvasRef.current;
    const video = videoRef.current;
    const videoRect = video.getBoundingClientRect();
    
    canvas.width = videoRect.width;
    canvas.height = videoRect.height;
  }, []);

  // 视频加载完成
  const handleVideoLoaded = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      initCanvas();
    }
  }, [initCanvas]);

  // 时间更新
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && !isDragging) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, [isDragging]);

  // 切换播放/暂停
  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // 视频点击（用于播放/暂停）
  const handleVideoClick = useCallback(() => {
    if (!videoRef.current || markingMode) return;
    togglePlayPause();
  }, [markingMode, togglePlayPause]);

  // 获取视频显示区域
  const getVideoDisplayRect = useCallback(() => {
    if (!videoRef.current || !videoContainerRef.current) {
      return { x: 0, y: 0, width: 0, height: 0, scale: 1 };
    }
    
    const video = videoRef.current;
    const container = videoContainerRef.current;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    if (!videoWidth || !videoHeight) {
      const containerRect = container.getBoundingClientRect();
      return { x: 0, y: 0, width: containerRect.width, height: containerRect.height, scale: 1 };
    }
    
    const videoRect = video.getBoundingClientRect();
    const containerWidth = videoRect.width;
    const containerHeight = videoRect.height;
    
    const scaleX = containerWidth / videoWidth;
    const scaleY = containerHeight / videoHeight;
    const scale = Math.min(scaleX, scaleY);
    
    const displayWidth = videoWidth * scale;
    const displayHeight = videoHeight * scale;
    const x = (containerWidth - displayWidth) / 2;
    const y = (containerHeight - displayHeight) / 2;
    
    return { x, y, width: displayWidth, height: displayHeight, scale };
  }, []);

  // 画布点击添加标记
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!markCanvasRef.current || !videoRef.current) return;
    
    const canvas = markCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 检查是否点击在已有标记上
    const clickedMark = markers.find((mark) => {
      const distance = Math.hypot(x - mark.x, y - mark.y);
      return distance <= mark.radius + 4;
    });
    
    if (clickedMark) {
      // 如果点击在标记上，删除它
      setMarkers(markers.filter(m => m.id !== clickedMark.id));
      if (selectedMarkId === clickedMark.id) {
        setSelectedMarkId(null);
      }
    } else {
      // 添加新标记
      const newMarker: VideoMarker = {
        id: `marker-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        time: currentTime,
        type: markingMode,
        x,
        y,
        radius: POINT_RADIUS,
      };
      setMarkers([...markers, newMarker]);
      setSelectedMarkId(newMarker.id);
    }
  }, [markers, markingMode, currentTime, selectedMarkId]);

  // 清除所有标记
  const clearAllMarks = useCallback(() => {
    setMarkers([]);
    setSelectedMarkId(null);
  }, []);

  // 预览所有已选区域
  const previewAllMarks = useCallback(() => {
    console.log('预览所有标记:', markers);
    // TODO: 实现预览功能
  }, [markers]);

  // 时间轴点击
  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineTrackRef.current || !videoRef.current || duration === 0) return;
    
    const rect = timelineTrackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const thumbnailWidth = 80;
    
    if (clickX < thumbnailWidth) return;
    
    const timelineWidth = rect.width - thumbnailWidth;
    const relativeX = clickX - thumbnailWidth;
    const percentage = Math.max(0, Math.min(1, relativeX / timelineWidth));
    
    if (videoRef.current) {
      videoRef.current.currentTime = percentage * duration;
      setCurrentTime(videoRef.current.currentTime);
    }
  }, [duration]);

  // 开始拖拽时间轴
  const startDragging = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!timelineTrackRef.current || !videoRef.current || duration === 0) return;
    
    setIsDragging(true);
    const video = videoRef.current;
    const wasPlaying = !video.paused;
    if (wasPlaying) {
      video.pause();
      setIsPlaying(false);
    }
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!timelineTrackRef.current || !videoRef.current) return;
      
      const rect = timelineTrackRef.current.getBoundingClientRect();
      const moveX = moveEvent.clientX - rect.left;
      const thumbnailWidth = 80;
      
      if (moveX < thumbnailWidth) {
        video.currentTime = 0;
        setCurrentTime(0);
        return;
      }
      
      const timelineWidth = rect.width - thumbnailWidth;
      const relativeX = moveX - thumbnailWidth;
      const percentage = Math.max(0, Math.min(1, relativeX / timelineWidth));
      
      const newTime = percentage * duration;
      video.currentTime = newTime;
      setCurrentTime(newTime);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    
    handleMouseMove(e.nativeEvent);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [duration]);

  // 计算当前帧的标记
  const currentFrameMarks = markers.filter(mark => {
    const markFrameIndex = Math.floor(mark.time * 30); // 假设30fps
    const currentFrameIndex = Math.floor(currentTime * 30);
    return markFrameIndex === currentFrameIndex;
  });

  // 计算时间轴标记位置
  const timelineMarkers = markers.reduce((acc, mark) => {
    const time = mark.time;
    const key = Math.floor(time * 100) / 100; // 保留两位小数
    
    if (!acc[key]) {
      acc[key] = {
        time: key,
        hasModify: false,
        hasProtect: false,
        positionPercent: duration ? (key / duration) * 100 : 0,
      };
    }
    
    if (mark.type === 'modify') {
      acc[key].hasModify = true;
    } else {
      acc[key].hasProtect = true;
    }
    
    return acc;
  }, {} as Record<number, { time: number; hasModify: boolean; hasProtect: boolean; positionPercent: number }>);

  const timelineMarkersArray = Object.values(timelineMarkers);

  // 进度百分比
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
  const thumbnailWidth = 80;
  const indicatorPosition = timelineTrackRef.current
    ? thumbnailWidth + ((progressPercentage / 100) * (timelineTrackRef.current.clientWidth - thumbnailWidth))
    : thumbnailWidth;

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 确认保存
  const handleConfirm = useCallback(() => {
    if (onSave) {
      onSave(markers);
    }
    onClose();
  }, [markers, onSave, onClose]);

  // 清理状态
  const cleanup = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setMarkers([]);
    setMarkingMode('modify');
    setSelectedMarkId(null);
    setIsDragging(false);
  }, []);

  // 取消
  const handleCancel = useCallback(() => {
    cleanup();
    onClose();
  }, [cleanup, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => handleTimeUpdate();
    const updateDuration = () => handleVideoLoaded();
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    initVideo();
    initCanvas();

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [isOpen, initVideo, initCanvas, handleTimeUpdate, handleVideoLoaded]);

  // 窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      initCanvas();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="relative bg-[#1a1a1a] rounded-lg shadow-2xl max-w-[90vw] w-full max-w-[1200px] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#2a2a2a] border-b border-[#3a3a3a] px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-2 bg-transparent border-none text-white cursor-pointer rounded transition-colors hover:bg-[#3a3a3a]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            <span>返回</span>
          </button>
          <h2 className="flex-1 text-center text-base font-medium text-white m-0">
            点击视频标记需修改区域与需保护区域
          </h2>
          <div className="w-[100px]"></div> {/* 占位，保持居中 */}
        </div>

        {/* Video Preview */}
        <div className="flex-1 flex items-center justify-center p-6 bg-[#0a0a0a] overflow-hidden relative">
          <div
            ref={videoContainerRef}
            className="relative w-full h-full max-w-[400px] max-h-[600px] flex items-center justify-center"
          >
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain rounded-lg cursor-pointer"
              controls={false}
              onClick={handleVideoClick}
              playsInline
              crossOrigin="anonymous"
            />
            
            {/* 标记点层 */}
            <div className="absolute inset-0 pointer-events-none z-[3]">
              {currentFrameMarks.map((mark) => (
                <div
                  key={mark.id}
                  className={`absolute rounded-full flex items-center justify-center border-2 transition-all ${
                    mark.type === 'modify'
                      ? 'bg-[rgba(255,77,79,0.25)] border-[rgba(255,77,79,0.8)]'
                      : 'bg-[rgba(82,196,26,0.25)] border-[rgba(82,196,26,0.8)]'
                  } ${selectedMarkId === mark.id ? 'scale-110' : ''} ${hoveredMarkId === mark.id ? 'scale-105' : ''}`}
                  style={{
                    width: `${mark.radius * 2}px`,
                    height: `${mark.radius * 2}px`,
                    left: `${mark.x - mark.radius}px`,
                    top: `${mark.y - mark.radius}px`,
                    pointerEvents: 'auto',
                    cursor: 'default',
                  }}
                  onMouseEnter={() => setHoveredMarkId(mark.id)}
                  onMouseLeave={() => setHoveredMarkId(null)}
                >
                  <span className="w-[40%] h-[40%] rounded-full border-2 border-[rgba(245,243,243,0.9)] bg-transparent"></span>
                </div>
              ))}
            </div>
            
            {/* 标记画布 */}
            <canvas
              ref={markCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-auto z-[2] cursor-default"
              onClick={handleCanvasClick}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="px-6 py-4 bg-[#2a2a2a] border-t border-[#3a3a3a] border-b border-[#3a3a3a]">
          <div className="relative w-full">
            <div
              ref={timelineTrackRef}
              className="relative w-full h-[60px] bg-[#1a1a1a] rounded cursor-pointer overflow-hidden"
              onClick={handleTimelineClick}
            >
              {/* 缩略图和播放按钮 */}
              <div
                className="absolute top-0 left-0 w-20 h-full bg-cover bg-center bg-no-repeat opacity-90 rounded-l cursor-pointer flex items-center justify-center transition-opacity hover:opacity-100 overflow-hidden"
                style={{
                  backgroundImage: videoThumbnail ? `url(${videoThumbnail})` : 'linear-gradient(135deg, #2c2c2c 0%, #111 100%)',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
              >
                <button
                  className={`relative w-10 h-10 flex items-center justify-center bg-[rgba(255,255,255,0.95)] border-2 border-[rgba(255,255,255,0.8)] rounded-full text-[#1a1a1a] cursor-pointer transition-all shadow-[0_2px_8px_rgba(0,0,0,0.4)] z-[1] hover:bg-white hover:scale-110 hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] active:scale-95 ${
                    isPlaying ? 'playing' : ''
                  }`}
                >
                  {isPlaying ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ marginLeft: '2px' }}
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* 进度条 */}
              <div
                className="absolute top-0 left-20 h-full bg-[rgba(255,255,255,0.1)] pointer-events-none"
                style={{ width: `${progressPercentage * ((timelineTrackRef.current?.clientWidth || 0) - thumbnailWidth) / (timelineTrackRef.current?.clientWidth || 1)}px` }}
              />
              
              {/* 标记点层 */}
              <div className="absolute top-0 bottom-0 left-20 right-0 pointer-events-none">
                {timelineMarkersArray.map((marker, index) => (
                  <div
                    key={index}
                    className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 flex items-center justify-center transition-all ${
                      marker.hasModify && !marker.hasProtect
                        ? 'modify'
                        : marker.hasProtect && !marker.hasModify
                        ? 'protect'
                        : 'both'
                    }`}
                    style={{ left: `${marker.positionPercent}%` }}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shadow-[0_0_6px_rgba(0,0,0,0.4)] opacity-90 ${
                        marker.hasModify && !marker.hasProtect
                          ? 'bg-[#ff7875]'
                          : marker.hasProtect && !marker.hasModify
                          ? 'bg-[#52c41a]'
                          : 'bg-gradient-to-br from-[#ff7875] to-[#52c41a]'
                      }`}
                    ></span>
                  </div>
                ))}
              </div>
              
              {/* 当前时间指示器 */}
              <div
                className={`absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none transition-transform ${
                  isDragging ? 'pointer-events-auto' : ''
                }`}
                style={{ left: `${indicatorPosition}px`, transform: 'translateX(-50%)' }}
              >
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_4px_rgba(0,0,0,0.5)] cursor-grab transition-all hover:scale-110 hover:shadow-[0_0_6px_rgba(255,255,255,0.8)] active:cursor-grabbing active:scale-125 z-10"
                  onMouseDown={startDragging}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 px-6 py-4 bg-[#2a2a2a] border-b border-[#3a3a3a] flex-wrap">
          <button
            className={`flex items-center gap-2 px-5 py-2.5 bg-[#3a3a3a] border border-[#4a4a4a] text-white cursor-pointer rounded-md text-sm transition-all hover:bg-[#4a4a4a] hover:border-[#5a5a5a] ${
              markingMode === 'modify' ? '!bg-[#ff4d4f] !border-[#ff4d4f]' : ''
            }`}
            onClick={() => setMarkingMode('modify')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            <span>标记修改区域</span>
          </button>
          <button
            className={`flex items-center gap-2 px-5 py-2.5 bg-[#3a3a3a] border border-[#4a4a4a] text-white cursor-pointer rounded-md text-sm transition-all hover:bg-[#4a4a4a] hover:border-[#5a5a5a] ${
              markingMode === 'protect' ? '!bg-[#52c41a] !border-[#52c41a]' : ''
            }`}
            onClick={() => setMarkingMode('protect')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>标记保护区域</span>
          </button>
          <button
            className="flex items-center gap-2 px-5 py-2.5 bg-[#3a3a3a] border border-[#4a4a4a] text-white cursor-pointer rounded-md text-sm transition-all hover:bg-[#4a4a4a] hover:border-[#5a5a5a]"
            onClick={clearAllMarks}
          >
            <Trash2 size={18} />
            <span>清除</span>
          </button>
          <button
            className="flex items-center gap-2 px-5 py-2.5 bg-[#3a3a3a] border border-[#4a4a4a] text-white cursor-pointer rounded-md text-sm transition-all hover:bg-[#4a4a4a] hover:border-[#5a5a5a] h-[42px]"
            onClick={previewAllMarks}
            disabled={markers.length === 0}
          >
            <Eye size={18} />
            <span>预览所有已选区域</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-center items-center px-6 py-4 bg-[#2a2a2a] border-t border-[#3a3a3a]">
          <button
            className="mx-4 px-8 py-0 bg-[#3a3a3a] text-white border-none rounded-md text-sm font-medium cursor-pointer transition-all hover:bg-[#4a4a4a]"
            onClick={handleCancel}
          >
            取消
          </button>
          <button
            className="mx-4 px-8 py-0 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white border-none rounded-md text-sm font-medium cursor-pointer transition-all hover:from-[#5a67d8] hover:to-[#6b46c1] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(102,126,234,0.4)]"
            onClick={handleConfirm}
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoEditingModal;
