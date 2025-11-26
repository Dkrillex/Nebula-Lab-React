import React from 'react';
import { Loader2 } from 'lucide-react';
import { PriceListVO } from '../../../services/pricingService';
import { CURRENT_SYSTEM, SYSTEM_TYPE } from '../../../constants';

export interface PricingCardProps {
  item: PriceListVO;
  isEnterprise: boolean;
  paymentType: string;
  invoiceEnabled: boolean;
  onQuantityChange: (quantity: number) => void;
  onCustomAmountChange: (amount: number) => void;
  onBuy: () => void;
  loading: boolean;
  labels: any;
  t: any;
  borderColor: string;
  btnColor: string;
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  item, isEnterprise, paymentType, invoiceEnabled, onQuantityChange, onCustomAmountChange, onBuy, loading, labels, t, borderColor, btnColor 
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
    const rmbAmount = actualAmount;
    totalPoints = Number((rmbAmount / pointsRatio).toFixed(2));
  } else {
    // 非自定义金额：根据支付方式转换价格显示
    if (!isWechat) {
      // 非微信支付：将人民币价格转换为美元显示
      totalPrice = Number((totalPrice / exchangeRate).toFixed(2));
      
      // 计算积分：直接使用人民币金额，不再按汇率折算
      const rmbAmount = price * quantity;
      let pointsRatio = 2;
      if (item.productName === 'Starter') {
        pointsRatio = 1.72;
      } else if (item.productName === 'Business') {
        pointsRatio = 1.592;
      }
      totalPoints = Number((rmbAmount / pointsRatio).toFixed(2));
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
      
      {/* 卡片标题 */}
      <div className="text-center mb-2 relative z-10">
        <h3 className="text-xl font-bold text-foreground">{isEnterprise ? 'Enterprise' : item.productName}</h3>
      </div>

      {/* 价格显示 */}
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
        {/* 积分只在创作中心或 BOTH 模式显示 */}
        {!isEnterprise && (CURRENT_SYSTEM === SYSTEM_TYPE.CREATION_CENTER || CURRENT_SYSTEM === SYSTEM_TYPE.BOTH) && (
        <div className="text-sm text-muted">
            {labels.credits} {totalPoints.toFixed(2)}
        </div>
        )}
        {/* Enterprise 占位元素，保持高度一致 */}
        {isEnterprise && (
        <div className="text-sm text-muted invisible">
            &nbsp;
        </div>
        )}
      </div>

      <div className="my-3 border-t border-border relative z-10"></div>

      {/* 数量选择器 - 非企业版显示 */}
      {!isEnterprise && (
        <div className="pt-0 border-t border-transparent mb-1">
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

      {/* 功能列表 */}
      <div className="flex-1 space-y-2 mb-8 relative z-10">
         {item.productName === 'Starter' && (
            <ul className="space-y-1.5 flex flex-col items-center">
              {/* 模型中心功能 - MODEL_CENTER 或 BOTH 显示 */}
              {(CURRENT_SYSTEM === SYSTEM_TYPE.MODEL_CENTER || CURRENT_SYSTEM === SYSTEM_TYPE.BOTH) && t.starter?.modelFeatures && (
                t.starter.modelFeatures.map((feature: string, index: number) => (
                  <li key={`model-${index}`} className="text-sm text-foreground/90 dark:text-foreground/80 flex items-center">
                    <span className="text-green-500 dark:text-green-400 mr-2 text-sm">✓</span>
                    {feature}
                  </li>
                ))
              )}
              {/* 创作中心功能 - CREATION_CENTER 或 BOTH 显示 */}
              {(CURRENT_SYSTEM === SYSTEM_TYPE.CREATION_CENTER || CURRENT_SYSTEM === SYSTEM_TYPE.BOTH) && t.starter?.createFeatures && (
                t.starter.createFeatures.map((feature: string, index: number) => (
                  <li key={`create-${index}`} className="text-sm text-foreground/90 dark:text-foreground/80 flex items-center">
                    <span className="text-green-500 dark:text-green-400 mr-2 text-sm">✓</span>
                    {feature}
                  </li>
                ))
              )}
            </ul>
         )}
         {item.productName === 'Business' && (
            <ul className="space-y-1.5 flex flex-col items-center">
              {/* 模型中心功能 - MODEL_CENTER 或 BOTH 显示 */}
              {(CURRENT_SYSTEM === SYSTEM_TYPE.MODEL_CENTER || CURRENT_SYSTEM === SYSTEM_TYPE.BOTH) && t.business?.modelFeatures && (
                t.business.modelFeatures.map((feature: string, index: number) => (
                  <li key={`model-${index}`} className="text-sm text-foreground/90 dark:text-foreground/80 flex items-center">
                    <span className="text-green-500 dark:text-green-400 mr-2 text-sm">✓</span>
                    {feature}
                  </li>
                ))
              )}
              {/* 创作中心功能 - CREATION_CENTER 或 BOTH 显示 */}
              {(CURRENT_SYSTEM === SYSTEM_TYPE.CREATION_CENTER || CURRENT_SYSTEM === SYSTEM_TYPE.BOTH) && t.business?.createFeatures && (
                t.business.createFeatures.map((feature: string, index: number) => (
                  <li key={`create-${index}`} className="text-sm text-foreground/90 dark:text-foreground/80 flex items-center">
                    <span className="text-green-500 dark:text-green-400 mr-2 text-sm">✓</span>
                    {feature}
                  </li>
                ))
              )}
            </ul>
         )}
         {isEnterprise && t.enterprise?.features && (
            <ul className="space-y-2 flex flex-col items-center">
              {t.enterprise.features.map((feature: string, index: number) => (
                <li key={index} className="text-sm text-foreground/90 dark:text-foreground/80 flex items-center py-0.5">
                  <span className="text-green-500 dark:text-green-400 mr-3 text-base font-bold">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
         )}
      </div>

      {/* 购买按钮 */}
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

export default PricingCard;

