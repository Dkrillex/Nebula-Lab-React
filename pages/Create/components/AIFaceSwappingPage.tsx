import React, { useState } from 'react';
import { Wand2, Sparkles } from 'lucide-react';
import { faceSwapService, FaceSwapParams } from '../../../services/faceSwapService';
import MultiImageUploader from './MultiImageUploader';
import FaceSwapResultDisplay from './FaceSwapResultDisplay';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ImagePreviewModal from './ImagePreviewModal';

const AIFaceSwappingPage: React.FC = () => {
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
    '请将参考图像中的人物脸部替换到主图像人物的脸上，保留主图像的发型、姿势和光影，只替换面部特征与肤色，使合成后的画面自然、无明显拼接痕迹，同时保持参考图像人物的面部表情与细节'
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
      setError('请上传主图');
      return;
    }

    if (!secondaryImageUrl) {
      setError('请上传参考图');
      return;
    }

    if (!prompt.trim()) {
      setError('请输入提示词');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setLoadingMessage('正在生成换脸图片...');
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
        err instanceof Error ? err.message : '生成失败，请重试'
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
      setError('使用图片作为输入失败');
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
        <h1 className="mb-2 text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          AI 图片换脸
        </h1>
        <p className="text-muted-foreground">
          上传主图和参考图，让 AI 为您生成换脸图片
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* 输入区域 */}
        <div className="flex flex-col gap-6 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[rgba(255,255,255,0.6)] p-6 shadow-2xl shadow-black/20 backdrop-blur-lg">
          <div>
            <h2 className="mb-4 text-center text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI 图片换脸
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
                primaryTitle="上传主图"
                primaryDescription="上传需要换脸的主图片"
                secondaryTitle="上传参考图"
                secondaryDescription="上传提供脸部的参考图片"
              />
            </div>

            {/* 提示词输入 */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-[#111827]">
                提示词
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="请输入换脸提示词..."
                rows={4}
                className="w-full rounded-lg border border-[rgba(0,0,0,0.1)] bg-[#f3f4f6] p-3 placeholder-[#6b7280] transition-colors focus:border-primary focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* 生成按钮 */}
            <button
              onClick={handleGenerate}
              disabled={isGenerateDisabled}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-5 w-5 animate-spin" />
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5" />
                  <span>生成换脸图片</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 输出区域 */}
        <div className="flex flex-col rounded-xl border border-[rgba(0,0,0,0.1)] bg-[rgba(255,255,255,0.6)] p-6 shadow-2xl shadow-black/20 backdrop-blur-lg">
          <h2 className="mb-4 text-center text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            生成结果
          </h2>
          <div className="mb-4 h-px w-full bg-gray-200"></div>

          {isGenerating ? (
            <LoadingSpinner message={loadingMessage} />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : generatedImageUrl ? (
            <FaceSwapResultDisplay
              imageUrl={generatedImageUrl}
              originalImageUrl={primaryImageUrl}
              onUseAsInput={handleUseImageAsInput}
              onImageClick={handleOpenPreview}
            />
          ) : (
            <div className="flex flex-grow flex-col items-center justify-center text-center text-[#6b7280]">
              <div className="mb-4 h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-gray-400" />
              </div>
              <p className="mt-2">生成的图片将显示在这里</p>
            </div>
          )}
        </div>
      </div>

      {/* 图片预览模态框 */}
      <ImagePreviewModal
        imageUrl={previewImageUrl}
        onClose={handleClosePreview}
      />
    </div>
  );
};

export default AIFaceSwappingPage;

