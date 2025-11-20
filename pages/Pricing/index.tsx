import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, Check, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { pricingService, PriceListVO } from '../../services/pricingService';
import { orderService, OrderInfo } from '../../services/orderService';
import { useAuthStore } from '../../stores/authStore';
import BaseModal from '../../components/BaseModal';

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
  const { user } = useAuthStore();
  const [priceList, setPriceList] = useState<PriceListVO[]>([]);
  const [invoiceEnabled, setInvoiceEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Payment State
  const [paymentType, setPaymentType] = useState('wechat');
  const [wxPayModalOpen, setWxPayModalOpen] = useState(false);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [payStatus, setPayStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  
  const pollTimer = useRef<NodeJS.Timeout | null>(null);
  const alipayPollTimer = useRef<NodeJS.Timeout | null>(null);

  const paymentOptions = [
    { value: 'wechat', label: t.wechatPay, color: 'bg-green-500' },
    { value: 'Alipay', label: 'Alipay', color: 'bg-blue-500' },
    { value: 'AlipayHK', label: 'AlipayHK', color: 'bg-blue-600' },
    // Add more options as needed from the reference if required
  ];

  useEffect(() => {
    fetchPriceList();
    return () => {
      stopPolling();
    };
  }, []);

  const stopPolling = () => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
    if (alipayPollTimer.current) {
      clearTimeout(alipayPollTimer.current);
      alipayPollTimer.current = null;
    }
  };

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

  const handlePayment = async (item: PriceListVO) => {
    if (!user) {
      // Handle not logged in - maybe redirect to login or show auth modal
      alert('Please login first');
      return;
    }

    if (Number(item.productPrice) === 9999) {
        // Contact us logic
        window.location.href = 'mailto:contact@example.com'; // Replace with actual contact
        return;
    }

    if (paymentType === 'wechat') {
      await handleWechatPayment(item);
    } else {
      await handleAlipayPayment(item);
    }
  };

  const handleWechatPayment = async (item: PriceListVO) => {
    try {
      setPayLoading(true);
      stopPolling();
      setPayStatus('pending');

      const baseAmount = item.totalAmount || Number(item.productPrice) * item.productQuantity;
      // Add tax logic if needed, currently keeping simple based on reference
      const totalAmount = invoiceEnabled ? Number((baseAmount).toFixed(2)) : Number(baseAmount.toFixed(2));

      const params = {
        name: item.productName,
        totalAmount: totalAmount,
        type: 'wechat',
        userId: user?.userId,
        userName: user?.realName,
        nebulaApiId: user?.nebulaApiId,
        appMenu: item.productType,
        appType: item.id,
        appCount: item.productQuantity,
        productPeriod: item.productPeriod,
        isInvoice: invoiceEnabled ? 1 : 0,
        originalPrice: Math.round(baseAmount),
        // Add invoice fields if needed
      };

      const res: any = await orderService.createOrder(params);
      // 根据用户反馈，数据结构包含 code, msg, data
      // 且 request.ts 返回的是整个响应对象
      
      const data = res.data || res; // 尝试从 res.data 获取，如果直接是 data 则使用 res
      
      if (data && data.codeUrl) {
        // 保留 totalAmount 用于显示
        const info = {
          ...data,
          totalAmount: totalAmount
        };
        setOrderInfo(info);
        setWxPayModalOpen(true);
        startWxPolling(data.outTradeNo);
      } else {
        console.error('Failed to create WeChat order', res);
        // 如果有错误信息，可以在这里显示
        if (res.msg) {
          alert(res.msg);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setPayLoading(false);
    }
  };

  const startWxPolling = (outTradeNo: string) => {
    let attempts = 0;
    pollTimer.current = setInterval(async () => {
      try {
        attempts++;
        if (attempts > 60) { // Timeout after ~5 mins
             stopPolling();
             setPayStatus('failed');
             return;
        }

        const res: any = await orderService.queryOrder({ outTradeNo });
        // queryOrder 可能也返回类似 {code: 200, data: { tradeState: 'SUCCESS', ... }}
        const data = res.data || res;
        
        if (data && (data.tradeState === 'SUCCESS' || data.tradeState === 'REFUND')) {
          stopPolling();
          setPayStatus('success');
          setTimeout(() => {
            setWxPayModalOpen(false);
            // Refresh user info/credits
             useAuthStore.getState().fetchUserInfo();
          }, 2000);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);
  };

  const handleAlipayPayment = async (item: PriceListVO) => {
    try {
      setPayLoading(true);
      stopPolling();

      const baseAmount = item.totalAmount || Number(item.productPrice) * item.productQuantity;
      // USD conversion for Antom/Alipay
      const usdAmount = (baseAmount / 7.3).toFixed(2);

      const params = {
        name: item.productName,
        totalAmount: usdAmount,
        type: 'alipay',
        antomPayType: paymentType,
        userId: user?.userId,
        userName: user?.realName,
        nebulaApiId: user?.nebulaApiId,
        appMenu: item.productType,
        appType: item.id,
        appCount: item.productQuantity,
        productPeriod: item.productPeriod,
        isInvoice: invoiceEnabled ? 1 : 0,
        originalPrice: Math.round(baseAmount),
      };

      const res: any = await orderService.createAntomPaymentSession(params);
      const data = res.data || res;

      if (data && data.normalUrl) {
        window.open(data.normalUrl, '_blank');
        startAlipayPolling(data.paymentRequestId);
      } else {
        console.error('Failed to create Antom payment session', res);
        if (res.msg) {
          alert(res.msg);
        }
      }
    } catch (error) {
      console.error('Alipay error:', error);
    } finally {
      setPayLoading(false);
    }
  };

  const startAlipayPolling = (paymentRequestId: string) => {
    const poll = async () => {
      try {
        const res: any = await orderService.queryAntomPaymentResult(paymentRequestId);
        const data = res.data || res;
        
        if (data.paymentStatus === 'SUCCESS') {
          setPayStatus('success');
          alert('Payment Successful!');
          // Refresh user info
          useAuthStore.getState().fetchUserInfo();
        } else if (data.paymentStatus === 'FAIL') {
          setPayStatus('failed');
        } else {
          // Continue polling
          alipayPollTimer.current = setTimeout(poll, 5000);
        }
      } catch (error) {
        console.error('Alipay polling error:', error);
      }
    };
    poll();
  };

  const handleCloseModal = () => {
    setWxPayModalOpen(false);
    stopPolling();
    setPayStatus('pending');
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
                <select 
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="bg-transparent border border-border rounded-md text-sm px-2 py-1 outline-none focus:border-primary"
                >
                  {paymentOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted">{t.invoice}</span>
                <button 
                  onClick={() => paymentType === 'wechat' && setInvoiceEnabled(!invoiceEnabled)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${invoiceEnabled ? 'bg-primary' : 'bg-secondary/30'} ${paymentType !== 'wechat' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={paymentType !== 'wechat'}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${invoiceEnabled ? 'left-5.5' : 'left-0.5'}`}></div>
                </button>
              </div>
           </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             <div className="col-span-full flex justify-center py-12">
                <Loader2 className="animate-spin text-primary" />
             </div>
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
                  onBuy={() => handlePayment(item)}
                  loading={payLoading}
             labels={t.labels}
                  borderColor={borderColor}
                  btnColor={btnColor}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Wechat Pay Modal */}
      <BaseModal
        isOpen={wxPayModalOpen}
        onClose={handleCloseModal}
        title={payStatus === 'success' ? 'Payment Success' : 'WeChat Pay'}
        width="max-w-md"
      >
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          {payStatus === 'success' ? (
            <div className="flex flex-col items-center text-green-600 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold">Payment Successful!</h3>
              <p className="text-gray-500 mt-2">Thank you for your purchase.</p>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500">Please scan the QR code with WeChat</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ¥{orderInfo ? Number(orderInfo.totalAmount || 0).toFixed(2) : '0.00'} 
                  {/* Note: orderInfo structure might need adjustment if totalAmount is not directly in root, 
                      checking reference again, createOrder returns orderInfo which usually has outTradeNo and codeUrl. 
                      We passed totalAmount in params, but createOrder response might not echo it back unless we modify service/response types.
                      For now assuming it's just the QR code.
                  */}
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                {orderInfo?.codeUrl ? (
                  <QRCodeSVG value={orderInfo.codeUrl} size={200} />
                ) : (
                  <div className="w-[200px] h-[200px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400">
                    Loading...
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 size={16} className="animate-spin" />
                Waiting for payment...
              </div>
            </>
          )}
        </div>
      </BaseModal>
    </div>
  );
};

interface PricingCardProps {
  item: PriceListVO;
  isEnterprise: boolean;
  onQuantityChange: (quantity: number) => void;
  onBuy: () => void;
  loading: boolean;
  labels: any;
  borderColor: string;
  btnColor: string;
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  item, isEnterprise, onQuantityChange, onBuy, loading, labels, borderColor, btnColor 
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
         {!isEnterprise && item.productDescription && (
            <div className="text-xs text-muted/80 whitespace-pre-line">
               {item.productDescription}
            </div>
         )}
         {isEnterprise && (
             <div className="text-xs text-muted/80">
                Contact us for custom solutions
           </div>
         )}
      </div>

      <button 
        onClick={onBuy}
        disabled={loading}
        className={`w-full py-3 rounded-lg ${btnColor} text-white font-bold transition-colors shadow-md relative z-10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed`}
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        {isEnterprise ? labels.contact : labels.buy}
      </button>
    </div>
  );
};

export default PricingPage;
