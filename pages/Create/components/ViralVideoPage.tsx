import React, { useState } from 'react';
import { Upload, FolderOpen, ArrowRight, Play, Image as ImageIcon } from 'lucide-react';

interface ViralVideoPageProps {
  t: {
    title: string;
    tabs: {
      upload: string;
      link: string;
    };
    uploadArea: {
      title: string;
      desc: string;
      limitation: string;
      selectFromPortfolio: string;
      uploadLocal: string;
    };
    process: {
      uploadImages: string;
      generateVideo: string;
      makeSame: string;
    };
    examples: string;
  };
}

const ViralVideoPage: React.FC<ViralVideoPageProps> = ({ t }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');

  return (
    <div className="bg-background min-h-full flex flex-col overflow-y-auto custom-scrollbar pb-12">
      {/* Header Title */}
      <div className="py-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t.title}</h1>
      </div>

      {/* Main Content - Split Layout */}
      <div className="px-4 md:px-8 max-w-7xl mx-auto w-full mb-12">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Panel: Visual Process Flow */}
          <div className="flex-1 bg-surface border border-border rounded-xl p-6 md:p-8 flex flex-col items-center justify-center shadow-sm">
             <div className="flex items-center justify-center gap-4 md:gap-8 w-full mb-8">
                {/* Images Stack */}
                <div className="flex flex-col gap-2">
                   <div className="w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-zinc-800 rounded-lg shadow-md p-1.5 transform -rotate-3 border border-border">
                      <div className="w-full h-full bg-gray-100 dark:bg-zinc-700 rounded overflow-hidden">
                         <img src="https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=400&auto=format&fit=crop" alt="Shoe 1" className="w-full h-full object-cover" />
                      </div>
                   </div>
                   <div className="w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-zinc-800 rounded-lg shadow-md p-1.5 transform rotate-3 -mt-20 ml-8 z-10 border border-border">
                      <div className="w-full h-full bg-gray-100 dark:bg-zinc-700 rounded overflow-hidden">
                         <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop" alt="Shoe 2" className="w-full h-full object-cover" />
                      </div>
                   </div>
                   <div className="text-center mt-4 text-sm text-muted font-medium">{t.process.uploadImages}</div>
                </div>

                {/* Arrow */}
                <div className="text-orange-500">
                   <ArrowRight size={32} strokeWidth={3} />
                </div>

                {/* Output Video */}
                <div className="flex flex-col gap-2">
                   <div className="w-40 h-72 md:w-48 md:h-80 bg-white dark:bg-zinc-800 rounded-lg shadow-md p-1.5 border border-border relative group cursor-pointer">
                      <div className="w-full h-full bg-gray-900 rounded overflow-hidden relative">
                         <img src="https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=400&auto=format&fit=crop" alt="Video Result" className="w-full h-full object-cover opacity-90" />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/30 backdrop-blur rounded-full flex items-center justify-center pl-1">
                               <Play fill="white" className="text-white" size={20} />
                            </div>
                         </div>
                         {/* Captions simulation */}
                         <div className="absolute bottom-8 left-0 w-full text-center text-white text-xs font-bold shadow-black drop-shadow-md">
                           就好像穿上一双对的靴子
                         </div>
                      </div>
                   </div>
                   <div className="text-center mt-4 text-sm text-muted font-medium">{t.process.generateVideo}</div>
                </div>
             </div>

             <div className="w-full max-w-sm">
               <button className="w-full py-3 rounded-lg border border-border bg-background hover:bg-surface transition-colors text-foreground font-medium shadow-sm">
                 {t.process.makeSame}
               </button>
               <div className="flex justify-center gap-1 mt-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
               </div>
             </div>
          </div>

          {/* Right Panel: Upload Interface */}
          <div className="flex-1 bg-surface border border-border rounded-xl overflow-hidden shadow-sm flex flex-col">
             {/* Tabs */}
             <div className="flex border-b border-border">
                <button 
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'upload' ? 'bg-white dark:bg-zinc-800 text-foreground border-t-2 border-t-primary' : 'bg-gray-50 dark:bg-zinc-900/50 text-muted hover:text-foreground'}`}
                >
                  {t.tabs.upload}
                </button>
                <button 
                  onClick={() => setActiveTab('link')}
                  className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'link' ? 'bg-white dark:bg-zinc-800 text-foreground border-t-2 border-t-primary' : 'bg-gray-50 dark:bg-zinc-900/50 text-muted hover:text-foreground'}`}
                >
                  {t.tabs.link}
                </button>
             </div>

             {/* Content */}
             <div className="p-6 md:p-10 flex-1 flex flex-col">
                {activeTab === 'upload' ? (
                  <div className="flex-1 border-2 border-dashed border-border rounded-xl bg-background flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                     <div className="mb-6 p-4 rounded-full bg-surface border border-border">
                        <ImageIcon size={48} className="text-muted/50" />
                     </div>
                     <h3 className="text-lg font-medium text-foreground mb-2">{t.uploadArea.title}</h3>
                     <p className="text-xs text-muted max-w-md mb-6">{t.uploadArea.desc}</p>
                     <p className="text-[10px] text-muted/70 max-w-xs mb-8">{t.uploadArea.limitation}</p>
                     
                     <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                        <button className="flex-1 py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium text-sm">
                           <FolderOpen size={16} />
                           {t.uploadArea.selectFromPortfolio}
                        </button>
                        <button className="flex-1 py-2.5 rounded-lg border border-border bg-white dark:bg-zinc-800 text-foreground hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm">
                           <Upload size={16} />
                           {t.uploadArea.uploadLocal}
                        </button>
                     </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                     <div className="w-full max-w-md">
                        <input 
                          type="text" 
                          placeholder="https://..." 
                          className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none mb-4"
                        />
                        <button className="w-full py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium text-sm">
                           Import
                        </button>
                     </div>
                  </div>
                )}
             </div>
          </div>

        </div>
      </div>

      {/* Footer: Excellent Cases */}
      <div className="px-4 md:px-8 max-w-7xl mx-auto w-full">
         <h2 className="text-xl font-bold text-foreground mb-6">{t.examples}</h2>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ExampleCard image="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop" />
            <ExampleCard image="https://images.unsplash.com/photo-1529139574466-a302c27e3844?q=80&w=400&auto=format&fit=crop" />
            <ExampleCard image="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400&auto=format&fit=crop" />
            <ExampleCard image="https://images.unsplash.com/photo-1485230946086-1d99d529c750?q=80&w=400&auto=format&fit=crop" />
         </div>
      </div>
    </div>
  );
};

const ExampleCard = ({ image }: { image: string }) => (
  <div className="aspect-[3/4] rounded-xl overflow-hidden relative group cursor-pointer bg-gray-100 dark:bg-zinc-800 border border-border">
     <img src={image} alt="Example" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
     <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="w-10 h-10 bg-white/30 backdrop-blur rounded-full flex items-center justify-center pl-1">
           <Play fill="white" className="text-white" size={16} />
        </div>
     </div>
  </div>
);

export default ViralVideoPage;