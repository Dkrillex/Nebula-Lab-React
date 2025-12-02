import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import BaseModal from '../../../components/BaseModal';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { RotateCw } from 'lucide-react';

interface ImageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{ url: string; file?: File; id?: string }>;
  onSubmit: (images: Array<{ url: string; file?: File; id?: string }>) => void;
}

interface AspectRatioOption {
  label: string;
  value: number;
}

const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  { label: '9:16', value: 9 / 16 },
  { label: '16:9', value: 16 / 9 },
];

// 根据比例获取目标尺寸
const getTargetSize = (ratio: number) => {
  if (Math.abs(ratio - 9 / 16) < 0.01) return { w: 1080, h: 1920 };
  if (Math.abs(ratio - 16 / 9) < 0.01) return { w: 1920, h: 1080 };
  // 默认返回 9:16
  return { w: 1080, h: 1920 };
};

const ImageEditModal: React.FC<ImageEditModalProps> = ({ isOpen, onClose, images, onSubmit }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [edits, setEdits] = useState<Record<number, { aspectRatio: number; hasCropped: boolean }>>({});
  const [busy, setBusy] = useState(false);
  const [previews, setPreviews] = useState<Record<number, string>>({});
  const cropperRefs = useRef<Record<number, ReactCropperElement | null>>({});
  const cropTimerRef = useRef<NodeJS.Timeout | null>(null);
  // 保存每张图片的裁剪数据
  const cropDataRef = useRef<Record<number, any>>({});

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex(0);
    setEdits({});
    setPreviews({});
    cropperRefs.current = {};
    cropDataRef.current = {};
    // 清理防抖定时器
    if (cropTimerRef.current) {
      clearTimeout(cropTimerRef.current);
      cropTimerRef.current = null;
    }
  }, [isOpen]);

  // 切换图片时，保存当前裁剪状态并恢复目标图片的裁剪状态
  const handleImageSwitch = (newIndex: number) => {
    // 保存当前图片的裁剪数据
    const currentCropper = cropperRefs.current[activeIndex]?.cropper;
    if (currentCropper) {
      try {
        const cropData = currentCropper.getData();
        cropDataRef.current[activeIndex] = cropData;
      } catch (error) {
        console.error('保存裁剪数据失败:', error);
      }
    }

    // 切换索引
    setActiveIndex(newIndex);
  };

  const currentEdit = edits[activeIndex] || { aspectRatio: 9 / 16, hasCropped: false };
  const currentAspectRatio = currentEdit.aspectRatio;

  const handleAspectRatioChange = (ratio: number) => {
    setEdits((prev) => ({ 
      ...prev, 
      [activeIndex]: { 
        aspectRatio: ratio, 
        hasCropped: prev[activeIndex]?.hasCropped || false 
      } 
    }));
    const cropper = cropperRefs.current[activeIndex]?.cropper;
    if (cropper) {
      cropper.setAspectRatio(ratio);
    }
  };

  const handleReset = () => {
    const cropper = cropperRefs.current[activeIndex]?.cropper;
    if (cropper) {
      cropper.reset();
      cropper.setAspectRatio(9 / 16);
    }
    setEdits((prev) => {
      const newEdits = { ...prev };
      delete newEdits[activeIndex];
      return newEdits;
    });
  };

  // 生成预览缩略图
  const generatePreview = useCallback(async (idx: number) => {
    const cropper = cropperRefs.current[idx]?.cropper;
    if (!cropper) {
      // 如果没有裁剪器，使用原图
      setPreviews((p) => {
        // 只有当该索引没有预览时才设置原图，避免覆盖已有的预览
        if (!p[idx]) {
          return { ...p, [idx]: images[idx]?.url || '' };
        }
        return p;
      });
      return;
    }

    try {
      // 获取当前图片的裁剪比例
      const edit = edits[idx] || { aspectRatio: 9 / 16 };
      const aspectRatio = edit.aspectRatio;
      
      // 根据比例计算预览尺寸，保持比例一致
      let previewWidth = 120;
      let previewHeight = 120;
      
      if (aspectRatio > 1) {
        // 横向比例（16:9）
        previewWidth = 120;
        previewHeight = 120 / aspectRatio;
      } else {
        // 纵向比例（9:16）
        previewHeight = 120;
        previewWidth = 120 * aspectRatio;
      }
      
      const canvas = cropper.getCroppedCanvas({
        width: previewWidth,
        height: previewHeight,
        imageSmoothingQuality: 'high',
      });
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPreviews((p) => ({ ...p, [idx]: dataUrl }));
      }
    } catch (error) {
      console.error('生成预览失败:', error);
      // 生成失败时，如果还没有预览，则使用原图
      setPreviews((p) => {
        if (!p[idx]) {
          return { ...p, [idx]: images[idx]?.url || '' };
        }
        return p;
      });
    }
  }, [images, edits]);

  // 当切换图片时，初始化预览（如果还没有）
  useEffect(() => {
    if (isOpen && images.length > 0) {
      // 如果当前图片还没有预览，使用原图作为初始预览
      setPreviews((p) => {
        if (!p[activeIndex] && images[activeIndex]?.url) {
          return { ...p, [activeIndex]: images[activeIndex].url };
        }
        return p;
      });
      
      // 延迟一下，确保 cropper 已初始化，然后生成裁剪预览
      const timer = setTimeout(() => {
        generatePreview(activeIndex);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [activeIndex, isOpen, generatePreview]);

  // 处理裁剪事件，实时更新预览（使用防抖）
  const handleCrop = useCallback((idx: number) => {
    // 标记该图片已被裁剪
    setEdits((prev) => ({
      ...prev,
      [idx]: {
        ...(prev[idx] || { aspectRatio: 3 / 4 }),
        hasCropped: true,
      },
    }));
    
    // 清除之前的定时器
    if (cropTimerRef.current) {
      clearTimeout(cropTimerRef.current);
    }
    // 设置新的定时器，防抖更新预览
    cropTimerRef.current = setTimeout(() => {
      generatePreview(idx);
      cropTimerRef.current = null;
    }, 150);
  }, [generatePreview]);

  const handleSubmit = async () => {
    if (!images || images.length === 0) return;
    try {
      setBusy(true);
      const edited: Array<{ url: string; file?: File; id?: string }> = [];

      for (let i = 0; i < images.length; i++) {
        const edit = edits[i];
        const cropper = cropperRefs.current[i]?.cropper;

        // 检查是否有编辑：比例改变或进行了裁剪操作
        const hasRatioEdit = edit && Math.abs(edit.aspectRatio - 9 / 16) > 0.01;
        const hasCropped = edit?.hasCropped || false;
        const hasEdit = hasRatioEdit || hasCropped;

        if (hasEdit && cropper) {
          // 有编辑，使用裁剪器生成新图片
          const aspectRatio = edit?.aspectRatio || 9 / 16;
          const size = getTargetSize(aspectRatio);
          const canvas = cropper.getCroppedCanvas({
            width: size.w,
            height: size.h,
            imageSmoothingQuality: 'high',
          });

          if (!canvas) {
            throw new Error(`图片 ${i + 1} 裁剪失败`);
          }

          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], `edited_${Date.now()}_${i}.jpg`, { type: 'image/jpeg' });
          const previewUrl = URL.createObjectURL(file);

          edited.push({
            url: previewUrl,
            file: file,
            id: undefined, // 清除旧的OSS ID，因为需要重新上传
          });
        } else {
          // 没有编辑，保持原样
          edited.push({
            url: images[i].url,
            file: images[i].file,
            id: images[i].id,
          });
        }
      }

      onSubmit(edited);
      toast.success('已保存编辑，点击"完成提交"后将上传到OSS');
      onClose();
    } catch (e: any) {
      toast.error(e.message || '编辑失败');
    } finally {
      setBusy(false);
    }
  };

  const currentUrl = images[activeIndex]?.url || '';
  const currentSize = getTargetSize(currentAspectRatio);

  const getRatioIconStyle = (ratio: number) => {
    let width = 24;
    let height = 24;

    if (ratio > 1) {
      width = 32;
      height = 32 / ratio;
    } else if (ratio < 1) {
      height = 32;
      width = 32 * ratio;
    }

    return {
      width: `${width}px`,
      height: `${height}px`,
    };
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="修改视频拟合比例" width="max-w-5xl">
      <div className="flex gap-6 h-[70vh] max-h-[700px]">
        {/* 左侧：裁剪区域 */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 比例选择 */}
          <div className="flex flex-col gap-2 mb-4 flex-shrink-0">
            <div className="flex justify-between items-center px-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">裁剪比例</span>
              <button
                onClick={handleReset}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                title="重置"
              >
                <RotateCw size={16} />
              </button>
            </div>
            <div className="flex gap-3">
              {ASPECT_RATIO_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleAspectRatioChange(option.value)}
                  className={`
                    flex flex-col items-center justify-center gap-2 py-3 px-4 
                    rounded-lg cursor-pointer transition-all border-2 relative min-h-[80px] min-w-[80px]
                    ${Math.abs(option.value - currentAspectRatio) < 0.01
                      ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-500'
                      : 'bg-gray-50 border-transparent hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'}
                  `}
                >
                  <div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm transition-colors
                      ${Math.abs(option.value - currentAspectRatio) < 0.01 ? 'bg-indigo-500' : 'bg-gray-400 dark:bg-gray-500'}
                    `}
                    style={{ ...getRatioIconStyle(option.value), marginTop: '-8px' }}
                  />
                  <span
                    className={`text-xs mt-auto font-medium
                      ${Math.abs(option.value - currentAspectRatio) < 0.01 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}
                    `}
                  >
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 裁剪器 */}
          <div className="flex-1 relative bg-[#1a1a1a] rounded-lg overflow-hidden flex items-center justify-center min-h-0">
            {currentUrl && (
              <Cropper
                key={`cropper-${activeIndex}`}
                src={currentUrl}
                style={{ height: '100%', width: '100%' }}
                aspectRatio={currentAspectRatio}
                guides={true}
                viewMode={1}
                dragMode="move"
                ref={(el) => {
                  if (el) {
                    cropperRefs.current[activeIndex] = el;
                  }
                }}
                background={false}
                autoCropArea={1}
                checkOrientation={false}
                responsive={true}
                ready={() => {
                  // Cropper 初始化完成后，恢复之前的裁剪数据
                  const savedCropData = cropDataRef.current[activeIndex];
                  if (savedCropData) {
                    try {
                      const cropper = cropperRefs.current[activeIndex]?.cropper;
                      if (cropper) {
                        // 延迟一下确保 cropper 完全初始化
                        setTimeout(() => {
                          cropper.setData(savedCropData);
                          // 恢复后生成预览
                          generatePreview(activeIndex);
                        }, 50);
                        return;
                      }
                    } catch (error) {
                      console.error('恢复裁剪数据失败:', error);
                    }
                  }
                  // 如果没有保存的数据，生成初始预览
                  setTimeout(() => generatePreview(activeIndex), 100);
                }}
                crop={() => {
                  // 裁剪时实时更新预览
                  handleCrop(activeIndex);
                }}
                cropend={() => {
                  // 裁剪结束时保存裁剪数据
                  const cropper = cropperRefs.current[activeIndex]?.cropper;
                  if (cropper) {
                    try {
                      const cropData = cropper.getData();
                      cropDataRef.current[activeIndex] = cropData;
                    } catch (error) {
                      console.error('保存裁剪数据失败:', error);
                    }
                  }
                  
                  // 更新预览，并标记已裁剪
                  setEdits((prev) => ({
                    ...prev,
                    [activeIndex]: {
                      ...(prev[activeIndex] || { aspectRatio: 9 / 16 }),
                      hasCropped: true,
                    },
                  }));
                  generatePreview(activeIndex);
                }}
              />
            )}
          </div>

          {/* 底部按钮 */}
          <div className="mt-4 flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleSubmit}
              disabled={busy}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              <Upload size={16} /> 完成
            </button>
          </div>
        </div>

        {/* 右侧：缩略图列表 */}
        <div className="w-64 flex-shrink-0 overflow-y-auto">
          <div className="text-sm font-bold mb-2">已上传图片 ({images.length}/10)</div>
          <div className="grid grid-cols-2 gap-2">
            {images.map((it, i) => {
              // 优先使用预览图，如果没有预览图则使用原图
              const previewUrl = previews[i] || it.url;
              return (
                <div
                  key={i}
                  className={`relative aspect-square overflow-hidden rounded-lg border cursor-pointer transition-all bg-gray-100 dark:bg-zinc-800 ${
                    activeIndex === i ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-border'
                  }`}
                  onClick={() => handleImageSwitch(i)}
                >
                  <img 
                    key={`preview-${i}-${previewUrl}`}
                    src={previewUrl} 
                    className="w-full h-full object-contain" 
                    alt={`图片 ${i + 1}`}
                    onError={(e) => {
                      // 如果预览图加载失败，回退到原图
                      if (previewUrl !== it.url) {
                        e.currentTarget.src = it.url;
                      }
                    }}
                  />
                  {activeIndex === i && (
                    <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default ImageEditModal;
