import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderPlus, Video } from 'lucide-react';
import ImagePreviewModal, { ImagePreviewAction } from '@/components/ImagePreviewModal';
import AddMaterialModal from '@/components/AddMaterialModal';
import { useVideoGenerationStore } from '@/stores/videoGenerationStore';
import { 
  StyleTransferPageProps, 
  GeneratedImage, 
  ModeType,
  getModes 
} from './data';
import StandardMode, { StandardModeRef } from './standard';
import CreativeMode, { CreativeModeRef } from './creative';
import ClothingMode, { ClothingModeRef } from './clothing';

const StyleTransferPage: React.FC<StyleTransferPageProps> = ({ t }) => {
  const navigate = useNavigate();
  const { setData } = useVideoGenerationStore();
  const [selectedMode, setSelectedMode] = useState<ModeType>('standard');
  
  // Refs for mode components
  const standardModeRef = useRef<StandardModeRef>(null);
  const creativeModeRef = useRef<CreativeModeRef>(null);
  const clothingModeRef = useRef<ClothingModeRef>(null);

  // AddMaterialModal State
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [addMaterialData, setAddMaterialData] = useState<any>(null);

  // 图片预览状态 - 用于存储当前预览的图片列表
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewImages, setPreviewImages] = useState<GeneratedImage[]>([]);

  const modes = getModes(t);

  const handleSaveToAssets = (img: GeneratedImage) => {
    // Generate mode label
    const modeLabels = {
      'standard': '标准模式',
      'creative': '创意模式',
      'clothing': '服饰模式'
    };
    const modeLabel = modeLabels[selectedMode];
    const materialName = `万物迁移-${modeLabel}`;
    
    setAddMaterialData({
      assetName: materialName,
      assetUrl: img.url,
      assetType: 6,
      assetTag: materialName,
      assetDesc: materialName,
      assetId: String(img.key).includes('_') ? undefined : String(img.key)
    });
    setShowAddMaterialModal(true);
  };

  // 图生视频跳转
  const handleImageToVideo = (img: GeneratedImage) => {
    const prompt = selectedMode === 'creative' ? creativeModeRef.current?.getPrompt() || '' : '';
    const transferId = `transfer_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    setData(transferId, {
      images: [img.url],
      sourcePrompt: prompt,
      timestamp: Date.now(),
      source: 'styleTransfer'
    });
    navigate(`/create/imgToVideo?transferId=${transferId}`);
  };

  // 图片预览
  const handlePreview = (img: GeneratedImage, allImages: GeneratedImage[]) => {
    const index = allImages.findIndex(i => i.key === img.key);
    setPreviewIndex(index >= 0 ? index : 0);
    setPreviewImages(allImages);
    setPreviewVisible(true);
  };

  // 预览操作按钮配置
  const previewActions: ImagePreviewAction[] = [
    {
      key: 'saveToAssets',
      icon: <FolderPlus size={18} />,
      label: '添加素材',
      onClick: (image) => {
        const img = previewImages.find(i => i.url === image.url);
        if (img) {
          handleSaveToAssets(img);
          setPreviewVisible(false);
        }
      },
    },
    {
      key: 'imageToVideo',
      icon: <Video size={18} />,
      label: '图生视频',
      onClick: (image) => {
        const img = previewImages.find(i => i.url === image.url);
        if (img) {
          handleImageToVideo(img);
        }
      },
      className: "flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium",
    },
  ];

  return (
    <>
      <style>{`
        // 隐藏滚动条
        // #style-transfer-right-column {
        //   scrollbar-width: none; /* Firefox */
        //   -ms-overflow-style: none; /* IE/Edge */
        // }
        // #style-transfer-right-column::-webkit-scrollbar {
        //   display: none; /* Chrome/Safari */
        //   width: 0;
        //   height: 0;
        // }
        // #style-transfer-right-column * {
        //   scrollbar-width: none; /* Firefox */
        //   -ms-overflow-style: none; /* IE/Edge */
        // }
        // #style-transfer-right-column *::-webkit-scrollbar {
        //   display: none; /* Chrome/Safari */
        //   width: 0;
        //   height: 0;
        // }
      `}</style>
      <div className="flex flex-col h-[calc(100vh-64px)] bg-white dark:bg-gray-900">
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Leftmost Column - Vertical Mode Selector */}
          <div className="w-auto md:w-24 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto overflow-y-hidden md:overflow-x-hidden flex-shrink-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]">
          <div className="p-2 flex flex-row md:flex-col gap-2 min-w-max md:min-w-0">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`relative flex flex-row md:flex-col items-center justify-center gap-1.5 px-3 md:px-2 py-3 md:py-4 rounded-lg transition-all min-w-[80px] md:min-w-0 ${
                  selectedMode === mode.id 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={`${mode.title}: ${mode.desc}`}
              >
                {selectedMode === mode.id && (
                  <>
                    {/* Mobile: bottom indicator */}
                    <div className="absolute -bottom-2 left-0 right-0 h-1 rounded-t-full bg-indigo-300 dark:bg-indigo-400 md:hidden"></div>
                    {/* Desktop: left indicator */}
                    <div className="hidden md:block absolute -left-2 top-0 bottom-0 w-1 rounded-r-full bg-indigo-300 dark:bg-indigo-400"></div>
                  </>
                )}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                   selectedMode === mode.id ? 'bg-white/20 text-white' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                }`}>
                   <mode.icon size={20} className={selectedMode === mode.id && mode.id === 'creative' ? 'text-yellow-200' : ''} />
                </div>
                <div className={`text-[11px] font-medium text-center leading-tight ${selectedMode === mode.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                   {mode.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Mode Components (Each component contains its own upload and result sections) */}
        {/* 使用 hidden 类保持组件挂载，切换模式时保留所有数据状态 */}
        <div id="style-transfer-right-column" className="flex-1 overflow-hidden relative">
          {/* Standard Mode - Keep mounted to preserve state */}
          <div className={`absolute inset-0 ${selectedMode === 'standard' ? 'block' : 'hidden'} ${selectedMode !== 'standard' ? 'pointer-events-none' : ''}`}>
            <StandardMode
              ref={standardModeRef}
              t={t}
              onSaveToAssets={handleSaveToAssets}
              onImageToVideo={handleImageToVideo}
              onPreview={handlePreview}
            />
          </div>
          {/* Creative Mode - Keep mounted to preserve state */}
          <div className={`absolute inset-0 ${selectedMode === 'creative' ? 'block' : 'hidden'} ${selectedMode !== 'creative' ? 'pointer-events-none' : ''}`}>
            <CreativeMode
              ref={creativeModeRef}
              t={t}
              onSaveToAssets={handleSaveToAssets}
              onImageToVideo={handleImageToVideo}
              onPreview={handlePreview}
            />
          </div>
          {/* Clothing Mode - Keep mounted to preserve state */}
          <div className={`absolute inset-0 ${selectedMode === 'clothing' ? 'block' : 'hidden'} ${selectedMode !== 'clothing' ? 'pointer-events-none' : ''}`}>
            <ClothingMode
              ref={clothingModeRef}
              t={t}
              onSaveToAssets={handleSaveToAssets}
              onImageToVideo={handleImageToVideo}
              onPreview={handlePreview}
            />
          </div>
        </div>
      </div>

      {/* Add Material Modal */}
      <AddMaterialModal
        isOpen={showAddMaterialModal}
        onClose={() => setShowAddMaterialModal(false)}
        onSuccess={() => setShowAddMaterialModal(false)}
        initialData={addMaterialData}
        disableAssetTypeSelection={true}
        isImportMode={true}
      />

      {/* 图片预览弹窗 */}
      <ImagePreviewModal
        visible={previewVisible}
        images={previewImages.map(img => ({ key: img.key, url: img.url }))}
        initialIndex={previewIndex}
        onClose={() => setPreviewVisible(false)}
        actions={previewActions}
        downloadPrefix="style_transfer"
      />
    </div>
    </>
  );
};

export default StyleTransferPage;
