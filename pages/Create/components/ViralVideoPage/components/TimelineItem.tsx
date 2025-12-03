import React from 'react';

interface TimelineItemProps {
  index: number; // 分镜序号（1, 2, 3...）
  sceneId: number; // 分镜ID
  images: string[]; // 支持多个图片
  width: string;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ index, sceneId, images, width }) => {
  // 如果只有一个图片，显示单图；如果有多个，显示网格
  const hasMultipleImages = images.length > 1;
  
  return (
    <div className={`${width} h-24 bg-surface border border-border rounded-lg overflow-hidden relative group cursor-pointer hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all shadow-sm`}>
      {hasMultipleImages ? (
        <div className="w-full h-full grid grid-cols-2 gap-0.5 p-0.5">
          {images.slice(0, 4).map((img, idx) => (
            <img 
              key={idx} 
              src={img} 
              alt={`Clip ${index}-${idx + 1}`} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
            />
          ))}
        </div>
      ) : (
        <img 
          src={images[0] || ''} 
          alt={`Clip ${index}`} 
          className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" 
        />
      )}
      {/* 显示数字标签 */}
      <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-[2px] text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
        {index}
      </div>
    </div>
  );
};

