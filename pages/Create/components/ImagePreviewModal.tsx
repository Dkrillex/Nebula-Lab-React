import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen || !imageUrl) return null;

  // Handle ESC key and prevent body scroll
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div className="relative max-h-full max-w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-red-600"
          aria-label="Close preview"
        >
          <X className="h-5 w-5" />
        </button>
        <img
          src={imageUrl}
          alt="Preview"
          className="max-h-[90vh] max-w-full object-contain"
          onClick={(e) => e.stopPropagation()}
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
      </div>
    </div>
  );
};

export default ImagePreviewModal;

