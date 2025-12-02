import React from 'react';
import { Play } from 'lucide-react';

interface ExampleCardProps {
  image: string;
}

export const ExampleCard: React.FC<ExampleCardProps> = ({ image }) => (
  <div className="aspect-[3/4] rounded-xl overflow-hidden relative group cursor-pointer bg-gray-100 dark:bg-zinc-800 border border-border">
    <img src={image} alt="Example" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
      <div className="w-10 h-10 bg-white/30 backdrop-blur rounded-full flex items-center justify-center pl-1">
        <Play fill="white" className="text-white" size={16} />
      </div>
    </div>
  </div>
);

