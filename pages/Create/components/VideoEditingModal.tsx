import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Send, Shield, Trash2, Eye } from 'lucide-react';
import { videoMaskDrawingService, imageMaskDrawingService } from '../../../services/faceSwapService';

// 视频标记点类型定义
export interface VideoMarker {
  id: string;
  type: 'modify' | 'protect';
  x: number;
  y: number;
  radius: number;
  time: number; // 标记的时间点（秒）
}

// VideoEditingModal 组件属性
export interface VideoEditingModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoProcessTaskId?: string;
  onSave?: (markers: VideoMarker[]) => void;
  onVideoMaskSuccess?: (data: { taskId: string; trackingVideoPath: string }) => void;
}

// 格式化时间显示（秒转换为 MM:SS）
const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 视频编辑器模态框组件
const VideoEditingModal: React.FC<VideoEditingModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  videoProcessTaskId,
  onSave,
  onVideoMaskSuccess,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const timelineTrackRef = useRef<HTMLDivElement>(null);
  // 使用 ref 保存预览结果，以便在确认按钮中立即访问
  const previewResultRef = useRef<{ taskId: string; trackingVideoPath: string } | null>(null);
  
  // 视频状态
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [videoThumbnail, setVideoThumbnail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  // 当前视频 URL（初始为 props 的 videoUrl，预览成功后更新为 trackingVideoPath）- 借鉴 Nebula1
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>(videoUrl);
  
  // 标记模式状态
  const [markingMode, setMarkingMode] = useState<'modify' | 'protect'>('modify');
  const [previewAllLoading, setPreviewAllLoading] = useState(false);
  const [previewAllDisabled, setPreviewAllDisabled] = useState(false);
  // 保存预览成功后的结果
  const [previewResult, setPreviewResult] = useState<{ taskId: string; trackingVideoPath: string } | null>(null);
  // 全屏加载遮罩状态 - 借鉴 Nebula1
  const [drawModalSpin, setDrawModalSpin] = useState(false);
  
  // 标记点状态
  const [markers, setMarkers] = useState<VideoMarker[]>([]);
  const [selectedMarkId, setSelectedMarkId] = useState<string | null>(null);
  const [hoveredMarkId, setHoveredMarkId] = useState<string | null>(null);
  
  // 遮罩层相关状态
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isSubmittingMask, setIsSubmittingMask] = useState(false);
  const [hasPendingSubmit, setHasPendingSubmit] = useState(false);
  const [submittedMarkIds, setSubmittedMarkIds] = useState<Set<string>>(new Set());
  const [frameMaskMap, setFrameMaskMap] = useState<Map<number, { mask?: string; protectMask?: string }>>(new Map());
  const [shouldShowMask, setShouldShowMask] = useState(true);
  
  // 标记点常量
  const POINT_RADIUS = 6; // 标记点半径（像素）

  // 计算进度百分比
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // 计算时间轴指示器位置
  const indicatorPosition = React.useMemo(() => {
    if (!timelineTrackRef.current) return 80; // thumbnailWidth
    const trackWidth = timelineTrackRef.current.clientWidth;
    const availableWidth = trackWidth - 80; // thumbnailWidth
    return 80 + (progressPercentage / 100) * availableWidth;
  }, [progressPercentage]);

  // 计算进度条宽度
  const progressWidth = React.useMemo(() => {
    if (!timelineTrackRef.current) return '0%';
    const trackWidth = timelineTrackRef.current.clientWidth;
    const availableWidth = trackWidth - 80; // thumbnailWidth
    return `${(progressPercentage / 100) * (availableWidth / trackWidth) * 100}%`;
  }, [progressPercentage]);

  // 初始化视频
  const initVideo = useCallback(async () => {
    if (!videoRef.current || !currentVideoUrl) return;

    try {
      setIsLoading(true);
      const video = videoRef.current;
      video.crossOrigin = 'anonymous';
      video.load();

      // 等待视频元数据加载完成
      await new Promise<void>((resolve, reject) => {
        if (video.readyState >= 2) {
          resolve();
        } else {
          const onLoadedMetadata = () => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            resolve();
          };
          const onError = () => {
            video.removeEventListener('error', onError);
            reject(new Error('视频加载失败'));
          };
          video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
          video.addEventListener('error', onError, { once: true });
        }
      });

      // 设置视频时长
      if (video.duration) {
        setDuration(video.duration);
      }

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
        // 设置到第一帧（0秒）
        video.currentTime = 0;

        // 等待视频跳转到第一帧
        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            resolve();
          };
          video.addEventListener('seeked', onSeeked, { once: true });

          // 如果视频已经准备好，可能不会触发seeked事件
          setTimeout(() => {
            if (video.readyState >= 2) {
              video.removeEventListener('seeked', onSeeked);
              resolve();
            }
          }, 100);
        });

        // 绘制第一帧到画布
        ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);
        setVideoThumbnail(canvas.toDataURL('image/jpeg', 0.9));
      }
    } catch (error) {
      console.error('初始化视频失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentVideoUrl]);

  // 初始化 canvas 尺寸
  const initCanvas = useCallback(() => {
    if (!maskCanvasRef.current || !videoRef.current) return;
    
    const canvas = maskCanvasRef.current;
    const video = videoRef.current;
    
    // 设置画布尺寸与视频元素的显示尺寸一致
    const videoRect = video.getBoundingClientRect();
    canvas.width = videoRect.width;
    canvas.height = videoRect.height;
  }, []);

  // 视频加载完成
  const handleVideoLoaded = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      // 重置加载状态
      setIsLoading(false);
      // 初始化 canvas 尺寸
      setTimeout(() => {
        initCanvas();
      }, 100);
    }
  }, [initCanvas]);

  // 视频时间更新
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && !isDragging) {
      setCurrentTime(videoRef.current.currentTime);
      // 更新遮罩层显示
      setShouldShowMask(true);
    }
  }, [isDragging]);

  // 播放/暂停切换
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

  // 时间轴点击
  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !timelineTrackRef.current) return;

    const trackRect = timelineTrackRef.current.getBoundingClientRect();
    const clickX = e.clientX - trackRect.left;
    const thumbnailWidth = 80;
    const availableWidth = trackRect.width - thumbnailWidth;

    if (clickX >= thumbnailWidth && duration > 0) {
      const percent = (clickX - thumbnailWidth) / availableWidth;
      const newTime = Math.max(0, Math.min(duration, percent * duration));
      
      if (videoRef.current) {
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
        // 点击时间轴后显示遮罩层
        setShouldShowMask(true);
      }
    }
  }, [duration]);

  // 开始拖拽时间轴
  const startDragging = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setShouldShowMask(false); // 拖拽时隐藏遮罩层
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!videoRef.current || !timelineTrackRef.current) return;

      const trackRect = timelineTrackRef.current.getBoundingClientRect();
      const mouseX = e.clientX - trackRect.left;
      const thumbnailWidth = 80;
      const availableWidth = trackRect.width - thumbnailWidth;

      if (mouseX >= thumbnailWidth && duration > 0) {
        const percent = (mouseX - thumbnailWidth) / availableWidth;
        const newTime = Math.max(0, Math.min(duration, percent * duration));
        
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setShouldShowMask(true); // 拖拽结束后显示遮罩层
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [duration]);

  // 当模态框打开时初始化视频
  useEffect(() => {
    if (isOpen && videoUrl) {
      // 重置视频 URL 为初始值
      setCurrentVideoUrl(videoUrl);
      // 重置预览结果
      setPreviewResult(null);
      previewResultRef.current = null;
    }
  }, [isOpen, videoUrl]);
  
  // 当 currentVideoUrl 变化时，重新初始化视频
  useEffect(() => {
    if (isOpen && currentVideoUrl) {
      initVideo();
    }
  }, [isOpen, currentVideoUrl, initVideo]);

  // 视频播放状态监听
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  // 获取视频帧率（默认30fps）
  const getVideoFrameRate = useCallback((): number => {
    if (!videoRef.current) return 30;
    
    // 尝试从视频播放质量获取帧率
    if (typeof videoRef.current.getVideoPlaybackQuality === 'function') {
      const quality = videoRef.current.getVideoPlaybackQuality();
      if (quality.creationTime && quality.totalVideoFrames && quality.creationTime > 0) {
        const fps = Math.round(quality.totalVideoFrames / quality.creationTime);
        if (fps > 0 && fps <= 120) {
          return fps;
        }
      }
    }
    
    return 30;
  }, []);

  // 根据时间计算帧索引
  const calculateFrameIndex = useCallback((time: number): number => {
    const fps = getVideoFrameRate();
    return Math.floor(time * fps);
  }, [getVideoFrameRate]);

  // 计算视频在容器中的实际显示区域（考虑 object-fit: contain）
  const getVideoDisplayRect = useCallback(() => {
    if (!videoRef.current || !videoContainerRef.current) {
      return { x: 0, y: 0, width: 0, height: 0, scale: 1, videoWidth: 0, videoHeight: 0 };
    }
    
    const video = videoRef.current;
    const container = videoContainerRef.current;
    
    // 视频原始尺寸
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    if (!videoWidth || !videoHeight) {
      const containerRect = container.getBoundingClientRect();
      return {
        x: 0,
        y: 0,
        width: containerRect.width,
        height: containerRect.height,
        scale: 1,
        videoWidth: 0,
        videoHeight: 0
      };
    }
    
    // 视频元素的显示尺寸
    const videoRect = video.getBoundingClientRect();
    const containerWidth = videoRect.width;
    const containerHeight = videoRect.height;
    
    // 计算缩放比例（object-fit: contain）
    const scaleX = containerWidth / videoWidth;
    const scaleY = containerHeight / videoHeight;
    const scale = Math.min(scaleX, scaleY);
    
    // 计算实际显示尺寸
    const displayWidth = videoWidth * scale;
    const displayHeight = videoHeight * scale;
    
    // 计算居中位置（相对于视频元素的位置）
    const x = (containerWidth - displayWidth) / 2;
    const y = (containerHeight - displayHeight) / 2;
    
    return {
      x: x,
      y: y,
      width: displayWidth,
      height: displayHeight,
      scale: scale,
      videoWidth: videoWidth,
      videoHeight: videoHeight
    };
  }, []);

  // 获取当前帧的标记点
  const currentFrameMarks = React.useMemo(() => {
    if (duration <= 0) return [];
    
    const currentFrameIndex = calculateFrameIndex(currentTime);
    
    return markers.filter((mark) => {
      const markFrameIndex = calculateFrameIndex(mark.time);
      return markFrameIndex === currentFrameIndex;
    });
  }, [markers, currentTime, duration, calculateFrameIndex]);

  // 检查点击位置是否在标记点内
  const findMarkAtPosition = useCallback((x: number, y: number): VideoMarker | null => {
    return currentFrameMarks.find((mark) => {
      const distance = Math.hypot(x - mark.x, y - mark.y);
      return distance <= mark.radius + 4;
    }) || null;
  }, [currentFrameMarks]);

  // 检查点击位置是否在标记点的中心白色圆圈区域内
  const isClickInInnerCircle = useCallback((x: number, y: number, mark: VideoMarker): boolean => {
    const distance = Math.hypot(x - mark.x, y - mark.y);
    // inner-circle 的半径约为外层半径的40%，考虑边框设置为42%
    return distance <= mark.radius * 0.42;
  }, []);

  // 添加标记点
  const addPointMark = useCallback((x: number, y: number) => {
    const newMark: VideoMarker = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: markingMode,
      x,
      y,
      radius: POINT_RADIUS,
      time: currentTime,
    };

    setMarkers((prev) => [...prev, newMark]);
    setSelectedMarkId(newMark.id);
    setHoveredMarkId(null);
  }, [markingMode, currentTime]);

  // 删除标记点
  const removeMark = useCallback((markId: string) => {
    // 先找到要删除的标记点，获取其帧索引
    let deletedMarkFrameIndex: number | null = null;
    setMarkers((prev) => {
      const deletedMark = prev.find((mark) => mark.id === markId);
      if (deletedMark) {
        deletedMarkFrameIndex = calculateFrameIndex(deletedMark.time);
      }
      const updated = prev.filter((mark) => mark.id !== markId);
      
      // 从已提交集合中移除该标记
      setSubmittedMarkIds((prevIds) => {
        const newIds = new Set(prevIds);
        newIds.delete(markId);
        return newIds;
      });
      
      // 如果该帧没有其他标记点了，清除该帧的遮罩数据
      if (deletedMarkFrameIndex !== null) {
        const hasOtherMarksInFrame = updated.some((mark) => {
          const markFrameIndex = calculateFrameIndex(mark.time);
          return markFrameIndex === deletedMarkFrameIndex;
        });
        
        if (!hasOtherMarksInFrame) {
          // 该帧没有其他标记点了，清除遮罩数据
          setFrameMaskMap((prev) => {
            const newMap = new Map(prev);
            newMap.delete(deletedMarkFrameIndex!);
            return newMap;
          });
        }
      }
      
      return updated;
    });
    
    if (selectedMarkId === markId) {
      setSelectedMarkId(null);
    }
  }, [selectedMarkId, calculateFrameIndex]);

  // 处理视频容器点击
  const handleVideoContainerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // 如果正在提交掩码绘制，禁用点击
    if (isSubmittingMask) {
      return;
    }
    
    // 如果点击的是标记点，不处理（由标记点自己的点击事件处理）
    if ((e.target as HTMLElement).closest('.mark-point')) {
      return;
    }
    
    if (!videoContainerRef.current || !videoRef.current) return;
    
    const container = videoContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const clickX = e.clientX - containerRect.left;
    const clickY = e.clientY - containerRect.top;
    
    // 获取视频显示区域
    const displayRect = getVideoDisplayRect();
    
    // 检查点击是否在视频显示区域内
    if (
      clickX < displayRect.x ||
      clickX > displayRect.x + displayRect.width ||
      clickY < displayRect.y ||
      clickY > displayRect.y + displayRect.height
    ) {
      return;
    }
    
    // 转换为相对于视频显示区域的坐标
    const relativeX = clickX - displayRect.x;
    const relativeY = clickY - displayRect.y;
    
    // 检查是否点击了标记点
    const clickedMark = findMarkAtPosition(relativeX, relativeY);
    
    // 借鉴 Nebula1：在标记模式下，点击标记点直接删除，点击空白处添加新标记
    if (markingMode) {
      if (clickedMark) {
        // 标记模式下，点击标记点直接删除
        removeMark(clickedMark.id);
      } else {
        // 标记模式下，点击空白处添加新标记点
        addPointMark(relativeX, relativeY);
      }
      return;
    }
    
    // 非标记模式下，点击标记点选中
    if (clickedMark) {
      setSelectedMarkId(clickedMark.id);
    } else if (selectedMarkId) {
      // 点击空白处取消选中
      setSelectedMarkId(null);
    }
  }, [isSubmittingMask, getVideoDisplayRect, findMarkAtPosition, isClickInInnerCircle, removeMark, addPointMark, markingMode, selectedMarkId]);

  // 处理标记点鼠标移动
  const handleMarkPointMouseMove = useCallback((e: React.MouseEvent, mark: VideoMarker) => {
    setHoveredMarkId(mark.id);
  }, []);

  // 处理标记点鼠标离开
  const handleMarkPointMouseLeave = useCallback(() => {
    setHoveredMarkId(null);
  }, []);

  // 清除所有标记
  const clearAllMarks = useCallback(() => {
    setMarkers([]);
    setSelectedMarkId(null);
    setHoveredMarkId(null);
  }, []);

  // 清除所有标记和遮罩层（不提交）- 借鉴 Nebula1
  // 注意：不清除预览结果（previewResult），因为确认按钮需要使用
  const clearAllMarksAndMasks = useCallback(async () => {
    // 清除所有标记修改区域和标记保护区域的坐标
    setMarkers([]);
    setSelectedMarkId(null);
    setHoveredMarkId(null);
    setSubmittedMarkIds(new Set());
    
    // 清除所有红色遮罩层和绿色遮罩层的遮罩数据
    setFrameMaskMap(new Map());
    
    // 借鉴 Nebula1：不清除预览结果（previewResult 和 previewResultRef），因为确认按钮需要使用
    // setPreviewResult(null);
    // previewResultRef.current = null;
    
    console.log('清除所有标记和遮罩数据（保留预览结果）');
    
    // 更新遮罩层显示（清除遮罩）- 通过 updateMaskForCurrentFrame 来更新
    // 注意：这里不直接调用 renderMaskImages，而是通过 updateMaskForCurrentFrame
    // 因为 renderMaskImages 在后面定义，会有依赖问题
    if (maskCanvasRef.current) {
      const ctx = maskCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
      }
    }
  }, []);

  // 将画布坐标转换为视频原始尺寸坐标
  const convertCanvasToVideoCoordinates = useCallback((canvasX: number, canvasY: number): [number, number] => {
    if (!videoRef.current) {
      return [canvasX, canvasY];
    }
    
    const displayRect = getVideoDisplayRect();
    const videoWidth = displayRect.videoWidth || videoRef.current.videoWidth || displayRect.width;
    const videoHeight = displayRect.videoHeight || videoRef.current.videoHeight || displayRect.height;
    
    // 计算缩放比例
    const scaleX = videoWidth / displayRect.width;
    const scaleY = videoHeight / displayRect.height;
    
    return [canvasX * scaleX, canvasY * scaleY];
  }, [getVideoDisplayRect]);

  // 睡眠函数
  const sleep = useCallback((ms: number) => new Promise((resolve) => setTimeout(resolve, ms)), []);

  // 执行实际的提交逻辑（借鉴 Nebula1）
  const executeSubmitMaskDrawing = useCallback(async () => {
    // 如果没有任务ID，不提交
    if (!videoProcessTaskId) {
      console.warn('videoProcessTaskId 未设置，跳过提交');
      return;
    }
    
    // 如果没有标记，不提交
    if (markers.length === 0) {
      console.log('没有标记数据，跳过提交');
      return;
    }
    
    // 设置提交状态
    setIsSubmittingMask(true);
    
    try {
      // 找出未提交的标记
      const unsubmittedMarks = markers.filter(mark => !submittedMarkIds.has(mark.id));
      
      // 如果没有未提交的标记，直接返回
      if (unsubmittedMarks.length === 0) {
        console.log('没有未提交的标记数据，跳过提交');
        return;
      }
      
      // 找出包含未提交标记的帧索引
      const framesWithNewMarks = new Set<number>();
      unsubmittedMarks.forEach((mark) => {
        const frameIndex = calculateFrameIndex(mark.time);
        framesWithNewMarks.add(frameIndex);
      });
      
      // 按帧索引分组所有标记（包括已提交和未提交的，因为接口需要该帧的所有标记数据）
      const frameMap = new Map<number, { modifyPoints: number[][]; protectPoints: number[][]; markIds: string[] }>();
      
      markers.forEach((mark) => {
        const frameIndex = calculateFrameIndex(mark.time);
        // 只处理有新标记的帧
        if (!framesWithNewMarks.has(frameIndex)) {
          return;
        }
        
        const [videoX, videoY] = convertCanvasToVideoCoordinates(mark.x, mark.y);
        
        if (!frameMap.has(frameIndex)) {
          frameMap.set(frameIndex, {
            modifyPoints: [],
            protectPoints: [],
            markIds: [],
          });
        }
        
        const frameData = frameMap.get(frameIndex)!;
        frameData.markIds.push(mark.id);
        
        if (mark.type === 'modify') {
          frameData.modifyPoints.push([videoX, videoY]);
        } else if (mark.type === 'protect') {
          frameData.protectPoints.push([videoX, videoY]);
        }
      });
      
      // 获取所有有新标记的帧索引，按升序排序
      const frameIndices = Array.from(framesWithNewMarks).sort((a, b) => a - b);
      
      // 如果没有标记，不提交
      if (frameIndices.length === 0) {
        console.log('没有有效的帧标记数据');
        return;
      }
      
      // 为每个有新标记的帧创建独立的 inputInfo
      const inputInfos: Array<{ index: number; modifyPoints: number[][]; protectPoints: number[][]; markIds: string[] }> = [];
      
      frameIndices.forEach((frameIndex) => {
        const frameData = frameMap.get(frameIndex);
        if (frameData && (frameData.modifyPoints.length > 0 || frameData.protectPoints.length > 0)) {
          inputInfos.push({
            index: frameIndex,
            modifyPoints: frameData.modifyPoints,
            protectPoints: frameData.protectPoints,
            markIds: frameData.markIds,
          });
        }
      });
      
      if (inputInfos.length === 0) {
        console.log('没有有效的帧标记数据');
        return;
      }
      
      console.log('提交掩码绘制数据，共', inputInfos.length, '帧（只提交有新标记的帧）:', inputInfos);
      
      // 为每个帧单独提交（因为 imageMaskDrawingSubmit 只接受单个 inputInfo）
      for (const inputInfo of inputInfos) {
        // 组装请求数据
        const payload = {
          videoProcessTaskId: videoProcessTaskId,
          inputInfo: {
            index: inputInfo.index,
            modifyPoints: inputInfo.modifyPoints,
            protectPoints: inputInfo.protectPoints,
          },
        };
        
        console.log('提交帧', inputInfo.index, '的掩码绘制数据:', payload);
        
        try {
          // 调用接口
          const submitResult = await imageMaskDrawingService.submit(payload);
          
          if (submitResult.result?.taskId) {
            // 轮询查询任务状态
            while (true) {
              try {
                const queryResult = await imageMaskDrawingService.query({
                  taskId: submitResult.result.taskId,
                });
                
                if (queryResult.result?.status === 'success') {
                  // 保存该帧的遮罩数据到 Map 中
                  setFrameMaskMap((prev) => {
                    const newMap = new Map(prev);
                    newMap.set(inputInfo.index, {
                      mask: queryResult.result?.mask,
                      protectMask: queryResult.result?.protectMask,
                    });
                    return newMap;
                  });
                  
                  // 将该帧的所有标记ID加入已提交集合
                  setSubmittedMarkIds((prev) => {
                    const newSet = new Set(prev);
                    inputInfo.markIds.forEach(markId => newSet.add(markId));
                    return newSet;
                  });
                  
                  console.log('已保存帧', inputInfo.index, '的遮罩数据');
                  
                  break;
                } else if (queryResult.result?.status === 'failed') {
                  console.log('获取帧', inputInfo.index, '的图像掩码绘制查询任务失败');
                  break;
                } else {
                  // 其他状态（如 'processing', 'pending' 等）继续轮询
                  await sleep(5000);
                  continue;
                }
              } catch (error) {
                console.error('轮询帧', inputInfo.index, '的查询任务失败:', error);
                break;
              }
            }
          }
        } catch (error) {
          console.error('提交帧', inputInfo.index, '的掩码绘制失败:', error);
          // 继续处理下一帧，不中断整个流程
        }
      }
      
      console.log('掩码绘制提交成功，共处理', inputInfos.length, '帧');
    } catch (error) {
      console.error('提交掩码绘制失败:', error);
    } finally {
      // 无论成功或失败，都要重置提交状态
      setIsSubmittingMask(false);
    }
  }, [videoProcessTaskId, markers, submittedMarkIds, calculateFrameIndex, convertCanvasToVideoCoordinates, sleep]);

  // 提交掩码绘制数据（等待机制，避免重复提交）- 借鉴 Nebula1
  const submitMaskDrawingRef = useRef<(() => Promise<void>) | null>(null);
  
  const submitMaskDrawing = useCallback(async (): Promise<void> => {
    // 如果正在提交中，标记有待处理的提交请求，等待当前提交完成
    if (isSubmittingMask) {
      console.log('正在提交掩码绘制数据，等待当前提交完成后再处理新的提交请求');
      setHasPendingSubmit(true);
      return;
    }
    
    // 如果没有任务ID，不提交
    if (!videoProcessTaskId) {
      console.warn('videoProcessTaskId 未设置，跳过提交');
      return;
    }
    
    // 如果没有标记，不提交
    if (markers.length === 0) {
      console.log('没有标记数据，跳过提交');
      return;
    }
    
    // 直接执行提交
    await executeSubmitMaskDrawing();
    
    // 提交完成后，如果有待处理的提交请求，再次执行提交
    const pendingSubmit = hasPendingSubmit;
    if (pendingSubmit) {
      setHasPendingSubmit(false);
      console.log('检测到有待处理的提交请求，继续执行提交');
      // 使用 setTimeout 避免递归调用问题
      setTimeout(() => {
        submitMaskDrawingRef.current?.();
      }, 100);
    }
  }, [isSubmittingMask, videoProcessTaskId, markers.length, executeSubmitMaskDrawing, hasPendingSubmit]);
  
  // 保存函数引用
  submitMaskDrawingRef.current = submitMaskDrawing;

  // 渲染遮罩图片到 canvas（借鉴 Nebula1）
  const renderMaskImages = useCallback(async (maskBase64?: string, protectMaskBase64?: string) => {
    if (!maskCanvasRef.current || !videoRef.current) return;
    
    const canvas = maskCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    // 获取视频显示区域信息（需要在设置 canvas 尺寸之前获取）
    const displayRect = getVideoDisplayRect();
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 设置画布尺寸与视频容器的尺寸一致（这样 canvas 和视频容器大小一致）
    const videoRect = videoRef.current.getBoundingClientRect();
    canvas.width = videoRect.width;
    canvas.height = videoRect.height;
    
    // 渲染修改区域遮罩（红色，mask）
    if (maskBase64) {
      try {
        const cleanBase64 = maskBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        const maskImg = new Image();
        
        await new Promise<void>((resolve, reject) => {
          maskImg.onload = () => {
            ctx.save();
            
            // 创建临时 canvas 处理遮罩图片
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = maskImg.width;
            tempCanvas.height = maskImg.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            if (tempCtx) {
              tempCtx.drawImage(maskImg, 0, 0);
              const imageData = tempCtx.getImageData(0, 0, maskImg.width, maskImg.height);
              const data = imageData.data;
              
              // 转换为红色遮罩
              for (let i = 0; i < data.length; i += 4) {
                const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                const maskAlpha = brightness / 255;
                
                if (maskAlpha > 0.01) {
                  // 红色遮罩：rgba(255, 77, 79, 0.35)
                  data[i] = 255;     // R
                  data[i + 1] = 77;  // G
                  data[i + 2] = 79;  // B
                  data[i + 3] = Math.min(Math.floor(maskAlpha * 0.35 * 255), 90); // A
                } else {
                  data[i + 3] = 0; // 完全透明
                }
              }
              
              tempCtx.putImageData(imageData, 0, 0);
              
              // 绘制到主 canvas
              ctx.globalCompositeOperation = 'source-over';
              ctx.drawImage(
                tempCanvas,
                0, 0, maskImg.width, maskImg.height,
                displayRect.x, displayRect.y, displayRect.width, displayRect.height
              );
            }
            
            ctx.restore();
            resolve();
          };
          maskImg.onerror = reject;
          maskImg.src = `data:image/png;base64,${cleanBase64}`;
        });
      } catch (error) {
        console.error('渲染修改区域遮罩失败:', error);
      }
    }
    
    // 渲染保护区域遮罩（绿色，protectMask）
    if (protectMaskBase64) {
      try {
        const cleanBase64 = protectMaskBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        const protectMaskImg = new Image();
        
        await new Promise<void>((resolve, reject) => {
          protectMaskImg.onload = () => {
            ctx.save();
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = protectMaskImg.width;
            tempCanvas.height = protectMaskImg.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            if (tempCtx) {
              tempCtx.drawImage(protectMaskImg, 0, 0);
              const imageData = tempCtx.getImageData(0, 0, protectMaskImg.width, protectMaskImg.height);
              const data = imageData.data;
              
              // 转换为绿色遮罩
              for (let i = 0; i < data.length; i += 4) {
                const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                const maskAlpha = brightness / 255;
                
                if (maskAlpha > 0.01) {
                  // 绿色遮罩：rgba(82, 196, 26, 0.35)
                  data[i] = 82;      // R
                  data[i + 1] = 196; // G
                  data[i + 2] = 26;  // B
                  data[i + 3] = Math.min(Math.floor(maskAlpha * 0.35 * 255), 90); // A
                } else {
                  data[i + 3] = 0; // 完全透明
                }
              }
              
              tempCtx.putImageData(imageData, 0, 0);
              
              // 绘制到主 canvas（叠加在红色遮罩上）
              ctx.globalCompositeOperation = 'source-over';
              ctx.drawImage(
                tempCanvas,
                0, 0, protectMaskImg.width, protectMaskImg.height,
                displayRect.x, displayRect.y, displayRect.width, displayRect.height
              );
            }
            
            ctx.restore();
            resolve();
          };
          protectMaskImg.onerror = reject;
          protectMaskImg.src = `data:image/png;base64,${cleanBase64}`;
        });
      } catch (error) {
        console.error('渲染保护区域遮罩失败:', error);
      }
    }
  }, [getVideoDisplayRect]);

  // 根据当前帧显示对应的遮罩层（借鉴 Nebula1）
  const updateMaskForCurrentFrame = useCallback(async () => {
    if (!videoRef.current) return;
    
    // 如果正在拖拽，隐藏遮罩层
    if (!shouldShowMask || isDragging) {
      await renderMaskImages(undefined, undefined);
      return;
    }
    
    // 计算当前帧索引
    const currentFrameIndex = calculateFrameIndex(currentTime);
    
    // 检查当前帧是否有标记点
    const currentFrameMarks = markers.filter((mark) => {
      const markFrameIndex = calculateFrameIndex(mark.time);
      return markFrameIndex === currentFrameIndex;
    });
    
    // 如果当前帧没有标记点，隐藏遮罩层
    if (currentFrameMarks.length === 0) {
      await renderMaskImages(undefined, undefined);
      return;
    }
    
    // 获取当前帧对应的遮罩数据
    const frameMaskData = frameMaskMap.get(currentFrameIndex);
    
    // 验证遮罩数据是否有效：确保当前帧的所有标记点都已提交（遮罩数据对应这些标记点）
    // 如果标记点被删除了，遮罩数据也应该被清除，所以这里只需要检查遮罩数据是否存在
    if (frameMaskData && (frameMaskData.mask || frameMaskData.protectMask)) {
      // 显示当前帧的遮罩层
      await renderMaskImages(frameMaskData.mask, frameMaskData.protectMask);
    } else {
      // 如果没有当前帧的遮罩数据，隐藏遮罩层
      await renderMaskImages(undefined, undefined);
    }
  }, [currentTime, isDragging, shouldShowMask, markers, frameMaskMap, calculateFrameIndex, renderMaskImages]);

  // 当标记点变化时，自动提交（使用 useEffect）
  useEffect(() => {
    if (markers.length > 0 && videoProcessTaskId && !isSubmittingMask) {
      // 延迟提交，避免频繁调用
      const timer = setTimeout(() => {
        submitMaskDrawingRef.current?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [markers, videoProcessTaskId, isSubmittingMask]);

  // 当遮罩数据或当前时间变化时，更新遮罩层显示
  useEffect(() => {
    if (!isDragging && shouldShowMask) {
      updateMaskForCurrentFrame();
    }
  }, [currentTime, isDragging, shouldShowMask, frameMaskMap, markers, updateMaskForCurrentFrame]);

  // 监听窗口大小变化，更新 canvas 尺寸
  useEffect(() => {
    const handleResize = () => {
      initCanvas();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [initCanvas]);

  // 预览所有已选区域（提交视频掩码绘制任务）- 借鉴 Nebula1：成功后不关闭模态框
  const handlePreviewAll = useCallback(async (shouldEmitSuccess = false) => {
    // 如果没有标记，不处理
    if (markers.length === 0) {
      console.warn('没有标记数据');
      return;
    }

    if (!videoProcessTaskId) {
      console.warn('videoProcessTaskId 未设置');
      return;
    }

    // 设置加载和禁用状态 - 借鉴 Nebula1
    setPreviewAllLoading(true);
    setPreviewAllDisabled(true);
    setDrawModalSpin(true);

    try {
      // 按帧索引分组所有标记
      const frameMap = new Map<number, { modifyPoints: number[][]; protectPoints: number[][] }>();

      markers.forEach((mark) => {
        const frameIndex = calculateFrameIndex(mark.time);
        const [videoX, videoY] = convertCanvasToVideoCoordinates(mark.x, mark.y);

        if (!frameMap.has(frameIndex)) {
          frameMap.set(frameIndex, {
            modifyPoints: [],
            protectPoints: [],
          });
        }

        const frameData = frameMap.get(frameIndex)!;

        if (mark.type === 'modify') {
          frameData.modifyPoints.push([videoX, videoY]);
        } else if (mark.type === 'protect') {
          frameData.protectPoints.push([videoX, videoY]);
        }
      });

      // 获取所有帧索引，按升序排序
      const frameIndices = Array.from(frameMap.keys()).sort((a, b) => a - b);

      // 构建 inputInfos 数组（index 是字符串格式）- 借鉴 Nebula1
      const inputInfos: Array<{ index: string; modifyPoints: number[][]; protectPoints: number[][] }> = [];

      frameIndices.forEach((frameIndex) => {
        const frameData = frameMap.get(frameIndex);
        if (frameData && (frameData.modifyPoints.length > 0 || frameData.protectPoints.length > 0)) {
          inputInfos.push({
            index: String(frameIndex),
            modifyPoints: frameData.modifyPoints,
            protectPoints: frameData.protectPoints,
          });
        }
      });

      if (inputInfos.length === 0) {
        console.warn('没有有效的帧标记数据');
        setPreviewAllLoading(false);
        setPreviewAllDisabled(false);
        setDrawModalSpin(false);
        return;
      }

      console.log('提交视频掩码绘制任务，inputInfos:', inputInfos);

      // 提交视频掩码绘制任务
      const payload = {
        videoProcessTaskId: videoProcessTaskId,
        inputInfos,
      };

      const submitResult = await videoMaskDrawingService.submit(payload);

      if (!submitResult.result?.taskId) {
        throw new Error('提交视频掩码绘制任务失败');
      }

      const taskId = submitResult.result.taskId;
      console.log('视频掩码绘制任务已提交，taskId:', taskId);

      // 轮询查询任务状态
      while (true) {
        await sleep(5000); // 每5秒查询一次

        try {
          const queryResult = await videoMaskDrawingService.query({ taskId });

          if (queryResult.result?.status === 'success') {
            const trackingVideoPath = queryResult.result.trackingVideoPath;
            console.log('视频掩码绘制任务成功，trackingVideoPath:', trackingVideoPath);

            // 借鉴 Nebula1：预览成功后不关闭模态框，只清除标记和遮罩层
            // 更新视频 URL 为 trackingVideoPath - 借鉴 Nebula1: videoUrl.value = result.trackingVideoPath
            setCurrentVideoUrl(trackingVideoPath);
            
            // 保存预览结果，供确认按钮使用（同时保存到 state 和 ref）
            const result = {
              taskId: queryResult.result.taskId,
              trackingVideoPath: trackingVideoPath,
            };
            console.log('预览成功：保存预览结果到 state 和 ref:', result);
            setPreviewResult(result);
            previewResultRef.current = result;
            console.log('预览成功：previewResultRef.current =', previewResultRef.current);

            // 借鉴 Nebula1：如果 shouldEmitSuccess 为 true，触发子传父事件
            // emit('videoMaskSuccess', { taskId, trackingVideoPath })
            if (shouldEmitSuccess && onVideoMaskSuccess) {
              console.log('预览成功：触发子传父事件 onVideoMaskSuccess');
              onVideoMaskSuccess(result);
            } else {
              console.log('预览成功：不触发子传父事件（shouldEmitSuccess =', shouldEmitSuccess, ', onVideoMaskSuccess =', !!onVideoMaskSuccess, ')');
            }

            // 清除所有标记和遮罩层
            await clearAllMarksAndMasks();
            
            // 重新初始化视频以显示新的 trackingVideoPath
            await initVideo();

            break;
          } else if (queryResult.result?.status === 'failed') {
            console.error('视频掩码绘制任务失败');
            throw new Error('视频掩码绘制任务失败');
          } else {
            // processing 或 pending 状态，继续轮询
            console.log('视频掩码绘制任务处理中，继续轮询...');
            continue;
          }
        } catch (error) {
          console.error('轮询查询任务失败:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('提交视频掩码绘制任务失败:', error);
      // 可以在这里显示错误提示
    } finally {
      // 重置所有状态 - 借鉴 Nebula1
      setPreviewAllLoading(false);
      setPreviewAllDisabled(false);
      setDrawModalSpin(false);
    }
  }, [markers, videoProcessTaskId, calculateFrameIndex, convertCanvasToVideoCoordinates, sleep, clearAllMarksAndMasks, onVideoMaskSuccess, initVideo]);

  // 确认提交（调用预览功能后关闭模态框）- 借鉴 Nebula1
  const handleConfirm = useCallback(async () => {
    // 借鉴 Nebula1：优先检查是否有预览结果（即使标记被清除了，预览结果仍然存在）
    // 如果已经有预览结果（从 ref 或 state 中获取），直接使用它们并触发子传父事件
    const existingResult = previewResultRef.current || previewResult;
    if (existingResult) {
      console.log('确认按钮：使用已有的预览结果:', existingResult);
      console.log('确认按钮：taskId =', existingResult.taskId);
      console.log('确认按钮：trackingVideoPath =', existingResult.trackingVideoPath);
      
      // 借鉴 Nebula1：触发子传父事件，传递 taskId 和 trackingVideoPath
      if (onVideoMaskSuccess) {
        console.log('确认按钮：触发子传父事件 onVideoMaskSuccess');
        onVideoMaskSuccess({
          taskId: existingResult.taskId,
          trackingVideoPath: existingResult.trackingVideoPath,
        });
      } else {
        console.warn('确认按钮：onVideoMaskSuccess 回调未定义');
      }
      
      // 关闭模态框
      onClose();
      return;
    }
    
    // 借鉴 Nebula1：如果没有预览结果，检查是否有标记
    // 如果没有标记也没有预览结果，直接关闭
    if (markers.length === 0) {
      console.log('确认按钮：没有标记也没有预览结果，直接关闭');
      onClose();
      return;
    }
    
    // 借鉴 Nebula1：如果有标记但没有预览结果，调用预览功能并等待完成
    // 传入 true 表示需要触发成功回调（子传父事件）
    console.log('确认按钮：有标记但没有预览结果，开始执行预览功能');
    await handlePreviewAll(true);
    
    // 借鉴 Nebula1：预览完成后关闭模态框（handlePreviewAll 中已经触发了子传父事件）
    onClose();
  }, [markers.length, previewResult, handlePreviewAll, onClose, onVideoMaskSuccess]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* 全屏加载遮罩 - 借鉴 Nebula1：只在预览任务进行时显示，不在视频加载时显示 */}
      {drawModalSpin && !isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-[1px]">
          <div className="flex flex-col items-center justify-center bg-[#2a2a2a] p-4 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
            <span className="text-sm font-medium text-white">正在生成绘制,请等待...</span>
          </div>
        </div>
      )}
      <div className="bg-[#1a1a1a] rounded-lg shadow-2xl w-[90vw] max-w-[1200px] max-h-[90vh] overflow-hidden flex flex-col">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#2a2a2a] border-b border-[#3a3a3a]">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-white hover:bg-[#3a3a3a] rounded transition-colors"
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
          <h2 className="flex-1 text-center text-base font-medium text-white">
            点击视频标记需修改区域与需保护区域
          </h2>
          <div className="w-20"></div> {/* 占位符，保持居中 */}
        </div>

        {/* 视频预览区域 */}
        <div className="flex-1 flex items-center justify-center p-6 bg-[#0a0a0a] overflow-hidden" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div
            ref={videoContainerRef}
            className="relative w-full max-w-[400px] flex items-center justify-center"
            style={{ 
              height: '600px',
              aspectRatio: 'auto'
            }}
            onClick={handleVideoContainerClick}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30 rounded-lg">
                <div className="text-white text-lg">加载视频中...</div>
              </div>
            )}
            {isSubmittingMask && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30 rounded-lg backdrop-blur-[1px]">
                <div className="flex flex-col items-center justify-center bg-[#2a2a2a] p-4 rounded-lg shadow-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                  <span className="text-sm font-medium text-white">正在渲染绘制标记点，请稍等...</span>
                </div>
              </div>
            )}
            <video
              ref={videoRef}
              src={currentVideoUrl}
              className="w-full h-full max-w-full max-h-full object-contain rounded-lg"
              style={{ 
                maxWidth: '100%',
                maxHeight: '100%'
              }}
              onLoadedMetadata={handleVideoLoaded}
              onTimeUpdate={handleTimeUpdate}
              onError={(e) => {
                console.error('视频加载错误:', e);
                setIsLoading(false);
              }}
              playsInline
              crossOrigin="anonymous"
            />
            
            {/* 后端返回的遮罩层 */}
            <canvas
              ref={maskCanvasRef}
              className="absolute inset-0 pointer-events-none z-10"
              style={{ width: '100%', height: '100%' }}
            />
            
            {/* 标记点层 */}
            <div className="absolute inset-0 pointer-events-none z-20">
              {(() => {
                const displayRect = getVideoDisplayRect();
                return currentFrameMarks.map((mark) => {
                  const left = displayRect.x + mark.x - mark.radius;
                  const top = displayRect.y + mark.y - mark.radius;
                  const isHovered = hoveredMarkId === mark.id;
                  const isSelected = selectedMarkId === mark.id;
                  
                  return (
                    <div
                      key={mark.id}
                      className="absolute rounded-full flex items-center justify-center border-2 transition-all pointer-events-auto mark-point"
                      style={{
                        width: `${mark.radius * 2}px`,
                        height: `${mark.radius * 2}px`,
                        left: `${left}px`,
                        top: `${top}px`,
                        backgroundColor: mark.type === 'modify' 
                          ? 'rgba(255, 77, 79, 0.25)' 
                          : 'rgba(82, 196, 26, 0.25)',
                        borderColor: mark.type === 'modify'
                          ? 'rgba(255, 77, 79, 0.8)'
                          : 'rgba(82, 196, 26, 0.8)',
                        transform: isSelected ? 'scale(1.15)' : isHovered ? 'scale(1.08)' : 'scale(1)',
                        boxShadow: isSelected ? '0 0 6px rgba(0, 0, 0, 0.35)' : 'none',
                        cursor: 'default',
                      }}
                      onMouseMove={(e) => {
                        e.stopPropagation();
                        handleMarkPointMouseMove(e, mark);
                      }}
                      onMouseLeave={(e) => {
                        e.stopPropagation();
                        handleMarkPointMouseLeave();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // 如果正在提交掩码绘制，禁用点击
                        if (isSubmittingMask) {
                          return;
                        }
                        // 借鉴 Nebula1：在标记模式下，点击标记点直接删除
                        if (markingMode) {
                          removeMark(mark.id);
                        } else {
                          // 非标记模式下，点击标记点选中
                          setSelectedMarkId(mark.id);
                        }
                      }}
                    >
                      <span
                        className="rounded-full border-2 transition-all"
                        style={{
                          width: isHovered ? '70%' : '40%',
                          height: isHovered ? '2px' : '40%',
                          border: isHovered ? 'none' : '2px solid rgba(245, 243, 243, 0.9)',
                          backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
                          borderRadius: isHovered ? '1px' : '50%',
                        }}
                      />
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* 时间轴控制 */}
        <div className="px-6 py-4 bg-[#2a2a2a] border-t border-b border-[#3a3a3a]">
          <div
            ref={timelineTrackRef}
            className="relative w-full h-[60px] bg-[#1a1a1a] rounded cursor-pointer overflow-hidden"
            onClick={handleTimelineClick}
          >
            {/* 视频缩略图和播放按钮 */}
            <div
              className="absolute left-0 top-0 bottom-0 w-20 rounded-l overflow-hidden cursor-pointer flex items-center justify-center transition-opacity hover:opacity-100"
              style={{
                backgroundImage: videoThumbnail ? `url(${videoThumbnail})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: videoThumbnail ? 0.9 : 1,
              }}
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
            >
              {!videoThumbnail && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#2c2c2c] to-[#111]"></div>
              )}
              <button
                className={`relative z-10 w-10 h-10 rounded-full bg-white/95 border-2 border-white/80 text-[#1a1a1a] flex items-center justify-center transition-all hover:scale-110 hover:bg-white shadow-lg ${
                  isPlaying ? '' : ''
                }`}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>
            </div>

            {/* 进度条 */}
            <div
              className="absolute left-20 top-0 bottom-0 bg-white/10 pointer-events-none transition-all"
              style={{ width: progressWidth }}
            />

            {/* 时间轴指示器 */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none z-10 transition-transform"
              style={{ left: `${indicatorPosition}px`, transform: 'translateX(-50%)' }}
            >
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10 pointer-events-auto"
                onMouseDown={startDragging}
              />
            </div>
          </div>
        </div>

        {/* 操作按钮区域 */}
        <div className="flex gap-3 px-6 py-4 bg-[#2a2a2a] border-b border-[#3a3a3a] flex-wrap">
          <button
            onClick={() => setMarkingMode('modify')}
            disabled={isSubmittingMask}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all ${
              markingMode === 'modify'
                ? 'bg-[#ff4d4f] border border-[#ff4d4f] text-white'
                : 'bg-[#3a3a3a] border border-[#4a4a4a] text-white hover:bg-[#4a4a4a] hover:border-[#5a5a5a]'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Send className="w-4.5 h-4.5" />
            <span>标记修改区域</span>
          </button>
          <button
            onClick={() => setMarkingMode('protect')}
            disabled={isSubmittingMask}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all ${
              markingMode === 'protect'
                ? 'bg-[#52c41a] border border-[#52c41a] text-white'
                : 'bg-[#3a3a3a] border border-[#4a4a4a] text-white hover:bg-[#4a4a4a] hover:border-[#5a5a5a]'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Shield className="w-4.5 h-4.5" />
            <span>标记保护区域</span>
          </button>
          <button
            onClick={clearAllMarks}
            disabled={isSubmittingMask}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium bg-[#3a3a3a] border border-[#4a4a4a] text-white hover:bg-[#4a4a4a] hover:border-[#5a5a5a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4.5 h-4.5" />
            <span>清除</span>
          </button>
          <button
            onClick={() => handlePreviewAll(false)}
            disabled={previewAllLoading || previewAllDisabled || markers.length === 0 || !videoProcessTaskId || isSubmittingMask}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium bg-[#3a3a3a] border border-[#4a4a4a] text-white hover:bg-[#4a4a4a] hover:border-[#5a5a5a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {previewAllLoading ? (
              <>
                <div className="animate-spin rounded-full h-4.5 w-4.5 border-b-2 border-white"></div>
                <span>处理中...</span>
              </>
            ) : (
              <>
                <Eye className="w-4.5 h-4.5" />
                <span>预览所有已选区域</span>
              </>
            )}
          </button>
        </div>

        {/* 底部操作栏 */}
        <div className="flex justify-center items-center px-6 py-4 bg-[#2a2a2a] border-t border-[#3a3a3a]">
          <button
            onClick={onClose}
            disabled={isSubmittingMask}
            className="px-8 py-2 bg-[#3a3a3a] text-white rounded-md text-sm font-medium hover:bg-[#4a4a4a] transition-all mx-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={previewAllLoading || previewAllDisabled || !videoProcessTaskId || isSubmittingMask}
            className="px-8 py-2 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-md text-sm font-medium hover:from-[#5a67d8] hover:to-[#6b46c1] hover:-translate-y-px hover:shadow-lg hover:shadow-indigo-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {previewAllLoading ? '处理中...' : '确认'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoEditingModal;
