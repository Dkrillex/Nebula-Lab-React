import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { getDoubaoSeedream4Size, getDoubaoSeedream4SizeFromValue } from '../modelConstants';

export type Resolution = '2K' | '4K';
export type AspectRatio = '1:1' | '3:4' | '4:3' | '16:9' | '9:16' | '2:3' | '3:2' | '21:9';

interface DoubaoSeedream4SizeSelectorProps {
  value: string; // 当前尺寸值，如 '2048x2048'
  onChange: (size: string) => void;
  t?: any; // 国际化翻译对象
}

const ASPECT_RATIOS: AspectRatio[] = ['1:1', '3:4', '4:3', '16:9', '9:16', '2:3', '3:2', '21:9'];

export const DoubaoSeedream4SizeSelector: React.FC<DoubaoSeedream4SizeSelectorProps> = ({
  value,
  onChange,
  t,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  
  // 从当前值解析出分辨率和比例
  const parsed = getDoubaoSeedream4SizeFromValue(value);
  const [resolution, setResolution] = useState<Resolution>(parsed?.resolution || '4K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(parsed?.aspectRatio as AspectRatio || '1:1');

  // 计算气泡窗口位置
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          setPopoverPosition({
            top: rect.bottom + window.scrollY + 8,
            left: rect.left + window.scrollX,
          });
        }
      };
      
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // 使用 setTimeout 确保事件在下一个事件循环中处理，避免立即关闭
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // 当分辨率和比例变化时，更新尺寸值
  useEffect(() => {
    const newSize = getDoubaoSeedream4Size(resolution, aspectRatio);
    if (newSize !== value) {
      onChange(newSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolution, aspectRatio]);

  // 当外部 value 变化时，更新内部状态（仅在外部值真正变化时）
  useEffect(() => {
    const parsed = getDoubaoSeedream4SizeFromValue(value);
    if (parsed && (parsed.resolution !== resolution || parsed.aspectRatio !== aspectRatio)) {
      setResolution(parsed.resolution);
      setAspectRatio(parsed.aspectRatio as AspectRatio);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const currentSize = getDoubaoSeedream4Size(resolution, aspectRatio);
  const [width, height] = currentSize.split('x').map(Number);

  // 按钮显示文本：分辨率 | 比例
  const buttonText = `${resolution} | ${aspectRatio}`;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{t?.sizeSelector?.imageSize || t?.imageSize || '图片尺寸'}</label>
      <div className="relative" ref={dropdownRef}>
        {/* 触发按钮 */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between rounded-lg border border-border bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all hover:bg-background"
        >
          <span className="text-foreground">{buttonText}</span>
          <ChevronDown
            size={16}
            className={`text-muted flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* 气泡窗口 - 使用 Portal 渲染到 body */}
        {isOpen && typeof document !== 'undefined' && createPortal(
          <div 
            ref={dropdownRef}
            className="fixed z-[9999] w-[380px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl p-4" 
            style={{
              top: `${popoverPosition.top}px`,
              left: `${popoverPosition.left}px`,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div className="space-y-4">
              {/* 分辨率选择 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {t?.sizeSelector?.resolution || t?.resolution || '分辨率'}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setResolution('2K')}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                      resolution === '2K'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-zinc-50 dark:bg-zinc-700 border-zinc-200 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    2K
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolution('4K')}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                      resolution === '4K'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-zinc-50 dark:bg-zinc-700 border-zinc-200 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    4K
                  </button>
                </div>
              </div>

              {/* 图片比例选择 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {t?.sizeSelector?.aspectRatio || t?.aspectRatio || '图片比例'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-2 px-2 rounded-lg border text-xs font-medium transition-all ${
                        aspectRatio === ratio
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-zinc-50 dark:bg-zinc-700 border-zinc-200 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* 图片尺寸显示 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {t?.sizeSelector?.imageSize || t?.imageSize || '图片尺寸'}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 py-2 px-3 text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">{t?.sizeSelector?.width || t?.width || '宽度'}: </span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{width}</span>
                  </div>
                  <div className="text-zinc-500 dark:text-zinc-400">×</div>
                  <div className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 py-2 px-3 text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">{t?.sizeSelector?.height || t?.height || '高度'}: </span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{height}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};
