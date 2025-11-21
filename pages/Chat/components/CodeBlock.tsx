import React, { useEffect, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // 暗色主题
import 'prismjs/themes/prism.css'; // 亮色主题
// 导入常用语言支持
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-markup';
import { Copy, Eye, MessageSquare, Maximize2, Sun, Moon, X } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  onQuote?: (code: string) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'text', onQuote }) => {
  const [isDark, setIsDark] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showExpand, setShowExpand] = useState(false);
  const [previewMode, setPreviewMode] = useState<'render' | 'code'>('render');
  const [highlightedCode, setHighlightedCode] = useState('');

  // 支持预览的语言
  const isPreviewable = ['html', 'xml', 'markup'].includes(language.toLowerCase());

  useEffect(() => {
    // 高亮代码
    try {
      const lang = language.toLowerCase();
      const prismLang = Prism.languages[lang] || Prism.languages.javascript;
      const highlighted = Prism.highlight(code, prismLang, lang);
      setHighlightedCode(highlighted);
    } catch (error) {
      console.error('代码高亮失败:', error);
      setHighlightedCode(code);
    }
  }, [code, language]);

  // 复制代码
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      // 可以添加提示
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 引用代码
  const handleQuote = () => {
    onQuote?.(code);
  };

  // 获取预览HTML
  const getPreviewHtml = () => {
    let html = code;
    
    // 如果不是完整的HTML文档,包装成完整文档
    if (!html.includes('<!DOCTYPE') && !html.includes('<html')) {
      html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>预览</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
  </style>
</head>
<body>
${html}
</body>
</html>`;
    }
    
    return html;
  };

  return (
    <>
      {/* 代码块容器 */}
      <div className={`code-block-wrapper ${isDark ? 'code-block-dark' : 'code-block-light'}`}>
        {/* 工具栏 */}
        <div className="code-block-toolbar">
          <button
            onClick={handleCopy}
            className="toolbar-btn"
            title="复制"
          >
            <Copy size={14} />
          </button>
          
          {isPreviewable && (
            <button
              onClick={() => setShowPreview(true)}
              className="toolbar-btn"
              title="预览"
            >
              <Eye size={14} />
            </button>
          )}
          
          {onQuote && (
            <button
              onClick={handleQuote}
              className="toolbar-btn"
              title="引用"
            >
              <MessageSquare size={14} />
            </button>
          )}
          
          <button
            onClick={() => setShowExpand(true)}
            className="toolbar-btn"
            title="放大"
          >
            <Maximize2 size={14} />
          </button>
          
          <button
            onClick={() => setIsDark(!isDark)}
            className="toolbar-btn"
            title="开关灯"
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>

        {/* 代码内容 */}
        <div className="code-block-container">
          <pre>
            <code
              className={`language-${language}`}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </pre>
        </div>
      </div>

      {/* 预览Modal */}
      {showPreview && (
        <div className="code-modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="code-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="code-modal-header">
              <h3>HTML 预览</h3>
              <button onClick={() => setShowPreview(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>
            
            {/* 切换按钮 */}
            <div className="preview-toggle-bar">
              <button
                className={`toggle-btn ${previewMode === 'render' ? 'active' : ''}`}
                onClick={() => setPreviewMode('render')}
              >
                🖼️ 效果预览
              </button>
              <button
                className={`toggle-btn ${previewMode === 'code' ? 'active' : ''}`}
                onClick={() => setPreviewMode('code')}
              >
                📝 查看代码
              </button>
            </div>

            {/* 预览内容 */}
            <div className="preview-container">
              {previewMode === 'render' ? (
                <iframe
                  srcDoc={getPreviewHtml()}
                  className="preview-iframe"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  title="HTML预览"
                />
              ) : (
                <div className="preview-code">
                  <pre>
                    <code
                      className={`language-${language}`}
                      dangerouslySetInnerHTML={{ __html: highlightedCode }}
                    />
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 放大Modal */}
      {showExpand && (
        <div className="code-modal-overlay" onClick={() => setShowExpand(false)}>
          <div className="code-modal-content code-modal-fullscreen" onClick={(e) => e.stopPropagation()}>
            <div className="code-modal-header">
              <h3>代码查看</h3>
              <button onClick={() => setShowExpand(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>
            
            <div className="expand-code-container">
              <pre>
                <code
                  className={`language-${language}`}
                  dangerouslySetInnerHTML={{ __html: highlightedCode }}
                />
              </pre>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .code-block-wrapper {
          position: relative;
          margin: 1rem 0;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        .code-block-light {
          background: #f7fafc;
        }

        .code-block-dark {
          background: #1e1e1e;
        }

        .code-block-toolbar {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          gap: 4px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 6px;
          padding: 4px;
          z-index: 10;
        }

        .code-block-dark .code-block-toolbar {
          background: rgba(30, 30, 30, 0.9);
        }

        .toolbar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: #4a5568;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .toolbar-btn:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          transform: scale(1.1);
        }

        .code-block-dark .toolbar-btn {
          color: #d4d4d4;
        }

        .code-block-dark .toolbar-btn:hover {
          background: rgba(102, 126, 234, 0.2);
          color: #667eea;
        }

        .code-block-container {
          padding: 1rem;
          overflow-x: auto;
        }

        .code-block-container pre {
          margin: 0;
        }

        .code-block-container code {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
          line-height: 1.5;
        }

        .code-block-light code {
          color: #2d3748;
        }

        .code-block-dark code {
          color: #d4d4d4;
        }

        /* Modal样式 */
        .code-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .code-modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .code-modal-fullscreen {
          max-width: 95%;
          max-height: 95vh;
        }

        .code-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .code-modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
        }

        .modal-close-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: rgba(244, 63, 94, 0.1);
          color: #f43f5e;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .modal-close-btn:hover {
          background: rgba(244, 63, 94, 0.2);
          transform: scale(1.05);
        }

        .preview-toggle-bar {
          display: flex;
          gap: 8px;
          padding: 16px;
          background: #f7fafc;
        }

        .toggle-btn {
          flex: 1;
          padding: 8px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          color: #4a5568;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .toggle-btn:hover {
          border-color: #667eea;
          background: #f7fafc;
        }

        .toggle-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: #667eea;
          font-weight: 600;
        }

        .preview-container {
          flex: 1;
          padding: 16px;
          overflow: hidden;
        }

        .preview-iframe {
          width: 100%;
          height: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
        }

        .preview-code {
          height: 100%;
          overflow: auto;
          background: #f7fafc;
          border-radius: 8px;
          padding: 16px;
        }

        .preview-code pre {
          margin: 0;
        }

        .preview-code code {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
          line-height: 1.5;
        }

        .expand-code-container {
          flex: 1;
          padding: 16px;
          overflow: auto;
          background: #f7fafc;
        }

        .expand-code-container pre {
          margin: 0;
        }

        .expand-code-container code {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 18px;
          line-height: 1.6;
        }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" />
    </>
  );
};

export default CodeBlock;

