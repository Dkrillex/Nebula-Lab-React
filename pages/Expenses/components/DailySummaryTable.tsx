import React from 'react';

// 余额日汇总数据类型
export interface BalanceDailySummary {
  date: string;
  totalConsumption: number;
  totalRecharge: number;
  netAmount: number;
  usageCount: number;
  totalTokens: number;
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
}

interface PointsDailySummaryTableProps {
  mode: 'points';
  data: PointsDailySummary[];
}

type DailySummaryTableProps = BalanceDailySummaryTableProps | PointsDailySummaryTableProps;

const DailySummaryTable: React.FC<DailySummaryTableProps> = (props) => {
  const { mode, data } = props;

  if (data.length === 0) return null;

  // 余额模式表格
  if (mode === 'balance') {
    const balanceData = data as BalanceDailySummary[];
    const totalUsageCount = balanceData.reduce((sum, day) => sum + day.usageCount, 0);
    const totalTokens = balanceData.reduce((sum, day) => sum + day.totalTokens, 0);
    const totalConsumption = balanceData.reduce((sum, day) => sum + day.totalConsumption, 0);
    const totalRecharge = balanceData.reduce((sum, day) => sum + day.totalRecharge, 0);
    const totalNetAmount = balanceData.reduce((sum, day) => sum + day.netAmount, 0);

    return (
      <div className="mb-4">
        <div className="border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
                <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-zinc-400">日期</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-zinc-400">次数</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-zinc-400">Token</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-zinc-400">消费</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-zinc-400">充值</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-zinc-400">净额</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900">
              {balanceData.map((day) => (
                <tr key={day.date} className="border-b border-gray-100 dark:border-zinc-800">
                  <td className="px-3 py-2 text-gray-800 dark:text-zinc-200">{day.date}</td>
                  <td className="px-3 py-2 text-right text-gray-600 dark:text-zinc-400">{day.usageCount}</td>
                  <td className="px-3 py-2 text-right text-gray-600 dark:text-zinc-400 font-mono">{day.totalTokens.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-red-600 dark:text-red-400 font-mono">-{day.totalConsumption.toFixed(4)}</td>
                  <td className="px-3 py-2 text-right text-green-600 dark:text-green-400 font-mono">+{day.totalRecharge.toFixed(4)}</td>
                  <td className={`px-3 py-2 text-right font-mono ${day.netAmount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {day.netAmount >= 0 ? '+' : ''}{day.netAmount.toFixed(4)}
                  </td>
                </tr>
              ))}
              {/* 合计行 */}
              <tr className="bg-gray-50 dark:bg-zinc-800 font-medium">
                <td className="px-3 py-2 text-gray-800 dark:text-zinc-200">合计</td>
                <td className="px-3 py-2 text-right text-gray-800 dark:text-zinc-200">{totalUsageCount}</td>
                <td className="px-3 py-2 text-right text-gray-800 dark:text-zinc-200 font-mono">{totalTokens.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-red-600 dark:text-red-400 font-mono">-{totalConsumption.toFixed(4)}</td>
                <td className="px-3 py-2 text-right text-green-600 dark:text-green-400 font-mono">+{totalRecharge.toFixed(4)}</td>
                <td className={`px-3 py-2 text-right font-mono ${totalNetAmount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {totalNetAmount >= 0 ? '+' : ''}{totalNetAmount.toFixed(4)}
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
  const totalUsageCount = pointsData.reduce((sum, day) => sum + day.usageCount, 0);
  const totalDeduct = pointsData.reduce((sum, day) => sum + day.totalDeduct, 0);

  return (
    <div className="mb-4">
      <div className="border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
              <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-zinc-400">日期</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-zinc-400">次数</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-zinc-400">消耗积分</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900">
            {pointsData.map((day) => (
              <tr key={day.date} className="border-b border-gray-100 dark:border-zinc-800">
                <td className="px-3 py-2 text-gray-800 dark:text-zinc-200">{day.date}</td>
                <td className="px-3 py-2 text-right text-gray-600 dark:text-zinc-400">{day.usageCount}</td>
                <td className="px-3 py-2 text-right text-red-600 dark:text-red-400 font-mono">-{day.totalDeduct}</td>
              </tr>
            ))}
            {/* 合计行 */}
            <tr className="bg-gray-50 dark:bg-zinc-800 font-medium">
              <td className="px-3 py-2 text-gray-800 dark:text-zinc-200">合计</td>
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

