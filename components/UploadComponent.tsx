import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Upload, Loader, X, File as FileIcon } from 'lucide-react';
import { avatarService, UploadedFile } from '../services/avatarService';
import { uploadService } from '../services/uploadService';

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
  onClear
}, ref) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        onError ? onError(error) : alert(error.message);
        return;
    }

    // Create preview URL immediately
    const objectUrl = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setPreviewUrl(objectUrl);

    if (onFileSelected) {
      onFileSelected(selectedFile);
    }

    if (immediate) {
      await uploadFile(selectedFile);
    }
  };

  const uploadFile = async (fileToUpload: File) => {
    setUploading(true);
    try {
      let uploadedFile: UploadedFile;

      if (uploadType === 'oss') {
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
        // TV OSS Upload (as per reference)
        // 1. Get credential
        let fileType = fileToUpload.type.split('/')[1] || 'jpg';
        // Mapping types as in reference
        if (fileType === 'mpeg') fileType = 'mp3';
        if (fileType === 'quicktime') fileType = 'mp4';

        const credRes = await avatarService.getUploadCredential(fileType);
        if (credRes.code !== '200' || !credRes.result) {
           throw new Error(credRes.msg || 'Failed to get credentials');
        }
        const { uploadUrl, fileName, fileId, format } = credRes.result;

        // 2. PUT file to uploadUrl
        const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            body: fileToUpload,
            headers: {
                'Content-Type': fileToUpload.type
            }
        });

        if (!uploadRes.ok) {
            throw new Error(`Upload failed: ${uploadRes.statusText}`);
        }
        
        // Construct result
        uploadedFile = {
            fileId: fileId,
            fileName: fileName,
            fileUrl: previewUrl, // Use local preview URL initially or constructed public URL if known
            format: format
        };
      }
      console.log(uploadedFile);
      
      onUploadComplete(uploadedFile);
    } catch (error: any) {
      console.error('Upload error:', error);
      const err = error instanceof Error ? error : new Error('文件上传失败');
      onError ? onError(err) : alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setFile(null);
      setPreviewUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onClear) onClear();
  };

  return (
    <div 
        className={`relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition ${previewUrl ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-600'} ${className}`}
        onClick={() => !previewUrl && fileInputRef.current?.click()}
    >
      <input 
          ref={fileInputRef} 
          type="file" 
          accept={accept} 
          onChange={handleFileChange} 
          className="hidden" 
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
            {accept.startsWith('video') ? (
                <video src={previewUrl} className="w-full h-full object-contain rounded-xl" controls />
            ) : accept.startsWith('audio') ? (
                <div className="flex flex-col items-center justify-center w-full h-full p-4">
                    <FileIcon size={32} className="text-indigo-500 mb-2" />
                    <span className="text-xs text-gray-600 truncate max-w-[90%]">{file?.name || '音频文件'}</span>
                    <audio src={previewUrl} className="w-full mt-2 h-8" controls />
                </div>
            ) : (
                <img src={previewUrl} className="w-full h-full object-contain rounded-xl p-2" alt="preview" />
            )}
            <button 
                onClick={handleClear} 
                className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 z-20 shadow-md transition-transform hover:scale-110"
            >
                <X size={12} />
            </button>
            
            {/* If manual upload is required and not uploaded yet */}
            {!immediate && file && !uploading && (
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

