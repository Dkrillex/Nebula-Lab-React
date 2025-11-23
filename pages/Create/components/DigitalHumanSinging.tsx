import React, { useState, useRef, useEffect } from 'react';
import { Upload, Music, Image as ImageIcon, Loader, X, Play, CheckCircle, Trash2, Plus, Video, Download, Check } from 'lucide-react';
import { avatarService } from '@/services/avatarService';
import { uploadService } from '@/services/uploadService';
import AddMaterialModal from '@/components/AddMaterialModal';
import toast from 'react-hot-toast';

const SvgPointsIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 1024 1024" 
    version="1.1" 
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <path d="M913.7 430.7c2.9-2.9 7.5-7.4-3.9-21.7L722.6 159.7H302.8l-187 248.9c-11.6 14.6-7 19.2-4.3 21.9l401.2 410.4 401-410.2zM595.5 667.2c-7.7 0-14-6.3-14-14s6.3-14 14-14 14 6.3 14 14c0 7.8-6.3 14-14 14zM746 502.8c6.6 6.6 6.6 17.2 0 23.7L645.2 627.3c-3.3 3.3-7.6 4.9-11.9 4.9-4.3 0-8.6-1.6-11.9-4.9-6.6-6.6-6.6-17.2 0-23.7l100.7-100.7c6.7-6.7 17.3-6.7 23.9-0.1zM346 358.1c-6.7-6.5-6.8-17.1-0.4-23.7 6.4-6.7 17.1-6.8 23.7-0.4l149.6 145 151.5-146.8c6.7-6.5 17.3-6.3 23.7 0.4 6.5 6.7 6.3 17.3-0.4 23.7L535.2 509.9c-0.8 1.8-1.8 3.5-3.3 5-3.3 3.4-7.7 5.1-12.1 5.1-4.2 0-8.4-1.6-11.7-4.7L346 358.1z" fill="#006be6" />
    <path d="M936.4 388.4l-192-255.6c-3.2-4.2-8.1-6.7-13.4-6.7H294.4c-5.3 0-10.3 2.5-13.4 6.7L89.3 388.1c-27.1 34.1-10 57.7-1.6 66.1l413 422.5c3.2 3.2 7.5 5.1 12 5.1s8.8-1.8 12-5.1l412.8-422.4c8.7-8.5 25.7-32.1-1.1-65.9z m-820.5 20.2l187-248.9h419.8L909.9 409c11.3 14.3 6.8 18.8 3.9 21.7l-401 410.2-401.2-410.4c-2.8-2.7-7.3-7.3 4.3-21.9z" fill="#ffffff" className="selected" />
    <path d="M532 514.9c1.4-1.5 2.5-3.2 3.3-5l158.6-153.7c6.7-6.5 6.8-17.1 0.4-23.7-6.5-6.7-17.1-6.8-23.7-0.4L519 478.9 369.4 334c-6.7-6.4-17.3-6.3-23.7 0.4-6.5 6.7-6.3 17.3 0.4 23.7l162.2 157.2c3.3 3.2 7.5 4.7 11.7 4.7 4.3 0 8.7-1.7 12-5.1zM621.5 627.3c3.3 3.3 7.6 4.9 11.9 4.9 4.3 0 8.6-1.6 11.9-4.9L746 526.5c6.6-6.6 6.6-17.2 0-23.7-6.6-6.6-17.2-6.6-23.7 0L621.5 603.5c-6.6 6.6-6.6 17.2 0 23.8z" fill="#ffffff" className="selected" />
    <path d="M595.5 653.3m-14 0a14 14 0 1 0 28 0 14 14 0 1 0-28 0Z" fill="#ffffff" />
  </svg>
);

interface DigitalHumanSingingProps {
  t: any;
  handleFileUpload: (file: File, type: 'image' | 'audio') => Promise<any>;
  uploading: boolean;
  setErrorMessage: (msg: string | null) => void;
}

interface GeneratedVideo {
  id: string;
  url: string;
  timestamp: number;
  addState?: boolean;
}

const DigitalHumanSinging: React.FC<DigitalHumanSingingProps> = ({
  t,
  handleFileUpload,
  uploading,
  setErrorMessage
}) => {
  const [imageFile, setImageFile] = useState<{ fileId: string, url: string } | null>(null);
  const [audioFile, setAudioFile] = useState<{ fileId: string, url: string } | null>(null);
  
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  
  // History
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);

  // Drag and Drop states
  const [isImageDragOver, setIsImageDragOver] = useState(false);
  const [isAudioDragOver, setIsAudioDragOver] = useState(false);

  // Add Material Modal
  const [showMaterialModal, setShowMaterialModal] = useState(false);

  // Upload Loading States
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isAudioUploading, setIsAudioUploading] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const onUpload = async (file: File, type: 'image' | 'audio') => {
    if (file) {
      try {
        if (type === 'image') setIsImageUploading(true);
        else setIsAudioUploading(true);

        const uploaded = await handleFileUpload(file, type);
        // 适配接口返回的 fileUrl 用于回显和提交
        const fileData = {
            ...uploaded,
            url: uploaded.fileUrl || uploaded.url
        };

        if (type === 'image') setImageFile(fileData);
        else setAudioFile(fileData);
      } catch (error) {
        // Handled by parent
      } finally {
        if (type === 'image') setIsImageUploading(false);
        else setIsAudioUploading(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => {
    const file = e.target.files?.[0];
    if (file) onUpload(file, type);
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent, type: 'image' | 'audio') => {
    e.preventDefault();
    if (type === 'image') setIsImageDragOver(true);
    else setIsAudioDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent, type: 'image' | 'audio') => {
    e.preventDefault();
    if (type === 'image') setIsImageDragOver(false);
    else setIsAudioDragOver(false);
  };

  const handleDrop = (e: React.DragEvent, type: 'image' | 'audio') => {
    e.preventDefault();
    if (type === 'image') setIsImageDragOver(false);
    else setIsAudioDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (type === 'image' && !file.type.startsWith('image/')) {
        toast.error('请上传图片文件');
        return;
      }
      if (type === 'audio' && !file.type.startsWith('audio/')) {
        toast.error('请上传音频文件');
        return;
      }
      onUpload(file, type);
    }
  };

  const clearAll = () => {
    setImageFile(null);
    setAudioFile(null);
    setResultVideoUrl(null);
    setGenerating(false);
    setProgress(0);
    setTaskId(null);
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const handleGenerate = async () => {
    if (!imageFile || !audioFile) return;

    try {
      setGenerating(true);
      setProgress(0);
      setResultVideoUrl(null);

      const res = await avatarService.submitSingingAvatarTask({
        image_url: imageFile.url,
        audio_url: audioFile.url,
        score: 7
      });

      if ((res as any).task_id || (res.data as any)?.task_id) {
          const newTaskId = (res as any).task_id || (res.data as any)?.task_id;
          setTaskId(newTaskId);
          pollTask(newTaskId);
      } else {
          throw new Error('任务提交失败');
      }

    } catch (error: any) {
      toast.error(error.message || '生成失败');
      setGenerating(false);
    }
  };

  const pollTask = async (currentTaskId: string) => {
      const interval = 5000;
      const maxAttempts = 60; // 5 minutes
      let attempts = 0;

      const check = async () => {
          try {
              const res = await avatarService.querySingingAvatarTask(currentTaskId);
              const data = (res as any).data || res; // Handle response structure
              const status = data.status;

              if (status === 'done' && data.video_url) {
                  let finalUrl = data.video_url;
                  try {
                    // 生成成功后，将视频转存到 OSS
                    const ossInfo = await uploadService.uploadByVideoUrl(data.video_url, 'mp4');
                    // 使用转存后的 OSS URL
                    finalUrl = ossInfo.url;
                  } catch (uploadError) {
                    console.error('OSS upload failed:', uploadError);
                  }
                  
                  setResultVideoUrl(finalUrl);
                  setProgress(100);
                  setGenerating(false);
                  
                  // Add to history
                  setGeneratedVideos(prev => {
                      if (prev.some(v => v.id === currentTaskId)) return prev;
                      return [{
                          id: currentTaskId,
                          url: finalUrl,
                          timestamp: Date.now()
                      }, ...prev];
                  });

                  if (pollTimerRef.current) clearInterval(pollTimerRef.current);
                  toast.success('生成成功！');
              } else if (status === 'failed') {
                  toast.error(data.error_msg || '生成失败');
                  setGenerating(false);
                  if (pollTimerRef.current) clearInterval(pollTimerRef.current);
              } else {
                  // Mock progress
                  setProgress(prev => Math.min(prev + Math.floor(Math.random() * 5), 95));
                  attempts++;
                  if (attempts >= maxAttempts) {
                      toast.error('任务超时');
                      setGenerating(false);
                      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
                  }
              }
          } catch (e) {
              console.error('Poll error', e);
              attempts++;
              if (attempts >= maxAttempts) {
                  setGenerating(false);
                  toast.error('查询失败');
                  if (pollTimerRef.current) clearInterval(pollTimerRef.current);
              }
          }
      };
      
      // Clear existing timer
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      // Start new timer
      pollTimerRef.current = setInterval(check, interval);
      check(); // Initial check
  };

  const handleAddToMaterials = () => {
    if (!resultVideoUrl) return;
    setShowMaterialModal(true);
  };
  
  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `singing_avatar_${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('开始下载...');
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  const handleDownloadAll = async () => {
    for (const video of generatedVideos) {
      await handleDownload(video.url);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const handleClearHistory = () => {
    setGeneratedVideos([]);
    setResultVideoUrl(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
       {/* Left: Uploads */}
       <div className="w-full lg:w-1/3 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col gap-6">
           {/* Image Upload */}
           <div className="space-y-3">
               <h3 className="font-bold text-gray-800 dark:text-gray-200 border-l-4 border-indigo-500 pl-3">上传图片</h3>
               <div 
                   onClick={() => imageInputRef.current?.click()}
                   onDragOver={(e) => handleDragOver(e, 'image')}
                   onDragLeave={(e) => handleDragLeave(e, 'image')}
                   onDrop={(e) => handleDrop(e, 'image')}
                   className={`max-h-[500px] w-[100%] relative aspect-[9/16] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300
                     ${imageFile 
                        ? 'border-indigo-500 bg-gray-50 dark:bg-gray-900' 
                        : isImageDragOver 
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.02] shadow-md' 
                            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                     }
                   `}
               >
                   <input ref={imageInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} className="hidden" />
                   {isImageUploading ? (
                       <div className="flex flex-col items-center justify-center text-gray-500">
                           <Loader className="animate-spin mb-2 text-indigo-600" size={24} />
                           <p className="text-sm font-medium">上传中...</p>
                       </div>
                   ) : imageFile ? (
                       <div className="relative w-full h-full p-2 group">
                           <img src={imageFile.url} className="w-full h-full object-contain rounded-lg" alt="Uploaded" />
                           <button 
                              onClick={(e) => { e.stopPropagation(); setImageFile(null); }} 
                              className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                              title="删除图片"
                           >
                              <X size={16} />
                           </button>
                       </div>
                   ) : (
                       <div className="text-center text-gray-500 p-6">
                           <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                              <ImageIcon size={32} className="text-indigo-600 dark:text-indigo-400" />
                           </div>
                           <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">点击或拖拽上传图片</p>
                           <p className="text-xs text-gray-400">支持 PNG, JPG, WEBP • 建议正脸高清</p>
                       </div>
                   )}
               </div>
           </div>

           {/* Audio Upload */}
           <div className="space-y-3">
               <h3 className="font-bold text-gray-800 dark:text-gray-200 border-l-4 border-indigo-500 pl-3">上传音频</h3>
               <div 
                   onClick={() => audioInputRef.current?.click()}
                   onDragOver={(e) => handleDragOver(e, 'audio')}
                   onDragLeave={(e) => handleDragLeave(e, 'audio')}
                   onDrop={(e) => handleDrop(e, 'audio')}
                   className={`relative h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300
                     ${audioFile 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                        : isAudioDragOver
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.02] shadow-md'
                            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                     }
                   `}
               >
                   <input ref={audioInputRef} type="file" accept="audio/*" onChange={(e) => handleFileChange(e, 'audio')} className="hidden" />
                   {isAudioUploading ? (
                       <div className="flex flex-col items-center justify-center text-gray-500">
                           <Loader className="animate-spin mb-2 text-indigo-600" size={24} />
                           <p className="text-sm font-medium">上传中...</p>
                       </div>
                   ) : audioFile ? (
                       <div className="w-full px-4 flex flex-col items-center">
                           <div className="flex items-center justify-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                               <Music size={24} className="animate-pulse" />
                               <span className="font-medium truncate max-w-[200px] text-sm">{audioFile.fileId.split('/').pop() || 'Audio File'}</span>
                           </div>
                           <audio src={audioFile.url} controls className="w-full h-8 rounded-lg shadow-sm" />
                           <button 
                              onClick={(e) => { e.stopPropagation(); setAudioFile(null); }} 
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-sm"
                              title="删除音频"
                           >
                              <X size={14} />
                           </button>
                       </div>
                   ) : (
                       <div className="text-center text-gray-500">
                           <Music size={28} className="mx-auto mb-2 text-indigo-500/70" />
                           <p className="text-sm font-medium text-gray-700 dark:text-gray-300">点击或拖拽上传音频</p>
                           <p className="text-xs mt-1 text-gray-400">支持 MP3, WAV, M4A</p>
                       </div>
                   )}
               </div>
           </div>

           {/* Actions */}
           <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
               <button 
                   onClick={handleGenerate} 
                   disabled={generating || !imageFile || !audioFile}
                   className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0
                     ${generating || !imageFile || !audioFile 
                        ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none' 
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/30'
                     }
                   `}
               >
                   {generating ? (
                       <>
                         <Loader size={20} className="animate-spin" />
                         <span>生成中 {progress}%</span>
                       </>
                   ) : (
                       <>
                         <SvgPointsIcon className="mr-2 size-6" />
                         <span>7 生成唱歌数字人</span>
                       </>
                   )}
               </button>
               
               <button 
                   onClick={clearAll}
                   disabled={!imageFile && !audioFile && !resultVideoUrl}
                   className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                   <Trash2 size={18} />
                   清空所有
               </button>
           </div>
       </div>

       {/* Right: Result */}
       <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg relative overflow-hidden flex flex-col h-[calc(100vh-240px)] lg:h-[calc(100vh-240px)]">
           <div className="flex-1 overflow-y-auto custom-scrollbar p-8 mb-[80px] flex items-center justify-center">
               {/* Background Pattern */}
               <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                   <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]"></div>
               </div>

               {generating ? (
                   <div className="text-center z-10 max-w-sm w-full">
                       <div className="relative w-32 h-32 mx-auto mb-8">
                           {/* Animated Circles */}
                           <div className="absolute inset-0 border-4 border-gray-100 dark:border-gray-700 rounded-full"></div>
                           <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                           <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-indigo-600">{progress}%</div>
                           
                           {/* Floating Icons */}
                           <div className="absolute -top-4 -right-4 text-2xl animate-bounce" style={{ animationDelay: '0s' }}>✨</div>
                           <div className="absolute -bottom-2 -left-4 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🎤</div>
                       </div>
                       
                       <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">AI正在合成中...</h3>
                       <p className="text-gray-500 dark:text-gray-400 mb-6">正在为您的照片赋予歌声，这可能需要几分钟时间。</p>
                       
                       {/* Progress Bar */}
                       <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                           <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out relative overflow-hidden"
                              style={{ width: `${progress}%` }}
                           >
                              <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                           </div>
                       </div>
                   </div>
               ) : resultVideoUrl ? (
                   <div className="w-full max-w-2xl text-center z-10">
                       <div className="mb-6 flex items-center justify-center gap-2 text-green-500 bg-green-50 dark:bg-green-900/20 py-2 px-4 rounded-full mx-auto w-fit">
                           <CheckCircle size={20} />
                           <span className="font-medium">生成成功</span>
                       </div>

                       <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video mb-8 group">
                           <video src={resultVideoUrl} controls className="w-full h-full object-contain" />
                           <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleDownload(resultVideoUrl!)}
                                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                                title="下载"
                              >
                                <Download size={18} />
                              </button>
                              <button 
                                onClick={handleAddToMaterials}
                                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                                title="加入素材库"
                              >
                                <Plus size={18} />
                              </button>
                           </div>
                       </div>
                   </div>
               ) : (
                   <div className="text-center text-gray-400 z-10">
                       <div className="w-24 h-24 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-gray-200 dark:border-gray-600">
                           <Play size={40} className="ml-2 opacity-20" />
                       </div>
                       <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">准备生成</h3>
                       <p className="max-w-xs mx-auto text-gray-500 dark:text-gray-400">请在左侧上传一张正脸照片和一段音频，AI将自动为您生成唱歌视频。</p>
                   </div>
               )}
           </div>

           {/* Results Area (New) */}
           {(generatedVideos.length > 0 || resultVideoUrl) && (
             <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 border-t border-gray-100 dark:border-gray-700 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">生成记录</h3>
                    <div className="flex gap-2">
                        <button
                             onClick={handleClearHistory}
                             disabled={generatedVideos.length === 0}
                             className={`px-3 py-1.5 border rounded-lg text-xs flex items-center gap-1 transition-colors ${
                               generatedVideos.length === 0
                                 ? 'border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 opacity-50 cursor-not-allowed'
                                 : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                             }`}
                        >
                           <Trash2 size={12} />
                           清空
                        </button>
                        <button
                             onClick={handleDownloadAll}
                             disabled={generatedVideos.length === 0}
                             className={`px-3 py-1.5 border rounded-lg text-xs flex items-center gap-1 transition-colors ${
                               generatedVideos.length === 0
                                 ? 'border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 opacity-50 cursor-not-allowed'
                                 : 'border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
                             }`}
                        >
                           <Download size={12} /> 下载全部
                        </button>
                    </div>
                </div>

                {/* History Thumbs */}
                {generatedVideos.length > 0 && (
                     <div className="h-16 flex gap-2 overflow-x-auto custom-scrollbar">
                       {generatedVideos.map((video) => (
                         <div 
                           key={video.id}
                           onClick={() => setResultVideoUrl(video.url)}
                           className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all bg-black/5 ${
                             resultVideoUrl === video.url ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-transparent hover:border-indigo-300'
                           }`}
                         >
                           <video src={video.url} className="w-full h-full object-cover pointer-events-none" />
                           {video.addState && (
                             <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                                <Check size={8} className="text-white" />
                             </div>
                           )}
                           <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                <Play size={16} className="text-white opacity-80" />
                           </div>
                         </div>
                       ))}
                     </div>
                )}
             </div>
           )}
       </div>

       {/* Add Material Modal */}
       <AddMaterialModal
          isOpen={showMaterialModal}
          onClose={() => setShowMaterialModal(false)}
          onSuccess={() => {
              toast.success('已添加到素材库');
              setShowMaterialModal(false);
          }}
          initialData={{
              assetName: `唱歌数字人_${new Date().toISOString().slice(0,10)}`,
              assetTag: `唱歌数字人_${new Date().toISOString().slice(0,10)}`,
              assetDesc: `唱歌数字人_${new Date().toISOString().slice(0,10)}`,
              assetUrl: resultVideoUrl || '',
              assetType: 4 // Video
          }}
          disableAssetTypeSelection={true}
       />
    </div>
  );
};

export default DigitalHumanSinging;
