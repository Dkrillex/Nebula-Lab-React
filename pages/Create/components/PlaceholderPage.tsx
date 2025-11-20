import React from 'react';
import { Construction } from 'lucide-react';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
      <Construction size={64} className="mb-4 text-indigo-500" />
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p>该功能正在开发中，敬请期待！</p>
    </div>
  );
};

export default PlaceholderPage;

