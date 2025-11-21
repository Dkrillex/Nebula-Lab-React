import React, { useState, useRef } from 'react';
import { 
  Loader2, 
  Download, 
  FolderPlus, 
  Wand2,
  Volume2,
  Check,
  Sparkles
} from 'lucide-react';
import { ttsService, TtsGenerateParams } from '../../../services/ttsService';
import { uploadService } from '../../../services/uploadService';
import { assetsService, AdsAssetsForm } from '../../../services/assetsService';
import { useAuthStore } from '../../../stores/authStore';
import AddMaterialModal from '../../../components/AddMaterialModal';

// 音色选项
const voiceOptions = [
  { label: 'Cherry - 甜美女性', value: 'Cherry' },
  { label: 'Ethan - 成熟男性', value: 'Ethan' },
  { label: 'Nofish - 中性声音', value: 'Nofish' },
  { label: 'Jennifer - 专业女性', value: 'Jennifer' },
  { label: 'Ryan - 年轻男性', value: 'Ryan' },
  { label: 'Katerina - 优雅女性', value: 'Katerina' },
  { label: 'Elias - 温暖男性', value: 'Elias' },
  { label: 'Jada - 活泼女性', value: 'Jada' },
  { label: 'Dylan - 沉稳男性', value: 'Dylan' },
  { label: 'Sunny - 阳光女性', value: 'Sunny' },
  { label: 'Li - 中文男声', value: 'Li' },
  { label: 'Marcus - 磁性男声', value: 'Marcus' },
  { label: 'Roy - 浑厚男声', value: 'Roy' },
  { label: 'Peter - 清晰男声', value: 'Peter' },
  { label: 'Rocky - 粗犷男声', value: 'Rocky' },
  { label: 'Kiki - 可爱女声', value: 'Kiki' },
  { label: 'Eric - 标准男声', value: 'Eric' },
];

// 语言选项
const languageOptions = [
  { label: '自动检测', value: 'Auto' },
  { label: '中文', value: 'Chinese' },
  { label: '英文', value: 'English' },
  { label: '德语', value: 'German' },
  { label: '意大利语', value: 'Italian' },
  { label: '葡萄牙语', value: 'Portuguese' },
  { label: '西班牙语', value: 'Spanish' },
  { label: '日语', value: 'Japanese' },
  { label: '韩语', value: 'Korean' },
  { label: '法语', value: 'French' },
  { label: '俄语', value: 'Russian' },
];

interface GeneratedAudio {
  url: string;
  addState: boolean;
  requestId?: string;
  blob?: Blob;
}

const TtsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('Cherry');
  const [languageType, setLanguageType] = useState('Auto');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<GeneratedAudio | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pendingMaterialData, setPendingMaterialData] = useState<Partial<AdsAssetsForm> | undefined>(undefined);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const audioChunksRef = useRef<Uint8Array[]>([]);

  // 生成按钮是否禁用
  const buttonDisabled = !text.trim() || isGenerating;

  // 生成音频
  const generateAudio = async () => {
    if (!isAuthenticated) {
      alert('请先登录');
      return;
    }

    if (!text.trim()) {
      alert('请输入文本内容');
      return;
    }

    setIsGenerating(true);
    setGeneratedAudio(null);
    audioChunksRef.current = [];

    try {
      const params: TtsGenerateParams = {
        text: text.trim(),
        voice: voice,
        language_type: languageType,
        score: 1
      };

      // 使用流式生成
      abortControllerRef.current = ttsService.generateStream(
        params,
        // onChunk
        (chunk: Uint8Array) => {
          audioChunksRef.current.push(chunk);
        },
        // onComplete
        (audioInfo: { audioUrl?: string; requestId?: string }) => {
          if (audioInfo.audioUrl) {
            // 使用服务器返回的 URL
            setGeneratedAudio({
              url: audioInfo.audioUrl,
              addState: false,
              requestId: audioInfo.requestId,
            });
          } else if (audioChunksRef.current.length > 0) {
            // 拼接所有 chunks
            const completeAudio = new Uint8Array(
              audioChunksRef.current.reduce((acc, chunk) => acc + chunk.length, 0)
            );
            let offset = 0;
            for (const chunk of audioChunksRef.current) {
              completeAudio.set(chunk, offset);
              offset += chunk.length;
            }

            const blob = new Blob([completeAudio], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            setGeneratedAudio({
              url,
              addState: false,
              requestId: audioInfo.requestId,
              blob,
            });
          }
          setIsGenerating(false);
        },
        // onError
        (error: Error) => {
          console.error('生成音频失败:', error);
          alert(error.message || '生成失败');
          setIsGenerating(false);
        }
      );
    } catch (error: any) {
      console.error('生成音频失败:', error);
      alert(error.message || '生成失败');
      setIsGenerating(false);
    }
  };

  // 下载音频
  const downloadAudio = () => {
    if (!generatedAudio?.url) return;

    const link = document.createElement('a');
    link.href = generatedAudio.url;
    link.download = `tts_audio_${Date.now()}.wav`;
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // 导入素材库
  const importToMaterials = async () => {
    if (!generatedAudio || !generatedAudio.url) {
      alert('没有可导入的音频');
      return;
    }

    if (generatedAudio.addState) {
      alert('已导入素材库');
      return;
    }

    try {
      let finalAudioUrl = generatedAudio.url;

      // 如果是 Blob，先上传到 OSS
      if (generatedAudio.blob) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(generatedAudio.blob!);
        });

        const base64Data = await base64Promise;
        const uploadResult = await uploadService.uploadByBase64(
          base64Data,
          `tts_audio_${Date.now()}.wav`,
          'wav'
        );
        
        if (uploadResult.code === 200 && uploadResult.data) {
          finalAudioUrl = uploadResult.data.url;
        } else {
          throw new Error('上传失败');
        }
      }

      // 准备素材数据
      const materialData: Partial<AdsAssetsForm> = {
        assetName: `文本转语音_${Date.now()}`,
        assetTag: 'TTS,语音合成,AI创作',
        assetDesc: `文本转语音生成 - ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`,
        assetId: generatedAudio.requestId || `tts_${Date.now()}`,
        assetUrl: finalAudioUrl,
        assetType: 8, // 音频类型
      };

      setPendingMaterialData(materialData);
      setIsAddModalOpen(true);
    } catch (error: any) {
      console.error('导入素材失败:', error);
      alert(error.message || '导入失败');
    }
  };

  // 导入成功回调
  const handleImportSuccess = () => {
    if (generatedAudio) {
      setGeneratedAudio({
        ...generatedAudio,
        addState: true,
      });
    }
    setIsAddModalOpen(false);
  };

  return (
    <div className="tts-page">
      <div className="main-content">
        {/* 左侧控制面板 */}
        <div className="control-panel">
          <div className="page-header">
            <h1 className="page-title">文本转语音</h1>
            <p className="page-description">
              将文本转换为自然流畅的语音，支持多种音色和语言
            </p>
          </div>

          {/* 文本输入 */}
          <div className="control-section">
            <h3 className="section-title">输入文本</h3>
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="在此输入需要AI配音的文本，例如：欢迎来到我们的产品展示，让我为您详细介绍我们最新的功能特点..."
                className="text-input"
                rows={6}
                maxLength={300}
              />
              <span className="absolute bottom-3 right-3 text-xs text-gray-500">
                {text.length}/300
              </span>
            </div>
          </div>

          {/* 音色选择 */}
          <div className="control-section">
            <h3 className="section-title">音色</h3>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="voice-select"
            >
              {voiceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 语言选择 */}
          <div className="control-section">
            <h3 className="section-title">语言</h3>
            <select
              value={languageType}
              onChange={(e) => setLanguageType(e.target.value)}
              className="language-select"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 生成按钮 */}
          <div className="control-section">
            <button
              onClick={generateAudio}
              disabled={buttonDisabled}
              className="generate-button"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span className="mr-2" style={{ fontSize: '16px', fontWeight: 600 }}>1</span>
                  <span>生成语音</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 右侧结果展示 */}
        <div className="result-panel">
          <div className="result-header">
            <h2 className="result-title">生成结果</h2>
          </div>

          {!generatedAudio && !isGenerating && (
            <div className="empty-result">
              <p>配置参数并开始生成，结果将显示在这里</p>
            </div>
          )}

          {isGenerating && (
            <div className="generating-state">
              <Loader2 size={32} className="animate-spin text-indigo-600" />
              <p>正在生成语音...</p>
            </div>
          )}

          {generatedAudio && !isGenerating && (
            <div className="audio-result">
              <div className="audio-player-container">
                <audio src={generatedAudio.url} controls className="audio-player" />
              </div>

              <div className="audio-actions">
                <button onClick={downloadAudio} className="action-button">
                  <Download size={16} className="mr-2" />
                  下载音频
                </button>
                <button
                  onClick={importToMaterials}
                  disabled={generatedAudio.addState}
                  className="action-button action-button-primary"
                >
                  {generatedAudio.addState ? (
                    <>
                      <Check size={16} className="mr-2" />
                      已导入素材库
                    </>
                  ) : (
                    <>
                      <FolderPlus size={16} className="mr-2" />
                      导入素材库
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Material Modal */}
      <AddMaterialModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setPendingMaterialData(undefined);
        }}
        onSuccess={handleImportSuccess}
        initialData={pendingMaterialData}
      />
    </div>
  );
};

export default TtsPage;

// 样式定义
const styles = `
.tts-page {
  width: 100%;
  min-height: 100vh;
  padding: 1.5rem;
  background: #f5f5f5;
}

.page-header {
  margin-bottom: 1rem;
  text-align: center;
}

.page-title {
  margin-bottom: 0.5rem;
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-description {
  max-width: 600px;
  margin: 0 auto;
  font-size: 1rem;
  color: #64748b;
}

.main-content {
  display: flex;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.control-panel {
  width: 350px;
  height: fit-content;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.control-section {
  margin-bottom: 2rem;
}

.control-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
}

.text-input {
  width: 100%;
  padding: 1rem;
  font-size: 0.875rem;
  line-height: 1.6;
  resize: vertical;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.3s ease;
  outline: none;
}

.text-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.voice-select,
.language-select {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.3s ease;
  outline: none;
  cursor: pointer;
}

.voice-select:hover,
.language-select:hover {
  border-color: #667eea;
}

.voice-select:focus,
.language-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.generate-button {
  width: 100%;
  height: 3rem;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  border: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
}

.generate-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s;
}

.generate-button:hover:not(:disabled)::before {
  left: 100%;
}

.generate-button:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
  transform: translateY(-3px);
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}

.generate-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #9ca3af;
  box-shadow: none;
  transform: none;
}

.result-panel {
  flex: 1;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  min-height: 600px;
}

.result-header {
  margin-bottom: 1.5rem;
}

.result-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.empty-result {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 1rem;
}

.generating-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #64748b;
}

.audio-result {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.audio-player-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.audio-player {
  width: 100%;
  max-width: 600px;
}

.audio-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.action-button {
  min-width: 120px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  border-radius: 10px;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.9);
  color: #4a5568;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.action-button:hover {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-color: #9ca3af;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.action-button-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  color: white;
}

.action-button-primary:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
  transform: translateY(-2px);
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}

.action-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #9ca3af;
  border-color: #d1d5db;
  box-shadow: none;
  transform: none;
}

@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
  }

  .control-panel {
    width: 100%;
  }

  .result-panel {
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .tts-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .main-content {
    gap: 1rem;
  }

  .control-panel,
  .result-panel {
    padding: 1rem;
  }

  .audio-actions {
    flex-direction: column;
  }

  .audio-actions .action-button {
    width: 100%;
  }
}
`;

// 注入样式
if (typeof document !== 'undefined') {
  const styleId = 'tts-page-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
