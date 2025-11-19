import React, { useState } from 'react';
import { Wand2, Image, Download, Share2, Maximize2 } from 'lucide-react';

interface TextToImagePageProps {
  t: {
    title: string;
    subtitle: string;
    inputLabel: string;
    inputPlaceholder: string;
    aiPolish: string;
    settingsTitle: string;
    aspectRatio: string;
    generateConfig: string;
    generate: string;
    resultTitle: string;
    emptyState: string;
    ratios: {
      square: string;
      landscape43: string;
      portrait34: string;
      widescreen: string;
      mobile: string;
      photo: string;
    }
  };
}

const ratios = [
  { labelKey: 'square', value: '1:1', dim: '2048x2048' },
  { labelKey: 'landscape43', value: '4:3', dim: '2304x1728' },
  { labelKey: 'portrait34', value: '3:4', dim: '1728x2304' },
  { labelKey: 'widescreen', value: '16:9', dim: '2560x1440' },
  { labelKey: 'mobile', value: '9:16', dim: '1440x2560' },
  { labelKey: 'photo', value: '3:2', dim: '2496x1664' },
];

const TextToImagePage: React.FC<TextToImagePageProps> = ({ t }) => {
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [prompt, setPrompt] = useState('');

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-indigo-600 text-white py-8 px-6 text-center">
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="opacity-90">{t.subtitle}</p>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel - Settings */}
        <div className="w-full md:w-[400px] lg:w-[450px] bg-surface border-r border-border flex flex-col p-6 overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-foreground">{t.inputLabel}</h3>
              <button className="flex items-center gap-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-200 transition-colors">
                <Wand2 size={12} />
                {t.aiPolish}
              </button>
            </div>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t.inputPlaceholder}
                className="w-full h-40 p-4 rounded-xl border border-border bg-background resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
              />
              <span className="absolute bottom-3 right-3 text-xs text-muted">0/2000</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-foreground mb-4">{t.settingsTitle}</h3>
            
            <div className="mb-4">
              <label className="text-sm font-medium text-muted mb-3 block">{t.aspectRatio}</label>
              <div className="grid grid-cols-2 gap-3">
                {ratios.map((ratio) => (
                  <button
                    key={ratio.value}
                    onClick={() => setSelectedRatio(ratio.value)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedRatio === ratio.value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                        : 'border-border bg-background hover:border-indigo-300 text-muted hover:text-foreground'
                    }`}
                  >
                    <div className="text-sm font-semibold mb-1">{(t.ratios as any)[ratio.labelKey] || ratio.labelKey} {ratio.value}</div>
                    <div className="text-xs opacity-70">({ratio.dim})</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button className="mt-auto w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transform transition-transform active:scale-95 flex items-center justify-center gap-2">
             <Wand2 size={18} />
             {t.generate}
          </button>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-white p-8 flex flex-col relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
           
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold text-indigo-900">{t.resultTitle}</h2>
             <div className="px-4 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-500">
                Preview Mode
             </div>
           </div>

           <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 m-4">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                 <Image size={40} className="text-indigo-300" />
              </div>
              <p className="text-slate-400 text-sm max-w-xs text-center">
                {t.emptyState}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TextToImagePage;