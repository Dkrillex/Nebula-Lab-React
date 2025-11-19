
import React, { useState } from 'react';
import { Upload, PenTool, Mic, Music, ChevronDown, FileAudio } from 'lucide-react';

interface DigitalHumanPageProps {
  t: {
    title: string;
    subtitle: string;
    tabs: {
      video: string;
      product: string;
      singing: string;
    };
    leftPanel: {
      myDigitalHuman: string;
      uploadTitle: string;
      uploadFormat: string;
      uploadDesc: string;
      personalTemplate: string;
      publicTemplate: string;
      customUpload: string;
    };
    rightPanel: {
      modeSelection: string;
      mode1: string;
      mode2: string;
      scriptContent: string;
      textToSpeech: string;
      importAudio: string;
      textPlaceholder: string;
      textLimit: number;
      voiceType: string;
      aiVoice: string;
      publicVoice: string;
      selectVoice: string;
      aiSubtitle: string;
      selectSubtitleStyle: string;
      previewPlaceholder: string;
      tryExample: string;
      generate: string;
    };
  };
}

const DigitalHumanPage: React.FC<DigitalHumanPageProps> = ({ t }) => {
  const [activeTab, setActiveTab] = useState<'video' | 'product' | 'singing'>('video');
  const [scriptMode, setScriptMode] = useState<'text' | 'audio'>('text');
  const [mode, setMode] = useState<'mode1' | 'mode2'>('mode1');
  const [text, setText] = useState('');

  return (
    <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-800 p-4 md:p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      
      {/* Header */}
      <div className="text-center text-white space-y-2 flex-shrink-0">
        <h1 className="text-3xl font-bold tracking-wide">{t.title}</h1>
        <p className="text-indigo-100 text-sm opacity-90">{t.subtitle}</p>
      </div>

      {/* Top Tabs */}
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-md p-1 rounded-full flex gap-1">
          <button
            onClick={() => setActiveTab('video')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'video' ? 'bg-white text-indigo-600 shadow-sm' : 'text-white hover:bg-white/10'
            }`}
          >
            <PenTool size={14} />
            {t.tabs.video}
          </button>
          <button
            onClick={() => setActiveTab('product')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'product' ? 'bg-white text-indigo-600 shadow-sm' : 'text-white hover:bg-white/10'
            }`}
          >
            <span className="text-lg leading-none">🎨</span>
            {t.tabs.product}
          </button>
          <button
            onClick={() => setActiveTab('singing')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'singing' ? 'bg-white text-indigo-600 shadow-sm' : 'text-white hover:bg-white/10'
            }`}
          >
            <Mic size={14} />
            {t.tabs.singing}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[600px]">
        
        {/* Left Panel - Asset Management */}
        <div className="w-full lg:w-1/3 bg-white rounded-2xl p-6 flex flex-col gap-6 shadow-2xl flex-shrink-0">
          <h2 className="font-bold text-slate-800 text-lg">{t.leftPanel.myDigitalHuman}</h2>
          
          <div className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex-1 flex flex-col items-center justify-center gap-4 group min-h-[300px]">
             <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all duration-300">
                <Upload size={32} />
             </div>
             <div className="text-center px-4">
                <p className="text-base font-bold text-slate-700 mb-1">{t.leftPanel.uploadTitle}</p>
                <p className="text-xs text-slate-400 mb-2">{t.leftPanel.uploadFormat}</p>
                <p className="text-xs text-indigo-500 font-medium">{t.leftPanel.uploadDesc}</p>
             </div>
          </div>

          <div className="flex gap-3">
             <button className="flex-1 py-3 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:border-indigo-500 hover:text-indigo-600 transition-all">
               {t.leftPanel.personalTemplate}
             </button>
             <button className="flex-1 py-3 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:border-indigo-500 hover:text-indigo-600 transition-all">
               {t.leftPanel.publicTemplate}
             </button>
          </div>

          <button className="w-full py-3 rounded-xl border border-indigo-200 text-indigo-600 text-sm font-bold hover:bg-indigo-50 transition-colors">
             {t.leftPanel.customUpload}
          </button>
        </div>

        {/* Right Panel - Configuration */}
        <div className="flex-1 bg-white rounded-2xl p-6 flex flex-col gap-6 shadow-2xl">
          
          {/* Mode Selection */}
          <div>
             <h3 className="font-bold text-slate-800 mb-3">{t.rightPanel.modeSelection}</h3>
             <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                   <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${mode === 'mode1' ? 'border-indigo-600' : 'border-slate-300'}`}>
                      {mode === 'mode1' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>}
                   </div>
                   <input type="radio" name="mode" className="hidden" checked={mode === 'mode1'} onChange={() => setMode('mode1')} />
                   <span className={`text-sm font-medium ${mode === 'mode1' ? 'text-indigo-600' : 'text-slate-600'}`}>{t.rightPanel.mode1}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                   <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${mode === 'mode2' ? 'border-indigo-600' : 'border-slate-300'}`}>
                      {mode === 'mode2' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>}
                   </div>
                   <input type="radio" name="mode" className="hidden" checked={mode === 'mode2'} onChange={() => setMode('mode2')} />
                   <span className={`text-sm font-medium ${mode === 'mode2' ? 'text-indigo-600' : 'text-slate-600'}`}>{t.rightPanel.mode2}</span>
                </label>
             </div>
          </div>

          {/* Script Content */}
          <div className="flex-1 flex flex-col gap-4">
             <h3 className="font-bold text-slate-800">{t.rightPanel.scriptContent}</h3>
             
             <div className="bg-slate-50 rounded-xl p-1 flex">
                <button 
                   onClick={() => setScriptMode('text')}
                   className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${scriptMode === 'text' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                   <PenTool size={14} />
                   {t.rightPanel.textToSpeech}
                </button>
                <button 
                   onClick={() => setScriptMode('audio')}
                   className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${scriptMode === 'audio' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                   <Music size={14} />
                   {t.rightPanel.importAudio}
                </button>
             </div>

             <div className="relative flex-1 min-h-[120px]">
                <textarea 
                   value={text}
                   onChange={(e) => setText(e.target.value)}
                   placeholder={t.rightPanel.textPlaceholder}
                   className="w-full h-full p-4 rounded-xl border border-slate-200 bg-white resize-none text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                   {text.length}/{t.rightPanel.textLimit}
                </div>
             </div>
          </div>

          {/* Voice Settings */}
          <div>
             <h3 className="text-sm font-medium text-slate-600 mb-3">{t.rightPanel.voiceType}</h3>
             <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-slate-700">{t.rightPanel.aiVoice}</label>
                <div className="flex gap-3">
                   <div className="flex-1 relative">
                      <select className="w-full h-10 appearance-none rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-indigo-500 outline-none cursor-pointer">
                         <option>{t.rightPanel.publicVoice}</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                   </div>
                   <button className="flex-1 h-10 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-colors">
                      {t.rightPanel.selectVoice}
                   </button>
                </div>
             </div>
          </div>

          {/* Subtitles */}
          <div>
             <h3 className="text-xs font-bold text-slate-700 mb-2">{t.rightPanel.aiSubtitle}</h3>
             <button className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-colors">
                {t.rightPanel.selectSubtitleStyle}
             </button>
          </div>

          {/* Preview Area */}
          <div className="bg-slate-50 rounded-xl p-6 text-center text-slate-500 text-sm min-h-[80px] flex items-center justify-center">
             {t.rightPanel.previewPlaceholder}
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-auto pt-4">
             <button className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                {t.rightPanel.tryExample}
             </button>
             <button className="flex-1 py-3 rounded-xl bg-indigo-400 text-white font-bold cursor-not-allowed opacity-80">
                {t.rightPanel.generate}
             </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DigitalHumanPage;
