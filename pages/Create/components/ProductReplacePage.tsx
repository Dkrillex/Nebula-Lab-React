import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader, X, Play, Download, RotateCcw, Image as ImageIcon, Video, Upload, Check } from 'lucide-react';
import { avatarService, Voice, Caption } from '../../../services/avatarService';
import { useProductAvatarStore } from '../../../stores/productAvatarStore';
import { useAuthStore } from '../../../stores/authStore';
import VoiceModal from './VoiceModal';
import CaptionModal from './CaptionModal';
import ImagePreviewModal from './ImagePreviewModal';
import AddMaterialModal from '../../../components/AddMaterialModal';
import { uploadTVFile } from '@/utils/upload';
import toast from 'react-hot-toast';

interface ProductReplaceResult {
  key: string;
  url: string;
  imageId?: string;
  faceExistence?: boolean;
}

interface ImageGenerationState {
  mode: 'lite' | 'pro' | 'avatar2';
  productReplaceResultKey: string;
  replaceProductTaskImageId?: string;
  ttsText: string;
  voiceoverId?: string;
  voiceId?: string;
  scriptMode?: 'text' | 'audio';
  audioFileId?: string;
  captionId?: string;
}

interface ProductReplacePageProps {
  t?: any;
}

const ProductReplacePage: React.FC<ProductReplacePageProps> = ({ t }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const taskId = searchParams.get('taskId') || '';
  const isV2 = searchParams.get('v2') === 'true';
  const productAvatarStore = useProductAvatarStore();
  const queryParams = productAvatarStore.getData(taskId);
  const { user } = useAuthStore();

  // States
  const [pageLoading, setPageLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tip, setTip] = useState(t?.tip || '合成图片中大约需要1~2分钟...');
  const [taskResult, setTaskResult] = useState<any>(null);
  const [selectImage, setSelectImage] = useState<ProductReplaceResult | null>(null);
  const [image2VideoResult, setImage2VideoResult] = useState<any>(null);
  
  // Image generation state
  const [imageGeneration, setImageGeneration] = useState<ImageGenerationState>({
    mode: 'lite',
    productReplaceResultKey: '',
    ttsText: t?.ttsText || '欢迎来到NebulaLab，这是一个终极的人工智能视频编辑平台，它彻底改变了您创建引人注目的视频的方式。无论您是营销人员、内容创作者还是企业主，NebulaAds都可以轻松地将您的原始想法转化为专业级视频。',
    voiceoverId: '',
    scriptMode: 'text',
  });

  // Voice and Caption
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [selectedCaption, setSelectedCaption] = useState<Caption | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Audio upload
  const [audioFile, setAudioFile] = useState<{ fileId: string; fileName: string; url: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Material modal
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [addMaterialsData, setAddMaterialsData] = useState<any>({
    assetUrl: '',
    assetId: '',
    assetName: '',
  });

  // Timers
  const loopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCheckedTaskIdRef = useRef(false);

  // Calculate points
  const pointsTip = () => {
    switch (imageGeneration.mode) {
      case 'lite':
        return 3;
      case 'pro':
        return 6;
      case 'avatar2':
        return 8;
      default:
        return 3;
    }
  };

  const textareaMaxLength = () => {
    switch (imageGeneration.mode) {
      case 'lite':
      case 'pro':
        return 2000;
      case 'avatar2':
        return 90;
      default:
        return 2000;
    }
  };

  // Poll image generation task
  const pollTask = async (taskId: string) => {
    const interval = 5000;
    let attempts = 0;
    const maxAttempts = 100;

    const check = async () => {
      try {
        if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
        setPageLoading(true);

        let res: any;
        if (isV2) {
          res = await avatarService.queryV2ImageReplaceTask(taskId);
        } else {
          res = await avatarService.queryImageReplaceTask(taskId);
        }

        const resultData = (res as any).result || res;
        const status = resultData?.taskStatus || resultData?.status;

        if (status === 'running' || status === 'init') {
          // Update progress - ensure it doesn't exceed 99%
          setProgress(prev => {
            if (prev < 80) {
              const maxIncrement = Math.min(80 - prev, Math.floor(Math.random() * 20) + 1);
              return Math.min(prev + maxIncrement, 80);
            } else if (prev < 99) {
              const maxIncrement = Math.min(99 - prev, Math.floor(Math.random() * 10) + 1);
              return Math.min(prev + maxIncrement, 99);
            }
            return prev; // Don't exceed 99
          });

          attempts++;
          if (attempts < maxAttempts) {
            loopTimerRef.current = setTimeout(check, interval);
          } else {
            toast.error('任务超时');
            setPageLoading(false);
          }
        } else if (status === 'success') {
          setProgress(100);
          
          if (isV2) {
            // V2 result processing
            const replaceResult = resultData.replaceProductResult || [];
            const productReplaceResult = replaceResult.map((item: any) => ({
              key: item.imageId,
              url: item.url,
              imageId: item.imageId,
              faceExistence: item.faceExistence,
            }));

            setTaskResult({
              ...resultData,
              taskStatus: 'success',
              productReplaceResult,
            });

            if (replaceResult.length > 0) {
              setSelectImage(replaceResult[0]);
              setImageGeneration(prev => ({
                ...prev,
                replaceProductTaskImageId: replaceResult[0].imageId,
                productReplaceResultKey: replaceResult[0].imageId,
              }));

              if (!replaceResult[0].faceExistence) {
                setImageGeneration(prev => ({ ...prev, mode: 'avatar2' }));
              }
            }
          } else {
            // V1 result processing
            const productReplaceResult = resultData.productReplaceResult || [];
            setTaskResult(resultData);

            if (productReplaceResult.length > 0) {
              setSelectImage(productReplaceResult[0]);
              setImageGeneration(prev => ({
                ...prev,
                productReplaceResultKey: productReplaceResult[0].key,
              }));
            }
          }

          setPageLoading(false);
        } else {
          setTaskResult({
            taskStatus: 'fail',
            errorMsg: resultData.errorMsg || resultData.message || '任务失败',
          });
          setPageLoading(false);
        }
      } catch (error) {
        console.error(error);
        attempts++;
        if (attempts < maxAttempts) {
          loopTimerRef.current = setTimeout(check, interval);
        } else {
          toast.error('查询任务状态失败');
          setPageLoading(false);
        }
      }
    };

    check();
  };

  // Poll video generation task
  const pollImage2Video = async (videoTaskId: string) => {
    const interval = 5000;
    let attempts = 0;
    const maxAttempts = 100;

    const check = async () => {
      try {
        if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
        setPageLoading(true);
        setTip(t?.tip1 || '合成视频中大约需要1~2分钟...');

        // Update progress BEFORE querying (like old system)
        setProgress(prev => {
          if (prev < 80) {
            const maxIncrement = Math.min(80 - prev, Math.floor(Math.random() * 20) + 1);
            return Math.min(prev + maxIncrement, 80);
          } else if (prev < 90) {
            const maxIncrement = Math.min(90 - prev, Math.floor(Math.random() * 10) + 1);
            return Math.min(prev + maxIncrement, 90);
          }
          return prev; // Don't exceed 90
        });

        let res: any;
        if (isV2) {
          res = await avatarService.queryV2Image2Video(videoTaskId);
        } else {
          res = await avatarService.queryImage2Video(videoTaskId);
        }

        const resultData = (res as any).result || res;
        const status = resultData?.taskStatus || resultData?.status;

        if (status === 'running' || status === 'init') {
          attempts++;
          if (attempts < maxAttempts) {
            loopTimerRef.current = setTimeout(check, interval);
          } else {
            toast.error('任务超时');
            setPageLoading(false);
          }
        } else if (status === 'success') {
          setProgress(100);
          setPageLoading(false);
          
          const videoUrl = resultData.finishedVideoUrl || resultData.videoUrl || resultData.aiAvatar?.previewVideoUrl;
          setImage2VideoResult({
            ...resultData,
            previewVideoUrl: videoUrl,
          });

          setAddMaterialsData(prev => ({
            ...prev,
            assetUrl: videoUrl,
            assetId: videoTaskId,
          }));

          // Deduct points after video generation success
          try {
            await avatarService.deductPoints({
              deductPoints: pointsTip(),
              systemId: 1,
              userId: user?.userId,
            });
          } catch (error) {
            console.error('Failed to deduct points:', error);
            // Don't show error to user as video is already generated
          }
        } else {
          toast.error(resultData.errorMsg || t?.errors?.generateFailed || '视频生成失败');
          setPageLoading(false);
        }
      } catch (error) {
        console.error(error);
        attempts++;
        if (attempts < maxAttempts) {
          loopTimerRef.current = setTimeout(check, interval);
        } else {
          toast.error('查询任务状态失败');
          setPageLoading(false);
        }
      }
    };

    check();
  };

  // Handle regenerate
  const handleRegenerate = async () => {
    if (!queryParams) {
      toast.error('缺少任务参数');
      return;
    }

    setProgress(0);
    setPageLoading(true);
    setTaskResult(null);
    setSelectImage(null);

    try {
      let params: any;
      if (isV2) {
        params = {
          generateImageMode: queryParams.generateImageMode || 'auto',
          avatarId: queryParams.avatarId || '',
          templateImageFileId: queryParams.templateImageFileId || '',
          productImageWithoutBackgroundFileId: queryParams.productImageWithoutBackgroundFileId || '',
          userFaceImageFileId: queryParams.userFaceImageFileId || '',
          location: queryParams.location,
        };
      } else {
        params = {
          avatarId: queryParams.avatarId || '',
          templateImageFileId: queryParams.templateImageFileId || '',
          productImageFileId: queryParams.productImageFileId || '',
          userFaceImageFileId: queryParams.userFaceImageFileId || '',
          imageEditPrompt: queryParams.imageEditPrompt || '',
          productSize: queryParams.productSize || '2',
        };
      }

      let res: any;
      if (isV2) {
        res = await avatarService.submitV2ImageReplaceTask(params);
      } else {
        res = await avatarService.submitImageReplaceTask(params);
      }

      const resultData = (res as any).result || res;
      if (resultData?.taskId) {
        productAvatarStore.setData(resultData.taskId, { ...params, taskId: resultData.taskId });
        pollTask(resultData.taskId);
      } else {
        throw new Error((res as any).msg || (res as any).message || '任务提交失败');
      }
    } catch (error: any) {
      toast.error(error.message || '重新生成失败');
      setPageLoading(false);
    }
  };

  // Handle image to video submit
  const handleImage2VideoSubmit = async () => {
    if (isV2) {
      if (imageGeneration.scriptMode === 'text' && !imageGeneration.voiceId) {
        toast.error(t?.selectVoiceFirst || '请选择音色');
        return;
      }
      if (imageGeneration.scriptMode === 'audio' && !audioFile) {
        toast.error(t?.selectAudioFirst || '请选择音频文件');
        return;
      }
    } else {
      if (!imageGeneration.voiceoverId) {
        toast.error(t?.selectVoiceFirst || '请选择合成视频音色');
        return;
      }
    }

    try {
      setProgress(0);
        setPageLoading(true);
        setTip(t?.tip1 || '合成视频中大约需要1~2分钟...');

      let params: any;
      if (isV2) {
        params = {
          replaceProductTaskImageId: imageGeneration.replaceProductTaskImageId || imageGeneration.productReplaceResultKey,
          mode: imageGeneration.mode,
          scriptMode: imageGeneration.scriptMode || 'text',
          ttsText: imageGeneration.scriptMode === 'text' ? imageGeneration.ttsText : undefined,
          voiceId: imageGeneration.voiceId,
          audioFileId: imageGeneration.scriptMode === 'audio' ? audioFile?.fileId : undefined,
          captionId: imageGeneration.captionId,
          score: String(pointsTip()),
        };
      } else {
        params = {
          image2VideoPrompt: '',
          mode: imageGeneration.mode,
          productReplaceResultKey: imageGeneration.productReplaceResultKey,
          score: pointsTip(),
          ttsText: imageGeneration.ttsText,
          voiceoverId: imageGeneration.voiceoverId,
        };
      }

      let res: any;
      if (isV2) {
        res = await avatarService.submitV2Image2Video(params);
      } else {
        res = await avatarService.submitImage2Video(params);
      }

      const resultData = (res as any).result || res;
      if (resultData?.taskId) {
        pollImage2Video(resultData.taskId);
      } else {
        throw new Error((res as any).msg || (res as any).message || '任务提交失败');
      }
    } catch (error: any) {
      toast.error(error.message || '视频生成失败');
      setPageLoading(false);
    }
  };

  // Handle audio upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileChange(files[0]);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await handleFileChange(files[0]);
    }
  };

  const handleFileChange = async (file: File) => {
    if (!file) return;

    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('不支持的文件格式，请选择 MP3 或 WAV 文件');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('文件大小不能超过50MB');
      return;
    }

    try {
      const uploadedFile = await uploadTVFile(file);
      setAudioFile({
        fileId: uploadedFile.fileId,
        fileName: file.name,
        url: URL.createObjectURL(file),
      });
      setImageGeneration(prev => ({
        ...prev,
        audioFileId: uploadedFile.fileId,
        scriptMode: 'audio',
      }));
      toast.success('文件上传成功');
    } catch (error) {
      console.error('文件上传失败:', error);
      toast.error('文件上传失败，请重试');
    }
  };

  // Handle image preview
  const handlePreviewImage = (image: ProductReplaceResult) => {
    setPreviewImageUrl(image.url);
    setShowImagePreview(true);
  };

  // Handle image select
  const handleSelectImage = (image: ProductReplaceResult) => {
    setSelectImage(image);
    setImageGeneration(prev => ({
      ...prev,
      productReplaceResultKey: image.key,
      replaceProductTaskImageId: image.imageId,
    }));

    if (isV2 && !image.faceExistence) {
      setImageGeneration(prev => ({ ...prev, mode: 'avatar2' }));
    }
  };

  // Warn once if taskId is missing
  useEffect(() => {
    if (hasCheckedTaskIdRef.current) return;
    hasCheckedTaskIdRef.current = true;

    if (!taskId) {
      toast.error('缺少任务ID');
      navigate('/create?tool=digitalHuman');
    }
  }, [taskId, navigate]);

  // Initialize polling while taskId exists
  useEffect(() => {
    if (!taskId) return;

    pollTask(taskId);

    return () => {
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [taskId, isV2]);

  return (
    <div className="h-full min-h-screen bg-white dark:bg-gray-900 p-4 md:p-6 flex flex-col">
      {/* Header */}
      {!image2VideoResult && (
        <div className="text-center mb-8 shrink-0">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            {t?.pageTitle || '产品 + AI数字人合成'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            {t?.pageDescription || 'AI正在为您生成专业的产品展示视频，请耐心等待精彩效果'}
          </p>
        </div>
      )}

      {/* Loading State */}
      {pageLoading && (
        <div className="flex flex-col items-center justify-center flex-1 bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <div className="text-6xl mb-6">🎬</div>
          <div className="text-xl font-bold text-gray-800 mb-6">{tip}</div>
          <div className="w-full max-w-md">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-2">
              <div
                className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-center text-gray-600 font-semibold">{progress}%</div>
          </div>
        </div>
      )}

      {/* Error State */}
      {!pageLoading && taskResult?.taskStatus === 'fail' && (
        <div className="flex flex-col items-center justify-center flex-1 bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <div className="text-6xl mb-6">❌</div>
          <div className="text-xl font-bold text-gray-800 mb-6">{taskResult.errorMsg}</div>
          <button
            onClick={handleRegenerate}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            {t?.regenerate || '重新生成'}
          </button>
        </div>
      )}

      {/* Image Generation Success - Before Video */}
      {!pageLoading && taskResult?.taskStatus === 'success' && !image2VideoResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto flex-1 overflow-y-auto">
          {/* Left: Image Selection */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{t?.panelTitle || '查看生成结果'}</h3>
              <p className="text-gray-600">
                {t?.panelDescription || 'Nebula Lab为您生成了产品数字人的图片,请结合文案进行驱动视频'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {taskResult.productReplaceResult?.map((img: ProductReplaceResult, index: number) => (
                <div
                  key={img.key}
                  onClick={() => handleSelectImage(img)}
                  className={`relative aspect-[9/16] max-h-[400px] rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                    selectImage?.key === img.key
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`生成结果${index + 1}`}
                    className="w-full h-full object-contain"
                    onClick={() => handlePreviewImage(img)}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <span className="text-white text-sm font-medium">
                      {index === 0 ? (t?.overlayText1 || '版本 1') : (t?.overlayText2 || '版本 2')}
                    </span>
                  </div>
                  {selectImage?.key === img.key && (
                    <div className="absolute top-2 right-2 bg-indigo-600 rounded-full p-1">
                      <Check size={16} className="text-white" />
                    </div>
                  )}
                </div>
              ))}

              {(!taskResult.productReplaceResult || taskResult.productReplaceResult.length < 2) && (
                <div className="relative aspect-[9/16] rounded-xl overflow-hidden border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50">
                  <div className="text-4xl mb-2">🔄</div>
                  <p className="text-sm text-gray-600 mb-4">{t?.regenerateText || '生成更多版本'}</p>
                  <button
                    onClick={handleRegenerate}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
                  >
                    {t?.regenerate || '重新生成'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Video Config */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{t?.videoConfigTitle || '视频制作配置'}</h3>
              <p className="text-gray-600">{t?.videoConfigDescription || '配置您的视频参数和语音内容'}</p>
            </div>

            <div className="space-y-6">
              {/* Mode Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t?.modeLabel || '生成模式'}</label>
                <div className="space-y-2">
                  <label className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition ${
                    imageGeneration.mode === 'lite' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                  } ${isV2 && !selectImage?.faceExistence ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input
                      type="radio"
                      name="mode"
                      value="lite"
                      checked={imageGeneration.mode === 'lite'}
                      onChange={(e) => setImageGeneration(prev => ({ ...prev, mode: e.target.value as any }))}
                      disabled={isV2 && !selectImage?.faceExistence}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-medium">Lite Mode</div>
                      <div className="text-xs text-gray-500">{t?.modeDescLite || '快速生成，720p，最长60秒'}</div>
                    </div>
                  </label>
                  <label className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition ${
                    imageGeneration.mode === 'pro' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                  } ${isV2 && !selectImage?.faceExistence ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input
                      type="radio"
                      name="mode"
                      value="pro"
                      checked={imageGeneration.mode === 'pro'}
                      onChange={(e) => setImageGeneration(prev => ({ ...prev, mode: e.target.value as any }))}
                      disabled={isV2 && !selectImage?.faceExistence}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-medium">Pro Mode</div>
                      <div className="text-xs text-gray-500">{t?.modeDescPro || '高质量生成，1080p，最长60秒'}</div>
                    </div>
                  </label>
                  {isV2 && (
                    <label className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition ${
                      imageGeneration.mode === 'avatar2' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="mode"
                        value="avatar2"
                        checked={imageGeneration.mode === 'avatar2'}
                        onChange={(e) => setImageGeneration(prev => ({ ...prev, mode: e.target.value as any }))}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <div className="font-medium">Avatar Mode</div>
                        <div className="text-xs text-gray-500">{t?.modeDescAvatar2 || '质量最佳，1080p，最长28秒'}</div>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Script Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t?.scriptLabel || 'AI配音文案'}</label>
                {isV2 && (
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setImageGeneration(prev => ({ ...prev, scriptMode: 'text' }))}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                        imageGeneration.scriptMode === 'text'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      文本模式
                    </button>
                    <button
                      onClick={() => setImageGeneration(prev => ({ ...prev, scriptMode: 'audio' }))}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                        imageGeneration.scriptMode === 'audio'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      音频模式
                    </button>
                  </div>
                )}

                {(imageGeneration.scriptMode === 'text' || !isV2) && (
                  <div>
                    <textarea
                      value={imageGeneration.ttsText}
                      onChange={(e) => setImageGeneration(prev => ({ ...prev, ttsText: e.target.value }))}
                      placeholder={t?.scriptPlaceholder || '请输入需要AI配音的文案内容...'}
                      className="w-full h-32 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      maxLength={textareaMaxLength()}
                    />
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {imageGeneration.ttsText.length}/{textareaMaxLength()}
                    </div>
                  </div>
                )}

                {isV2 && imageGeneration.scriptMode === 'audio' && (
                  <div>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                        isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
                      }`}
                      onDrop={handleDrop}
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".mp3,.wav"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="text-4xl mb-2">🎵</div>
                      <h3 className="font-medium mb-1">拖拽或点击上传音频文件</h3>
                      <p className="text-sm text-gray-500">支持 MP3、WAV 格式，文件大小不超过 50MB</p>
                    </div>

                    {audioFile && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🎵</span>
                          <span className="text-sm">{audioFile.fileName}</span>
                        </div>
                        <button
                          onClick={() => {
                            setAudioFile(null);
                            setImageGeneration(prev => ({ ...prev, audioFileId: undefined }));
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Caption Selection (V2 only) */}
              {isV2 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">{t?.captionLabel || '字幕样式'}</label>
                  <div className="flex items-center gap-3">
                    {selectedCaption && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <img src={selectedCaption.thumbnail} alt="Caption" className="w-12 h-12 object-cover rounded" />
                        <button
                          onClick={() => {
                            setSelectedCaption(null);
                            setImageGeneration(prev => ({ ...prev, captionId: undefined }));
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => setShowCaptionModal(true)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                    >
                      {selectedCaption ? (t?.changeCaption || '更换字幕样式') : (t?.selectCaption || '选择字幕样式')}
                    </button>
                  </div>
                </div>
              )}

              {/* Voice Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t?.voiceLabel || '音色选择'}</label>
                <div className="flex items-center gap-3">
                  {selectedVoice && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">{selectedVoice.voiceName}</span>
                      <button
                        onClick={() => {
                          setSelectedVoice(null);
                          setImageGeneration(prev => ({
                            ...prev,
                            voiceoverId: undefined,
                            voiceId: undefined,
                          }));
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setShowVoiceModal(true)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                  >
                    {selectedVoice ? (t?.changeVoice || '更换音色') : (t?.selectVoice || '选择音色')}
                  </button>
                </div>
              </div>

              {/* Generate Button */}
              <div>
                <button
                  onClick={handleImage2VideoSubmit}
                  disabled={!selectedVoice || (isV2 && imageGeneration.scriptMode === 'audio' && !audioFile)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span className="text-xl">💎</span>
                  {(t?.generateVideo || '消耗 {points} 积分制作视频').replace('{points}', String(pointsTip()))}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Result */}
      {image2VideoResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto flex-1 overflow-y-auto">
          {/* Left: Preview */}
          <div className="space-y-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{t?.originalMaterial || '原始素材'}</h3>
              <div className="aspect-[9/16] max-h-[400px] rounded-xl overflow-hidden bg-gray-100 mx-auto">
                <img
                  src={taskResult?.productReplaceResult?.[0]?.url}
                  alt="Original"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{t?.configInfo || '配置信息'}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t?.configMode || '生成模式:'}</span>
                  <span className="font-medium">
                    {imageGeneration.mode === 'lite' ? 'Lite Mode' : imageGeneration.mode === 'pro' ? 'Pro Mode' : 'Avatar Mode'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t?.configVoice || '音色:'}</span>
                  <span className="font-medium">{selectedVoice?.voiceName || (t?.notSelected || '未选择')}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t?.configScript || '文案:'}</span>
                  <div className="mt-1 p-2 bg-gray-50 rounded text-sm">{imageGeneration.ttsText}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Video Result */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{t?.resultTitle || '生成结果'}</h3>
              <p className="text-gray-600">{t?.resultDescription || '您的专业产品展示视频已制作完成'}</p>
            </div>

            <div className="aspect-[9/16] max-h-[600px] rounded-xl overflow-hidden bg-black mb-6 mx-auto">
              <video
                src={image2VideoResult.previewVideoUrl}
                controls
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => window.open(image2VideoResult.previewVideoUrl, '_blank')}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                <Download size={20} />
                {t?.exportVideo || '导出视频'}
              </button>
              <button
                onClick={() => setShowMaterialModal(true)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2"
              >
                <ImageIcon size={20} />
                {t?.addToMaterials || '添加到素材库'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <VoiceModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onSelect={(voice) => {
          setSelectedVoice(voice);
          if (isV2) {
            setImageGeneration(prev => ({ ...prev, voiceId: voice.voiceId }));
          } else {
            setImageGeneration(prev => ({ ...prev, voiceoverId: voice.voiceId }));
          }
          setShowVoiceModal(false);
        }}
        selectedVoiceId={selectedVoice?.voiceId}
      />

      <CaptionModal
        isOpen={showCaptionModal}
        onClose={() => setShowCaptionModal(false)}
        onSelect={(caption) => {
          setSelectedCaption(caption);
          setImageGeneration(prev => ({ ...prev, captionId: caption.captionId }));
          setShowCaptionModal(false);
        }}
        selectedCaptionId={selectedCaption?.captionId}
      />

      <ImagePreviewModal
        isOpen={showImagePreview}
        onClose={() => {
          setShowImagePreview(false);
          setPreviewImageUrl(null);
        }}
        imageUrl={previewImageUrl || ''}
      />

      <AddMaterialModal
        isOpen={showMaterialModal}
        onClose={() => setShowMaterialModal(false)}
        onSuccess={() => {
          toast.success('已添加到素材库');
          setShowMaterialModal(false);
        }}
        initialData={{
          assetName: `产品数字人视频_${new Date().toISOString().slice(0, 10)}`,
          assetTag: `产品数字人视频_${new Date().toISOString().slice(0, 10)}`,
          assetDesc: `产品数字人视频_${new Date().toISOString().slice(0, 10)}`,
          assetUrl: image2VideoResult?.previewVideoUrl || '',
          assetType: 2,
        }}
        disableAssetTypeSelection={true}
        isImportMode={true}
      />
    </div>
  );
};

export default ProductReplacePage;

