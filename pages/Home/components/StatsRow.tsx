import React from 'react';

const StatsRow: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 mt-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">50T+</div>
          <div className="text-sm text-gray-500 dark:text-zinc-400 font-medium">月度 Token 量</div>
        </div>
        
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">8.5M+</div>
          <div className="text-sm text-gray-500 dark:text-zinc-400 font-medium">全球用户</div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">100+</div>
          <div className="text-sm text-gray-500 dark:text-zinc-400 font-medium">活跃服务商</div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-300 mb-2">800+</div>
          <div className="text-sm text-gray-500 dark:text-zinc-400 font-medium">AI 模型</div>
        </div>
      </div>
    </div>
  );
};

export default StatsRow;

