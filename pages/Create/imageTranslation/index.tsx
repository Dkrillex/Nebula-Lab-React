import React, { useState } from 'react';
import { Wand2, Sparkles, Gem, Check } from 'lucide-react';
import { faceSwapService, FaceSwapParams } from '@/services/faceSwapService';
import MultiImageUploader from '../components/MultiImageUploader';
import FaceSwapResultDisplay from './FaceSwapResultDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ImagePreviewModal from '../components/ImagePreviewModal';
import { useAppOutletContext } from '@/router/context';
import { translations } from '@/translations';

interface AIFaceSwappingPageProps {
  t?: any;
}

const AIFaceSwappingPage: React.FC<AIFaceSwappingPageProps> = ({ t: propT }) => {
  const { t: rootT } = useAppOutletContext();
  const t = propT || (rootT?.createPage as any)?.imageTranslation || (translations['zh'].createPage as any).imageTranslation;
  // 图片状态
  const [primaryImageUrl, setPrimaryImageUrl] = useState<string | null>(null);
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [secondaryImageUrl, setSecondaryImageUrl] = useState<string | null>(null);
  const [secondaryFile, setSecondaryFile] = useState<File | null>(null);

  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // 预览状态
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // 提示词
  const [prompt, setPrompt] = useState(
    'Please replace the face of the character in the reference image onto the face of the character in the main image, retaining the main image\'s hairstyle, posture, and lighting, only replacing facial features and skin tone, to make the synthesized image natural with no obvious stitching marks, while maintaining the facial expression and details of the character in the reference image'
  );

  // 处理主图选择
  const handlePrimaryImageSelect = (file: File, dataUrl: string) => {
    setPrimaryFile(file);
    setPrimaryImageUrl(dataUrl);
    setGeneratedImageUrl(null);
    setError(null);
  };

  // 处理参考图选择
  const handleSecondaryImageSelect = (file: File, dataUrl: string) => {
    setSecondaryFile(file);
    setSecondaryImageUrl(dataUrl);
    setGeneratedImageUrl(null);
    setError(null);
  };

  // 清除主图
  const handleClearPrimaryImage = () => {
    setPrimaryImageUrl(null);
    setPrimaryFile(null);
    setGeneratedImageUrl(null);
    setError(null);
  };

  // 清除参考图
  const handleClearSecondaryImage = () => {
    setSecondaryImageUrl(null);
    setSecondaryFile(null);
  };

  // 获取图片的 MIME 类型
  const getMimeType = (dataUrl: string): string => {
    const match = dataUrl.match(/data:([^;]+);/);
    return match ? match[1] : 'image/png';
  };

  // 生成换脸图片
  const handleGenerate = async () => {
    if (!primaryImageUrl) {
      setError(t.errors.uploadPrimaryImage);
      return;
    }

    if (!secondaryImageUrl) {
      setError(t.errors.uploadReferenceImage);
      return;
    }

    if (!prompt.trim()) {
      setError(t.errors.enterPrompt);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setLoadingMessage(t.generatingMessage);
    setGeneratedImageUrl(null);

    try {
      const primaryMimeType = getMimeType(primaryImageUrl);
      const secondaryMimeType = getMimeType(secondaryImageUrl);

      const params: FaceSwapParams = {
        primaryImage: primaryImageUrl,
        primaryMimeType,
        secondaryImage: secondaryImageUrl,
        secondaryMimeType,
        prompt: prompt.trim(),
      };

      const result = await faceSwapService.swapFace(params);
      setGeneratedImageUrl(result.imageUrl);
      setLoadingMessage('');
    } catch (err) {
      console.error('Face swap error:', err);
      setError(
        err instanceof Error ? err.message : t.errors.generateFailed
      );
      setLoadingMessage('');
    } finally {
      setIsGenerating(false);
    }
  };

  // 使用生成的图片作为输入
  const handleUseImageAsInput = async (imageUrl: string) => {
    if (!imageUrl) return;

    try {
      // 将图片 URL 转换为 base64
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPrimaryImageUrl(dataUrl);
        setGeneratedImageUrl(null);
        setError(null);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Failed to use image as input:', err);
      setError(t.errors.useImageFailed);
    }
  };

  // 打开预览
  const handleOpenPreview = (url: string) => {
    setPreviewImageUrl(url);
  };

  // 关闭预览
  const handleClosePreview = () => {
    setPreviewImageUrl(null);
  };

  // 检查是否可以生成
  const isGenerateDisabled =
    isGenerating ||
    !primaryImageUrl ||
    !secondaryImageUrl ||
    !prompt.trim();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-3xl font-bold" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          {t.title}
        </h1>
        <p className="text-muted-foreground">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* 输入区域 */}
        <div className="flex flex-col gap-6 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[rgba(255,255,255,0.6)] p-6 shadow-2xl shadow-black/20 backdrop-blur-lg">
          <div>
            <h2 className="mb-4 text-center text-2xl font-bold" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {t.title}
            </h2>

            {/* 图片上传 */}
            <div className="mb-4">
              <MultiImageUploader
                onPrimarySelect={handlePrimaryImageSelect}
                onSecondarySelect={handleSecondaryImageSelect}
                primaryImageUrl={primaryImageUrl}
                secondaryImageUrl={secondaryImageUrl}
                onClearPrimary={handleClearPrimaryImage}
                onClearSecondary={handleClearSecondaryImage}
                primaryTitle={t.primaryLabel}
                primaryDescription={t.primaryDescription}
                secondaryTitle={t.referenceLabel}
                secondaryDescription={t.referenceDescription}
              />
            </div>

            {/* 提示词输入 */}
            {/* <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-[#111827]">
                {t.promptLabel}
              </label>
              <textarea
                disabled  
                value={prompt}
                placeholder={t.promptPlaceholder}
                rows={4}
                className="w-full rounded-lg border border-[rgba(0,0,0,0.1)] bg-[#f3f4f6] p-3 placeholder-[#6b7280] transition-colors focus:border-primary focus:ring-2 focus:ring-primary"
              />
            </div> */}

            {/* 生成按钮 */}
            <button
              onClick={handleGenerate}
              disabled={isGenerateDisabled}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#7d6fdd] to-[#15b7fa] px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-[#e5e7eb] disabled:from-[#e5e7eb] disabled:to-[#e5e7eb] disabled:text-[#9ca3af] disabled:shadow-none"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-5 w-5 animate-spin" />
                  <span>{t.generating}</span>
                </>
              ) : (
                <>
                  <div className="relative">
                    <Gem className="h-5 w-5" />
                    <Check className="absolute -top-1 -right-1 h-3 w-3" />
                  </div>
                  {/* <span className="text-sm font-semibold">0.3</span> */}
                  <span>{t.generateButton}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 输出区域 */}
        <div className="flex flex-col rounded-xl border border-[rgba(0,0,0,0.1)] bg-[rgba(255,255,255,0.6)] p-6 shadow-2xl shadow-black/20 backdrop-blur-lg">
          <h2 className="mb-4 text-center text-xl font-bold" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {t.resultTitle}
          </h2>
          <div className="mb-4 h-px w-full bg-gray-200"></div>

          {error ? (
            <ErrorMessage message={error} />
          ) : generatedImageUrl ? (
            <FaceSwapResultDisplay
              imageUrl={generatedImageUrl}
              originalImageUrl={primaryImageUrl}
              onUseAsInput={handleUseImageAsInput}
              onImageClick={handleOpenPreview}
              t={t}
            />
          ) : (
            <div className="flex flex-grow flex-col items-center justify-center text-center text-[#6b7280]">
              {isGenerating ? (
                <LoadingSpinner message={loadingMessage} />
              ) : (
                <>
                  <div className="mb-4 h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
                    <Sparkles className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="mt-2">{t.emptyState}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 图片预览模态框 */}
      <ImagePreviewModal
        isOpen={!!previewImageUrl}
        imageUrl={previewImageUrl}
        onClose={handleClosePreview}
      />
    </div>
  );
};

export default AIFaceSwappingPage;

