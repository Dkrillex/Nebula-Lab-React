import React, { useState } from 'react';
import { Download, Maximize2, FolderPlus, Check } from 'lucide-react';
import AddMaterialModal from '../../../components/AddMaterialModal';

interface FaceSwapResultDisplayProps {
  imageUrl: string;
  originalImageUrl?: string | null;
  onUseAsInput?: (imageUrl: string) => void;
  onImageClick?: (imageUrl: string) => void;
}

const FaceSwapResultDisplay: React.FC<FaceSwapResultDisplayProps> = ({
  imageUrl,
  originalImageUrl,
  onUseAsInput,
  onImageClick,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [importedStatus, setImportedStatus] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `face-swap-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = () => {
    if (onImageClick) {
      onImageClick(imageUrl);
    } else {
      setIsPreviewOpen(true);
    }
  };

  const handleAddToMaterials = () => {
    setIsAddModalOpen(true);
  };

  const handleMaterialSuccess = () => {
    setImportedStatus(true);
    setIsAddModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="relative group">
          <img
            src={imageUrl}
            alt="Face swap result"
            className="w-full rounded-lg object-contain"
            onClick={handlePreview}
            style={{ cursor: 'pointer' }}
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
            <button
              onClick={handlePreview}
              className="rounded-full bg-white/90 p-2 hover:bg-white transition-colors"
              title="预览"
            >
              <Maximize2 className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={handleDownload}
              className="rounded-full bg-white/90 p-2 hover:bg-white transition-colors"
              title="下载"
            >
              <Download className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={handleAddToMaterials}
              className={`rounded-full p-2 transition-colors ${
                importedStatus
                  ? 'bg-green-500 text-white'
                  : 'bg-white/90 hover:bg-white'
              }`}
              title="添加到素材库"
            >
              {importedStatus ? (
                <Check className="h-5 w-5" />
              ) : (
                <FolderPlus className="h-5 w-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          {onUseAsInput && (
            <button
              onClick={() => onUseAsInput(imageUrl)}
              className="flex-1 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              用作输入
            </button>
          )}
        </div>
      </div>

      <AddMaterialModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleMaterialSuccess}
        initialData={{
          assetUrl: imageUrl,
          assetType: 6, // 图片类型
        }}
      />
    </>
  );
};

export default FaceSwapResultDisplay;

