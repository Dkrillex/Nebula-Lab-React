import React, { useState, useEffect } from 'react';
import { RefreshCw, Wallet, Receipt, Clock, ArrowRightLeft } from 'lucide-react';
import { expenseService, ExpenseLog, UserQuotaInfo, ScoreRecord, UserAccount } from '../../services/expenseService';
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
  // 模式切换：'balance' 余额模式，'points' 积分模式
  const [currentMode, setCurrentMode] = useState<'balance' | 'points'>('balance');
  
  // 余额相关状态
  const [quotaInfo, setQuotaInfo] = useState<UserQuotaInfo | null>(null);
  const [expenseLogs, setExpenseLogs] = useState<ExpenseLog[]>([]);
  
  // 积分相关状态
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [scoreList, setScoreList] = useState<ScoreRecord[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [quotaLoading, setQuotaLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 获取用户余额信息
  const fetchQuotaInfo = async () => {
    if (!user?.nebulaApiId) return;

    try {
      setQuotaLoading(true);
      const res = await expenseService.getUserQuota(user.nebulaApiId);
      if ((res as any).code === 200 && (res as any).data) {
        setQuotaInfo((res as any).data);
      } else if ((res as any).quotaRmb !== undefined) {
        setQuotaInfo(res as any);
      }
    } catch (error) {
      console.error('获取余额信息失败:', error);
    } finally {
      setQuotaLoading(false);
    }
  };

  // 获取费用记录列表（余额模式）
  const fetchExpenseLogs = async (page: number = pagination.current) => {
    if (!user?.nebulaApiId) return;

    try {
      setLoading(true);
      const res = await expenseService.getExpenseLogs({
        pageNum: page,
        pageSize: pagination.pageSize,
        userId: user.nebulaApiId,
      });

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

  // 获取积分账户列表
  const fetchUserAccounts = async () => {
    if (!user?.userId) return;

    try {
      setQuotaLoading(true);
      const res = await expenseService.getUserAccounts({
        userId: user.userId,
      });

      if (res.code === 200) {
        const accounts = res.rows || res.data || [];
        setUserAccounts(accounts);
      }
    } catch (error) {
      console.error('获取积分账户失败:', error);
    } finally {
      setQuotaLoading(false);
    }
  };

  // 获取积分流水列表（积分模式）
  const fetchScoreList = async (page: number = pagination.current) => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      const res = await expenseService.getScoreList({
        createBy: user.userId,
        pageNum: page,
        pageSize: pagination.pageSize,
      });

      if (res.code === 200) {
        const scores = res.rows || res.data || [];
        setScoreList(scores);
        setPagination(prev => ({
          ...prev,
          current: page,
          total: res.total || scores.length,
        }));
      }
    } catch (error) {
      console.error('获取积分流水失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 根据模式初始化数据
  const initData = async () => {
    if (currentMode === 'balance') {
      if (user?.nebulaApiId) {
        await Promise.all([fetchQuotaInfo(), fetchExpenseLogs(1)]);
      }
    } else if (currentMode === 'points') {
      if (user?.userId) {
        await Promise.all([fetchUserAccounts(), fetchScoreList(1)]);
      }
    }
  };

  const handleRefresh = async () => {
    await initData();
  };

  const handleModeChange = (mode: 'balance' | 'points') => {
    setCurrentMode(mode);
    setPagination(prev => ({
      ...prev,
      current: 1,
      pageSize: 10,
    }));
  };

  useEffect(() => {
    initData();
  }, [currentMode, user?.nebulaApiId, user?.userId]);

  useEffect(() => {
    if (user?.nebulaApiId || user?.userId) {
      initData();
    }
  }, [user?.nebulaApiId, user?.userId]);

  const formatPoints = (points: null | number | string | undefined): string => {
    if (points === undefined || points === null) return '0';
    return Number(points).toFixed(2);
  };

  const convertLogToExpenseRecord = (log: ExpenseLog) => {
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
      });
    }
    
    const useTime = log.useTime ? `${log.useTime}s` : '0s';
    const isConsumption = String(log.type) === '2';
    const cost = Number(log.quotaRmb || log.quota || 0);
    
    return {
      id: log.id,
      modelName: log.modelName || '未知服务',
      cost,
      type: isConsumption ? 'consumption' as const : 'recharge' as const,
      duration: useTime,
      totalTokens: (Number(log.promptTokens) || 0) + (Number(log.completionTokens) || 0),
      timestamp: timeStr,
    };
  };

  const balance = Number(quotaInfo?.quotaRmb) || 0;
  const points = Number(quotaInfo?.score) || 0;
  
  const totalPoints = userAccounts.reduce((sum, account) => {
    return sum + (Number(account.userPoints) || 0);
  }, 0);

  return (
    <div className="bg-background min-h-screen pb-12 font-sans">
      
      {/* Simplified Header */}
      <div className="w-full border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-foreground">{t.title}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
               <span>{currentMode === 'balance' ? '当前余额' : '积分概览'}</span>
            </div>
          </div>

          <div className="flex items-center bg-secondary/50 rounded-lg p-1 border border-border/50">
            <button
              onClick={() => handleModeChange('balance')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                currentMode === 'balance'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-indigo-600'
              }`}
            >
              {t.buttons.balance}
            </button>
            <button
              onClick={() => handleModeChange('points')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                currentMode === 'points'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-indigo-600'
              }`}
            >
              {t.buttons.points}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        
        {/* Balance Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-card rounded-xl p-6 border border-border shadow-sm">
            <div className="text-sm text-muted-foreground mb-2">
              {currentMode === 'balance' ? '可用余额 (CNY)' : '总积分 (Points)'}
            </div>
            <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
              {currentMode === 'balance' ? (
                 <>
                   <span className="text-2xl mr-1">¥</span>
                   {quotaLoading ? '...' : formatPoints(balance)}
                 </>
              ) : (
                 <>
                   {quotaLoading ? '...' : formatPoints(totalPoints)}
                   <span className="text-lg ml-2 text-muted-foreground font-normal">pts</span>
                 </>
              )}
            </div>
            
            {currentMode === 'balance' && (
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <ArrowRightLeft size={14} />
                  <span>可兑换积分: <span className="text-orange-600 font-medium">{formatPoints(points)}</span></span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-card rounded-xl p-6 border border-border shadow-sm flex flex-col justify-center items-start gap-3">
             <div className="text-sm font-medium text-foreground">快捷操作</div>
             <button 
                onClick={handleRefresh}
                disabled={loading || quotaLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors text-sm font-medium text-white disabled:opacity-50 shadow-sm"
             >
                <RefreshCw size={16} className={loading || quotaLoading ? 'animate-spin' : ''} />
                {t.buttons.refresh}
             </button>
             <div className="text-xs text-muted-foreground text-center w-full">
                数据同步可能存在延迟
             </div>
          </div>
        </div>

        {/* Usage List */}
        <div>
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">{t.recordsTitle}</h2>
              <span className="text-xs text-muted-foreground">
                 共 {pagination.total} 条记录
              </span>
           </div>

           <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              {loading ? (
                 <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <RefreshCw className="animate-spin mr-2" size={16} />
                    加载中...
                 </div>
              ) : (
                 <div className="divide-y divide-border/50">
                   {(currentMode === 'balance' ? expenseLogs : scoreList).length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground text-sm">
                        暂无记录
                      </div>
                   ) : (
                     <>
                       {currentMode === 'balance' ? (
                          expenseLogs.map((log) => (
                            <ExpenseRow key={log.id} record={convertLogToExpenseRecord(log)} />
                          ))
                       ) : (
                          scoreList.map((score) => (
                            <ScoreRow key={score.id} score={score} />
                          ))
                       )}
                     </>
                   )}
                 </div>
              )}
              
              {/* Pagination Footer */}
              {!loading && pagination.total > pagination.pageSize && (
                <div className="p-4 bg-secondary/10 flex items-center justify-center gap-4 border-t border-border/50">
                   <button
                     onClick={() => currentMode === 'balance' ? fetchExpenseLogs(pagination.current - 1) : fetchScoreList(pagination.current - 1)}
                     disabled={pagination.current <= 1}
                     className="text-sm px-3 py-1 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current"
                   >
                     上一页
                   </button>
                   <span className="text-xs text-muted-foreground">
                     {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize)}
                   </span>
                   <button
                     onClick={() => currentMode === 'balance' ? fetchExpenseLogs(pagination.current + 1) : fetchScoreList(pagination.current + 1)}
                     disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                     className="text-sm px-3 py-1 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current"
                   >
                     下一页
                   </button>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const ExpenseRow: React.FC<{ 
  record: {
    id: string | number;
    modelName: string;
    cost: number;
    type: 'consumption' | 'recharge';
    duration: string;
    totalTokens: number;
    timestamp: string;
  }
}> = ({ record }) => {
  const isConsumption = record.type === 'consumption';
  
  return (
    <div className="p-4 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
       <div className="flex items-start gap-3">
          <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            isConsumption ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' : 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
          }`}>
             {isConsumption ? <Receipt size={16} /> : <Wallet size={16} />}
          </div>
          <div>
             <div className="text-sm font-medium text-foreground">{record.modelName}</div>
             <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                <Clock size={10} />
                {record.timestamp}
                <span className="hidden sm:inline text-border">|</span>
                <span className="hidden sm:inline">{record.duration}</span>
             </div>
          </div>
       </div>
       
       <div className="flex items-center justify-between sm:justify-end gap-6 pl-11 sm:pl-0">
          {isConsumption && record.totalTokens > 0 && (
            <div className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded hidden sm:block">
               {record.totalTokens.toLocaleString()} tokens
            </div>
          )}
          <div className={`text-sm font-mono font-bold ${
            isConsumption ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
          }`}>
             {isConsumption ? '-' : '+'} {record.cost.toFixed(4)}
          </div>
       </div>
    </div>
  );
};

const ScoreRow: React.FC<{ score: ScoreRecord }> = ({ score }) => {
  const scoreValue = Number(score.score) || 0;
  const isPositive = scoreValue > 0;
  const assetTypeMap: Record<number, string> = {
    1: '图片生成',
    2: '视频生成',
    3: '音频生成',
    4: '其他服务',
  };
  
  return (
    <div className="p-4 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start gap-3">
         <div className="mt-0.5 w-8 h-8 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Wallet size={16} />
         </div>
         <div>
            <div className="text-sm font-medium text-foreground">
               {assetTypeMap[score.assetType] || '未知服务'}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
               <Clock size={10} />
               {score.createTime || '-'}
               {score.taskId && (
                 <>
                   <span className="text-border">|</span>
                   <span>ID: {score.taskId}</span>
                 </>
               )}
            </div>
         </div>
      </div>

      <div className="pl-11 sm:pl-0 text-right">
         <div className={`text-sm font-mono font-bold ${
           isPositive ? 'text-green-600 dark:text-green-400' : 'text-foreground'
         }`}>
            {isPositive ? '+' : ''}{scoreValue}
         </div>
         <div className={`text-xs mt-0.5 ${
            score.status === '1' ? 'text-green-600' : score.status === '-1' ? 'text-red-500' : 'text-muted-foreground'
         }`}>
            {score.status === '1' ? '已完成' : score.status === '0' ? '进行中' : '失败'}
         </div>
      </div>
    </div>
  );
};

export default ExpensesPage;