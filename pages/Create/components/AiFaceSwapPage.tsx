import React, { useState } from 'react';
import { Wand2, Sparkles, Edit3 } from 'lucide-react';
import UploadComponent from '../../../components/UploadComponent';
import { faceSwapService, videoProcessService } from '../../../services/faceSwapService';
import { UploadedFile } from '../../../services/avatarService';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import VideoEditingModal, { VideoMarker } from './VideoEditingModal';

const AiFaceSwapPage: React.FC = () => {
  // 视频状态
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoUploadedUrl, setVideoUploadedUrl] = useState<string | null>(null);
  const [videoProcessTaskId, setVideoProcessTaskId] = useState<string | null>(null); // 视频处理任务ID（用于后续视频掩码绘制）
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

  // 视频编辑器状态
  const [isVideoEditorOpen, setIsVideoEditorOpen] = useState(false);
  const [videoMarkers, setVideoMarkers] = useState<VideoMarker[]>([]);

  // 睡眠函数
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // 处理视频开始上传
  const handleVideoFileSelectedWithUpload = async (file: File) => {
    setIsVideoUploading(true);
    await handleVideoFileSelected(file);
  };

  // 处理视频上传完成 - 借鉴 Nebula1 的逻辑
  const handleVideoUploadComplete = async (file: UploadedFile) => {
    if (!file.fileId || !videoFile) {
      setError('视频上传失败，缺少文件ID');
      setIsVideoUploading(false);
      return;
    }

    setError(null);

    try {
      // 1. 提交视频处理任务
      const taskSubmitResult = await videoProcessService.taskSubmit({
        inputVideoFileId: file.fileId,
      });

      if (!taskSubmitResult.result?.taskId) {
        throw new Error('提交视频处理任务失败');
      }

      const taskId = taskSubmitResult.result.taskId;

      // 2. 轮询查询视频处理任务状态
      while (true) {
        await sleep(5000); // 每5秒查询一次

        try {
          const queryResult = await videoProcessService.queryTask(taskId);

          if (queryResult.result?.status === 'success') {
            // 视频处理成功
            const resizedVideoUrl = queryResult.result.resizedVideoUrl || queryResult.result.trackingVideoPath;
            if (resizedVideoUrl) {
              setVideoUploadedUrl(resizedVideoUrl);
              setVideoProcessTaskId(queryResult.result.taskId); // 保存任务ID用于后续视频掩码绘制
              setError(null);
            }
            break;
          } else if (queryResult.result?.status === 'failed') {
            throw new Error('视频处理失败');
          } else {
            // processing 或 pending 状态，继续轮询
            continue;
          }
        } catch (error) {
          console.error('轮询查询任务失败:', error);
          throw error;
        }
      }
    } catch (err) {
      console.error('视频处理失败:', err);
      setError(err instanceof Error ? err.message : '视频处理失败');
    } finally {
      setIsVideoUploading(false);
    }
  };

  // 处理图片上传完成 - 保存 fileId
  const handleImageUploadComplete = async (file: UploadedFile) => {
    if (!file.fileId) {
      setError('图片上传失败，缺少文件ID');
      setIsImageUploading(false);
      return;
    }
    setImageFileId(file.fileId);
    setIsImageUploading(false);
    setError(null);
  };

  // 处理图片开始上传
  const handleImageFileSelectedWithUpload = async (file: File) => {
    setIsImageUploading(true);
    await handleImageFileSelected(file);
  };

  // 处理视频文件选择
  const handleVideoFileSelected = async (file: File) => {
    setVideoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoUrl(objectUrl);
    setGeneratedVideoUrl(null);
    setVideoProcessTaskId(null);
    setVideoUploadedUrl(null);
    setError(null);

    // 借鉴 Nebula1：验证视频
    try {
      // 验证视频大小（不超过500MB）
      const maxSize = 500 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('视频大小不能超过500MB');
        return;
      }

      // 验证视频格式
      const allowedTypes = ['video/mp4', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        setError('视频格式仅支持MP4、MOV，建议使用MP4格式');
        return;
      }

      // 验证视频时长和分辨率
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.src = objectUrl;

      await new Promise<void>((resolve, reject) => {
        const loadHandler = () => {
          videoElement.removeEventListener('loadedmetadata', loadHandler);
          resolve();
        };
        const errorHandler = () => {
          videoElement.removeEventListener('error', errorHandler);
          reject(new Error('视频元数据加载失败'));
        };
        videoElement.addEventListener('loadedmetadata', loadHandler);
        videoElement.addEventListener('error', errorHandler);
        setTimeout(() => reject(new Error('视频元数据加载超时')), 10000);
      });

      // 验证时长（不超过60秒）
      if (videoElement.duration > 60) {
        setError('视频时长不能超过60秒');
        URL.revokeObjectURL(objectUrl);
        return;
      }

      // 验证分辨率（不超过1080P）
      const { videoWidth: width, videoHeight: height } = videoElement;
      const maxLongSide = 1920;
      const maxShortSide = 1080;
      const longSide = Math.max(width, height);
      const shortSide = Math.min(width, height);

      if (longSide > maxLongSide || shortSide > maxShortSide) {
        setError('视频分辨率不能超过1080P（最长边≤1920，最短边≤1080）');
        URL.revokeObjectURL(objectUrl);
        return;
      }
    } catch (err) {
      console.error('视频验证失败:', err);
      setError(err instanceof Error ? err.message : '视频验证失败');
    }
  };

  // 处理图片文件选择
  const handleImageFileSelected = async (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setImageUrl(dataUrl);
      setGeneratedVideoUrl(null);
      setError(null);
    };
    reader.readAsDataURL(file);

    // 借鉴 Nebula1：验证图片
    try {
      // 验证文件大小
      const maxSize = 5 * 1024 * 1024 * 0.75; // Base64编码后约5MB
      if (file.size > maxSize) {
        setError('图片大小经Base64编码后不能超过5MB');
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
          const localUrl = URL.createObjectURL(file);
          img.src = localUrl;
        },
      );

      const minResolution = 128;
      const maxResolution = 4096;
      if (imageInfo.width < minResolution || imageInfo.height < minResolution) {
        setError('图片分辨率不能小于128*128');
        return;
      }
      if (imageInfo.width > maxResolution || imageInfo.height > maxResolution) {
        setError('图片分辨率不能大于4096*4096');
        return;
      }
    } catch (err) {
      console.error('图片验证失败:', err);
      setError(err instanceof Error ? err.message : '图片验证失败');
    }
  };

  // 清除视频
  const handleClearVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoFile(null);
    setVideoUrl(null);
    setVideoUploadedUrl(null);
    setVideoProcessTaskId(null);
    setGeneratedVideoUrl(null);
    setError(null);
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
    if (!videoProcessTaskId) {
      setError('请先上传并处理参考视频');
      return;
    }

    if (!imageFileId) {
      setError('请上传参考图片');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setLoadingMessage('正在生成换脸视频...');
    setProgress(0);
    setGeneratedVideoUrl(null);

    try {
      // 计算积分（借鉴 Nebula1：0.3 积分/秒）
      let score = 1; // 默认积分
      if (videoFile) {
        const videoElement = document.createElement('video');
        videoElement.preload = 'metadata';
        const localUrl = URL.createObjectURL(videoFile);
        videoElement.src = localUrl;
        await new Promise<void>((resolve) => {
          videoElement.addEventListener('loadedmetadata', () => {
            const duration = videoElement.duration;
            score = Number((0.3 * Math.ceil(duration)).toFixed(1));
            URL.revokeObjectURL(localUrl);
            resolve();
          });
        });
      }

      // 调用视频换脸API（新版本）
      const result = await faceSwapService.swapVideoFace({
        videoMaskDrawingTaskId: videoProcessTaskId,
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
        err instanceof Error ? err.message : '生成失败，请重试'
      );
      setLoadingMessage('');
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  // 检查是否可以生成
  const isGenerateDisabled =
    isGenerating ||
    isVideoUploading ||
    !videoProcessTaskId ||
    !imageFileId;

  return (
    <div className="h-full max-h-[calc(100vh-40px)] overflow-y-auto overflow-x-hidden p-6 bg-gray-100">
      {/* 页面头部 */}
      <div className="mb-6 text-center">
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
      </div>

      {/* 主内容区域 - 左右分栏布局 */}
      <div className="flex gap-8 max-w-[1400px] mx-auto">
        {/* 左侧控制面板 */}
        <div className="w-[350px] p-6 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl">
          {/* 控制区域标题 */}
          <div className="mb-4 text-center">
            <h2 
              className="text-2xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              AI 视频换脸
            </h2>
          </div>

          {/* 视频上传区域 */}
          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              上传参考视频
            </h3>
            <div className="min-h-[200px] relative">
              {isVideoUploading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-20 rounded-xl backdrop-blur-[1px]">
                  <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">上传并处理视频中...</span>
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
                maxSize={500}
                onError={(err) => {
                  setError(err.message);
                  setIsVideoUploading(false);
                }}
                className="min-h-[200px]"
              >
                {!videoUrl && (
                  <div className="text-center p-6">
                    <div className="text-4xl mb-2">🎬</div>
                    <p className="text-gray-700 mb-2">点击或拖拽上传视频</p>
                    <span className="text-gray-500 text-sm">
                      MP4、MOV 格式<br />
                      时长≤60秒，帧率≤30fps<br />
                      分辨率≤1080P<br />
                      大小≤500MB
                    </span>
                  </div>
                )}
              </UploadComponent>
              {/* 编辑按钮 */}
              {videoUrl && videoUploadedUrl && (
                <button
                  onClick={() => setIsVideoEditorOpen(true)}
                  className="absolute -top-5 -right-5 w-9 h-9 rounded-full bg-blue-600 border-2 border-white text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-10"
                  title="编辑视频"
                >
                  <Edit3 size={18} />
                </button>
              )}
            </div>
          </div>

          {/* 图片上传区域 */}
          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              上传参考图片
            </h3>
            <div className="min-h-[200px]">
              {isImageUploading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-20 rounded-xl backdrop-blur-[1px]">
                  <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">上传图片中...</span>
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
                immediate={false}
                maxSize={5}
                onError={(err) => {
                  setError(err.message);
                  setIsImageUploading(false);
                }}
                className="min-h-[200px]"
              >
                {!imageUrl && (
                  <div className="text-center p-6">
                    <div className="text-4xl mb-2">🖼️</div>
                    <p className="text-gray-700 mb-2">点击或拖拽上传图片</p>
                    <span className="text-gray-500 text-sm">
                      jpg/jpeg、png 格式<br />
                      分辨率 128*128 - 4096*4096<br />
                      大小不超过 5MB
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
          <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-sm">
            {/* 生成按钮 */}
            <button
              onClick={handleGenerate}
              disabled={isGenerateDisabled}
              className="w-full py-3 px-6 font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-5 w-5 animate-spin" />
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5" />
                  <span>生成换脸视频</span>
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
              }}
            >
              清除结果
            </button>
          </div>
        </div>

        {/* 右侧预览区域 */}
        <div className="flex-1">
          <div className="p-10 bg-gradient-to-br from-white/98 to-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20">
            {/* 结果标题 */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
              <h3 
                className="text-2xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                生成结果
              </h3>
            </div>

            {/* 空状态 */}
            {!isGenerating && !generatedVideoUrl && (
              <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                <div className="text-6xl mb-4">🎨</div>
                <p className="text-lg">生成的视频将显示在这里</p>
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
                <video
                  src={generatedVideoUrl}
                  controls
                  className="w-full h-[500px] object-contain rounded-xl bg-black"
                />
                
                {/* 操作按钮 */}
                <div className="flex justify-between gap-4 mt-4">
                  <a
                    href={generatedVideoUrl}
                    download
                    className="flex-1 py-3 px-4 font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-center"
                  >
                    下载视频
                  </a>
                  <button className="flex-1 py-3 px-4 font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                    导入素材
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 视频编辑器模态框 */}
      {videoUrl && (
        <VideoEditingModal
          isOpen={isVideoEditorOpen}
          onClose={() => setIsVideoEditorOpen(false)}
          videoUrl={videoUrl}
          onSave={(markers) => {
            setVideoMarkers(markers);
            console.log('保存的视频标记点:', markers);
          }}
        />
      )}
    </div>
  );
};

export default AiFaceSwapPage;

