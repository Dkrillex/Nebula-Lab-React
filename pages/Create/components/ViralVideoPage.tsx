
import React, { useState } from 'react';
import { 
  Upload, FolderOpen, ArrowRight, Play, Image as ImageIcon, 
  ChevronRight, ChevronLeft, Clock, Trash2, BookOpen, 
  LayoutTemplate, Volume2, Copy, Download, MoreHorizontal 
} from 'lucide-react';

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
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');
  const [selectedScript, setSelectedScript] = useState('white-dress');

  // Step 2 Mock Data
  const scriptCategories = [
    { id: 'white-dress', title: '白裙公式', subtitle: '外观样式+上身效...', time: '30s' },
    { id: 'atmosphere', title: '氛围穿搭', subtitle: '情绪共鸣+外观...', time: '30s' },
    { id: 'body-anxiety', title: '告别身材焦虑', subtitle: '身材痛点+外观...', time: '25s' },
    { id: 'design', title: '匠心设计', subtitle: '人设背书+外观...', time: '30s' },
    { id: 'classic', title: '经典永不过时', subtitle: '人设背书+外观...', time: '30s' },
  ];

  const scriptScenes = [
    {
      id: 1,
      scene: 1,
      shots: [
        { 
          img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop",
          desc: "镜头从下往上缓慢移动，完整展示连衣裙的廓形。"
        },
        {
          img: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=400&auto=format&fit=crop",
          desc: "镜头缓慢拉近，聚焦于胸前的珍珠扣和蕾丝边细节。"
        }
      ],
      lines: "其实高级感穿搭，真不用太复杂。一条对的白裙子就够了。你看这条，利落的衬衫领，加上胸前一排精致的珍珠扣和蕾丝边，温柔又带着点书卷气。"
    },
    {
      id: 2,
      scene: 2,
      shots: [
        {
          img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop",
          desc: "模特手轻轻提起裙摆，展示裙子的垂坠感和面料质感。"
        },
        {
          img: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=400&auto=format&fit=crop",
          desc: "模特缓缓向前走，裙摆随着步伐自然飘动，展示背部线条。"
        }
      ],
      lines: "最关键的是它的高腰线设计，配合腰部的褶皱，一下子就把比例拉长了，显得人特别高挑。A字大裙摆，把腿粗、梨形身材的烦恼全都藏起来了。"
    }
  ];

  const renderStep1 = () => (
    <div className="bg-background min-h-full flex flex-col pb-12">
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
               <button 
                 onClick={() => setStep(2)}
                 className="w-full py-3 rounded-lg border border-border bg-background hover:bg-surface transition-colors text-foreground font-medium shadow-sm"
               >
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

  const renderStep2 = () => (
    <div className="bg-background min-h-full flex flex-col pb-12">
      {/* Step Progress Bar */}
      <div className="w-full bg-surface border-b border-border py-4 sticky top-0 z-20">
        <div className="container mx-auto max-w-5xl px-4 flex justify-center">
           <div className="flex items-center text-sm text-muted">
              <div className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors" onClick={() => setStep(1)}>
                 <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-xs">1</span>
                 <span>素材与卖点</span>
              </div>
              <ChevronRight size={16} className="mx-4 opacity-50" />
              <div className="flex items-center gap-2 text-indigo-600 font-bold">
                 <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
                 <span>选择脚本</span>
              </div>
              <ChevronRight size={16} className="mx-4 opacity-50" />
              <div className="flex items-center gap-2 opacity-50">
                 <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-xs">3</span>
                 <span>编辑分镜</span>
              </div>
              <ChevronRight size={16} className="mx-4 opacity-50" />
              <div className="flex items-center gap-2 opacity-50">
                 <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-xs">4</span>
                 <span>生成视频</span>
              </div>
           </div>
        </div>
      </div>

      {/* Header */}
      <div className="py-8 container mx-auto px-4 max-w-6xl">
         <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-foreground">请选择一个脚本</h1>
         </div>
         <p className="text-xs text-muted">以下内容由AI生成，产品处于持续学习调优阶段，其中可能有不准确或不恰当的信息，不代表绘蛙观点，请您谨慎甄别。</p>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-6xl flex-1 flex flex-col">
         {/* Script Category Tabs */}
         <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
            {scriptCategories.map((cat) => (
               <button
                 key={cat.id}
                 onClick={() => setSelectedScript(cat.id)}
                 className={`flex-shrink-0 min-w-[160px] p-4 rounded-xl text-left transition-all border ${
                    selectedScript === cat.id 
                    ? 'bg-white dark:bg-zinc-800 border-indigo-500/30 shadow-md' 
                    : 'bg-surface border-transparent hover:bg-white dark:hover:bg-zinc-800'
                 }`}
               >
                 <div className="font-bold text-foreground mb-1">{cat.title}</div>
                 <div className="text-[10px] text-muted truncate mb-2">{cat.subtitle}</div>
                 <div className="flex items-center gap-1 text-[10px] text-muted bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded w-fit">
                    <Clock size={10} />
                    {cat.time}
                 </div>
               </button>
            ))}
         </div>

         {/* Script Table */}
         <div className="bg-white dark:bg-zinc-900 rounded-xl border border-border shadow-sm overflow-hidden mb-8">
            {/* Table Header */}
            <div className="grid grid-cols-12 bg-surface border-b border-border p-4 text-xs font-bold text-muted uppercase">
               <div className="col-span-1 text-center">分镜</div>
               <div className="col-span-2">画面</div>
               <div className="col-span-4">视频描述</div>
               <div className="col-span-5">台词</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-border">
               {scriptScenes.map((item, idx) => (
                  <React.Fragment key={item.id}>
                     {/* Shot 1 */}
                     <div className="grid grid-cols-12 p-4 gap-4 hover:bg-surface/30 transition-colors items-start">
                        <div className="col-span-1 flex justify-center pt-2">
                           <span className="font-bold text-lg text-slate-400">{item.scene}</span>
                        </div>
                        <div className="col-span-2">
                           <div className="aspect-video rounded-lg bg-slate-200 overflow-hidden border border-border">
                              <img src={item.shots[0].img} alt="Shot 1" className="w-full h-full object-cover" />
                           </div>
                        </div>
                        <div className="col-span-4 text-sm text-foreground pt-1">
                           {item.shots[0].desc}
                        </div>
                        {/* Line spans full height of the scene */}
                        <div className="col-span-5 text-sm text-foreground pt-1 row-span-2">
                           {item.lines}
                        </div>
                     </div>

                     {/* Shot 2 (if exists, simplified logic) */}
                     {item.shots[1] && (
                       <div className="grid grid-cols-12 p-4 pt-0 gap-4 hover:bg-surface/30 transition-colors items-start border-none">
                          <div className="col-span-1"></div>
                          <div className="col-span-2">
                             <div className="aspect-video rounded-lg bg-slate-200 overflow-hidden border border-border">
                                <img src={item.shots[1].img} alt="Shot 2" className="w-full h-full object-cover" />
                             </div>
                          </div>
                          <div className="col-span-4 text-sm text-foreground pt-1">
                             {item.shots[1].desc}
                          </div>
                          <div className="col-span-5"></div>
                       </div>
                     )}
                  </React.Fragment>
               ))}
            </div>
         </div>
         
         {/* Bottom Actions */}
         <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 flex justify-between items-center mt-auto">
            <button className="flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors">
               <LayoutTemplate size={16} />
               全部任务
               <ChevronRight size={14} />
            </button>

            <button 
              onClick={() => setStep(3)}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
            >
               喜欢此脚本，就它了
            </button>
         </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="bg-background min-h-full flex flex-col h-[calc(100vh-64px)]">
      {/* Top Navigation Bar */}
      <div className="border-b border-border bg-background p-4 flex items-center justify-between shrink-0">
         <button onClick={() => setStep(2)} className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border hover:bg-surface text-sm transition-colors">
            <ChevronLeft size={16} />
            上一步
         </button>

         <div className="flex items-center text-sm text-muted">
             {/* Stepper UI */}
             <div className="flex items-center gap-2 opacity-50 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setStep(1)}>1. 素材与卖点</div>
             <ChevronRight size={14} className="mx-2 opacity-30" />
             <div className="flex items-center gap-2 opacity-50 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setStep(2)}>2. 选择脚本</div>
             <ChevronRight size={14} className="mx-2 opacity-30" />
             <div className="flex items-center gap-2 font-bold text-indigo-600">3. 编辑分镜</div>
             <ChevronRight size={14} className="mx-2 opacity-30" />
             <div className="flex items-center gap-2 opacity-50">4. 生成视频</div>
         </div>

         <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-100 text-orange-600 text-sm hover:bg-orange-200 transition-colors font-medium">
               <BookOpen size={16} />
               智能混剪教程
            </button>
            <div className="w-px h-6 bg-border"></div>
            <button className="p-2 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors">
               <Trash2 size={18} />
            </button>
             <button 
               onClick={() => setStep(4)}
               className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border hover:bg-surface text-sm transition-colors"
             >
                下一步
                <ChevronRight size={16} />
            </button>
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-surface/30">
         <div className="max-w-[1600px] mx-auto">
            {/* Title Row */}
            <div className="flex items-baseline gap-4 mb-6">
               <h2 className="text-2xl font-bold text-foreground">初恋穿搭</h2>
               <span className="text-sm text-muted">情绪共鸣+外观样式+上身效果+制作工艺+适用场景+引导购买</span>
               <span className="text-sm text-muted border-l border-border pl-4 ml-2">预计总时长: 35s</span>
            </div>

            {/* Storyboard Cards - Horizontal Scroll */}
            <div className="flex gap-6 overflow-x-auto pb-6">
               {/* Card 1 */}
               <StoryboardCard 
                  index={1}
                  images={[
                    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400",
                    "https://images.unsplash.com/photo-1529139574466-a302c27e3844?q=80&w=400"
                  ]}
                  text="这件就是那种很经典的蓝白条纹，看着就特别清爽。腰部的系带设计可以自己调节，既能收腰显瘦，又增加了一点随性的感觉，特别有气质。"
               />
               {/* Card 2 */}
               <StoryboardCard 
                  index={2}
                  images={["https://images.unsplash.com/photo-1485230946086-1d99d529c750?q=80&w=400"]}
                  text="夏天真的好需要一件清爽又温柔的衬衫裙啊，穿上就感觉自己回到了校园，是那种很干净的初恋感。"
               />
               {/* Card 3 */}
               <StoryboardCard 
                  index={3}
                  images={["https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400"]}
                  text="上身效果真的绝了，特别显高显腿长。而且它不是普通的裙子，外面做了个围裹的裙片，这样就完全不用担心走光啦。"
               />
               {/* Card 3 Duplicate for visual filler */}
                <StoryboardCard 
                  index={4}
                  images={["https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=400"]}
                  text="面料也是这种很舒服的棉质，透气性特别好，夏天穿完全不会觉得闷热。"
               />
            </div>
         </div>
      </div>

      {/* Bottom Timeline Panel */}
      <div className="h-56 border-t border-border bg-background shrink-0 flex flex-col shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
         {/* Time Ruler */}
         <div className="h-8 border-b border-border flex items-end px-4 text-xs text-muted select-none bg-surface/50">
            <div className="flex-1 flex justify-between px-2">
               <span>00:00</span><span>00:10</span><span>00:20</span><span>00:30</span><span>00:40</span><span>00:50</span>
            </div>
            <div className="w-24 text-right border-l border-border pl-2">
               <span className="cursor-pointer hover:text-foreground flex items-center justify-end gap-1">
                 <ArrowRight size={12} className="rotate-90" /> 收起
               </span>
            </div>
         </div>
         {/* Tracks */}
         <div className="flex-1 p-4 overflow-x-auto custom-scrollbar">
             <div className="flex gap-1 h-full items-center pl-2">
                <TimelineItem index={1} img="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200" width="w-48" />
                <TimelineItem index={2} img="https://images.unsplash.com/photo-1529139574466-a302c27e3844?q=80&w=200" width="w-32" />
                <TimelineItem index={3} img="https://images.unsplash.com/photo-1485230946086-1d99d529c750?q=80&w=200" width="w-48" />
                <TimelineItem index={4} img="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=200" width="w-40" />
                <TimelineItem index={5} img="https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=200" width="w-48" />
             </div>
         </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="bg-background min-h-full flex flex-col h-[calc(100vh-64px)]">
       {/* Top Navigation - Reuse from Step 3 but update active state */}
       <div className="border-b border-border bg-background p-4 flex items-center justify-between shrink-0">
         <button onClick={() => setStep(3)} className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border hover:bg-surface text-sm transition-colors">
            <ChevronLeft size={16} />
            上一步
         </button>

         <div className="flex items-center text-sm text-muted">
             {/* Stepper */}
             <div className="flex items-center gap-2 opacity-50 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setStep(1)}>1. 素材与卖点</div>
             <ChevronRight size={14} className="mx-2 opacity-30" />
             <div className="flex items-center gap-2 opacity-50 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setStep(2)}>2. 选择脚本</div>
             <ChevronRight size={14} className="mx-2 opacity-30" />
             <div className="flex items-center gap-2 opacity-50 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setStep(3)}>3. 编辑分镜</div>
             <ChevronRight size={14} className="mx-2 opacity-30" />
             <div className="flex items-center gap-2 font-bold text-indigo-600">4. 生成视频</div>
         </div>

         <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-100 text-orange-600 text-sm hover:bg-orange-200 transition-colors font-medium">
               <BookOpen size={16} />
               智能混剪教程
            </button>
            <div className="w-px h-6 bg-border"></div>
            <button className="p-2 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors">
               <Trash2 size={18} />
            </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-surface/30">
         <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Video Player */}
            <div className="lg:col-span-2 space-y-4">
               <div>
                  <h2 className="text-xl font-bold text-foreground">生成结果</h2>
                  <p className="text-xs text-muted mt-1">因产品处于持续学习调优阶段，可能由不恰当的信息，请您谨慎甄别。</p>
                  <p className="text-xs text-muted mt-0.5">2025-11-18 20:37:39</p>
               </div>

               <div className="aspect-[3/4] w-full max-w-2xl bg-black rounded-xl overflow-hidden relative group mx-auto lg:mx-0">
                  {/* Video Mock */}
                  <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800" className="w-full h-full object-cover opacity-90" alt="Generated Video" />
                  
                  {/* Controls Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                      <div className="flex items-center justify-between text-white">
                         <div className="flex items-center gap-4">
                            <button className="hover:text-indigo-400 transition-colors"><Play size={24} fill="currentColor" /></button>
                            <button className="hover:text-indigo-400 transition-colors"><Volume2 size={24} /></button>
                            <span className="text-sm font-mono">00:01 / 00:36</span>
                         </div>
                         <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg text-sm font-medium transition-colors">
                               <Download size={16} />
                               下载
                            </button>
                            <button className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg transition-colors">
                               <MoreHorizontal size={16} />
                            </button>
                         </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full h-1 bg-white/30 rounded-full mt-4 overflow-hidden cursor-pointer">
                         <div className="w-[3%] h-full bg-indigo-500"></div>
                      </div>
                  </div>
               </div>
            </div>

            {/* Right Column: Details */}
            <div className="space-y-8">
               <div>
                  <div className="flex items-center gap-2">
                     <h2 className="text-xl font-bold text-foreground">条纹衬衫裙</h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted mt-1">
                     <span>视频编号: 130882693</span>
                     <Copy size={12} className="cursor-pointer hover:text-foreground" />
                  </div>
               </div>

               {/* Product Info */}
               <div>
                  <h3 className="font-bold text-sm text-foreground mb-3">商品</h3>
                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                     <div className="w-12 h-12 rounded bg-slate-200 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200" className="w-full h-full object-cover" alt="Product" />
                     </div>
                     <div>
                        <div className="font-bold text-sm text-foreground">条纹衬衫裙</div>
                        <div className="text-xs text-muted">ID: 959233351382</div>
                     </div>
                  </div>
               </div>

               {/* Selling Points */}
               <div>
                  <h3 className="font-bold text-sm text-foreground mb-3">商品卖点</h3>
                  <div className="text-sm text-muted leading-relaxed">
                     显瘦; 青春活力; 上班也能穿; 女大学生即视感
                  </div>
               </div>

               {/* Video Settings */}
               <div>
                  <h3 className="font-bold text-sm text-foreground mb-3">视频设置</h3>
                  <div className="space-y-3 text-sm">
                     <div className="flex justify-between">
                        <span className="text-muted">脚本</span>
                        <span className="text-foreground font-medium">初恋穿搭</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-muted">音色</span>
                        <span className="text-foreground font-medium">亲切女主播</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-muted">比例</span>
                        <span className="text-foreground font-medium">3:4</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-muted">画质</span>
                        <span className="text-foreground font-medium">高清</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-muted">时长</span>
                        <span className="text-foreground font-medium">36s</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );

  return step === 1 ? renderStep1() : step === 2 ? renderStep2() : step === 3 ? renderStep3() : renderStep4();
};

// Helper for Storyboard Card
const StoryboardCard = ({ index, images, text }: { index: number, images: string[], text: string }) => (
  <div className="min-w-[400px] w-[400px] bg-background border border-border rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
    <div className="p-3 border-b border-border text-sm font-bold text-foreground flex items-center gap-2">
       分镜 {index}
    </div>
    <div className="p-3 flex gap-2 h-64 bg-surface/50">
      {images.map((img, idx) => (
        <div key={idx} className="flex-1 h-full rounded-lg bg-gray-100 dark:bg-zinc-800 overflow-hidden relative border border-border/50">
           <img src={img} alt={`Shot ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        </div>
      ))}
    </div>
    <div className="p-4 bg-background border-t border-border flex-1 flex flex-col">
       <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted font-bold uppercase tracking-wider">台词</span>
          <span className="text-[10px] text-muted/60">{text.length} 字</span>
       </div>
       <div className="relative flex-1">
          <textarea 
            className="w-full h-24 bg-surface/30 rounded-lg border border-transparent focus:border-indigo-500/50 focus:bg-surface resize-none text-sm text-foreground focus:outline-none p-3 leading-relaxed transition-all"
            defaultValue={text}
          />
       </div>
    </div>
  </div>
);

// Helper for Timeline Item
const TimelineItem = ({ index, img, width }: { index: number, img: string, width: string }) => (
    <div className={`${width} h-24 bg-surface border border-border rounded-lg overflow-hidden relative group cursor-pointer hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all shadow-sm`}>
       <img src={img} alt={`Clip ${index}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
       <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-[2px] text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
          {index}
       </div>
    </div>
);

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
