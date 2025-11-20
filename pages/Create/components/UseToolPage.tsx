import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Wand2, Loader2, Image as ImageIcon, Download, RefreshCw } from 'lucide-react';
import { TOOLS_DATA, Tool } from '../data';
import UploadComponent from '../../../components/UploadComponent';
import { aiToolService } from '../../../services/aiToolService';
import { UploadedFile } from '../../../services/avatarService';

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

  // Load tool from state or query param
  useEffect(() => {
    let tool: Tool | undefined;
    
    // 1. Try from state (passed from WorkshopPage)
    if (location.state?.toolKey) {
      tool = TOOLS_DATA.find(t => t.key === location.state.toolKey);
    }
    
    // 2. Try from query param
    if (!tool) {
        // URL might be /create?tool=useTool&toolKey=... or just /create?tool=useTool (which implies generic custom prompt)
        // But here we might have stored the key in location.state.
        // If direct access, we might need another param like `subTool` or `id`.
        // Assuming WorkshopPage passes state.
    }

    if (tool) {
      setActiveTool(tool);
      if (tool.prompt === 'CUSTOM') {
        setCustomPrompt('');
      } else {
        setCustomPrompt(tool.prompt || '');
      }
    } else {
      // Fallback to generic Custom Prompt tool if accessed directly without state
      const defaultTool = TOOLS_DATA.find(t => t.key === 'customPrompt');
      if (defaultTool) setActiveTool(defaultTool);
    }
  }, [location.state]);

  // Handle File Selection
  const handlePrimarySelect = async (file: File) => {
    setPrimaryFile(file);
    setResultUrl(null);
    setError(null);
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

      const res = await aiToolService.editImage(
        primaryImageBase64,
        mimeType,
        promptToUse,
        null, // Mask support to be added later if needed
        secondaryPayload,
        activeTool.title
      );

      if (res.code === 200 && res.data?.[0]?.url) {
        setResultUrl(res.data[0].url);
      } else {
        throw new Error(res.msg || '生成失败');
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
        <button 
            onClick={() => navigate('/create?tool=workshop')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
            <ArrowLeft size={20} />
        </button>
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
            
            {/* Prompt */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">提示词</label>
                <textarea 
                    value={activeTool.prompt === 'CUSTOM' ? customPrompt : activeTool.prompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    disabled={activeTool.prompt !== 'CUSTOM'}
                    className={`w-full h-24 p-3 rounded-xl border bg-gray-50 dark:bg-gray-800 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                        activeTool.prompt !== 'CUSTOM' ? 'text-gray-500 cursor-not-allowed' : ''
                    }`}
                    placeholder="描述你想要的效果..."
                />
            </div>

            {/* Image Uploaders */}
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        {activeTool.primaryUploaderTitle || '原始图像'}
                        <span className="ml-2 text-xs text-gray-500 font-normal">
                            {activeTool.primaryUploaderDescription}
                        </span>
                    </label>
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
                <div className="relative w-full h-full flex items-center justify-center group">
                    <img 
                        src={resultUrl} 
                        alt="Generated Result" 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a 
                            href={resultUrl} 
                            download={`generated-${activeTool.key}.png`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-white text-gray-800 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                            title="下载"
                        >
                            <Download size={20} />
                        </a>
                        <button 
                            onClick={() => setResultUrl(null)}
                            className="p-2 bg-white text-gray-800 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                            title="重新生成"
                        >
                            <RefreshCw size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center text-gray-400">
                    <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>生成的结果将显示在这里</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default UseToolPage;

