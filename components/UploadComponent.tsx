import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Upload, Loader, X, File as FileIcon } from 'lucide-react';
import { avatarService, UploadedFile } from '../services/avatarService';
import { uploadService } from '../services/uploadService';
import toast from 'react-hot-toast';

export interface UploadComponentRef {
  triggerUpload: () => Promise<void>;
  clear: () => void;
  file: File | null;
}

interface UploadComponentProps {
  // Function called when upload is complete
  onUploadComplete: (file: UploadedFile) => void;
  // Optional: Specify if upload should be to OSS or TV OSS (default TV OSS for product avatar)
  uploadType?: 'oss' | 'tv';
  // Optional: Accepted file types
  accept?: string;
  // Optional: Custom content for the empty state
  children?: React.ReactNode;
  // Optional: Class name for the container
  className?: string;
  // Optional: Whether to show a preview of the uploaded file
  showPreview?: boolean;
  // Optional: Whether to start upload immediately upon selection
  immediate?: boolean;
  // Optional: Initial file url to display
  initialUrl?: string;
  // Optional: Max file size in MB
  maxSize?: number;
  // Optional: Error callback
  onError?: (error: Error) => void;
  // Optional: Callback when a file is selected (before upload)
  onFileSelected?: (file: File) => void;
  // Optional: Callback when the file is cleared
  onClear?: () => void;
  // Optional: Whether the component is disabled (for edit mode)
  disabled?: boolean;
  // Optional: Whether to show the confirm upload button (default: true)
  showConfirmButton?: boolean;
}

const UploadComponent = forwardRef<UploadComponentRef, UploadComponentProps>(({
  onUploadComplete,
  uploadType = 'tv',
  accept = 'image/*',
  children,
  className = '',
  showPreview = true,
  immediate = false,
  initialUrl = '',
  maxSize = 50,
  onError,
  onFileSelected,
  onClear,
  disabled = false,
  showConfirmButton = true
}, ref) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false); // 是否已上传成功
  const [useIframe, setUseIframe] = useState(false); // 是否使用 iframe（遇到跨域问题时）
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview URL when initialUrl changes
  React.useEffect(() => {
    if (initialUrl && initialUrl !== previewUrl) {
      setPreviewUrl(initialUrl);
      setUseIframe(false); // 重置 iframe 状态
      setUploaded(!!initialUrl); // 如果有初始 URL，说明已上传
    }
  }, [initialUrl]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    triggerUpload: async () => {
      if (file && !uploading) {
        await uploadFile(file);
      }
    },
    clear: () => {
        setFile(null);
        setPreviewUrl('');
        setUploaded(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    },
    file: file
  }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Size Validation
    if (selectedFile.size > maxSize * 1024 * 1024) {
        const error = new Error(`文件大小不能超过 ${maxSize}MB`);
        onError ? onError(error) : toast.error(error.message);
        return;
    }

    // Create preview URL immediately
    const objectUrl = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setPreviewUrl(objectUrl);
    setUseIframe(false); // 重置 iframe 状态，新文件先尝试 video 标签
    setUploaded(false); // 重置上传状态

    if (onFileSelected) {
      onFileSelected(selectedFile);
    }

    if (immediate) {
      await uploadFile(selectedFile, objectUrl);
    }
  };

  const uploadFile = async (fileToUpload: File, localPreviewUrl?: string) => {
    console.log('uploadFile 被调用, uploadType:', uploadType, 'file:', fileToUpload.name, 'type:', fileToUpload.type);
    setUploading(true);
    try {
      let uploadedFile: UploadedFile;

      if (uploadType === 'oss') {
        console.log('使用 OSS 上传方式');
        const res = await uploadService.uploadFile(fileToUpload);
        if (res.code === 200 && res.data) {
          uploadedFile = {
            fileId: res.data.ossId,
            fileName: res.data.fileName,
            fileUrl: res.data.url,
            format: fileToUpload.name.split('.').pop() || '',
          };
        } else {
            throw new Error(res.msg || 'Upload failed');
        }
      } else {
        console.log('使用 TV OSS 上传方式');
        // TV OSS Upload (as per reference)
        // 1. Get credential
        let fileType = fileToUpload.type.split('/')[1] || 'jpg';
        // Mapping types as in reference
        if (fileType === 'mpeg') fileType = 'mp3';
        if (fileType === 'quicktime') fileType = 'mp4';
        // 处理视频格式
        if (fileToUpload.type.startsWith('video/')) {
          if (fileType === 'x-msvideo') fileType = 'avi';
          if (fileType === 'webm') fileType = 'webm';
          // mp4 已经是正确的格式
        }

        console.log('准备获取TopView上传凭证, fileType:', fileType);
        const credRes = await avatarService.getUploadCredential(fileType);
        console.log('上传凭证响应:', credRes);
        
        // TopView API 返回的 code 是字符串类型,成功时为 "200"
        if (!credRes || !credRes.result || credRes.code !== '200') {
          console.error('获取上传凭证失败:', credRes);
          throw new Error(credRes?.message || 'Failed to get upload credentials');
        }
        const { uploadUrl, fileName, fileId, format } = credRes.result;
        console.log('准备上传文件到TopView:', { fileName, fileId, format, fileSize: fileToUpload.size, uploadUrl });

        // 2. PUT file to uploadUrl
        console.log('开始上传文件到:', uploadUrl);
        const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            body: fileToUpload,
            headers: {
                'Content-Type': fileToUpload.type
            }
        });

        console.log('上传响应状态:', uploadRes.status, uploadRes.statusText, uploadRes);
        if (!uploadRes.ok) {
            console.error('上传失败:', uploadRes.status, uploadRes.statusText);
            throw new Error(`Upload failed: ${uploadRes.statusText}`);
        }
        
        console.log('文件上传成功');
        
        // Construct result
        uploadedFile = {
            fileId: fileId,
            fileName: fileName,
            fileUrl: localPreviewUrl || previewUrl || uploadUrl, // Use local preview URL first, then state previewUrl, then constructed public URL
            format: format
        };
      }
      console.log('文件上传完成，调用 onUploadComplete:', uploadedFile);
      
      // 标记为已上传成功
      setUploaded(true);
      
      // 确保 onUploadComplete 被调用
      if (onUploadComplete) {
        onUploadComplete(uploadedFile);
      } else {
        console.warn('onUploadComplete 回调未定义');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      const err = error instanceof Error ? error : new Error('文件上传失败');
      onError ? onError(err) : toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setFile(null);
      setPreviewUrl('');
      setUploaded(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onClear) onClear();
  };

  // Helper function to determine file type from accept string
  const getFileTypeFromAccept = (acceptStr: string): 'video' | 'audio' | 'image' => {
    const acceptLower = acceptStr.toLowerCase();
    // Check for video extensions
    if (acceptLower.includes('.mp4') || acceptLower.includes('.mov') || acceptLower.includes('.avi') || acceptLower.includes('.webm') || acceptLower.includes('.bmp')) {
      return 'video';
    }
    // Check for audio extensions
    if (acceptLower.includes('.mp3') || acceptLower.includes('.wav') || acceptLower.includes('.m4a') || acceptLower.includes('.ogg')) {
      return 'audio';
    }
    // Check for MIME types (backward compatibility)
    if (acceptStr.startsWith('video/')) {
      return 'video';
    }
    if (acceptStr.startsWith('audio/')) {
      return 'audio';
    }
    // Default to image
    return 'image';
  };

  const fileType = getFileTypeFromAccept(accept);

  return (
    <div 
        className={`relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'} ${previewUrl ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-600'} ${className}`}
        onClick={() => !disabled && !previewUrl && fileInputRef.current?.click()}
    >
      <input 
          ref={fileInputRef} 
          type="file" 
          accept={accept} 
          onChange={handleFileChange} 
          className="hidden"
          disabled={disabled}
      />
      
      {uploading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-10 rounded-xl backdrop-blur-[1px]">
              <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg">
                  <Loader className="animate-spin text-indigo-600 mb-2" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">上传中...</span>
              </div>
          </div>
      )}

      {showPreview && previewUrl ? (
        <>
            {fileType === 'video' ? (
                useIframe ? (
                  <iframe
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <meta charset="UTF-8">
                          <style>
                            * {
                              margin: 0;
                              padding: 0;
                              box-sizing: border-box;
                            }
                            html, body {
                              width: 100%;
                              height: 100%;
                              overflow: hidden;
                              background: #000;
                            }
                            video {
                              width: 100%;
                              height: 100%;
                              object-fit: contain;
                            }
                          </style>
                        </head>
                        <body>
                          <video src="${previewUrl.replace(/"/g, '&quot;')}" controls muted playsinline></video>
                        </body>
                      </html>
                    `}
                    className="w-full h-full rounded-xl border-0"
                    allow="autoplay; encrypted-media; fullscreen"
                    sandbox="allow-same-origin allow-scripts allow-presentation allow-popups"
                  />
                ) : (
                  <video 
                    src={previewUrl} 
                    className="w-full h-full object-contain rounded-xl" 
                    controls 
                    preload="metadata"
                    playsInline
                    onError={(e) => {
                      // 当视频加载失败时（可能是 CORS 或其他错误），切换到 iframe 模式
                      const video = e.currentTarget;
                      const error = video.error;
                      
                      // 记录错误信息用于调试
                      if (error) {
                        console.warn('视频加载错误:', {
                          code: error.code,
                          message: error.message || '未知错误',
                          MEDIA_ERR_ABORTED: 1,
                          MEDIA_ERR_NETWORK: 2,
                          MEDIA_ERR_DECODE: 3,
                          MEDIA_ERR_SRC_NOT_SUPPORTED: 4
                        });
                      }
                      
                      // 尝试切换到 iframe 模式（可以绕过 CORS 限制）
                      console.warn('视频加载失败，切换到 iframe 模式');
                      setUseIframe(true);
                    }}
                  />
                )
            ) : fileType === 'audio' ? (
                <div className="flex flex-col items-center justify-center w-full h-full p-4">
                    <FileIcon size={32} className="text-indigo-500 mb-2" />
                    <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[90%]">{file?.name || '音频文件'}</span>
                    <audio 
                      src={previewUrl} 
                      className="w-full mt-2 h-8" 
                      controls 
                      crossOrigin="anonymous"
                      onError={(e) => {
                        // 如果 crossOrigin 失败，尝试不使用 crossOrigin
                        const audio = e.currentTarget;
                        if (audio.crossOrigin !== null) {
                          audio.crossOrigin = null;
                        }
                      }}
                    />
                </div>
            ) : (
                <img 
                  src={previewUrl} 
                  className="w-full h-full object-contain rounded-xl p-2" 
                  alt="preview" 
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // 如果 crossOrigin 失败，尝试不使用 crossOrigin
                    const img = e.currentTarget;
                    if (img.crossOrigin !== null) {
                      img.crossOrigin = null;
                      img.referrerPolicy = 'no-referrer';
                    }
                  }}
                />
            )}
            {!disabled && (
              <button 
                  onClick={handleClear} 
                  className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 z-20 shadow-md transition-transform hover:scale-110"
              >
                  <X size={12} />
              </button>
            )}
            
            {/* If manual upload is required and not uploaded yet */}
            {!disabled && !immediate && file && !uploading && !uploaded && showConfirmButton && (
                 <button 
                    onClick={(e) => { e.stopPropagation(); uploadFile(file); }}
                    className="absolute bottom-2 right-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg hover:bg-indigo-700 z-20 transition-colors"
                 >
                    确认上传
                 </button>
            )}
        </>
      ) : (
        children || (
            <div className="text-center text-gray-500 p-4">
                <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-xs font-medium">点击上传文件</p>
                <p className="text-[10px] text-gray-400 mt-1">支持 {accept.replace(/image\/|video\/|audio\//g, '').toUpperCase()}</p>
            </div>
        )
      )}
    </div>
  );
});

export default UploadComponent;

