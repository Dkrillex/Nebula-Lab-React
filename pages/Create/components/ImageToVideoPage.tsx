import React, { useState, useRef, useEffect } from 'react';
import { Video, UploadCloud, X, Wand2, Loader2, Play, Pause, Download, Trash2, Maximize2, Image as ImageIcon } from 'lucide-react';
import { imageToVideoService, I2VTaskResult } from '../../../services/imageToVideoService';
import { uploadService } from '../../../services/uploadService';

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
  fileId: string;
  fileName: string;
  fileUrl: string;
  file?: File;
}

const ImageToVideoPage: React.FC<ImageToVideoPageProps> = ({ t }) => {
  const [activeTab, setActiveTab] = useState<'traditional' | 'startEnd'>('traditional');
  
  // Inputs
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  
  // Images
  const [startImage, setStartImage] = useState<UploadedImage | null>(null);
  const [endImage, setEndImage] = useState<UploadedImage | null>(null);
  const [uploadingStart, setUploadingStart] = useState(false);
  const [uploadingEnd, setUploadingEnd] = useState(false);

  // Settings
  const [quality, setQuality] = useState<'lite' | 'pro' | 'best'>('pro');
  const [duration, setDuration] = useState<number>(5);

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVideos, setGeneratedVideos] = useState<I2VTaskResult[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<I2VTaskResult | null>(null);

  // Refs
  const startFileInputRef = useRef<HTMLInputElement>(null);
  const endFileInputRef = useRef<HTMLInputElement>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Cleanup
  useEffect(() => {
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'start' | 'end') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const setUploading = type === 'start' ? setUploadingStart : setUploadingEnd;
    const setImage = type === 'start' ? setStartImage : setEndImage;

    try {
      setUploading(true);
      const res = await uploadService.uploadFile(file);
      if (res.code === 200 && res.data) {
        setImage({
          fileId: res.data.id,
          fileName: res.data.originalName || file.name,
          fileUrl: res.data.url,
          file: file
        });
      } else {
        console.error('Upload failed:', res);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const startPolling = (taskId: string, isVolcano: boolean, isStartEnd: boolean) => {
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
          
          // Map status to unified check
          const isSuccess = ['succeeded', 'success', 'completed', 'done'].includes(status.toLowerCase());
          const isFailed = ['failed', 'fail', 'error'].includes(status.toLowerCase());
          
          if (isSuccess) {
             if (pollingInterval.current) clearInterval(pollingInterval.current);
             if (progressInterval.current) clearInterval(progressInterval.current);
             setProgress(100);
             
             // Extract URLs based on response structure
             let videoUrl = taskData.videoUrl;
             let coverUrl = taskData.coverUrl;

             // Volcano structure
             if (taskData.content) {
               videoUrl = taskData.content.video_url || videoUrl;
               coverUrl = taskData.content.last_frame_url || coverUrl;
             }

             if (videoUrl) {
                const newVideo: I2VTaskResult = {
                  ...taskData,
                  videoUrl: videoUrl,
                  coverUrl: coverUrl,
                  status: 'success',
                  id: taskData.id || taskId, 
                  taskId: taskId
                };

                setGeneratedVideos(prev => [newVideo, ...prev]);
                setSelectedVideo(newVideo);
             }
             setIsGenerating(false);
          } else if (isFailed) {
             if (pollingInterval.current) clearInterval(pollingInterval.current);
             if (progressInterval.current) clearInterval(progressInterval.current);
             setIsGenerating(false);
             const errorMsg = taskData.error || taskData.errorMsg || taskData.message || 'Unknown error';
             alert(`Generation failed: ${errorMsg}`);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000); // Poll every 5s
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    if (activeTab === 'traditional' && !startImage) {
      alert('Please upload an image first');
      return;
    }
    if (activeTab === 'startEnd' && (!startImage || !endImage)) {
      alert('Please upload both start and end images');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    // Simulated progress
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return 90;
        return prev + Math.floor(Math.random() * 2) + 1;
      });
    }, 500);

    try {
      let taskId = '';
      let isVolcano = false;
      let isStartEnd = false;

      if (activeTab === 'traditional') {
        // Traditional Mode
        isVolcano = quality === 'lite'; // 'plus' is also volcano but let's simplify for now or check options
        // Wait, quality options are 'lite', 'pro', 'best'. 
        // Service logic: 'lite'/'plus' => Volcano. 'pro'/'best' => Topview.
        // Let's assume 'lite' is volcano.
        
        // Correction: Service checks data.mode === 'lite' || data.mode === 'plus'
        
        const res = await imageToVideoService.submitTraditional({
          imageFileId: startImage!.fileId,
          imageUrl: startImage!.fileUrl,
          prompt,
          negativePrompt,
          mode: quality, // 'lite' | 'pro' | 'best'
          duration: duration,
          score: 0.3 // Default cost
        });

        if (res.code === 200 && res.data) {
          taskId = res.data.taskId || res.data.id || '';
          if (taskId) {
             startPolling(taskId, quality === 'lite', false);
          } else {
            throw new Error('No task ID returned');
          }
        } else {
          throw new Error(res.msg || 'Submission failed');
        }

      } else {
        // Start/End Mode
        if (!endImage?.fileUrl) { // Check fileUrl instead of file since we need the URL
           throw new Error('End image file is missing');
        }
        isStartEnd = true;
        
        const res = await imageToVideoService.submitStartEnd({
          imageUrls: [startImage!.fileUrl, endImage!.fileUrl],
          prompt,
          duration: duration,
          score: 0.3
        });

        if (res.code === 200 && res.data) {
          taskId = res.data.taskId || res.data.id || '';
          if (taskId) {
             startPolling(taskId, false, true);
          } else {
            throw new Error('No task ID returned');
          }
        } else {
          throw new Error(res.msg || 'Submission failed');
        }
      }

    } catch (error: any) {
      console.error('Generation error:', error);
      alert(error.message || 'Generation failed');
      setIsGenerating(false);
      if (progressInterval.current) clearInterval(progressInterval.current);
      setProgress(0);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-border py-6 px-8">
        <h1 className="text-2xl font-bold mb-2 text-foreground">{t.title}</h1>
        <p className="text-muted opacity-90">{t.subtitle}</p>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel - Settings */}
        <div className="w-full md:w-[400px] lg:w-[450px] bg-surface border-r border-border flex flex-col p-6 overflow-y-auto custom-scrollbar">
          
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
          </div>

          {/* Upload Section */}
          <div className="mb-6">
            <h3 className="font-bold text-foreground mb-3">{t.upload.label}</h3>
            
            <div className="flex gap-4">
               {/* Start Image */}
               <div className="flex-1">
                  <input 
                    type="file" 
                    ref={startFileInputRef}
                    onChange={(e) => handleUpload(e, 'start')}
                    className="hidden" 
                    accept="image/png, image/jpeg"
                  />
                  {startImage ? (
                    <div className="relative rounded-xl overflow-hidden border-2 border-indigo-500 group h-32">
                      <img src={startImage.fileUrl} alt="Start" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => setStartImage(null)}
                          className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] p-1 text-center truncate">
                        {activeTab === 'startEnd' ? 'Start Frame' : 'Reference'}
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => !uploadingStart && startFileInputRef.current?.click()}
                      className={`border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                        uploadingStart ? 'bg-slate-50' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {uploadingStart ? (
                        <Loader2 size={20} className="animate-spin text-indigo-600 mb-1" />
                      ) : (
                        <UploadCloud size={24} className="text-slate-400 mb-1" />
                      )}
                      <span className="text-xs text-muted text-center px-2">
                        {activeTab === 'startEnd' ? 'Start Frame' : t.upload.desc}
                      </span>
                    </div>
                  )}
               </div>

               {/* End Image (Only for StartEnd) */}
               {activeTab === 'startEnd' && (
                 <div className="flex-1">
                    <input 
                      type="file" 
                      ref={endFileInputRef}
                      onChange={(e) => handleUpload(e, 'end')}
                      className="hidden" 
                      accept="image/png, image/jpeg"
                    />
                    {endImage ? (
                      <div className="relative rounded-xl overflow-hidden border-2 border-indigo-500 group h-32">
                        <img src={endImage.fileUrl} alt="End" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={() => setEndImage(null)}
                            className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] p-1 text-center truncate">
                          End Frame
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => !uploadingEnd && endFileInputRef.current?.click()}
                        className={`border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                          uploadingEnd ? 'bg-slate-50' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {uploadingEnd ? (
                          <Loader2 size={20} className="animate-spin text-indigo-600 mb-1" />
                        ) : (
                          <UploadCloud size={24} className="text-slate-400 mb-1" />
                        )}
                        <span className="text-xs text-muted text-center px-2">End Frame</span>
                      </div>
                    )}
                 </div>
               )}
            </div>
          </div>

          {/* Prompt */}
          <div className="mb-6">
            <h3 className="font-bold text-foreground mb-3">{t.prompt.label}</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t.prompt.placeholder}
              className="w-full h-28 p-4 rounded-xl border border-border bg-background resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm mb-3"
              disabled={isGenerating}
            />
            <input 
               type="text"
               value={negativePrompt}
               onChange={(e) => setNegativePrompt(e.target.value)}
               placeholder={t.negativePrompt.placeholder}
               className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-xs"
               disabled={isGenerating}
            />
          </div>

          {/* Settings */}
          <div className="mb-8 space-y-6">
             {/* Quality */}
             <div>
                <label className="text-sm font-medium text-muted mb-3 block">{t.quality.label}</label>
                <div className="grid grid-cols-3 gap-2">
                   {(['lite', 'pro', 'best'] as const).map(q => (
                     <button
                       key={q}
                       onClick={() => setQuality(q)}
                       className={`py-2 rounded-lg text-sm border transition-all ${
                         quality === q 
                           ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' 
                           : 'border-border hover:border-indigo-300'
                       }`}
                     >
                       {q === 'lite' ? t.quality.options.lite : q === 'pro' ? t.quality.options.pro : t.quality.options.best}
                     </button>
                   ))}
                </div>
             </div>

             {/* Duration */}
             <div>
                <label className="text-sm font-medium text-muted mb-3 block">{t.duration.label}</label>
                <div className="flex items-center gap-4">
                   <input 
                     type="range" 
                     min="5" 
                     max="12" 
                     step="1"
                     value={duration}
                     onChange={(e) => setDuration(parseInt(e.target.value))}
                     className="flex-1"
                   />
                   <span className="text-sm font-bold w-12 text-right">{duration}{t.duration.units}</span>
                </div>
             </div>
          </div>

          {/* Generate Button */}
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !startImage || (activeTab === 'startEnd' && !endImage)}
            className="mt-auto w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transform transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
             {isGenerating ? (
               <>
                 <Loader2 size={18} className="animate-spin" />
                 Generating... {progress}%
               </>
             ) : (
               <>
             <Wand2 size={18} />
             {t.generate}
               </>
             )}
          </button>
        </div>

        {/* Right Panel - Result & History */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-8 flex flex-col relative overflow-hidden">
           {/* Header */}
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold text-foreground">{t.result.label}</h2>
             {generatedVideos.length > 0 && (
               <button 
                 onClick={() => { setGeneratedVideos([]); setSelectedVideo(null); }}
                 className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
               >
                 <Trash2 size={14} /> Clear History
               </button>
             )}
           </div>

           {/* Main Preview Area */}
           <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 mb-6 relative overflow-hidden min-h-[300px]">
              {isGenerating && progress > 0 ? (
                <div className="flex flex-col items-center gap-4 z-10">
                   <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                   <p className="text-indigo-600 font-medium">AI is rendering your video... {progress}%</p>
                </div>
              ) : selectedVideo && selectedVideo.videoUrl ? (
                <div className="relative w-full h-full flex items-center justify-center p-4 group">
                  <video 
                    src={selectedVideo.videoUrl} 
                    poster={selectedVideo.coverUrl}
                    controls 
                    className="max-w-full max-h-full rounded-lg shadow-lg object-contain"
                    autoPlay
                    loop
                  />
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <a 
                        href={selectedVideo.videoUrl} 
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
                <div className="flex flex-col items-center text-slate-400">
                   <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                      <Video size={40} className="text-slate-400 dark:text-slate-500" />
                   </div>
                   <p className="text-sm max-w-xs text-center">{t.result.emptyState}</p>
                </div>
              )}
           </div>

           {/* History Thumbs */}
           {generatedVideos.length > 0 && (
             <div className="h-28 flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
               {generatedVideos.map((vid, idx) => (
                 <div 
                   key={vid.taskId || idx}
                   onClick={() => setSelectedVideo(vid)}
                   className={`relative w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all bg-black ${
                     selectedVideo?.taskId === vid.taskId ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-transparent hover:border-indigo-300'
                   }`}
                 >
                   {vid.coverUrl ? (
                     <img src={vid.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                   ) : (
                     <video 
                       src={vid.videoUrl} 
                       className="w-full h-full object-cover opacity-80" 
                       muted 
                     />
                   )}
                   {/* Status Indicator */}
                   {vid.status !== 'success' && vid.status !== 'succeeded' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <span className="text-xs text-white">{vid.status}</span>
                      </div>
                   )}
                   <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 rounded-full backdrop-blur-sm">
                     Video
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ImageToVideoPage;
