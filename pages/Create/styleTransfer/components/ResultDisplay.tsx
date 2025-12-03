import React, { useState, useEffect } from 'react';
import { Loader2, Download, FolderPlus, Video, Image as ImageIcon, Maximize2 } from 'lucide-react';
import { GeneratedImage } from '../data';

interface ResultDisplayProps {
  isGenerating: boolean;
  progress: number;
  generatedImages: GeneratedImage[];
  resultTitle: string;
  resultPlaceholder: string;
  onSaveToAssets: (img: GeneratedImage) => void;
  onImageToVideo: (img: GeneratedImage) => void;
  onPreview: (img: GeneratedImage, allImages: GeneratedImage[]) => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  isGenerating,
  progress,
  generatedImages,
  resultTitle,
  resultPlaceholder,
  onSaveToAssets,
  onImageToVideo,
  onPreview,
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 当 generatedImages 更新时，自动设置第一张图片为预览图片
  useEffect(() => {
    if (generatedImages.length > 0) {
      setPreviewImage(prev => {
        // 如果当前预览图片不在列表中，或者还没有预览图片，则设置为第一张
        const currentExists = prev && generatedImages.some(img => img.url === prev);
        if (!currentExists) {
          return generatedImages[0].url;
        }
        return prev;
      });
    } else {
      setPreviewImage(null);
    }
  }, [generatedImages]);

  // 获取当前预览图片对应的 GeneratedImage 对象
  const getCurrentPreviewImage = (): GeneratedImage | null => {
    if (!previewImage) return null;
    return generatedImages.find(img => img.url === previewImage) || null;
  };

  const handleDownload = (url: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-image-${Date.now()}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  const currentPreviewImg = getCurrentPreviewImage();

  return (
    <div className="bg-white dark:bg-surface rounded-2xl p-5 flex flex-col shadow-sm border border-slate-200 dark:border-border overflow-y-auto md:overflow-hidden h-full">
      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-6">{resultTitle}</h3>

      {/* Main Preview Area */}
      <div className="w-full h-[300px] md:h-[450px] shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 mb-6 relative overflow-hidden">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-4 z-10">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
            <p className="text-indigo-600 dark:text-indigo-400 font-medium">AI正在生成中... {progress}%</p>
          </div>
        ) : previewImage && currentPreviewImg ? (
          <div className="relative w-full h-full flex items-center justify-center p-4 group">
            <img 
              src={previewImage} 
              alt="Generated Preview" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const img = e.currentTarget;
                if (img.crossOrigin !== null) {
                  img.crossOrigin = null;
                  img.referrerPolicy = 'no-referrer';
                }
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 rounded-lg">
              <button 
                onClick={() => onPreview(currentPreviewImg, generatedImages)}
                className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors"
                title="预览"
              >
                <Maximize2 size={20} />
              </button>
              <button 
                onClick={() => handleDownload(previewImage)}
                className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors"
                title="下载"
              >
                <Download size={20} />
              </button>
              <button 
                onClick={() => onSaveToAssets(currentPreviewImg)}
                className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors"
                title="添加素材"
              >
                <FolderPlus size={20} />
              </button>
              <button 
                onClick={() => onImageToVideo(currentPreviewImg)}
                className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors"
                title="图生视频"
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
            <p className="text-sm max-w-xs text-center">{resultPlaceholder}</p>
          </div>
        )}
      </div>

      {/* History Thumbs */}
      {generatedImages.length > 0 && (
        <div className="h-24 flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {generatedImages.map((img) => (
            <div 
              key={img.key}
              onClick={() => setPreviewImage(img.url)}
              className={`relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                previewImage === img.url ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-transparent hover:border-indigo-300'
              }`}
            >
              <img 
                src={img.url} 
                alt="History" 
                className="w-full h-full object-contain"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.crossOrigin !== null) {
                    img.crossOrigin = null;
                    img.referrerPolicy = 'no-referrer';
                  }
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;

