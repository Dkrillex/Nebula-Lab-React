import React from 'react';
import { createRoot } from 'react-dom/client';
import ImageCropModal from './ImageCropModal';

export interface AspectRatioOption {
  label: string;
  value: number;
}

export interface ImageCropOptions {
  src: string;
  targetWidth?: number;
  targetHeight?: number;
  aspectRatio?: number;
  aspectRatioOptions?: AspectRatioOption[];
  title?: string;
  texts?: {
    title?: string;
    ratio?: string;
    reset?: string;
    cancel?: string;
    confirm?: string;
  };
}

export interface ImageCropResult {
  base64: string;
  width: number;
  height: number;
}

export function showImageCrop(options: ImageCropOptions): Promise<ImageCropResult> {
  return new Promise((resolve, reject) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const cleanup = () => {
      // 延迟卸载以允许一些清理
      setTimeout(() => {
        root.unmount();
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
      }, 100);
    };

    const handleConfirm = (base64: string) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          base64,
          width: img.width,
          height: img.height,
        });
        cleanup();
      };
      img.onerror = () => {
        reject(new Error('图片加载失败'));
        cleanup();
      };
      img.src = base64;
    };

    const handleCancel = () => {
      reject(new Error('用户取消裁剪'));
      cleanup();
    };

    root.render(
      <ImageCropModal
        isOpen={true}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        src={options.src}
        aspectRatio={options.aspectRatio}
        aspectRatioOptions={options.aspectRatioOptions}
        title={options.title}
        targetWidth={options.targetWidth}
        targetHeight={options.targetHeight}
        texts={options.texts}
      />
    );
  });
}
