import { request } from '../lib/request';
import { API_BASE_URL } from '../constants';

/**
 * TTS生成请求参数
 */
export interface TtsGenerateParams {
  text: string;
  voice?: string;
  language_type?: string;
  score?: number;
}

/**
 * TTS生成响应数据
 */
export interface TtsGenerateResponseData {
  audioUrl?: string;
  data?: string; // Base64音频数据
  id?: string; // 音频ID
  expiresAt?: string; // 过期时间
  requestId?: string; // 请求ID
  voice?: string;
  languageType?: string;
  format?: string;
  sampleRate?: number;
  duration?: number;
}

export const ttsService = {
  /**
   * TTS文本转语音 - 非流式生成
   * @param data TTS生成参数
   * @returns TTS生成响应
   */
  generate: (data: TtsGenerateParams) => {
    return request.post<TtsGenerateResponseData>('/aiTool/v1/tts', data, { timeout: 60000 });
  },

  /**
   * TTS文本转语音 - 流式生成（SSE）
   * 注意：这个方法返回一个 Promise，内部使用 fetch 处理流式响应
   * @param data TTS生成参数
   * @param onChunk 接收音频chunk的回调函数
   * @param onComplete 完成回调函数
   * @param onError 错误回调函数
   * @returns AbortController 用于取消请求
   */
  generateStream: (
    data: TtsGenerateParams,
    onChunk?: (chunk: Uint8Array) => void,
    onComplete?: (audioInfo: { audioUrl?: string; requestId?: string }) => void,
    onError?: (error: Error) => void
  ): AbortController => {
    const controller = new AbortController();
    const baseUrl = API_BASE_URL;
    const token = localStorage.getItem('token') || '';

    fetch(`${baseUrl}/aiTool/v1/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 检查响应类型：流式（text/event-stream）或普通 JSON（application/json）
        const contentType = response.headers.get('content-type') || '';
        const isStream = contentType.includes('text/event-stream') || contentType.includes('text/plain');

        if (isStream) {
          // 流式响应处理
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let audioChunks: Uint8Array[] = [];
          let audioInfo: any = {};

          if (!reader) {
            throw new Error('无法读取响应流');
          }

          const processStream = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();

                if (done) {
                  // 流读取完成
                  if (audioInfo.audioUrl) {
                    onComplete?.({ audioUrl: audioInfo.audioUrl, requestId: audioInfo.requestId });
                  } else if (audioChunks.length > 0) {
                    // 拼接所有chunks
                    const completeAudio = new Uint8Array(
                      audioChunks.reduce((acc, chunk) => acc + chunk.length, 0)
                    );
                    let offset = 0;
                    for (const chunk of audioChunks) {
                      completeAudio.set(chunk, offset);
                      offset += chunk.length;
                    }
                    onComplete?.({ requestId: audioInfo.requestId });
                  }
                  return;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    const dataStr = line.slice(6);

                    try {
                      const jsonData = JSON.parse(dataStr);

                      if (jsonData.event === 'audio-chunk' && jsonData.data?.data) {
                        // 解码Base64音频数据
                        const base64Data = jsonData.data.data;
                        if (base64Data && base64Data.trim().length > 0) {
                          const audioData = atob(base64Data);
                          const audioBytes = new Uint8Array(audioData.length);
                          for (let i = 0; i < audioData.length; i++) {
                            audioBytes[i] = audioData.charCodeAt(i);
                          }
                          audioChunks.push(audioBytes);
                          onChunk?.(audioBytes);
                        }
                      } else if (jsonData.event === 'complete') {
                        // 收到complete事件
                        audioInfo = jsonData.data || {};
                      } else if (jsonData.event === 'done' || dataStr === '[DONE]' || dataStr.trim() === '[DONE]') {
                        // 流结束
                        if (audioInfo.audioUrl) {
                          onComplete?.({ audioUrl: audioInfo.audioUrl, requestId: audioInfo.requestId });
                        } else if (audioChunks.length > 0) {
                          // 拼接所有chunks
                          const completeAudio = new Uint8Array(
                            audioChunks.reduce((acc, chunk) => acc + chunk.length, 0)
                          );
                          let offset = 0;
                          for (const chunk of audioChunks) {
                            completeAudio.set(chunk, offset);
                            offset += chunk.length;
                          }
                          onComplete?.({ requestId: audioInfo.requestId });
                        }
                        return;
                      } else if (jsonData.event === 'error') {
                        throw new Error(jsonData.data || '生成失败');
                      }
                    } catch (e) {
                      // 忽略JSON解析错误，继续处理下一行
                      console.warn('解析SSE数据失败:', e);
                    }
                  }
                }
              }
            } catch (error: any) {
              if (error.name !== 'AbortError') {
                onError?.(error);
              }
            }
          };

          processStream().catch((error) => {
            if (error.name !== 'AbortError') {
              onError?.(error);
            }
          });
        } else {
          // 普通 JSON 响应处理
          try {
            const jsonData = await response.json();
            
            // 处理 Ruoyi 标准响应格式 { code, msg, data }
            let result: any;
            if (jsonData.code === 200 && jsonData.data) {
              result = jsonData.data;
            } else if (jsonData.audioUrl || jsonData.requestId) {
              // 直接是数据对象
              result = jsonData;
            } else {
              throw new Error(jsonData.msg || '响应格式错误');
            }

            // 调用完成回调
            if (result.audioUrl) {
              onComplete?.({ 
                audioUrl: result.audioUrl, 
                requestId: result.requestId || result.id 
              });
            } else if (result.data && result.data.trim().length > 0) {
              // 如果有 Base64 数据，转换为 Blob
              const audioData = atob(result.data);
              const audioBytes = new Uint8Array(audioData.length);
              for (let i = 0; i < audioData.length; i++) {
                audioBytes[i] = audioData.charCodeAt(i);
              }
              onChunk?.(audioBytes);
              onComplete?.({ requestId: result.requestId || result.id });
            } else {
              throw new Error('未获取到音频数据');
            }
          } catch (error: any) {
            if (error.name !== 'AbortError') {
              onError?.(error);
            }
          }
        }
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          onError?.(error);
        }
      });

    return controller;
  },
};

