import React from 'react';
import { X } from 'lucide-react';

interface ImagePreviewModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div className="relative max-h-full max-w-full">
        <button
          onClick={onClose}
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
        />
      </div>
    </div>
  );
};

export default ImagePreviewModal;

