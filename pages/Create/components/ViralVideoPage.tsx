
import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, FolderOpen, ArrowRight, Play, Image as ImageIcon, 
  ChevronRight, ChevronLeft, Clock, Trash2, BookOpen, 
  LayoutTemplate, Volume2, Copy, Download, MoreHorizontal, 
  Loader, X, CheckCircle2
} from 'lucide-react';
import { uploadService } from '../../../services/uploadService';
import { assetsService, AdsAssetsVO } from '../../../services/assetsService';
import { viralVideoService, ProductAnalysis } from '../../../services/viralVideoService';
import { videoGenerateService } from '../../../services/videoGenerateService';
import toast from 'react-hot-toast';
import BaseModal from '../../../components/BaseModal';
import ImageEditModal from './ImageEditModal';
import { mergeVideos, downloadVideo, formatDuration } from '../../../utils/videoUtils';

interface ViralVideoPageProps {
  t: {
    title: string;
    tabs: {
      upload: string;
      link: string;
    };
    uploadArea: {
      title: string;
      desc: string;
      limitation: string;
      selectFromPortfolio: string;
      uploadLocal: string;
    };
    process: {
      uploadImages: string;
      generateVideo: string;
      makeSame: string;
    };
    examples: string;
  };
}

const ViralVideoPage: React.FC<ViralVideoPageProps> = ({ t }) => {
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');
  
  // Step 2: 脚本相关状态
  const [availableScripts, setAvailableScripts] = useState<Array<{ id: string; title: string; subtitle: string; time: string; description?: string }>>([]);
  const [selectedScript, setSelectedScript] = useState<string>('');
  const [storyboard, setStoryboard] = useState<any>(null);
  const [isGeneratingScripts, setIsGeneratingScripts] = useState(false);
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);

  // Step 3: 分镜编辑和视频生成相关状态
  const [editedStoryboard, setEditedStoryboard] = useState<any>(null);
  const [storyboardVideos, setStoryboardVideos] = useState<Record<number, { url?: string; taskId?: string; status: 'pending' | 'processing' | 'succeeded' | 'failed'; progress?: number }>>({});
  const [generatingScenes, setGeneratingScenes] = useState<number[]>([]);
  const videoPollingIntervals = useRef<Record<number, NodeJS.Timeout>>({});

  // Step 4: 最终视频相关状态
  const [finalVideoUrl, setFinalVideoUrl] = useState<string>('');
  const [isMerging, setIsMerging] = useState(false);
  const [videoId, setVideoId] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Step 1: 图片上传和分析相关状态
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; file?: File; id?: string }>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ProductAnalysis | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [portfolioAssets, setPortfolioAssets] = useState<AdsAssetsVO[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const defaultModel = 'qwen3-omni-flash'; // 默认使用的AI模型
  const MIN_IMAGES = 4;
  const MAX_IMAGES = 10;
  const [showEditModal, setShowEditModal] = useState(false);

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
      
      // 保存到localStorage
      localStorage.setItem('viralVideo_scripts', JSON.stringify(scripts));
      
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
  const generateStoryboard = async (script: { id: string; title: string; subtitle: string; time: string }) => {
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
      
      // 保存到localStorage
      localStorage.setItem('viralVideo_storyboard', JSON.stringify(storyboardData));
      localStorage.setItem('viralVideo_selectedScript', script.id);
      
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
    
    // 如果已有该脚本的分镜数据，直接使用；否则生成新的
    const savedStoryboard = localStorage.getItem('viralVideo_storyboard');
    const savedScriptId = localStorage.getItem('viralVideo_selectedScript');
    
    if (savedStoryboard && savedScriptId === scriptId) {
      try {
        setStoryboard(JSON.parse(savedStoryboard));
      } catch {
        await generateStoryboard(script);
      }
    } else {
      await generateStoryboard(script);
    }
  };

  // 进入Step 2时自动生成脚本
  useEffect(() => {
    if (step === 2 && analysisResult && availableScripts.length === 0 && !isGeneratingScripts) {
      generateScripts();
    }
  }, [step, analysisResult]);

  // 从localStorage恢复Step 2数据
  useEffect(() => {
    if (step === 2) {
      try {
        const savedScripts = localStorage.getItem('viralVideo_scripts');
        const savedStoryboard = localStorage.getItem('viralVideo_storyboard');
        const savedScriptId = localStorage.getItem('viralVideo_selectedScript');
        
        if (savedScripts) {
          setAvailableScripts(JSON.parse(savedScripts));
        }
        if (savedStoryboard) {
          setStoryboard(JSON.parse(savedStoryboard));
        }
        if (savedScriptId) {
          setSelectedScript(savedScriptId);
        }
      } catch (error) {
        console.error('恢复Step 2数据失败:', error);
      }
    }
  }, [step]);

  const scriptScenes = [
    {
      id: 1,
      scene: 1,
      shots: [
        { 
          img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop",
          desc: "镜头从下往上缓慢移动，完整展示连衣裙的廓形。"
        },
        {
          img: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=400&auto=format&fit=crop",
          desc: "镜头缓慢拉近，聚焦于胸前的珍珠扣和蕾丝边细节。"
        }
      ],
      lines: "其实高级感穿搭，真不用太复杂。一条对的白裙子就够了。你看这条，利落的衬衫领，加上胸前一排精致的珍珠扣和蕾丝边，温柔又带着点书卷气。"
    },
    {
      id: 2,
      scene: 2,
      shots: [
        {
          img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop",
          desc: "模特手轻轻提起裙摆，展示裙子的垂坠感和面料质感。"
        },
        {
          img: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=400&auto=format&fit=crop",
          desc: "模特缓缓向前走，裙摆随着步伐自然飘动，展示背部线条。"
        }
      ],
      lines: "最关键的是它的高腰线设计，配合腰部的褶皱，一下子就把比例拉长了，显得人特别高挑。A字大裙摆，把腿粗、梨形身材的烦恼全都藏起来了。"
    }
  ];

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
      localStorage.setItem('viralVideo_images', JSON.stringify(newList));
      toast.success(`成功上传 ${results.length} 张图片`);
      
      // 移除自动分析逻辑，改为用户点击"完成提交"按钮时分析
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
      // 获取图片类型的素材（assetType可能需要根据实际情况调整）
      const response = await assetsService.getAssetsList({
        pageNum: 1,
        pageSize: 50,
        dataType: 1, // 文件类型
        // assetType: 1, // 图片类型，根据实际情况调整
      });
      
      // 处理响应格式
      const assets = Array.isArray(response) 
        ? response 
        : (response as any)?.rows || [];
      
      // 过滤出图片类型
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
    localStorage.setItem('viralVideo_images', JSON.stringify(newList));
    setShowPortfolioModal(false);
    toast.success('已选择素材');

    // 移除自动分析逻辑，改为用户点击"完成提交"按钮时分析
    setShowEditModal(true);
  };

  // 处理链接导入
  const handleLinkImport = async () => {
    if (!linkInput.trim()) {
      toast.error('请输入图片链接');
      return;
    }

    // 验证URL格式
    try {
      new URL(linkInput);
    } catch {
      toast.error('请输入有效的图片链接');
      return;
    }

    setIsUploading(true);
    try {
      // 从URL提取扩展名
      const urlObj = new URL(linkInput);
      const pathname = urlObj.pathname;
      const extension = pathname.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)?.[1] || 'jpg';

      // 上传到OSS
      const result = await uploadService.uploadByImageUrl(linkInput, extension);
      if (uploadedImages.length >= MAX_IMAGES) {
        toast.error(`最多只能上传 ${MAX_IMAGES} 张图片`);
        return;
      }
      const newList = [...uploadedImages, { url: result.url, id: result.ossId }];
      setUploadedImages(newList);
      localStorage.setItem('viralVideo_images', JSON.stringify(newList));
      setLinkInput('');
      toast.success('图片导入成功');

      // 移除自动分析逻辑，改为用户点击"完成提交"按钮时分析
      setShowEditModal(true);
    } catch (error: any) {
      console.error('导入失败:', error);
      toast.error(error.message || '导入失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  // 分析单张图片
  const analyzeImage = async (imageUrl: string) => {
    try {
      const result = await viralVideoService.analyzeProductImage(imageUrl, defaultModel);
      return result;
    } catch (error: any) {
      console.error('分析失败:', error);
      throw error;
    }
  };

  // 一次性分析所有图片（传入所有图片给AI综合分析）
  const analyzeAllImages = async () => {
    if (isAnalyzing) return;
    if (uploadedImages.length < MIN_IMAGES) {
      toast.error(`请先上传至少 ${MIN_IMAGES} 张图片`);
      return;
    }

    setIsAnalyzing(true);
    setAnalyzingProgress({ current: 0, total: 1 }); // 只有一次分析请求
    
    try {
      // 提取所有图片的URL
      const imageUrls = uploadedImages.map(img => img.url);
      
      // 一次性传入所有图片给AI进行综合分析
      const result = await viralVideoService.analyzeProductImages(imageUrls, defaultModel);
      
      setAnalysisResult(result);
      toast.success(`成功分析 ${uploadedImages.length} 张图片`);
      
      // 保存到localStorage
      localStorage.setItem('viralVideo_analysis', JSON.stringify(result));
    } catch (error: any) {
      console.error('图片分析失败:', error);
      toast.error(error.message || '图片分析失败，请重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 删除图片
  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    if (index === 0 && uploadedImages.length === 1) {
      setAnalysisResult(null);
      localStorage.removeItem('viralVideo_analysis');
    }
  };

  // ==================== Step 3 处理函数 ====================

  // 更新分镜台词
  const updateSceneLines = (sceneId: number, lines: string) => {
    if (!editedStoryboard) {
      setEditedStoryboard({ ...storyboard });
    }
    
    setEditedStoryboard((prev: any) => {
      const newStoryboard = { ...prev };
      const scene = newStoryboard.scenes.find((s: any) => s.id === sceneId);
      if (scene) {
        scene.lines = lines;
      }
      
      // 保存到localStorage
      localStorage.setItem('viralVideo_editedStoryboard', JSON.stringify(newStoryboard));
      
      return newStoryboard;
    });
  };

  // 生成单个分镜视频
  const generateSceneVideo = async (sceneId: number) => {
    const currentStoryboard = editedStoryboard || storyboard;
    if (!currentStoryboard) {
      toast.error('分镜数据不存在');
      return;
    }

    const scene = currentStoryboard.scenes.find((s: any) => s.id === sceneId);
    if (!scene) {
      toast.error('分镜不存在');
      return;
    }

    setGeneratingScenes((prev) => [...prev, sceneId]);
    setStoryboardVideos((prev) => ({
      ...prev,
      [sceneId]: { status: 'pending' },
    }));

    try {
      // 构建视频生成prompt（使用分镜的图片和台词）
      const imageUrl = scene.shots[0]?.img || uploadedImages[0]?.url || '';
      const prompt = `${scene.lines} --ratio 3:4 --dur 5`;

      // 提交视频生成任务
      const submitResponse = await videoGenerateService.submitVideoTask({
        model: 'doubao-seedance-1-0-pro-250528',
        prompt,
        content: [
          {
            type: 'text',
            text: prompt,
          },
          ...(imageUrl ? [{
            type: 'image_url' as const,
            image_url: {
              url: imageUrl,
            },
            role: 'reference_image' as const,
          }] : []),
        ],
      });

      if (submitResponse.code !== 200 || !submitResponse.data?.task_id) {
        throw new Error(submitResponse.msg || '提交视频生成任务失败');
      }

      const taskId = submitResponse.data.task_id;
      setStoryboardVideos((prev) => ({
        ...prev,
        [sceneId]: { taskId, status: 'processing', progress: 0 },
      }));

      // 开始轮询任务状态
      pollVideoTask(sceneId, taskId);
    } catch (error: any) {
      console.error('生成视频失败:', error);
      setStoryboardVideos((prev) => ({
        ...prev,
        [sceneId]: { status: 'failed' },
      }));
      setGeneratingScenes((prev) => prev.filter(id => id !== sceneId));
      toast.error(error.message || '生成视频失败，请重试');
    }
  };

  // 轮询视频生成任务状态
  const pollVideoTask = (sceneId: number, taskId: string) => {
    // 清除之前的轮询
    if (videoPollingIntervals.current[sceneId]) {
      clearInterval(videoPollingIntervals.current[sceneId]);
    }

    let pollCount = 0;
    const maxPolls = 120; // 最多轮询120次（约10分钟）
    const pollInterval = 5000; // 5秒轮询一次

    const poll = async () => {
      try {
        const response = await videoGenerateService.queryVideoTask(taskId);
        
        if (response.code !== 200 || !response.data) {
          throw new Error(response.msg || '查询任务状态失败');
        }

        const { status, video_url, progress, error } = response.data;

        setStoryboardVideos((prev) => ({
          ...prev,
          [sceneId]: {
            ...prev[sceneId],
            status: status as any,
            progress: progress || 0,
          },
        }));

        if (status === 'succeeded' && video_url) {
          setStoryboardVideos((prev) => ({
            ...prev,
            [sceneId]: {
              url: video_url,
              status: 'succeeded',
              progress: 100,
            },
          }));
          setGeneratingScenes((prev) => prev.filter(id => id !== sceneId));
          clearInterval(videoPollingIntervals.current[sceneId]);
          delete videoPollingIntervals.current[sceneId];
          toast.success(`分镜 ${sceneId} 视频生成完成`);
          
          // 保存到localStorage
          const savedVideos = localStorage.getItem('viralVideo_sceneVideos');
          const videos = savedVideos ? JSON.parse(savedVideos) : {};
          videos[sceneId] = { url: video_url, status: 'succeeded' };
          localStorage.setItem('viralVideo_sceneVideos', JSON.stringify(videos));
        } else if (status === 'failed') {
          setStoryboardVideos((prev) => ({
            ...prev,
            [sceneId]: { status: 'failed' },
          }));
          setGeneratingScenes((prev) => prev.filter(id => id !== sceneId));
          clearInterval(videoPollingIntervals.current[sceneId]);
          delete videoPollingIntervals.current[sceneId];
          toast.error(`分镜 ${sceneId} 视频生成失败: ${error || '未知错误'}`);
        } else {
          pollCount++;
          if (pollCount >= maxPolls) {
            clearInterval(videoPollingIntervals.current[sceneId]);
            delete videoPollingIntervals.current[sceneId];
            setStoryboardVideos((prev) => ({
              ...prev,
              [sceneId]: { status: 'failed' },
            }));
            setGeneratingScenes((prev) => prev.filter(id => id !== sceneId));
            toast.error(`分镜 ${sceneId} 视频生成超时`);
          }
        }
      } catch (error: any) {
        console.error('轮询任务状态失败:', error);
        clearInterval(videoPollingIntervals.current[sceneId]);
        delete videoPollingIntervals.current[sceneId];
        setStoryboardVideos((prev) => ({
          ...prev,
          [sceneId]: { status: 'failed' },
        }));
        setGeneratingScenes((prev) => prev.filter(id => id !== sceneId));
        toast.error('查询任务状态失败');
      }
    };

    // 立即执行一次
    poll();
    
    // 设置定时轮询
    videoPollingIntervals.current[sceneId] = setInterval(poll, pollInterval);
  };

  // 批量生成所有分镜视频
  const generateAllSceneVideos = async () => {
    const currentStoryboard = editedStoryboard || storyboard;
    if (!currentStoryboard || !currentStoryboard.scenes) {
      toast.error('分镜数据不存在');
      return;
    }

    const scenesToGenerate = currentStoryboard.scenes.filter((scene: any) => {
      const video = storyboardVideos[scene.id];
      return !video || video.status !== 'succeeded';
    });

    if (scenesToGenerate.length === 0) {
      toast.info('所有分镜视频已生成');
      return;
    }

    toast.info(`开始批量生成 ${scenesToGenerate.length} 个分镜视频`);
    
    // 依次生成（避免并发过多）
    for (const scene of scenesToGenerate) {
      await generateSceneVideo(scene.id);
      // 每个视频之间间隔1秒
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  // ==================== Step 4 处理函数 ====================

  // 合并所有分镜视频
  const mergeAllVideos = async () => {
    const currentStoryboard = editedStoryboard || storyboard;
    if (!currentStoryboard || !currentStoryboard.scenes) {
      toast.error('分镜数据不存在');
      return;
    }

    // 检查所有分镜视频是否都已生成
    const allVideosReady = currentStoryboard.scenes.every((scene: any) => {
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
        .map((scene: any) => storyboardVideos[scene.id]?.url)
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
      
      // 保存到localStorage
      localStorage.setItem('viralVideo_finalVideo', mergedVideoUrl);
      localStorage.setItem('viralVideo_videoId', newVideoId);
      
      toast.success('视频合并完成');
    } catch (error: any) {
      console.error('视频合并失败:', error);
      toast.error(error.message || '视频合并失败，请重试');
    } finally {
      setIsMerging(false);
    }
  };

  // 下载最终视频
  const handleDownloadVideo = async () => {
    if (!finalVideoUrl) {
      toast.error('没有可下载的视频');
      return;
    }

    try {
      const filename = `营销视频_${videoId || Date.now()}.mp4`;
      await downloadVideo(finalVideoUrl, filename);
      toast.success('视频下载开始');
    } catch (error: any) {
      console.error('下载失败:', error);
      toast.error(error.message || '下载失败，请重试');
    }
  };

  // 进入Step 4时自动合并视频
  useEffect(() => {
    if (step === 4 && !finalVideoUrl) {
      // 检查是否有已保存的最终视频
      const savedVideo = localStorage.getItem('viralVideo_finalVideo');
      const savedVideoId = localStorage.getItem('viralVideo_videoId');
      
      if (savedVideo) {
        setFinalVideoUrl(savedVideo);
        if (savedVideoId) {
          setVideoId(savedVideoId);
        }
      } else {
        // 自动合并
        mergeAllVideos();
      }
    }
  }, [step]);

  // 从localStorage恢复数据
  useEffect(() => {
    try {
      const savedAnalysis = localStorage.getItem('viralVideo_analysis');
      const savedImages = localStorage.getItem('viralVideo_images');
      const savedEditedStoryboard = localStorage.getItem('viralVideo_editedStoryboard');
      const savedVideos = localStorage.getItem('viralVideo_sceneVideos');
      
      if (savedAnalysis) {
        setAnalysisResult(JSON.parse(savedAnalysis));
      }
      if (savedImages) {
        setUploadedImages(JSON.parse(savedImages));
      }
      if (savedEditedStoryboard) {
        setEditedStoryboard(JSON.parse(savedEditedStoryboard));
      }
      if (savedVideos) {
        setStoryboardVideos(JSON.parse(savedVideos));
      }
    } catch (error) {
      console.error('恢复数据失败:', error);
    }
  }, []);

  // 清理轮询定时器
  useEffect(() => {
    return () => {
      Object.values(videoPollingIntervals.current).forEach((interval: NodeJS.Timeout) => {
        clearInterval(interval);
      });
    };
  }, []);

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

  const renderStep1 = () => (
    <div className="bg-background min-h-full flex flex-col pb-12">
      {/* Header Title */}
      <div className="py-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t.title}</h1>
      </div>

      {/* Main Content - Split Layout */}
      <div className="px-4 md:px-8 max-w-7xl mx-auto w-full mb-12">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Panel: Visual Process Flow */}
          <div className="flex-1 bg-surface border border-border rounded-xl p-6 md:p-8 flex flex-col items-center justify-center shadow-sm">
             <div className="flex items-center justify-center gap-4 md:gap-8 w-full mb-8">
                {/* Images Stack */}
                <div className="flex flex-col gap-2">
                   {uploadedImages.length > 0 ? (
                     <>
                       {uploadedImages.slice(0, 2).map((img, idx) => (
                         <div 
                           key={idx}
                           className={`w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-zinc-800 rounded-lg shadow-md p-1.5 border border-border relative ${
                             idx === 0 ? 'transform -rotate-3' : 'transform rotate-3 -mt-20 ml-8 z-10'
                           }`}
                         >
                           <div className="w-full h-full rounded overflow-hidden relative group">
                             <img src={img.url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                             <button
                               onClick={() => handleRemoveImage(idx)}
                               className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                               <X size={12} className="text-white" />
                             </button>
                           </div>
                         </div>
                       ))}
                       {uploadedImages.length > 2 && (
                         <div className="text-center text-xs text-muted mt-2">
                           +{uploadedImages.length - 2} 张
                         </div>
                       )}
                     </>
                   ) : (
                     <>
                   <div className="w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-zinc-800 rounded-lg shadow-md p-1.5 transform -rotate-3 border border-border">
                         <div className="w-full h-full bg-gray-100 dark:bg-zinc-700 rounded overflow-hidden flex items-center justify-center">
                           <ImageIcon size={24} className="text-muted/50" />
                      </div>
                   </div>
                   <div className="w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-zinc-800 rounded-lg shadow-md p-1.5 transform rotate-3 -mt-20 ml-8 z-10 border border-border">
                         <div className="w-full h-full bg-gray-100 dark:bg-zinc-700 rounded overflow-hidden flex items-center justify-center">
                           <ImageIcon size={24} className="text-muted/50" />
                      </div>
                   </div>
                     </>
                   )}
                   <div className="text-center mt-4 text-sm text-muted font-medium">{t.process.uploadImages}</div>
                </div>

                {/* Arrow */}
                <div className="text-orange-500">
                   <ArrowRight size={32} strokeWidth={3} />
                </div>

                {/* Output Video / Analysis Result */}
                <div className="flex flex-col gap-2">
                   {analysisResult ? (
                     <div className="w-40 h-72 md:w-48 md:h-80 bg-white dark:bg-zinc-800 rounded-lg shadow-md p-4 border border-border overflow-y-auto">
                       <div className="space-y-3">
                         <div>
                           <div className="text-xs text-muted mb-1">商品名称</div>
                           <div className="text-sm font-bold text-foreground">{analysisResult.productName}</div>
                         </div>
                         <div>
                           <div className="text-xs text-muted mb-1">主要卖点</div>
                           <div className="text-xs text-foreground">
                             {analysisResult.sellingPoints.map((point, idx) => (
                               <span key={idx} className="inline-block mr-2 mb-1 px-2 py-0.5 bg-primary/10 rounded">
                                 {point}
                               </span>
                             ))}
                           </div>
                         </div>
                         {analysisResult.scenes.length > 0 && (
                           <div>
                             <div className="text-xs text-muted mb-1">适用场景</div>
                             <div className="text-xs text-foreground">
                               {analysisResult.scenes.join('、')}
                             </div>
                           </div>
                         )}
                       </div>
                     </div>
                   ) : (
                   <div className="w-40 h-72 md:w-48 md:h-80 bg-white dark:bg-zinc-800 rounded-lg shadow-md p-1.5 border border-border relative group cursor-pointer">
                      <div className="w-full h-full bg-gray-900 rounded overflow-hidden relative">
                         <img src="https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=400&auto=format&fit=crop" alt="Video Result" className="w-full h-full object-cover opacity-90" />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/30 backdrop-blur rounded-full flex items-center justify-center pl-1">
                               <Play fill="white" className="text-white" size={20} />
                            </div>
                         </div>
                         </div>
                      </div>
                   )}
                   <div className="text-center mt-4 text-sm text-muted font-medium">
                     {isAnalyzing ? '分析中...' : analysisResult ? '分析完成' : t.process.generateVideo}
                   </div>
                </div>
             </div>

             <div className="w-full max-w-sm space-y-3">
              {isAnalyzing && (
                <div className="w-full py-2 flex flex-col items-center justify-center gap-2 text-sm text-muted">
                  <Loader className="animate-spin" size={16} />
                  <div>正在分析 {uploadedImages.length} 张图片...</div>
                  <div className="text-xs">AI正在综合分析所有图片</div>
                </div>
              )}
              {/* 完成提交按钮 - 当图片数量>=4时显示 */}
              {uploadedImages.length >= MIN_IMAGES && !analysisResult && !isAnalyzing && (
                <button 
                  onClick={analyzeAllImages}
                  disabled={isAnalyzing || uploadedImages.length < MIN_IMAGES}
                  className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  完成提交
                </button>
              )}
               <button 
                 onClick={handleGoToStep2}
                 disabled={!analysisResult || uploadedImages.length === 0}
                 className="w-full py-3 rounded-lg border border-border bg-background hover:bg-surface transition-colors text-foreground font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {t.process.makeSame}
               </button>
               <div className="flex justify-center gap-1 mt-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
               </div>
             </div>
          </div>

          {/* Right Panel: Upload Interface */}
          <div className="flex-1 bg-surface border border-border rounded-xl overflow-hidden shadow-sm flex flex-col">
             {/* Tabs */}
             <div className="flex border-b border-border">
                <button 
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'upload' ? 'bg-white dark:bg-zinc-800 text-foreground border-t-2 border-t-primary' : 'bg-gray-50 dark:bg-zinc-900/50 text-muted hover:text-foreground'}`}
                >
                  {t.tabs.upload}
                </button>
             </div>

             {/* Content */}
             <div className="p-6 md:p-10 flex-1 flex flex-col">
                {true ? (
                  <div className="flex-1 border-2 border-dashed border-border rounded-xl bg-background flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                     {uploadedImages.length > 0 ? (
                       <div className="w-full space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                           {uploadedImages.map((img, idx) => (
                             <div key={idx} className="relative group">
                               <img 
                                 src={img.url} 
                                 alt={`Upload ${idx + 1}`} 
                                 className="w-full h-32 object-cover rounded-lg border border-border"
                               />
                               <button
                                 onClick={() => handleRemoveImage(idx)}
                                 className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                 <X size={14} className="text-white" />
                               </button>
                             </div>
                           ))}
                         </div>
                       <button
                          onClick={handleLocalUpload}
                          className="w-full py-2 rounded-lg border border-border bg-white dark:bg-zinc-800 text-foreground hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                        >
                          <Upload size={16} />
                          继续上传
                        </button>
                        <button
                          onClick={() => setShowEditModal(true)}
                          className="w-full py-2 rounded-lg border border-border bg-white dark:bg-zinc-800 text-foreground hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                        >
                          修改视频拟合比例
                        </button>
                      </div>
                     ) : (
                       <>
                     <div className="mb-6 p-4 rounded-full bg-surface border border-border">
                        <ImageIcon size={48} className="text-muted/50" />
                     </div>
                     <h3 className="text-lg font-medium text-foreground mb-2">{t.uploadArea.title}</h3>
                     <p className="text-xs text-muted max-w-md mb-6">{t.uploadArea.desc}</p>
                     <p className="text-[10px] text-muted/70 max-w-xs mb-8">{t.uploadArea.limitation}</p>
                     
                     <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                           <button 
                             onClick={handleSelectFromPortfolio}
                             className="flex-1 py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                           >
                           <FolderOpen size={16} />
                           {t.uploadArea.selectFromPortfolio}
                        </button>
                           <button 
                             onClick={handleLocalUpload}
                             disabled={isUploading}
                             className="flex-1 py-2.5 rounded-lg border border-border bg-white dark:bg-zinc-800 text-foreground hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-50"
                           >
                             {isUploading ? (
                               <Loader className="animate-spin" size={16} />
                             ) : (
                           <Upload size={16} />
                             )}
                           {t.uploadArea.uploadLocal}
                        </button>
                     </div>
                         <input
                           ref={fileInputRef}
                           type="file"
                           accept="image/*"
                           multiple
                           onChange={handleFileChange}
                           className="hidden"
                         />
                       </>
                     )}
                  </div>
                ) : null}
             </div>
          </div>

        </div>
      </div>

      {/* Footer: Excellent Cases */}
      <div className="px-4 md:px-8 max-w-7xl mx-auto w-full">
         <h2 className="text-xl font-bold text-foreground mb-6">{t.examples}</h2>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ExampleCard image="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop" />
            <ExampleCard image="https://images.unsplash.com/photo-1529139574466-a302c27e3844?q=80&w=400&auto=format&fit=crop" />
            <ExampleCard image="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400&auto=format&fit=crop" />
            <ExampleCard image="https://images.unsplash.com/photo-1485230946086-1d99d529c750?q=80&w=400&auto=format&fit=crop" />
         </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="bg-background min-h-full flex flex-col pb-12">
      {/* Step Progress Bar */}
      <div className="w-full bg-surface border-b border-border py-4 sticky top-0 z-20">
        <div className="container mx-auto max-w-5xl px-4 flex justify-center">
           <div className="flex items-center text-sm text-muted">
              <div className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors" onClick={() => setStep(1)}>
                 <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-xs">1</span>
                 <span>素材与卖点</span>
              </div>
              <ChevronRight size={16} className="mx-4 opacity-50" />
              <div className="flex items-center gap-2 text-indigo-600 font-bold">
                 <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
                 <span>选择脚本</span>
              </div>
              <ChevronRight size={16} className="mx-4 opacity-50" />
              <div className="flex items-center gap-2 opacity-50">
                 <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-xs">3</span>
                 <span>编辑分镜</span>
              </div>
              <ChevronRight size={16} className="mx-4 opacity-50" />
              <div className="flex items-center gap-2 opacity-50">
                 <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-xs">4</span>
                 <span>生成视频</span>
              </div>
           </div>
        </div>
      </div>

      {/* Header */}
      <div className="py-8 container mx-auto px-4 max-w-6xl">
         <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-foreground">请选择一个脚本</h1>
         </div>
         <p className="text-xs text-muted">以下内容由AI生成，产品处于持续学习调优阶段，其中可能有不准确或不恰当的信息，不代表绘蛙观点，请您谨慎甄别。</p>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-6xl flex-1 flex flex-col">
         {isGeneratingScripts ? (
           <div className="flex flex-col items-center justify-center py-20">
             <Loader className="animate-spin text-indigo-600" size={32} />
             <p className="mt-4 text-muted">正在生成脚本选项...</p>
           </div>
         ) : availableScripts.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20">
             <p className="text-muted mb-4">暂无脚本选项</p>
             <button
               onClick={generateScripts}
               className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
             >
               重新生成脚本
             </button>
           </div>
         ) : (
           <>
         {/* Script Category Tabs */}
         <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
                {availableScripts.map((script) => (
               <button
                     key={script.id}
                     onClick={() => handleScriptSelect(script.id)}
                 className={`flex-shrink-0 min-w-[160px] p-4 rounded-xl text-left transition-all border ${
                        selectedScript === script.id 
                    ? 'bg-white dark:bg-zinc-800 border-indigo-500/30 shadow-md' 
                    : 'bg-surface border-transparent hover:bg-white dark:hover:bg-zinc-800'
                 }`}
               >
                     <div className="font-bold text-foreground mb-1">{script.title}</div>
                     <div className="text-[10px] text-muted truncate mb-2">{script.subtitle}</div>
                 <div className="flex items-center gap-1 text-[10px] text-muted bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded w-fit">
                    <Clock size={10} />
                        {script.time}
                 </div>
               </button>
            ))}
         </div>

         {/* Script Table */}
             {isGeneratingStoryboard ? (
               <div className="flex items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-xl border border-border">
                 <div className="text-center">
                   <Loader className="animate-spin text-indigo-600 mx-auto" size={32} />
                   <p className="mt-4 text-muted">正在生成分镜详情...</p>
                 </div>
               </div>
             ) : storyboard ? (
         <div className="bg-white dark:bg-zinc-900 rounded-xl border border-border shadow-sm overflow-hidden mb-8">
            {/* Table Header */}
            <div className="grid grid-cols-12 bg-surface border-b border-border p-4 text-xs font-bold text-muted uppercase">
               <div className="col-span-1 text-center">分镜</div>
               <div className="col-span-2">画面</div>
               <div className="col-span-4">视频描述</div>
               <div className="col-span-5">台词</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-border">
                   {storyboard.scenes.map((item: any, idx: number) => (
                     <React.Fragment key={item.id || idx}>
                     {/* Shot 1 */}
                     <div className="grid grid-cols-12 p-4 gap-4 hover:bg-surface/30 transition-colors items-start">
                        <div className="col-span-1 flex justify-center pt-2">
                           <span className="font-bold text-lg text-slate-400">{item.scene}</span>
                        </div>
                        <div className="col-span-2">
                           <div className="aspect-video rounded-lg bg-slate-200 overflow-hidden border border-border">
                             <img src={item.shots[0]?.img || ''} alt="Shot 1" className="w-full h-full object-cover" />
                           </div>
                        </div>
                        <div className="col-span-4 text-sm text-foreground pt-1">
                           {item.shots[0]?.desc || ''}
                        </div>
                        {/* Line spans full height of the scene */}
                        <div className="col-span-5 text-sm text-foreground pt-1 row-span-2">
                           {item.lines}
                        </div>
                     </div>

                       {/* Shot 2 (if exists) */}
                     {item.shots[1] && (
                       <div className="grid grid-cols-12 p-4 pt-0 gap-4 hover:bg-surface/30 transition-colors items-start border-none">
                          <div className="col-span-1"></div>
                          <div className="col-span-2">
                             <div className="aspect-video rounded-lg bg-slate-200 overflow-hidden border border-border">
                                <img src={item.shots[1].img} alt="Shot 2" className="w-full h-full object-cover" />
                             </div>
                          </div>
                          <div className="col-span-4 text-sm text-foreground pt-1">
                             {item.shots[1].desc}
                          </div>
                          <div className="col-span-5"></div>
                       </div>
                     )}
                  </React.Fragment>
               ))}
            </div>
         </div>
             ) : (
               <div className="bg-white dark:bg-zinc-900 rounded-xl border border-border p-8 text-center text-muted mb-8">
                 请选择一个脚本查看分镜详情
               </div>
             )}
           </>
         )}
         
         {/* Bottom Actions */}
         <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 flex justify-between items-center mt-auto">
            <button className="flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors">
               <LayoutTemplate size={16} />
               全部任务
               <ChevronRight size={14} />
            </button>

            <button 
              onClick={() => {
                if (!storyboard) {
                  toast.error('请先选择脚本并生成分镜');
                  return;
                }
                setStep(3);
              }}
              disabled={!storyboard}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               喜欢此脚本，就它了
            </button>
         </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="bg-background min-h-full flex flex-col h-[calc(100vh-64px)]">
      {/* Top Navigation Bar */}
      <div className="border-b border-border bg-background p-4 flex items-center justify-between shrink-0">
         <button onClick={() => setStep(2)} className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border hover:bg-surface text-sm transition-colors">
            <ChevronLeft size={16} />
            上一步
         </button>

         <div className="flex items-center text-sm text-muted">
             {/* Stepper UI */}
             <div className="flex items-center gap-2 opacity-50 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setStep(1)}>1. 素材与卖点</div>
             <ChevronRight size={14} className="mx-2 opacity-30" />
             <div className="flex items-center gap-2 opacity-50 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setStep(2)}>2. 选择脚本</div>
             <ChevronRight size={14} className="mx-2 opacity-30" />
             <div className="flex items-center gap-2 font-bold text-indigo-600">3. 编辑分镜</div>
             <ChevronRight size={14} className="mx-2 opacity-30" />
             <div className="flex items-center gap-2 opacity-50">4. 生成视频</div>
         </div>

         <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-100 text-orange-600 text-sm hover:bg-orange-200 transition-colors font-medium">
               <BookOpen size={16} />
               智能混剪教程
            </button>
            <div className="w-px h-6 bg-border"></div>
            <button className="p-2 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors">
               <Trash2 size={18} />
            </button>
             <button 
               onClick={() => setStep(4)}
               className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border hover:bg-surface text-sm transition-colors"
             >
                下一步
                <ChevronRight size={16} />
            </button>
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-surface/30">
         <div className="max-w-[1600px] mx-auto">
            {/* Title Row */}
            <div className="flex items-baseline gap-4 mb-6">
               <h2 className="text-2xl font-bold text-foreground">{storyboard?.scriptTitle || editedStoryboard?.scriptTitle || '分镜编辑'}</h2>
               <span className="text-sm text-muted">{storyboard?.scriptSubtitle || editedStoryboard?.scriptSubtitle || ''}</span>
               <span className="text-sm text-muted border-l border-border pl-4 ml-2">预计总时长: {storyboard?.totalDuration || editedStoryboard?.totalDuration || '0s'}</span>
               <button
                 onClick={generateAllSceneVideos}
                 disabled={generatingScenes.length > 0}
                 className="ml-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
               >
                 {generatingScenes.length > 0 ? (
                   <>
                     <Loader className="animate-spin" size={16} />
                     生成中 ({generatingScenes.length})
                   </>
                 ) : (
                   '批量生成视频'
                 )}
               </button>
            </div>

            {/* Storyboard Cards - Horizontal Scroll */}
            {(editedStoryboard || storyboard) && (
            <div className="flex gap-6 overflow-x-auto pb-6">
                 {(editedStoryboard || storyboard).scenes.map((scene: any) => {
                   const video = storyboardVideos[scene.id];
                   const isGenerating = generatingScenes.includes(scene.id);
                   
                   return (
               <StoryboardCard 
                       key={scene.id}
                       index={scene.id}
                       images={scene.shots.map((shot: any) => shot.img)}
                       text={scene.lines}
                       onTextChange={(text) => updateSceneLines(scene.id, text)}
                       videoStatus={video?.status}
                       videoUrl={video?.url}
                       videoProgress={video?.progress}
                       isGenerating={isGenerating}
                       onGenerateVideo={() => generateSceneVideo(scene.id)}
                     />
                   );
                 })}
            </div>
            )}
         </div>
      </div>

      {/* Bottom Timeline Panel */}
      <div className="h-56 border-t border-border bg-background shrink-0 flex flex-col shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
         {/* Time Ruler */}
         <div className="h-8 border-b border-border flex items-end px-4 text-xs text-muted select-none bg-surface/50">
            <div className="flex-1 flex justify-between px-2">
               <span>00:00</span><span>00:10</span><span>00:20</span><span>00:30</span><span>00:40</span><span>00:50</span>
            </div>
            <div className="w-24 text-right border-l border-border pl-2">
               <span className="cursor-pointer hover:text-foreground flex items-center justify-end gap-1">
                 <ArrowRight size={12} className="rotate-90" /> 收起
               </span>
            </div>
         </div>
         {/* Tracks */}
         <div className="flex-1 p-4 overflow-x-auto custom-scrollbar">
             <div className="flex gap-1 h-full items-center pl-2">
                <TimelineItem index={1} img="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200" width="w-48" />
                <TimelineItem index={2} img="https://images.unsplash.com/photo-1529139574466-a302c27e3844?q=80&w=200" width="w-32" />
                <TimelineItem index={3} img="https://images.unsplash.com/photo-1485230946086-1d99d529c750?q=80&w=200" width="w-48" />
                <TimelineItem index={4} img="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=200" width="w-40" />
                <TimelineItem index={5} img="https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=200" width="w-48" />
             </div>
         </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="bg-background min-h-full flex flex-col h-[calc(100vh-64px)]">
       {/* Top Navigation - Reuse from Step 3 but update active state */}
       <div className="border-b border-border bg-background p-4 flex items-center justify-between shrink-0">
         <button onClick={() => setStep(3)} className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border hover:bg-surface text-sm transition-colors">
            <ChevronLeft size={16} />
            上一步
         </button>

         <div className="flex items-center text-sm text-muted">
             {/* Stepper */}
             <div className="flex items-center gap-2 opacity-50 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setStep(1)}>1. 素材与卖点</div>
             <ChevronRight size={14} className="mx-2 opacity-30" />
             <div className="flex items-center gap-2 opacity-50 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setStep(2)}>2. 选择脚本</div>
             <ChevronRight size={14} className="mx-2 opacity-30" />
             <div className="flex items-center gap-2 opacity-50 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setStep(3)}>3. 编辑分镜</div>
             <ChevronRight size={14} className="mx-2 opacity-30" />
             <div className="flex items-center gap-2 font-bold text-indigo-600">4. 生成视频</div>
         </div>

         <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-100 text-orange-600 text-sm hover:bg-orange-200 transition-colors font-medium">
               <BookOpen size={16} />
               智能混剪教程
            </button>
            <div className="w-px h-6 bg-border"></div>
            <button className="p-2 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors">
               <Trash2 size={18} />
            </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-surface/30">
         <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Video Player */}
            <div className="lg:col-span-2 space-y-4">
               <div>
                  <h2 className="text-xl font-bold text-foreground">生成结果</h2>
                  <p className="text-xs text-muted mt-1">因产品处于持续学习调优阶段，可能由不恰当的信息，请您谨慎甄别。</p>
                  <p className="text-xs text-muted mt-0.5">2025-11-18 20:37:39</p>
               </div>

               {isMerging ? (
                 <div className="aspect-[3/4] w-full max-w-2xl bg-black rounded-xl overflow-hidden relative flex items-center justify-center mx-auto lg:mx-0">
                   <div className="text-center text-white">
                     <Loader className="animate-spin mx-auto mb-4" size={32} />
                     <p>正在合并视频...</p>
                   </div>
                 </div>
               ) : finalVideoUrl ? (
                 <div className="aspect-[3/4] w-full max-w-2xl bg-black rounded-xl overflow-hidden relative group mx-auto lg:mx-0">
                   <video
                     ref={videoRef}
                     src={finalVideoUrl}
                     className="w-full h-full object-contain"
                     onPlay={() => setIsPlaying(true)}
                     onPause={() => setIsPlaying(false)}
                   />
                   
                   {/* Controls Overlay */}
                   <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center justify-between text-white">
                         <div className="flex items-center gap-4">
                            <button 
                              onClick={() => {
                                if (videoRef.current) {
                                  if (isPlaying) {
                                    videoRef.current.pause();
                                  } else {
                                    videoRef.current.play();
                                  }
                                }
                              }}
                              className="hover:text-indigo-400 transition-colors"
                            >
                              <Play size={24} fill={isPlaying ? "currentColor" : "none"} />
                            </button>
                            <button className="hover:text-indigo-400 transition-colors">
                              <Volume2 size={24} />
                            </button>
                            <span className="text-sm font-mono">
                              {videoRef.current ? formatDuration(videoRef.current.currentTime) : '00:00'} / {videoRef.current ? formatDuration(videoRef.current.duration) : '00:00'}
                            </span>
                         </div>
                         <div className="flex items-center gap-3">
                            <button 
                              onClick={handleDownloadVideo}
                              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg text-sm font-medium transition-colors"
                            >
                               <Download size={16} />
                               下载
                            </button>
                            <button className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg transition-colors">
                               <MoreHorizontal size={16} />
                            </button>
                         </div>
                      </div>
                      {/* Progress Bar */}
                      <div 
                        className="w-full h-1 bg-white/30 rounded-full mt-4 overflow-hidden cursor-pointer"
                        onClick={(e) => {
                          if (videoRef.current) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const percent = (e.clientX - rect.left) / rect.width;
                            videoRef.current.currentTime = percent * videoRef.current.duration;
                          }
                        }}
                      >
                         <div 
                           className="h-full bg-indigo-500 transition-all"
                           style={{ 
                             width: videoRef.current 
                               ? `${(videoRef.current.currentTime / videoRef.current.duration) * 100}%` 
                               : '0%' 
                           }}
                         />
                      </div>
                  </div>
               </div>
               ) : (
                 <div className="aspect-[3/4] w-full max-w-2xl bg-black rounded-xl overflow-hidden relative flex items-center justify-center mx-auto lg:mx-0">
                   <div className="text-center text-white">
                     <p className="mb-4">视频尚未生成</p>
                     <button
                       onClick={mergeAllVideos}
                       className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                     >
                       开始合并视频
                     </button>
                   </div>
                 </div>
               )}
            </div>

            {/* Right Column: Details */}
            <div className="space-y-8">
               <div>
                  <div className="flex items-center gap-2">
                     <h2 className="text-xl font-bold text-foreground">{analysisResult?.productName || '商品视频'}</h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted mt-1">
                     <span>视频编号: {videoId || '未生成'}</span>
                     {videoId && (
                       <Copy 
                         size={12} 
                         className="cursor-pointer hover:text-foreground"
                         onClick={() => {
                           navigator.clipboard.writeText(videoId);
                           toast.success('视频编号已复制');
                         }}
                       />
                     )}
                  </div>
               </div>

               {/* Product Info */}
               {uploadedImages.length > 0 && (
                 <div>
                    <h3 className="font-bold text-sm text-foreground mb-3">商品</h3>
                    <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                       <div className="w-12 h-12 rounded bg-slate-200 overflow-hidden">
                          <img src={uploadedImages[0].url} className="w-full h-full object-cover" alt="Product" />
                       </div>
                       <div>
                          <div className="font-bold text-sm text-foreground">{analysisResult?.productName || '商品'}</div>
                          <div className="text-xs text-muted">ID: {uploadedImages[0].id || 'N/A'}</div>
                       </div>
                    </div>
                 </div>
               )}

               {/* Selling Points */}
               {analysisResult && analysisResult.sellingPoints.length > 0 && (
                 <div>
                    <h3 className="font-bold text-sm text-foreground mb-3">商品卖点</h3>
                    <div className="text-sm text-muted leading-relaxed">
                       {analysisResult.sellingPoints.join('; ')}
                    </div>
                 </div>
               )}

               {/* Video Settings */}
               <div>
                  <h3 className="font-bold text-sm text-foreground mb-3">视频设置</h3>
                  <div className="space-y-3 text-sm">
                     <div className="flex justify-between">
                        <span className="text-muted">脚本</span>
                        <span className="text-foreground font-medium">{storyboard?.scriptTitle || editedStoryboard?.scriptTitle || 'N/A'}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-muted">比例</span>
                        <span className="text-foreground font-medium">3:4</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-muted">画质</span>
                        <span className="text-foreground font-medium">高清</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-muted">时长</span>
                        <span className="text-foreground font-medium">
                          {videoRef.current ? formatDuration(videoRef.current.duration) : storyboard?.totalDuration || '0s'}
                        </span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-muted">分镜数量</span>
                        <span className="text-foreground font-medium">
                          {(storyboard || editedStoryboard)?.scenes?.length || 0} 个
                        </span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );

  return (
    <>
      {step === 1 ? renderStep1() : step === 2 ? renderStep2() : step === 3 ? renderStep3() : renderStep4()}
      
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
          localStorage.setItem('viralVideo_images', JSON.stringify(edited));
        }}
      />
    </>
  );
};

// Helper for Storyboard Card
interface StoryboardCardProps {
  index: number;
  images: string[];
  text: string;
  onTextChange?: (text: string) => void;
  videoStatus?: 'pending' | 'processing' | 'succeeded' | 'failed';
  videoUrl?: string;
  videoProgress?: number;
  isGenerating?: boolean;
  onGenerateVideo?: () => void | Promise<void>;
}

const StoryboardCard: React.FC<StoryboardCardProps> = ({ 
  index, 
  images, 
  text, 
  onTextChange,
  videoStatus,
  videoUrl,
  videoProgress,
  isGenerating,
  onGenerateVideo
}) => {
  const [localText, setLocalText] = React.useState(text);

  React.useEffect(() => {
    setLocalText(text);
  }, [text]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setLocalText(newText);
    if (onTextChange) {
      onTextChange(newText);
    }
  };

  return (
  <div className="min-w-[400px] w-[400px] bg-background border border-border rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
      <div className="p-3 border-b border-border text-sm font-bold text-foreground flex items-center justify-between">
        <span>分镜 {index}</span>
        {videoStatus === 'succeeded' && (
          <CheckCircle2 size={16} className="text-green-500" />
        )}
        {isGenerating && (
          <Loader className="animate-spin" size={16} />
        )}
    </div>
    <div className="p-3 flex gap-2 h-64 bg-surface/50">
      {images.map((img, idx) => (
        <div key={idx} className="flex-1 h-full rounded-lg bg-gray-100 dark:bg-zinc-800 overflow-hidden relative border border-border/50">
           <img src={img} alt={`Shot ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        </div>
      ))}
    </div>
    <div className="p-4 bg-background border-t border-border flex-1 flex flex-col">
       <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted font-bold uppercase tracking-wider">台词</span>
            <span className="text-[10px] text-muted/60">{localText.length} 字</span>
       </div>
         <div className="relative flex-1 mb-3">
          <textarea 
              value={localText}
              onChange={handleTextChange}
            className="w-full h-24 bg-surface/30 rounded-lg border border-transparent focus:border-indigo-500/50 focus:bg-surface resize-none text-sm text-foreground focus:outline-none p-3 leading-relaxed transition-all"
          />
       </div>
         <div className="flex items-center gap-2">
           {videoStatus === 'succeeded' && videoUrl ? (
             <div className="flex-1 text-xs text-green-600 flex items-center gap-1">
               <CheckCircle2 size={12} />
               视频已生成
             </div>
           ) : videoStatus === 'processing' ? (
             <div className="flex-1">
               <div className="text-xs text-muted mb-1">生成中 {videoProgress || 0}%</div>
               <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-indigo-600 transition-all"
                   style={{ width: `${videoProgress || 0}%` }}
                 />
               </div>
             </div>
           ) : videoStatus === 'failed' ? (
             <div className="flex-1 text-xs text-red-600">生成失败</div>
           ) : null}
           <button
             onClick={onGenerateVideo}
             disabled={isGenerating || videoStatus === 'processing'}
             className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
           >
             {isGenerating || videoStatus === 'processing' ? (
               <>
                 <Loader className="animate-spin" size={12} />
                 生成中
               </>
             ) : videoStatus === 'succeeded' ? (
               '重新生成'
             ) : (
               '生成视频'
             )}
           </button>
         </div>
    </div>
  </div>
);
};

// Helper for Timeline Item
const TimelineItem = ({ index, img, width }: { index: number, img: string, width: string }) => (
    <div className={`${width} h-24 bg-surface border border-border rounded-lg overflow-hidden relative group cursor-pointer hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all shadow-sm`}>
       <img src={img} alt={`Clip ${index}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
       <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-[2px] text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
          {index}
       </div>
    </div>
);

const ExampleCard = ({ image }: { image: string }) => (
  <div className="aspect-[3/4] rounded-xl overflow-hidden relative group cursor-pointer bg-gray-100 dark:bg-zinc-800 border border-border">
     <img src={image} alt="Example" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
     <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="w-10 h-10 bg-white/30 backdrop-blur rounded-full flex items-center justify-center pl-1">
           <Play fill="white" className="text-white" size={16} />
        </div>
     </div>
  </div>
);

export default ViralVideoPage;
