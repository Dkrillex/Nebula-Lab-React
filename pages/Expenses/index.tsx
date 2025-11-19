import React, { useState, useEffect } from 'react';
import { RefreshCw, Bot, Gem, Wallet, ShieldCheck } from 'lucide-react';
import { expenseService, ExpenseLog, UserQuotaInfo } from '../../services/expenseService';
import { useAuthStore } from '../../stores/authStore';

interface ExpensesPageProps {
  t: {
    title: string;
    subtitle: string;
    balanceLabel: string;
    convertPoints: string;
    buttons: {
      points: string;
      balance: string;
      freeMember: string;
      refresh: string;
    };
    recordsTitle: string;
    refreshData: string;
    record: {
      type: string;
      duration: string;
      input: string;
      output: string;
      consumption: string;
    }
  };
}

const ExpensesPage: React.FC<ExpensesPageProps> = ({ t }) => {
  const { user } = useAuthStore();
  const [quotaInfo, setQuotaInfo] = useState<UserQuotaInfo | null>(null);
  const [expenseLogs, setExpenseLogs] = useState<ExpenseLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [quotaLoading, setQuotaLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 9,
    total: 0,
  });

  // 获取用户余额信息
  const fetchQuotaInfo = async () => {
    if (!user?.nebulaApiId) {
      console.warn('用户信息中缺少 nebulaApiId');
      return;
    }

    try {
      setQuotaLoading(true);
      const res = await expenseService.getUserQuota(user.nebulaApiId);
      // 处理响应格式：可能是 { code, msg, data } 或直接返回数据
      if ((res as any).code === 200 && (res as any).data) {
        setQuotaInfo((res as any).data);
      } else if ((res as any).quotaRmb !== undefined) {
        // 直接返回数据格式
        setQuotaInfo(res as any);
      }
    } catch (error) {
      console.error('获取余额信息失败:', error);
    } finally {
      setQuotaLoading(false);
    }
  };

  // 获取费用记录列表
  const fetchExpenseLogs = async (page: number = pagination.current) => {
    if (!user?.nebulaApiId) {
      console.warn('用户信息中缺少 nebulaApiId');
      return;
    }

    try {
      setLoading(true);
      const res = await expenseService.getExpenseLogs({
        pageNum: page,
        pageSize: pagination.pageSize,
        userId: user.nebulaApiId,
      });

      // 处理响应格式
      if (res.code === 200) {
        const logs = res.rows || res.data || [];
        setExpenseLogs(logs);
        setPagination(prev => ({
          ...prev,
          current: page,
          total: res.total || logs.length,
        }));
      }
    } catch (error) {
      console.error('获取费用记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 刷新所有数据
  const handleRefresh = async () => {
    await Promise.all([fetchQuotaInfo(), fetchExpenseLogs(1)]);
  };

  // 初始化加载数据
  useEffect(() => {
    if (user?.nebulaApiId) {
      fetchQuotaInfo();
      fetchExpenseLogs(1);
    }
  }, [user?.nebulaApiId]);

  // 格式化数字显示（参考旧项目）
  const formatPoints = (points: null | number | string | undefined): string => {
    if (points === undefined || points === null) return '0';
    return Number(points).toFixed(2);
  };

  // 转换日志数据为费用记录格式（参考旧项目）
  const convertLogToExpenseRecord = (log: ExpenseLog) => {
    // 处理时间：优先使用 createTime，否则使用 createdAt
    let timeStr = log.createTime || '-';
    if (!timeStr && log.createdAt) {
      const timestamp = typeof log.createdAt === 'number' 
        ? (log.createdAt > 1000000000000 ? log.createdAt : log.createdAt * 1000)
        : Date.now();
      const date = new Date(timestamp);
      timeStr = date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    }
    
    // 处理用时：useTime 是秒数
    const useTime = log.useTime ? `${log.useTime}s` : '0s';
    
    // 判断类型：type == '2' 或 type == 2 表示消费，否则表示充值
    const isConsumption = String(log.type) === '2';
    
    // 消费金额：优先使用 quotaRmb，否则使用 quota
    const cost = Number(log.quotaRmb || log.quota || 0);
    
    return {
      id: log.id,
      modelName: log.modelName || '-',
      cost,
      type: isConsumption ? 'consumption' as const : 'recharge' as const,
      duration: useTime,
      inputTokens: Number(log.promptTokens) || 0,
      outputTokens: Number(log.completionTokens) || 0,
      cacheCreationTokens: log.otherMap?.cache_creation_tokens || 0,
      cacheTokens: log.otherMap?.cache_tokens || 0,
      timestamp: timeStr,
    };
  };

  // 确保 balance 和 points 是数字类型
  const balance = Number(quotaInfo?.quotaRmb) || 0;
  const points = Number(quotaInfo?.score) || 0;
  const memberLevel = quotaInfo?.memberLevel || '';

  return (
    <div className="bg-background min-h-screen pb-12">
      
      {/* Header Section */}
      <div className="w-full bg-surface py-12 px-4">
        <div className="container mx-auto text-center max-w-5xl">
          <h1 className="text-3xl font-bold mb-2 text-foreground">{t.title}</h1>
          <p className="text-muted opacity-90 mb-8">{t.subtitle}</p>
          
          <div className="bg-background rounded-2xl p-6 md:p-10 border border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
             <div className="text-left">
                <div className="text-5xl md:text-6xl font-bold mb-2 flex items-baseline gap-2 text-foreground">
                  <span className="text-3xl opacity-80">￥</span> 
                  {quotaLoading ? '...' : formatPoints(balance)}
                </div>
                <div className="text-muted font-medium flex items-center gap-2 flex-wrap">
                  <span>{t.balanceLabel}</span>
                  <span className="opacity-60">|</span>
                  <span>{t.convertPoints}:</span>
                  <span className="text-yellow-600 dark:text-yellow-400">{formatPoints(points)}</span>
                  {memberLevel && (
                    <>
                      <span className="opacity-60">|</span>
                      <span>{memberLevel}{t.buttons.freeMember}</span>
                    </>
                  )}
                </div>
             </div>
             
             <div className="flex flex-wrap justify-center md:justify-end gap-3">
                <ActionButton icon={Gem} label={t.buttons.points} color="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" />
                <ActionButton icon={Wallet} label={t.buttons.balance} color="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" />
                <ActionButton icon={ShieldCheck} label={t.buttons.freeMember} color="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" />
                <button 
                  onClick={handleRefresh}
                  disabled={loading || quotaLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium border border-border disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
                >
                  <RefreshCw size={16} className={loading || quotaLoading ? 'animate-spin' : ''} />
                  {t.buttons.refresh}
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Usage Records Section */}
      <div className="container mx-auto px-4 -mt-6 max-w-6xl">
        <div className="bg-surface rounded-t-2xl p-6 border border-border shadow-sm min-h-[500px]">
           <div className="flex items-center justify-between mb-6 border-l-4 border-indigo-500 pl-4">
              <h2 className="text-xl font-bold text-foreground">{t.recordsTitle}</h2>
              <button 
                onClick={() => fetchExpenseLogs(pagination.current)}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                 {t.refreshData}
              </button>
           </div>

           {/* Loading State */}
           {loading && expenseLogs.length === 0 && (
             <div className="flex items-center justify-center py-20">
               <RefreshCw className="animate-spin text-indigo-600" size={32} />
             </div>
           )}

           {/* Empty State */}
           {!loading && expenseLogs.length === 0 && (
             <div className="text-center py-20 text-muted">
               <p>暂无费用记录</p>
             </div>
           )}

           {/* Cards Grid */}
           {!loading && expenseLogs.length > 0 && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expenseLogs.map((log) => {
                  const record = convertLogToExpenseRecord(log);
                  return (
                    <div key={log.id}>
                      <ExpenseCard record={record} t={t} />
                    </div>
                  );
                })}
             </div>
           )}

           {/* Pagination */}
           {!loading && expenseLogs.length > 0 && pagination.total > pagination.pageSize && (
             <div className="flex items-center justify-center gap-2 mt-6">
               <button
                 onClick={() => fetchExpenseLogs(pagination.current - 1)}
                 disabled={pagination.current <= 1}
                 className="px-3 py-1.5 rounded-lg bg-background border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 上一页
               </button>
               <span className="text-sm text-muted">
                 第 {pagination.current} 页 / 共 {Math.ceil(pagination.total / pagination.pageSize)} 页
               </span>
               <button
                 onClick={() => fetchExpenseLogs(pagination.current + 1)}
                 disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                 className="px-3 py-1.5 rounded-lg bg-background border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 下一页
               </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, color }: any) => (
  <button className={`flex items-center gap-2 px-4 py-2 rounded-lg ${color} hover:opacity-80 transition-all text-sm font-medium`}>
    <Icon size={16} />
    {label}
  </button>
);

const ExpenseCard = ({ record, t }: { 
  record: {
    id: string | number;
    modelName: string;
    cost: number;
    type: 'consumption' | 'recharge';
    duration: string;
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens?: number;
    cacheTokens?: number;
    timestamp: string;
  }, 
  t: ExpensesPageProps['t'] 
}) => {
  const isConsumption = record.type === 'consumption';
  
  return (
    <div className="bg-background border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:border-indigo-200 dark:hover:border-indigo-800">
       {/* 卡片头部：模型名称和金额 */}
       <div className="mb-4">
          <div className="flex items-center gap-3 mb-3">
             <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Bot size={18} />
             </div>
             <span className="font-semibold text-foreground truncate">{record.modelName}</span>
          </div>
          
          {/* 金额显示：消费为红色，充值为绿色（参考旧项目） */}
          <div className={`px-3 py-2 rounded-lg border ${
            isConsumption 
              ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' 
              : 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'
          }`}>
             <span className={`font-bold text-sm ${
               isConsumption 
                 ? 'text-red-600 dark:text-red-400' 
                 : 'text-green-600 dark:text-green-400'
             }`}>
                ￥{isConsumption ? '-' : '+'}{record.cost || 0}
             </span>
          </div>
       </div>
       
       {/* 卡片主体：详细信息 */}
       <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs mb-4">
          {/* 类型 */}
          <div>
             <span className="text-muted block mb-0.5">{t.record.type}:</span>
             <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border ${
               isConsumption
                 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                 : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
             }`}>
               {isConsumption ? t.record.consumption : '充值'}
             </span>
          </div>
          
          {/* 用时 */}
          <div>
             <span className="text-muted block mb-0.5">{t.record.duration}:</span>
             <span className="font-medium text-foreground">{record.duration}</span>
          </div>
          
          {/* 输入token */}
          <div>
             <span className="text-muted block mb-0.5">{t.record.input}token:</span>
             <span className="font-medium text-foreground">{record.inputTokens || 0}</span>
          </div>
          
          {/* 输出token */}
          <div>
             <span className="text-muted block mb-0.5">{t.record.output}token:</span>
             <span className="font-medium text-foreground">{record.outputTokens || 0}</span>
          </div>
          
          {/* 缓存写入token（如果有） */}
          {record.cacheCreationTokens > 0 && (
            <div>
               <span className="text-muted block mb-0.5">缓存写入token:</span>
               <span className="font-medium text-foreground">{record.cacheCreationTokens}</span>
            </div>
          )}
          
          {/* 缓存读取token（如果有） */}
          {record.cacheTokens > 0 && (
            <div>
               <span className="text-muted block mb-0.5">缓存读取token:</span>
               <span className="font-medium text-foreground">{record.cacheTokens}</span>
            </div>
          )}
       </div>
       
       {/* 卡片底部：时间 */}
       <div className="pt-3 border-t border-border text-[10px] text-muted flex items-center gap-1">
          <ClockIcon />
          {record.timestamp}
       </div>
    </div>
  );
};

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

export default ExpensesPage;