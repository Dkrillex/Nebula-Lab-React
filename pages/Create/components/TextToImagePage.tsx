import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Wand2, Image as ImageIcon, Download, Maximize2, Loader2, Trash2, Upload, X, FolderPlus, Video, Check } from 'lucide-react';
import { textToImageService, TextToImageItem } from '../../../services/textToImageService';
import { uploadService } from '../../../services/uploadService';
import AddMaterialModal from '../../../components/AddMaterialModal';
import { useVideoGenerationStore } from '../../../stores/videoGenerationStore';
import { useAuthStore } from '../../../stores/authStore';
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
  </svg>
);

interface TextToImagePageProps {
  t: {
    title: string;
    subtitle: string;
    inputLabel: string;
    inputPlaceholder: string;
    aiPolish: string;
    aiPolishThinking: string;
    settingsTitle: string;
    aspectRatio: string;
    generateConfig: string;
    generate: string;
    resultTitle: string;
    emptyState: string;
    ratios: {
      square: string;
      landscape43: string;
      portrait34: string;
      widescreen: string;
      mobile: string;
      photo: string;
      [key: string]: string;
    };
    tabs: {
      textToImage: string;
      imageToImage: string;
    };
    imageToImage: {
      uploadTitle: string;
      uploadDesc: string;
      uploadHint: string;
    };
    actions: {
      clearAll: string;
      downloadAll: string;
      imageToVideo: string;
      addToMaterials: string;
      viewFullSize: string;
      download: string;
    };
    tips: {
      polishSuccess: string;
      polishFailed: string;
      imageSizeLimit: string;
      imageRatioLimit: string;
      uploadSuccess: string;
      uploadFailed: string;
      generateSuccess: string;
      generateEmpty: string;
      generateFailed: string;
      downloadStarted: string;
      downloadFailed: string;
      selectImageTip: string;
      addToMaterialsSuccess: string;
      generating: string;
    };
  };
}

interface GeneratedImage {
  id: number;
  url: string;
  addState?: boolean;
}

// Updated ratios to match Vue implementation
const ratios = [
  { id: '2K', label: '2K', dim: '2K' },
  { id: '4K', label: '4K', dim: '4K' },
  { id: '2048x2048', label: '1:1', dim: '2048x2048' },
  { id: '2304x1728', label: '4:3', dim: '2304x1728' },
  { id: '1728x2304', label: '3:4', dim: '1728x2304' },
  { id: '2560x1440', label: '16:9', dim: '2560x1440' },
  { id: '1440x2560', label: '9:16', dim: '1440x2560' },
  { id: '2496x1664', label: '3:2', dim: '2496x1664' },
  { id: '1664x2496', label: '2:3', dim: '1664x2496' },
  { id: '3024x1296', label: '21:9', dim: '3024x1296' },
];

const TextToImagePage: React.FC<TextToImagePageProps> = ({ t }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getData, setData } = useVideoGenerationStore();
  const { token } = useAuthStore();
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [selectedRatio, setSelectedRatio] = useState('2048x2048');
  const [selectedSize, setSelectedSize] = useState('2048x2048');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

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
            setReferenceImage(data.images[0]);
            setMode('image');
          } else {
            setReferenceImage(null);
            setMode('text');
          }
        }
      } catch (error) {
        console.error('Failed to load transfer data:', error);
      }
    }
  }, [searchParams, getData]);

  useEffect(() => {
    // Update size when ratio changes
    const ratio = ratios.find(r => r.id === selectedRatio);
    if (ratio) {
      setSelectedSize(ratio.dim);
    }
  }, [selectedRatio]);

  const handlePolishText = async () => {
    if (!token) {
      toast.error('Please login first');
      return;
    }
    if (!prompt) return;
    
    setIsPolishing(true);
    try {
      const data = await textToImageService.polishText({
        text: prompt,
        type: mode === 'image' ? 'image_to_image' : 'text_to_image'
      });
      
      if (data) {
        setPrompt(data);
        toast.success(t.tips.polishSuccess);
      }
    } catch (error) {
      console.error('Text polishing failed:', error);
      toast.error(t.tips.polishFailed);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(t.tips.imageSizeLimit);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate aspect ratio [1/3, 3]
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      const ratio = img.width / img.height;
      if (ratio < 1/3 || ratio > 3) {
        toast.error(`${t.tips.imageRatioLimit} (Current: ${ratio.toFixed(2)})`);
        URL.revokeObjectURL(objectUrl);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Image validation failed:', error);
    }
    
    try {
      setUploading(true);
      const res = await uploadService.uploadFile(file);
      // Handle different response structures
      const data = (res as any).data || res;
      if (data && (data.url || data.fileUrl)) {
        setReferenceImage(data.url || data.fileUrl);
        toast.success(t.tips.uploadSuccess);
      } else {
        console.error('Upload failed:', res);
        toast.error(t.tips.uploadFailed);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(t.tips.uploadFailed);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleGenerate = async () => {
    if (!token) {
      toast.error('Please login first');
      return;
    }
    if (!prompt || isGenerating) return;
    if (mode === 'image' && !referenceImage) return;

    setIsGenerating(true);
    setProgress(0);

    // Simulated progress
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          if (progressInterval.current) clearInterval(progressInterval.current);
          return 90;
        }
        return prev + Math.floor(Math.random() * 5);
      });
    }, 300);

    try {
      let res;
      if (mode === 'text') {
        // Handle 2K/4K special cases where split might return undefined height
        const isSpecialSize = selectedSize === '2K' || selectedSize === '4K';
        
        res = await textToImageService.submitTextToImage({
          req: {
            prompt: prompt,
            size: selectedSize,
            width: isSpecialSize ? undefined : selectedSize.split('x')[0],
            height: isSpecialSize ? undefined : selectedSize.split('x')[1]
          },
          score: '1'
        });
      } else {
        // Image to Image
        res = await textToImageService.submitImageToImage({
          score: '1',
          volcImageBo: {
            image_urls: [referenceImage!],
            prompt: prompt,
            size: selectedSize,
            style: 'general'
          }
        });
      }
      
      if (progressInterval.current) clearInterval(progressInterval.current);
      setProgress(100);

      console.log('API Response:', res);
      
      let imageData: TextToImageItem[] = [];

      if (res.data) {
        if (res.data.data && Array.isArray(res.data.data)) {
          imageData = res.data.data;
        } else if (Array.isArray(res.data)) {
          imageData = res.data as unknown as TextToImageItem[];
        } else if ((res as any).images && Array.isArray((res as any).images)) {
          imageData = (res as any).images;
        }
      }
      
      if (imageData.length > 0) {
        const newImages = imageData.map(item => ({
            id: (res.data as any)?.created ? (res.data as any).created * 1000 + Math.random() : Date.now() + Math.random(),
            url: item.url || (item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : '') || '',
        })).filter(img => img.url);
        
        if (newImages.length > 0) {
          setGeneratedImages(prev => [...newImages, ...prev]);
          setPreviewImage(newImages[0].url);
          toast.success(t.tips.generateSuccess);
        }
      } else {
        toast.error(t.tips.generateEmpty);
      }
    } catch (error: any) {
      console.error('Image generation failed:', error);
      toast.error(`${t.tips.generateFailed}: ${error.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
      if (progressInterval.current) clearInterval(progressInterval.current);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success(t.tips.downloadStarted);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  const handleDownloadAll = async () => {
    for (const [index, image] of generatedImages.entries()) {
      await handleDownload(image.url);
      // Delay to prevent browser blocking multiple downloads
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const handleImageToVideo = () => {
    if (!previewImage) {
      toast.error(t.tips.selectImageTip);
      return;
    }

    const transferId = `transfer_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    setData(transferId, {
      images: [previewImage],
      sourcePrompt: prompt, // Optional: pass prompt as well
      timestamp: Date.now(),
      source: 'imageGenerates'
    });

    // Navigate to Digital Human tool (Talking Photo)
    navigate(`/create?tool=digitalHuman&transferId=${transferId}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
      {/* Header */}
      <div className="w-full border-b border-border bg-card/50 backdrop-blur-sm z-10">
        <div className="px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-foreground">{t.title}</h1>
            <p className="text-xs text-muted-foreground mt-1 opacity-90">{t.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel - Settings */}
        <div className="w-full md:w-[400px] lg:w-[450px] bg-surface border-r border-border flex flex-col p-6 overflow-y-auto custom-scrollbar">
          
          {/* Mode Selection */}
          <div className="mb-6 flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-1 rounded-full gap-1">
            <button
              onClick={() => setMode('text')}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                mode === 'text' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {t.tabs.textToImage}
            </button>
            <button
              onClick={() => setMode('image')}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                mode === 'image' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {t.tabs.imageToImage}
            </button>
          </div>

          {/* Reference Image Upload (Image Mode) */}
          {mode === 'image' && (
            <div className="mb-6">
              <h3 className="font-bold text-foreground mb-3">{t.imageToImage.uploadTitle}</h3>
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleUpload} 
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg"
              />
              
              {referenceImage ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-indigo-500 group">
                  <img src={referenceImage} alt="Reference" className="w-full h-40 object-contain bg-black/5" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => setReferenceImage(null)}
                      className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    uploading ? 'bg-slate-50' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {uploading ? (
                    <Loader2 size={24} className="animate-spin text-indigo-600 mb-2" />
                  ) : (
                    <Upload size={24} className="text-slate-400 mb-2" />
                  )}
                  <p className="text-sm font-medium text-foreground">{uploading ? 'Uploading...' : t.imageToImage.uploadDesc}</p>
                  <p className="text-xs text-muted mt-1">{t.imageToImage.uploadHint}</p>
                </div>
              )}
            </div>
          )}

          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-foreground">{t.inputLabel}</h3>
              <button 
                onClick={handlePolishText}
                disabled={isPolishing || !prompt || isGenerating}
                className="flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-3 py-1.5 rounded-lg shadow hover:shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
              >
                {isPolishing ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                {isPolishing ? t.aiPolishThinking : t.aiPolish}
              </button>
            </div>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t.inputPlaceholder}
                className="w-full h-40 p-4 rounded-xl border border-border bg-background resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                disabled={isGenerating}
              />
              <span className="absolute bottom-3 right-3 text-xs text-muted">{prompt.length}/2000</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-foreground mb-4">{t.settingsTitle}</h3>
            
            <div className="mb-4">
              <label className="text-sm font-medium text-muted mb-3 block">{t.aspectRatio}</label>
              <div className="grid grid-cols-2 gap-3">
                {ratios.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setSelectedRatio(ratio.id)}
                    disabled={isGenerating}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedRatio === ratio.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                        : 'border-border bg-background hover:border-indigo-300 text-muted hover:text-foreground'
                    }`}
                  >
                    <div className="text-sm font-semibold mb-1">{ratio.label}</div>
                    <div className="text-xs opacity-70">({ratio.dim})</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-3">
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt || (mode === 'image' && !referenceImage)}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transform transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t.tips.generating} {progress}%
                </>
              ) : (
                <>
                  <SvgPointsIcon className="w-5 h-5" />
                  1 {t.generate}
                </>
              )}
            </button>

            <div className="flex gap-2">
               <button
                 onClick={() => {
                   setGeneratedImages([]);
                   setPreviewImage(null);
                 }}
                 disabled={generatedImages.length === 0}
                 className="flex-1 py-2 border border-border hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {t.actions.clearAll}
               </button>
               <button
                 onClick={handleDownloadAll}
                 disabled={generatedImages.length === 0}
                 className="flex-1 py-2 border border-border hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm text-muted-foreground flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <Download size={14} /> {t.actions.downloadAll}
               </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-8 flex flex-col relative overflow-hidden">
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold text-foreground">{t.resultTitle}</h2>
             {previewImage && (
               <button 
                 onClick={handleImageToVideo}
                 className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
               >
                 <Video size={16} />
                 {t.actions.imageToVideo}
               </button>
             )}
           </div>

           {/* Main Preview Area */}
           <div className="w-full h-[450px] shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 mb-6 relative overflow-hidden">
              {isGenerating && progress > 0 ? (
                <div className="flex flex-col items-center gap-4 z-10">
                   <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                   <p className="text-indigo-600 font-medium">Generating your masterpiece... {progress}%</p>
                </div>
              ) : previewImage ? (
                <div className="relative w-full h-full flex items-center justify-center p-4 group">
                  <img 
                    src={previewImage} 
                    alt="Generated Preview" 
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 rounded-lg">
                    <button 
                      onClick={() => setIsPreviewOpen(true)}
                      className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors"
                      title={t.actions.viewFullSize}
                    >
                      <Maximize2 size={20} />
                    </button>
                    <button 
                      onClick={() => handleDownload(previewImage!)}
                      className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors"
                      title={t.actions.download}
                    >
                      <Download size={20} />
                    </button>
                    <button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors"
                      title={t.actions.addToMaterials}
                    >
                      <FolderPlus size={20} />
                    </button>
                    <button 
                      onClick={handleImageToVideo}
                      className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors"
                      title={t.actions.imageToVideo}
                    >
                      <Video size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                   <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                      <ImageIcon size={40} className="text-slate-400 dark:text-slate-500" />
                   </div>
                   <p className="text-sm max-w-xs text-center">{t.emptyState}</p>
              </div>
              )}
           </div>

           {/* History Thumbs */}
           {generatedImages.length > 0 && (
             <div className="h-24 flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
               {generatedImages.map((img) => (
                 <div 
                   key={img.id}
                   onClick={() => setPreviewImage(img.url)}
                   className={`relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                     previewImage === img.url ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-transparent hover:border-indigo-300'
                   }`}
                 >
                   <img src={img.url} alt="History" className="w-full h-full object-cover" />
                   {img.addState && (
                     <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                        <Check size={8} className="text-white" />
                     </div>
                   )}
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

      {/* Add Material Modal */}
      <AddMaterialModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          // Mark as added
          setGeneratedImages(prev => prev.map(img => 
             img.url === previewImage ? { ...img, addState: true } : img
          ));
          toast.success(t.tips.addToMaterialsSuccess);
        }}
        initialData={{
          assetUrl: previewImage || '',
          assetName: prompt ? `AI生图-${prompt.slice(0, 10)}` : 'AI生图',
          assetType: 7, // AI生图
          assetTag: 'AI生图',
          assetDesc: prompt || 'AI生图',
        }}
        disableAssetTypeSelection={true}
        isImportMode={true}
      />

      {/* Full Screen Preview Modal */}
      {isPreviewOpen && previewImage && (
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
          <img 
            src={previewImage} 
            alt="Full Preview" 
            className="max-w-full max-h-full object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
};

export default TextToImagePage;