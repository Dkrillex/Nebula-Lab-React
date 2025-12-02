import React from 'react';
import { Loader2, Download, FolderPlus, Video, Eye, Palette } from 'lucide-react';
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
  return (
    <div className="bg-white dark:bg-surface rounded-2xl p-5 flex flex-col shadow-sm border border-slate-200 dark:border-border overflow-hidden h-full">
      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-6">{resultTitle}</h3>
      
      {isGenerating ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-surface/30 rounded-xl border-2 border-dashed border-slate-100 dark:border-border relative overflow-hidden min-h-[300px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={48} className="animate-spin text-indigo-600" />
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              AI正在生成中... {progress}%
            </p>
          </div>
        </div>
      ) : generatedImages.length > 0 ? (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 gap-4">
            {generatedImages.map((img) => (
              <div key={img.key} className="relative group border-2 border-slate-200 dark:border-border rounded-xl overflow-hidden">
                <img 
                  src={img.url} 
                  alt="Generated" 
                  className="w-full h-auto object-contain" 
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
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={img.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors"
                    title="下载"
                  >
                    <Download size={20} />
                  </a>
                  <button
                    onClick={() => onSaveToAssets(img)}
                    className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors"
                    title="添加素材"
                  >
                    <FolderPlus size={20} />
                  </button>
                  <button
                    onClick={() => onImageToVideo(img)}
                    className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors"
                    title="图生视频"
                  >
                    <Video size={20} />
                  </button>
                  <button
                    onClick={() => onPreview(img, generatedImages)}
                    className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors"
                    title="预览"
                  >
                    <Eye size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-surface/30 rounded-xl border-2 border-dashed border-slate-100 dark:border-border relative overflow-hidden min-h-[300px]">
          <div className="relative z-10 flex flex-col items-center gap-4 text-center max-w-xs">
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center shadow-inner">
              <Palette size={40} className="text-amber-500" />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              {resultPlaceholder}
            </p>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-50 dark:bg-indigo-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-50 dark:bg-purple-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70"></div>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;

