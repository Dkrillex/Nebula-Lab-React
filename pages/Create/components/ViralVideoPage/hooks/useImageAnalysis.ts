import { useState, useCallback } from 'react';
import { uploadService } from '../../../../../services/uploadService';
import { viralVideoService, ProductAnalysis } from '../../../../../services/viralVideoService';
import toast from 'react-hot-toast';
import { UploadedImage } from '../types';

interface UseImageAnalysisOptions {
  minImages: number;
  defaultModel: string;
  onAnalysisComplete?: (result: ProductAnalysis) => void;
}

export const useImageAnalysis = (options: UseImageAnalysisOptions) => {
  const { minImages, defaultModel, onAnalysisComplete } = options;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ProductAnalysis | null>(null);

  const analyzeAllImages = useCallback(async (uploadedImages: UploadedImage[]) => {
    if (isAnalyzing) return;
    if (uploadedImages.length < minImages) {
      toast.error(`请先上传至少 ${minImages} 张图片`);
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // 第一步：检查并上传所有有 file 对象但还未上传到OSS的图片（包括编辑后的图片）
      const imagesToUpload = uploadedImages.filter(img => img.file && !img.id);
      
      let finalImages = uploadedImages;
      
      if (imagesToUpload.length > 0) {
        toast.loading(`正在上传 ${imagesToUpload.length} 张图片到OSS...`, { id: 'uploading-images' });
        
        // 并发上传所有需要上传的图片
        const uploadPromises = imagesToUpload.map(async (img) => {
          if (!img.file) return img;
          
          try {
            const result = await uploadService.uploadFile(img.file);
            // 清理blob URL（如果是预览URL）
            if (img.url.startsWith('blob:')) {
              URL.revokeObjectURL(img.url);
            }
            return {
              url: result.url, // OSS URL
              id: result.ossId,
              // 不保留file对象，因为已经上传到OSS了
            };
          } catch (error: any) {
            console.error('图片上传失败:', error);
            throw new Error(`图片上传失败: ${error.message}`);
          }
        });

        const uploadedResults = await Promise.all(uploadPromises);
        
        // 更新已上传的图片：用OSS URL替换预览URL
        finalImages = uploadedImages.map(img => {
          // 找到对应的上传结果（通过file对象匹配）
          const uploaded = uploadedResults.find((u, index) => {
            const originalImg = imagesToUpload[index];
            return originalImg && originalImg.file === img.file;
          });
          if (uploaded) {
            return uploaded;
          }
          return img;
        });
        
        toast.dismiss('uploading-images');
        toast.success(`成功上传 ${uploadedResults.length} 张图片到OSS`);
      }

      // 第二步：提取所有图片的OSS URL（确保都是OSS链接）
      const imageUrls = finalImages.map(img => img.url).filter(Boolean);
      
      if (imageUrls.length < minImages) {
        throw new Error(`至少需要 ${minImages} 张有效图片`);
      }
      
      // 第三步：一次性传入所有图片给AI进行综合分析
      toast.loading('正在调用AI分析图片...', { id: 'analyzing-images' });
      const result = await viralVideoService.analyzeProductImages(imageUrls, defaultModel);
      
      toast.dismiss('analyzing-images');
      setAnalysisResult(result);
      toast.success(`成功分析 ${imageUrls.length} 张图片`);
      
      // 调用回调函数
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
      
      return { result, finalImages };
    } catch (error: any) {
      console.error('图片分析失败:', error);
      toast.error(error.message || '图片分析失败，请重试');
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, minImages, defaultModel, onAnalysisComplete]);

  return {
    isAnalyzing,
    analysisResult,
    setAnalysisResult,
    analyzeAllImages,
  };
};

