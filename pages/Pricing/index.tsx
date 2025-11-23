import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { HelpCircle, Check, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { pricingService, PriceListVO } from '../../services/pricingService';
import { orderService, OrderInfo } from '../../services/orderService';
import { useAuthStore } from '../../stores/authStore';
import BaseModal from '../../components/BaseModal';
import InvoiceForm, { InvoiceFormRef } from '../../components/InvoiceForm';
import { UserInvoiceForm } from '../../services/invoiceService';
import toast from 'react-hot-toast';

interface PricingPageProps {}

const PricingPage: React.FC<PricingPageProps> = () => {
  const outletContext = useOutletContext<{ t: any }>();
  const t = outletContext?.t?.pricingPage;
  const { user } = useAuthStore();

  // Hooks must be called unconditionally at the top level
  const [priceList, setPriceList] = useState<PriceListVO[]>([]);
  const [invoiceEnabled, setInvoiceEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Invoice State
  const invoiceFormRef = useRef<InvoiceFormRef>(null);
  const [invoiceFormOpen, setInvoiceFormOpen] = useState(false);
  const [invoiceFormData, setInvoiceFormData] = useState<UserInvoiceForm>({
    invoiceName: '',
    taxNumber: '',
    email: '',
    companyAddress: '',
    companyPhone: '',
    openingBank: '',
    bankAccount: '',
  });
  
  // Payment State
  const [paymentType, setPaymentType] = useState('wechat');
  const [wxPayModalOpen, setWxPayModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false); // 企业定制服务
  const [consultModalOpen, setConsultModalOpen] = useState(false); // 在线咨询
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [payStatus, setPayStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  const pollTimer = useRef<NodeJS.Timeout | null>(null);
  const alipayPollTimer = useRef<NodeJS.Timeout | null>(null);

  // Effects
  useEffect(() => {
    fetchPriceList();
    return () => {
      stopPolling();
    };
  }, []);

  // 监听支付方式变化，非微信支付时自动取消发票选择
  useEffect(() => {
    if (paymentType !== 'wechat' && invoiceEnabled) {
      setInvoiceEnabled(false);
      setInvoiceFormData({
        invoiceName: '',
        taxNumber: '',
        email: '',
        companyAddress: '',
        companyPhone: '',
        openingBank: '',
        bankAccount: '',
      });
      toast('只有微信支付支持开发票，已自动取消发票选择', { icon: 'ℹ️' });
    }
    
    // 当支付方式改变时，重置价格表状态
    // 重置所有价格项的自定义金额和数量，因为不同支付方式的货币单位不同
    setPriceList(prev => prev.map(item => ({
      ...item,
      productQuantity: 1, // 重置为默认数量
      totalAmount: undefined, // 清除自定义金额
    })));
  }, [paymentType]);

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

  const handleCustomAmountChange = (id: number | string, amount: number) => {
    setPriceList(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, totalAmount: amount };
      }
      return item;
    }));
  };

  // 获取最低金额限制
  const getMinAmount = (item: PriceListVO) => {
    if (item.productName === 'Business') {
      return 398; // 人民币
    }
    if (item.productName === 'Starter') {
      return 10; // 人民币
    }
    return 1; // 其他版本的最低金额（人民币）
  };

  const handlePayment = async (item: PriceListVO) => {
    if (!user) {
      // Handle not logged in - maybe redirect to login or show auth modal
      toast.error('Please login first');
      return;
    }

    // Validate custom amount
    if (item.productQuantity === 6) {
      const amount = Number(item.totalAmount);
      if (!amount || amount <= 0) {
        const currency = paymentType === 'wechat' ? '元' : '美元';
        toast.error(`请输入有效的金额（${currency}）`);
        return;
      }
      
      // 检查最低金额限制
      const minAmountRmb = getMinAmount(item);
      const minAmount = paymentType === 'wechat' 
        ? minAmountRmb 
        : Number((minAmountRmb / 7.3).toFixed(2));
      const currency = paymentType === 'wechat' ? '元' : '美元';
      
      if (amount < minAmount) {
        toast.error(`${item.productName}版本最低金额为${minAmount}${currency}`);
        return;
      }
    }

    if (Number(item.productPrice) === 9999) {
        // Contact us logic
        setContactModalOpen(true);
        return;
    }

    // 只有微信支付支持开发票
    if (paymentType !== 'wechat' && invoiceEnabled) {
      toast('只有微信支付支持开发票，请选择微信支付', { icon: '⚠️' });
      return;
    }

    // 微信支付：判断是否开发票，若勾选则验证发票信息
    if (paymentType === 'wechat' && invoiceEnabled) {
      try {
        if (!invoiceFormRef.current) {
          toast.error('发票表单未初始化，请刷新页面重试');
          return;
        }
        await invoiceFormRef.current.validate();
      } catch (error) {
        toast.error('请先填写发票信息');
        setInvoiceFormOpen(true);
        return;
      }
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

      // 计算基础金额（不含税）
      const baseAmount = item.totalAmount || Number(item.productPrice) * item.productQuantity;
      // 传给后端的是原价，后端会根据 isInvoice 自动计算含税价格
      const totalAmount = Number(baseAmount.toFixed(2));

      const params = {
        name: item.productName,
        totalAmount: totalAmount, // 传给后端的是原价（不含税），后端会自动加税
        type: 'wechat',
        userId: user?.userId,
        userName: user?.realName,
        nebulaApiId: user?.nebulaApiId,
        appMenu: item.productType,
        appType: item.id,
        appCount: item.productQuantity,
        productPeriod: item.productPeriod,
        isInvoice: invoiceEnabled ? 1 : 0,
        originalPrice: Math.round(baseAmount), // 原始价格（不含税）
        invoiceName: invoiceEnabled ? invoiceFormData.invoiceName : '',
        taxNumber: invoiceEnabled ? invoiceFormData.taxNumber : '',
        email: invoiceEnabled ? invoiceFormData.email : '',
        companyAddress: invoiceEnabled ? invoiceFormData.companyAddress : '',
        companyPhone: invoiceEnabled ? invoiceFormData.companyPhone : '',
        openingBank: invoiceEnabled ? invoiceFormData.openingBank : '',
        bankAccount: invoiceEnabled ? invoiceFormData.bankAccount : '',
      };

      const res: any = await orderService.createOrder(params);
      // 根据用户反馈，数据结构包含 code, msg, data
      // 且 request.ts 返回的是整个响应对象

      const data = res.data || res; // 尝试从 res.data 获取，如果直接是 data 则使用 res

      if (data && data.codeUrl) {
        // 保存订单信息，显示金额使用原价（不含税）
        const info = {
          ...data,
          totalAmount: totalAmount, // 显示金额（不含税，原价）
          originalAmount: baseAmount, // 原始金额（不含税，用于显示）
        };
        setOrderInfo(info);
        setWxPayModalOpen(true);
        startWxPolling(data.outTradeNo);
      } else {
        console.error('Failed to create WeChat order', res);
        // 如果有错误信息，可以在这里显示
        if (res.msg) {
          toast.error(res.msg);
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

      // 非微信支付时，如果用户输入了自定义金额，那已经是美元了，不需要转换
      // 如果没有自定义金额，需要将人民币价格转换为美元
      let usdAmount: string;
      if (item.productQuantity === 6 && item.totalAmount) {
        // 自定义金额，用户输入的是美元
        usdAmount = Number(item.totalAmount).toFixed(2);
      } else {
        // 非自定义金额，需要将人民币转换为美元
        const baseAmount = Number(item.productPrice) * item.productQuantity;
        usdAmount = (baseAmount / 7.3).toFixed(2);
      }

      // 计算原始价格（人民币），用于后端记录
      const originalPrice = item.productQuantity === 6 && item.totalAmount
        ? Math.round(Number(item.totalAmount) * 7.3) // 美元转人民币
        : Math.round(Number(item.productPrice) * item.productQuantity);

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
        originalPrice: originalPrice,
        invoiceName: invoiceEnabled ? invoiceFormData.invoiceName : '',
        taxNumber: invoiceEnabled ? invoiceFormData.taxNumber : '',
        email: invoiceEnabled ? invoiceFormData.email : '',
        companyAddress: invoiceEnabled ? invoiceFormData.companyAddress : '',
        companyPhone: invoiceEnabled ? invoiceFormData.companyPhone : '',
        openingBank: invoiceEnabled ? invoiceFormData.openingBank : '',
        bankAccount: invoiceEnabled ? invoiceFormData.bankAccount : '',
      };

      const res: any = await orderService.createAntomPaymentSession(params);
      const data = res.data || res;

      if (data && data.normalUrl) {
        window.open(data.normalUrl, '_blank');
        startAlipayPolling(data.paymentRequestId);
      } else {
        console.error('Failed to create Antom payment session', res);
        if (res.msg) {
          toast.error(res.msg);
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
          toast.success('Payment Successful!');
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

  // Early return if t is missing, AFTER all hooks are called
  if (!t) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-muted" size={24} />
      </div>
    );
  }

  const paymentOptions = [
    { value: 'wechat', label: t.wechatPay || '微信支付', color: '#00c300' },
    { value: 'Alipay', label: '支付宝支付', color: '#1677ff' },
    { value: 'AlipayHK', label: 'AlipayHK', color: '#1677ff' },
    { value: 'BillEase', label: 'BillEase', color: '#722ed1' },
    { value: 'Boost', label: 'Boost', color: '#52c41a' },
    { value: 'BPI', label: 'BPI', color: '#1890ff' },
    { value: 'GCash', label: 'GCash', color: '#fa8c16' },
    { value: 'Kredivo', label: 'Kredivo', color: '#eb2f96' },
    { value: 'LINE Pay', label: 'Rabbit LINE Pay', color: '#00c300' },
    { value: "Touch'n Go eWallet", label: "Touch'n Go eWallet", color: '#13c2c2' },
  ];

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
             {/* <a href="#" className="text-xs text-primary hover:underline flex items-center gap-1">
               <HelpCircle size={12} />
               {t.questions}
             </a> */}
             <a 
               href="javascript:void(0)"
               onClick={(e) => {
                 e.preventDefault();
                 setConsultModalOpen(true);
               }}
               className="text-sm text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer"
             >
               如对充值有疑问？请点击此处
             </a>
           </div>
           
           <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted">{t.paymentMethod}</span>
                <div className="relative">
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="bg-background border border-border rounded-md text-sm px-3 py-2 pr-8 outline-none focus:border-primary appearance-none cursor-pointer min-w-[200px]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.5rem center',
                      paddingRight: '2rem',
                    }}
                  >
                    {paymentOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted">{t.invoice}</span>
                <button 
                  onClick={() => {
                    if (paymentType !== 'wechat') {
                      return; // 非微信支付时直接返回
                    }
                    const newEnabled = !invoiceEnabled;
                    setInvoiceEnabled(newEnabled);
                    if (newEnabled && (!invoiceFormData.invoiceName || !invoiceFormData.taxNumber || !invoiceFormData.email)) {
                      // 如果启用发票但信息不完整，打开表单
                      setTimeout(() => {
                        setInvoiceFormOpen(true);
                      }, 100); // 延迟一点，让开关动画完成
                    } else if (!newEnabled) {
                      // 关闭开关时，清空发票数据
                      setInvoiceFormData({
                        invoiceName: '',
                        taxNumber: '',
                        email: '',
                        companyAddress: '',
                        companyPhone: '',
                        openingBank: '',
                        bankAccount: '',
                      });
                    }
                  }}
                  className={`w-10 h-5 rounded-full relative transition-colors ${
                    invoiceEnabled ? 'bg-primary' : 'bg-secondary/30'
                  } ${
                    paymentType !== 'wechat' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  disabled={paymentType !== 'wechat'}
                  type="button"
                >
                  <div 
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      invoiceEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
                {invoiceEnabled && paymentType === 'wechat' && (
                  <button
                    onClick={() => setInvoiceFormOpen(true)}
                    className="text-xs text-primary hover:underline cursor-pointer"
                    type="button"
                  >
                    填写发票信息
                  </button>
                )}
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
                borderColor = 'border-indigo-400 dark:border-indigo-600';
                btnColor = 'bg-indigo-600 hover:bg-indigo-700';
              } else if (isFree) {
                borderColor = 'border-green-200 dark:border-green-800';
                btnColor = 'bg-green-600 hover:bg-green-700';
              } else if (item.productName === 'Business') {
                borderColor = 'border-indigo-200 dark:border-indigo-800';
                btnColor = 'bg-indigo-600 hover:bg-indigo-700';
              }

              return (
          <PricingCard 
                  key={item.id}
                  item={item}
                  isEnterprise={isEnterprise}
                  paymentType={paymentType}
                  invoiceEnabled={invoiceEnabled}
                  onQuantityChange={(q) => handleQuantityChange(item.id, q)}
                  onCustomAmountChange={(amount) => handleCustomAmountChange(item.id, amount)}
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
        title={payStatus === 'success' ? '支付成功' : '扫码支付'}
        width="max-w-md"
      >
        <div className="flex flex-col items-center justify-center py-6 space-y-6">
          {payStatus === 'success' ? (
            <div className="flex flex-col items-center text-green-600 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold">支付成功！</h3>
              <p className="text-gray-500 mt-2">感谢您的购买</p>
            </div>
          ) : (
            <>
              {/* 支付金额显示 */}
              <div className="text-center space-y-2 w-full">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">支付金额</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  ¥{orderInfo ? Number(orderInfo.originalAmount || orderInfo.totalAmount || 0).toFixed(2) : '0.00'}
                </div>
              </div>

              {/* 二维码区域 */}
              <div className="relative w-full flex justify-center">
                {orderInfo?.codeUrl ? (
                  <div className="relative inline-block">
                    {/* 二维码容器 */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative">
                      <QRCodeSVG value={orderInfo.codeUrl} size={180} />
                      {/* 四个角的装饰框 - 在二维码容器内部 */}
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg pointer-events-none"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg pointer-events-none"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg pointer-events-none"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg pointer-events-none"></div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <div className="w-[180px] h-[180px] flex flex-col items-center justify-center space-y-3">
                      <Loader2 size={32} className="animate-spin text-primary" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          正在生成支付二维码
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          请稍候...
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 支付说明步骤 */}
              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center font-medium text-xs">
                    1
                  </div>
                  <span>打开微信扫一扫</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center font-medium text-xs">
                    2
                  </div>
                  <span>扫描上方二维码</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center font-medium text-xs">
                    3
                  </div>
                  <span>确认支付完成购买</span>
                </div>
              </div>

              {/* 支付提示 */}
              <div className="w-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 flex items-start gap-2">
                <span className="text-lg">💡</span>
                <p className="text-xs text-orange-800 dark:text-orange-200 flex-1">
                  支付完成后将自动关闭此窗口，请勿重复支付
                </p>
              </div>
            </>
          )}
        </div>
      </BaseModal>

      {/* 在线咨询 Modal */}
      <BaseModal
        isOpen={consultModalOpen}
        onClose={() => setConsultModalOpen(false)}
        title="在线咨询"
        width="max-w-sm"
      >
         <div className="flex flex-col items-center justify-center py-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">联系我们</h3>
            <p className="text-sm text-gray-500 mb-6">扫描下方二维码，立即咨询</p>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
               <img 
                 src="/lab/zhenshangWxCode.png" 
                 alt="微信联系方式" 
                 className="w-[200px] h-[200px] object-contain"
               />
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p>工作时间：周一至周五 9:00-18:00</p>
              <p>我们将为您提供专业的服务支持</p>
            </div>
         </div>
      </BaseModal>

      {/* 企业定制服务 Modal */}
      <BaseModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        title="企业定制服务"
        width="max-w-2xl"
      >
         <div className="py-2">
            {/* 副标题 */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                为您提供专业的AI解决方案
              </p>
            </div>

            {/* 联系内容 */}
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              {/* 联系信息 */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-2xl flex-shrink-0">📱</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">联系电话</div>
                    <div className="text-base font-medium text-gray-900 dark:text-white">18890659150</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-2xl flex-shrink-0">⏰</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">服务时间</div>
                    <div className="text-base font-medium text-gray-900 dark:text-white">工作日 9:00-18:00</div>
                  </div>
                </div>
              </div>

              {/* 微信联系 */}
              <div className="flex-shrink-0 text-center">
                <div className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  微信联系
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-3">
                  <img 
                    src="/lab/zhenshangWxCode.png" 
                    alt="微信联系方式" 
                    className="w-[200px] h-[200px] object-contain mx-auto"
                  />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  扫码添加企业微信
                </div>
              </div>
            </div>

            {/* 功能标签 */}
            <div className="flex justify-center gap-3 flex-wrap">
              <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-900/20 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-medium text-blue-700 dark:text-blue-400">
                🎯 定制化方案
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-900/20 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-medium text-blue-700 dark:text-blue-400">
                🔧 技术支持
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-900/20 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-medium text-blue-700 dark:text-blue-400">
                📊 数据分析
              </div>
            </div>
         </div>
      </BaseModal>

      {/* Invoice Form Modal */}
      <InvoiceForm
        ref={invoiceFormRef}
        isOpen={invoiceFormOpen}
        onClose={() => setInvoiceFormOpen(false)}
        initialData={invoiceFormData}
        onSubmit={(data) => {
          setInvoiceFormData(data);
          toast.success('发票信息已保存');
          setInvoiceFormOpen(false);
        }}
      />
    </div>
  );
};

interface PricingCardProps {
  item: PriceListVO;
  isEnterprise: boolean;
  paymentType: string;
  invoiceEnabled: boolean;
  onQuantityChange: (quantity: number) => void;
  onCustomAmountChange: (amount: number) => void;
  onBuy: () => void;
  loading: boolean;
  labels: any;
  borderColor: string;
  btnColor: string;
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  item, isEnterprise, paymentType, invoiceEnabled, onQuantityChange, onCustomAmountChange, onBuy, loading, labels, borderColor, btnColor 
}) => {
  const steps = [1, 2, 3, 4, 5, 6]; // 6 is Custom
  const price = Number(item.productPrice);
  const quantity = item.productQuantity || 1;
  const isCustom = quantity === 6;
  const isWechat = paymentType === 'wechat';
  const currencyUnit = isWechat ? '￥' : '$';
  const exchangeRate = 7.3; // 人民币对美元汇率
  
  // Calculate points and price
  let totalPrice = price * quantity;
  let totalPoints = Number(item.productScore) * quantity;

  if (isCustom) {
    const customAmount = Number(item.totalAmount) || 0;
    // 如果是自定义金额且非微信支付，用户输入的是美元，需要转换为人民币来计算积分
    const actualAmount = (isCustom && !isWechat && customAmount) ? customAmount * exchangeRate : customAmount;
    totalPrice = customAmount; // 显示用户输入的金额（始终显示原价，不含税）
    
    // 计算积分：根据产品类型确定积分比例
    let pointsRatio = 2; // 默认比例
    if (item.productName === 'Starter') {
      pointsRatio = 1.72;
    } else if (item.productName === 'Business') {
      pointsRatio = 1.592;
    }
    
    // 计算积分
    if (!isWechat) {
      // 非微信支付：先将美元转换为人民币，计算积分，再转换回美元显示
      const rmbAmount = actualAmount;
      totalPoints = Number((rmbAmount / pointsRatio / exchangeRate).toFixed(2));
    } else {
      // 微信支付：直接用人民币计算积分
      totalPoints = Number((actualAmount / pointsRatio).toFixed(2));
    }
  } else {
    // 非自定义金额：根据支付方式转换价格显示
    if (!isWechat) {
      // 非微信支付：将人民币价格转换为美元显示
      totalPrice = Number((totalPrice / exchangeRate).toFixed(2));
      
      // 计算积分：先将美元转换为人民币，计算积分，再转换回美元显示
      const rmbAmount = price * quantity;
      let pointsRatio = 2;
      if (item.productName === 'Starter') {
        pointsRatio = 1.72;
      } else if (item.productName === 'Business') {
        pointsRatio = 1.592;
      }
      totalPoints = Number((rmbAmount / pointsRatio / exchangeRate).toFixed(2));
    } else {
      // 微信支付：保持人民币价格（始终显示原价，不含税）
      // 积分基于原始价格计算
      let pointsRatio = 2;
      if (item.productName === 'Starter') {
        pointsRatio = 1.72;
      } else if (item.productName === 'Business') {
        pointsRatio = 1.592;
      }
      totalPoints = Number((totalPrice / pointsRatio).toFixed(2));
    }
  }

  return (
    <div className={`bg-background border ${borderColor} rounded-2xl p-6 md:p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow ${isEnterprise ? 'relative overflow-hidden' : ''}`}>
      
      <div className="text-center mb-2 relative z-10">
        <h3 className="text-xl font-bold text-foreground">{isEnterprise ? 'Enterprise' : item.productName}</h3>
        {/* {isEnterprise && <div className="text-sm text-muted mt-1">{item.productDescription}</div>} */}
      </div>

      <div className="text-center mb-2 relative z-10">
        <div className="text-4xl font-bold text-primary h-16 flex items-center justify-center">
          {isEnterprise ? "Let's talk!" : (
             isCustom ? (
               <div className="flex items-center justify-center">
                 <span className="text-2xl mr-1">{currencyUnit}</span>
                 <style>
                   {`
                     input[type=number]::-webkit-inner-spin-button, 
                     input[type=number]::-webkit-outer-spin-button { 
                       -webkit-appearance: none; 
                       margin: 0; 
                     }
                     input[type=number] {
                       -moz-appearance: textfield;
                     }
                   `}
                 </style>
                 <input 
                   type="number" 
                   className="w-32 text-4xl font-bold text-primary bg-transparent border-b-2 border-primary/30 focus:border-primary outline-none text-center appearance-none"
                   value={item.totalAmount || ''}
                   placeholder="0"
                   onChange={(e) => onCustomAmountChange(Number(e.target.value))}
                   min="1"
                   step={isWechat ? 50 : 10}
                 />
               </div>
             ) : (
               `${currencyUnit} ${totalPrice.toFixed(2)}`
             )
          )}
        </div>
        {!isEnterprise && (
        <div className="text-sm text-muted mt-1">
            {labels.credits} {totalPoints.toFixed(2)}
            <span className="text-xs ml-1 opacity-70">
              ({isWechat ? 'CNY' : 'USD'})
            </span>
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
            
            {/* Progress - 6个步骤：1, 2, 3, 4, 5, 自定义 */}
            <div 
              className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-300"
              style={{ width: `${((quantity - 1) / 5) * 100}%` }}
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

      <div className="flex-1 space-y-3 mb-8 relative z-10">
         {!isEnterprise && item.productDescription && (
            <div className="text-xs text-muted/80 whitespace-pre-line text-center">
               {item.productDescription}
            </div>
         )}
         {isEnterprise && (
            <ul className="space-y-2.5 text-left">
              <li className="text-sm text-foreground/90 dark:text-foreground/80 flex items-center">
                <span className="text-green-500 dark:text-green-400 mr-3 text-base font-bold">✓</span>
                自定义团队席位
              </li>
              <li className="text-sm text-foreground/90 dark:text-foreground/80 flex items-center">
                <span className="text-green-500 dark:text-green-400 mr-3 text-base font-bold">✓</span>
                自定义积分额度
              </li>
              <li className="text-sm text-foreground/90 dark:text-foreground/80 flex items-center">
                <span className="text-green-500 dark:text-green-400 mr-3 text-base font-bold">✓</span>
                自定义数字人
              </li>
              <li className="text-sm text-foreground/90 dark:text-foreground/80 flex items-center">
                <span className="text-green-500 dark:text-green-400 mr-3 text-base font-bold">✓</span>
                自定义AI音色
              </li>
              <li className="text-sm text-foreground/90 dark:text-foreground/80 flex items-center">
                <span className="text-green-500 dark:text-green-400 mr-3 text-base font-bold">✓</span>
                自定义功能
              </li>
              <li className="text-sm text-foreground/90 dark:text-foreground/80 flex items-center">
                <span className="text-green-500 dark:text-green-400 mr-3 text-base font-bold">✓</span>
                定制化功能开发
              </li>
            </ul>
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