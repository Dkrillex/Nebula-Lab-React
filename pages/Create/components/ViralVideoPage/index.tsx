import React, { useState, useRef, useEffect } from 'react';
import { Upload, FolderOpen, Loader, X, CheckCircle2 } from 'lucide-react';
import { uploadService } from '../../../../services/uploadService';
import { assetsService, AdsAssetsVO } from '../../../../services/assetsService';
import { viralVideoService } from '../../../../services/viralVideoService';
import toast from 'react-hot-toast';
import BaseModal from '../../../../components/BaseModal';
import ImageEditModal from '../ImageEditModal';
import { downloadVideo } from '../../../../utils/videoUtils';
import { HomePage } from './HomePage';
import { MaterialsAndSellingPoints } from './MaterialsAndSellingPoints';
import { SelectScript } from './SelectScript';
import { EditStoryboard } from './EditStoryboard';
import { GenerateVideo } from './GenerateVideo';
import { useImageAnalysis } from './hooks/useImageAnalysis';
import { useVideoGeneration } from './hooks/useVideoGeneration';
import { useVideoMerge } from './hooks/useVideoMerge';
import { 
  ViralVideoPageProps, 
  UploadedImage, 
  ProductAnalysis, 
  ScriptOption, 
  Storyboard 
} from './types';

const ViralVideoPage: React.FC<ViralVideoPageProps> = ({ t }) => {
  const [step, setStep] = useState(0); // 0=首页, 1=素材与卖点, 2=选择脚本, 3=编辑分镜, 4=生成视频
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');
  
  // Step 2: 脚本相关状态
  const [availableScripts, setAvailableScripts] = useState<ScriptOption[]>([]);
  const [selectedScript, setSelectedScript] = useState<string>('');
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
  const [isGeneratingScripts, setIsGeneratingScripts] = useState(false);
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);

  // Step 3: 分镜编辑相关状态
  const [editedStoryboard, setEditedStoryboard] = useState<Storyboard | null>(null);

  // Step 1: 图片上传相关状态
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [portfolioAssets, setPortfolioAssets] = useState<AdsAssetsVO[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const defaultModel = 'qwen3-omni-flash';
  const MIN_IMAGES = 4;
  const MAX_IMAGES = 10;
  const [showEditModal, setShowEditModal] = useState(false);
  const [videoId, setVideoId] = useState<string>('');

  // 使用hooks管理业务逻辑
  const { 
    isAnalyzing, 
    analysisResult, 
    setAnalysisResult, 
    analyzeAllImages: analyzeImages 
  } = useImageAnalysis({
    minImages: MIN_IMAGES,
    defaultModel,
    onAnalysisComplete: (result) => {
      setStep(1);
    },
  });

  const {
    storyboardVideos,
    generatingScenes,
    generateSceneVideo,
    generateAllSceneVideos,
  } = useVideoGeneration({
    uploadedImages,
  });

  const {
    isMerging,
    finalVideoUrl,
    videoId: mergedVideoId,
    setVideoId: setMergedVideoId,
    mergeAllVideos,
  } = useVideoMerge({
    onMergeComplete: (url, id) => {
      setVideoId(id);
    },
  });

  // ==================== Step 2 处理函数 ====================

  // 生成脚本选项
  const generateScripts = async () => {
    if (!analysisResult) {
      toast.error('请先完成图片分析');
      return;
    }

    setIsGeneratingScripts(true);
    try {
      const scripts = await viralVideoService.generateScripts(analysisResult, defaultModel);
      setAvailableScripts(scripts);
      
      if (scripts.length > 0) {
        setSelectedScript(scripts[0].id);
        // 自动生成第一个脚本的分镜
        await generateStoryboard(scripts[0]);
      }
      
      toast.success(`成功生成 ${scripts.length} 个脚本选项`);
    } catch (error: any) {
      console.error('脚本生成失败:', error);
      toast.error(error.message || '脚本生成失败，请重试');
    } finally {
      setIsGeneratingScripts(false);
    }
  };

  // 生成分镜详情
  const generateStoryboard = async (script: ScriptOption) => {
    if (!analysisResult || uploadedImages.length === 0) {
      toast.error('缺少必要信息');
      return;
    }

    setIsGeneratingStoryboard(true);
    try {
      const imageUrls = uploadedImages.map(img => img.url);
      const storyboardData = await viralVideoService.generateStoryboard(
        script,
        analysisResult,
        imageUrls,
        defaultModel
      );
      
      setStoryboard(storyboardData);
      setSelectedScript(script.id);
      
      toast.success('分镜生成完成');
    } catch (error: any) {
      console.error('分镜生成失败:', error);
      toast.error(error.message || '分镜生成失败，请重试');
    } finally {
      setIsGeneratingStoryboard(false);
    }
  };

  // 处理脚本选择
  const handleScriptSelect = async (scriptId: string) => {
    const script = availableScripts.find(s => s.id === scriptId);
    if (!script) return;

    setSelectedScript(scriptId);
    
    // 生成新脚本的分镜
    await generateStoryboard(script);
  };

  // 进入Step 2时自动生成脚本
  useEffect(() => {
    if (step === 2 && analysisResult && availableScripts.length === 0 && !isGeneratingScripts) {
      generateScripts();
    }
  }, [step, analysisResult]);

  // ==================== Step 1 处理函数 ====================

  // 处理本地文件上传
  const handleLocalUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const remaining = Math.max(0, MAX_IMAGES - uploadedImages.length);
      const selectedFiles = Array.from(files as FileList).slice(0, remaining);
      if (Array.from(files as FileList).length > remaining) {
        toast.error(`最多只能上传 ${MAX_IMAGES} 张图片，已自动截取前 ${remaining} 张`);
      }
      const uploadPromises = selectedFiles.map(async (file: File) => {
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} 不是有效的图片文件`);
        }

        // 验证文件大小（50MB）
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`${file.name} 文件大小超过50MB`);
        }

        // 上传到OSS
        const result = await uploadService.uploadFile(file);
        return {
          url: result.url,
          file,
          id: result.ossId,
        };
      });

      const results = await Promise.all(uploadPromises);
      const newList = [...uploadedImages, ...results];
      setUploadedImages(newList);
      toast.success(`成功上传 ${results.length} 张图片`);
      
      if (results.length > 0) {
        setShowEditModal(true);
      }
    } catch (error: any) {
      console.error('上传失败:', error);
      toast.error(error.message || '上传失败，请重试');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 处理从作品集选择
  const handleSelectFromPortfolio = async () => {
    setShowPortfolioModal(true);
    setPortfolioLoading(true);
    try {
      const response = await assetsService.getAssetsList({
        pageNum: 1,
        pageSize: 50,
        dataType: 1,
      });
      
      const assets = Array.isArray(response) 
        ? response 
        : (response as any)?.rows || [];
      
      const imageAssets = assets.filter((asset: AdsAssetsVO) => {
        const url = asset.assetUrl || asset.coverUrl || asset.thumbnailUrl || '';
        return url.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
      });
      
      setPortfolioAssets(imageAssets);
    } catch (error: any) {
      console.error('获取素材列表失败:', error);
      toast.error('获取素材列表失败，请重试');
    } finally {
      setPortfolioLoading(false);
    }
  };

  const handleSelectAsset = (asset: AdsAssetsVO) => {
    const imageUrl = asset.assetUrl || asset.coverUrl || asset.thumbnailUrl || '';
    if (!imageUrl) {
      toast.error('该素材没有有效的图片URL');
      return;
    }

    if (uploadedImages.length >= MAX_IMAGES) {
      toast.error(`最多只能上传 ${MAX_IMAGES} 张图片`);
      return;
    }

    const newList = [...uploadedImages, { url: imageUrl, id: asset.id?.toString() }];
    setUploadedImages(newList);
    setShowPortfolioModal(false);
    toast.success('已选择素材');

    setShowEditModal(true);
  };

  // 处理链接导入
  const handleLinkImport = async () => {
    if (!linkInput.trim()) {
      toast.error('请输入图片链接');
      return;
    }

    try {
      new URL(linkInput);
    } catch {
      toast.error('请输入有效的图片链接');
      return;
    }

    setIsUploading(true);
    try {
      const urlObj = new URL(linkInput);
      const pathname = urlObj.pathname;
      const extension = pathname.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)?.[1] || 'jpg';

      const result = await uploadService.uploadByImageUrl(linkInput, extension);
      if (uploadedImages.length >= MAX_IMAGES) {
        toast.error(`最多只能上传 ${MAX_IMAGES} 张图片`);
        return;
      }
      const newList = [...uploadedImages, { url: result.url, id: result.ossId }];
      setUploadedImages(newList);
      setLinkInput('');
      toast.success('图片导入成功');

      setShowEditModal(true);
    } catch (error: any) {
      console.error('导入失败:', error);
      toast.error(error.message || '导入失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  // 分析所有图片（使用hook）
  const analyzeAllImages = async () => {
    try {
      const result = await analyzeImages(uploadedImages);
      if (result && result.finalImages) {
        setUploadedImages(result.finalImages);
      }
    } catch (error) {
      // 错误已在hook中处理
    }
  };

  // 删除图片
  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    if (index === 0 && uploadedImages.length === 1) {
      setAnalysisResult(null);
    }
  };

  // ==================== Step 3 处理函数 ====================

  // 更新分镜台词
  const updateSceneLines = (sceneId: number, lines: string) => {
    if (!editedStoryboard) {
      setEditedStoryboard({ ...storyboard } as Storyboard);
    }
    
    setEditedStoryboard((prev: Storyboard | null) => {
      if (!prev) return prev;
      const newStoryboard = { ...prev };
      const scene = newStoryboard.scenes.find((s) => s.id === sceneId);
      if (scene) {
        scene.lines = lines;
      }
      
      return newStoryboard;
    });
  };

  // 生成单个分镜视频（使用hook）
  const handleGenerateSceneVideo = async (sceneId: number) => {
    await generateSceneVideo(sceneId, storyboard, editedStoryboard);
  };

  // 批量生成所有分镜视频（使用hook）
  const handleGenerateAllSceneVideos = async () => {
    await generateAllSceneVideos(storyboard, editedStoryboard);
  };

  // ==================== Step 4 处理函数 ====================

  // 合并所有分镜视频（使用hook）
  const handleMergeAllVideos = async () => {
    await mergeAllVideos(storyboard, editedStoryboard, storyboardVideos);
  };

  // 进入Step 4时自动合并视频
  useEffect(() => {
    if (step === 4 && !finalVideoUrl && !isMerging) {
      handleMergeAllVideos();
    }
  }, [step]);

  // 进入Step 2前检查
  const handleGoToStep2 = () => {
    if (uploadedImages.length < MIN_IMAGES) {
      toast.error(`请先上传至少 ${MIN_IMAGES} 张图片`);
      return;
    }
    if (!analysisResult) {
      toast.error('请先完成图片分析');
      return;
    }
    setStep(2);
  };

  // 确认脚本进入下一步
  const handleConfirmScript = () => {
    if (!storyboard) {
      toast.error('请先选择脚本并生成分镜');
      return;
    }
    setStep(3);
  };

  // 开始制作（从首页）
  const handleStartMaking = () => {
    if (uploadedImages.length > 0) {
      setStep(1);
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <>
      {step === 0 && (
        <HomePage
          t={t}
          uploadedImages={uploadedImages}
          analysisResult={analysisResult}
          isAnalyzing={isAnalyzing}
          isUploading={isUploading}
          activeTab={activeTab}
          linkInput={linkInput}
          MIN_IMAGES={MIN_IMAGES}
          MAX_IMAGES={MAX_IMAGES}
          onTabChange={setActiveTab}
          onLinkInputChange={setLinkInput}
          onLocalUpload={handleLocalUpload}
          onSelectFromPortfolio={handleSelectFromPortfolio}
          onLinkImport={handleLinkImport}
          onRemoveImage={handleRemoveImage}
          onEditModalOpen={() => setShowEditModal(true)}
          onAnalyzeAllImages={analyzeAllImages}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          onStartMaking={handleStartMaking}
        />
      )}
      
      {step === 1 && (
        <MaterialsAndSellingPoints
          t={t}
          step={step}
          videoId={videoId}
          uploadedImages={uploadedImages}
          analysisResult={analysisResult}
          isAnalyzing={isAnalyzing}
          isUploading={isUploading}
          activeTab={activeTab}
          linkInput={linkInput}
          MIN_IMAGES={MIN_IMAGES}
          MAX_IMAGES={MAX_IMAGES}
          onTabChange={setActiveTab}
          onLinkInputChange={setLinkInput}
          onLocalUpload={handleLocalUpload}
          onSelectFromPortfolio={handleSelectFromPortfolio}
          onLinkImport={handleLinkImport}
          onRemoveImage={handleRemoveImage}
          onEditModalOpen={() => setShowEditModal(true)}
          onAnalyzeAllImages={analyzeAllImages}
          onGoToStep2={handleGoToStep2}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
        />
      )}

      {step === 2 && (
        <SelectScript
          t={t}
          step={step}
          videoId={videoId}
          availableScripts={availableScripts}
          selectedScript={selectedScript}
          storyboard={storyboard}
          isGeneratingScripts={isGeneratingScripts}
          isGeneratingStoryboard={isGeneratingStoryboard}
          onStepChange={setStep}
          onScriptSelect={handleScriptSelect}
          onConfirmScript={handleConfirmScript}
        />
      )}

      {step === 3 && (
        <EditStoryboard
          t={t}
          step={step}
          videoId={videoId}
          storyboard={storyboard}
          editedStoryboard={editedStoryboard}
          storyboardVideos={storyboardVideos}
          generatingScenes={generatingScenes}
          onStepChange={setStep}
          onUpdateSceneLines={updateSceneLines}
          onGenerateSceneVideo={handleGenerateSceneVideo}
          onGenerateAllSceneVideos={handleGenerateAllSceneVideos}
        />
      )}

      {step === 4 && (
        <GenerateVideo
          t={t}
          step={step}
          videoId={videoId || mergedVideoId}
          finalVideoUrl={finalVideoUrl}
          isMerging={isMerging}
          analysisResult={analysisResult}
          uploadedImages={uploadedImages}
          storyboard={storyboard}
          editedStoryboard={editedStoryboard}
          onStepChange={setStep}
          onMergeAllVideos={handleMergeAllVideos}
        />
      )}
      
      {/* 作品集选择弹窗 */}
      <BaseModal
        isOpen={showPortfolioModal}
        onClose={() => setShowPortfolioModal(false)}
        title="从作品集选择"
        width="max-w-4xl"
      >
        <div className="space-y-4">
          {portfolioLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin" size={24} />
              <span className="ml-2 text-muted">加载中...</span>
            </div>
          ) : portfolioAssets.length === 0 ? (
            <div className="text-center py-12 text-muted">
              暂无素材，请先上传图片
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {portfolioAssets.map((asset) => {
                const imageUrl = asset.assetUrl || asset.coverUrl || asset.thumbnailUrl || '';
                if (!imageUrl) return null;
                
                return (
                  <div
                    key={asset.id}
                    onClick={() => handleSelectAsset(asset)}
                    className="relative aspect-square rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary transition-colors group"
                  >
                    <img 
                      src={imageUrl} 
                      alt={asset.assetName || '素材'} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <CheckCircle2 
                        size={24} 
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity" 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </BaseModal>
      
      <ImageEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        images={uploadedImages}
        onSubmit={(edited) => {
          setUploadedImages(edited);
        }}
      />
    </>
  );
};

export default ViralVideoPage;

