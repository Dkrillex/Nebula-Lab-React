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
  // Updated State to hold multiple videos
  const [generatedVideos, setGeneratedVideos] = useState<I2VTaskResult[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<I2VTaskResult | null>(null);

  // ...

  const startPolling = (taskId: string, isVolcano: boolean = false, isStartEnd: boolean = false) => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);
    
    pollingInterval.current = setInterval(async () => {
      try {
        let res;
        if (isStartEnd) {
            res = await imageToVideoService.queryTraditional(taskId, true);
        } else {
            res = await imageToVideoService.queryTraditional(taskId, isVolcano);
        }
        
        if (res.code === 200 && res.data) {
          const status = res.data.status;
          const taskData = res.data;
          
          if (status === 'succeeded' || status === 'success' || status === 'completed' || status === 'done') {
             if (pollingInterval.current) clearInterval(pollingInterval.current);
             if (progressInterval.current) clearInterval(progressInterval.current);
             setProgress(100);
             
             const videoUrl = taskData.content?.video_url || taskData.videoUrl;
             const coverUrl = taskData.content?.last_frame_url || taskData.coverUrl;
             
             const newVideo: I2VTaskResult = {
               ...taskData,
               videoUrl: videoUrl,
               coverUrl: coverUrl || undefined,
               status: 'success',
               // Ensure unique ID if not present, use taskId or timestamp
               id: taskData.id || taskId, 
               taskId: taskId
             };

             setGeneratedVideos(prev => [newVideo, ...prev]);
             setSelectedVideo(newVideo);
             setGeneratedVideo(newVideo); // Keep for compatibility if needed, but better rely on selectedVideo
             setIsGenerating(false);
          } else if (status === 'failed' || status === 'fail' || status === 'error') {
             // ... existing error handling ...
             if (pollingInterval.current) clearInterval(pollingInterval.current);
             if (progressInterval.current) clearInterval(progressInterval.current);
             setIsGenerating(false);
             const errorMsg = taskData.error || taskData.errorMsg || taskData.message || 'Unknown error';
             console.error('Task failed:', errorMsg);
             alert(`Generation failed: ${errorMsg}`);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 10000);
  };

  // ... in handleGenerate ...
    setIsGenerating(true);
    setProgress(0);
    // Don't clear selectedVideo immediately to keep previous result visible until new one starts or finishes
    // setGeneratedVideo(null); 

  // ... in render ...

         {/* Right Result Panel */}
         <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-8 flex flex-col relative overflow-hidden">
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
            
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 mb-6 relative overflow-hidden min-h-[300px]">
                 {isGenerating ? (
                     <div className="text-center">
                         <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto mb-4"></div>
                         <p className="text-indigo-600 font-medium">AI is rendering your video...</p>
                         <p className="text-sm text-muted mt-1">This may take a few minutes</p>
                     </div>
                 ) : selectedVideo && selectedVideo.videoUrl ? (
                     <div className="relative w-full h-full max-w-2xl flex items-center justify-center group p-4">
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
                     <div className="text-center text-muted">
                         <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                             <Video size={40} className="text-slate-400 dark:text-slate-500" />
                         </div>
                         <p className="max-w-xs mx-auto">{t.result.emptyState}</p>
                     </div>
                 )}
            </div>

            {/* Video History Thumbs */}
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
                                <img src={vid.coverUrl} alt="Video Cover" className="w-full h-full object-cover" />
                            ) : (
                                <video src={vid.videoUrl} className="w-full h-full object-cover" muted onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} />
                            )}
                            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">
                                Video
                            </div>
                        </div>
                    ))}
                </div>
            )}
         </div>

export default ImageToVideoPage;
