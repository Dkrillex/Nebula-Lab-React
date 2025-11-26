import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Video, UploadCloud, X, Wand2, Loader2, Play, Download, Plus, Settings2, Info, Maximize2, FolderPlus, Check } from 'lucide-react';
import { imageToVideoService, I2VTaskResult } from '../../../services/imageToVideoService';
import { textToImageService } from '../../../services/textToImageService';
import { useVideoGenerationStore } from '../../../stores/videoGenerationStore';
import { useAuthStore } from '../../../stores/authStore';
import { showAuthModal } from '../../../lib/authModalManager';
import toast from 'react-hot-toast';
import AddMaterialModal from '../../../components/AddMaterialModal';
import { AdsAssetsVO } from '../../../services/assetsService';
import UploadComponent from '../../../components/UploadComponent';
import { UploadedFile } from '../../../services/avatarService';

import demoProduct from '../../../assets/demo/1111.png';

// Model Interfaces (commented out - Advanced Mode not open to public yet)
// interface ModelItem {
//   id: string;
//   name: string;
//   icon: string;
//   score: number;
//   duration: string;
//   description?: string;
// }
//
// const MODELS: ModelItem[] = [
//   ...
// ];

const TRADITIONAL_DURATIONS = [3, 5, 8, 10, 12];

interface ImageToVideoPageProps {
  t: {
    title: string;
    subtitle: string;
    tabs: {
      traditional: string;
      startEnd: string;
      advanced: string;
    };
    upload: {
      label: string;
      button: string;
      desc: string;
    };
    trySample: string;
    generationSettings: string;
    prompt: {
      label: string;
      placeholder: string;
      polish: string;
      maxLength: number;
    };
    quality: {
      label: string;
      options: {
        lite: string;
        pro: string;
        best: string;
      };
      tips: {
        lite: string;
        pro: string;
        best: string;
      };
    };
    duration: {
      label: string;
      units: string;
    };
    generatingCount: string;
    negativePrompt: {
      label: string;
      placeholder: string;
    };
    generate: string;
    actions: {
      clearAll: string;
      downloadAll: string;
    };
    result: {
      label: string;
      emptyState: string;
      previewActions: {
        fullscreen: string;
        download: string;
        addToMaterials: string;
      };
    };
    generating?: string;
    progressStatusShort?: string;
  };
}

interface UploadedImage {
  fileId: string;
  fileName: string;
  fileUrl: string;
  file?: File;
}

const ImageToVideoPage: React.FC<ImageToVideoPageProps> = ({ t }) => {
  const [searchParams] = useSearchParams();
  const { getData } = useVideoGenerationStore();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'traditional' | 'startEnd'>('traditional');
  
  const qualityOptions = [
    { label: 'lite', display: t.quality.options.lite, tips: t.quality.tips.lite },
    { label: 'plus', display: t.quality.options.pro, tips: t.quality.tips.pro },
    { label: 'best', display: t.quality.options.best, tips: t.quality.tips.best }
  ];

  // --- Common Inputs ---
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);

  // --- Traditional / StartEnd Inputs ---
  const [startImage, setStartImage] = useState<UploadedImage | null>(null);
  const [endImage, setEndImage] = useState<UploadedImage | null>(null);
  const [quality, setQuality] = useState<'lite' | 'plus' | 'pro' | 'best'>('lite');
  const [duration, setDuration] = useState<number>(5);
  const [generatingCount, setGeneratingCount] = useState<number>(1);

  // --- Advanced (MultiModel) Inputs --- (commented out - Advanced Mode not open to public yet)
  // const [advancedImages, setAdvancedImages] = useState<UploadedImage[]>([]);
  // const [advancedModelId, setAdvancedModelId] = useState<string>('seedance-1-0-lite');
  // const [advancedDuration, setAdvancedDuration] = useState<string>('5');
  // const [uploadingAdvanced, setUploadingAdvanced] = useState(false);
  
  // --- Generation State ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVideos, setGeneratedVideos] = useState<I2VTaskResult[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<I2VTaskResult | null>(null);

  // --- Material Import ---
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialData, setMaterialData] = useState<Partial<AdsAssetsVO>>({});

  // --- Refs ---
  // const advancedFileInputRef = useRef<HTMLInputElement>(null); // Advanced Mode not open to public yet
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Handle "Make Same Style" data transfer
  useEffect(() => {
    const transferId = searchParams.get('transferId');
    if (transferId) {
      try {
        const data = getData(transferId);
        if (data) {
          if (data.sourcePrompt) {
            setPrompt(data.sourcePrompt);
          }
          if (data.images && data.images.length > 0) {
            // Traditional mode import
            setStartImage({
              fileId: `temp_${Date.now()}`,
              fileName: 'reference_image.png',
              fileUrl: data.images[0]
            });
            // Advanced mode import (commented out - Advanced Mode not open to public yet)
            // setAdvancedImages([{
            //   fileId: `temp_${Date.now()}`,
            //   fileName: 'reference_image.png',
            //   fileUrl: data.images[0]
            // }]);
          }
        }
      } catch (error) {
        console.error('Failed to load transfer data:', error);
      }
    }
  }, [searchParams, getData]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  // Validate Duration on Tab/Model Change
  useEffect(() => {
    if (activeTab === 'startEnd') {
      if (![5, 10].includes(duration)) {
        setDuration(5);
      }
    }
  }, [activeTab]);

  // Validate Duration when Best mode is selected
  useEffect(() => {
    if (activeTab === 'traditional' && quality === 'best' && ![5, 10].includes(duration)) {
      setDuration(5);
    }
  }, [activeTab, quality, duration]);

  // Advanced Mode validation (commented out - Advanced Mode not open to public yet)
  // useEffect(() => {
  //   if (activeTab === 'multiModel') {
  //     const isVeo2 = advancedModelId === 'veo2';
  //     const validDurations = isVeo2 ? ['5', '8'] : ['5', '10'];
  //     if (!validDurations.includes(advancedDuration)) {
  //       setAdvancedDuration('5');
  //     }
  //   }
  // }, [advancedModelId, activeTab]);

  // --- Score Calculation ---
  const calculatedScore = useMemo(() => {
    if (activeTab === 'startEnd') {
       return duration === 5 ? 4 : 5;
    } else {
      let base = 0;
      if (quality === 'best') {
        // Best模式只支持5、10秒
        if (duration === 5) base = 10;
        else if (duration === 10) base = 20;
        else base = 10; // 默认值，但应该被禁用
      } else if (quality === 'lite') {
        // lite模式：3、5、8、10、12秒对应2、3、3.5、4、5积分
        if(duration === 3) base = 2;
        else if(duration === 5) base = 3;
        else if(duration === 8) base = 3.5;
        else if(duration === 10) base = 4;
        else if(duration === 12) base = 5;
      } else if (quality === 'plus') { // UI显示为Pro
        // pro模式：3、5、8、10、12秒对应3、5、8、10、12积分
        if(duration === 3) base = 3;
        else if(duration === 5) base = 5;
        else if(duration === 8) base = 8;
        else if(duration === 10) base = 10;
        else if(duration === 12) base = 12;
      } else if (quality === 'pro') { // Legacy/Hidden
         if (duration === 5) base = 4;
         else if (duration === 10) base = 5;
         else if (duration === 12) base = 5;
      }
      return base * generatingCount;
    }
  }, [activeTab, quality, duration, generatingCount]);

  // --- Helpers ---
  // Try Sample Task
  const handleTrySample = async () => {
    // Use a demo image from public assets or a placeholder URL
    // Assuming we have a demo product image similar to Vue version
    const demoImageUrl = demoProduct;
    
    try {
      // Create a file object from the URL (simulated)
      const response = await fetch(demoImageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'demo-product.webp', { type: 'image/webp' });
      
      const demoImage: UploadedImage = {
        fileId: 'demo_id_' + Date.now(),
        fileName: 'demo-product.webp',
        fileUrl: demoImageUrl, // In real app, this might need to be uploaded first to get a valid ID/URL for backend
        file: file
      };

      // For Start/End mode sample, usually we might set just start or both?
      // Vue code: sets upload ref fileRes and prompt.
      setStartImage(demoImage);
      // Also set as end image for Start/End mode sample
      setEndImage(demoImage); 
      
      setPrompt('The kitten is running on the grass');
      setNegativePrompt('Distortion, abstraction, deformation, blurring');
      
      // If sample needs end image, we should set it too, or maybe sample is for Traditional mode in Vue?
      // Vue code `tryTask` sets `UseMyPhotoUploadRef` which is for Traditional/StartEnd logic.
      // Let's assume it sets the start image.
      
      toast.success('Sample data loaded');
    } catch (error) {
      console.error('Failed to load sample:', error);
      toast.error('Failed to load sample data');
    }
  };

  const mapUploadedFile = (uploadedFile: UploadedFile): UploadedImage => ({
    fileId: uploadedFile.fileId,
    fileName: uploadedFile.fileName,
    fileUrl: uploadedFile.fileUrl || ''
  });

  const handleStartUploadComplete = (uploadedFile: UploadedFile) => {
    setStartImage(mapUploadedFile(uploadedFile));
  };

  const handleEndUploadComplete = (uploadedFile: UploadedFile) => {
    setEndImage(mapUploadedFile(uploadedFile));
  };

  const handleUploadError = (error: Error) => {
    toast.error(error.message || 'Upload failed');
  };

  const handleStartClear = () => setStartImage(null);
  const handleEndClear = () => setEndImage(null);

  // Advanced Mode functions (commented out - Advanced Mode not open to public yet)
  // const removeAdvancedImage = (index: number) => {
  //   setAdvancedImages(prev => prev.filter((_, i) => i !== index));
  // };

  const handleTextPolish = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isAuthenticated) {
      showAuthModal();
      return;
    }
    
    const textToPolish = prompt;
    if (!textToPolish.trim()) return;
    
    setIsPolishing(true);
    try {
      const polishedText = await textToImageService.polishText({
        text: textToPolish,
        type: 'image_to_video'
      });

      if (polishedText && typeof polishedText === 'string') {
        setPrompt(polishedText);
        toast.success(t.prompt.polish + ' ' + t.result.label); // Or use dedicated success message
      } else {
        throw new Error('No polished text returned');
      }
    } catch (error: any) {
      console.error('Polishing failed:', error);
      toast.error(error.message || 'Failed to polish text');
    } finally {
      setIsPolishing(false);
    }
  };

  // --- Polling ---
  const startPolling = (taskId: string, mode: 'traditional' | 'startEnd', extraArgs?: any) => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);
    
    let pollCount = 0;
    pollingInterval.current = setInterval(async () => {
      try {
        pollCount++;
        if (pollCount > 120) {
           if (pollingInterval.current) clearInterval(pollingInterval.current);
           setIsGenerating(false);
           toast.error('Generation timed out');
           return;
        }

        let res;
        if (mode === 'traditional') {
           res = await imageToVideoService.queryTraditional(taskId, extraArgs?.isVolcano);
        } else {
           res = await imageToVideoService.queryStartEnd(taskId);
        }
        // Handle different response structures
        const responseData = res.data || (res as any).result || res;
        if (!responseData) return;

        // Normalize status
        let status = responseData.status || responseData.task_status;
        if (!status && (res as any).status) status = (res as any).status; // Handle top-level status if any

        const isSuccess = ['succeeded', 'success', 'completed', 'done'].includes(status?.toLowerCase());
        const isFailed = ['failed', 'fail', 'error', 'expired'].includes(status?.toLowerCase());
        
        if (isSuccess) {
           if (pollingInterval.current) clearInterval(pollingInterval.current);
           if (progressInterval.current) clearInterval(progressInterval.current);
           setProgress(100);
           
           let videoUrl = responseData.videoUrl || responseData.video_url || responseData.file_url;
           let coverUrl = responseData.coverUrl || responseData.cover_url;

           if (responseData.content) {
             videoUrl = responseData.content.video_url || videoUrl;
             coverUrl = responseData.content.last_frame_url || coverUrl;
           }
           
           if (Array.isArray(responseData.videos) && responseData.videos.length > 0) {
              const v = responseData.videos[0];
              if (v.originVideo) videoUrl = v.originVideo.filePath;
              else if (v.url) videoUrl = v.url;
           }

           if (videoUrl) {
              const newVideo: I2VTaskResult = {
                ...responseData,
                videoUrl: videoUrl,
                coverUrl: coverUrl,
                status: 'success',
                id: taskId,
                taskId: taskId
              };
              setGeneratedVideos(prev => [newVideo, ...prev]);
              setSelectedVideo(newVideo);
           } else {
              toast.error('Task succeeded but no video URL found');
           }
           setIsGenerating(false);
        } else if (isFailed) {
           if (pollingInterval.current) clearInterval(pollingInterval.current);
           if (progressInterval.current) clearInterval(progressInterval.current);
           setIsGenerating(false);
           const errorMsg = responseData.error || responseData.errorMsg || responseData.message || 'Generation failed';
           toast.error(errorMsg);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000);
  };

  // --- Submit ---
  const handleGenerate = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isAuthenticated) {
      showAuthModal();
      return;
    }
    
    if (isGenerating) return;
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (activeTab === 'traditional' && !startImage) {
      toast.error('Please upload an image');
      return;
    }
    if (activeTab === 'startEnd' && (!startImage || !endImage)) {
      toast.error('Please upload both start and end images');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return 90;
        return prev + Math.floor(Math.random() * 3) + 1;
      });
    }, 800);

    try {
      let taskId = '';
      
      if (activeTab === 'traditional') {
         const res = await imageToVideoService.submitTraditional({
           imageFileId: startImage!.fileId,
           imageUrl: startImage!.fileUrl,
           prompt,
           negativePrompt,
           mode: quality,
           duration: duration,
           generatingCount: generatingCount,
           score: calculatedScore
         });
         // Determine if we should use Volcano polling (lite/plus/pro)
         // Based on submitTraditional logic in service file
         const isVolcano = ['lite', 'plus', 'pro'].includes(quality); 
         
         // Normalize response data (handle potential unwrapped response)
         const responseData = (res as any).data || res;
         
         if ((res as any).code === 200 || responseData.id || responseData.taskId) {
            // Support both id (Volcano) and taskId (Topview)
            taskId = responseData.taskId || responseData.id || '';
            if (!taskId) {
               throw new Error((res as any).msg || 'No taskId returned');
            }
            startPolling(taskId, 'traditional', { isVolcano });
         } else {
            throw new Error((res as any).msg || 'Submission failed');
         }

      } else if (activeTab === 'startEnd') {
         if (!startImage?.fileUrl) {
            toast.error('Please upload start image');
            setIsGenerating(false);
            return;
         }
         if (!endImage?.fileUrl) {
            toast.error('Please upload end image');
            setIsGenerating(false);
            return;
         }
         
         const res = await imageToVideoService.submitStartEnd({
           imageUrls: [startImage.fileUrl, endImage.fileUrl],
           prompt,
           duration: duration,
           score: calculatedScore
         });
         
         const responseData = (res as any).data || res;
         if ((res as any).code === 200 || responseData.id || responseData.taskId) {
            taskId = responseData.taskId || responseData.id || '';
            startPolling(taskId, 'startEnd');
         } else {
            throw new Error((res as any).msg || 'Submission failed');
         }
      }

    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Generation failed');
      setIsGenerating(false);
      if (progressInterval.current) clearInterval(progressInterval.current);
      setProgress(0);
    }
  };

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // --- Handle Download ---
  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `generated-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Download started');
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  const handleDownloadAll = async () => {
    if (generatedVideos.length === 0) return;
    
    toast.success('Starting batch download...');
    for (const video of generatedVideos) {
      if (video.videoUrl) {
        await handleDownload(video.videoUrl);
        // Delay to prevent browser blocking multiple downloads
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  // --- Import to Material ---
  const handleImportClick = () => {
    if (!selectedVideo || !selectedVideo.videoUrl) return;
    setMaterialData({
      assetUrl: selectedVideo.videoUrl,
      assetName: `AI Video - ${new Date().toLocaleString()}`,
      assetType: 4, // Video
    });
    setShowMaterialModal(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="w-full border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10">
        <div className="px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t.title}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 opacity-90">{t.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel - Settings */}
        <div className="w-full md:w-[400px] lg:w-[450px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col p-6 overflow-y-auto custom-scrollbar">
          
          {/* Tabs */}
          <div className="mb-6 flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-1 rounded-lg gap-1">
            <button
              onClick={() => setActiveTab('traditional')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'traditional' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {t.tabs.traditional}
            </button>
            <button
              onClick={() => setActiveTab('startEnd')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'startEnd' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {t.tabs.startEnd}
            </button>
            {/* Advanced Mode tab hidden - not open to public yet */}
          </div>

          {/* --- Traditional & StartEnd Content --- */}
          {(activeTab === 'traditional' || activeTab === 'startEnd') && (
             <>
               <div className="mb-6">
                  <h3 className="text-sm font-bold mb-3 text-foreground">{t.upload.label}</h3>
                  <div className="flex gap-4">
                     <div className="flex-1 relative">
                        <UploadComponent
                          onUploadComplete={handleStartUploadComplete}
                          onClear={handleStartClear}
                          onError={handleUploadError}
                          uploadType="oss"
                          accept="image/png, image/jpeg, image/jpg"
                          maxSize={10}
                          immediate={true}
                          initialUrl={startImage?.fileUrl || ''}
                          className="h-32"
                        >
                          <div className="h-full flex flex-col items-center justify-center text-center px-2 text-muted-foreground">
                            <UploadCloud className="text-slate-400 dark:text-slate-500 mb-1" size={24} />
                            <span className="text-xs font-medium">{t.upload.button}</span>
                            <span className="text-[10px] text-muted mt-1">{t.upload.desc}</span>
                          </div>
                        </UploadComponent>
                        {startImage && (
                          <div className="pointer-events-none absolute inset-x-2 bottom-2 bg-black/70 text-white text-[10px] p-1 rounded text-center truncate">
                            {startImage.fileName || (activeTab === 'startEnd' ? 'Start Frame' : 'Reference')}
                          </div>
                        )}
                     </div>
                     
                     {activeTab === 'startEnd' && (
                        <div className="flex-1 relative">
                           <UploadComponent
                             onUploadComplete={handleEndUploadComplete}
                             onClear={handleEndClear}
                             onError={handleUploadError}
                             uploadType="oss"
                             accept="image/png, image/jpeg, image/jpg"
                             maxSize={10}
                             immediate={true}
                             initialUrl={endImage?.fileUrl || ''}
                             className="h-32"
                           >
                             <div className="h-full flex flex-col items-center justify-center text-center px-2 text-muted-foreground">
                               <UploadCloud className="text-slate-400 dark:text-slate-500 mb-1" size={24} />
                               <span className="text-xs font-medium">{t.upload.button}</span>
                               <span className="text-[10px] text-muted mt-1">{t.upload.desc}</span>
                             </div>
                           </UploadComponent>
                           {endImage && (
                             <div className="pointer-events-none absolute inset-x-2 bottom-2 bg-black/70 text-white text-[10px] p-1 rounded text-center truncate">
                               {endImage.fileName || 'End Frame'}
                             </div>
                           )}
                        </div>
                     )}
                  </div>
               </div>
             </>
          )}

          {/* --- Advanced Content --- */}
          {/* Advanced Mode hidden - not open to public yet */}

          {/* --- Common Settings --- */}
          <div className="mb-6">
             <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t.prompt.label}</h3>
                <button 
                   onClick={(e) => handleTextPolish(e)} 
                   disabled={isPolishing || !prompt || isGenerating}
                   className="flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-3 py-1.5 rounded-lg shadow hover:shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                >
                   {isPolishing ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                   {t.prompt.polish}
                </button>
             </div>
             <div className="relative">
               <textarea
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 placeholder={t.prompt.placeholder}
                 maxLength={t.prompt.maxLength}
                 className="w-full h-28 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 resize-none text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none pr-16"
               />
               <span className="absolute bottom-3 right-3 text-[10px] text-gray-400">{prompt.length}/{t.prompt.maxLength}</span>
             </div>
          </div>

          {/* Specific Settings */}
          {activeTab === 'traditional' && (
             <div className="space-y-6 mb-8">
                {/* Quality */}
               <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">{t.quality.label}</label>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                     {qualityOptions.map((q) => (
                        <button
                           key={q.label}
                           onClick={() => {
                              setQuality(q.label as any);
                              // Auto-switch duration if Best and current duration not supported
                              if (q.label === 'best' && ![5, 10].includes(duration)) {
                                setDuration(5);
                              }
                           }}
                           className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-all group relative ${
                               quality === q.label 
                                 ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' 
                                 : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                         >
                            {q.display}
                            {/* Custom Tooltip on Hover */}
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-[10px] text-white bg-black/80 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                              {q.tips}
                            </span>
                         </button>
                      ))}
                   </div>
                </div>
                
                {/* Generating Count (Only for Best) */}
                {/* {(quality === 'best') && (
                   <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
                         {t.generatingCount} {generatingCount}
                      </label>
                      <input 
                         type="range" 
                         min="1" 
                         max="4" 
                         step="1"
                         value={generatingCount}
                         onChange={(e) => setGeneratingCount(parseInt(e.target.value))}
                         className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
                         <span>1</span><span>2</span><span>3</span><span>4</span>
                      </div>
                   </div>
                )} */}

                {/* Duration */}
                <div>
                   <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">{t.duration.label}</label>
                   <div className="flex flex-wrap gap-2">
                      {TRADITIONAL_DURATIONS.map((d) => (
                         <button
                            key={d}
                            onClick={() => {
                               setDuration(d);
                               // Auto-switch quality if Best and duration not supported
                               if (quality === 'best' && ![5, 10].includes(d)) {
                                 setQuality('lite');
                               }
                            }}
                            disabled={quality === 'best' && ![5, 10].includes(d)}
                            className={`px-3 py-1.5 rounded-md text-xs border transition-all ${
                               duration === d 
                                  ? 'border-indigo-500 bg-indigo-50 text-indigo-600 font-bold dark:bg-indigo-900/30 dark:text-indigo-400' 
                                  : 'border-border hover:border-indigo-300 text-gray-600'
                            } ${quality === 'best' && ![5, 10].includes(d) ? 'opacity-30 cursor-not-allowed' : ''}`}
                         >
                            {d}s
                         </button>
                      ))}
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'startEnd' && (
             <div className="space-y-6 mb-8">
                <div>
                   <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">{t.duration.label}</label>
                   <div className="flex gap-2">
                      {[5, 10].map((d) => (
                         <button
                            key={d}
                            onClick={() => setDuration(d)}
                            className={`px-4 py-2 rounded-md text-xs border transition-all ${
                               duration === d 
                                 ? 'border-indigo-500 bg-indigo-50 text-indigo-600 font-bold dark:bg-indigo-900/30 dark:text-indigo-400' 
                                 : 'border-border hover:border-indigo-300 text-gray-600'
                            }`}
                         >
                            {d}s
                         </button>
                      ))}
                   </div>
                </div>
             </div>
          )}

          {/* Advanced Mode duration settings hidden - not open to public yet */}

          {/* Negative Prompt */}
          <div className="mb-8">
             <div className="flex justify-between items-center mb-2">
               <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{t.negativePrompt.label}</h3>
               <span className="text-[10px] text-gray-400">{negativePrompt.length}/1500</span>
             </div>
             <textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder={t.negativePrompt.placeholder}
                maxLength={1500}
                className="w-full h-32 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
             />
          </div>
          <div className="mt-auto space-y-3">
            {/* Try Sample Button (Only for StartEnd) */}
            {activeTab === 'startEnd' && (
               <button
                  onClick={handleTrySample}
                  disabled={isGenerating}
                  className="w-full py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
               >
                  {t.trySample}
               </button>
            )}
            {/* Generate Button */}
            <button 
              onClick={(e) => handleGenerate(e)}
              disabled={
                isGenerating || 
                (activeTab === 'traditional' && (!startImage || !prompt.trim())) ||
                (activeTab === 'startEnd' && (!startImage || !endImage))
              }
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transform transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {isGenerating ? (
                 <>
                   <Loader2 size={18} className="animate-spin" />
                   {t.progressStatusShort} {progress}%
                 </>
               ) : (
                 <>
                   <Wand2 size={18} />
                   {calculatedScore} {t.credits || '积分'}
                 </>
               )}
            </button>

            {/* <div className="flex gap-2">
               <button
                 onClick={() => {
                   setGeneratedVideos([]);
                   setSelectedVideo(null);
                 }}
                 disabled={generatedVideos.length === 0}
                 className="flex-1 py-2 border border-border hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 {t.actions.clearAll}
               </button>
               <button
                 onClick={handleDownloadAll}
                 disabled={generatedVideos.length === 0}
                 className="flex-1 py-2 border border-border hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm text-muted-foreground flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 <Download size={14} /> {t.actions.downloadAll}
               </button>
            </div> */}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-8 flex flex-col relative overflow-hidden">
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
               <Video className="w-5 h-5" /> {t.result.label}
             </h2>
           </div>

           {/* Main Preview Area */}
           <div className="w-full h-[450px] shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 mb-6 relative overflow-hidden">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-4 z-10">
                   <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                   <p className="text-indigo-600 font-medium">{t.generating || 'Generating your masterpiece...'} {progress}%</p>
                </div>
              ) : selectedVideo ? (
                <div className="flex flex-col items-center w-full h-full">
                  <div className="relative w-full h-full flex items-center justify-center p-4 group flex-1 min-h-0">
                    <video 
                      src={selectedVideo.videoUrl} 
                      poster={selectedVideo.coverUrl}
                      controls
                      autoPlay
                      loop
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                      onError={(e) => console.error('Video error', e)}
                    />
                  </div>
                  
                  <div className="flex gap-4 pb-2">
                      <button 
                        onClick={() => setIsPreviewOpen(true)}
                        className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-full transition-colors"
                        title={t.result.previewActions.fullscreen}
                      >
                        <Maximize2 size={20} />
                      </button>
                      <button 
                        onClick={() => handleDownload(selectedVideo.videoUrl)}
                        className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-full transition-colors"
                        title={t.result.previewActions.download}
                      >
                        <Download size={20} />
                      </button>
                      <button 
                        onClick={handleImportClick}
                        className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-full transition-colors"
                        title={t.result.previewActions.addToMaterials}
                      >
                        <FolderPlus size={20} />
                      </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                   <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                      <Video size={40} className="opacity-50 text-slate-400 dark:text-slate-500" />
                   </div>
                   <p className="text-sm max-w-xs text-center">{t.result.emptyState}</p>
              </div>
              )}
           </div>

           {/* History Strip */}
           {generatedVideos.length > 0 && (
             <div className="h-24 flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
               {generatedVideos.map((vid) => (
                 <div 
                   key={vid.id}
                   onClick={() => setSelectedVideo(vid)}
                   className={`relative aspect-video h-full rounded-lg overflow-hidden cursor-pointer border-2 transition-all bg-slate-800 ${
                     selectedVideo?.id === vid.id ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-transparent opacity-70 hover:opacity-100'
                   }`}
                 >
                    {vid.coverUrl ? (
                       <img src={vid.coverUrl} className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                         <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                           <Play size={20} className="text-white/80 ml-0.5" />
                         </div>
                       </div>
                    )}
                    <div className="absolute bottom-1 right-1 text-[10px] bg-black/60 text-white px-1 rounded">
                       {vid.status}
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

      <AddMaterialModal
        isOpen={showMaterialModal}
        onClose={() => setShowMaterialModal(false)}
        onSuccess={() => {
        }}
        initialData={materialData}
        disableAssetTypeSelection={true}
        isImportMode={true}
      />

      {/* Full Screen Preview Modal */}
      {isPreviewOpen && selectedVideo && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsPreviewOpen(false)}
        >
          <button 
            onClick={() => setIsPreviewOpen(false)}
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={32} />
          </button>
          <video 
            src={selectedVideo.videoUrl} 
            controls
            autoPlay
            className="max-w-full max-h-full object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
};

export default ImageToVideoPage;
