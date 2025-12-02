import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, BookOpen, Trash2, Play, Volume2, Download, MoreHorizontal, Copy, Loader } from 'lucide-react';
import { WorkflowProgress } from './components/WorkflowProgress';
import { formatDuration, downloadVideo } from '../../../../utils/videoUtils';
import toast from 'react-hot-toast';
import { ProductAnalysis, Storyboard, UploadedImage, ViralVideoPageProps } from './types';

interface GenerateVideoProps {
  t: ViralVideoPageProps['t'];
  step: number;
  videoId?: string;
  projectId?: string | number | null;
  projectIdStr?: string;
  finalVideoUrl: string;
  isMerging: boolean;
  analysisResult: ProductAnalysis | null;
  uploadedImages: UploadedImage[];
  storyboard: Storyboard | null;
  editedStoryboard: Storyboard | null;
  onStepChange: (step: number) => void;
  onMergeAllVideos: () => void;
  onSave?: () => Promise<void>;
  isSaving?: boolean;
}

export const GenerateVideo: React.FC<GenerateVideoProps> = ({
  t,
  step,
  videoId,
  projectId,
  projectIdStr,
  finalVideoUrl,
  isMerging,
  analysisResult,
  uploadedImages,
  storyboard,
  editedStoryboard,
  onStepChange,
  onMergeAllVideos,
  onSave,
  isSaving = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDownloadVideo = async () => {
    if (!finalVideoUrl) {
      toast.error('没有可下载的视频');
      return;
    }

    try {
      const filename = `营销视频_${videoId || Date.now()}.mp4`;
      await downloadVideo(finalVideoUrl, filename);
      toast.success('视频下载开始');
    } catch (error: any) {
      console.error('下载失败:', error);
      toast.error(error.message || '下载失败，请重试');
    }
  };

  return (
    <div className="bg-background min-h-full flex flex-col h-[calc(100vh-64px)]">
      {/* 工作流进度条 */}
      <WorkflowProgress 
        step={step} 
        videoId={videoId}
        projectId={projectId}
        projectIdStr={projectIdStr}
        onSave={onSave}
        isSaving={isSaving}
        onStepChange={onStepChange}
      />
      
      {/* Top Navigation - Reuse from Step 3 but update active state */}
      <div className="border-b border-border bg-background p-4 flex items-center justify-between shrink-0">
        <button onClick={() => onStepChange(3)} className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border hover:bg-surface text-sm transition-colors">
          <ChevronLeft size={16} />
          上一步
        </button>

        <div className="flex items-center text-sm text-muted">
          {/* Stepper */}
          <div className="flex items-center gap-2 opacity-50 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onStepChange(1)}>1. 素材与卖点</div>
          <ChevronRight size={14} className="mx-2 opacity-30" />
          <div className="flex items-center gap-2 opacity-50 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onStepChange(2)}>2. 选择脚本</div>
          <ChevronRight size={14} className="mx-2 opacity-30" />
          <div className="flex items-center gap-2 opacity-50 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onStepChange(3)}>3. 编辑分镜</div>
          <ChevronRight size={14} className="mx-2 opacity-30" />
          <div className="flex items-center gap-2 font-bold text-indigo-600">4. 生成视频</div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-100 text-orange-600 text-sm hover:bg-orange-200 transition-colors font-medium">
            <BookOpen size={16} />
            智能混剪教程
          </button>
          <div className="w-px h-6 bg-border"></div>
          <button className="p-2 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-surface/30">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Video Player */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">生成结果</h2>
              <p className="text-xs text-muted mt-1">因产品处于持续学习调优阶段，可能由不恰当的信息，请您谨慎甄别。</p>
              <p className="text-xs text-muted mt-0.5">{new Date().toLocaleString('zh-CN')}</p>
            </div>

            {isMerging ? (
              <div className="aspect-[3/4] w-full max-w-2xl bg-black rounded-xl overflow-hidden relative flex items-center justify-center mx-auto lg:mx-0">
                <div className="text-center text-white">
                  <Loader className="animate-spin mx-auto mb-4" size={32} />
                  <p>正在合并视频...</p>
                </div>
              </div>
            ) : finalVideoUrl ? (
              <div className="aspect-[3/4] w-full max-w-2xl bg-black rounded-xl overflow-hidden relative group mx-auto lg:mx-0">
                <video
                  ref={videoRef}
                  src={finalVideoUrl}
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                
                {/* Controls Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => {
                          if (videoRef.current) {
                            if (isPlaying) {
                              videoRef.current.pause();
                            } else {
                              videoRef.current.play();
                            }
                          }
                        }}
                        className="hover:text-indigo-400 transition-colors"
                      >
                        <Play size={24} fill={isPlaying ? "currentColor" : "none"} />
                      </button>
                      <button className="hover:text-indigo-400 transition-colors">
                        <Volume2 size={24} />
                      </button>
                      <span className="text-sm font-mono">
                        {videoRef.current ? formatDuration(videoRef.current.currentTime) : '00:00'} / {videoRef.current ? formatDuration(videoRef.current.duration) : '00:00'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleDownloadVideo}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg text-sm font-medium transition-colors"
                      >
                        <Download size={16} />
                        下载
                      </button>
                      <button className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div 
                    className="w-full h-1 bg-white/30 rounded-full mt-4 overflow-hidden cursor-pointer"
                    onClick={(e) => {
                      if (videoRef.current) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent = (e.clientX - rect.left) / rect.width;
                        videoRef.current.currentTime = percent * videoRef.current.duration;
                      }
                    }}
                  >
                    <div 
                      className="h-full bg-indigo-500 transition-all"
                      style={{ 
                        width: videoRef.current 
                          ? `${(videoRef.current.currentTime / videoRef.current.duration) * 100}%` 
                          : '0%' 
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-[3/4] w-full max-w-2xl bg-black rounded-xl overflow-hidden relative flex items-center justify-center mx-auto lg:mx-0">
                <div className="text-center text-white">
                  <p className="mb-4">视频尚未生成</p>
                  <button
                    onClick={onMergeAllVideos}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                  >
                    开始合并视频
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{analysisResult?.productName || '商品视频'}</h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted mt-1">
                <span>视频编号: {videoId || '未生成'}</span>
                {videoId && (
                  <Copy 
                    size={12} 
                    className="cursor-pointer hover:text-foreground"
                    onClick={() => {
                      navigator.clipboard.writeText(videoId);
                      toast.success('视频编号已复制');
                    }}
                  />
                )}
              </div>
            </div>

            {/* Product Info */}
            {uploadedImages.length > 0 && (
              <div>
                <h3 className="font-bold text-sm text-foreground mb-3">商品</h3>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                  <div className="w-12 h-12 rounded bg-slate-200 overflow-hidden">
                    <img src={uploadedImages[0].url} className="w-full h-full object-contain" alt="Product" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">{analysisResult?.productName || '商品'}</div>
                    <div className="text-xs text-muted">ID: {uploadedImages[0].id || 'N/A'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Selling Points */}
            {analysisResult && analysisResult.sellingPoints.length > 0 && (
              <div>
                <h3 className="font-bold text-sm text-foreground mb-3">商品卖点</h3>
                <div className="text-sm text-muted leading-relaxed">
                  {analysisResult.sellingPoints.join('; ')}
                </div>
              </div>
            )}

            {/* Video Settings */}
            <div>
              <h3 className="font-bold text-sm text-foreground mb-3">视频设置</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">脚本</span>
                  <span className="text-foreground font-medium">{storyboard?.scriptTitle || editedStoryboard?.scriptTitle || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">比例</span>
                  <span className="text-foreground font-medium">3:4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">画质</span>
                  <span className="text-foreground font-medium">高清</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">时长</span>
                  <span className="text-foreground font-medium">
                    {videoRef.current ? formatDuration(videoRef.current.duration) : storyboard?.totalDuration || '0s'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">分镜数量</span>
                  <span className="text-foreground font-medium">
                    {(storyboard || editedStoryboard)?.scenes?.length || 0} 个
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

