import React, { useState, useEffect, useRef } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { pricingService, PriceListVO } from '../../services/pricingService';
import { orderService, OrderInfo } from '../../services/orderService';
import { useAuthStore } from '../../stores/authStore';
import BaseModal from '../../components/BaseModal';
import InvoiceForm, { InvoiceFormRef } from '../../components/InvoiceForm';
import EnterpriseContactModal from '../../components/EnterpriseContactModal';
import { UserInvoiceForm } from '../../services/invoiceService';
import toast from 'react-hot-toast';
import { translations } from '../../translations';
import { CURRENT_SYSTEM, SYSTEM_TYPE } from '../../constants';
import PricingCard from './components/PricingCard';
import ModelCenterCard from './components/ModelCenterCard';
import { useAppOutletContext } from '../../router/context';

interface PricingPageProps {}

const PricingPage: React.FC<PricingPageProps> = () => {
  const { t: rootT } = useAppOutletContext();
  const defaultPricingT = translations['zh'].pricingPage;
  const t = rootT?.pricingPage || defaultPricingT;
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
      toast(t.errors?.invoiceAutoDisabled || '只有微信支付支持开发票，已自动取消发票选择', { icon: 'ℹ️' });
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
      toast.error(t.errors?.loginRequired || 'Please login first');
      return;
    }

    // Validate custom amount
    if (item.productQuantity === 6) {
      const amount = Number(item.totalAmount);
      if (!amount || amount <= 0) {
        const currency = paymentType === 'wechat' ? (t.currency?.yuan || '元') : (t.currency?.dollar || '美元');
        const errorMsg = (t.errors?.invalidAmount || '请输入有效的金额（{currency}）').replace('{currency}', currency);
        toast.error(errorMsg);
        return;
      }
      
      // MODEL_CENTER 模式下不检查最低金额限制（由 ModelCenterCard 组件自行控制）
      if (CURRENT_SYSTEM !== SYSTEM_TYPE.MODEL_CENTER) {
        // 检查最低金额限制
        const minAmountRmb = getMinAmount(item);
        const minAmount = paymentType === 'wechat' 
          ? minAmountRmb 
          : Number((minAmountRmb / 7.3).toFixed(2));
        const currency = paymentType === 'wechat' ? (t.currency?.yuan || '元') : (t.currency?.dollar || '美元');
        
        if (amount < minAmount) {
          const errorMsg = (t.errors?.minAmountRequired || '{productName}版本最低金额为{amount}{currency}')
            .replace('{productName}', item.productName)
            .replace('{amount}', minAmount.toString())
            .replace('{currency}', currency);
          toast.error(errorMsg);
          return;
        }
      }
    }

    if (Number(item.productPrice) === 9999) {
        // Contact us logic
        setContactModalOpen(true);
        return;
    }

    // 只有微信支付支持开发票
    if (paymentType !== 'wechat' && invoiceEnabled) {
      toast(t.errors?.invoiceOnlyWechat || '只有微信支付支持开发票，请选择微信支付', { icon: '⚠️' });
      return;
    }

    // 微信支付：判断是否开发票，若勾选则验证发票信息
    if (paymentType === 'wechat' && invoiceEnabled) {
      try {
        if (!invoiceFormRef.current) {
          toast.error(t.errors?.invoiceFormNotInitialized || '发票表单未初始化，请刷新页面重试');
          return;
        }
        await invoiceFormRef.current.validate();
      } catch (error) {
        toast.error(t.errors?.invoiceInfoRequired || '请先填写发票信息');
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
    { value: 'Alipay', label: t.paymentOptions?.alipay || '支付宝支付', color: '#1677ff' },
    { value: 'AlipayHK', label: t.paymentOptions?.alipayHK || 'AlipayHK', color: '#1677ff' },
    { value: 'BillEase', label: t.paymentOptions?.billEase || 'BillEase', color: '#722ed1' },
    { value: 'Boost', label: t.paymentOptions?.boost || 'Boost', color: '#52c41a' },
    { value: 'BPI', label: t.paymentOptions?.bpi || 'BPI', color: '#1890ff' },
    { value: 'GCash', label: t.paymentOptions?.gcash || 'GCash', color: '#fa8c16' },
    { value: 'Kredivo', label: t.paymentOptions?.kredivo || 'Kredivo', color: '#eb2f96' },
    { value: 'LINE Pay', label: t.paymentOptions?.linePay || 'Rabbit LINE Pay', color: '#00c300' },
    { value: "Touch'n Go eWallet", label: t.paymentOptions?.touchNGo || "Touch'n Go eWallet", color: '#13c2c2' },
  ];

  return (
    <div className="bg-surface/30 pb-12 font-sans">
      <div className="container mx-auto px-4 max-w-6xl pt-2">
        
        {/* Configuration Bar */}
        <div className="bg-background rounded-xl shadow-sm border border-border p-4 mb-4  mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-4">
             {/* <h2 className="font-bold text-lg text-foreground">{t.paymentCycle}</h2> */}
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
               {t.questions}
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
                    {t.invoiceForm?.fillInvoiceInfo || '填写发票信息'}
                  </button>
                )}
              </div>
           </div>
        </div>

        {/* Pricing Cards */}
        <div className={`grid grid-cols-1 ${CURRENT_SYSTEM === SYSTEM_TYPE.MODEL_CENTER ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
          {loading ? (
             <div className="col-span-full flex justify-center py-12">
                <Loader2 className="animate-spin text-primary" />
             </div>
          ) : CURRENT_SYSTEM === SYSTEM_TYPE.MODEL_CENTER ? (
            // MODEL_CENTER 模式：显示充值卡片和企业版
            <>
              {/* 找一个 Business 类型的 item 用于充值卡片 */}
              {priceList.filter(item => item.productName === 'Business').slice(0, 1).map((item) => (
                <ModelCenterCard
                  key={`model-center-${item.id}`}
                  item={{
                    ...item,
                    productQuantity: 6, // 强制使用自定义金额模式
                  }}
                  paymentType={paymentType}
                  invoiceEnabled={invoiceEnabled}
                  onCustomAmountChange={(amount) => handleCustomAmountChange(item.id, amount)}
                  onBuy={() => handlePayment({
                    ...item,
                    productQuantity: 6,
                    totalAmount: item.totalAmount,
                  })}
                  loading={payLoading}
                  labels={t.labels}
                  t={t}
                />
              ))}
              {/* Enterprise 卡片 */}
              {priceList.filter(item => Number(item.productPrice) === 9999).map((item) => (
                <PricingCard 
                  key={item.id}
                  item={item}
                  isEnterprise={true}
                  paymentType={paymentType}
                  invoiceEnabled={invoiceEnabled}
                  onQuantityChange={(q) => handleQuantityChange(item.id, q)}
                  onCustomAmountChange={(amount) => handleCustomAmountChange(item.id, amount)}
                  onBuy={() => handlePayment(item)}
                  loading={payLoading}
                  labels={t.labels}
                  t={t}
                  borderColor="border-indigo-400 dark:border-indigo-600"
                  btnColor="bg-indigo-600 hover:bg-indigo-700"
                />
              ))}
            </>
          ) : (
            // 其他模式：显示所有卡片
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
                  t={t}
                  borderColor={borderColor}
                  btnColor={btnColor}
                />
              );
            })
          )}
        </div>

        {/* 服务优势 和 需要帮助 */}
        <div className="mt-4 pt-2 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-16">
            {/* 服务优势 */}
            <div className="flex-1">
              <h4 className="text-xl font-semibold text-foreground mb-4">
                {t.serviceAdvantages?.title || '服务优势'}
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 whitespace-nowrap">
                  {t.serviceAdvantages?.aiCreation || '✨ AI智能创作'}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 whitespace-nowrap">
                  {t.serviceAdvantages?.efficientContent || '🚀 高效内容生成'}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 whitespace-nowrap">
                  {t.serviceAdvantages?.techSupport || '💎 专业技术支持'}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 whitespace-nowrap">
                  {t.serviceAdvantages?.dataSecurity || '🔒 数据安全保障'}
                </span>
              </div>
            </div>

            {/* 需要帮助 */}
            <div className="flex-shrink-0 text-center">
              <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                {t.needHelp?.title || '需要帮助？'}
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t.needHelp?.callPhone || '请拨打电话：'}<a 
                  href="tel:19210015325" 
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  19210015325
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wechat Pay Modal */}
      <BaseModal
        isOpen={wxPayModalOpen}
        onClose={handleCloseModal}
        title={payStatus === 'success' ? t.wechatPayModal?.paySuccess : t.wechatPayModal?.scanToPay || '扫码支付'}
        width="max-w-md"
      >
        <div className="flex flex-col items-center justify-center py-6 space-y-6">
          {payStatus === 'success' ? (
            <div className="flex flex-col items-center text-green-600 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold">{t.wechatPayModal?.paySuccess || '支付成功！'}</h3>
              <p className="text-gray-500 mt-2">{t.wechatPayModal?.thankYou || '感谢您的购买'}</p>
            </div>
          ) : (
            <>
              {/* 支付金额显示 */}
              <div className="text-center space-y-2 w-full mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.wechatPayModal?.payAmount || '支付金额'}</div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ¥{orderInfo ? Number(orderInfo.originalAmount || orderInfo.totalAmount || 0).toFixed(2) : '0.00'}
                </div>
              </div>

              {/* 发票信息显示 - 如果勾选了发票 */}
              {invoiceEnabled && invoiceFormData.invoiceName && (
                <div className="w-full mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {t.wechatPayModal?.invoiceInfo || '发票信息'}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex">
                      <span className="text-gray-600 dark:text-gray-400 w-20 flex-shrink-0">{t.invoiceFields?.name || '名称:'}</span>
                      <span className="text-gray-900 dark:text-white flex-1">{invoiceFormData.invoiceName || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 dark:text-gray-400 w-20 flex-shrink-0">{t.invoiceFields?.taxNumber || '税号:'}</span>
                      <span className="text-gray-900 dark:text-white flex-1">{invoiceFormData.taxNumber || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 dark:text-gray-400 w-20 flex-shrink-0">{t.invoiceFields?.email || '邮箱:'}</span>
                      <span className="text-gray-900 dark:text-white flex-1">{invoiceFormData.email || '-'}</span>
                    </div>
                    {invoiceFormData.companyAddress && (
                      <div className="flex">
                        <span className="text-gray-600 dark:text-gray-400 w-20 flex-shrink-0">{t.invoiceFields?.companyAddress || '单位地址:'}</span>
                        <span className="text-gray-900 dark:text-white flex-1">{invoiceFormData.companyAddress}</span>
                      </div>
                    )}
                    {invoiceFormData.companyPhone && (
                      <div className="flex">
                        <span className="text-gray-600 dark:text-gray-400 w-20 flex-shrink-0">{t.invoiceFields?.companyPhone || '电话号码:'}</span>
                        <span className="text-gray-900 dark:text-white flex-1">{invoiceFormData.companyPhone}</span>
                      </div>
                    )}
                    {invoiceFormData.openingBank && (
                      <div className="flex">
                        <span className="text-gray-600 dark:text-gray-400 w-20 flex-shrink-0">{t.invoiceFields?.openingBank || '开户银行:'}</span>
                        <span className="text-gray-900 dark:text-white flex-1">{invoiceFormData.openingBank}</span>
                      </div>
                    )}
                    {invoiceFormData.bankAccount && (
                      <div className="flex">
                        <span className="text-gray-600 dark:text-gray-400 w-20 flex-shrink-0">{t.invoiceFields?.bankAccount || '银行账户:'}</span>
                        <span className="text-gray-900 dark:text-white flex-1">{invoiceFormData.bankAccount}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                          {t.wechatPayModal?.generatingQR || '正在生成支付二维码'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {t.wechatPayModal?.pleaseWait || '请稍候...'}
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
                  <span>{t.wechatPayModal?.step1 || '打开微信扫一扫'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center font-medium text-xs">
                    2
                  </div>
                  <span>{t.wechatPayModal?.step2 || '扫描上方二维码'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center font-medium text-xs">
                    3
                  </div>
                  <span>{t.wechatPayModal?.step3 || '确认支付完成购买'}</span>
                </div>
              </div>

              {/* 支付提示 */}
              <div className="w-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 flex items-start gap-2">
                <span className="text-lg">💡</span>
                <p className="text-xs text-orange-800 dark:text-orange-200 flex-1">
                  {t.wechatPayModal?.tip || '支付完成后将自动关闭此窗口，请勿重复支付'}
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
        title={t.consultModal?.title || '在线咨询'}
        width="max-w-sm"
      >
         <div className="flex flex-col items-center justify-center py-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t.consultModal?.contactUs || '联系我们'}</h3>
            <p className="text-sm text-gray-500 mb-6">{t.consultModal?.scanQR || '扫描下方二维码，立即咨询'}</p>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
               <img 
                 src="/lab//zhenshangWxCode.png" 
                 alt="微信联系方式" 
                 className="w-[200px] h-[200px] object-contain"
               />
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p>{t.consultModal?.workTime || '工作时间：周一至周五 9:00-18:00'}</p>
              <p>{t.consultModal?.serviceSupport || '我们将为您提供专业的服务支持'}</p>
            </div>
         </div>
      </BaseModal>

      {/* 企业定制服务 Modal */}
      <EnterpriseContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        translations={t.enterpriseModal}
      />

      {/* Invoice Form Modal */}
      <InvoiceForm
        ref={invoiceFormRef}
        isOpen={invoiceFormOpen}
        onClose={() => setInvoiceFormOpen(false)}
        initialData={invoiceFormData}
        translations={t.invoiceForm}
        onSubmit={(data) => {
          setInvoiceFormData(data);
          toast.success(t.errors?.invoiceInfoSaved || '发票信息已保存');
          setInvoiceFormOpen(false);
        }}
      />
    </div>
  );
};

export default PricingPage;