
import React, { useState } from 'react';
import { Upload, Wand2, Film, Clapperboard, Image as ImageIcon, Gem } from 'lucide-react';

interface ImageToVideoPageProps {
  t: {
    title: string;
    subtitle: string;
    tabs: {
        traditional: string;
        startEnd: string;
        advanced: string;
    };
    upload: {
        label: string;
        button: string;
        desc: string;
    };
    generationSettings: string;
    prompt: {
        label: string;
        placeholder: string;
        polish: string;
        maxLength: number;
    };
    quality: {
        label: string;
        options: {
            lite: string;
            pro: string;
            best: string;
        };
    };
    duration: {
        label: string;
        units: string;
    };
    negativePrompt: {
        label: string;
        placeholder: string;
    };
    generate: string;
    result: {
        label: string;
        emptyState: string;
    };
  };
}

const ImageToVideoPage: React.FC<ImageToVideoPageProps> = ({ t }) => {
  const [activeTab, setActiveTab] = useState<'traditional' | 'startEnd' | 'advanced'>('traditional');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [quality, setQuality] = useState<'Lite' | 'Pro' | 'Best'>('Lite');
  const [duration, setDuration] = useState('5');

  const durations = ['3', '5', '8', '10', '12'];

  return (
    <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-800 p-4 md:p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="text-center text-white space-y-2 flex-shrink-0">
            <h1 className="text-3xl font-bold tracking-wide">{t.title}</h1>
            <p className="text-indigo-100 text-sm opacity-90">{t.subtitle}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[600px]">
            
            {/* Left Sidebar - Config */}
            <div className="w-full lg:w-[400px] bg-white rounded-2xl p-6 flex flex-col gap-6 shadow-2xl flex-shrink-0 overflow-y-auto custom-scrollbar lg:max-h-[calc(100vh-200px)]">
                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-lg flex-shrink-0">
                    <button 
                        onClick={() => setActiveTab('traditional')}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'traditional' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {t.tabs.traditional}
                    </button>
                    <button 
                        onClick={() => setActiveTab('startEnd')}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'startEnd' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {t.tabs.startEnd}
                    </button>
                    <button 
                        onClick={() => setActiveTab('advanced')}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'advanced' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {t.tabs.advanced}
                    </button>
                </div>

                {/* Upload Section */}
                <div className="flex-shrink-0">
                    <h3 className="font-bold text-slate-800 mb-3">{t.upload.label}</h3>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer h-48 flex flex-col items-center justify-center gap-3 group">
                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all duration-300">
                            <Clapperboard size={24} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-slate-600">{t.upload.button}</p>
                            <p className="text-xs text-slate-400 mt-1">{t.upload.desc}</p>
                        </div>
                    </div>
                </div>
                
                {/* Generation Settings Header */}
                <h3 className="font-bold text-slate-800 -mb-3 mt-2">{t.generationSettings}</h3>

                {/* Prompt Section */}
                <div className="flex flex-col gap-3">
                     <div className="flex items-center justify-between">
                         <label className="text-sm font-medium text-slate-600">{t.prompt.label}</label>
                         <button className="flex items-center gap-1 text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-200 transition-colors font-medium">
                             <Wand2 size={12} />
                             {t.prompt.polish}
                         </button>
                     </div>
                     <div className="relative">
                         <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t.prompt.placeholder}
                            className="w-full h-32 p-3 rounded-xl border border-slate-200 bg-white resize-none text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                         />
                         <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                             {prompt.length} / {t.prompt.maxLength}
                         </div>
                     </div>
                </div>

                 {/* Quality Selection */}
                 <div className="flex-shrink-0">
                    <h3 className="text-sm font-medium text-slate-600 mb-3">{t.quality.label}</h3>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setQuality('Lite')}
                            className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${quality === 'Lite' ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                        >
                            {t.quality.options.lite}
                        </button>
                        <button 
                            onClick={() => setQuality('Pro')}
                            className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${quality === 'Pro' ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                        >
                            {t.quality.options.pro}
                        </button>
                        <button 
                            onClick={() => setQuality('Best')}
                            className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${quality === 'Best' ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                        >
                            {t.quality.options.best}
                        </button>
                    </div>
                </div>

                {/* Video Duration */}
                <div className="flex-shrink-0">
                    <h3 className="text-sm font-medium text-slate-600 mb-3">{t.duration.label}</h3>
                    <div className="grid grid-cols-5 gap-2">
                        {durations.map((d) => (
                            <button
                                key={d}
                                onClick={() => setDuration(d)}
                                className={`py-2 rounded-lg border text-sm font-medium transition-all ${duration === d ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                            >
                                {d}{t.duration.units}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Negative Prompt */}
                <div className="flex-shrink-0">
                    <h3 className="text-sm font-medium text-slate-600 mb-3">{t.negativePrompt.label}</h3>
                    <div className="relative">
                         <textarea 
                            value={negativePrompt}
                            onChange={(e) => setNegativePrompt(e.target.value)}
                            placeholder={t.negativePrompt.placeholder}
                            className="w-full h-24 p-3 rounded-xl border border-slate-200 bg-white resize-none text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                         />
                         <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                             {negativePrompt.length} / {t.prompt.maxLength}
                         </div>
                    </div>
                </div>

                {/* Generate Button */}
                <button className="w-full py-4 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transform transition-transform active:scale-95 flex items-center justify-center gap-2">
                    <Gem size={20} className="text-white" />
                    {t.generate}
                </button>
            </div>

            {/* Right Sidebar - Result */}
            <div className="flex-1 bg-white rounded-2xl p-6 flex flex-col shadow-2xl min-h-[500px]">
                <div className="flex items-center justify-center h-full text-center">
                    <div className="flex flex-col items-center justify-center max-w-xs">
                        <h2 className="text-lg font-bold text-slate-800 mb-8">{t.result.label}</h2>
                        <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                            <Clapperboard size={48} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            {t.result.emptyState}
                        </p>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
};

export default ImageToVideoPage;
