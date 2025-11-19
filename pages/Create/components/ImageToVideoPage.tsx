import React, { useState, useRef, useEffect } from 'react';
import { Video, UploadCloud, X, Wand2, Loader2, Play, Pause, Download, Trash2, Maximize2 } from 'lucide-react';
import { imageToVideoService, I2VTaskResult } from '../../../services/imageToVideoService';
import { uploadService } from '../../../services/uploadService';
import { request } from '../../../lib/request';

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
    };
    duration: {
      label: string;
      units: string;
    };
    negativePrompt: {
      label: string;
      placeholder: string;
    };
    generate: string;
    result: {
      label: string;
      emptyState: string;
    };
  };
}

interface UploadedImage {
  fileId: string; // OSS ID or File ID (empty if pending upload)
  fileName: string;
  fileUrl: string; // Local blob URL initially, then OSS URL if needed (but blob URL is fine for display)
  file?: File; // Keep original file
}

const ImageToVideoPage: React.FC<ImageToVideoPageProps> = ({ t }) => {
  const [activeTab, setActiveTab] = useState<'traditional' | 'startEnd'>('traditional');
  
  // Common State
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<I2VTaskResult | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Traditional Mode State
  const [traditionalImage, setTraditionalImage] = useState<UploadedImage | null>(null);
  const [quality, setQuality] = useState<'lite' | 'plus' | 'pro' | 'best'>('lite');
  const [duration, setDuration] = useState(5);
  const [generatingCount, setGeneratingCount] = useState(1);

  // Start/End Mode State
  const [startImage, setStartImage] = useState<UploadedImage | null>(null);
  const [endImage, setEndImage] = useState<UploadedImage | null>(null);

  // Upload Handling
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);
  const traditionalInputRef = useRef<HTMLInputElement>(null);

  // Updated: Just local preview, no immediate upload
  const handleUpload = (file: File, type: 'traditional' | 'start' | 'end') => {
    const blobUrl = URL.createObjectURL(file);
    const imgData: UploadedImage = {
      fileId: '', // Pending upload
      fileName: file.name,
      fileUrl: blobUrl,
      file: file 
    };

    if (type === 'traditional') setTraditionalImage(imgData);
    else if (type === 'start') setStartImage(imgData);
    else if (type === 'end') setEndImage(imgData);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'traditional' | 'start' | 'end') => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0], type);
    }
    // Reset input value to allow re-selecting same file
    if (e.target) e.target.value = '';
  };

  // Helper to ensure image is uploaded to OSS if needed
  const uploadImageToOss = async (image: UploadedImage): Promise<UploadedImage> => {
    if (image.fileId) return image; // Already uploaded
    if (!image.file) throw new Error('No file object found');

    const res = await uploadService.uploadFile(image.file);
    if (res.code === 200 && res.data) {
      return {
        ...image,
        fileId: res.data.ossId,
        fileUrl: res.data.url // Update to remote URL
      };
    } else {
      throw new Error(res.msg || 'Image upload failed');
    }
  };

  // Calculate integral/score based on quality and duration
  const calculateScore = (mode: 'lite' | 'plus' | 'pro' | 'best', duration: number): number => {
    if (mode === 'lite') {
      switch (duration) {
        case 3: return 2;
        case 5: return 3;
        case 8: return 3.5;
        case 10: return 4;
        case 12: return 4.5;
        default: return 4;
      }
    } else if (mode === 'plus') {
      switch (duration) {
        case 5: return 5;
        case 10: return 6;
        case 12: return 7;
        default: return 5;
      }
    } else if (mode === 'pro') {
      switch (duration) {
        case 5: return 8;
        case 10: return 10;
        default: return 8;
      }
    } else if (mode === 'best') {
      switch (duration) {
        case 5: return 10;
        case 10: return 20;
        case 12: return 5;
        default: return 10;
      }
    }
    return 4; // Default
  };

  const startPolling = (taskId: string, isVolcano: boolean = false, isStartEnd: boolean = false) => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);
    
    pollingInterval.current = setInterval(async () => {
      try {
        let res;
        if (isStartEnd) {
            res = await imageToVideoService.queryStartEnd(taskId);
        } else {
            res = await imageToVideoService.queryTraditional(taskId, isVolcano);
        }
        
        if (res.code === 200 && res.data) {
          const status = res.data.status;
          const taskData = res.data;
          
          // 火山引擎可能返回不同的状态值，需要兼容处理
          // 火山引擎成功状态是 "succeeded"，其他可能是 "success", "completed", "done"
          if (status === 'succeeded' || status === 'success' || status === 'completed' || status === 'done') {
             if (pollingInterval.current) clearInterval(pollingInterval.current);
             if (progressInterval.current) clearInterval(progressInterval.current);
             setProgress(100);
             
             // 提取视频URL：优先从 content.video_url（火山引擎），其次从 videoUrl（Topview）
             const videoUrl = taskData.content?.video_url || taskData.videoUrl;
             const coverUrl = taskData.content?.last_frame_url || taskData.coverUrl;
             
             // 设置生成的视频数据
             setGeneratedVideo({
               ...taskData,
               videoUrl: videoUrl,
               coverUrl: coverUrl || undefined,
               status: 'success'
             });
             setIsGenerating(false);
          } else if (status === 'failed' || status === 'fail' || status === 'error') {
             if (pollingInterval.current) clearInterval(pollingInterval.current);
             if (progressInterval.current) clearInterval(progressInterval.current);
             setIsGenerating(false);
             const errorMsg = taskData.error || taskData.errorMsg || taskData.message || 'Unknown error';
             console.error('Task failed:', errorMsg);
             alert(`Generation failed: ${errorMsg}`);
          }
          // 'init', 'processing', 'running', 'pending' -> continue polling
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 10000); // Poll every 10 seconds (video generation takes longer)
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setProgress(0);
    setGeneratedVideo(null);

    // Fake progress for UX
    progressInterval.current = setInterval(() => {
      setProgress(prev => (prev >= 90 ? 90 : prev + 1));
    }, 500);

    try {
      if (activeTab === 'traditional') {
        if (!traditionalImage) {
            alert('Please upload an image first.');
            setIsGenerating(false);
            return;
        }

        // 1. Ensure image is uploaded
        const uploadedImg = await uploadImageToOss(traditionalImage);
        setTraditionalImage(uploadedImg); // Update state with remote ID/URL

        // 2. Calculate score
        const score = calculateScore(quality, duration);

        // 3. Submit Task
        const res = await imageToVideoService.submitTraditional({
            imageFileId: uploadedImg.fileId,
            imageUrl: uploadedImg.fileUrl,
            prompt,
            negativePrompt,
            mode: quality,
            duration,
            generatingCount,
            score
        });

        if (res.code === 200 && res.data) {
            const isVolcano = quality === 'lite' || quality === 'plus';
            // 火山引擎返回的是 id，Topview 返回的是 taskId
            const taskId = res.data.id || res.data.taskId;
            if (!taskId) {
                throw new Error(res.data.msg || res.data.message || 'Task ID not found');
            }
            startPolling(taskId, isVolcano, false);
        } else {
            throw new Error(res.msg || 'Submission failed');
        }

      } else if (activeTab === 'startEnd') {
        if (!startImage || !endImage) {
            alert('Please upload both start and end images.');
            setIsGenerating(false);
            return;
        }
        
        // 1. Upload both images to OSS
        const uploadedStartImg = await uploadImageToOss(startImage);
        const uploadedEndImg = await uploadImageToOss(endImage);
        setStartImage(uploadedStartImg);
        setEndImage(uploadedEndImg);

        // 2. Calculate score (use default duration 10 for start/end mode)
        const score = calculateScore('lite', duration || 10);

        // 3. Submit Task using textOrImage2videoSubmit with both image URLs
        const startEndParams = {
            image_urls: [uploadedStartImg.fileUrl, uploadedEndImg.fileUrl],
            prompt: prompt || '',
            duration: (duration || 10).toString(),
            score
        };
        
        const finalRes = await request.post('/tp/v1/textOrImage2videoSubmit', startEndParams);

        if (finalRes.code === 200 && finalRes.data) {
            const taskId = finalRes.data.id || finalRes.data.taskId;
            if (!taskId) {
                throw new Error(finalRes.data.msg || finalRes.data.message || 'Task ID not found');
            }
            startPolling(taskId, true, true); // Use volcano query for start/end mode
        } else {
            throw new Error(finalRes.msg || 'Submission failed');
        }
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      alert(error.message || 'Generation failed');
      setIsGenerating(false);
      if (progressInterval.current) clearInterval(progressInterval.current);
    }
  };

  useEffect(() => {
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const renderUploadBox = (
    image: UploadedImage | null, 
    type: 'traditional' | 'start' | 'end', 
    label?: string
  ) => (
    <div className="relative group">
        {label && <label className="block text-sm font-medium text-muted mb-2">{label}</label>}
        <div 
            onClick={() => {
                if (type === 'traditional') traditionalInputRef.current?.click();
                else if (type === 'start') startInputRef.current?.click();
                else if (type === 'end') endInputRef.current?.click();
            }}
            className={`
                relative w-full aspect-video rounded-xl border-2 border-dashed border-border 
                bg-surface hover:border-indigo-500 hover:bg-indigo-50/10 transition-all cursor-pointer
                flex flex-col items-center justify-center overflow-hidden
                ${image ? 'border-solid border-indigo-500/50' : ''}
            `}
        >
            {image ? (
                <>
                    <img src={image.fileUrl} alt="Upload" className="w-full h-full object-contain" />
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (type === 'traditional') setTraditionalImage(null);
                            else if (type === 'start') setStartImage(null);
                            else if (type === 'end') setEndImage(null);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={14} />
                    </button>
                </>
            ) : (
                <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                        <UploadCloud size={24} />
                    </div>
                    <p className="text-sm font-medium text-foreground">{t.upload.button}</p>
                    <p className="text-xs text-muted mt-1">{t.upload.desc}</p>
                </div>
            )}
        </div>
        {/* Hidden Inputs */}
        {type === 'traditional' && <input type="file" ref={traditionalInputRef} className="hidden" accept=".jpg,.jpeg,.png" onChange={(e) => onFileChange(e, 'traditional')} />}
        {type === 'start' && <input type="file" ref={startInputRef} className="hidden" accept=".jpg,.jpeg,.png" onChange={(e) => onFileChange(e, 'start')} />}
        {type === 'end' && <input type="file" ref={endInputRef} className="hidden" accept=".jpg,.jpeg,.png" onChange={(e) => onFileChange(e, 'end')} />}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-border py-6 px-8">
        <h1 className="text-2xl font-bold mb-2 text-foreground">{t.title}</h1>
        <p className="text-muted opacity-90">{t.subtitle}</p>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
         {/* Left Settings Panel */}
         <div className="w-full md:w-[400px] lg:w-[450px] bg-surface border-r border-border flex flex-col p-6 overflow-y-auto custom-scrollbar">
            
            {/* Tabs */}
            <div className="flex mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-1 rounded-full gap-1">
                <button
                    onClick={() => setActiveTab('traditional')}
                    className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                        activeTab === 'traditional' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    {t.tabs.traditional}
                </button>
                <button
                    onClick={() => setActiveTab('startEnd')}
                    className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                        activeTab === 'startEnd' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    {t.tabs.startEnd}
                </button>
            </div>

            {/* Upload Section */}
            <div className="space-y-4 mb-6">
                {activeTab === 'traditional' ? (
                    renderUploadBox(traditionalImage, 'traditional')
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {renderUploadBox(startImage, 'start', 'Start Frame')}
                        {renderUploadBox(endImage, 'end', 'End Frame')}
                    </div>
                )}
            </div>

            {/* Prompt Section */}
            <div className="space-y-4 mb-6">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-foreground">{t.prompt.label}</label>
                        <button className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700">
                            <Wand2 size={12} /> {t.prompt.polish}
                        </button>
                    </div>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t.prompt.placeholder}
                        className="w-full h-32 p-3 rounded-xl border border-border bg-background resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                        maxLength={t.prompt.maxLength}
                    />
                </div>
                
                {activeTab === 'traditional' && (
                    <div>
                         <label className="text-sm font-medium text-foreground mb-2 block">{t.quality.label}</label>
                         <div className="grid grid-cols-3 gap-2">
                             {(['lite', 'pro', 'best'] as const).map((q) => (
                                 <button
                                    key={q}
                                    onClick={() => setQuality(q)}
                                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                                        quality === q 
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                                        : 'border-border bg-background text-muted hover:border-indigo-300'
                                    }`}
                                 >
                                     {(t.quality.options as any)[q] || q.toUpperCase()}
                                 </button>
                             ))}
                         </div>
                    </div>
                )}

                <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">{t.duration.label}</label>
                    <div className="flex gap-2">
                         {[5, 10].map((d) => (
                             <button
                                key={d}
                                onClick={() => setDuration(d)}
                                className={`flex-1 py-2 rounded-lg text-sm border transition-all ${
                                    duration === d
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                    : 'border-border bg-background text-muted hover:border-indigo-300'
                                }`}
                             >
                                 {d}{t.duration.units}
                             </button>
                         ))}
                    </div>
                </div>

                {/* Generating Count - Only for Traditional if needed, simulated via UI */}
                {activeTab === 'traditional' && (
                    <div>
                         <label className="text-sm font-medium text-foreground mb-2 block">Generate Count: {generatingCount}</label>
                         <input 
                            type="range" 
                            min="1" 
                            max="4" 
                            value={generatingCount} 
                            onChange={(e) => setGeneratingCount(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                         />
                         <div className="flex justify-between text-xs text-muted mt-1">
                             <span>1</span><span>4</span>
                         </div>
                    </div>
                )}

                <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">{t.negativePrompt.label}</label>
                    <textarea
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder={t.negativePrompt.placeholder}
                        className="w-full h-20 p-3 rounded-xl border border-border bg-background resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                    />
                </div>
            </div>

            <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="mt-auto w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transform transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isGenerating ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        Generating... {progress}%
                    </>
                ) : (
                    <>
                        <Video size={18} />
                        {t.generate}
                    </>
                )}
            </button>
         </div>

         {/* Right Result Panel */}
         <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-8 flex flex-col relative overflow-hidden">
            <h2 className="text-xl font-bold text-foreground mb-6">{t.result.label}</h2>
            
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 mb-6 relative overflow-hidden min-h-[300px]">
                 {isGenerating ? (
                     <div className="text-center">
                         <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto mb-4"></div>
                         <p className="text-indigo-600 font-medium">AI is rendering your video...</p>
                         <p className="text-sm text-muted mt-1">This may take a few minutes</p>
                     </div>
                 ) : generatedVideo && generatedVideo.videoUrl ? (
                     <div className="relative w-full h-full max-w-2xl flex items-center justify-center group">
                         <video 
                            src={generatedVideo.videoUrl} 
                            poster={generatedVideo.coverUrl}
                            controls 
                            className="max-w-full max-h-full rounded-lg shadow-lg"
                            autoPlay
                            loop
                         />
                         <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <a 
                                href={generatedVideo.videoUrl} 
                                download 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm"
                                title="Download"
                             >
                                 <Download size={20} />
                             </a>
                         </div>
                     </div>
                 ) : (
                     <div className="text-center text-muted">
                         <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                             <Video size={40} className="text-slate-400 dark:text-slate-500" />
                         </div>
                         <p className="max-w-xs mx-auto">{t.result.emptyState}</p>
                     </div>
                 )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default ImageToVideoPage;
