import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Wand2, Image as ImageIcon, Download, Share2, Maximize2, Loader2, Trash2, Upload, X, FolderPlus } from 'lucide-react';
import { textToImageService, TextToImageItem } from '../../../services/textToImageService';
import { uploadService } from '../../../services/uploadService';
import AddMaterialModal from '../../../components/AddMaterialModal';
import { useVideoGenerationStore } from '../../../stores/videoGenerationStore';

interface TextToImagePageProps {
  t: {
    title: string;
    subtitle: string;
    inputLabel: string;
    inputPlaceholder: string;
    aiPolish: string;
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
  };
}

interface GeneratedImage {
  id: number;
  url: string;
  addState?: boolean;
}

const ratios = [
  { labelKey: 'square', value: '1:1', dim: '1024x1024' },
  { labelKey: 'landscape43', value: '4:3', dim: '1024x768' },
  { labelKey: 'portrait34', value: '3:4', dim: '768x1024' },
  { labelKey: 'widescreen', value: '16:9', dim: '1024x576' },
  { labelKey: 'mobile', value: '9:16', dim: '576x1024' },
  { labelKey: 'photo', value: '3:2', dim: '1024x683' },
];

const TextToImagePage: React.FC<TextToImagePageProps> = ({ t }) => {
  const [searchParams] = useSearchParams();
  const { getData } = useVideoGenerationStore();
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [selectedSize, setSelectedSize] = useState('1024x1024');
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
    const ratio = ratios.find(r => r.value === selectedRatio);
    if (ratio) {
      setSelectedSize(ratio.dim);
    }
  }, [selectedRatio]);

  const handlePolishText = async () => {
    if (!prompt) return;
    
    setIsPolishing(true);
    try {
      const res = await textToImageService.polishText({
        text: prompt,
        type: 'text_to_image'
      });
      
      if (res.data) {
        setPrompt(res.data);
      }
    } catch (error) {
      console.error('Text polishing failed:', error);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setUploading(true);
      const res = await uploadService.uploadFile(file);
      if (res.code === 200 && res.data) {
        setReferenceImage(res.data.url);
      } else {
        console.error('Upload failed:', res);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleGenerate = async () => {
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
        // res is ApiResponse<TextToImageResponseData>
        res = await textToImageService.submitTextToImage({
          req: {
            prompt: prompt,
            size: selectedSize,
            width: selectedSize.split('x')[0],
            height: selectedSize.split('x')[1]
          },
          score: '0.3'
        });
      } else {
        // Image to Image
        res = await textToImageService.submitImageToImage({
          score: '0.3',
          volcImageBo: {
            image_urls: [referenceImage!],
            prompt: prompt,
            size: selectedSize,
            style: 'general' // Optional, could be added to UI
          }
        });
      }
      
      if (progressInterval.current) clearInterval(progressInterval.current);
      setProgress(100);

      console.log('API Response:', res);
      
      // Extract image data based on backend structure:
      // res.data is TextToImageResponseData { data: TextToImageItem[], created: number }
      // The images are in res.data.data
      
      let imageData: TextToImageItem[] = [];

      if (res.data) {
        // Check if res.data has 'data' property and it's an array (Standard structure)
        if (res.data.data && Array.isArray(res.data.data)) {
          imageData = res.data.data;
        } else if (Array.isArray(res.data)) {
          // Fallback if res.data is directly the array
          imageData = res.data as unknown as TextToImageItem[];
        } else if ((res as any).images && Array.isArray((res as any).images)) {
          // Fallback for other possible structures
          imageData = (res as any).images;
        }
      }
      
      if (imageData.length > 0) {
        const firstItem = imageData[0];
        // Prioritize 'url', fallback to 'image_urls[0]'
        const imageUrl = firstItem.url || (firstItem.image_urls && firstItem.image_urls.length > 0 ? firstItem.image_urls[0] : '');
        
        if (imageUrl) {
          const newImage = {
            id: (res.data as any)?.created ? (res.data as any).created * 1000 : Date.now(),
            url: imageUrl,
          };
          
          setGeneratedImages(prev => [newImage, ...prev]);
          setPreviewImage(newImage.url);
        } else {
           console.warn('Generated image data found but no URL:', firstItem);
        }
      } else {
        console.warn('No image data in response:', res);
      }
    } catch (error) {
      console.error('Image generation failed:', error);
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
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
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
                accept="image/png, image/jpeg"
              />
              
              {referenceImage ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-indigo-500 group">
                  <img src={referenceImage} alt="Reference" className="w-full h-40 object-cover" />
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
                disabled={isPolishing || !prompt}
                className="flex items-center gap-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-200 transition-colors disabled:opacity-50"
              >
                {isPolishing ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                {t.aiPolish}
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
                    key={ratio.value}
                    onClick={() => setSelectedRatio(ratio.value)}
                    disabled={isGenerating}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedRatio === ratio.value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                        : 'border-border bg-background hover:border-indigo-300 text-muted hover:text-foreground'
                    }`}
                  >
                    <div className="text-sm font-semibold mb-1">{(t.ratios as any)[ratio.labelKey] || ratio.labelKey} {ratio.value}</div>
                    <div className="text-xs opacity-70">({ratio.dim})</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt || (mode === 'image' && !referenceImage)}
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

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-8 flex flex-col relative overflow-hidden">
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold text-foreground">{t.resultTitle}</h2>
             {generatedImages.length > 0 && (
               <button 
                 onClick={() => setGeneratedImages([])}
                 className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
               >
                 <Trash2 size={14} /> Clear All
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
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 rounded-lg">
                    <button 
                      onClick={() => setIsPreviewOpen(true)}
                      className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors"
                      title="View Full Size"
                    >
                      <Maximize2 size={20} />
                    </button>
                    <button 
                      onClick={() => handleDownload(previewImage)}
                      className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors"
                      title="Download"
                    >
                      <Download size={20} />
                    </button>
                    <button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors"
                      title="Add to Materials"
                    >
                      <FolderPlus size={20} />
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
          // Optional: Show a success toast or update generated image state to show "added"
          console.log('Added to materials');
        }}
        initialData={{
          assetUrl: previewImage || '',
          assetName: `Generated Image ${new Date().toLocaleString()}`,
          assetType: 6, // Image type
        }}
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
