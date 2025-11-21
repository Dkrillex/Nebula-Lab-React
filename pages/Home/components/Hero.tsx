import React from 'react';
import RouterDemo from './RouterDemo';

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
  const heroContent = (
    <div className="text-left">
      <h1 className="text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl mb-4 leading-[1.1]">
          {t.titlePrefix} <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
             {t.titleSuffix}
          </span>
        </h1>
        
      <p className="text-lg text-muted max-w-xl leading-relaxed">
        <span className="text-indigo-500 font-medium">Better prices</span>, <span className="text-indigo-500 font-medium">better uptime</span>, no subscription.
      </p>
    </div>
  );

  return (
    <div className="relative overflow-hidden pt-8 pb-12 md:pt-16 md:pb-4">
      <div className="container mx-auto px-4">
        {/* Router Demo Integration with Hero Content passed as prop */}
        <div className="w-full">
           <RouterDemo heroContent={heroContent} />
        </div>
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-[100px]"></div>
    </div>
  );
};

export default Hero;
