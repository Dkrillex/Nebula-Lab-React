// import React from 'react';
// import PlaceholderPage from './PlaceholderPage';

// const AiFaceSwapPage: React.FC = () => {
//   return <PlaceholderPage title="AI视频换脸" />;
// };

// export default AiFaceSwapPage;
import React, { useState } from 'react';
import { Wand2, Sparkles, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import UploadComponent from '../../../components/UploadComponent';
import { faceSwapService, videoProcessService } from '../../../services/faceSwapService';
import { UploadedFile } from '../../../services/avatarService';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import VideoEditingModal, { VideoMarker } from './VideoEditingModal';
import AddMaterialModal from '../../../components/AddMaterialModal';
import { useAppOutletContext } from '../../../router/context';
import { translations } from '../../../translations';

// 积分图标组件 - 借鉴 Nebula1
const SvgPointsIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <path d="M913.7 430.7c2.9-2.9 7.5-7.4-3.9-21.7L722.6 159.7H302.8l-187 248.9c-11.6 14.6-7 19.2-4.3 21.9l401.2 410.4 401-410.2zM595.5 667.2c-7.7 0-14-6.3-14-14s6.3-14 14-14 14 6.3 14 14c0 7.8-6.3 14-14 14zM746 502.8c6.6 6.6 6.6 17.2 0 23.7L645.2 627.3c-3.3 3.3-7.6 4.9-11.9 4.9-4.3 0-8.6-1.6-11.9-4.9-6.6-6.6-6.6-17.2 0-23.7l100.7-100.7c6.7-6.7 17.3-6.7 23.9-0.1zM346 358.1c-6.7-6.5-6.8-17.1-0.4-23.7 6.4-6.7 17.1-6.8 23.7-0.4l149.6 145 151.5-146.8c6.7-6.5 17.3-6.3 23.7 0.4 6.5 6.7 6.3 17.3-0.4 23.7L535.2 509.9c-0.8 1.8-1.8 3.5-3.3 5-3.3 3.4-7.7 5.1-12.1 5.1-4.2 0-8.4-1.6-11.7-4.7L346 358.1z" fill="currentColor" />
    <path d="M936.4 388.4l-192-255.6c-3.2-4.2-8.1-6.7-13.4-6.7H294.4c-5.3 0-10.3 2.5-13.4 6.7L89.3 388.1c-27.1 34.1-10 57.7-1.6 66.1l413 422.5c3.2 3.2 7.5 5.1 12 5.1s8.8-1.8 12-5.1l412.8-422.4c8.7-8.5 25.7-32.1-1.1-65.9z m-820.5 20.2l187-248.9h419.8L909.9 409c11.3 14.3 6.8 18.8 3.9 21.7l-401 410.2-401.2-410.4c-2.8-2.7-7.3-7.3 4.3-21.9z" fill="currentColor" />
  </svg>
);

const AiFaceSwapPage: React.FC = () => {
  const { t: rootT } = useAppOutletContext();
  // 添加空值保护，防止页面崩溃
  const t = rootT?.aiVideoFaceSwapPage || translations['en'].aiVideoFaceSwapPage;
  
  // 视频状态
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoUploadedUrl, setVideoUploadedUrl] = useState<string | null>(null);
  const [videoProcessTaskId, setVideoProcessTaskId] = useState<string | null>(null); // 视频处理任务ID（用于后续视频掩码绘制）
  const [videoMaskDrawingTaskId, setVideoMaskDrawingTaskId] = useState<string | null>(null); // 视频掩码绘制任务ID（从 videoMaskDrawingQuery 返回的 taskId，用于后续视频角色交换）
  const [trackingVideoPath, setTrackingVideoPath] = useState<string | null>(null); // 跟踪视频路径（从 videoMaskDrawingQuery 返回的 trackingVideoPath）
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  
  // 图片状态
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFileId, setImageFileId] = useState<string | null>(null); // 图片文件ID
  const [isImageUploading, setIsImageUploading] = useState(false);
  
  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  // 积分状态 - 借鉴 Nebula1
  const points = 0.3; // 每秒/0.3积分
  const [countPoints, setCountPoints] = useState<number>(0); // 计算后的积分

  // 视频编辑器状态
  const [isVideoEditorOpen, setIsVideoEditorOpen] = useState(false);
  const [videoMarkers, setVideoMarkers] = useState<VideoMarker[]>([]);

  // 导入素材状态 - 借鉴 Nebula1
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState(false); // 是否已导入素材

  // 睡眠函数
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // 处理视频开始上传
  const handleVideoFileSelectedWithUpload = async (file: File) => {
    setIsVideoUploading(true);
    await handleVideoFileSelected(file);
  };

  // 处理视频上传完成 - 借鉴 Nebula1 的逻辑（先上传，再提交任务，最后验证）
  const handleVideoUploadComplete = async (file: UploadedFile) => {
    console.log('file',file);
    console.log("videoFile",videoFile);
    
    if (!file.fileId) {
      setError(t.errors.videoUploadFailed);
      setIsVideoUploading(false);
      return;
    }

    setError(null);

    try {
      // 借鉴 Nebula1：先提交视频处理任务，再验证
      // 1. 提交视频处理任务（借鉴 Nebula1：先上传再提交任务）
      console.log('提交视频处理任务，fileId:', file.fileId);
      const taskSubmitResult = await videoProcessService.taskSubmit({
        inputVideoFileId: file.fileId,
      });

      if (!taskSubmitResult.result?.taskId) {
        throw new Error(t.errors.videoProcessTaskFailed);
      }

      const taskId = taskSubmitResult.result.taskId;
      console.log('视频处理任务已提交，taskId:', taskId);

      // 2. 轮询查询视频处理任务状态（借鉴 Nebula1：每5秒查询一次）
      while (true) {
        await sleep(5000); // 每5秒查询一次

        try {
          const queryResult = await videoProcessService.queryTask(taskId);
          console.log('查询视频处理任务状态:', queryResult.result?.status);

          if (queryResult.result?.status === 'success') {
            // 视频处理成功（借鉴 Nebula1：使用 resizedVideoUrl）
            const resizedVideoUrl = queryResult.result.resizedVideoUrl;
            if (resizedVideoUrl) {
              setVideoUploadedUrl(resizedVideoUrl);
              // 借鉴 Nebula1：保存 taskId 用于后续视频掩码绘制
              const taskId = queryResult.result.taskId;
              setVideoProcessTaskId(taskId);
              setError(null);
              
              // 借鉴 Nebula1：上传成功后自动打开视频编辑器
              // 使用处理后的视频URL打开编辑器
              await new Promise(resolve => setTimeout(resolve, 100)); // 等待状态更新
              console.log('视频处理成功，准备打开编辑器，URL:', resizedVideoUrl, 'taskId:', taskId);
              setIsVideoEditorOpen(true);
            } else {
              throw new Error(t.errors.videoUrlMissing);
            }
            break;
          } else if (queryResult.result?.status === 'failed') {
            throw new Error(t.errors.videoProcessFailed);
          } else {
            // processing 或 pending 状态，继续轮询
            console.log('视频处理中，继续轮询...');
            continue;
          }
        } catch (error) {
          console.error('轮询查询任务失败:', error);
          throw error;
        }
      }
    } catch (err) {
      console.error('视频处理失败:', err);
      setError(err instanceof Error ? err.message : t.errors.videoProcessingFailed);
    } finally {
      setIsVideoUploading(false);
    }
  };

  // 处理图片上传完成 - 借鉴 Nebula1：先上传获取 fileId，然后验证，最后使用本地URL预览
  const handleImageUploadComplete = async (file: UploadedFile) => {
    if (!file.fileId) {
      setError(t.errors.imageUploadFailed);
      setIsImageUploading(false);
      return;
    }

    setError(null);

    // 借鉴 Nebula1：先保存 fileId
    setImageFileId(file.fileId);
    console.log('图片的 fileId:', file.fileId);

    // 借鉴 Nebula1：验证文件大小和分辨率（在上传完成后验证）
    if (!imageFile) {
      console.warn('imageFile 未设置，跳过验证');
      setIsImageUploading(false);
      return;
    }

    try {
      // 验证文件大小：Base64不超过5MB（考虑Base64编码会增加约33%大小）
      const maxSize = 5 * 1024 * 1024 * 0.75; // 实际文件大小限制约3.75MB，对应Base64后约5MB
      if (imageFile.size > maxSize) {
        setError(t.errors.imageSizeExceeded);
        setIsImageUploading(false);
        return;
      }

      // 验证分辨率
      const imageInfo = await new Promise<{ height: number; width: number }>(
        (resolve, reject) => {
          const img = new Image();
          img.addEventListener('load', () =>
            resolve({ width: img.width, height: img.height }),
          );
          img.onerror = reject;
          const localUrl = URL.createObjectURL(imageFile);
          img.src = localUrl;
        },
      );

      // 分辨率验证：最小128*128，最大4096*4096
      const minResolution = 128;
      const maxResolution = 4096;
      if (imageInfo.width < minResolution || imageInfo.height < minResolution) {
        setError(t.errors.imageResolutionTooSmall);
        setIsImageUploading(false);
        return;
      }
      if (imageInfo.width > maxResolution || imageInfo.height > maxResolution) {
        setError(t.errors.imageResolutionTooLarge);
        setIsImageUploading(false);
        return;
      }

      // 借鉴 Nebula1：使用本地URL预览（URL.createObjectURL）
      const localUrl = URL.createObjectURL(imageFile);
      setImageUrl(localUrl);
    } catch (err) {
      console.error('图片验证失败:', err);
      setError(err instanceof Error ? err.message : t.errors.imageValidationFailed);
      setIsImageUploading(false);
      return;
    }

    setIsImageUploading(false);
    setError(null);
  };

  // 处理图片开始上传 - 借鉴 Nebula1：先设置文件，上传在 UploadComponent 中自动触发
  const handleImageFileSelectedWithUpload = async (file: File) => {
    setIsImageUploading(true);
    setImageFile(file); // 先保存文件，供 handleImageUploadComplete 使用
    setGeneratedVideoUrl(null);
    setError(null);
    // 借鉴 Nebula1：不在这里验证，验证在 handleImageUploadComplete 中进行
  };

  // 处理视频文件选择 - 借鉴 Nebula1 的逻辑（先设置文件，验证在提交任务后进行）
  const handleVideoFileSelected = async (file: File) => {
    setVideoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoUrl(objectUrl);
    setGeneratedVideoUrl(null);
    setVideoProcessTaskId(null);
    setVideoUploadedUrl(null);
    setError(null);

    // 借鉴 Nebula1：先设置文件，验证在提交任务后进行（验证失败只显示错误，不阻止上传）
    // 这里只做基本的文件类型检查，详细验证在 handleVideoUploadComplete 中进行
    try {
      // 基本格式检查（不阻止上传）
      const allowedTypes = ['video/mp4', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        setError(t.errors.videoFormatNotSupported);
      }

      // 基本大小检查（不阻止上传）
      const maxSize = 200 * 1024 * 1024; // 200MB（借鉴 Nebula1：实际是500MB，但这里用200MB）
      if (file.size > maxSize) {
        setError(t.errors.videoSizeExceeded);
      }

      // 创建视频元素获取元数据（用于计算积分）- 借鉴 Nebula1
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.src = objectUrl;

      // 等待元数据加载（设置10秒超时）- 借鉴 Nebula1
      await new Promise<void>((resolve, reject) => {
        const loadHandler = () => {
          videoElement.removeEventListener('loadedmetadata', loadHandler);
          resolve();
        };
        const errorHandler = () => {
          videoElement.removeEventListener('error', errorHandler);
          reject(new Error(t.errors.videoMetadataLoadFailed));
        };
        videoElement.addEventListener('loadedmetadata', loadHandler);
        videoElement.addEventListener('error', errorHandler);
        setTimeout(() => {
          reject(new Error(t.errors.videoMetadataLoadTimeout));
        }, 10_000);
      });

      // 借鉴 Nebula1：在文件选择时进行详细验证（验证失败只显示错误，不阻止上传）
      const duration = videoElement.duration;
      
      // 验证视频时长（借鉴 Nebula1：不超过60秒）
      if (duration > 60) {
        setError(t.errors.videoDurationExceeded);
      }

      // 借鉴 Nebula1：验证通过后计算积分
      setCountPoints(Number((points * Math.ceil(duration)).toFixed(1)));

      // 验证分辨率（借鉴 Nebula1：不超过1080P：最长边≤1920，最短边≤1080）
      const { videoWidth: width, videoHeight: height } = videoElement;
      const maxLongSide = 1920;
      const maxShortSide = 1080;
      const longSide = Math.max(width, height);
      const shortSide = Math.min(width, height);

      if (longSide > maxLongSide || shortSide > maxShortSide) {
        setError(t.errors.videoResolutionExceeded);
      }

      // 验证帧率（借鉴 Nebula1：不超过30fps）
      let fps = 0;
      if (typeof videoElement.getVideoPlaybackQuality === 'function') {
        const quality = videoElement.getVideoPlaybackQuality();
        if (
          quality.creationTime &&
          quality.totalVideoFrames &&
          quality.creationTime > 0
        ) {
          fps = Math.round(quality.totalVideoFrames / quality.creationTime);
        }
      }

      const isFpsOverLimit =
        fps > 30 ||
        (file.size > 1024 * 1024 && file.size / (duration * 30) < 1000);

      if (isFpsOverLimit) {
        setError(t.errors.videoFpsExceeded);
      }

      // 释放临时元数据URL
      URL.revokeObjectURL(videoElement.src);
    } catch (err) {
      console.error('视频验证失败:', err);
      setError(
        err instanceof Error
          ? err.message
          : t.errors.videoLoadFailed
      );
      // 即使验证失败，也允许继续上传（借鉴 Nebula1 的逻辑）
    }
  };

  // 处理图片文件选择 - 已移除，逻辑合并到 handleImageFileSelectedWithUpload 和 handleImageUploadComplete

  // 清除视频
  const handleClearVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoFile(null);
    setVideoUrl(null);
    setVideoUploadedUrl(null);
    setVideoProcessTaskId(null);
    setVideoMaskDrawingTaskId(null); // 清除视频掩码绘制任务ID
    setTrackingVideoPath(null); // 清除跟踪视频路径
    setGeneratedVideoUrl(null);
    setError(null);
    setCountPoints(0); // 清除积分
  };

  // 清除图片
  const handleClearImage = () => {
    setImageFile(null);
    setImageUrl(null);
    setImageFileId(null);
    setGeneratedVideoUrl(null);
    setError(null);
  };

  // 生成换脸视频 - 使用新的 API 流程
  const handleGenerate = async () => {
    // 借鉴 Nebula1：使用 videoMaskDrawingTaskId 而不是 videoProcessTaskId
    if (!videoMaskDrawingTaskId) {
        setError(t.errors.videoMaskDrawingRequired);
      return;
    }

    if (!imageFileId) {
      setError(t.errors.imageRequired);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setLoadingMessage(t.buttons.generating);
    setProgress(0);
    setGeneratedVideoUrl(null);

    try {
      // 借鉴 Nebula1：使用 countPoints 或默认值
      const score = countPoints || 1;

      // 调用视频换脸API（新版本）- 借鉴 Nebula1：使用 videoMaskDrawingTaskId
      const result = await faceSwapService.swapVideoFace({
        videoMaskDrawingTaskId: videoMaskDrawingTaskId,
        modelImageFileId: imageFileId,
        score: score,
        onProgress: (prog) => {
          setProgress(prog);
        },
      });
      
      setGeneratedVideoUrl(result.videoUrl);
      setLoadingMessage('');
      setProgress(100);
    } catch (err) {
      console.error('Video face swap error:', err);
      setError(
        err instanceof Error ? err.message : t.errors.generateFailed
      );
      setLoadingMessage('');
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  // 检查是否可以生成 - 借鉴 Nebula1：使用 videoMaskDrawingTaskId
  const isGenerateDisabled =
    isGenerating ||
    isVideoUploading ||
    !videoMaskDrawingTaskId ||
    !imageFileId;

  return (
    <div className="h-full p-6 bg-gray-100">
      {/* 页面头部 */}
      {/* <div className="mb-6 text-center">
        <h1 
          className="mb-2 text-3xl font-bold"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          AI 视频换脸
        </h1>
        <p className="text-gray-600">
          上传视频和参考图片，让 AI 为您生成换脸视频
        </p>
      </div> */}

      {/* 主内容区域 - 左右分栏布局 */}
      <div className="flex gap-8 w-full max-w-[1400px] mx-auto" style={{ height: '89vh' }}>
         {/* 左侧控制面板 */}
         <div className="w-[350px] bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl h-full flex flex-col overflow-hidden">
           {/* 控制区域标题 */}
           <div className="p-6 pb-4 text-center border-b border-gray-200 flex-shrink-0">
             <h2 
               className="text-2xl font-bold"
               style={{
                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                 WebkitBackgroundClip: 'text',
                 WebkitTextFillColor: 'transparent',
                 backgroundClip: 'text'
               }}
               >
               {t.title}
             </h2>
           </div>
           
           {/* 内容区域 - 可滚动 */}
           <div className="flex-1 overflow-y-auto p-6">

          {/* 视频上传区域 */}
          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              {t.uploadVideo.title}
            </h3>
            <div className="min-h-[200px] relative">
              {isVideoUploading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-20 rounded-xl backdrop-blur-[1px]">
                  <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t.uploadVideo.uploading}</span>
                  </div>
                </div>
              )}
              <UploadComponent
                accept="video/*"
                uploadType="tv" // 使用 TV OSS 方式上传，获取 fileId
                onUploadComplete={handleVideoUploadComplete}
                onFileSelected={handleVideoFileSelectedWithUpload}
                onClear={handleClearVideo}
                showPreview={true}
                immediate={true} // 选择文件后立即上传
                maxSize={200}
                onError={(err) => {
                  setError(err.message);
                  setIsVideoUploading(false);
                }}
                // 借鉴 Nebula1：如果有 trackingVideoPath 则显示它，否则显示 videoUploadedUrl，最后才显示本地 videoUrl
                initialUrl={trackingVideoPath || videoUploadedUrl || videoUrl || ''}
                className="min-h-[200px]"
                disabled={isVideoUploading} // 上传中时禁用，隐藏关闭按钮
              >
                {!videoUrl && !videoUploadedUrl && !trackingVideoPath && (
                  <div className="text-center p-6">
                    <div className="text-4xl mb-2">🎬</div>
                    <p className="text-gray-700 mb-2">{t.uploadVideo.clickOrDrag}</p>
                    <span className="text-gray-500 text-sm">
                      {t.uploadVideo.formats}<br />
                      {t.uploadVideo.duration}<br />
                      {t.uploadVideo.resolution}<br />
                      {t.uploadVideo.size}
                    </span>
                  </div>
                )}
              </UploadComponent>
              {/* 编辑按钮 - 借鉴 Nebula1：只要有视频就可以编辑，上传中时不显示 */}
              {(videoUrl || videoUploadedUrl || trackingVideoPath) && !isVideoUploading && (
                <button
                  onClick={() => setIsVideoEditorOpen(true)}
                  className="absolute -top-5 -right-5 w-9 h-9 rounded-full bg-indigo-600 border-2 border-white text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 z-10"
                  title={t.uploadVideo.editVideo}
                >
                  <Edit3 size={18} />
                </button>
              )}
            </div>
          </div>

          {/* 图片上传区域 */}
          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              {t.uploadImage.title}
            </h3>
            <div className="min-h-[200px] relative">
              {isImageUploading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-20 rounded-xl backdrop-blur-[1px]">
                  <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t.uploadImage.uploading}</span>
                  </div>
                </div>
              )}
              <UploadComponent
                accept="image/*"
                uploadType="tv" // 使用 TV OSS 方式上传，获取 fileId
                onUploadComplete={handleImageUploadComplete}
                onFileSelected={handleImageFileSelectedWithUpload}
                onClear={handleClearImage}
                showPreview={true}
                immediate={true} // 借鉴 Nebula1：选择文件后立即上传
                maxSize={5}
                onError={(err) => {
                  setError(err.message);
                  setIsImageUploading(false);
                }}
                className="min-h-[200px]"
                disabled={isImageUploading} // 上传中时禁用，隐藏关闭按钮
              >
                {!imageUrl && (
                  <div className="text-center p-6">
                    <div className="text-4xl mb-2">🖼️</div>
                    <p className="text-gray-700 mb-2">{t.uploadImage.clickOrDrag}</p>
                    <span className="text-gray-500 text-sm">
                      {t.uploadImage.formats}<br />
                      {t.uploadImage.resolution}<br />
                      {t.uploadImage.size}
                    </span>
                  </div>
                )}
              </UploadComponent>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4">
              <ErrorMessage message={error} />
            </div>
          )}

             {/* 操作按钮区域 */}
             <div className="pt-4">
               {/* 生成按钮 */}
               <button
                 onClick={handleGenerate}
                 disabled={isGenerateDisabled}
                 className="w-full py-3 px-6 font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
               >
                 {isGenerating ? (
                   <>
                     <Sparkles className="h-5 w-5 animate-spin" />
                     <span>{t.buttons.generating}</span>
                   </>
                 ) : (
                   <>
                     {/* 借鉴 Nebula1：显示积分图标和数值 */}
                     <SvgPointsIcon className="h-5 w-5 mr-1" />
                     <span>{countPoints === 0 ? points : countPoints}</span>
                     <span className="ml-2">{t.buttons.generateVideo}</span>
                   </>
                 )}
               </button>
               
               {/* 清除按钮 */}
               <button
                 className="w-full mt-3 py-2 px-4 font-medium rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                 onClick={() => {
                   handleClearVideo();
                   handleClearImage();
                   setGeneratedVideoUrl(null);
                   setImportStatus(false); // 清除导入状态
                 }}
               >
                 {t.buttons.clearResult}
               </button>
             </div>
           </div>
         </div>

        {/* 右侧预览区域 */}
        <div className="flex-1">
          <div className="p-10 bg-gradient-to-br from-white/98 to-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20">
            {/* 结果标题 */}
            <div className="flex items-center justify-center mb-8 pb-6 border-b border-gray-200">
              <h3 
                className="text-2xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {t.result.title}
              </h3>
            </div>

            {/* 空状态 */}
            {!isGenerating && !generatedVideoUrl && (
              <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                <div className="text-6xl mb-4">🎨</div>
                <p className="text-lg">{t.result.emptyState}</p>
              </div>
            )}

            {/* 生成中状态 */}
            {isGenerating && (
              <div className="flex flex-col items-center justify-center h-[400px] gap-6">
                <LoadingSpinner message={loadingMessage} />
                {progress > 0 && (
                  <div className="w-full max-w-md">
                    <div className="bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-2">{progress}%</p>
                  </div>
                )}
              </div>
            )}

            {/* 生成的视频 */}
            {generatedVideoUrl && (
              <div className="space-y-4">
                <div className="w-full flex items-center justify-center bg-black rounded-xl overflow-hidden">
                  <video
                    src={generatedVideoUrl}
                    controls
                    className="w-full h-[500px] object-contain rounded-xl"
                  />
                </div>
                
                {/* 操作按钮 */}
                <div className="flex justify-between gap-4 mt-4">
                  <a
                    href={generatedVideoUrl}
                    download
                    className="flex-1 py-3 px-4 font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-center"
                  >
                    {t.result.downloadVideo}
                  </a>
                  <button 
                    onClick={() => {
                      // 借鉴 Nebula1：如果已导入，显示提示
                      if (importStatus) {
                        toast.success(t.result.importedToast);
                        return;
                      }
                      setIsAddMaterialModalOpen(true);
                    }}
                    className="flex-1 py-3 px-4 font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                  >
                    {t.result.importMaterial}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 视频编辑器模态框 - 借鉴 Nebula1：使用处理后的视频URL，如果有 trackingVideoPath 则使用它 */}
      {videoUploadedUrl && (
        <VideoEditingModal
          isOpen={isVideoEditorOpen}
          onClose={() => setIsVideoEditorOpen(false)}
          videoUrl={trackingVideoPath || videoUploadedUrl} // 借鉴 Nebula1：如果有 trackingVideoPath 则使用它
          videoProcessTaskId={videoProcessTaskId || undefined}
          onSave={(markers) => {
            setVideoMarkers(markers);
            console.log('保存的视频标记点:', markers);
          }}
          onVideoMaskSuccess={(data) => {
            // 借鉴 Nebula1：视频掩码绘制成功后，更新视频URL和任务ID
            console.log('视频掩码绘制成功:', data);
            // 使用 trackingVideoPath 更新视频URL（借鉴 Nebula1：video.url = data.trackingVideoPath）
            setVideoUploadedUrl(data.trackingVideoPath);
            setTrackingVideoPath(data.trackingVideoPath);
            // 保存 videoMaskDrawingTaskId（借鉴 Nebula1：queryTaskTaskId.value = data.taskId）
            setVideoMaskDrawingTaskId(data.taskId);
            setIsVideoEditorOpen(false);
          }}
        />
      )}

      {/* 导入素材模态框 - 借鉴 Nebula1 */}
      <AddMaterialModal
        isOpen={isAddMaterialModalOpen}
        onClose={() => setIsAddMaterialModalOpen(false)}
        onSuccess={() => {
          setIsAddMaterialModalOpen(false);
          setImportStatus(true); // 标记为已导入
        }}
        initialData={{
          assetUrl: generatedVideoUrl || '', // 借鉴 Nebula1：assetUrl: videoData.value
          assetType: 15, // 借鉴 Nebula1：第二个参数 '15' 表示视频类型
        }}
        disableAssetTypeSelection={true} // 禁用素材类型选择，使用预设的类型
        isImportMode={true}
      />
    </div>
  );
};

export default AiFaceSwapPage;

