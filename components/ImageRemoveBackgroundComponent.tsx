import React, { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Upload, Loader, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadService } from '../services/uploadService';
import { backgroundService, RemoveBackgroundQueryResult } from '../services/backgroundService';

export interface ImageRemoveBackgroundComponentRef {
  triggerUpload: () => Promise<void>;
  clear: () => void;
  file: File | null;
}

interface ImageRemoveBackgroundComponentProps {
  // 上传完成回调，返回原始图片和抠图后的图片信息
  onComplete: (data: {
    originalFile: {
      fileId: string;
      fileName: string;
      fileUrl: string;
      format: string;
    };
    resultFile: {
      fileId: string;
      fileUrl: string;
    };
  }) => void;
  // 可选：自定义容器类名
  className?: string;
  // 可选：最大文件大小（MB）
  maxSize?: number;
  // 可选：错误回调
  onError?: (error: Error) => void;
  // 可选：是否立即上传（选择文件后自动上传）
  immediate?: boolean;
}

// 轮询间隔（毫秒）
const POLL_INTERVAL = 2000;
// 最大轮询次数
const MAX_POLL_COUNT = 60; // 最多轮询2分钟

const ImageRemoveBackgroundComponent = forwardRef<
  ImageRemoveBackgroundComponentRef,
  ImageRemoveBackgroundComponentProps
>(({ onComplete, className = '', maxSize = 50, onError, immediate = true }, ref) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollCountRef = useRef<number>(0);

  // 清理轮询定时器
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
    };
  }, []);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    triggerUpload: async () => {
      if (file && !uploading && !processing) {
        await handleUploadAndProcess(file);
      }
    },
    clear: () => {
      setFile(null);
      setPreviewUrl('');
      setResultUrl('');
      setError('');
      setProcessing(false);
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      pollCountRef.current = 0;
    },
    file: file,
  }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // 验证文件类型
    if (!selectedFile.type.startsWith('image/')) {
      const err = new Error('请选择图片文件');
      setError(err.message);
      onError?.(err);
      return;
    }

    // 验证文件大小
    if (selectedFile.size > maxSize * 1024 * 1024) {
      const err = new Error(`文件大小不能超过 ${maxSize}MB`);
      setError(err.message);
      onError?.(err);
      return;
    }

    // 创建预览URL
    const objectUrl = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setPreviewUrl(objectUrl);
    setError('');
    setResultUrl('');

    // 如果设置了立即上传，自动开始上传和处理
    if (immediate) {
      await handleUploadAndProcess(selectedFile);
    }
  };

  // 上传文件并处理抠图
  const handleUploadAndProcess = async (fileToUpload: File) => {
    setUploading(true);
    setProcessing(false);
    setError('');

    try {
      // 1. 上传图片
      const uploadRes = await uploadService.uploadFile(fileToUpload);
      if (uploadRes.code !== 200 || !uploadRes.data) {
        throw new Error(uploadRes.msg || '图片上传失败');
      }

      const originalFile = {
        fileId: uploadRes.data.ossId,
        fileName: uploadRes.data.fileName,
        fileUrl: uploadRes.data.url,
        format: fileToUpload.name.split('.').pop() || '',
      };

      // 2. 提交抠图任务
      setUploading(false);
      setProcessing(true);

      const submitRes = await backgroundService.submitRemoveBackground({
        productImageFileId: originalFile.fileId,
      });

      if (!submitRes.taskId) {
        throw new Error('提交抠图任务失败');
      }

      // 3. 开始轮询任务状态
      await pollTaskStatus(submitRes.taskId, originalFile);
    } catch (err: any) {
      console.error('Upload and process error:', err);
      const error = err instanceof Error ? err : new Error('处理失败');
      setError(error.message);
      setUploading(false);
      setProcessing(false);
      onError?.(error);
    }
  };

  // 轮询任务状态
  const pollTaskStatus = async (
    taskId: string,
    originalFile: {
      fileId: string;
      fileName: string;
      fileUrl: string;
      format: string;
    }
  ) => {
    // 重置轮询计数
    pollCountRef.current = 0;

    const poll = async (): Promise<void> => {
      try {
        pollCountRef.current += 1;

        // 检查是否超过最大轮询次数
        if (pollCountRef.current > MAX_POLL_COUNT) {
          throw new Error('处理超时，请稍后重试');
        }

        const queryRes = await backgroundService.queryRemoveBackground(taskId);

        if (queryRes.status === 'success') {
          // 任务成功完成
          setProcessing(false);
          if (queryRes.resultImageUrl) {
            setResultUrl(queryRes.resultImageUrl);
            // 调用完成回调
            onComplete({
              originalFile,
              resultFile: {
                fileId: queryRes.resultImageFileId || '',
                fileUrl: queryRes.resultImageUrl,
              },
            });
          } else {
            throw new Error('未获取到处理结果');
          }
          // 清理定时器
          if (pollTimerRef.current) {
            clearTimeout(pollTimerRef.current);
            pollTimerRef.current = null;
          }
        } else if (queryRes.status === 'fail') {
          // 任务失败
          setProcessing(false);
          const errorMsg = queryRes.errorMsg || '抠图处理失败';
          setError(errorMsg);
          onError?.(new Error(errorMsg));
          // 清理定时器
          if (pollTimerRef.current) {
            clearTimeout(pollTimerRef.current);
            pollTimerRef.current = null;
          }
        } else {
          // 任务仍在处理中，继续轮询
          pollTimerRef.current = setTimeout(() => {
            poll();
          }, POLL_INTERVAL);
        }
      } catch (err: any) {
        setProcessing(false);
        const error = err instanceof Error ? err : new Error('查询任务状态失败');
        setError(error.message);
        onError?.(error);
        // 清理定时器
        if (pollTimerRef.current) {
          clearTimeout(pollTimerRef.current);
          pollTimerRef.current = null;
        }
      }
    };

    // 开始第一次轮询
    await poll();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreviewUrl('');
    setResultUrl('');
    setError('');
    setProcessing(false);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    pollCountRef.current = 0;
  };

  const hasResult = !!resultUrl;
  const showError = !!error;

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
        hasResult
          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
          : showError
          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
          : previewUrl
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
          : 'border-gray-300 dark:border-gray-600'
      } ${className}`}
      onClick={() => !previewUrl && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 上传中遮罩 */}
      {(uploading || processing) && (
        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-10 rounded-xl backdrop-blur-[1px]">
          <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <Loader className="animate-spin text-indigo-600 mb-2" size={24} />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {uploading ? '上传中...' : 'AI抠图中...'}
            </span>
            {processing && (
              <span className="text-xs text-gray-400 mt-1">
                这可能需要几秒钟
              </span>
            )}
          </div>
        </div>
      )}

      {/* 预览区域 */}
      {previewUrl ? (
        <div className="w-full h-full relative">
          {/* 对比显示：原图和处理后的图 */}
          {hasResult ? (
            <div className="grid grid-cols-2 gap-2 p-2">
              <div className="flex flex-col">
                <div className="text-xs text-gray-500 mb-1 text-center">原图</div>
                <img
                  src={previewUrl}
                  className="w-full h-full object-contain rounded-lg"
                  alt="original"
                />
              </div>
              <div className="flex flex-col">
                <div className="text-xs text-gray-500 mb-1 text-center flex items-center justify-center gap-1">
                  <CheckCircle2 size={12} className="text-green-500" />
                  抠图结果
                </div>
                <img
                  src={resultUrl}
                  className="w-full h-full object-contain rounded-lg"
                  alt="result"
                />
              </div>
            </div>
          ) : (
            <div className="p-2">
              <img
                src={previewUrl}
                className="w-full h-full object-contain rounded-xl"
                alt="preview"
              />
            </div>
          )}

          {/* 错误提示 */}
          {showError && (
            <div className="absolute bottom-2 left-2 right-2 bg-red-500 text-white px-3 py-2 rounded-lg text-xs flex items-center gap-2 z-20">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* 清除按钮 */}
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 z-20 shadow-md transition-transform hover:scale-110"
          >
            <X size={12} />
          </button>

          {/* 手动上传按钮（如果未设置立即上传） */}
          {!immediate && file && !uploading && !processing && !hasResult && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUploadAndProcess(file);
              }}
              className="absolute bottom-2 right-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg hover:bg-indigo-700 z-20 transition-colors"
            >
              开始抠图
            </button>
          )}
        </div>
      ) : (
        // 空状态
        <div className="text-center text-gray-500 p-6">
          <Upload size={32} className="mx-auto mb-3 text-gray-400" />
          <p className="text-sm font-medium">点击上传图片</p>
          <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG 等图片格式</p>
          <p className="text-xs text-gray-400 mt-1">上传后自动进行AI抠图</p>
        </div>
      )}
    </div>
  );
});

ImageRemoveBackgroundComponent.displayName = 'ImageRemoveBackgroundComponent';

export default ImageRemoveBackgroundComponent;

