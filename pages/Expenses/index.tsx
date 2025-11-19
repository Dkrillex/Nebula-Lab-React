import React, { useState, useEffect } from 'react';
import { RefreshCw, Bot, Gem, Wallet, ShieldCheck } from 'lucide-react';
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

  // 获取费用记录列表（余额模式）
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

  // 获取积分账户列表
  const fetchUserAccounts = async () => {
    if (!user?.userId) {
      console.warn('用户信息中缺少 userId');
      return;
    }

    try {
      setQuotaLoading(true);
      const res = await expenseService.getUserAccounts({
        userId: user.userId,
      });

      // 处理响应格式
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
    if (!user?.userId) {
      console.warn('用户信息中缺少 userId');
      return;
    }

    try {
      setLoading(true);
      const res = await expenseService.getScoreList({
        createBy: user.userId,
        pageNum: page,
        pageSize: pagination.pageSize,
      });

      // 处理响应格式
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
      // 余额模式：获取余额信息和消费日志
      if (user?.nebulaApiId) {
        await Promise.all([fetchQuotaInfo(), fetchExpenseLogs(1)]);
      }
    } else if (currentMode === 'points') {
      // 积分模式：获取积分账户和积分流水
      if (user?.userId) {
        await Promise.all([fetchUserAccounts(), fetchScoreList(1)]);
      }
    }
  };

  // 刷新所有数据
  const handleRefresh = async () => {
    await initData();
  };

  // 切换模式
  const handleModeChange = (mode: 'balance' | 'points') => {
    setCurrentMode(mode);
    setPagination(prev => ({
      ...prev,
      current: 1,
      pageSize: mode === 'points' ? 10 : 9,
    }));
  };

  // 监听模式切换
  useEffect(() => {
    initData();
  }, [currentMode, user?.nebulaApiId, user?.userId]);

  // 初始化加载数据
  useEffect(() => {
    if (user?.nebulaApiId || user?.userId) {
      initData();
    }
  }, [user?.nebulaApiId, user?.userId]);

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
  
  // 计算总积分（积分模式）
  const totalPoints = userAccounts.reduce((sum, account) => {
    return sum + (Number(account.userPoints) || 0);
  }, 0);

  return (
    <div className="bg-background min-h-screen pb-12">
      
      {/* Header Section */}
      <div className="w-full bg-surface py-12 px-4">
        <div className="container mx-auto text-center max-w-5xl">
          <h1 className="text-3xl font-bold mb-2 text-foreground">{t.title}</h1>
          <p className="text-muted opacity-90 mb-8">{t.subtitle}</p>
          
          <div className="bg-background rounded-2xl p-6 md:p-10 border border-border shadow-sm">
            {/* 模式切换器 */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() => handleModeChange('balance')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  currentMode === 'balance'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-surface text-muted hover:bg-surface/80'
                }`}
              >
                <Wallet size={18} />
                {t.buttons.balance}
              </button>
              <button
                onClick={() => handleModeChange('points')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  currentMode === 'points'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-surface text-muted hover:bg-surface/80'
                }`}
              >
                <Gem size={18} />
                {t.buttons.points}
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
              <div className="text-left">
                {currentMode === 'balance' ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <div className="text-5xl md:text-6xl font-bold mb-2 flex items-baseline gap-2 text-foreground">
                      {quotaLoading ? '...' : formatPoints(totalPoints)}
                    </div>
                    <div className="text-muted font-medium flex items-center gap-2 flex-wrap">
                      <span>{t.buttons.points}</span>
                      {userAccounts.length > 0 && (
                        <>
                          <span className="opacity-60">|</span>
                          <span>共 {userAccounts.length} 个账户</span>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-end gap-3">
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
      </div>

      {/* Usage Records Section */}
      <div className="container mx-auto px-4 -mt-6 max-w-6xl">
        <div className="bg-surface rounded-t-2xl p-6 border border-border shadow-sm min-h-[500px]">
           <div className="flex items-center justify-between mb-6 border-l-4 border-indigo-500 pl-4">
              <h2 className="text-xl font-bold text-foreground">{t.recordsTitle}</h2>
              <button 
                onClick={() => {
                  if (currentMode === 'balance') {
                    fetchExpenseLogs(pagination.current);
                  } else {
                    fetchScoreList(pagination.current);
                  }
                }}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                 {t.refreshData}
              </button>
           </div>

           {/* Loading State */}
           {loading && (
             (currentMode === 'balance' && expenseLogs.length === 0) ||
             (currentMode === 'points' && scoreList.length === 0)
           ) && (
             <div className="flex items-center justify-center py-20">
               <RefreshCw className="animate-spin text-indigo-600" size={32} />
             </div>
           )}

           {/* Empty State */}
           {!loading && (
             (currentMode === 'balance' && expenseLogs.length === 0) ||
             (currentMode === 'points' && scoreList.length === 0)
           ) && (
             <div className="text-center py-20 text-muted">
               <p>{currentMode === 'balance' ? '暂无费用记录' : '暂无积分流水'}</p>
             </div>
           )}

           {/* Cards Grid - 余额模式 */}
           {currentMode === 'balance' && !loading && expenseLogs.length > 0 && (
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

           {/* Cards Grid - 积分模式 */}
           {currentMode === 'points' && !loading && scoreList.length > 0 && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {scoreList.map((score) => {
                 return (
                   <div key={score.id}>
                     <ScoreCard score={score} t={t} />
                   </div>
                 );
               })}
             </div>
           )}

           {/* Pagination */}
           {!loading && (
             (currentMode === 'balance' && expenseLogs.length > 0) ||
             (currentMode === 'points' && scoreList.length > 0)
           ) && pagination.total > pagination.pageSize && (
             <div className="flex items-center justify-center gap-2 mt-6">
               <button
                 onClick={() => {
                   if (currentMode === 'balance') {
                     fetchExpenseLogs(pagination.current - 1);
                   } else {
                     fetchScoreList(pagination.current - 1);
                   }
                 }}
                 disabled={pagination.current <= 1}
                 className="px-3 py-1.5 rounded-lg bg-background border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 上一页
               </button>
               <span className="text-sm text-muted">
                 第 {pagination.current} 页 / 共 {Math.ceil(pagination.total / pagination.pageSize)} 页
               </span>
               <button
                 onClick={() => {
                   if (currentMode === 'balance') {
                     fetchExpenseLogs(pagination.current + 1);
                   } else {
                     fetchScoreList(pagination.current + 1);
                   }
                 }}
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

// 积分流水卡片组件
const ScoreCard = ({ score, t }: { 
  score: ScoreRecord, 
  t: ExpensesPageProps['t'] 
}) => {
  const scoreValue = Number(score.score) || 0;
  const isPositive = scoreValue > 0;
  const assetTypeMap: Record<number, string> = {
    1: '图片',
    2: '视频',
    3: '音频',
    4: '其他',
  };
  const statusMap: Record<string, string> = {
    '1': '已完成',
    '0': '进行中',
    '-1': '失败',
  };
  
  return (
    <div className="bg-background border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:border-indigo-200 dark:hover:border-indigo-800">
      {/* 卡片头部：积分值 */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Gem size={18} />
          </div>
          <span className="font-semibold text-foreground">
            {assetTypeMap[score.assetType] || '未知类型'}
          </span>
        </div>
        
        {/* 积分显示 */}
        <div className={`px-3 py-2 rounded-lg border ${
          isPositive 
            ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30' 
            : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
        }`}>
          <span className={`font-bold text-sm ${
            isPositive 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {isPositive ? '+' : ''}{scoreValue}
          </span>
        </div>
      </div>
      
      {/* 卡片主体：详细信息 */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs mb-4">
        {/* 任务ID */}
        {score.taskId && (
          <div>
            <span className="text-muted block mb-0.5">任务ID:</span>
            <span className="font-medium text-foreground">{score.taskId}</span>
          </div>
        )}
        
        {/* 状态 */}
        <div>
          <span className="text-muted block mb-0.5">状态:</span>
          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border ${
            score.status === '1'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
              : score.status === '0'
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
          }`}>
            {statusMap[String(score.status)] || score.status}
          </span>
        </div>
        
        {/* 资产类型 */}
        <div>
          <span className="text-muted block mb-0.5">资产类型:</span>
          <span className="font-medium text-foreground">{assetTypeMap[score.assetType] || '未知'}</span>
        </div>
      </div>
      
      {/* 卡片底部：时间 */}
      {score.createTime && (
        <div className="pt-3 border-t border-border text-[10px] text-muted flex items-center gap-1">
          <ClockIcon />
          {score.createTime}
        </div>
      )}
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