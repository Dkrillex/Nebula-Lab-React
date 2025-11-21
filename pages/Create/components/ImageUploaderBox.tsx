import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploaderBoxProps {
  title: string;
  description?: string;
  imageUrl: string | null;
  onImageSelect: (file: File, dataUrl: string) => void;
  onClear: () => void;
}

const ImageUploaderBox: React.FC<ImageUploaderBoxProps> = ({
  title,
  description,
  imageUrl,
  onImageSelect,
  onClear,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = `file-upload-${title.replace(/\s+/g, '-').toLowerCase()}`;

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.addEventListener('load', (e) => {
      const result = e.target?.result as string;
      if (result) {
        onImageSelect(file, result);
      }
    });
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-[#111827]">{title}</h3>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative flex aspect-square w-full select-none items-center justify-center rounded-lg bg-[#f3f4f6] transition-colors duration-200 ${
          isDragging
            ? 'bg-[rgba(249,115,22,0.1)] outline-dashed outline-2 outline-primary'
            : ''
        } ${
          imageUrl
            ? 'p-0'
            : 'border-2 border-dashed border-[rgba(0,0,0,0.1)] p-4'
        }`}
      >
        {!imageUrl ? (
          <label
            htmlFor={inputId}
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center text-center text-[#6b7280]"
          >
            <Upload className="mb-2 h-8 w-8" />
            <p className="mb-1 text-xs font-semibold text-[#4b5563]">上传图片</p>
            {description && <p className="text-xs">{description}</p>}
            <input
              id={inputId}
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />
          </label>
        ) : (
          <>
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full rounded-lg object-contain"
            />
            <button
              onClick={onClear}
              className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-1 text-white backdrop-blur-sm transition-colors hover:bg-red-600"
              aria-label={`Remove ${title} image`}
            >
              <X className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUploaderBox;

