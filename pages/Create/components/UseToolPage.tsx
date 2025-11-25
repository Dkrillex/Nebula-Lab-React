import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Wand2, Loader2, Image as ImageIcon, Download, RefreshCw, Edit3 } from 'lucide-react';
import { TOOLS_DATA, Tool } from '../data';
import UploadComponent from '../../../components/UploadComponent';
import { aiToolService } from '../../../services/aiToolService';
import { UploadedFile } from '../../../services/avatarService';
import MaskCanvas, { MaskCanvasRef } from './MaskCanvas';
import UseToolResultDisplay from './UseToolResultDisplay';
import ImagePreviewModal from './ImagePreviewModal';

interface UseToolPageProps {
  // t?: any; 
}

const UseToolPage: React.FC<UseToolPageProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [primaryImageBase64, setPrimaryImageBase64] = useState<string | null>(null);
  const [secondaryFile, setSecondaryFile] = useState<File | null>(null);
  const [secondaryImageBase64, setSecondaryImageBase64] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  
  // Mask related state
  const [isMaskToolActive, setIsMaskToolActive] = useState(false);
  const [maskDataUrl, setMaskDataUrl] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(20);
  const maskCanvasRef = useRef<MaskCanvasRef>(null);

  // Load tool from state or query param
  useEffect(() => {
    let tool: Tool | undefined;
    const toolKeyFromQuery = searchParams.get('tool');
    
    // 1. Try from query param first (most reliable for URL-based navigation)
    if (toolKeyFromQuery) {
      tool = TOOLS_DATA.find(t => t.key === toolKeyFromQuery);
    }
    
    // 2. Try from state (passed from WorkshopPage)
    if (!tool && location.state?.toolKey) {
      tool = TOOLS_DATA.find(t => t.key === location.state.toolKey);
    }

    // 3. Fallback to generic Custom Prompt tool
    if (!tool) {
      tool = TOOLS_DATA.find(t => t.key === 'customPrompt');
    }

    if (tool) {
      setActiveTool(tool);
      if (tool.prompt === 'CUSTOM') {
        setCustomPrompt('');
      } else {
        setCustomPrompt(tool.prompt || '');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, searchParams]);

  // Handle File Selection
  const handlePrimarySelect = async (file: File) => {
    setPrimaryFile(file);
    setResultUrl(null);
    setError(null);
    setMaskDataUrl(null);
    setIsMaskToolActive(false);
    // Convert to base64 for preview/sending
    const reader = new FileReader();
    reader.onload = (e) => setPrimaryImageBase64(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSecondarySelect = async (file: File) => {
    setSecondaryFile(file);
    setResultUrl(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setSecondaryImageBase64(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Generate
  const handleGenerate = async () => {
    if (!activeTool) return;
    if (!primaryImageBase64) {
      setError('请上传主图像');
      return;
    }
    
    const promptToUse = activeTool.prompt === 'CUSTOM' ? customPrompt : activeTool.prompt;
    if (!promptToUse?.trim()) {
        setError('请输入提示词');
        return;
    }

    if (activeTool.isMultiImage && !activeTool.isSecondaryOptional && !secondaryImageBase64) {
        setError('请上传参考图像');
        return;
    }

    setGenerating(true);
    setError(null);

    try {
      const mimeType = primaryImageBase64.split(';')[0].split(':')[1];
      
      let secondaryPayload = null;
      if (secondaryImageBase64) {
          secondaryPayload = {
              base64: secondaryImageBase64,
              mimeType: secondaryImageBase64.split(';')[0].split(':')[1]
          };
      }

      // 获取蒙版数据（如果有）
      let maskBase64 = null;
      if (maskCanvasRef.current) {
        try {
          const maskBlob = await maskCanvasRef.current.getMask();
          if (maskBlob) {
            const reader = new FileReader();
            maskBase64 = await new Promise<string>((resolve, reject) => {
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(maskBlob);
            });
          }
        } catch (err) {
          console.warn('获取蒙版失败:', err);
          // 如果获取失败，尝试使用缓存的 maskDataUrl
          if (maskDataUrl) {
            maskBase64 = maskDataUrl;
          }
        }
      } else if (maskDataUrl) {
        maskBase64 = maskDataUrl;
      }

      const result = await aiToolService.editImage(
        primaryImageBase64,
        mimeType,
        promptToUse,
        maskBase64,
        secondaryPayload,
        activeTool // 传入完整的 tool 对象
      );

      console.log('生成结果:', result);
      
      // 新的 editImage 已经统一处理响应，直接返回 { imageUrl, text }
      if (result.imageUrl) {
        setResultUrl(result.imageUrl);
      } else {
        throw new Error('生成失败：未返回有效的图片URL');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || '发生未知错误');
    } finally {
      setGenerating(false);
    }
  };

  if (!activeTool) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {/* <button 
            onClick={() => navigate('/create?tool=workshop')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
            <ArrowLeft size={20} />
        </button> */}
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <span>{activeTool.emoji}</span>
                <span>{activeTool.title}</span>
            </h1>
            <p className="text-sm text-muted-foreground">{activeTool.description}</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        {/* Left: Controls */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 overflow-y-auto custom-scrollbar">
            
            {/* Prompt - 只在自定义提示工具时显示 */}
            {activeTool.prompt === 'CUSTOM' && !activeTool.isVideo && (
              <div className="mb-6">
                <textarea 
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="描述你想要的效果，例如：一只雄伟的狮子在日落时分的岩石上咆哮..."
                />
              </div>
            )}

            {/* Image Uploaders */}
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        {activeTool.primaryUploaderTitle || '原始图像'}
                        <span className="ml-2 text-xs text-gray-500 font-normal">
                            {activeTool.primaryUploaderDescription}
                        </span>
                    </label>
                    {!primaryImageBase64 ? (
                        <UploadComponent 
                            onUploadComplete={(f) => {}} // We use file selected directly
                            onFileSelected={handlePrimarySelect}
                            uploadType="oss"
                            className="h-48 w-full"
                            showPreview={true}
                            immediate={false} // Don't upload to OSS immediately, wait for generate
                        >
                            <div className="text-center p-4">
                                <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600">点击或拖拽上传图片</p>
                            </div>
                        </UploadComponent>
                    ) : (
                        <div className="space-y-3">
                            <div className="relative h-64 w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                <MaskCanvas
                                    ref={maskCanvasRef}
                                    imageUrl={primaryImageBase64}
                                    tool={isMaskToolActive ? 'pencil' : 'pencil'}
                                    brushSize={brushSize}
                                    brushColor="rgba(113, 102, 240, 0.7)"
                                    mode="mask"
                                    enableZoom={true}
                                    className="w-full h-full"
                                />
                            </div>
                            {/* 自定义提示和姿势参考工具不显示绘制蒙版按钮 */}
                            {activeTool.key !== 'customPrompt' && activeTool.key !== 'pose' && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setIsMaskToolActive(!isMaskToolActive)}
                                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                isMaskToolActive
                                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            <Edit3 size={16} />
                                            {isMaskToolActive ? '退出蒙版编辑' : '绘制蒙版'}
                                        </button>
                                    </div>
                                    {isMaskToolActive && (
                                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <label className="block text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
                                                画笔大小: {brushSize}px
                                            </label>
                                            <input
                                                type="range"
                                                min="5"
                                                max="100"
                                                value={brushSize}
                                                onChange={(e) => setBrushSize(Number(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            />
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => maskCanvasRef.current?.undoLastAction()}
                                                    className="flex-1 px-3 py-1.5 text-xs rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                                >
                                                    撤销
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        maskCanvasRef.current?.clearCanvas();
                                                        setMaskDataUrl(null);
                                                    }}
                                                    className="flex-1 px-3 py-1.5 text-xs rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                                >
                                                    清除蒙版
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {activeTool.isMultiImage && (
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            {activeTool.secondaryUploaderTitle || '参考图像'}
                            <span className="ml-2 text-xs text-gray-500 font-normal">
                                {activeTool.secondaryUploaderDescription}
                                {activeTool.isSecondaryOptional && ' (可选)'}
                            </span>
                        </label>
                        <UploadComponent 
                            onUploadComplete={(f) => {}}
                            onFileSelected={handleSecondarySelect}
                            uploadType="oss"
                            className="h-48 w-full"
                            showPreview={true}
                            immediate={false}
                        />
                    </div>
                )}
            </div>

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={generating || !primaryFile}
                className="w-full mt-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
            >
                {generating ? (
                    <>
                        <Loader2 className="animate-spin" />
                        生成中...
                    </>
                ) : (
                    <>
                        <Wand2 size={18} />
                        生成效果
                    </>
                )}
            </button>

            {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                    {error}
                </div>
            )}
        </div>

        {/* Right: Result */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center relative min-h-[400px]">
            {generating ? (
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-500">正在施展魔法...</p>
                </div>
            ) : resultUrl ? (
                <UseToolResultDisplay
                    imageUrl={resultUrl}
                    originalImageUrl={primaryImageBase64}
                    onImageClick={(url) => setPreviewImageUrl(url)}
                    onRegenerate={() => setResultUrl(null)}
                />
            ) : (
                <div className="text-center text-gray-400">
                    <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>生成的结果将显示在这里</p>
                </div>
            )}
        </div>
      </div>

      {/* 图片预览模态框 */}
      <ImagePreviewModal
        isOpen={!!previewImageUrl}
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />
    </div>
  );
};

export default UseToolPage;

