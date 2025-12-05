import React, { useRef, useState, useEffect } from 'react';

interface TooltipIconProps {
  title: string;
  content: React.ReactNode;
  size?: number;
}

const TooltipIcon: React.FC<TooltipIconProps> = ({ title, content, size = 14 }) => {
  const iconRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const hideTimerRef = useRef<number | null>(null);

  const updatePosition = () => {
    if (iconRef.current && tooltipRef.current && isVisible) {
      const iconRect = iconRef.current.getBoundingClientRect();
      const tooltipWidth = 300; // max-w-[300px]
      const tooltipHeight = tooltipRef.current.offsetHeight || 200;
      
      // 计算位置：图标上方，向右偏移一些
      let left = iconRect.left + iconRect.width / 2 - tooltipWidth / 2 + 40; // 向右偏移40px
      let top = iconRect.top - tooltipHeight - 8; // 图标上方8px
      
      // 确保不超出视口右边界
      if (left + tooltipWidth > window.innerWidth - 20) {
        left = window.innerWidth - tooltipWidth - 20;
      }
      
      // 确保不超出视口左边界
      if (left < 20) {
        left = 20;
      }
      
      // 如果上方空间不够，显示在下方
      if (top < 20) {
        top = iconRect.bottom + 8;
      }
      
      setPosition({ top, left });
    }
  };

  useEffect(() => {
    if (isVisible) {
      const handleUpdate = () => updatePosition();
      handleUpdate();
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);
      
      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
        // 确保在 cleanup 时隐藏 tooltip
        setIsVisible(false);
      };
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
      setIsVisible(false);
    };
  }, []);

  const handleMouseEnter = () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setIsVisible(true);
    setTimeout(updatePosition, 0);
  };

  const handleMouseLeave = () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, 150);
  };

  return (
    <>
      <div
        ref={iconRef}
        className="relative inline-block cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <svg
          className={`transition-all duration-300 ${isVisible ? 'opacity-100 scale-110' : 'opacity-60'}`}
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <path
            d="M512 853.333333c-187.733333 0-341.333333-153.6-341.333333-341.333333s153.6-341.333333 341.333333-341.333333 341.333333 153.6 341.333333 341.333333-153.6 341.333333-341.333333 341.333333z m0-85.333333c140.8 0 256-115.2 256-256s-115.2-256-256-256-256 115.2-256 256 115.2 256 256 256z m42.666667-170.666667v85.333334h-85.333334v-85.333334h85.333334z m0-256v213.333334h-85.333334V341.333333h85.333334z"
            fill={isVisible ? '#667eea' : '#444444'}
            className="transition-colors"
          />
        </svg>
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed bg-white dark:bg-gray-800 text-black dark:text-white p-3 rounded-xl text-xs whitespace-normal shadow-lg min-w-[200px] max-w-[300px] border border-gray-200 dark:border-gray-700 max-h-[380px] overflow-auto pointer-events-auto"
          style={{
            zIndex: 99999,
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2 text-sm">{title}</div>
          <div className="leading-relaxed text-gray-700 dark:text-gray-300">{content}</div>
        </div>
      )}
    </>
  );
};

export default TooltipIcon;

