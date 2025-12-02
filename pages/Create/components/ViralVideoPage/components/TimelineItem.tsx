import React from 'react';

interface TimelineItemProps {
  index: number;
  img: string;
  width: string;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ index, img, width }) => (
  <div className={`${width} h-24 bg-surface border border-border rounded-lg overflow-hidden relative group cursor-pointer hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all shadow-sm`}>
    <img src={img} alt={`Clip ${index}`} className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
    <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-[2px] text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
      {index}
    </div>
  </div>
);

