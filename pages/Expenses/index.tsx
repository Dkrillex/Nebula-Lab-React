import React, { useState, useEffect } from 'react';
import { useAppOutletContext } from '../../router/context';
import { translations } from '../../translations';
import { RefreshCw, Wallet, Receipt, Clock, ArrowRightLeft, Download, Search, X, Maximize2, Settings, Upload } from 'lucide-react';
import { expenseService, ExpenseLog, UserQuotaInfo, ScoreRecord, UserAccount, TeamLog, TeamLogsQuery } from '../../services/expenseService';
import { useAuthStore } from '../../stores/authStore';
import { teamService } from '../../services/teamService';
import { teamUserService } from '../../services/teamUserService';
import TeamLogsImportModal from '../../components/TeamLogsImportModal';

interface ExpensesPageProps {
  t?: any;
}

const ExpensesPage: React.FC<ExpensesPageProps> = (props) => {
  const { t: rootT } = useAppOutletContext();
  // 添加空值保护，防止页面崩溃
  const t = props.t || rootT?.expensesPage || translations['zh'].expensesPage;
  
  const { user } = useAuthStore();
  // 模式切换：'balance' 余额模式，'points' 积分模式，'logos' 日志/账单模式
  const [currentMode, setCurrentMode] = useState<'balance' | 'points' | 'logos'>('balance');
  
  // 余额相关状态
  const [quotaInfo, setQuotaInfo] = useState<UserQuotaInfo | null>(null);
  const [expenseLogs, setExpenseLogs] = useState<ExpenseLog[]>([]);
  const [balanceDateRange, setBalanceDateRange] = useState<[Date | null, Date | null]>([
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
    new Date(), // 今天
  ]);
  
  // 积分相关状态
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [scoreList, setScoreList] = useState<ScoreRecord[]>([]);
  const [pointsDateRange, setPointsDateRange] = useState<[Date | null, Date | null]>([
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
    new Date(), // 今天
  ]);
  
  // 日志/账单相关状态
  const [teamLogs, setTeamLogs] = useState<TeamLog[]>([]);
  const [teamOptions, setTeamOptions] = useState<Array<{ label: string; value: string | number }>>([]);
  const [memberOptions, setMemberOptions] = useState<Array<{ label: string; value: string | number }>>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | number | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<(string | number)[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['2']); // 默认选择消费
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(Date.now() - 24 * 60 * 60 * 1000), // 昨天
    new Date(), // 今天
  ]);
  
  const [loading, setLoading] = useState(false);
  const [quotaLoading, setQuotaLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  // 导入模态框状态
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // 判断是否显示日志/账单按钮
  const isShowTeamLogos = (user?.team?.length > 0 || user?.channelId);

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
      const params: any = {
        pageNum: page,
        pageSize: pagination.pageSize,
        userId: user.nebulaApiId,
      };
      
      // 添加日期范围参数
      if (balanceDateRange[0]) {
        params.startDate = balanceDateRange[0].toISOString().split('T')[0];
      }
      if (balanceDateRange[1]) {
        params.endDate = balanceDateRange[1].toISOString().split('T')[0];
      }
      
      const res = await expenseService.getExpenseLogs(params);

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
      const params: any = {
        createBy: user.userId,
        pageNum: page,
        pageSize: pagination.pageSize,
      };
      
      // 添加日期范围参数（如果接口支持）
      if (pointsDateRange[0]) {
        params.startDate = pointsDateRange[0].toISOString().split('T')[0];
      }
      if (pointsDateRange[1]) {
        params.endDate = pointsDateRange[1].toISOString().split('T')[0];
      }
      
      const res = await expenseService.getScoreList(params);

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

  // 获取团队列表 - 借鉴 Nebula1 的实现方式
  const fetchTeamList = async () => {
    try {
      // 调用团队列表接口，不传参数获取所有团队（类似 Nebula1 的 labTeamList()）
      const res = await teamService.getTeamList();
      
      // 处理返回数据，兼容多种数据结构
      let teamsData: any[] = [];
      if (res.rows && Array.isArray(res.rows)) {
        teamsData = res.rows;
      } else if (res.data && Array.isArray(res.data)) {
        teamsData = res.data;
      } else if (Array.isArray(res)) {
        teamsData = res;
      }
      
      // 映射为下拉选项格式
      const teams = teamsData.map((team: any) => ({
        label: team.teamName || team.name || `团队${team.teamId}`,
        value: team.teamId,
      }));
      
      setTeamOptions(teams);
      
      // 如果有团队，默认选择第一个（类似 Nebula1 的逻辑）
      if (teams.length > 0 && !selectedTeamId) {
        const firstTeamId = teams[0].value;
        setSelectedTeamId(firstTeamId);
        await fetchTeamMembers(firstTeamId);
      }
    } catch (error) {
      console.error('获取团队列表失败:', error);
      // 如果接口失败，可以设置一些测试数据（用于开发测试）
      // 注意：生产环境应该移除测试数据
      if (process.env.NODE_ENV === 'development') {
        console.warn('使用测试团队数据');
        const testTeams = [
          { label: '测试1', value: 'test1' },
          { label: '测试团队2', value: 'test2' },
        ];
        setTeamOptions(testTeams);
        if (!selectedTeamId) {
          setSelectedTeamId(testTeams[0].value);
        }
      }
    }
  };

  // 获取团队成员列表 - 借鉴 Nebula1 的实现方式
  const fetchTeamMembers = async (teamId: string | number) => {
    try {
      const res = await teamService.getTeamMemberDetailList(teamId);
      
      // 处理返回数据，兼容多种数据结构
      let membersData: any[] = [];
      if (res.rows && Array.isArray(res.rows)) {
        membersData = res.rows;
      } else if (res.data && Array.isArray(res.data)) {
        membersData = res.data;
      } else if (Array.isArray(res)) {
        membersData = res;
      }
      
      // 映射为下拉选项格式
      const members = membersData.map((member: any) => ({
        label: `${member.userName || member.nickName || '未知用户'}${member.nickName && member.userName !== member.nickName ? `(${member.nickName})` : ''}`,
        value: member.userId,
      }));
      
      setMemberOptions(members);
      
      // 如果有成员，默认选择第一个（类似 Nebula1 的逻辑）
      if (members.length > 0 && selectedUserIds.length === 0) {
        setSelectedUserIds([members[0].value]);
      }
    } catch (error) {
      console.error('获取团队成员失败:', error);
      setMemberOptions([]);
      // 如果接口失败，可以设置一些测试数据（用于开发测试）
      // 注意：生产环境应该移除测试数据
      if (process.env.NODE_ENV === 'development' && teamId === 'test1') {
        console.warn('使用测试成员数据');
        const testMembers = [
          { label: '测试用户1', value: 'test_user1' },
          { label: '测试用户2', value: 'test_user2' },
        ];
        setMemberOptions(testMembers);
      }
    }
  };

  // 获取团队日志列表（日志/账单模式）- 借鉴 Nebula1 的传参方式
  const fetchTeamLogs = async (page: number = pagination.current, pageSize?: number) => {
    if (!selectedTeamId) return;

    try {
      setLoading(true);
      
      // 转换时间范围为 Unix 时间戳（秒）- 与 Nebula1 保持一致
      const getTimestamp = (dateValue: Date | null): number | undefined => {
        if (!dateValue) return undefined;
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
          console.error('无效的时间值:', dateValue);
          return undefined;
        }
        return Math.floor(date.getTime() / 1000);
      };
      
      const startTime = getTimestamp(dateRange[0]);
      const endTime = getTimestamp(dateRange[1]);
      
      const currentPageSize = pageSize || pagination.pageSize;
      
      // 借鉴 Nebula1 的传参方式
      const params: TeamLogsQuery = {
        pageNum: page,
        pageSize: currentPageSize,
        // teamIds: 单选值，转换为字符串（与 Nebula1 保持一致）
        teamIds: String(selectedTeamId),
        // userIds: 多选数组，用逗号连接（与 Nebula1 保持一致）
        userIds: selectedUserIds.length > 0 ? selectedUserIds.join(',') : undefined,
        // types: 多选数组，用逗号连接（与 Nebula1 保持一致）
        types: selectedTypes.length > 0 ? selectedTypes.join(',') : undefined,
        // startTime/endTime: Unix 时间戳（秒）
        startTime,
        endTime,
      };

      console.log('查询日志参数（借鉴 Nebula1）:', params);
      const res = await expenseService.getTeamLogs(params);
      
      if (res.rows) {
        const logs = res.rows || res.data || [];
        setTeamLogs(logs);
        setPagination(prev => ({
          ...prev,
          current: page,
          pageSize: currentPageSize,
          total: res.total || logs.length,
        }));
      }
    } catch (error) {
      console.error('获取团队日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 导出余额记录
  const handleExportBalance = async () => {
    try {
      // 获取所有数据（不分页）
      const params: any = {
        pageNum: 1,
        pageSize: 10000, // 获取所有数据
        userId: user?.nebulaApiId,
      };
      
      if (balanceDateRange[0]) {
        params.startDate = balanceDateRange[0].toISOString().split('T')[0];
      }
      if (balanceDateRange[1]) {
        params.endDate = balanceDateRange[1].toISOString().split('T')[0];
      }
      
      const res = await expenseService.getExpenseLogs(params);
      const logs = res.rows || res.data || [];
      
      // 转换为 CSV 格式
      const headers = ['时间', '服务/模型', '类型', '费用(¥)', '用时', '输入Token', '输出Token'];
      const rows = logs.map((log: ExpenseLog) => {
        const isConsumption = String(log.type) === '2';
        const timeStr = log.createTime || (log.createdAt ? new Date(log.createdAt > 1000000000000 ? log.createdAt : log.createdAt * 1000).toLocaleString('zh-CN') : '-');
        // type=1 是充值（正数），type=2 是扣费（负数）
        const costValue = Number(log.quotaRmb || log.quota || 0);
        const cost = isConsumption ? -Math.abs(costValue) : Math.abs(costValue);
        return [
          timeStr,
          log.modelName || '未知服务',
          isConsumption ? '消费' : '充值',
          cost.toFixed(6),
          log.useTime ? `${log.useTime}s` : '0s',
          log.promptTokens || 0,
          log.completionTokens || 0,
        ];
      });
      
      // 生成 CSV 内容
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // 添加 BOM 以支持中文
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `余额账单_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请稍后重试');
    }
  };

  // 导出积分记录
  const handleExportPoints = async () => {
    try {
      // 获取所有数据（不分页）
      const params: any = {
        pageNum: 1,
        pageSize: 10000, // 获取所有数据
        createBy: user?.userId,
      };
      
      if (pointsDateRange[0]) {
        params.startDate = pointsDateRange[0].toISOString().split('T')[0];
      }
      if (pointsDateRange[1]) {
        params.endDate = pointsDateRange[1].toISOString().split('T')[0];
      }
      
      const res = await expenseService.getScoreList(params);
      const scores = res.rows || res.data || [];
      
      // 转换为 CSV 格式
      const headers = ['时间', '服务类型', '积分', '状态', '任务ID'];
      const rows = scores.map((score: ScoreRecord) => {
        const scoreValue = Number(score.score) || 0;
        const displayValue = -scoreValue; // 扣积分取反显示
        const assetTypeMap: Record<number, string> = {
          1: '视频生成',
          2: 'AI对话',
          3: '视频编辑',
          4: '视频制作',
          5: '视频录制',
          6: '万物迁移',
          7: '图像处理',
          8: '语音处理',
          9: 'AI助手',
          10: '智能分析',
          11: 'AI视频换脸',
          15: 'AI创作实验室',
        };
        const typeText = assetTypeMap[score.assetType] || '未知服务';
        const statusText = {
          '1': '已完成',
          '0': '进行中',
          '-1': '失败',
        }[String(score.status) || '0'] || '未知';
        
        return [
          score.createTime || '-',
          typeText,
          displayValue,
          statusText,
          score.taskId || '-',
        ];
      });
      
      // 生成 CSV 内容
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // 添加 BOM 以支持中文
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `积分账单_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请稍后重试');
    }
  };

  // 导出团队日志 - 借鉴 Nebula1 的传参方式
  const handleExportLogs = async () => {
    if (!selectedTeamId) {
      alert('请先选择团队');
      return;
    }

    try {
      // 转换时间范围为 Unix 时间戳（秒）- 与 Nebula1 保持一致
      const getTimestamp = (dateValue: Date | null): number | undefined => {
        if (!dateValue) return undefined;
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
          console.error('无效的时间值:', dateValue);
          return undefined;
        }
        return Math.floor(date.getTime() / 1000);
      };
      
      const startTime = getTimestamp(dateRange[0]);
      const endTime = getTimestamp(dateRange[1]);
      
      // 借鉴 Nebula1 的传参方式（与查询接口保持一致）
      const params: TeamLogsQuery = {
        // teamIds: 单选值，转换为字符串
        teamIds: String(selectedTeamId),
        // userIds: 多选数组，用逗号连接
        userIds: selectedUserIds.length > 0 ? selectedUserIds.join(',') : undefined,
        // types: 多选数组，用逗号连接
        types: selectedTypes.length > 0 ? selectedTypes.join(',') : undefined,
        // startTime/endTime: Unix 时间戳（秒）
        startTime,
        endTime,
      };
      
      console.log('导出日志参数（借鉴 Nebula1）:', params);

      const blob = await expenseService.exportTeamLogs(params);
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `日志账单_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请稍后重试');
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
    } else if (currentMode === 'logos') {
      if (isShowTeamLogos) {
        // 先加载团队列表（类似 Nebula1 的初始化逻辑）
        await fetchTeamList();
        // 如果已经有选中的团队ID，则加载日志数据
        // 注意：fetchTeamList 内部会自动选择第一个团队并加载成员
        // 所以这里不需要立即调用 fetchTeamLogs，等用户点击搜索按钮
      }
    }
  };

  const handleRefresh = async () => {
    await initData();
  };

  const handleModeChange = (mode: 'balance' | 'points' | 'logos') => {
    setCurrentMode(mode);
    setPagination(prev => ({
      ...prev,
      current: 1,
      pageSize: 10,
    }));
  };

  // 处理团队选择变化
  const handleTeamChange = async (teamId: string | number | null) => {
    setSelectedTeamId(teamId);
    setSelectedUserIds([]);
    if (teamId) {
      await fetchTeamMembers(teamId);
    } else {
      setMemberOptions([]);
    }
  };

  // 重置筛选条件
  const handleResetFilters = () => {
    setSelectedTeamId(null);
    setSelectedUserIds([]);
    setSelectedTypes(['2']); // 默认选择消费
    setDateRange([
      new Date(Date.now() - 24 * 60 * 60 * 1000), // 昨天
      new Date(), // 今天
    ]);
    setMemberOptions([]);
  };

  // 手动触发搜索
  const handleSearch = () => {
    if (selectedTeamId) {
      fetchTeamLogs(1);
    }
  };

  // 移除费用类型标签
  const handleRemoveType = (type: string) => {
    setSelectedTypes(selectedTypes.filter(t => t !== type));
  };

  useEffect(() => {
    initData();
  }, [currentMode, user?.nebulaApiId, user?.userId]);

  useEffect(() => {
    if (user?.nebulaApiId || user?.userId) {
      initData();
    }
  }, [user?.nebulaApiId, user?.userId]);

  // 监听日志模式下的筛选条件变化 - 移除自动查询，改为手动搜索
  // useEffect(() => {
  //   if (currentMode === 'logos' && selectedTeamId) {
  //     fetchTeamLogs(1);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [currentMode, selectedTeamId, selectedUserIds.join(','), selectedTypes.join(','), dateRange[0]?.getTime(), dateRange[1]?.getTime()]);

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
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      timeStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } else if (timeStr && timeStr !== '-') {
      // 如果已有时间字符串，尝试格式化为统一格式
      try {
        const date = new Date(timeStr);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const seconds = String(date.getSeconds()).padStart(2, '0');
          timeStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }
      } catch {
        // 如果解析失败，保持原样
      }
    }

    const useTime = log.useTime ? `${log.useTime}s` : '0s';
    const isConsumption = String(log.type) === '2';
    // type=1 是充值（正数），type=2 是扣费（负数）
    const costValue = Number(log.quotaRmb || log.quota || 0);
    const cost = isConsumption ? -Math.abs(costValue) : Math.abs(costValue);
    
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
    <div className="min-h-screen pb-12 font-sans bg-white dark:bg-zinc-900">
      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        
        {/* Balance and Quick Actions - 左右布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* 左侧：余额/积分信息框 - 始终显示余额相关内容 */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-gray-200 dark:border-zinc-700 shadow-sm">
            <>
              <div className="text-sm text-gray-600 dark:text-zinc-400 mb-2">可用余额 (CNY)</div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                ¥{quotaLoading ? '...' : formatPoints(balance)}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
                <span>可兑换积分:</span>
                <span className="font-semibold text-gray-700 dark:text-zinc-200">{formatPoints(points)}</span>
              </div>
            </>
          </div>

          {/* 右侧：快捷操作框 */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-gray-200 dark:border-zinc-700 shadow-sm flex flex-col items-center justify-center space-y-4">
            {/* 余额、积分和日志/账单切换按钮 */}
            <div className="text-sm text-gray-600 dark:text-zinc-400">快捷操作</div>

            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => handleModeChange('balance')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  currentMode === 'balance'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'
                }`}
              >
                余额
              </button>
              <button
                onClick={() => handleModeChange('points')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  currentMode === 'points'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'
                }`}
              >
                积分
              </button>
              {isShowTeamLogos && (
                <button
                  onClick={() => handleModeChange('logos')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    currentMode === 'logos'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'
                  }`}
                >
                  日志/账单
                </button>
              )}
            </div>
            <div className="flex flex-col items-center gap-3 w-full">
              <button
                onClick={handleRefresh}
                disabled={loading || quotaLoading}
                className={`min-w-[160px] px-4 py-2 text-sm text-white rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  currentMode === 'points'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : currentMode === 'logos'
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <RefreshCw size={18} className={loading || quotaLoading ? 'animate-spin' : ''} />
                <span className="whitespace-nowrap">
                  {currentMode === 'points'
                    ? '刷新积分'
                    : currentMode === 'logos'
                    ? '刷新日志'
                    : '刷新余额'}
                </span>
              </button>
              <p className="text-xs text-gray-500 dark:text-zinc-500">数据同步可能存在延迟</p>
            </div>
          </div>
        </div>

        {/* Usage List - 按照图片布局 */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-zinc-100">
                {currentMode === 'logos' ? '日志/账单' : t.recordsTitle}
              </h2>
              <div className="flex items-center gap-3">
                {currentMode === 'logos' && (
                  <>
                    <button
                      onClick={handleExportLogs}
                      disabled={loading || !selectedTeamId}
                      className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600 text-gray-700 dark:text-zinc-200 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="导出"
                    >
                      <Download size={16} />
                      导出
                    </button>
                    <button
                      onClick={() => selectedTeamId && fetchTeamLogs(pagination.current)}
                      disabled={loading || !selectedTeamId}
                      className="p-2 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="刷新"
                    >
                      <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                      className="p-2 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                      title="全屏"
                    >
                      <Maximize2 size={16} />
                    </button>
                    <button
                      className="p-2 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                      title="设置"
                    >
                      <Settings size={16} />
                    </button>
                  </>
                )}
                {currentMode === 'balance' && (
                  <>
                    <button
                      onClick={handleExportBalance}
                      disabled={loading}
                      className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600 text-gray-700 dark:text-zinc-200 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="导出账单"
                    >
                      <Download size={16} />
                      导出账单
                    </button>
                    <span className="text-sm text-gray-500 dark:text-zinc-400">
                      共 {pagination.total} 条记录
                    </span>
                  </>
                )}
                {currentMode === 'points' && (
                  <>
                    <button
                      onClick={handleExportPoints}
                      disabled={loading}
                      className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600 text-gray-700 dark:text-zinc-200 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="导出账单"
                    >
                      <Download size={16} />
                      导出账单
                    </button>
                    <span className="text-sm text-gray-500 dark:text-zinc-400">
                      共 {pagination.total} 条记录
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* 余额/积分模式：日期选择器 */}
            {(currentMode === 'balance' || currentMode === 'points') && (
              <div className="mb-6 p-4 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 whitespace-nowrap">时间范围：</label>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1 min-w-0">
                      <input
                        type="date"
                        value={currentMode === 'balance' 
                          ? (balanceDateRange[0] ? balanceDateRange[0].toISOString().split('T')[0] : '')
                          : (pointsDateRange[0] ? pointsDateRange[0].toISOString().split('T')[0] : '')
                        }
                        onChange={(e) => {
                          if (currentMode === 'balance') {
                            setBalanceDateRange([e.target.value ? new Date(e.target.value) : null, balanceDateRange[1]]);
                          } else {
                            setPointsDateRange([e.target.value ? new Date(e.target.value) : null, pointsDateRange[1]]);
                          }
                        }}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100"
                      />
                    </div>
                    <span className="text-gray-400 dark:text-zinc-500 flex-shrink-0 px-1">至</span>
                    <div className="relative flex-1 min-w-0">
                      <input
                        type="date"
                        value={currentMode === 'balance'
                          ? (balanceDateRange[1] ? balanceDateRange[1].toISOString().split('T')[0] : '')
                          : (pointsDateRange[1] ? pointsDateRange[1].toISOString().split('T')[0] : '')
                        }
                        onChange={(e) => {
                          if (currentMode === 'balance') {
                            setBalanceDateRange([balanceDateRange[0], e.target.value ? new Date(e.target.value) : null]);
                          } else {
                            setPointsDateRange([pointsDateRange[0], e.target.value ? new Date(e.target.value) : null]);
                          }
                        }}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (currentMode === 'balance') {
                          fetchExpenseLogs(1);
                        } else {
                          fetchScoreList(1);
                        }
                      }}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Search size={16} />
                      查询
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 日志/账单模式：筛选条件 - 按照 Nebula1 设计 */}
            {currentMode === 'logos' && (
              <div className="mb-6 p-4 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* 团队选择 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">团队</label>
                    <div className="relative">
                      <select
                        value={selectedTeamId || ''}
                        onChange={(e) => handleTeamChange(e.target.value || null)}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 appearance-none bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100"
                      >
                        <option value="">请选择</option>
                        {teamOptions.map((team) => (
                          <option key={team.value} value={team.value}>
                            {team.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* 成员选择 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">成员</label>
                    <div className="relative">
                      <select
                        value={selectedUserIds.length > 0 ? selectedUserIds[0] : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            setSelectedUserIds([e.target.value]);
                          } else {
                            setSelectedUserIds([]);
                          }
                        }}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 appearance-none bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100"
                      >
                        <option value="">请选择</option>
                        {memberOptions.map((member) => (
                          <option key={member.value} value={String(member.value)}>
                            {member.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* 费用类型 - 标签形式 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">费用类型</label>
                    <div className="flex flex-wrap gap-2 min-h-[42px] p-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700">
                      {selectedTypes.length === 0 ? (
                        <span className="text-sm text-gray-400 dark:text-zinc-500">请选择</span>
                      ) : (
                        selectedTypes.map((type) => (
                          <span
                            key={type}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium"
                          >
                            {type === '1' ? '充值' : '消费'}
                            <button
                              onClick={() => handleRemoveType(type)}
                              className="hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                    {selectedTypes.length < 2 && (
                      <div className="mt-2 flex gap-2">
                        {!selectedTypes.includes('1') && (
                          <button
                            onClick={() => setSelectedTypes([...selectedTypes, '1'])}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                          >
                            + 充值
                          </button>
                        )}
                        {!selectedTypes.includes('2') && (
                          <button
                            onClick={() => setSelectedTypes([...selectedTypes, '2'])}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                          >
                            + 消费
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 时间范围 - 单个范围选择器 */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">时间</label>
                    <div className="flex items-center gap-1 w-full">
                      <div className="relative flex-1 min-w-0">
                        <input
                          type="date"
                          value={dateRange[0] ? dateRange[0].toISOString().split('T')[0] : ''}
                          onChange={(e) => setDateRange([e.target.value ? new Date(e.target.value) : null, dateRange[1]])}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <span className="text-gray-400 dark:text-zinc-500 flex-shrink-0 px-1">→</span>
                      <div className="relative flex-1 min-w-0">
                        <input
                          type="date"
                          value={dateRange[1] ? dateRange[1].toISOString().split('T')[0] : ''}
                          onChange={(e) => setDateRange([dateRange[0], e.target.value ? new Date(e.target.value) : null])}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 text-gray-700 dark:text-zinc-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    重置
                  </button>
                  <button
                    onClick={handleSearch}
                    disabled={!selectedTeamId || loading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Search size={16} />
                    搜索
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-500 dark:text-zinc-400">
                <RefreshCw className="animate-spin mr-2" size={20} />
                加载中...
              </div>
            ) : (
              <>
                {currentMode === 'logos' ? (
                  /* 日志/账单模式：表格展示 - 按照 Nebula1 设计 */
                  <div className="overflow-x-auto">
                    {teamLogs.length === 0 ? (
                      <div className="py-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 dark:bg-zinc-700 rounded-lg">
                          <svg className="w-8 h-8 text-gray-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <div className="text-gray-500 dark:text-zinc-400 text-sm font-medium">暂无数据</div>
                      </div>
                    ) : (
                      <>
                        <div className="border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                          <table className="w-full border-collapse bg-white dark:bg-zinc-800">
                            <thead>
                              <tr className="bg-gray-50 dark:bg-zinc-700 border-b border-gray-200 dark:border-zinc-600">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-zinc-200">团队名称</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-zinc-200">用户名</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-zinc-200">创作/令牌</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-zinc-200">功能/模型</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-zinc-200">费用(¥)</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-zinc-200">费用类型</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-zinc-200">时间</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-zinc-200">输入(Tokens)</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-zinc-200">完成(Tokens)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {teamLogs.map((log) => {
                                const isConsumption = String(log.type) === '2';
                                return (
                                  <tr key={log.id} className="border-b border-gray-100 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-zinc-200">{log.teamName || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-zinc-200">{log.userName || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-zinc-200">{log.tokenName || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-zinc-200">{log.modelName || '-'}</td>
                                    <td className={`px-4 py-3 text-sm font-medium ${isConsumption ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                      {isConsumption ? '-' : '+'}¥{Number(log.quotaRmb || 0).toFixed(6)}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                        isConsumption 
                                          ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' 
                                          : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                                      }`}>
                                        {isConsumption ? '消费' : '充值'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-zinc-400">{log.createdAt || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-zinc-400">{log.promptTokens || 0}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-zinc-400">{log.completionTokens || 0}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination Footer - 按照 Nebula1 设计 */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-zinc-700 mt-4">
                          <div className="text-sm text-gray-600 dark:text-zinc-400">
                            共 {pagination.total} 条记录
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={pagination.pageSize}
                              onChange={(e) => {
                                const newPageSize = Number(e.target.value);
                                fetchTeamLogs(1, newPageSize);
                              }}
                              className="px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded text-sm text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                            >
                              <option value={10}>10条/页</option>
                              <option value={20}>20条/页</option>
                              <option value={50}>50条/页</option>
                              <option value={100}>100条/页</option>
                            </select>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => fetchTeamLogs(1)}
                                disabled={pagination.current <= 1}
                                className="p-2 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="第一页"
                              >
                                ««
                              </button>
                              <button
                                onClick={() => fetchTeamLogs(pagination.current - 1)}
                                disabled={pagination.current <= 1}
                                className="p-2 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="上一页"
                              >
                                «
                              </button>
                              <span className="px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30 rounded">
                                {pagination.current}
                              </span>
                              <button
                                onClick={() => fetchTeamLogs(pagination.current + 1)}
                                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                                className="p-2 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="下一页"
                              >
                                »
                              </button>
                              <button
                                onClick={() => fetchTeamLogs(Math.ceil(pagination.total / pagination.pageSize))}
                                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                                className="p-2 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="最后一页"
                              >
                                »»
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  /* 余额/积分模式：列表展示 - 按照图片布局 */
                  <>
                    {(currentMode === 'balance' ? expenseLogs : scoreList).length === 0 ? (
                      <div className="py-16 text-center">
                        <div className="text-6xl mb-4 opacity-50">📊</div>
                        <div className="text-gray-500 dark:text-zinc-400 text-lg font-medium">暂无记录</div>
                        <div className="text-gray-400 dark:text-zinc-500 text-sm mt-2">
                          {currentMode === 'balance' ? '暂无使用记录' : '暂无积分流水'}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {currentMode === 'balance' ? (
                          expenseLogs.map((log) => (
                            <ExpenseListItem key={log.id} record={convertLogToExpenseRecord(log)} t={t} />
                          ))
                        ) : (
                          scoreList.map((score) => (
                            <ScoreListItem key={score.id} score={score} t={t} />
                          ))
                        )}
                      </div>
                    )}

                    {/* Pagination Footer - 按照图片布局 */}
                    {!loading && pagination.total > 0 && (
                      <div className="flex items-center justify-center gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-zinc-700">
                        <button
                          onClick={() => currentMode === 'balance' ? fetchExpenseLogs(pagination.current - 1) : fetchScoreList(pagination.current - 1)}
                          disabled={pagination.current <= 1}
                          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 text-gray-700 dark:text-zinc-300 font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          上一页
                        </button>
                        <span className="text-sm text-gray-600 dark:text-zinc-400 font-medium">
                          {pagination.current}/{Math.ceil(pagination.total / pagination.pageSize)}
                        </span>
                        <button
                          onClick={() => currentMode === 'balance' ? fetchExpenseLogs(pagination.current + 1) : fetchScoreList(pagination.current + 1)}
                          disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 text-gray-700 dark:text-zinc-300 font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          下一页
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 导入模态框 */}
      <TeamLogsImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          // 导入成功后刷新数据
          if (currentMode === 'logos' && selectedTeamId) {
            fetchTeamLogs(1);
          }
        }}
      />
    </div>
  );
};

// 余额记录列表项组件 - 按照图片布局
const ExpenseListItem: React.FC<{
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
  const totalTokens = record.totalTokens || 0;
  const promptTokens = record.promptTokens || 0;
  const completionTokens = record.completionTokens || 0;
  
  return (
    <div className="flex items-start gap-4 p-4 bg-white dark:bg-zinc-800 border-b border-gray-100 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
      {/* 图标 - 橙色方块，白色文档符号 */}
      <div className="w-10 h-10 bg-orange-500 rounded flex items-center justify-center flex-shrink-0">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      
      {/* 服务/模型名和详细信息 */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 dark:text-zinc-200 mb-1.5">{record.modelName}</div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400 mb-2">
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-gray-400 dark:text-zinc-500" />
            <span>{record.timestamp}</span>
          </div>
        </div>
        {/* 类型、用时、输入token、输出token - 一行显示 */}
        <div className="flex items-center gap-4 text-xs">
          {/* 类型 */}
          <div className="flex items-center gap-1">
            <span className="text-gray-500 dark:text-zinc-400">类型:</span>
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
              isConsumption 
                ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' 
                : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
            }`}>
              {isConsumption ? '消费' : '充值'}
            </span>
          </div>
          {/* 用时 */}
          <div className="flex items-center gap-1">
            <span className="text-gray-500 dark:text-zinc-400">用时:</span>
            <span className="text-gray-800 dark:text-zinc-200 font-medium">{record.duration}</span>
          </div>
          {/* 输入token */}
          <div className="flex items-center gap-1">
            <span className="text-gray-500 dark:text-zinc-400">输入token:</span>
            <span className="text-gray-800 dark:text-zinc-200 font-medium">{promptTokens.toLocaleString()}</span>
          </div>
          {/* 输出token */}
          <div className="flex items-center gap-1">
            <span className="text-gray-500 dark:text-zinc-400">输出token:</span>
            <span className="text-gray-800 dark:text-zinc-200 font-medium">{completionTokens.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      {/* 金额 - 充值显示绿色正数，扣费显示红色负数 */}
      <div className={`text-sm font-medium whitespace-nowrap self-center ${
        isConsumption ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
      }`}>
        ￥ {record.cost >= 0 ? '+' : ''}{record.cost.toFixed(4)}
      </div>
    </div>
  );
};

// 积分记录列表项组件 - 按照图片布局
const ScoreListItem: React.FC<{
  score: ScoreRecord;
  t: ExpensesPageProps['t'];
}> = ({ score, t }) => {
  const scoreValue = Number(score.score) || 0;
  // score 是扣积分，所以取反显示
  const displayValue = -scoreValue;
  const isPositive = displayValue > 0;
  const assetTypeMap: Record<number, { text: string; icon: string }> = {
    1: { text: '视频生成', icon: '🎬' },
    2: { text: 'AI对话', icon: '🤖' },
    3: { text: '视频编辑', icon: '🎥' },
    4: { text: '视频制作', icon: '🎞️' },
    5: { text: '视频录制', icon: '📹' },
    6: { text: '万物迁移', icon: '🌟' },
    7: { text: '图像处理', icon: '🎨' },
    8: { text: '语音处理', icon: '🎤' },
    9: { text: 'AI助手', icon: '🤖' },
    10: { text: '智能分析', icon: '🤖' },
    11: { text: 'AI视频换脸', icon: '🤖' },
    15: { text: 'AI创作实验室', icon: '🤖' },
  };
  
  const typeInfo = assetTypeMap[score.assetType] || { text: '未知服务', icon: '❓' };
  
  // 格式化时间戳
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
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch {
      return timeStr;
    }
  };
  
  // 状态映射
  const statusInfo = {
    '1': { text: '已完成', class: 'text-gray-600 dark:text-zinc-400' },
    '0': { text: '进行中', class: 'text-gray-600 dark:text-zinc-400' },
    '-1': { text: '失败', class: 'text-red-600 dark:text-red-400' },
  }[String(score.status) || '0'] || { text: '未知', class: 'text-gray-600 dark:text-zinc-400' };
  
  return (
    <div className="flex items-start gap-4 p-4 bg-white dark:bg-zinc-800 border-b border-gray-100 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
      {/* 图标 - 浅蓝色方块，白色文档符号 */}
      <div className="w-10 h-10 bg-blue-400 rounded flex items-center justify-center flex-shrink-0">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      
      {/* 服务名和时间戳+ID */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 dark:text-zinc-200 mb-1.5">{typeInfo.text}</div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
          <Clock size={12} className="text-gray-400 dark:text-zinc-500" />
          <span>{formatTimestamp(score.createTime || '-')}</span>
          {score.taskId && (
            <>
              {/* <span className="mx-1">ID:</span> */}
              {/* <span className="font-mono">{score.taskId}</span> */}
            </>
          )}
        </div>
      </div>
      
      {/* 右侧：积分值和状态，右对齐 */}
      <div className="flex flex-col items-end gap-1">
        {/* 积分值 - 扣积分显示为红色 */}
        <div className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {isPositive ? '+' : ''}{displayValue} 积分
        </div>
        {/* 状态 */}
        <div className={`text-xs ${statusInfo.class}`}>
          {statusInfo.text}
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
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Card Header - 按照 Nebula1 布局 */}
      <div className="p-4">
        {/* 模型信息 */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🤖</span>
          <span className="font-semibold text-gray-800 dark:text-zinc-200">{record.modelName}</span>
        </div>
        {/* 金额 - 充值显示绿色正数，扣费显示红色负数 */}
        <div className={`inline-flex items-center px-3 py-1.5 rounded text-base font-bold font-mono ${
          isConsumption 
            ? 'text-red-600 dark:text-red-400 bg-pink-50 dark:bg-red-900/30' 
            : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30'
        }`}>
          ¥{record.cost >= 0 ? '+' : ''}{record.cost.toFixed(6)}
        </div>
      </div>

      {/* Card Body - 两列布局 */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* 左列 */}
          <div className="space-y-3">
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-zinc-400 text-xs mb-1">{t.record.type}:</span>
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium w-fit ${
                isConsumption 
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' 
                  : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              }`}>
                {isConsumption ? t.record.consumption : '充值'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-zinc-400 text-xs mb-1">{t.record.input}</span>
              <span className="text-gray-800 dark:text-zinc-200 font-medium">{promptTokens.toLocaleString()}</span>
            </div>
          </div>
          
          {/* 右列 */}
          <div className="space-y-3">
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-zinc-400 text-xs mb-1">{t.record.duration}:</span>
              <span className="text-gray-800 dark:text-zinc-200 font-medium">{record.duration}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-zinc-400 text-xs mb-1">{t.record.output}</span>
              <span className="text-gray-800 dark:text-zinc-200 font-medium">{completionTokens.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-700/50 border-t border-gray-100 dark:border-zinc-700">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
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
  // score 是扣积分，所以取反显示
  const displayValue = -scoreValue;
  const isPositive = displayValue > 0;
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
    '1': { text: '已扣款', class: 'bg-blue-600 text-white' }, // 已完成 -> 已扣款，深蓝色背景，白色文字
    '0': { text: '进行中', class: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
    '-1': { text: '失败', class: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  }[String(score.status) || '0'] || { text: '未知', class: 'bg-gray-50 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300' };
  
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
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Top Section - 服务名称和图标 - 按照 Nebula1 图片布局 */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          {/* 图标容器 - 白色背景，圆角方形 */}
          <div className="w-10 h-10 bg-white dark:bg-zinc-700 rounded-lg flex items-center justify-center shadow-sm border border-gray-100 dark:border-zinc-600">
            <span className="text-xl">{typeInfo.icon}</span>
          </div>
          <span className="font-semibold text-gray-800 dark:text-zinc-200">{typeInfo.text}</span>
        </div>
      </div>

      {/* Middle Section - 积分值和状态 */}
      <div className="px-4 pb-4 border-b border-gray-100 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          {/* 左侧：积分值 - 扣积分显示为红色 */}
          <div className={`text-base font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPositive ? '+' : ''}{displayValue} 积分
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
      <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-700/50">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
          <Clock size={12} />
          <span>{formatTimestamp(score.createTime || '-')}</span>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;