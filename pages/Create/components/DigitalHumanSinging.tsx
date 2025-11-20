import React, { useState, useRef } from 'react';
import { Upload, Music, Image as ImageIcon, Loader, X, Play, CheckCircle } from 'lucide-react';
import { avatarService } from '../../../services/avatarService';

interface DigitalHumanSingingProps {
  t: any;
  handleFileUpload: (file: File, type: 'image' | 'audio') => Promise<any>;
  uploading: boolean;
  setErrorMessage: (msg: string | null) => void;
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
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const uploaded = await handleFileUpload(file, type);
        if (type === 'image') setImageFile(uploaded);
        else setAudioFile(uploaded);
      } catch (error) {
        // Handled by parent
      }
    }
  };

  const handleGenerate = async () => {
    if (!imageFile || !audioFile) return;

    try {
      setGenerating(true);
      setErrorMessage(null);
      setProgress(0);
      setResultVideoUrl(null);

      const res = await avatarService.submitSingingAvatarTask({
        image_url: imageFile.url,
        audio_url: audioFile.url,
        score: 7
      });

      if ((res as any).task_id || (res.data as any)?.task_id) {
          const taskId = (res as any).task_id || (res.data as any)?.task_id;
          pollTask(taskId);
      } else {
          throw new Error('任务提交失败');
      }

    } catch (error: any) {
      setErrorMessage(error.message || '生成失败');
      setGenerating(false);
    }
  };

  const pollTask = async (taskId: string) => {
      const interval = 5000;
      const maxAttempts = 60;
      let attempts = 0;

      const check = async () => {
          try {
              const res = await avatarService.querySingingAvatarTask(taskId);
              const data = (res as any).data || res; // Handle response structure
              const status = data.status;

              if (status === 'done' && data.video_url) {
                  setResultVideoUrl(data.video_url);
                  setProgress(100);
                  setGenerating(false);
              } else if (status === 'failed') {
                  setErrorMessage(data.error_msg || '生成失败');
                  setGenerating(false);
              } else {
                  // Mock progress
                  setProgress(prev => Math.min(prev + Math.floor(Math.random() * 5), 95));
                  attempts++;
                  if (attempts < maxAttempts) setTimeout(check, interval);
                  else {
                      setErrorMessage('任务超时');
                      setGenerating(false);
                  }
              }
          } catch (e) {
              console.error('Poll error', e);
              attempts++;
              if (attempts < maxAttempts) setTimeout(check, interval);
              else {
                  setGenerating(false);
                  setErrorMessage('查询失败');
              }
          }
      };
      check();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
       {/* Left: Uploads */}
       <div className="w-full lg:w-1/3 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col gap-6">
           {/* Image Upload */}
           <div>
               <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3">上传图片</h3>
               <div 
                   onClick={() => imageInputRef.current?.click()}
                   className={`relative aspect-[9/16] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${imageFile ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-600'}`}
               >
                   <input ref={imageInputRef} type="file" accept="image/*" onChange={(e) => onUpload(e, 'image')} className="hidden" />
                   {imageFile ? (
                       <>
                           <img src={imageFile.url} className="w-full h-full object-contain rounded-xl p-1" />
                           <button onClick={(e) => { e.stopPropagation(); setImageFile(null); }} className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600">×</button>
                       </>
                   ) : (
                       <div className="text-center text-gray-500">
                           <ImageIcon size={32} className="mx-auto mb-2" />
                           <p className="text-sm">点击上传人像图片</p>
                           <p className="text-xs mt-1 text-gray-400">建议正脸高清照片</p>
                       </div>
                   )}
               </div>
           </div>

           {/* Audio Upload */}
           <div>
               <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3">上传音频</h3>
               <div 
                   onClick={() => audioInputRef.current?.click()}
                   className={`relative h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${audioFile ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-600'}`}
               >
                   <input ref={audioInputRef} type="file" accept="audio/*" onChange={(e) => onUpload(e, 'audio')} className="hidden" />
                   {audioFile ? (
                       <div className="w-full px-4">
                           <div className="flex items-center justify-center gap-2 mb-2 text-indigo-600">
                               <Music size={24} />
                               <span className="font-medium truncate max-w-[200px]">{audioFile.fileId.split('/').pop() || 'Audio File'}</span>
                           </div>
                           <audio src={audioFile.url} controls className="w-full h-8" />
                           <button onClick={(e) => { e.stopPropagation(); setAudioFile(null); }} className="absolute top-2 right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-red-600">×</button>
                       </div>
                   ) : (
                       <div className="text-center text-gray-500">
                           <Music size={32} className="mx-auto mb-2" />
                           <p className="text-sm">点击上传音频</p>
                           <p className="text-xs mt-1 text-gray-400">mp3, wav, m4a</p>
                       </div>
                   )}
               </div>
           </div>

           <button 
               onClick={handleGenerate} 
               disabled={generating || !imageFile || !audioFile}
               className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
           >
               {generating ? `生成中 ${progress}%` : '生成唱歌数字人'}
           </button>
       </div>

       {/* Right: Result */}
       <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg flex items-center justify-center">
           {generating ? (
               <div className="text-center">
                   <div className="relative w-32 h-32 mx-auto mb-6">
                       <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                       <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                       <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-indigo-600">{progress}%</div>
                   </div>
                   <p className="text-gray-600 dark:text-gray-300">AI正在为您合成唱歌数字人...</p>
                   <p className="text-sm text-gray-400 mt-2">这可能需要几分钟时间</p>
               </div>
           ) : resultVideoUrl ? (
               <div className="w-full max-w-md text-center">
                   <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center justify-center gap-2">
                       <CheckCircle className="text-green-500" /> 生成成功
                   </h3>
                   <video src={resultVideoUrl} controls className="w-full rounded-xl shadow-lg mb-6 bg-black" />
                   <a href={resultVideoUrl} download target="_blank" className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium">
                       下载视频
                   </a>
                   <button onClick={() => { setResultVideoUrl(null); setImageFile(null); setAudioFile(null); }} className="block mt-4 mx-auto text-gray-500 hover:text-gray-700">
                       重新生成
                   </button>
               </div>
           ) : (
               <div className="text-center text-gray-400">
                   <Play size={64} className="mx-auto mb-4 opacity-20" />
                   <p className="text-lg">上传图片和音频以生成预览</p>
               </div>
           )}
       </div>
    </div>
  );
};

export default DigitalHumanSinging;

