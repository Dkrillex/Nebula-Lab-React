import React from 'react';

const StatsRow: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 mt-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">20T</div>
          <div className="text-sm text-gray-500 font-medium">Monthly Tokens</div>
        </div>
        
        <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">4.2M+</div>
          <div className="text-sm text-gray-500 font-medium">Global Users</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">60+</div>
          <div className="text-sm text-gray-500 font-medium">Active Providers</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">500+</div>
          <div className="text-sm text-gray-500 font-medium">Models</div>
        </div>
      </div>
    </div>
  );
};

export default StatsRow;

