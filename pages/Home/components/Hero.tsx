import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';

interface HeroProps {
  t: {
    status: string;
    titlePrefix: string;
    titleSuffix: string;
    description: string;
    getStarted: string;
    viewPricing: string;
  }
}

const Hero: React.FC<HeroProps> = ({ t }) => {
  return (
    <div className="relative overflow-hidden pt-16 pb-12 md:pt-24 md:pb-20">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm text-muted backdrop-blur mb-8">
          <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
          <span>{t.status}</span>
        </div>
        
        <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-foreground md:text-7xl lg:text-8xl">
          {t.titlePrefix} <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
             {t.titleSuffix}
          </span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
          {t.description}
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="h-12 rounded-lg bg-foreground px-8 text-sm font-medium text-background hover:opacity-90 transition-all flex items-center gap-2">
            {t.getStarted} <ArrowRight size={16} />
          </button>
          <button className="h-12 rounded-lg border border-border bg-surface px-8 text-sm font-medium text-foreground hover:bg-border/50 transition-all flex items-center gap-2">
            <Zap size={16} className="text-yellow-400" /> {t.viewPricing}
          </button>
        </div>
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[100px]"></div>
    </div>
  );
};

export default Hero;