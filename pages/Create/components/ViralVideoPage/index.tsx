import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, FolderOpen, Loader, X, CheckCircle2 } from 'lucide-react';
import { uploadService } from '@/services/uploadService.ts';
import { assetsService, AdsAssetsVO } from '@/services/assetsService.ts';
import { viralVideoService } from '@/services/viralVideoService.ts';
import { labProjectService } from '@/services/labProjectService.ts';
import toast from 'react-hot-toast';
import BaseModal from '../../../../components/BaseModal';
import ImageEditModal from '../ImageEditModal';
import { downloadVideo } from '@/utils/videoUtils.ts';
import { HomePage } from './HomePage';
import { MaterialsAndSellingPoints } from './MaterialsAndSellingPoints';
import { SelectScript } from './SelectScript';
import { EditStoryboard } from './EditStoryboard';
import { GenerateVideo } from './GenerateVideo';
import { TaskListModal } from './components/TaskListModal';
import { useImageAnalysis } from './hooks/useImageAnalysis';
import { useVideoGeneration } from './hooks/useVideoGeneration';
import { useVideoMerge } from './hooks/useVideoMerge';
import { useProjectSave } from './hooks/useProjectSave';
import { useBeforeUnload } from './hooks/useBeforeUnload';
import { 
  ViralVideoPageProps, 
  UploadedImage, 
  ProductAnalysis, 
  ScriptOption, 
  Storyboard,
  StoryboardVideo,
  ViralVideoProjectData
} from './types';

// 示例图片数据
const SAMPLE_IMAGES = [
  'https://lab-oss.ai-nebula.com/nebula-lab/2025/11/28/9ee5707ca2a547e9a180969f001bcf73.png',
  'https://lab-oss.ai-nebula.com/nebula-lab/2025/11/28/0c94104a202a4859aff2565addf4dea2.png',
  'https://lab-oss.ai-nebula.com/nebula-lab/2025/11/28/7f00b2d43a2746fb85f8566a3624fa9a.png',
  'https://lab-oss.ai-nebula.com/nebula-lab/2025/11/28/646472b066114711a2b787d4101e2345.png',
];

// 示例商品信息
const SAMPLE_PRODUCT_INFO = {
  productName: '条纹衬衫裙',
  sellingPoints: '显瘦；青春活力；上班也能穿；女大学生即视感',
};

const ViralVideoPage: React.FC<ViralVideoPageProps> = ({ t }) => {
  const [step, setStep] = useState(0); // 0=首页, 1=素材与卖点, 2=选择脚本, 3=编辑分镜, 4=生成视频
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');
  
  // Step 2: 脚本相关状态
  const [availableScripts, setAvailableScripts] = useState<ScriptOption[]>([]);
  const [selectedScript, setSelectedScript] = useState<string>('');
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
  const [storyboardsByScriptId, setStoryboardsByScriptId] = useState<Record<string, Storyboard>>({}); // 存储所有脚本的分镜
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
  const [editModalImageStartIndex, setEditModalImageStartIndex] = useState(0); // 记录要编辑的图片起始索引
  const [finalVideoId, setFinalVideoId] = useState<string>(''); // 统一视频ID管理
  const [productName, setProductName] = useState<string>('');
  const [sellingPoints, setSellingPoints] = useState<string>('');
  const [projectId, setProjectId] = useState<string | number | null>(null);
  const [projectIdStr, setProjectIdStr] = useState<string>(''); // 前端生成的项目ID字符串（如 nebula_20251202235959）
  const [showTaskListModal, setShowTaskListModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    setStoryboardVideos, // 添加设置函数
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
      setFinalVideoId(id); // 统一设置视频ID
    },
  });

  // 获取项目数据用于序列化
  const getProjectData = useCallback((): ViralVideoProjectData => {
    return {
      step,
      uploadedImages: uploadedImages.map(img => ({ url: img.url, id: img.id })), // 只保存URL，不保存File对象
      productName,
      sellingPoints,
      analysisResult,
      availableScripts,
      selectedScript,
      storyboard,
      editedStoryboard,
      storyboardsByScriptId, // 保存所有脚本的分镜
      storyboardVideos,
      finalVideoUrl,
      videoId: finalVideoId, // 使用统一的视频ID
    };
  }, [
    step,
    uploadedImages,
    productName,
    sellingPoints,
    analysisResult,
    availableScripts,
    selectedScript,
    storyboard,
    editedStoryboard,
    storyboardsByScriptId, // 添加到依赖
    storyboardVideos,
    finalVideoUrl,
    finalVideoId, // 使用统一的视频ID
  ]);

  // 项目保存Hook
  const { createProject, updateProject, saveProject } = useProjectSave({
    projectId,
    setProjectId,
    getProjectData,
    projectIdStr,
  });

  // 保存项目
  const handleSaveProject = useCallback(async () => {
    setIsSaving(true);
    try {
      await saveProject(productName);
    } finally {
      setIsSaving(false);
    }
  }, [saveProject, productName]);

  // 关闭确认提示（如果未保存项目且有数据）
  const hasUnsavedData = !projectId && (uploadedImages.length > 0 || productName || sellingPoints);
  useBeforeUnload({
    enabled: hasUnsavedData,
    message: '退出后，商品素材和卖点将被清空',
  });

  // ==================== Step 2 处理函数 ====================

  // 生成项目ID（格式：nebula_YYYYMMDDHHmmss）
  const generateProjectIdStr = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `nebula_${year}${month}${day}${hours}${minutes}${seconds}`;
  }, []);

  // 生成脚本选项
  const generateScripts = async () => {
    if (!analysisResult) {
      toast.error('请先完成图片分析');
      return;
    }

    setIsGeneratingScripts(true);
    setIsGeneratingStoryboard(true); // 同时生成分镜，也显示分镜生成状态
    try {
      // 如果还没有项目ID，先生成前端项目ID
      if (!projectIdStr) {
        const newProjectIdStr = generateProjectIdStr();
        setProjectIdStr(newProjectIdStr);
      }

      const scripts = await viralVideoService.generateScripts(analysisResult, defaultModel);
      setAvailableScripts(scripts);
      
      if (scripts.length > 0) {
        setSelectedScript(scripts[0].id);
        
        // 并发为所有脚本生成分镜
        toast.loading(`正在为 ${scripts.length} 个脚本生成分镜...`, { id: 'generating-all-storyboards' });
        
        const imageUrls = uploadedImages.map(img => img.url);
        const storyboardPromises = scripts.map(async (script) => {
          try {
            const storyboardData = await viralVideoService.generateStoryboard(
              script,
              analysisResult,
              imageUrls,
              defaultModel
            );
            return { scriptId: script.id, storyboard: storyboardData };
          } catch (error: any) {
            console.error(`脚本 ${script.id} 分镜生成失败:`, error);
            // 单个失败不影响其他，返回 null
            return { scriptId: script.id, storyboard: null };
          }
        });

        const storyboardResults = await Promise.all(storyboardPromises);
        
        // 构建分镜映射
        const newStoryboardsByScriptId: Record<string, Storyboard> = {};
        storyboardResults.forEach(({ scriptId, storyboard: sb }) => {
          if (sb) {
            newStoryboardsByScriptId[scriptId] = sb;
          }
        });

        setStoryboardsByScriptId(newStoryboardsByScriptId);
        
        // 设置第一个脚本的分镜为当前显示的分镜
        if (newStoryboardsByScriptId[scripts[0].id]) {
          setStoryboard(newStoryboardsByScriptId[scripts[0].id]);
        }

        toast.dismiss('generating-all-storyboards');
        
        const successCount = Object.keys(newStoryboardsByScriptId).length;
        if (successCount === scripts.length) {
          toast.success(`成功生成 ${scripts.length} 个脚本和分镜`);
        } else {
          toast.success(`成功生成 ${scripts.length} 个脚本，${successCount} 个分镜`);
        }
      }
      
      // 生成脚本后创建项目
      if (!projectId) {
        const newProjectId = await createProject(productName);
        if (newProjectId) {
          // 创建成功后，保存项目ID字符串到后端（通过更新项目）
          await updateProject();
        }
      } else {
        await updateProject();
      }
    } catch (error: any) {
      console.error('脚本生成失败:', error);
      toast.error(error.message || '脚本生成失败，请重试');
    } finally {
      setIsGeneratingScripts(false);
      setIsGeneratingStoryboard(false);
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
      
      // 更新分镜缓存
      setStoryboardsByScriptId(prev => ({
        ...prev,
        [script.id]: storyboardData,
      }));
      
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
    
    // 从缓存中获取分镜，如果不存在则生成
    if (storyboardsByScriptId[scriptId]) {
      // 直接从缓存中读取
      setStoryboard(storyboardsByScriptId[scriptId]);
    } else {
      // 如果缓存中没有，则生成（这种情况不应该发生，但作为兜底）
      console.warn(`脚本 ${scriptId} 的分镜未找到，正在生成...`);
      setIsGeneratingStoryboard(true);
      try {
        const imageUrls = uploadedImages.map(img => img.url);
        const storyboardData = await viralVideoService.generateStoryboard(
          script,
          analysisResult!,
          imageUrls,
          defaultModel
        );
        
        setStoryboard(storyboardData);
        
        // 更新缓存
        setStoryboardsByScriptId(prev => ({
          ...prev,
          [scriptId]: storyboardData,
        }));
      } catch (error: any) {
        console.error('分镜生成失败:', error);
        toast.error(error.message || '分镜生成失败，请重试');
      } finally {
        setIsGeneratingStoryboard(false);
      }
    }
    
    // 选择脚本后更新项目
    if (projectId) {
      await updateProject();
    }
  };

  // 进入Step 2时自动生成脚本
  useEffect(() => {
    if (step === 2 && analysisResult && availableScripts.length === 0 && !isGeneratingScripts) {
      generateScripts();
    }
  }, [step, analysisResult, availableScripts.length, isGeneratingScripts]);

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
      const createdBlobUrls: string[] = [];
      const results = selectedFiles.map((file: File) => {
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} 不是有效的图片文件`);
        }

        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`${file.name} 文件大小超过50MB`);
        }

        const previewUrl = URL.createObjectURL(file);
        createdBlobUrls.push(previewUrl);

        return {
          url: previewUrl,
          file,
          id: undefined,
        };
      });

      try {
        const newList = [...uploadedImages, ...results];
        setUploadedImages(newList);
        toast.success(`成功导入 ${results.length} 张图片，裁剪完成后统一上传`);

        if (results.length > 0) {
          // 记录新上传图片的起始索引
          setEditModalImageStartIndex(uploadedImages.length);
          setShowEditModal(true);
        }
      } catch (error: any) {
        createdBlobUrls.forEach((url) => URL.revokeObjectURL(url));
        throw error;
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

    // 记录新上传图片的起始索引
    setEditModalImageStartIndex(uploadedImages.length);
    setShowEditModal(true);
  };

  // 处理"帮我写"功能
  const handleHelpWrite = async () => {
    if (uploadedImages.length < MIN_IMAGES) {
      toast.error(`请先上传至少 ${MIN_IMAGES} 张图片`);
      return;
    }

    try {
      // 第一步：检查并上传所有有 file 对象但还未上传到OSS的图片
      const imagesToUpload = uploadedImages.filter(img => img.file && !img.id);
      
      let finalImages = uploadedImages;
      
      if (imagesToUpload.length > 0) {
        toast.loading(`正在上传 ${imagesToUpload.length} 张图片到OSS...`, { id: 'uploading-for-help-write' });
        
        const uploadPromises = imagesToUpload.map(async (img) => {
          if (!img.file) return img;
          
          try {
            const result = await uploadService.uploadFile(img.file);
            if (img.url.startsWith('blob:')) {
              URL.revokeObjectURL(img.url);
            }
            return {
              url: result.url,
              id: result.ossId,
            };
          } catch (error: any) {
            console.error('图片上传失败:', error);
            throw new Error(`图片上传失败: ${error.message}`);
          }
        });

        const uploadedResults = await Promise.all(uploadPromises);
        
        finalImages = uploadedImages.map(img => {
          const uploaded = uploadedResults.find((u, index) => {
            const originalImg = imagesToUpload[index];
            return originalImg && originalImg.file === img.file;
          });
          if (uploaded) {
            return uploaded;
          }
          return img;
        });
        
        setUploadedImages(finalImages);
        toast.dismiss('uploading-for-help-write');
        toast.success(`成功上传 ${uploadedResults.length} 张图片到OSS`);
      }

      // 第二步：调用AI分析
      const imageUrls = finalImages.map(img => img.url).filter(Boolean);
      
      if (imageUrls.length < MIN_IMAGES) {
        throw new Error(`至少需要 ${MIN_IMAGES} 张有效图片`);
      }
      
      toast.loading('正在调用AI分析图片...', { id: 'analyzing-for-help-write' });
      const result = await viralVideoService.analyzeProductImages(imageUrls, defaultModel);
      
      toast.dismiss('analyzing-for-help-write');
      setAnalysisResult(result);
      toast.success(`成功分析 ${imageUrls.length} 张图片`);
      
      // 第三步：自动填充卖点
      if (result && result.sellingPoints && result.sellingPoints.length > 0) {
        const points = result.sellingPoints.join(';');
        setSellingPoints(points);
        if (result.productName) {
          setProductName(result.productName);
        }
      }
    } catch (error: any) {
      console.error('帮我写失败:', error);
      toast.error(error.message || '帮我写失败，请重试');
    }
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

      // 记录新上传图片的起始索引
      setEditModalImageStartIndex(uploadedImages.length);
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
      // 分析成功后跳转到 Step 1
      if (result && result.result) {
        setStep(1);
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
  const updateSceneLines = async (sceneId: number, lines: string) => {
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
    
    // 编辑分镜后更新项目
    if (projectId) {
      // 延迟更新，避免频繁保存
      setTimeout(() => {
        updateProject();
      }, 1000);
    }
  };

  // 生成单个分镜视频（使用hook）
  const handleGenerateSceneVideo = async (sceneId: number, shotIndex?: number) => {
    // shotIndex 表示第几个镜头，如果提供则只生成该镜头的视频
    // 目前 hook 不支持单个镜头生成，先实现整个分镜的生成
    await generateSceneVideo(sceneId, storyboard, editedStoryboard);
  };

  // 删除分镜
  const handleDeleteScene = (sceneId: number) => {
    if (!editedStoryboard && !storyboard) return;
    
    const currentStoryboard = editedStoryboard || storyboard;
    if (!currentStoryboard) return;

    const newScenes = currentStoryboard.scenes.filter(s => s.id !== sceneId);
    
    // 重新分配ID，保持连续性
    const updatedScenes = newScenes.map((scene, index) => ({
      ...scene,
      id: index + 1,
      scene: index + 1,
    }));

    if (!editedStoryboard) {
      setEditedStoryboard({ ...currentStoryboard, scenes: updatedScenes });
    } else {
      setEditedStoryboard({ ...editedStoryboard, scenes: updatedScenes });
    }

    // 删除对应的视频状态
    setStoryboardVideos((prev) => {
      const newVideos = { ...prev };
      delete newVideos[sceneId];
      // 重新映射视频状态到新的ID
      const remappedVideos: Record<number, typeof prev[number]> = {};
      updatedScenes.forEach((scene, index) => {
        const oldId = currentStoryboard.scenes[index]?.id;
        if (oldId && prev[oldId]) {
          remappedVideos[scene.id] = prev[oldId];
        }
      });
      return remappedVideos;
    });

    // 更新项目
    if (projectId) {
      setTimeout(() => {
        updateProject();
      }, 500);
    }
  };

  // 重排序分镜
  const handleReorderScenes = (fromIndex: number, toIndex: number) => {
    if (!editedStoryboard && !storyboard) return;
    
    const currentStoryboard = editedStoryboard || storyboard;
    if (!currentStoryboard) return;

    const newScenes = [...currentStoryboard.scenes];
    const [movedScene] = newScenes.splice(fromIndex, 1);
    newScenes.splice(toIndex, 0, movedScene);

    // 重新分配ID，保持连续性
    const updatedScenes = newScenes.map((scene, index) => ({
      ...scene,
      id: index + 1,
      scene: index + 1,
    }));

    if (!editedStoryboard) {
      setEditedStoryboard({ ...currentStoryboard, scenes: updatedScenes });
    } else {
      setEditedStoryboard({ ...editedStoryboard, scenes: updatedScenes });
    }

    // 重新映射视频状态
    setStoryboardVideos((prev) => {
      const remappedVideos: Record<number, typeof prev[number]> = {};
      updatedScenes.forEach((scene, index) => {
        const oldId = currentStoryboard.scenes[index]?.id;
        if (oldId && prev[oldId]) {
          remappedVideos[scene.id] = prev[oldId];
        }
      });
      return remappedVideos;
    });

    // 更新项目
    if (projectId) {
      setTimeout(() => {
        updateProject();
      }, 500);
    }
  };

  // 选择分镜（用于点击进度条时选中）
  const handleSelectScene = (sceneId: number) => {
    // 可以在这里添加选中逻辑，比如滚动到对应分镜
    // 目前由 EditStoryboard 组件内部处理
  };

  // 批量生成所有分镜视频（使用hook）
  const handleGenerateAllSceneVideos = async () => {
    await generateAllSceneVideos(storyboard, editedStoryboard);
  };

  // ==================== Step 4 处理函数 ====================

  // 合并所有分镜视频（使用hook）
  const handleMergeAllVideos = async () => {
    await mergeAllVideos(storyboard, editedStoryboard, storyboardVideos);
    
    // 合并视频后更新项目
    if (projectId) {
      await updateProject();
    }
  };

  // 进入Step 4时自动合并视频
  useEffect(() => {
    if (step === 4 && !finalVideoUrl && !isMerging) {
      handleMergeAllVideos();
    }
  }, [step, finalVideoUrl, isMerging, handleMergeAllVideos]);

  // 进入Step 2前检查
  const handleGoToStep2 = () => {
    if (uploadedImages.length < MIN_IMAGES) {
      toast.error(`请先上传至少 ${MIN_IMAGES} 张图片`);
      return;
    }
    if (!productName || !sellingPoints) {
      toast.error('请填写商品名称和卖点');
      return;
    }
    setStep(2);
  };

  // 生成脚本（从Step 1）
  const handleGenerateScript = () => {
    handleGoToStep2();
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

  // 返回首页
  const handleBackToHome = () => {
    // 如果未保存且有数据，提示用户
    if (hasUnsavedData) {
      const confirmed = window.confirm('退出后，商品素材和卖点将被清空，确定要退出吗？');
      if (!confirmed) {
        return;
      }
    }
    setStep(0);
  };

  // 加载项目
  const loadProject = useCallback(async (projectIdToLoad: string | number) => {
    try {
      const response = await labProjectService.getProjectInfo(projectIdToLoad);
      // requestClient 会解包最外层的数据结构，只返回 data
      // 所以 response 直接就是 data 对象（LabProjectVO）
      if (response && response.projectJson) {
        const projectData: ViralVideoProjectData = JSON.parse(response.projectJson);
        
        // 恢复所有状态
        setStep(projectData.step);
        setUploadedImages(projectData.uploadedImages.map(img => ({ url: img.url, id: img.id })));
        setProductName(projectData.productName);
        setSellingPoints(projectData.sellingPoints);
        setAnalysisResult(projectData.analysisResult);
        setAvailableScripts(projectData.availableScripts);
        setSelectedScript(projectData.selectedScript);
        setStoryboard(projectData.storyboard);
        setEditedStoryboard(projectData.editedStoryboard);
        
        // 恢复所有脚本的分镜缓存
        if (projectData.storyboardsByScriptId) {
          setStoryboardsByScriptId(projectData.storyboardsByScriptId);
        }
        
        setFinalVideoId(projectData.videoId); // 使用统一的视频ID
        setProjectId(projectIdToLoad);
        
        // 恢复项目ID字符串（如果有）
        if (response.projectId) {
          setProjectIdStr(response.projectId);
        }
        
        // 恢复视频生成状态（需要将字符串键转换为数字键）
        if (projectData.storyboardVideos) {
          const convertedVideos: Record<number, StoryboardVideo> = {};
          Object.keys(projectData.storyboardVideos).forEach((key) => {
            const numKey = Number(key);
            if (!isNaN(numKey)) {
              convertedVideos[numKey] = projectData.storyboardVideos[key as any];
            }
          });
          setStoryboardVideos(convertedVideos);
        }

        toast.success('项目加载成功');
      } else {
        throw new Error('项目数据格式错误');
      }
    } catch (error: any) {
      console.error('加载项目失败:', error);
      toast.error(error.message || '加载项目失败，请重试');
    }
  }, [setStoryboardVideos]); // Add setStoryboardVideos to dependencies

  // 从URL参数加载项目
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectIdParam = urlParams.get('projectId');
    if (projectIdParam && !projectId) {
      loadProject(projectIdParam);
    }
  }, [projectId, loadProject]);

  // 处理任务点击
  const handleTaskClick = useCallback(async (taskProjectId: string | number) => {
    await loadProject(taskProjectId);
    setShowTaskListModal(false);
  }, [loadProject]);

  // 处理显示所有任务
  const handleShowAllTasks = useCallback(() => {
    setShowTaskListModal(true);
  }, []);

  // 一键做同款（从首页示例图片）
  const handleStartTemplate = () => {
    // 将示例图片添加到 uploadedImages
    const sampleImages: UploadedImage[] = SAMPLE_IMAGES.map((url, index) => ({
      url,
      id: `sample-${index}`,
    }));
    
    // 设置上传的图片
    setUploadedImages(sampleImages);
    
    // 创建示例商品分析结果
    // 支持中文分号和英文分号分割卖点
    const sellingPointsArray = SAMPLE_PRODUCT_INFO.sellingPoints
      .split(/[；;]/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    const sampleAnalysisResult: ProductAnalysis = {
      productName: SAMPLE_PRODUCT_INFO.productName,
      sellingPoints: sellingPointsArray,
      scenes: ['日常穿搭', '上班通勤', '校园生活'],
      category: '服装',
      style: '青春活力',
    };
    
    // 设置分析结果
    setAnalysisResult(sampleAnalysisResult);
    
    // 设置商品名称和卖点
    setProductName(SAMPLE_PRODUCT_INFO.productName);
    setSellingPoints(SAMPLE_PRODUCT_INFO.sellingPoints);
    
    // 跳转到 Step 1：选择素材与卖点
    setStep(1);
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
          onEditModalOpen={() => {
            // 手动点击时，显示所有图片
            setEditModalImageStartIndex(0);
            setShowEditModal(true);
          }}
          onAnalyzeAllImages={analyzeAllImages}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          onStartMaking={handleStartMaking}
          onStartTemplate={handleStartTemplate}
          onTaskClick={handleTaskClick}
          onShowAllTasks={handleShowAllTasks}
        />
      )}
      
      {step === 1 && (
        <MaterialsAndSellingPoints
          t={t}
          step={step}
          videoId={finalVideoId} // Use finalVideoId
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
          onEditModalOpen={() => {
            // 手动点击时，显示所有图片
            setEditModalImageStartIndex(0);
            setShowEditModal(true);
          }}
          onAnalyzeAllImages={analyzeAllImages}
          onGoToStep2={handleGoToStep2}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          onProductNameChange={setProductName}
          onSellingPointsChange={setSellingPoints}
          onGenerateScript={handleGenerateScript}
          onBack={handleBackToHome}
          onHelpWrite={handleHelpWrite}
          onStepChange={setStep} // Pass setStep for navigation
        />
      )}

      {step === 2 && (
        <SelectScript
          t={t}
          step={step}
          videoId={finalVideoId} // Use finalVideoId
          projectId={projectId}
          projectIdStr={projectIdStr}
          availableScripts={availableScripts}
          selectedScript={selectedScript}
          storyboard={storyboard}
          storyboardsByScriptId={storyboardsByScriptId}
          isGeneratingScripts={isGeneratingScripts}
          isGeneratingStoryboard={isGeneratingStoryboard}
          onStepChange={setStep}
          onScriptSelect={handleScriptSelect}
          onConfirmScript={handleConfirmScript}
          onSave={handleSaveProject}
          isSaving={isSaving}
        />
      )}

      {step === 3 && (
        <EditStoryboard
          t={t}
          step={step}
          videoId={finalVideoId} // Use finalVideoId
          projectId={projectId}
          projectIdStr={projectIdStr}
          storyboard={storyboard}
          editedStoryboard={editedStoryboard}
          storyboardVideos={storyboardVideos}
          generatingScenes={generatingScenes}
          onStepChange={setStep}
          onUpdateSceneLines={updateSceneLines}
          onGenerateSceneVideo={handleGenerateSceneVideo}
          onGenerateAllSceneVideos={handleGenerateAllSceneVideos}
          onDeleteScene={handleDeleteScene}
          onReorderScenes={handleReorderScenes}
          onSelectScene={handleSelectScene}
          onSave={handleSaveProject}
          isSaving={isSaving}
        />
      )}

      {step === 4 && (
        <GenerateVideo
          t={t}
          step={step}
          videoId={finalVideoId} // Use finalVideoId
          projectId={projectId}
          projectIdStr={projectIdStr}
          finalVideoUrl={finalVideoUrl}
          isMerging={isMerging}
          analysisResult={analysisResult}
          uploadedImages={uploadedImages}
          storyboard={storyboard}
          editedStoryboard={editedStoryboard}
          onStepChange={setStep}
          onMergeAllVideos={handleMergeAllVideos}
          onSave={handleSaveProject}
          isSaving={isSaving}
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
        onClose={() => {
          setShowEditModal(false);
          setEditModalImageStartIndex(0);
        }}
        images={uploadedImages.slice(editModalImageStartIndex)}
        onSubmit={(edited) => {
          // 将编辑后的新图片合并回完整列表
          const beforeImages = uploadedImages.slice(0, editModalImageStartIndex);
          const updatedList = [...beforeImages, ...edited];
          setUploadedImages(updatedList);
          setEditModalImageStartIndex(0);
        }}
      />

      {/* 任务列表弹窗 */}
      <TaskListModal
        isOpen={showTaskListModal}
        onClose={() => setShowTaskListModal(false)}
        onTaskClick={handleTaskClick}
      />
    </>
  );
};

export default ViralVideoPage;

