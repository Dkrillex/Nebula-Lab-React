import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { HelpCircle, Check, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { pricingService, PriceListVO } from '../../services/pricingService';
import { orderService, OrderInfo } from '../../services/orderService';
import { useAuthStore } from '../../stores/authStore';
import BaseModal from '../../components/BaseModal';
import InvoiceForm, { UserInvoiceForm, InvoiceFormRef } from '../../components/InvoiceForm';
import toast from 'react-hot-toast';

interface PricingPageProps {}

const PricingPage: React.FC<PricingPageProps> = () => {
  const outletContext = useOutletContext<{ t: any }>();
  const t = outletContext?.t?.pricingPage;
  const { user } = useAuthStore();

  // Hooks must be called unconditionally at the top level
  const [priceList, setPriceList] = useState<PriceListVO[]>([]);
  const [invoiceEnabled, setInvoiceEnabled] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState<UserInvoiceForm>({
    invoiceName: '',
    taxNumber: '',
    email: '',
    companyAddress: '',
    companyPhone: '',
    openingBank: '',
    bankAccount: '',
  });
  const [loading, setLoading] = useState(true);
  
  // Payment State
  const [paymentType, setPaymentType] = useState('wechat');
  const [wxPayModalOpen, setWxPayModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [payStatus, setPayStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [totalAmount, setTotalAmount] = useState(0);

  const pollTimer = useRef<NodeJS.Timeout | null>(null);
  const alipayPollTimer = useRef<NodeJS.Timeout | null>(null);
  const invoiceFormRef = useRef<InvoiceFormRef>(null);
  const originalBaseAmount = useRef(0);

  // Effects
  useEffect(() => {
    fetchPriceList();
    return () => {
      stopPolling();
    };
  }, []);

  // 监听支付方式变化，非微信支付时自动取消发票选择，并更新自定义金额的默认值
  useEffect(() => {
    if (paymentType !== 'wechat' && invoiceEnabled) {
      setInvoiceEnabled(false);
      toast('只有微信支付支持开发票，已自动取消发票选择', { icon: 'ℹ️' });
    }
    
    // 如果当前有自定义金额的套餐，更新其默认值为最低金额
    setPriceList(prev => prev.map(item => {
      if (item.productQuantity === 6) {
        const minAmount = getMinAmount(item);
        const actualMinAmount = paymentType === 'wechat' 
          ? minAmount 
          : Number((minAmount / 7.3).toFixed(2));
        // 如果当前金额小于新的最低金额，则更新为最低金额
        if (!item.totalAmount || item.totalAmount < actualMinAmount) {
          return { ...item, totalAmount: actualMinAmount };
        }
      }
      return item;
    }));
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

  const handleQuantityChange = (id: number | string, quantity: number, item?: PriceListVO) => {
    setPriceList(prev => prev.map(priceItem => {
      if (priceItem.id === id) {
        const updated = { ...priceItem, productQuantity: quantity };
        if (quantity !== 6) {
          updated.totalAmount = Number(priceItem.productPrice) * quantity;
        } else {
          // 选择自定义时，设置默认值为最低金额
          const minAmount = getMinAmount(priceItem);
          const actualMinAmount = paymentType === 'wechat' 
            ? minAmount 
            : Number((minAmount / 7.3).toFixed(2));
          updated.totalAmount = actualMinAmount;
        }
        return updated;
      }
      return priceItem;
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
      return 398;
    }
    if (item.productName === 'Starter') {
      return 10;
    }
    return 1; // 其他版本的最低金额
  };

  // 计算积分
  const calculatePoints = (item: PriceListVO, paymentType: string): number => {
    let actualAmount = item.totalAmount || (Number(item.productPrice) * item.productQuantity);
    
    // 当是自定义数据的时候如果是美金输入的item.totalAmount按美金的值换算成人民币
    if (item.productQuantity === 6 && paymentType !== 'wechat') {
      actualAmount = (item.totalAmount || 0) * 7.3;
    }

    // 如果是支付宝支付（美金），需要将美金转换为人民币来计算积分
    if (paymentType !== 'wechat') {
      actualAmount = actualAmount * 7.3;
    }

    let pointsRatio = 2;
    if (item.productName === 'Starter') {
      pointsRatio = 1.72;
    }
    if (item.productName === 'Business') {
      pointsRatio = 1.592;
    }

    let points;
    if (paymentType !== 'wechat') {
      points = (actualAmount / pointsRatio / 7.3).toFixed(2);
    } else {
      points = (actualAmount / pointsRatio).toFixed(2);
    }

    return Number(points);
  };

  // 获取价格显示文本
  const getPriceText = (item: PriceListVO, paymentType: string): string => {
    const price = Number(item.productPrice);
    if (price === 9999) return "Let's talk!";
    if (price === 0) return '免费';

    const unit = paymentType === 'wechat' ? '￥' : '$';
    let baseAmount = item.totalAmount || (price * item.productQuantity);

    // 支付宝支付不支持开发票
    if (paymentType !== 'wechat' && invoiceEnabled) {
      const res = item.totalAmount || price;
      return `${unit}${(res / 7.3).toFixed(2)}`;
    }

    // 微信支付：开票不加税点（根据Vue代码，实际不加税）
    if (paymentType === 'wechat') {
      if (item.totalAmount) {
        return `${unit}${item.totalAmount}`;
      } else {
        return `${unit}${price}`;
      }
    }

    // 支付宝支付（不开票）
    const res = item.totalAmount || price;
    return `${unit}${(res / 7.3).toFixed(2)}`;
  };

  const handlePayment = async (item: PriceListVO) => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    if (Number(item.productPrice) === 9999) {
      setContactModalOpen(true);
      return;
    }

    // 自定义金额验证
    if (item.productQuantity === 6) {
      if (!item.totalAmount) {
        toast.error('请先输入自定义金额');
        return;
      }
      // 确保金额为整数
      if (!Number.isInteger(Number(item.totalAmount))) {
        toast.error('金额必须为整数');
        return;
      }
      // 检查最低金额限制
      const minAmount = getMinAmount(item);
      const currency = paymentType === 'wechat' ? '元' : '美元';
      const actualMinAmount =
        paymentType === 'wechat'
          ? minAmount
          : Number((minAmount / 7.3).toFixed(2));

      if (Number(item.totalAmount) < actualMinAmount) {
        toast.error(
          `${item.productName}版本最低金额为${actualMinAmount}${currency}`,
        );
        return;
      }
    }

    // 只有微信支付支持开发票
    if (paymentType !== 'wechat' && invoiceEnabled) {
      toast('只有微信支付支持开发票，请选择微信支付', { icon: '⚠️' });
      return;
    }

    // 微信支付：判断是否开发票，需要验证发票信息
    if (paymentType === 'wechat' && invoiceEnabled) {
      try {
        await invoiceFormRef.current?.validate();
      } catch {
        toast.error('请先填写发票信息');
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

      let baseAmount = item.totalAmount || (Number(item.productPrice) * item.productQuantity);
      originalBaseAmount.current = Math.round(baseAmount);

      // 判断是否开发票，若勾选则加6%（但根据Vue代码实际不加）
      if (invoiceEnabled) {
        try {
          await invoiceFormRef.current?.validate();
          originalBaseAmount.current = Math.round(baseAmount);
          baseAmount = Number((baseAmount).toFixed(2));
        } catch {
          toast.error('请先填写发票信息');
          return;
        }
      }

      setTotalAmount(baseAmount);

      const params = {
        name: item.productName,
        totalAmount: baseAmount,
        type: 'wechat',
        userId: user?.userId,
        userName: user?.realName,
        nebulaApiId: user?.nebulaApiId,
        appMenu: item.productType,
        appType: item.id,
        appCount: item.productQuantity,
        productPeriod: item.productPeriod,
        isInvoice: invoiceEnabled ? 1 : 0,
        originalPrice: originalBaseAmount.current,
        invoiceName: invoiceEnabled ? invoiceForm.invoiceName : '',
        taxNumber: invoiceEnabled ? invoiceForm.taxNumber : '',
        email: invoiceEnabled ? invoiceForm.email : '',
        companyAddress: invoiceEnabled ? invoiceForm.companyAddress : '',
        companyPhone: invoiceEnabled ? invoiceForm.companyPhone : '',
        openingBank: invoiceEnabled ? invoiceForm.openingBank : '',
        bankAccount: invoiceEnabled ? invoiceForm.bankAccount : '',
      };

      const res: any = await orderService.createOrder(params);
      const data = res.data || res;

      if (data && data.codeUrl) {
        const info = {
          ...data,
          totalAmount: baseAmount
        };
        setOrderInfo(info);
        setWxPayModalOpen(true);
        startWxPolling(data.outTradeNo);
      } else {
        console.error('Failed to create WeChat order', res);
        if (res.msg) {
          toast.error(res.msg);
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error?.message || '支付失败，请重试');
    } finally {
      setPayLoading(false);
    }
  };

  const startWxPolling = (outTradeNo: string) => {
    let attempts = 0;
    let pollInterval = 10000; // 初始10秒

    const poll = async () => {
      try {
        attempts++;
        if (attempts > 3) {
          stopPolling();
          setPayStatus('failed');
          toast.error('支付超时，请稍后在订单页面查看或联系客服');
          return;
        }

        const res: any = await orderService.queryOrder({ outTradeNo });
        const data = res.data || res;

        if (data && data.tradeState === 'SUCCESS') {
          stopPolling();
          setPayStatus('success');
          toast.success('支付成功！');
          setTimeout(() => {
            setWxPayModalOpen(false);
            useAuthStore.getState().fetchUserInfo();
          }, 2000);
        } else if (data && data.tradeState === 'NOTPAY') {
          pollInterval += 5000;
          if (pollTimer.current) {
            clearInterval(pollTimer.current);
          }
          pollTimer.current = setTimeout(poll, pollInterval);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    pollTimer.current = setTimeout(poll, pollInterval);
  };

  const handleAlipayPayment = async (item: PriceListVO) => {
    try {
      setPayLoading(true);
      stopPolling();

      let baseAmount = item.totalAmount || (Number(item.productPrice) * item.productQuantity);
      originalBaseAmount.current = Math.round(baseAmount);

      // 美元汇率转换（除以7.3）
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
        isInvoice: 0, // 支付宝不支持发票
        originalPrice: originalBaseAmount.current,
      };

      const res: any = await orderService.createAntomPaymentSession(params);
      const data = res.data || res;

      if (data && data.normalUrl) {
        window.open(data.normalUrl, '_blank');
        toast.loading('已打开支付页面，请完成支付', { id: 'pay_poll' });
        startAlipayPolling(data.paymentRequestId);
      } else {
        console.error('Failed to create Antom payment session', res);
        if (res.msg) {
          toast.error(res.msg);
        }
      }
    } catch (error: any) {
      console.error('Alipay error:', error);
      toast.error(error?.message || '支付失败，请重试');
    } finally {
      setPayLoading(false);
    }
  };

  const startAlipayPolling = (paymentRequestId: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        if (attempts > maxAttempts) {
          toast.dismiss('pay_poll');
          toast('支付超时，请稍后在订单页面查看或联系客服', { icon: '⚠️' });
          if (alipayPollTimer.current) {
            clearTimeout(alipayPollTimer.current);
            alipayPollTimer.current = null;
          }
          return;
        }

        const res: any = await orderService.queryAntomPaymentResult(paymentRequestId);
        const data = res.data || res;

        switch (data.paymentStatus) {
          case 'FAIL': {
            toast.dismiss('pay_poll');
            toast.error('支付失败，请重试');
            if (alipayPollTimer.current) {
              clearTimeout(alipayPollTimer.current);
              alipayPollTimer.current = null;
            }
            return;
          }
          case 'PROCESSING': {
            // 继续轮询
            alipayPollTimer.current = setTimeout(poll, 5000);
            break;
          }
          case 'SUCCESS': {
            toast.dismiss('pay_poll');
            toast.success('支付成功！充值处理中...');
            useAuthStore.getState().fetchUserInfo();
            if (alipayPollTimer.current) {
              clearTimeout(alipayPollTimer.current);
              alipayPollTimer.current = null;
            }
            return;
          }
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
    { value: 'wechat', label: '微信支付' },
    { value: 'Alipay', label: '支付宝支付' },
    { value: 'AlipayHK', label: 'AlipayHK' },
    { value: 'BillEase', label: 'BillEase' },
    { value: 'Boost', label: 'Boost' },
    { value: 'BPI', label: 'BPI' },
    { value: 'GCash', label: 'GCash' },
    { value: 'Kredivo', label: 'Kredivo' },
    { value: 'LINE Pay', label: 'Rabbit LINE Pay' },
    { value: "Touch'n Go eWallet", label: "Touch'n Go eWallet" },
  ];

  return (
    <div className="bg-surface/30 min-h-screen pb-12 font-sans">
      <div className="container mx-auto px-4 max-w-6xl pt-8">
        {/* Configuration Bar - 移除付费周期选择 */}
        <div className="bg-background rounded-xl shadow-sm border border-border p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setConsultModalOpen(true);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
            >
              <HelpCircle size={14} />
              充值有疑问？请点击此处
            </a>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-700">支付方式</span>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="bg-white border border-gray-300 rounded-md text-sm px-3 py-1.5 outline-none focus:border-blue-500 min-w-[150px]"
              >
                {paymentOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-700">是否开具发票</span>
              <button 
                onClick={() => {
                  if (paymentType === 'wechat') {
                    setInvoiceEnabled(!invoiceEnabled);
                  }
                }}
                className={`w-11 h-6 rounded-full relative transition-colors ${
                  invoiceEnabled ? 'bg-blue-600' : 'bg-gray-300'
                } ${paymentType !== 'wechat' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                disabled={paymentType !== 'wechat'}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  invoiceEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}></div>
              </button>
              {invoiceEnabled && paymentType === 'wechat' && (
                <button
                  onClick={() => invoiceFormRef.current?.open()}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
              <Loader2 className="animate-spin text-white" size={32} />
            </div>
          ) : (
            priceList.map((item) => {
              const price = Number(item.productPrice);
              const isEnterprise = price === 9999;
              const isFree = price === 0;

              // Determine styles based on price type
              let borderColor = 'border-indigo-200';
              let bgColor = 'bg-gradient-to-br from-blue-50 to-indigo-50';
              let btnColor = 'bg-indigo-600 hover:bg-indigo-700';
              
              if (isEnterprise) {
                borderColor = 'border-purple-300';
                bgColor = 'bg-gradient-to-br from-purple-50 to-pink-50';
                btnColor = 'bg-purple-600 hover:bg-purple-700';
              } else if (isFree) {
                borderColor = 'border-green-200';
                bgColor = 'bg-gradient-to-br from-green-50 to-emerald-50';
                btnColor = 'bg-green-600 hover:bg-green-700';
              }

              return (
                <PricingCard 
                  key={item.id}
                  item={item}
                  isEnterprise={isEnterprise}
                  isFree={isFree}
                  paymentType={paymentType}
                  invoiceEnabled={invoiceEnabled}
                  onQuantityChange={(q) => handleQuantityChange(item.id, q)}
                  onCustomAmountChange={(amount) => handleCustomAmountChange(item.id, amount)}
                  onBuy={() => handlePayment(item)}
                  loading={payLoading}
                  getPriceText={getPriceText}
                  calculatePoints={calculatePoints}
                  getMinAmount={getMinAmount}
                  borderColor={borderColor}
                  bgColor={bgColor}
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
        title={null}
        width="max-w-md"
      >
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          {payStatus === 'success' ? (
            <div className="flex flex-col items-center text-green-600 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold">支付成功！</h3>
              <p className="text-gray-500 mt-2">感谢您的购买</p>
            </div>
          ) : totalAmount === 9999 ? (
            <div className="flex flex-col items-center space-y-6">
              <h3 className="text-xl font-bold text-gray-900">企业定制服务</h3>
              <p className="text-sm text-gray-600">为您提供专业的AI解决方案</p>
              <div className="space-y-4 w-full">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl">📱</div>
                  <div>
                    <div className="text-xs text-gray-500">联系电话</div>
                    <div className="text-sm font-semibold">18890659150</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl">⏰</div>
                  <div>
                    <div className="text-xs text-gray-500">服务时间</div>
                    <div className="text-sm font-semibold">工作日 9:00-18:00</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500">支付金额</p>
                <div className="text-3xl font-bold text-gray-900">
                  ¥{totalAmount.toFixed(2)}
                </div>
                {invoiceEnabled && (
                  <div className="mt-4 text-left space-y-2 text-sm">
                    <div className="font-medium text-gray-700">发票信息</div>
                    <div className="space-y-1 text-gray-600">
                      <div>发票抬头：{invoiceForm.invoiceName}</div>
                      <div>纳税人识别号：{invoiceForm.taxNumber}</div>
                      <div>邮箱：{invoiceForm.email}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-gray-200 relative">
                {orderInfo?.codeUrl ? (
                  <>
                    <QRCodeSVG value={orderInfo.codeUrl} size={200} />
                    <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-blue-600"></div>
                    <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-blue-600"></div>
                    <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-blue-600"></div>
                    <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-blue-600"></div>
                  </>
                ) : (
                  <div className="w-[200px] h-[200px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400">
                    <Loader2 className="animate-spin" size={32} />
                  </div>
                )}
              </div>

              <div className="space-y-3 w-full">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                  <span>打开微信扫一扫</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                  <span>扫描上方二维码</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</div>
                  <span>确认支付完成购买</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg w-full">
                <div className="text-xl">💡</div>
                <div className="text-sm text-yellow-800">
                  支付完成后将自动关闭此窗口，请勿重复支付
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 size={16} className="animate-spin" />
                等待支付中...
              </div>
            </>
          )}
        </div>
      </BaseModal>

      {/* Contact Modal */}
      <BaseModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        title="企业定制服务"
        width="max-w-md"
      >
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">企业定制服务</h3>
            <p className="text-sm text-gray-500">为您提供专业的AI解决方案</p>
          </div>
          
          <div className="space-y-4 w-full">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl">📱</div>
              <div className="text-left">
                <div className="text-xs text-gray-500">联系电话</div>
                <div className="text-sm font-semibold">18890659150</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl">⏰</div>
              <div className="text-left">
                <div className="text-xs text-gray-500">服务时间</div>
                <div className="text-sm font-semibold">工作日 9:00-18:00</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm font-semibold text-gray-700 mb-2">微信联系</div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 inline-block">
              <img 
                src="/zhenshangWxCode.png" 
                alt="微信联系方式" 
                className="w-32 h-32 object-contain"
              />
            </div>
            <div className="text-xs text-gray-500 mt-2">扫码添加企业微信</div>
          </div>
        </div>
      </BaseModal>

      {/* Consult Modal */}
      <BaseModal
        isOpen={consultModalOpen}
        onClose={() => setConsultModalOpen(false)}
        title="在线咨询"
        width="max-w-sm"
      >
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">需要帮助？</h3>
            <p className="text-sm text-gray-600">扫描下方二维码，立即咨询</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <img 
              src="/zhenshangWxCode.png" 
              alt="微信二维码" 
              className="w-48 h-48 object-contain"
            />
          </div>

          <div className="text-sm text-gray-500 space-y-1">
            <p>工作时间：周一至周五 9:00-18:00</p>
            <p>我们将为您提供专业的服务支持</p>
          </div>
        </div>
      </BaseModal>

      {/* Invoice Form */}
      <InvoiceForm
        ref={invoiceFormRef}
        invoiceForm={invoiceForm}
        onFormChange={setInvoiceForm}
      />
    </div>
  );
};

interface PricingCardProps {
  item: PriceListVO;
  isEnterprise: boolean;
  isFree: boolean;
  paymentType: string;
  invoiceEnabled: boolean;
  onQuantityChange: (quantity: number) => void;
  onCustomAmountChange: (amount: number) => void;
  onBuy: () => void;
  loading: boolean;
  getPriceText: (item: PriceListVO, paymentType: string) => string;
  calculatePoints: (item: PriceListVO, paymentType: string) => number;
  getMinAmount: (item: PriceListVO) => number;
  borderColor: string;
  bgColor: string;
  btnColor: string;
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  item, isEnterprise, isFree, paymentType, invoiceEnabled, onQuantityChange, onCustomAmountChange, onBuy, loading, getPriceText, calculatePoints, getMinAmount, borderColor, bgColor, btnColor 
}) => {
  const steps = [1, 2, 3, 4, 5, 6]; // 6 is Custom
  const price = Number(item.productPrice);
  const quantity = item.productQuantity || 1;
  const isCustom = quantity === 6;
  
  const priceText = getPriceText(item, paymentType);
  const points = calculatePoints(item, paymentType);
  
  // 计算自定义金额输入框的最低金额
  const minAmount = getMinAmount(item);
  const actualMinAmount = paymentType === 'wechat' 
    ? minAmount 
    : Number((minAmount / 7.3).toFixed(2));

  return (
    <div className={`bg-white border-2 ${borderColor} rounded-2xl p-6 md:p-8 flex flex-col shadow-lg hover:shadow-xl transition-all ${bgColor} ${isEnterprise ? 'relative overflow-hidden' : ''}`}>
      
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-gray-900">
          {isEnterprise ? 'Enterprise' : `${item.productName}会员`}
        </h3>
      </div>

      <div className="text-center mb-4">
        <div className="text-4xl font-bold text-indigo-600 h-20 flex items-center justify-center">
          {isEnterprise ? "Let's talk!" : (
            isCustom ? (
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">{paymentType === 'wechat' ? '￥' : '$'}</span>
                <input 
                  type="number" 
                  className="w-32 text-4xl font-bold text-indigo-600 bg-transparent border-b-2 border-indigo-300 focus:border-indigo-600 outline-none text-center"
                  value={item.totalAmount || ''}
                  placeholder="0"
                  onChange={(e) => onCustomAmountChange(Number(e.target.value))}
                  min={actualMinAmount}
                  step={paymentType === 'wechat' ? 50 : 10}
                  style={{
                    MozAppearance: 'textfield',
                  }}
                />
                <style>{`
                  input[type=number]::-webkit-inner-spin-button, 
                  input[type=number]::-webkit-outer-spin-button { 
                    -webkit-appearance: none; 
                    margin: 0; 
                  }
                `}</style>
              </div>
            ) : (
              priceText
            )
          )}
        </div>
        {!isEnterprise && (
          <div className="text-sm text-gray-600 mt-2">
            可使用积分：{points.toFixed(2)}
          </div>
        )}
      </div>

      <div className="my-6 border-t border-gray-200"></div>

      {!isEnterprise && (
        <div className="mb-6">
          <div className="text-xs text-gray-600 font-medium mb-4">购买数量</div>
          
          <div className="relative px-1">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 rounded-full"></div>
            
            <div 
              className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 rounded-full transition-all duration-300"
              style={{ width: `${((Math.min(quantity, 5) - 1) / 4) * 100}%` }}
            ></div>

            <div className="relative flex justify-between">
              {steps.slice(0, 5).map((step) => (
                <div key={step} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => onQuantityChange(step)}>
                  <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                    step <= quantity ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'
                  }`}></div>
                  <span className={`text-[10px] ${step === quantity ? 'text-indigo-600 font-bold' : 'text-gray-500'}`}>
                    {step}倍
                  </span>
                </div>
              ))}
              <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => onQuantityChange(6)}>
                <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                  quantity === 6 ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'
                }`}></div>
                <span className={`text-[10px] ${quantity === 6 ? 'text-indigo-600 font-bold' : 'text-gray-500'}`}>
                  自定义
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 space-y-3 mb-8 text-center">
        {!isEnterprise && item.productDescription && (
          <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
            {item.productDescription}
          </div>
        )}
        {isEnterprise && (
          <div className="text-sm text-gray-600">
            Contact us for custom solutions
          </div>
        )}
      </div>

      <button
        onClick={onBuy}
        disabled={loading}
        className={`w-full py-3 rounded-lg ${btnColor} text-white font-bold transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed`}
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        {isEnterprise ? '联系我们' : '立即购买'}
      </button>
    </div>
  );
};

export default PricingPage;
