import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Loader, Image as ImageIcon } from 'lucide-react';
import { avatarService, ProductAvatar, ProductAvatarCategory } from '../../../services/avatarService';
import UploadComponent from '../../../components/UploadComponent';

interface DigitalHumanProductProps {
  t: any;
  handleFileUpload: (file: File, type: 'image') => Promise<any>; // Kept for compatibility if needed, but we use UploadComponent mainly now
  uploading: boolean;
  setErrorMessage: (msg: string | null) => void;
}

const DigitalHumanProduct: React.FC<DigitalHumanProductProps> = ({
  t,
  handleFileUpload,
  uploading,
  setErrorMessage
}) => {
  const [categories, setCategories] = useState<ProductAvatarCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(-1);
  const [avatars, setAvatars] = useState<ProductAvatar[]>([]);
  const [loadingAvatars, setLoadingAvatars] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<ProductAvatar | null>(null);
  
  // Uploads
  const [productImage, setProductImage] = useState<{ fileId: string, url: string } | null>(null);
  const [userFaceImage, setUserFaceImage] = useState<{ fileId: string, url: string } | null>(null);
  const [customAvatarImage, setCustomAvatarImage] = useState<{ fileId: string, url: string } | null>(null);
  
  // Inputs
  const [prompt, setPrompt] = useState('将图像1场景中的项目替换为图像2中的项目。保持图像1中人物的构图和位置不变，并调整手势以适应新项目的大小和外观。该项目必须与图2中的项目完全相同。');
  const [productSize, setProductSize] = useState(2); // 1-6
  const [autoShow, setAutoShow] = useState(true);
  
  // Result
  const [generating, setGenerating] = useState(false);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);

  // Refs for manual trigger if needed, though UploadComponent handles it
  const productUploadRef = useRef<any>(null);
  const faceUploadRef = useRef<any>(null);
  const avatarUploadRef = useRef<any>(null);

  useEffect(() => {
    fetchCategories();
    fetchAvatars();
  }, []);

  useEffect(() => {
    fetchAvatars();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await avatarService.getProductAvatarCategories();
      if (res.code === 200) {
        let categoriesData: ProductAvatarCategory[] = [];
        if ((res as any).data?.result) {
            categoriesData = (res as any).data.result;
        } else if (res.result) {
            categoriesData = res.result;
        } else if (res.data && Array.isArray(res.data)) {
            categoriesData = res.data;
        }
        setCategories([{ categoryId: -1, categoryName: '全部' }, ...(categoriesData || [])]);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchAvatars = async () => {
    try {
      setLoadingAvatars(true);
      const res = await avatarService.getProductAvatarList({
        pageNo: 1,
        pageSize: 100,
        categoryIds: selectedCategory === -1 ? '' : String(selectedCategory)
      });
      if (res.code === 200) {
        let avatarData: ProductAvatar[] = [];
        if ((res as any).data?.result?.data) {
            // For structure: { code: 200, data: { result: { data: [...] } } }
            avatarData = (res as any).data.result.data;
        } else if ((res as any).result?.data) {
            // For structure: { code: 200, result: { data: [...] } }
            avatarData = (res as any).result.data;
        } else if (res.data && Array.isArray(res.data)) {
            avatarData = res.data;
        }

        setAvatars(avatarData || []);
        if (!selectedAvatar && avatarData?.length > 0) {
            setSelectedAvatar(avatarData[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch avatars:', error);
    } finally {
      setLoadingAvatars(false);
    }
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'face' | 'avatar') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const uploaded = await handleFileUpload(file, 'image');
        if (type === 'product') setProductImage(uploaded);
        else if (type === 'face') setUserFaceImage(uploaded);
        else if (type === 'avatar') {
            setCustomAvatarImage(uploaded);
            setSelectedAvatar(null); // Deselect list avatar if custom uploaded
        }
      } catch (error) {
        // Handled by parent
      }
    }
  };

  const handleGenerate = async () => {
    if (!productImage) {
        setErrorMessage('请上传产品图片');
        return;
    }
    if (!selectedAvatar && !customAvatarImage) {
        setErrorMessage('请选择或上传数字人模板');
        return;
    }

    try {
        setGenerating(true);
        setErrorMessage(null);
        setResultImageUrl(null);

        const params = {
            avatarId: selectedAvatar?.avatarId || '',
            templateImageFileId: customAvatarImage?.fileId || '',
            productImageFileId: productImage.fileId,
            userFaceImageFileId: userFaceImage?.fileId || '',
            imageEditPrompt: prompt,
            productSize: String(productSize)
        };

        const res = await avatarService.submitImageReplaceTask(params);
        if (res.code === 200 && res.result?.taskId) {
             pollTask(res.result.taskId);
        } else {
            throw new Error(res.msg || '任务提交失败');
        }
    } catch (error: any) {
        setErrorMessage(error.message || '生成失败');
        setGenerating(false);
    }
  };

  const pollTask = async (taskId: string) => {
      const interval = 3000;
      let attempts = 0;
      const maxAttempts = 60; // 3 mins

      const check = async () => {
          try {
              const res = await avatarService.queryImageReplaceTask(taskId);
              const status = res.result?.status;
              if (status === 'success') {
                  setResultImageUrl(res.result.resultImageUrl || '');
                  setGenerating(false);
              } else if (status === 'fail') {
                  setErrorMessage(res.result.errorMsg || '生成失败');
                  setGenerating(false);
              } else {
                  attempts++;
                  if (attempts < maxAttempts) setTimeout(check, interval);
                  else {
                      setErrorMessage('任务超时');
                      setGenerating(false);
                  }
              }
          } catch (e) {
              setErrorMessage('查询状态失败');
              setGenerating(false);
          }
      };
      check();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left: Avatar Selection */}
      <div className="w-full lg:w-1/3 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col">
        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4">选择数字人模板</h3>
        
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(cat => (
                <button 
                    key={cat.categoryId}
                    onClick={() => setSelectedCategory(cat.categoryId)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${selectedCategory === cat.categoryId ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                    {cat.categoryName}
                </button>
            ))}
        </div>

        {/* Avatar Grid */}
        <div className="grid grid-cols-3 gap-3 overflow-y-auto custom-scrollbar flex-1 min-h-[300px] content-start">
            {/* Upload Custom Item */}
            <UploadComponent
                uploadType="tv"
                immediate={true}
                onUploadComplete={(file) => {
                    setCustomAvatarImage({ fileId: file.fileId, url: file.fileUrl || '' });
                    setSelectedAvatar(null);
                }}
                className={`aspect-[9/16] ${customAvatarImage ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-600'}`}
            >
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">上传自定义</span>
            </UploadComponent>

            {loadingAvatars ? (
                <div className="col-span-3 flex justify-center py-10"><Loader className="animate-spin text-indigo-600" /></div>
            ) : avatars.map(avatar => (
                <div 
                    key={avatar.avatarId}
                    onClick={() => { setSelectedAvatar(avatar); setCustomAvatarImage(null); }}
                    className={`relative aspect-[9/16] rounded-lg overflow-hidden cursor-pointer border-2 transition ${selectedAvatar?.avatarId === avatar.avatarId ? 'border-indigo-500 shadow-md' : 'border-transparent hover:shadow-sm'}`}
                >
                    <img src={avatar.avatarImagePath} className="w-full h-full object-cover" />
                    {selectedAvatar?.avatarId === avatar.avatarId && (
                        <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                            <div className="bg-indigo-600 text-white text-xs px-2 py-1 rounded">已选</div>
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>

      {/* Middle: Configuration */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col overflow-y-auto">
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
              {/* Preview */}
              <div className="flex-1">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4">数字人预览</h3>
                  <div className="relative aspect-[9/16] max-w-[240px] mx-auto bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                      {(selectedAvatar || customAvatarImage) ? (
                          <img src={selectedAvatar?.avatarImagePath || customAvatarImage?.url} className="w-full h-full object-cover" />
                      ) : (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400">
                              <ImageIcon size={48} className="mb-2" />
                              <span>请选择模板</span>
                          </div>
                      )}
                      
                      {/* Face Upload Overlay */}
                      {(selectedAvatar || customAvatarImage) && (
                          <div className="absolute bottom-4 right-4">
                              <div className="relative group">
                                  {userFaceImage ? (
                                      <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-lg relative">
                                          <img src={userFaceImage.url} className="w-full h-full object-cover" />
                                          <button onClick={() => setUserFaceImage(null)} className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 flex items-center justify-center rounded-bl text-[10px] z-20">×</button>
                                      </div>
                                  ) : (
                                      <UploadComponent
                                          uploadType="tv"
                                          immediate={true}
                                          showPreview={false}
                                          onUploadComplete={(file) => setUserFaceImage({ fileId: file.fileId, url: file.fileUrl || '' })}
                                          className="w-12 h-12 bg-black/60 hover:bg-black/80 text-white rounded-lg flex flex-col items-center justify-center backdrop-blur-sm border border-white/30 transition !border-solid"
                                      >
                                          <Upload size={16} />
                                          <span className="text-[10px] mt-1">换脸</span>
                                      </UploadComponent>
                                  )}
                              </div>
                          </div>
                      )}
                  </div>
              </div>

              {/* Product Config */}
              <div className="flex-1 flex flex-col gap-4">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200">产品配置</h3>
                  
                  {/* Product Upload */}
                  <UploadComponent
                      uploadType="tv"
                      immediate={true}
                      onUploadComplete={(file) => setProductImage({ fileId: file.fileId, url: file.fileUrl || '' })}
                      className="h-40"
                  >
                        <div className="text-center text-gray-500">
                            <Upload size={32} className="mx-auto mb-2" />
                            <p className="text-sm">上传产品图片</p>
                        </div>
                  </UploadComponent>

                  {/* Product Size */}
                  {productImage && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">产品尺寸</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={autoShow} onChange={(e) => { setAutoShow(e.target.checked); if(e.target.checked) setProductSize(2); }} className="sr-only peer" />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">自动</span>
                            </label>
                        </div>
                        <input 
                            type="range" 
                            min="1" 
                            max="6" 
                            value={productSize} 
                            onChange={(e) => { setProductSize(Number(e.target.value)); setAutoShow(false); }} 
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>微小</span>
                            <span>超大</span>
                        </div>
                    </div>
                  )}
              </div>
          </div>

          {/* Prompt */}
          <div className="mb-6">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">AI混合提示</h3>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-24 p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                placeholder="描述如何融合产品..."
              />
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-auto">
              <button onClick={handleGenerate} disabled={generating || !productImage} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {generating ? <Loader className="animate-spin" size={18} /> : '开始生成'}
              </button>
          </div>
      </div>

      {/* Right: Result (conditionally shown or modal?) */}
      {/* For now, let's put result in a modal or overlay if it exists, or just below */}
      {resultImageUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setResultImageUrl(null)}>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl max-w-4xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold">生成结果</h3>
                      <button onClick={() => setResultImageUrl(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={24} /></button>
                  </div>
                  <img src={resultImageUrl} className="max-w-full max-h-[70vh] rounded-lg mx-auto" />
                  <div className="mt-4 flex justify-center">
                      <a href={resultImageUrl} download target="_blank" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">下载图片</a>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default DigitalHumanProduct;

