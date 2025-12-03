import React from 'react';

// 余额日汇总数据类型
export interface BalanceDailySummary {
  date: string;
  totalConsumption: number;
  totalRecharge: number;
  netAmount: number;
  usageCount: number;
  totalTokens: number;
  totalConsumptionUsd?: number;
  totalConsumptionIdr?: number;
  totalRechargeUsd?: number;
  totalRechargeIdr?: number;
  netAmountUsd?: number;
  netAmountIdr?: number;
}

// 积分日汇总数据类型
export interface PointsDailySummary {
  date: string;
  totalDeduct: number;
  usageCount: number;
}

interface BalanceDailySummaryTableProps {
  mode: 'balance';
  data: BalanceDailySummary[];
  t?: any;
  onDateClick?: (date: string) => void;
  selectedDate?: string | null;
  language: 'zh' | 'en' | 'id';
}

interface PointsDailySummaryTableProps {
  mode: 'points';
  data: PointsDailySummary[];
  t?: any;
  onDateClick?: (date: string) => void;
  selectedDate?: string | null;
}

type DailySummaryTableProps = BalanceDailySummaryTableProps | PointsDailySummaryTableProps;

const DailySummaryTable: React.FC<DailySummaryTableProps> = (props) => {
  const { mode, data, t, onDateClick, selectedDate } = props;

  if (data.length === 0) return null;

  // 余额模式表格
  if (mode === 'balance') {
    const balanceProps = props as BalanceDailySummaryTableProps;
    const language = balanceProps.language;
    const getCurrencySymbol = (lang: 'zh' | 'en' | 'id') => {
      if (lang === 'en') return '$';
      if (lang === 'id') return 'Rp';
      return '¥';
    };
    const currencySymbol = getCurrencySymbol(language);

    const getCurrencyFieldValue = (
      day: BalanceDailySummary,
      baseField: 'totalConsumption' | 'totalRecharge' | 'netAmount'
    ) => {
      if (language === 'en') {
        return Number(day[`${baseField}Usd` as keyof BalanceDailySummary] ?? day[baseField]);
      }
      if (language === 'id') {
        return Number(day[`${baseField}Idr` as keyof BalanceDailySummary] ?? day[baseField]);
      }
      return Number(day[baseField]);
    };

    const balanceData = data as BalanceDailySummary[];
    // 确保数值字段是数字类型（后端可能返回字符串）
    const normalizedData = balanceData.map(day => ({
      ...day,
      totalConsumption: getCurrencyFieldValue(day, 'totalConsumption') || 0,
      totalRecharge: getCurrencyFieldValue(day, 'totalRecharge') || 0,
      netAmount: getCurrencyFieldValue(day, 'netAmount') || 0,
      usageCount: Number(day.usageCount) || 0,
      totalTokens: Number(day.totalTokens) || 0,
    }));
    
    const totalUsageCount = normalizedData.reduce((sum, day) => sum + day.usageCount, 0);
    const totalTokens = normalizedData.reduce((sum, day) => sum + day.totalTokens, 0);
    const totalConsumption = normalizedData.reduce((sum, day) => sum + day.totalConsumption, 0);
    const totalRecharge = normalizedData.reduce((sum, day) => sum + day.totalRecharge, 0);
    const totalNetAmount = normalizedData.reduce((sum, day) => sum + day.netAmount, 0);

    return (
      <div className="mb-4">
        <div className="border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
                <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-zinc-400">{t?.date || '日期'}</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-zinc-400">{t?.times || '次数'}</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-zinc-400">{t?.token || 'Token'}</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-zinc-400">
                  {t?.consumption || '消费'} ({currencySymbol})
                </th>
                <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-zinc-400">
                  {t?.recharge || '充值'} ({currencySymbol})
                </th>
                <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-zinc-400">
                  {t?.netAmount || '净额'} ({currencySymbol})
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900">
              {normalizedData.map((day) => (
                <tr 
                  key={day.date} 
                  className={`border-b border-gray-100 dark:border-zinc-800 ${
                    onDateClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800' : ''
                  } ${selectedDate === day.date ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  onClick={() => onDateClick?.(day.date)}
                >
                  <td className="px-3 py-2 text-gray-800 dark:text-zinc-200">{day.date}</td>
                  <td className="px-3 py-2 text-right text-gray-600 dark:text-zinc-400">{day.usageCount}</td>
                  <td className="px-3 py-2 text-right text-gray-600 dark:text-zinc-400 font-mono">{day.totalTokens.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-red-600 dark:text-red-400 font-mono">-{day.totalConsumption.toFixed(6)}</td>
                  <td className="px-3 py-2 text-right text-green-600 dark:text-green-400 font-mono">+{day.totalRecharge.toFixed(6)}</td>
                  <td className={`px-3 py-2 text-right font-mono ${day.netAmount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {day.netAmount >= 0 ? '+' : ''}{day.netAmount.toFixed(6)}
                  </td>
                </tr>
              ))}
              {/* 合计行 */}
              <tr className="bg-gray-50 dark:bg-zinc-800 font-medium">
                <td className="px-3 py-2 text-gray-800 dark:text-zinc-200">{t?.total || '合计'}</td>
                <td className="px-3 py-2 text-right text-gray-800 dark:text-zinc-200">{totalUsageCount}</td>
                <td className="px-3 py-2 text-right text-gray-800 dark:text-zinc-200 font-mono">{totalTokens.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-red-600 dark:text-red-400 font-mono">-{totalConsumption.toFixed(6)}</td>
                <td className="px-3 py-2 text-right text-green-600 dark:text-green-400 font-mono">+{totalRecharge.toFixed(6)}</td>
                <td className={`px-3 py-2 text-right font-mono ${totalNetAmount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {totalNetAmount >= 0 ? '+' : ''}{totalNetAmount.toFixed(6)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 积分模式表格
  const pointsData = data as PointsDailySummary[];
  // 确保数值字段是数字类型（后端可能返回字符串）
  const normalizedPointsData = pointsData.map(day => ({
    ...day,
    totalDeduct: Number(day.totalDeduct) || 0,
    usageCount: Number(day.usageCount) || 0,
  }));
  
  const totalUsageCount = normalizedPointsData.reduce((sum, day) => sum + day.usageCount, 0);
  const totalDeduct = normalizedPointsData.reduce((sum, day) => sum + day.totalDeduct, 0);

  return (
    <div className="mb-4">
      <div className="border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
              <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-zinc-400">{t?.date || '日期'}</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-zinc-400">{t?.times || '次数'}</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-zinc-400">{t?.consumedPoints || '消耗积分'}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900">
            {normalizedPointsData.map((day) => (
              <tr 
                key={day.date} 
                className={`border-b border-gray-100 dark:border-zinc-800 ${
                  onDateClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800' : ''
                } ${selectedDate === day.date ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                onClick={() => onDateClick?.(day.date)}
              >
                <td className="px-3 py-2 text-gray-800 dark:text-zinc-200">{day.date}</td>
                <td className="px-3 py-2 text-right text-gray-600 dark:text-zinc-400">{day.usageCount}</td>
                <td className="px-3 py-2 text-right text-red-600 dark:text-red-400 font-mono">-{day.totalDeduct}</td>
              </tr>
            ))}
            {/* 合计行 */}
            <tr className="bg-gray-50 dark:bg-zinc-800 font-medium">
              <td className="px-3 py-2 text-gray-800 dark:text-zinc-200">{t?.total || '合计'}</td>
              <td className="px-3 py-2 text-right text-gray-800 dark:text-zinc-200">{totalUsageCount}</td>
              <td className="px-3 py-2 text-right text-red-600 dark:text-red-400 font-mono">-{totalDeduct}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailySummaryTable;

