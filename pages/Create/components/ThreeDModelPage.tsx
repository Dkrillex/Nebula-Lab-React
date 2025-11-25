import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wand2, Loader2, Image as ImageIcon, Gem, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import UploadComponent from '../../../components/UploadComponent';
import ThreeDModelViewer from './ThreeDModelViewer';
import { threeDModelService } from '../../../services/threeDModelService';
import { uploadService } from '../../../services/uploadService';
import { assetsService } from '../../../services/assetsService';
import JSZip from 'jszip';

const ThreeDModelPage: React.FC = () => {
  const navigate = useNavigate();
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [primaryImageBase64, setPrimaryImageBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [generatedContent, setGeneratedContent] = useState<{ imageUrl: string } | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const modelUrlRef = useRef<string | null>(null);
  const [isTestingZip, setIsTestingZip] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // 清理 blob URL
  useEffect(() => {
    return () => {
      if (modelUrlRef.current) {
        URL.revokeObjectURL(modelUrlRef.current);
      }
    };
  }, []);

  // 处理图片选择
  const handlePrimaryImageSelect = (file: File) => {
    setPrimaryFile(file);
    setGeneratedContent(null);
    setModelUrl(null);
    if (modelUrlRef.current) {
      URL.revokeObjectURL(modelUrlRef.current);
      modelUrlRef.current = null;
    }
    
    // 转换为 base64
    const reader = new FileReader();
    reader.onload = (e) => {
      setPrimaryImageBase64(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 清除图片
  const handleClearPrimaryImage = () => {
    setPrimaryImageBase64(null);
    setPrimaryFile(null);
    setGeneratedContent(null);
    setModelUrl(null);
    if (modelUrlRef.current) {
      URL.revokeObjectURL(modelUrlRef.current);
      modelUrlRef.current = null;
    }
  };

  // 从 ZIP 中提取 GLB 文件
  const fetchGlbFromZip = async (zipUrl: string) => {
    console.log("zipUrl",zipUrl);
    
    const response = await fetch(zipUrl);
     if (!response.ok) throw new Error('下载失败');

     const arrayBuffer = await response.arrayBuffer();
     const zip = await JSZip.loadAsync(arrayBuffer);
     const glbEntry = Object.values(zip.files as Record<string, JSZip.JSZipObject>).find(
       (file) => file.name.endsWith('.glb'),
     );
     if (!glbEntry) throw new Error('压缩包中没有 .glb 文件');

     const glbArrayBuffer = await glbEntry.async('arraybuffer');
     const blob = new Blob([glbArrayBuffer], { type: 'model/gltf-binary' });
     return URL.createObjectURL(blob);   // 前端展示用
  };

  // 测试 ZIP 提取功能
  const handleTestZipExtraction = async () => {
    const testZipUrl = 'https://nebula-ads.oss-cn-guangzhou.aliyuncs.com/2025/11/21/4387d2470ae54fd7abe68b3280d59793.zip';
    
    setIsTestingZip(true);
    setTestResult(null);
    setModelUrl(null);
    
    // 清理之前的 blob URL
    if (modelUrlRef.current) {
      URL.revokeObjectURL(modelUrlRef.current);
      modelUrlRef.current = null;
    }

    try {
      console.log('=== 开始测试 ZIP 提取流程 ===');
      const objectUrl = await fetchGlbFromZip(testZipUrl);
      console.log('objectUrl',objectUrl);
      
      if (modelUrlRef.current) {
        URL.revokeObjectURL(modelUrlRef.current);
      }
      modelUrlRef.current = objectUrl;
      setModelUrl(objectUrl);
      setFileUrl(testZipUrl);
      setTestResult('✅ 测试成功！GLB 文件已提取并加载。');
      setGeneratedContent({ imageUrl: '' }); // 设置一个占位内容以显示查看器
      
      console.log('=== 测试完成 ===');
    } catch (error: any) {
      console.error('测试失败:', error);
      const errorMsg = error.message || '测试失败';
      setTestResult(`❌ 测试失败: ${errorMsg}`);
      toast.error(errorMsg);
    } finally {
      setIsTestingZip(false);
    }
  };

  // 生成 3D 模型
  const handleGenerateImage = async () => {
    if (!primaryImageBase64) {
      toast.error('请上传图片');
      return;
    }

    setIsLoading(true);
    setGeneratedContent(null);
    setLoadingMessage('');

    try {
      const primaryMimeType = primaryImageBase64.split(';')[0].split(':')[1].split('/')[1] ?? 'png';

      setLoadingMessage('正在上传图片...');

      // 上传图片到 OSS
      const uploadRes = await uploadService.uploadByBase64(
        primaryImageBase64,
        '3D模型-原始图片',
        primaryMimeType
      );

      const imageUrl = (uploadRes as any).data?.url || (uploadRes as any).url;
      if (!imageUrl) {
        throw new Error('图片上传失败');
      }

      setLoadingMessage('正在生成 3D 模型...');

      // 创建 3D 任务
      const dataList = {
        score: 1,
        model: 'doubao-seed3d-1-0-250928',
        content: [
          {
            type: 'text' as const,
            text: '--subdivisionlevel medium --fileformat glb'
          },
          {
            type: 'image_url' as const,
            image_url: {
              url: imageUrl
            }
          }
        ]
      };

      const taskRes = await threeDModelService.createThreeDTask(dataList);
      const taskId = (taskRes as any).data?.id || (taskRes as any).id;
      if (!taskId) {
        throw new Error('创建任务失败');
      }

      setLoadingMessage('正在等待生成完成...');

      // 轮询查询任务状态
      const terminalStatuses = new Set(['succeeded', 'failed', 'cancelled']);
      let taskResult: any = null;

      while (true) {
        const queryRes = await threeDModelService.queryThreeDTask(taskId);
        taskResult = (queryRes as any).data || queryRes;
        
        // 处理字符串响应
        if (typeof taskResult === 'string') {
          try {
            taskResult = JSON.parse(taskResult);
          } catch (e) {
            console.error('解析任务结果失败:', e);
          }
        }

        const status = taskResult?.status;
        if (status && terminalStatuses.has(status)) {
          if (status === 'succeeded') {
            const assetUrl = taskResult?.content?.fileUrl;
            if (!assetUrl) {
              throw new Error('下载失败：资源URL不存在');
            }

            setLoadingMessage('正在下载文件...');

            // 下载素材
            const downloadRes = await assetsService.downloadAssets({
              assetFileType: 'zip',
              assetName: '3D测试',
              assetUrl
            });

            console.log('downloadAssets 返回结果:', downloadRes);
            console.log('(downloadRes as any)?.url', (downloadRes as any)?.url);
            // 根据 request.ts 的逻辑，code === 200 时会返回 resData.data
            // 所以 downloadRes 应该是 { url, fileName, ossId }
            const zipUrl = (downloadRes as any)?.url;
            if (!zipUrl) {
              console.error('downloadRes 结构:', downloadRes);
              throw new Error('获取下载链接失败：返回数据中没有 url 字段');
            }

            console.log('获取到 ZIP 下载链接:', zipUrl);
            setFileUrl(zipUrl);
            setLoadingMessage('正在解析模型文件...');

            // 从 ZIP 中提取 GLB
            try {
              const objectUrl = await fetchGlbFromZip(zipUrl);
              console.log('objectUrl',objectUrl);
              
              if (modelUrlRef.current) {
                URL.revokeObjectURL(modelUrlRef.current);
              }
              modelUrlRef.current = objectUrl;
              setModelUrl(objectUrl);
            } catch (error: any) {
              console.error('解析 GLB 失败：', error);
              throw new Error(error.message || '解析 GLB 文件失败');
            }
          } else if (status === 'failed') {
            throw new Error('3D 任务失败');
          }
          break;
        }

        // 等待 20 秒后再次查询
        await new Promise((resolve) => setTimeout(resolve, 20000));
      }

      setGeneratedContent({
        imageUrl
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || '生成3D效果失败');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const isGenerateDisabled = isLoading || !primaryImageBase64;

  return (
    <div className="container mx-auto p-4 md:p-8 page-container">
      <div className="grid grid-cols-1 gap-8 custom-cols lg:grid-cols-2">
        {/* 左侧：输入区域 */}
        <div className="flex flex-col gap-6 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[rgba(255,255,255,0.6)] p-6 shadow-2xl shadow-black/20 backdrop-blur-lg result result-left">
          <div>
            <div className="mb-4">
              <div className="mb-4">
                <h2 className="page-title">3D 模型</h2>
              </div>
            </div>

            <div>
              <UploadComponent
                onFileSelected={handlePrimaryImageSelect}
                onClear={handleClearPrimaryImage}
                uploadType="oss"
                accept="image/*"
                className="h-64 w-full"
                showPreview={true}
                immediate={false}
                showConfirmButton={false}
              >
                <div className="text-center p-4">
                  <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">点击或拖拽上传图片</p>
                </div>
              </UploadComponent>
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={isGenerateDisabled}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#7d6fdd] to-[#15b7fa] px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-[#e5e7eb] disabled:from-[#e5e7eb] disabled:to-[#e5e7eb] disabled:text-[#9ca3af] disabled:shadow-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <div className="relative">
                    <Gem className="h-5 w-5" />
                    <Check className="absolute -top-1 -right-1 h-3 w-3" />
                  </div>
                  <span className="text-sm font-semibold">0.3</span>
                  <span>生成 3D 模型</span>
                </>
              )}
            </button>

            {testResult && (
              <div className={`mt-4 p-3 rounded-lg text-sm text-center ${
                testResult.startsWith('✅') 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-600'
              }`}>
                {testResult}
              </div>
            )}
          </div>
        </div>

        {/* 右侧：结果展示 */}
        <div className="flex flex-col rounded-xl border border-[rgba(0,0,0,0.1)] bg-[rgba(255,255,255,0.6)] p-6 shadow-2xl shadow-black/20 backdrop-blur-lg result result-right">
          <h2 className="result-title">结果</h2>
          {isLoading ? (
            <div className="flex flex-grow items-center justify-center">
              <div className="flex flex-col items-center justify-center gap-4 text-[#111827]">
                <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--primary))]" />
                <p className="text-lg font-medium">{loadingMessage || '正在生成...'}</p>
                <p className="text-sm text-[#4b5563]">请稍候</p>
              </div>
            </div>
          ) : generatedContent && modelUrl ? (
            <ThreeDModelViewer
              modelUrl={modelUrl}
              fileUrl={fileUrl}
              originalImageUrl={generatedContent.imageUrl}
            />
          ) : (
            <div className="flex flex-grow flex-col items-center justify-center text-center text-[#6b7280]">
              <div className="empty-icon">🎨</div>
              <p className="mt-2">生成的结果将显示在这里</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .page-container {
          max-height: calc(100vh - 120px);
          overflow: hidden;
        }

        .result-left {
          max-height: 75vh;
          overflow: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(209, 209, 211, 0.4) transparent;
        }

        .result-right {
          max-height: 90vh;
          overflow: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(209, 209, 211, 0.4) transparent;
        }

        .result::-webkit-scrollbar {
          width: 8px;
        }

        .result::-webkit-scrollbar-track {
          background: transparent;
        }

        .result::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(59,130,246,0.65) 0%, rgba(99,102,241,0.65) 100%);
          border-radius: 999px;
        }

        .result::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(59,130,246,0.8) 0%, rgba(79,70,229,0.8) 100%);
        }

        .empty-icon {
          margin-bottom: 1rem;
          font-size: 4rem;
        }

        .page-title {
          text-align: center;
          margin-bottom: 0.5rem;
          font-size: 2rem;
          font-weight: bold;
          text-shadow: 0 2px 4px rgb(0 0 0 / 10%);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .result-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a202c;
          text-align: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          border-bottom: 1px solid #eee;
          padding-bottom: 1rem;
        }

        @media (min-width: 1024px) {
          .custom-cols {
            grid-template-columns: 1fr 3fr;
            height: calc(100vh - 160px);
            max-height: calc(100vh - 160px);
            gap: 10px;
          }

          .result-left {
            height: 80%;
          }

          .result-right {
            height: 80%;
          }
        }

        @media (max-width: 1024px) {
          .page-container {
            max-height: none;
          }

          .result-right {
            min-height: 45vh;
          }
        }
      `}</style>
    </div>
  );
};

export default ThreeDModelPage;
