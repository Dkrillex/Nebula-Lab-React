import React, { useState } from 'react';
import { HelpCircle, Check, MessageSquare } from 'lucide-react';

interface PricingPageProps {
  t: {
    title: string;
    subtitle: string;
    paymentCycle: string;
    questions: string;
    paymentMethod: string;
    wechatPay: string;
    invoice: string;
    invoiceLabel: string;
    starter: {
      title: string;
      features: string[];
    };
    business: {
      title: string;
      features: string[];
    };
    enterprise: {
      title: string;
      slogan: string;
      features: string[];
    };
    labels: {
      credits: string;
      quantity: string;
      custom: string;
      buy: string;
      contact: string;
    };
  };
}

const PricingPage: React.FC<PricingPageProps> = ({ t }) => {
  const [starterMultiplier, setStarterMultiplier] = useState(1);
  const [businessMultiplier, setBusinessMultiplier] = useState(1);
  const [invoiceEnabled, setInvoiceEnabled] = useState(false);

  const starterBasePrice = 86;
  const starterBaseCredits = 50.00;
  
  const businessBasePrice = 398;
  const businessBaseCredits = 250.00;

  return (
    <div className="bg-surface/30 min-h-screen pb-12 font-sans">
      {/* Header Background */}
      <div className="w-full bg-gradient-to-b from-indigo-500 to-indigo-600 dark:from-indigo-700 dark:to-indigo-900 text-white pt-12 pb-24 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t.title}</h1>
        <p className="text-indigo-100 opacity-90 max-w-2xl mx-auto">{t.subtitle}</p>
      </div>

      <div className="container mx-auto px-4 max-w-6xl -mt-16">
        
        {/* Configuration Bar */}
        <div className="bg-background rounded-xl shadow-sm border border-border p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-4">
             <h2 className="font-bold text-lg text-foreground">{t.paymentCycle}</h2>
             <a href="#" className="text-xs text-primary hover:underline flex items-center gap-1">
               <HelpCircle size={12} />
               {t.questions}
             </a>
           </div>
           
           <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted">{t.paymentMethod}</span>
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                   <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-[8px]">
                     <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                   </span>
                   {t.wechatPay}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted">{t.invoice}</span>
                <button 
                  onClick={() => setInvoiceEnabled(!invoiceEnabled)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${invoiceEnabled ? 'bg-primary' : 'bg-secondary/30'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${invoiceEnabled ? 'left-5.5' : 'left-0.5'}`}></div>
                </button>
              </div>
           </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Starter Card */}
          <PricingCard 
             title={t.starter.title}
             price={starterBasePrice * starterMultiplier}
             credits={starterBaseCredits * starterMultiplier}
             features={t.starter.features}
             multiplier={starterMultiplier}
             setMultiplier={setStarterMultiplier}
             labels={t.labels}
             borderColor="border-indigo-200 dark:border-indigo-800"
             btnColor="bg-indigo-600 hover:bg-indigo-700"
          />

          {/* Business Card */}
          <PricingCard 
             title={t.business.title}
             price={businessBasePrice * businessMultiplier}
             credits={businessBaseCredits * businessMultiplier}
             features={t.business.features}
             multiplier={businessMultiplier}
             setMultiplier={setBusinessMultiplier}
             labels={t.labels}
             borderColor="border-blue-200 dark:border-blue-800"
             btnColor="bg-blue-600 hover:bg-blue-700"
          />

          {/* Enterprise Card */}
          <div className="bg-background border-2 border-purple-400 dark:border-purple-600 rounded-2xl p-6 md:p-8 flex flex-col shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-8 -mt-8"></div>

             <div className="text-center mb-6">
               <h3 className="text-xl font-bold text-foreground mb-2">{t.enterprise.title}</h3>
               <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 h-16 flex items-center justify-center">
                 {t.enterprise.slogan}
               </div>
             </div>

             <div className="my-6 border-t border-border/50"></div>

             <div className="flex-1 space-y-4 mb-8">
               {t.enterprise.features.map((feature, idx) => (
                 <div key={idx} className="flex items-center justify-center text-sm text-muted">
                    {feature}
                 </div>
               ))}
             </div>

             <button className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors shadow-md">
               {t.labels.contact}
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

interface PricingCardProps {
  title: string;
  price: number;
  credits: number;
  features: string[];
  multiplier: number;
  setMultiplier: (val: number) => void;
  labels: any;
  borderColor: string;
  btnColor: string;
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  title, price, credits, features, multiplier, setMultiplier, labels, borderColor, btnColor 
}) => {
  const steps = [1, 2, 3, 4, 5, 6]; // 6 is Custom

  return (
    <div className={`bg-background border ${borderColor} rounded-2xl p-6 md:p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow`}>
      
      <div className="text-center mb-2">
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
      </div>

      <div className="text-center mb-2">
        <div className="text-4xl font-bold text-primary">
          ¥ {price}
        </div>
        <div className="text-sm text-muted mt-1">
          {labels.credits} {credits.toFixed(2)}
        </div>
      </div>

      <div className="my-6 pt-6 border-t border-border">
         <div className="text-xs text-muted font-medium mb-4">{labels.quantity}</div>
         
         {/* Custom Slider */}
         <div className="relative mb-8 px-1">
            {/* Track */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-secondary/20 -translate-y-1/2 rounded-full"></div>
            
            {/* Progress */}
            <div 
              className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-300"
              style={{ width: `${((Math.min(multiplier, 5) - 1) / 4) * 100}%` }}
            ></div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {steps.slice(0, 5).map((step) => (
                <div key={step} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setMultiplier(step)}>
                  <div className={`w-3 h-3 rounded-full border-2 transition-all ${step <= multiplier ? 'bg-primary border-primary' : 'bg-background border-secondary/40'}`}></div>
                  <span className={`text-[10px] ${step === multiplier ? 'text-foreground font-bold' : 'text-muted'}`}>
                    {step}倍
                  </span>
                </div>
              ))}
              <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setMultiplier(6)}>
                 <div className={`w-3 h-3 rounded-full border-2 transition-all ${multiplier === 6 ? 'bg-primary border-primary' : 'bg-background border-secondary/40'}`}></div>
                 <span className={`text-[10px] ${multiplier === 6 ? 'text-foreground font-bold' : 'text-muted'}`}>
                    {labels.custom}
                 </span>
              </div>
            </div>
         </div>
      </div>

      <div className="flex-1 space-y-3 mb-8 text-center">
         {features.map((feature, idx) => (
           <div key={idx} className="text-xs text-muted/80">
             {feature}
           </div>
         ))}
      </div>

      <button className={`w-full py-3 rounded-lg ${btnColor} text-white font-bold transition-colors shadow-md`}>
        {labels.buy}
      </button>
    </div>
  );
};

export default PricingPage;