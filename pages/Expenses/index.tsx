import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
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

const ExpensesPage: React.FC = () => {
  const { t: rootT } = useOutletContext<{ t: any }>();
  const t = rootT?.expensesPage as ExpensesPageProps['t'];
  
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

      if (res.rows) {
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

      if (res.rows) {
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
        second: '2-digit',
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
      promptTokens: Number(log.promptTokens) || 0,
      completionTokens: Number(log.completionTokens) || 0,
      timestamp: timeStr,
    };
  };

  const balance = Number(quotaInfo?.quotaRmb) || 0;
  const points = Number(quotaInfo?.score) || 0;

  const totalPoints = userAccounts.reduce((sum, account) => {
    return sum + (Number(account.userPoints) || 0);
  }, 0);

  if (!t) {
    return null;
  }

  return (
    <div className="min-h-screen pb-12 font-sans" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      
      {/* Page Header */}
      <div className="w-full text-center py-6">
        <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{t.title}</h1>
        <p className="text-lg text-white/90 max-w-2xl mx-auto">
          {currentMode === 'balance' ? '余额管理与使用记录' : '积分账户与流水记录'}
        </p>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        
        {/* Balance/Points Card - 完全按照 Nebula1 图片布局 */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border-0">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              {/* 左侧：余额显示 - 始终显示余额信息，不随模式切换 */}
              <div className="flex-1">
                {/* 大号余额数字 - 最突出 */}
                <div className="text-6xl md:text-7xl font-bold text-white mb-3 tracking-tight leading-none">
                  <span className="text-4xl mr-2">¥</span>
                  {quotaLoading ? '...' : formatPoints(balance)}
                </div>
                
                {/* 余额和转换可用积分 - 同一行 */}
                <div className="flex items-center gap-4 text-white text-base">
                  <span className="text-lg font-medium">余额</span>
                  <span>转换可用积分:</span>
                  <span className="text-yellow-300 font-semibold text-xl">{formatPoints(points)}</span>
                </div>
              </div>

              {/* 右侧：按钮组 - 水平排列，按照图片布局 */}
              <div className="flex flex-wrap items-center gap-2 justify-end">
                {/* 日志/账单按钮（如果有团队权限或渠道ID） */}
                {(user?.team?.length > 0 || user?.channelId) && (
                  <button
                    onClick={() => {/* TODO: 切换到日志模式 */}}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl text-sm font-medium transition-all"
                  >
                    <span className="text-base">📑</span>
                    <span>日志/账单</span>
                  </button>
                )}
                
                {/* 积分按钮 */}
                <button
                  onClick={() => handleModeChange('points')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    currentMode === 'points'
                      ? 'bg-white/30 text-white shadow-md border border-white/40'
                      : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                  }`}
                >
                  <span className="text-base">💎</span>
                  <span>{t.buttons.points}</span>
                </button>
                
                {/* 余额按钮 */}
                <button
                  onClick={() => handleModeChange('balance')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    currentMode === 'balance'
                      ? 'bg-white/30 text-white shadow-md border border-white/40'
                      : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                  }`}
                >
                  <span className="text-base">💰</span>
                  <span>{t.buttons.balance}</span>
                </button>
                
                {/* 免费会员状态 */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/20 text-white border border-white/30 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-green-400 shadow-sm"></div>
                  <span className="text-sm font-medium">{t.buttons.freeMember}</span>
                </div>
                
                {/* 刷新按钮 */}
                <button
                  onClick={handleRefresh}
                  disabled={loading || quotaLoading}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    loading || quotaLoading
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <RefreshCw size={16} className={loading || quotaLoading ? 'animate-spin' : ''} />
                  <span>{t.buttons.refresh}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Usage List - 借鉴 Nebula1 的卡片式设计 */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border-0">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 pl-2 border-l-4 border-indigo-600">
                {t.recordsTitle}
              </h2>
              <span className="text-sm text-gray-500">
                共 {pagination.total} 条记录
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-500">
                <RefreshCw className="animate-spin mr-2" size={20} />
                加载中...
              </div>
            ) : (
              <>
                {/* 卡片网格布局 - 借鉴 Nebula1 */}
                <div className={`grid gap-4 mb-6 ${
                  currentMode === 'balance' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                }`}>
                  {(currentMode === 'balance' ? expenseLogs : scoreList).length === 0 ? (
                    <div className="col-span-full py-16 text-center">
                      <div className="text-6xl mb-4 opacity-50">📊</div>
                      <div className="text-gray-500 text-lg font-medium">暂无记录</div>
                      <div className="text-gray-400 text-sm mt-2">
                        {currentMode === 'balance' ? '暂无使用记录' : '暂无积分流水'}
                      </div>
                    </div>
                  ) : (
                    <>
                      {currentMode === 'balance' ? (
                        expenseLogs.map((log) => (
                          <ExpenseRow key={log.id} record={convertLogToExpenseRecord(log)} t={t} />
                        ))
                      ) : (
                        scoreList.map((score) => (
                          <ScoreCard key={score.id} score={score} t={t} />
                        ))
                      )}
                    </>
                  )}
                </div>

                {/* Pagination Footer */}
                {!loading && pagination.total > pagination.pageSize && (
                  <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => currentMode === 'balance' ? fetchExpenseLogs(pagination.current - 1) : fetchScoreList(pagination.current - 1)}
                      disabled={pagination.current <= 1}
                      className="px-4 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-indigo-50"
                    >
                      上一页
                    </button>
                    <span className="text-sm text-gray-600 font-medium">
                      {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize)}
                    </span>
                    <button
                      onClick={() => currentMode === 'balance' ? fetchExpenseLogs(pagination.current + 1) : fetchScoreList(pagination.current + 1)}
                      disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                      className="px-4 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-indigo-50"
                    >
                      下一页
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Tip */}
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
            <div className="flex items-center gap-3 text-gray-600">
              <span className="text-xl">💡</span>
              <span className="text-sm font-medium">
                {currentMode === 'points' 
                  ? '积分可用于平台各项服务消费' 
                  : '余额可用于大模型API调用服务'}
              </span>
            </div>
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
    promptTokens?: number;
    completionTokens?: number;
    timestamp: string;
  }; 
  t: ExpensesPageProps['t'];
}> = ({ record, t }) => {
  const isConsumption = record.type === 'consumption';
  const promptTokens = record.promptTokens || 0;
  const completionTokens = record.completionTokens || 0;
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Card Header - 按照 Nebula1 布局 */}
      <div className="p-4">
        {/* 模型信息 */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🤖</span>
          <span className="font-semibold text-gray-800">{record.modelName}</span>
        </div>
        {/* 金额 - 红色，浅粉色背景高亮 */}
        <div className={`inline-flex items-center px-3 py-1.5 rounded text-base font-bold font-mono ${
          isConsumption 
            ? 'text-red-600 bg-pink-50' 
            : 'text-green-600 bg-green-50'
        }`}>
          ¥{isConsumption ? '-' : '+'}{record.cost.toFixed(6)}
        </div>
      </div>

      {/* Card Body - 两列布局 */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* 左列 */}
          <div className="space-y-3">
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs mb-1">{t.record.type}:</span>
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium w-fit ${
                isConsumption 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {isConsumption ? t.record.consumption : '充值'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs mb-1">{t.record.input}</span>
              <span className="text-gray-800 font-medium">{promptTokens.toLocaleString()}</span>
            </div>
          </div>
          
          {/* 右列 */}
          <div className="space-y-3">
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs mb-1">{t.record.duration}:</span>
              <span className="text-gray-800 font-medium">{record.duration}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs mb-1">{t.record.output}</span>
              <span className="text-gray-800 font-medium">{completionTokens.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock size={12} />
          <span>{record.timestamp}</span>
        </div>
      </div>
    </div>
  );
};

// 积分流水卡片组件 - 完全按照 Nebula1 图片布局
const ScoreCard: React.FC<{
  score: ScoreRecord;
  t: ExpensesPageProps['t'];
}> = ({ score, t }) => {
  const scoreValue = Number(score.score) || 0;
  const isPositive = scoreValue > 0;
  const assetTypeMap: Record<number, { text: string; icon: string }> = {
    // 1: { text: '图片生成', icon: '🎨' },
    // 2: { text: '视频生成', icon: '🎬' },
    // 3: { text: '音频生成', icon: '🎤' },
    // 4: { text: '其他服务', icon: '🤖' },
    // 15: { text: 'AI创作实验室', icon: '🧪' },
     1: { text:  '视频生成', icon: '🎬' },
    2: { text: 'AI对话', icon: '🤖' },
    3: { text: '视频编辑', icon: '🎥' },
    4: { text: '视频制作', icon: '🎞️' },
    5: { text: '视频录制', icon: '📹' },
    6: { text: '特效处理', icon: '🌟' },
    7: { text: '图像处理', icon: '🎨' },
    8: { text: '语音处理', icon: '🎤' },
    9: { text: 'AI助手', icon: '🤖' },
    10: { text: '智能分析', icon: '🤖' },
    15: { text: 'AI创作实验室', icon: '🤖' },
  };
  
  const typeInfo = assetTypeMap[score.assetType] || { text: '未知服务', icon: '❓' };
  
  // 状态映射 - 根据图片，"已扣款"对应已完成状态（status === '1'）
  const statusInfo = {
    '1': { text: '已扣款', class: 'bg-blue-100 text-white' }, // 已完成 -> 已扣款，浅蓝色背景，白色文字
    '0': { text: '进行中', class: 'bg-yellow-50 text-yellow-700' },
    '-1': { text: '失败', class: 'bg-red-50 text-red-700' },
  }[String(score.status) || '0'] || { text: '未知', class: 'bg-gray-50 text-gray-700' };
  
  // 格式化时间戳为 2025/11/21 18:15:39 格式
  const formatTimestamp = (timeStr: string) => {
    if (!timeStr || timeStr === '-') return '-';
    try {
      const date = new Date(timeStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    } catch {
      return timeStr;
    }
  };
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Top Section - 服务名称和图标 - 按照 Nebula1 图片布局 */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          {/* 图标容器 - 白色背景，圆角方形 */}
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
            <span className="text-xl">{typeInfo.icon}</span>
          </div>
          <span className="font-semibold text-gray-800">{typeInfo.text}</span>
        </div>
      </div>

      {/* Middle Section - 积分值和状态 */}
      <div className="px-4 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {/* 左侧：积分值 */}
          <div className="text-base font-bold text-gray-800">
            {isPositive ? '+' : '-'}{Math.abs(scoreValue)} 积分
          </div>
          {/* 右侧：状态按钮 */}
          <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium ${
            statusInfo.class
          }`}>
            {statusInfo.text}
          </span>
        </div>
      </div>

      {/* Bottom Section - 时间戳 */}
      <div className="px-4 py-3 bg-gray-50">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock size={12} />
          <span>{formatTimestamp(score.createTime || '-')}</span>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;