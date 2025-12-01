import React, { useRef, useState, useEffect } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import BaseModal from './BaseModal';
import { Loader2, RotateCw } from 'lucide-react';

interface AspectRatioOption {
  label: string;
  value: number;
}

const DEFAULT_ASPECT_RATIOS: AspectRatioOption[] = [
  { label: '1:1', value: 1 / 1 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:4', value: 3 / 4 },
];

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (base64: string) => void;
  src: string;
  aspectRatio?: number;
  aspectRatioOptions?: AspectRatioOption[];
  title?: string;
  targetWidth?: number;
  targetHeight?: number;
  texts?: {
    title?: string;
    ratio?: string;
    reset?: string;
    cancel?: string;
    confirm?: string;
  };
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  src,
  aspectRatio = 16 / 9,
  aspectRatioOptions = DEFAULT_ASPECT_RATIOS,
  title,
  targetWidth,
  targetHeight,
  texts,
}) => {
  const cropperRef = useRef<ReactCropperElement>(null);
  const [loading, setLoading] = useState(false);
  const [currentAspectRatio, setCurrentAspectRatio] = useState(aspectRatio);

  const t = texts || {};
  const displayTitle = t.title || title || '裁剪图片';
  const ratioText = t.ratio || '裁剪比例';
  const resetText = t.reset || '重置';
  const cancelText = t.cancel || '取消';
  const confirmText = t.confirm || '确认裁剪';

  // 当 props 的 aspectRatio 变化时，同步更新内部状态
  useEffect(() => {
    setCurrentAspectRatio(aspectRatio);
    if (cropperRef.current?.cropper) {
      cropperRef.current.cropper.setAspectRatio(aspectRatio);
    }
  }, [aspectRatio]);

  const handleAspectRatioChange = (ratio: number) => {
    setCurrentAspectRatio(ratio);
    if (cropperRef.current?.cropper) {
      cropperRef.current.cropper.setAspectRatio(ratio);
    }
  };

  const handleConfirm = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    setLoading(true);
    try {
      // 获取裁剪后的 canvas
      const canvas = cropper.getCroppedCanvas({
        width: targetWidth,
        height: targetHeight,
        imageSmoothingQuality: 'high',
      });

      if (!canvas) {
        throw new Error('无法获取裁剪画布');
      }

      const base64 = canvas.toDataURL('image/png');
      onConfirm(base64);
    } catch (error) {
      console.error('裁剪失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (cropperRef.current?.cropper) {
      cropperRef.current.cropper.reset();
      cropperRef.current.cropper.setAspectRatio(aspectRatio);
    }
    setCurrentAspectRatio(aspectRatio);
  };

  const getRatioIconStyle = (ratio: number) => {
    let width = 24;
    let height = 24;

    if (ratio > 1) {
      // 横向比例
      width = 32;
      height = 32 / ratio;
    } else if (ratio < 1) {
      // 纵向比例
      height = 32;
      width = 32 * ratio;
    }

    return {
      width: `${width}px`,
      height: `${height}px`,
    };
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={displayTitle}
      width="max-w-5xl"
    >
      <div className="flex flex-col gap-4 h-[70vh]">
        {/* 裁剪区域 */}
        <div className="flex-1 relative bg-[#1a1a1a] rounded-lg overflow-hidden flex items-center justify-center">
          <Cropper
            src={src}
            style={{ height: '100%', width: '100%' }}
            aspectRatio={currentAspectRatio}
            guides={true}
            viewMode={1}
            dragMode="move"
            ref={cropperRef}
            background={false}
            autoCropArea={1}
            checkOrientation={false}
            responsive={true}
          />
        </div>

        {/* 比例选择区域 */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ratioText}</span>
            <button 
              onClick={handleReset}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
              title={resetText}
            >
              <RotateCw size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-5 gap-3">
            {aspectRatioOptions.map((option) => (
              <div
                key={option.label}
                onClick={() => handleAspectRatioChange(option.value)}
                className={`
                  flex flex-col items-center justify-center gap-2 py-3 px-2 
                  rounded-lg cursor-pointer transition-all border-2 relative min-h-[80px]
                  ${Math.abs(option.value - currentAspectRatio) < 0.01 
                    ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-500' 
                    : 'bg-gray-50 border-transparent hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'}
                `}
              >
                <div 
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm transition-colors
                    ${Math.abs(option.value - currentAspectRatio) < 0.01 ? 'bg-indigo-500' : 'bg-gray-400 dark:bg-gray-500'}
                  `}
                  style={{...getRatioIconStyle(option.value), marginTop: '-8px'}}
                />
                <span className={`text-xs mt-auto font-medium
                  ${Math.abs(option.value - currentAspectRatio) < 0.01 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}
                `}>
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* 底部按钮 */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default ImageCropModal;
