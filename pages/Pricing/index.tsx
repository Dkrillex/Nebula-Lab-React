import React, { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { pricingService, PriceListVO } from '../../services/pricingService';

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
  const [priceList, setPriceList] = useState<PriceListVO[]>([]);
  const [invoiceEnabled, setInvoiceEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPriceList();
  }, []);

  const fetchPriceList = async () => {
    try {
      setLoading(true);
      const res = await pricingService.getPriceList({
        productPeriod: '4',
        systemType: '1',
        productType: '1927740719643607041',
      });
      
      if (res.rows) {
        const sortedList = res.rows.sort((a, b) => {
          const priceA = Number(a.productPrice);
          const priceB = Number(b.productPrice);

          // 0优先
          if (priceA === 0) return -1;
          if (priceB === 0) return 1;

          // 9999最后
          if (priceA === 9999) return 1;
          if (priceB === 9999) return -1;

          // 其余按正常价格升序
          return priceA - priceB;
        });

        // Initialize productQuantity to 1 for all items
        sortedList.forEach(item => {
          item.productQuantity = 1;
        });

        setPriceList(sortedList);
      }
    } catch (error) {
      console.error('Failed to fetch price list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (id: number | string, quantity: number) => {
    setPriceList(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, productQuantity: quantity };
      }
      return item;
    }));
  };

  return (
    <div className="bg-surface/30 min-h-screen pb-12 font-sans">
      {/* Header */}
      <div className="w-full pt-12 pb-8 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">{t.title}</h1>
        <p className="text-muted opacity-90 max-w-2xl mx-auto">{t.subtitle}</p>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        
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
          {loading ? (
             <div className="col-span-full text-center py-12">Loading...</div>
          ) : (
            priceList.map((item) => {
              const price = Number(item.productPrice);
              const isEnterprise = price === 9999;
              const isFree = price === 0;

              // Determine styles based on price type
              let borderColor = 'border-indigo-200 dark:border-indigo-800';
              let btnColor = 'bg-indigo-600 hover:bg-indigo-700';
              
              if (isEnterprise) {
                borderColor = 'border-purple-400 dark:border-purple-600';
                btnColor = 'bg-purple-600 hover:bg-purple-700';
              } else if (isFree) {
                borderColor = 'border-green-200 dark:border-green-800';
                btnColor = 'bg-green-600 hover:bg-green-700';
              } else if (item.productName === 'Business') {
                borderColor = 'border-blue-200 dark:border-blue-800';
                btnColor = 'bg-blue-600 hover:bg-blue-700';
              }

              return (
                <PricingCard
                  key={item.id}
                  item={item}
                  isEnterprise={isEnterprise}
                  onQuantityChange={(q) => handleQuantityChange(item.id, q)}
                  labels={t.labels}
                  borderColor={borderColor}
                  btnColor={btnColor}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

interface PricingCardProps {
  item: PriceListVO;
  isEnterprise: boolean;
  onQuantityChange: (quantity: number) => void;
  labels: any;
  borderColor: string;
  btnColor: string;
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  item, isEnterprise, onQuantityChange, labels, borderColor, btnColor 
}) => {
  const steps = [1, 2, 3, 4, 5, 6]; // 6 is Custom
  const price = Number(item.productPrice);
  const quantity = item.productQuantity || 1;
  const totalPoints = Number(item.productScore) * quantity;
  const totalPrice = price * quantity;

  return (
    <div className={`bg-background border ${borderColor} rounded-2xl p-6 md:p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow ${isEnterprise ? 'relative overflow-hidden' : ''}`}>
      
      <div className="text-center mb-2 relative z-10">
        <h3 className="text-xl font-bold text-foreground">{isEnterprise ? 'Enterprise' : item.productName}</h3>
        {isEnterprise && <div className="text-sm text-muted mt-1">{item.productDescription}</div>}
      </div>

      <div className="text-center mb-2 relative z-10">
        <div className="text-4xl font-bold text-primary h-16 flex items-center justify-center">
          {isEnterprise ? "Let's talk!" : `¥ ${totalPrice}`}
        </div>
        {!isEnterprise && (
          <div className="text-sm text-muted mt-1">
            {labels.credits} {totalPoints.toFixed(2)}
          </div>
        )}
      </div>

      <div className="my-6 border-t border-border relative z-10"></div>

      {!isEnterprise && (
        <div className="pt-0 border-t border-transparent mb-6">
           <div className="text-xs text-muted font-medium mb-4">{labels.quantity}</div>
           
           {/* Custom Slider */}
           <div className="relative mb-8 px-1">
              {/* Track */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-secondary/20 -translate-y-1/2 rounded-full"></div>
              
              {/* Progress */}
              <div 
                className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-300"
                style={{ width: `${((Math.min(quantity, 5) - 1) / 4) * 100}%` }}
              ></div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {steps.slice(0, 5).map((step) => (
                  <div key={step} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => onQuantityChange(step)}>
                    <div className={`w-3 h-3 rounded-full border-2 transition-all ${step <= quantity ? 'bg-primary border-primary' : 'bg-background border-secondary/40'}`}></div>
                    <span className={`text-[10px] ${step === quantity ? 'text-foreground font-bold' : 'text-muted'}`}>
                      {step}倍
                    </span>
                  </div>
                ))}
                <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => onQuantityChange(6)}>
                   <div className={`w-3 h-3 rounded-full border-2 transition-all ${quantity === 6 ? 'bg-primary border-primary' : 'bg-background border-secondary/40'}`}></div>
                   <span className={`text-[10px] ${quantity === 6 ? 'text-foreground font-bold' : 'text-muted'}`}>
                      {labels.custom}
                   </span>
                </div>
              </div>
           </div>
        </div>
      )}

      <div className="flex-1 space-y-3 mb-8 text-center relative z-10">
         {/* Use productDescription as features list if strictly text, or just display it. 
             The reference code just displays productDescription. 
             If it's multiline, we can split it. */}
         {!isEnterprise && item.productDescription && (
            <div className="text-xs text-muted/80 whitespace-pre-line">
               {item.productDescription}
            </div>
         )}
         {isEnterprise && (
            // For Enterprise, render some placeholder features or use description
             <div className="text-xs text-muted/80">
                Contact us for custom solutions
             </div>
         )}
      </div>

      <button className={`w-full py-3 rounded-lg ${btnColor} text-white font-bold transition-colors shadow-md relative z-10`}>
        {isEnterprise ? labels.contact : labels.buy}
      </button>
    </div>
  );
};

export default PricingPage;
