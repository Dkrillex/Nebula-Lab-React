import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { PriceListVO } from '../../../services/pricingService';

export interface ModelCenterCardProps {
  item: PriceListVO;
  paymentType: string;
  invoiceEnabled: boolean;
  onCustomAmountChange: (amount: number) => void;
  onBuy: () => void;
  loading: boolean;
  labels: any;
  t: any;
}

// 人民币快捷金额
const QUICK_AMOUNTS_CNY = [50, 200, 500, 1000, 2000];
// 美元快捷金额
const QUICK_AMOUNTS_USD = [10, 20, 50, 100, 200];
const MIN_AMOUNT_CNY = 50;
const MIN_AMOUNT_USD = 7;

const ModelCenterCard: React.FC<ModelCenterCardProps> = ({ 
  item, paymentType, invoiceEnabled, onCustomAmountChange, onBuy, loading, labels, t 
}) => {
  const isWechat = paymentType === 'wechat';
  const currencyUnit = isWechat ? '￥' : '$';
  const quickAmounts = isWechat ? QUICK_AMOUNTS_CNY : QUICK_AMOUNTS_USD;
  const minAmount = isWechat ? MIN_AMOUNT_CNY : MIN_AMOUNT_USD;
  const currencyText = isWechat ? '元' : '美元';
  
  const customAmount = Number(item.totalAmount) || 0;
  const [inputError, setInputError] = useState<string>('');

  const handleAmountChange = (value: number) => {
    if (value < minAmount && value !== 0) {
      setInputError(`最低充值金额为 ${minAmount} ${currencyText}`);
    } else {
      setInputError('');
    }
    onCustomAmountChange(value);
  };

  const handleQuickSelect = (amount: number) => {
    setInputError('');
    onCustomAmountChange(amount);
  };

  const handleBuy = () => {
    if (customAmount < minAmount) {
      setInputError(`最低充值金额为 ${minAmount} ${currencyText}`);
      return;
    }
    onBuy();
  };

  return (
    <div className="bg-background border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 md:p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow">
      
      {/* 卡片标题 */}
      <div className="text-center mb-4 relative z-10">
        <h3 className="text-xl font-bold text-foreground">充值余额</h3>
        <p className="text-sm text-muted mt-1">API 调用按量计费</p>
      </div>

      {/* 金额输入 */}
      <div className="text-center mb-4 relative z-10">
        <div className="flex items-center justify-center">
          <span className="text-2xl font-bold text-primary mr-2">{currencyUnit}</span>
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
            className="w-40 text-4xl font-bold text-primary bg-transparent border-b-2 border-primary/30 focus:border-primary outline-none text-center appearance-none"
            value={customAmount || ''}
            placeholder="0"
            onChange={(e) => handleAmountChange(Number(e.target.value))}
            min={minAmount}
            step={isWechat ? 10 : 5}
          />
        </div>
        {inputError && (
          <p className="text-xs text-red-500 mt-2">{inputError}</p>
        )}
      </div>

      {/* 快捷金额选择 */}
      <div className="mb-6">
        <div className="flex flex-wrap justify-center gap-2">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handleQuickSelect(amount)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                customAmount === amount
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-foreground hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {currencyUnit}{amount}
            </button>
          ))}
        </div>
      </div>

      <div className="my-3 border-t border-border relative z-10"></div>

      {/* 功能描述 - 使用 Business 的描述 */}
      <div className="flex-1 space-y-2 mb-8 relative z-10">
        <ul className="space-y-1.5 flex flex-col items-center">
          {t.business?.modelFeatures && (
            t.business.modelFeatures.map((feature: string, index: number) => (
              <li key={`model-${index}`} className="text-sm text-foreground/90 dark:text-foreground/80 flex items-center">
                <span className="text-green-500 dark:text-green-400 mr-2 text-sm">✓</span>
                {feature}
              </li>
            ))
          )}
        </ul>
      </div>

      {/* 购买按钮 */}
      <button
        onClick={handleBuy}
        disabled={loading || customAmount < minAmount}
        className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-md relative z-10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        {labels.buy || '立即充值'}
      </button>

      {/* 提示信息 */}
      <p className="text-xs text-muted text-center mt-3">
        充值后可用于 API 调用，按实际使用量扣费
      </p>
    </div>
  );
};

export default ModelCenterCard;

