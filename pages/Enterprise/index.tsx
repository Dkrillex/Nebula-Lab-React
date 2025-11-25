import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Plus, RefreshCw, Search, Edit2, Trash2, 
  Eye, UserPlus, UserPlus2, X, Check, AlertCircle, 
  DollarSign, Award, Shield
} from 'lucide-react';
import { teamService, LabTeamVO, LabTeamForm } from '../../services/teamService';
import { teamUserService, TeamUserDetailVO } from '../../services/teamUserService';
import { teamRoleService, TeamRoleVO } from '../../services/teamRoleService';
import { userInviteService, UserInviteVO } from '../../services/userInviteService';
import { quotaService } from '../../services/quotaService';
import { useAuthStore } from '../../stores/authStore';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ConfirmDialog';

interface EnterprisePageProps {
  t: any;
}

const EnterprisePage: React.FC<EnterprisePageProps> = ({ t }) => {
  const { user, isAuthenticated } = useAuthStore();
  
  // 团队列表状态
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamList, setTeamList] = useState<LabTeamVO[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 团队表单状态
  const [teamModalVisible, setTeamModalVisible] = useState(false);
  const [isTeamEditMode, setIsTeamEditMode] = useState(false);
  const [teamSubmitting, setTeamSubmitting] = useState(false);
  const [teamFormData, setTeamFormData] = useState<LabTeamForm>({
    teamName: '',
    remark: '',
    status: 1,
    teamRoles: [],
  });
  const [roleInputValue, setRoleInputValue] = useState('');

  // 成员查看状态
  const [viewMembersModalVisible, setViewMembersModalVisible] = useState(false);
  const [teamMemberList, setTeamMemberList] = useState<TeamUserDetailVO[]>([]);
  const [memberViewLoading, setMemberViewLoading] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<LabTeamVO | null>(null);
  const [memberViewPagination, setMemberViewPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 添加成员状态
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [inviteUserList, setInviteUserList] = useState<UserInviteVO[]>([]);
  const [memberSearchKeyword, setMemberSearchKeyword] = useState('');
  const [memberLoading, setMemberLoading] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [memberPagination, setMemberPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 邀请成员状态
  const [inviteTypeModalVisible, setInviteTypeModalVisible] = useState(false);

  // 编辑角色状态
  const [editRoleModalVisible, setEditRoleModalVisible] = useState(false);
  const [currentEditMember, setCurrentEditMember] = useState<TeamUserDetailVO | null>(null);
  const [teamRoleList, setTeamRoleList] = useState<TeamRoleVO[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number>(0);

  // 修改权限状态
  const [editAuthModalVisible, setEditAuthModalVisible] = useState(false);
  const [selectedAuthType, setSelectedAuthType] = useState<number>(1);

  // 配额状态
  const [allocateQuotaModalVisible, setAllocateQuotaModalVisible] = useState(false);
  const [currentAllocateMember, setCurrentAllocateMember] = useState<TeamUserDetailVO | null>(null);
  const [allocateQuotaAmountRmb, setAllocateQuotaAmountRmb] = useState<number>(0);
  const [currentUserQuotaInfo, setCurrentUserQuotaInfo] = useState<any>(null);
  const [quotaLoading, setQuotaLoading] = useState(false);

  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // 权限判断
  // 检查用户是否有有效的 channelId（非空、非0）
  const hasChannelPermission = (() => {
    const channelId = user?.channelId;
    if (channelId === null || channelId === undefined) {
      return false;
    }
    // 处理 number 和 string 类型
    if (typeof channelId === 'number') {
      return channelId !== 0;
    }
    if (typeof channelId === 'string') {
      return channelId !== '' && channelId !== '0';
    }
    return false;
  })();

  // 检查用户是否有团队或 channelId（Vue 中的逻辑：有团队列表或 channelId 不为 null）
  const hasTeams = (user?.team && user.team.length > 0) || user?.channelId !== null;
  
  // 如果用户有团队，即使没有 channelId 也应该能显示团队列表
  const canShowTeamList = hasTeams;

  const canCreateTeam = user?.channelId !== null && 
                        user?.channelId !== undefined && 
                        user?.channelId !== '' && 
                        user?.channelId !== 0;

  const showQuotaInfo = canCreateTeam || (user?.team && user.team.some((t: any) => t.userAuthType === 2));

  // 辅助函数
  const getUserAuthTypeInTeam = (teamId: number) => {
    if (!user?.team) return null;
    const team = user.team.find((t: any) => t.teamId === teamId);
    return team?.userAuthType || null;
  };

  const isChannelOwner = (team: LabTeamVO) => {
    const userChannelId = user?.channelId;
    const teamChannelId = team.channelId;
    return userChannelId && teamChannelId && userChannelId === teamChannelId;
  };

  const canManageTeam = (team: LabTeamVO) => {
    const authType = getUserAuthTypeInTeam(team.teamId);
    return isChannelOwner(team) || authType === 2;
  };

  const canDeleteTeam = (team: LabTeamVO) => {
    return isChannelOwner(team);
  };

  const canManageMembers = (team: LabTeamVO) => {
    const authType = getUserAuthTypeInTeam(team.teamId);
    return isChannelOwner(team) || authType === 2;
  };

  const isCurrentUser = (member: TeamUserDetailVO) => {
    return user?.userId && member.userId === user.userId;
  };

  const formatRmb = (quota: number | undefined) => {
    if (quota === undefined || quota === null) return '0.00';
    const tokensPerDollar = 500000;
    const dollarToRmbRate = 7.3;
    const quotaDollar = quota / tokensPerDollar;
    const quotaRmb = quotaDollar * dollarToRmbRate;
    return quotaRmb.toFixed(2);
  };

  // 将quota转换为人民币数值（返回数字字符串）
  const formatRmbNumber = (quota: number) => {
    const tokensPerDollar = 500000;
    const dollarToRmbRate = 7.3;
    const quotaDollar = quota / tokensPerDollar;
    const quotaRmb = quotaDollar * dollarToRmbRate;
    return quotaRmb.toFixed(2);
  };

  const rmbToQuota = (rmb: number) => {
    const tokensPerDollar = 500000;
    const dollarToRmbRate = 7.3;
    const dollar = rmb / dollarToRmbRate;
    return Math.round(dollar * tokensPerDollar);
  };

  const getMaxAllocateAmount = () => {
    const currentBalance = parseFloat(currentUserQuotaInfo?.quotaRmb || '0');
    const maxAmount = Math.max(0, currentBalance - 0.01);
    return parseFloat(maxAmount.toFixed(2));
  };

  // 根据quota和会员等级计算积分
  const calculateScore = (quota: number | undefined, memberLevel: string | undefined) => {
    if (!quota) return '0.00';
    const rmb = parseFloat(formatRmbNumber(quota));

    if (memberLevel === 'Starter') {
      return (rmb / 1.72).toFixed(2);
    } else if (memberLevel === 'Business') {
      return (rmb / 1.59).toFixed(2);
    } else {
      return (rmb / 2).toFixed(2); // 普通会员
    }
  };

  // 获取会员等级文本显示
  const getMemberLevelText = (level: string | undefined) => {
    if (!level || level === '未知' || level === '') {
      return '普通会员';
    }
    return level;
  };

  // 配额对应的quota值
  const allocateQuotaAmount = useMemo(() => {
    if (!allocateQuotaAmountRmb) return 0;
    return rmbToQuota(allocateQuotaAmountRmb);
  }, [allocateQuotaAmountRmb]);

  // 成员配额后的余额（人民币）
  const memberAfterQuotaRmb = useMemo(() => {
    if (!currentAllocateMember?.quota || !allocateQuotaAmount) {
      return formatRmb(currentAllocateMember?.quota);
    }
    const newQuota = currentAllocateMember.quota + allocateQuotaAmount;
    return formatRmbNumber(newQuota);
  }, [currentAllocateMember?.quota, allocateQuotaAmount]);

  // 成员配额后的积分
  const memberAfterQuotaScore = useMemo(() => {
    if (!currentAllocateMember?.quota || !allocateQuotaAmount || !currentUserQuotaInfo) {
      return '0.00';
    }
    const newQuota = currentAllocateMember.quota + allocateQuotaAmount;
    const rmb = parseFloat(formatRmbNumber(newQuota));
    const memberLevel = currentUserQuotaInfo.memberLevel; // 使用配额人的会员等级

    if (memberLevel === 'Starter') {
      return (rmb / 1.72).toFixed(2);
    } else if (memberLevel === 'Business') {
      return (rmb / 1.59).toFixed(2);
    } else {
      return (rmb / 2).toFixed(2);
    }
  }, [currentAllocateMember?.quota, allocateQuotaAmount, currentUserQuotaInfo]);

  // 配额人配额后的余额（人民币）
  const myAfterQuotaRmb = useMemo(() => {
    if (!currentUserQuotaInfo?.quota || !allocateQuotaAmount) {
      return currentUserQuotaInfo?.quotaRmb || '0.00';
    }
    const newQuota = currentUserQuotaInfo.quota - allocateQuotaAmount;
    return formatRmbNumber(newQuota);
  }, [currentUserQuotaInfo?.quota, allocateQuotaAmount]);

  // 配额人配额后的积分
  const myAfterQuotaScore = useMemo(() => {
    if (!currentUserQuotaInfo?.quota || !allocateQuotaAmount) {
      return currentUserQuotaInfo?.score || '0.00';
    }
    const newQuota = currentUserQuotaInfo.quota - allocateQuotaAmount;
    const rmb = parseFloat(formatRmbNumber(newQuota));
    const memberLevel = currentUserQuotaInfo.memberLevel;

    if (memberLevel === 'Starter') {
      return (rmb / 1.72).toFixed(2);
    } else if (memberLevel === 'Business') {
      return (rmb / 1.59).toFixed(2);
    } else {
      return (rmb / 2).toFixed(2);
    }
  }, [currentUserQuotaInfo?.quota, allocateQuotaAmount]);

  const getMemberLevelColor = (level: string | undefined) => {
    const colorMap: Record<string, string> = {
      'Starter': 'bg-indigo-100 text-indigo-700',
      'Business': 'bg-yellow-100 text-yellow-700',
    };
    return colorMap[level || ''] || 'bg-gray-100 text-gray-700';
  };

  const getAuthTypeText = (type: number) => {
    const typeMap: Record<number, string> = {
      1: '成员',
      2: 'leader',
      3: '管理员',
    };
    return typeMap[type] || '未知';
  };

  const getAuthTypeColor = (type: number) => {
    const colorMap: Record<number, string> = {
      1: 'bg-indigo-100 text-indigo-700',
      2: 'bg-green-100 text-green-700',
      3: 'bg-red-100 text-red-700',
    };
    return colorMap[type] || 'bg-gray-100 text-gray-700';
  };

  // 数据获取函数
  const fetchTeamList = async () => {
    setTeamLoading(true);
    try {
      const response = await teamService.getTeamList({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        teamName: searchKeyword || undefined,
      });
      console.log('获取团队列表响应:', response);
      console.log('团队列表数据:', response?.rows);
      console.log('团队总数:', response?.total);
      setTeamList(response?.rows || []);
      setPagination(prev => ({ ...prev, total: response?.total || 0 }));
    } catch (error) {
      console.error('获取团队列表失败:', error);
      toast.error('获取团队列表失败');
    } finally {
      setTeamLoading(false);
    }
  };

  const fetchTeamMemberList = async (teamId: number) => {
    setMemberViewLoading(true);
    try {
      const response = await teamUserService.teamUserDetailListByTeam(teamId, {
        pageNum: memberViewPagination.current,
        pageSize: memberViewPagination.pageSize,
      });
      setTeamMemberList(response.rows || []);
      setMemberViewPagination(prev => ({ ...prev, total: response.total || 0 }));
    } catch (error) {
      console.error('获取团队成员列表失败:', error);
    } finally {
      setMemberViewLoading(false);
    }
  };

  const fetchInviteUserList = async (team?: LabTeamVO) => {
    const targetTeam = team || currentTeam;
    if (!targetTeam) return;
    
    setMemberLoading(true);
    try {
      // 优先使用团队的 channelId
      let channelId = targetTeam.channelId || (targetTeam as any).channel?.channelId;
      
      // 如果团队没有 channelId，则使用用户自己的 channelId
      if (!channelId) {
        channelId = user?.channelId;
      }
      
      if (!channelId) {
        console.error('添加成员 - 无法获取channelId');
        toast.error('获取渠道ID失败，请确认团队已关联渠道');
        setMemberLoading(false);
        return;
      }
      
      const response = await userInviteService.userInviteDetailList(
        channelId,
        memberSearchKeyword,
        {
          pageNum: memberPagination.current,
          pageSize: memberPagination.pageSize,
        }
      );
      setInviteUserList(response.rows || []);
      setMemberPagination(prev => ({ ...prev, total: response.total || 0 }));
    } catch (error) {
      console.error('获取邀请用户列表失败:', error);
      toast.error('获取邀请用户列表失败');
    } finally {
      setMemberLoading(false);
    }
  };

  const fetchTeamRoles = async (teamId: number) => {
    try {
      const response = await teamRoleService.teamRoleListByTeam(teamId);
      setTeamRoleList(response || []);
    } catch (error) {
      console.error('获取团队角色列表失败:', error);
    }
  };

  const fetchCurrentUserQuotaInfo = async () => {
    try {
      const nebulaApiId = user?.nebulaApiId;
      if (!nebulaApiId) return;
      
      const response = await quotaService.getUserQuotaInfo(nebulaApiId);
      setCurrentUserQuotaInfo(response);
    } catch (error) {
      console.error('获取当前用户余额信息失败:', error);
    }
  };

  // 事件处理函数
  const handleAddTeam = () => {
    setTeamFormData({
      teamName: '',
      remark: '',
      status: 1,
      channelId: user?.channelId,
      teamRoles: [],
    });
    setRoleInputValue('');
    setIsTeamEditMode(false);
    setTeamModalVisible(true);
  };

  const handleEditTeam = async (team: LabTeamVO) => {
    // 获取 channelId：优先使用团队的 channelId，否则使用用户的 channelId
    const channelId = team.channelId || team.channel?.channelId || user?.channelId;
    
    setTeamFormData({
      teamId: team.teamId,
      teamName: team.teamName,
      remark: team.remark || '',
      status: team.status,
      channelId: channelId,
      teamRoles: [],
    });
    
    // 加载现有角色
    try {
      const roles = await teamRoleService.teamRoleListByTeam(team.teamId);
      setTeamFormData(prev => ({
        ...prev,
        teamRoles: roles.map((role: TeamRoleVO) => role.roleName),
      }));
    } catch (error) {
      console.error('获取团队角色失败:', error);
    }
    
    setIsTeamEditMode(true);
    setTeamModalVisible(true);
  };

  const handleTeamSubmit = async () => {
    if (!teamFormData.teamName.trim()) {
      toast.error('请输入团队名称');
      return;
    }

    if (!teamFormData.teamRoles || teamFormData.teamRoles.length === 0) {
      toast.error('请设置团队角色');
      return;
    }

    if (teamFormData.teamRoles.length > 10) {
      toast.error('团队角色最多支持10个');
      return;
    }

    setTeamSubmitting(true);
    try {
      let teamId: number | undefined;
      
      if (isTeamEditMode && teamFormData.teamId) {
        // 编辑团队时，确保包含 channelId
        const updateData = {
          ...teamFormData,
          channelId: teamFormData.channelId || user?.channelId,
        };
        await teamService.updateTeam(updateData);
        teamId = teamFormData.teamId;
        toast.success('编辑团队成功');
      } else {
        const response = await teamService.createTeam({
          ...teamFormData,
          channelId: user?.channelId,
        });
        // 根据 request.ts 的处理，如果返回的是数字，直接使用；否则从响应中提取
        teamId = typeof response === 'number' ? response : (response as any)?.teamId || (response as any)?.data;
        toast.success('新增团队成功');
      }

      // 更新团队角色
      if (teamId && teamFormData.teamRoles) {
        await teamRoleService.updateTeamRoles(teamId, teamFormData.teamRoles);
      }

      setTeamModalVisible(false);
      setRoleInputValue('');
      fetchTeamList();
    } catch (error) {
      console.error('团队操作失败:', error);
      toast.error('操作失败');
    } finally {
      setTeamSubmitting(false);
    }
  };

  const handleDeleteTeam = (team: LabTeamVO) => {
    setConfirmDialog({
      isOpen: true,
      title: '确认删除',
      message: `确定要删除团队"${team.teamName}"吗？\n删除后将同时删除团队角色、团队成员、团队文件夹等所有相关数据，此操作不可恢复！`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await teamService.deleteTeam(team.teamId);
          toast.success('删除团队成功');
    fetchTeamList();
        } catch (error) {
          console.error('删除团队失败:', error);
          toast.error('删除团队失败');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleViewMembers = (team: LabTeamVO) => {
    setCurrentTeam(team);
    setMemberViewPagination(prev => ({ ...prev, current: 1 }));
    fetchTeamMemberList(team.teamId);
    setViewMembersModalVisible(true);
  };

  const handleInviteMember = (team: LabTeamVO) => {
    setCurrentTeam(team);
    setInviteTypeModalVisible(true);
  };

  const handleInviteNewUser = async () => {
    if (!currentTeam) return;
    // 获取当前用户的邀请码
    const inviteCode = user?.inviteCode;
    // 构建邀请链接，包含 channelId、teamId 和 inviteCode
    let inviteUrl = `https://ai-nebula.com/login?channelId=${currentTeam.channelId}&teamId=${currentTeam.teamId}`;
    if (inviteCode) {
      inviteUrl += `&inviteCode=${inviteCode}`;
    }

    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success('邀请链接已复制到剪贴板');
      setInviteTypeModalVisible(false);
    } catch (error) {
      toast(`邀请链接：${inviteUrl}`, { duration: 5000 });
    }
  };

  const handleInviteOldUser = async () => {
    if (!currentTeam) return;
    // 获取当前用户的邀请码
    const inviteCode = user?.inviteCode;
    // 构建邀请链接，包含 channelId、teamId 和 inviteCode
    let inviteUrl = `https://ai-nebula.com/login?channelId=${currentTeam.channelId}&teamId=${currentTeam.teamId}`;
    if (inviteCode) {
      inviteUrl += `&inviteCode=${inviteCode}`;
    }

    // 添加提示信息到链接后面（作为注释说明）
    const inviteUrlWithTip = `${inviteUrl}\n\n提示：如果受邀账号当前已登录，请先退出登录后使用邀请链接加入团队。`;
    
    try {
      await navigator.clipboard.writeText(inviteUrlWithTip);
      toast.success('邀请链接已复制到剪贴板');
      setInviteTypeModalVisible(false);
    } catch (error) {
      toast(`邀请链接：${inviteUrl}\n\n提示：如果受邀账号当前已登录，请先退出登录后使用邀请链接加入团队。`, { duration: 8000 });
    }
  };

  const handleAddMember = (team: LabTeamVO) => {
    setCurrentTeam(team);
    setSelectedMemberIds([]);
    setMemberPagination(prev => ({ ...prev, current: 1 }));
    fetchTeamMemberList(team.teamId);
    // 直接传递 team 参数，避免依赖异步的 currentTeam 状态
    fetchInviteUserList(team);
    setAddMemberModalVisible(true);
  };

  const handleAddMemberSubmit = async () => {
    if (selectedMemberIds.length === 0) {
      toast.error('请选择要添加的成员');
      return;
    }

    if (!currentTeam) return;

    try {
      for (const userId of selectedMemberIds) {
        await teamUserService.teamUserAdd({
          teamId: currentTeam.teamId,
          userId,
          userAuthType: 1, // 默认为普通成员
          userRoleId: 0, // 默认无角色
        });
      }

      toast.success(`成功添加 ${selectedMemberIds.length} 个成员`);
      setAddMemberModalVisible(false);
      setSelectedMemberIds([]);
      
      if (currentTeam) {
        fetchTeamMemberList(currentTeam.teamId);
      }
    } catch (error) {
      console.error('添加成员失败:', error);
      toast.error('添加成员失败');
    }
  };

  const handleEditMemberRole = async (member: TeamUserDetailVO) => {
    setCurrentEditMember(member);
    setSelectedRoleId(member.userRoleId ?? 0);
    
    if (currentTeam) {
      await fetchTeamRoles(currentTeam.teamId);
    }
    
    setEditRoleModalVisible(true);
  };

  const handleEditRoleSubmit = async () => {
    if (!currentEditMember || !currentTeam) return;

    try {
      await teamRoleService.updateMemberRole(
        currentEditMember.teamId,
        currentEditMember.userId,
        currentEditMember.userAuthType,
        selectedRoleId
      );

      toast.success('角色更新成功');
      setEditRoleModalVisible(false);
      fetchTeamMemberList(currentTeam.teamId);
    } catch (error) {
      console.error('角色更新失败:', error);
      toast.error('角色更新失败');
    }
  };

  const handleEditMemberAuth = (member: TeamUserDetailVO) => {
    setCurrentEditMember(member);
    setSelectedAuthType(member.userAuthType);
    setEditAuthModalVisible(true);
  };

  const handleEditAuthSubmit = async () => {
    if (!currentEditMember || !currentTeam) return;

    if (selectedAuthType === 3) {
      toast.error('管理员权限已下架，渠道拥有者默认为管理员');
      return;
    }

    try {
      await teamUserService.updateMemberAuth(
        currentEditMember.teamId,
        currentEditMember.userId,
        selectedAuthType
      );

      toast.success('权限更新成功');
      setEditAuthModalVisible(false);
      fetchTeamMemberList(currentTeam.teamId);
    } catch (error) {
      console.error('权限更新失败:', error);
      toast.error('权限更新失败');
    }
  };

  const handleAllocateQuota = async (member: TeamUserDetailVO) => {
    setCurrentAllocateMember(member);
    setAllocateQuotaAmountRmb(0);
    await fetchCurrentUserQuotaInfo();
    setAllocateQuotaModalVisible(true);
  };

  const handleAllocateQuotaSubmit = async () => {
    if (!currentAllocateMember) return;

    if (!allocateQuotaAmountRmb || allocateQuotaAmountRmb <= 0) {
      toast.error('请输入有效的配额金额');
      return;
    }

    const maxRmb = getMaxAllocateAmount();
    if (allocateQuotaAmountRmb > maxRmb) {
      toast.error(`配额金额不能超过 ¥${maxRmb.toFixed(2)}（已预留0.01元精度余量）`);
      return;
    }

    setQuotaLoading(true);
    try {
      const fromUserId = user?.nebulaApiId;
      const toUserId = currentAllocateMember.nebulaApiId;

      if (!fromUserId || !toUserId) {
        toast.error('无法获取用户ID');
        return;
      }

      await quotaService.allocateQuota({
        fromUserId,
        toUserId,
        quotaAmount: allocateQuotaAmount,
        memberLevel: currentUserQuotaInfo.memberLevel,
      });

      toast.success('配额成功');
      setAllocateQuotaModalVisible(false);
      
      await fetchCurrentUserQuotaInfo();
      if (currentTeam) {
        fetchTeamMemberList(currentTeam.teamId);
      }
    } catch (error) {
      console.error('配额失败:', error);
      toast.error('配额失败');
    } finally {
      setQuotaLoading(false);
    }
  };

  const handleRemoveMember = (member: TeamUserDetailVO) => {
    setConfirmDialog({
      isOpen: true,
      title: '确认移除',
      message: `确认要移除成员"${member.userName}"吗？`,
      type: 'warning',
      onConfirm: async () => {
        try {
          await teamUserService.teamUserRemoveMember(
            member.teamId,
            member.userId,
            member.userAuthType
          );
          
          toast.success('移除成员成功');
          if (currentTeam) {
            fetchTeamMemberList(currentTeam.teamId);
          }
        } catch (error) {
          console.error('移除成员失败:', error);
          toast.error('移除成员失败');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // 初始化
  useEffect(() => {
    console.log('Enterprise 组件初始化/更新');
    console.log('hasTeams:', hasTeams);
    console.log('hasChannelPermission:', hasChannelPermission);
    console.log('canShowTeamList:', canShowTeamList);
    console.log('user?.channelId:', user?.channelId);
    console.log('user?.team:', user?.team);
    
    if (canShowTeamList) {
      console.log('开始获取团队列表');
      fetchTeamList();
      if (showQuotaInfo) {
        fetchCurrentUserQuotaInfo();
      }
    } else {
      console.log('条件不满足，不获取团队列表', { hasTeams, hasChannelPermission, canShowTeamList });
    }
  }, [canShowTeamList, showQuotaInfo]);

  useEffect(() => {
    if (currentTeam && addMemberModalVisible) {
      fetchInviteUserList(currentTeam);
    }
  }, [memberPagination.current, memberSearchKeyword, currentTeam, addMemberModalVisible]);

  // 监听 teamList 变化，用于调试
  useEffect(() => {
    console.log('teamList 更新:', teamList);
    console.log('teamList.length:', teamList.length);
  }, [teamList]);

  // 无权限提示：只有当用户既没有团队，也没有 channelId 时，才显示提示
  if (!canShowTeamList) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="text-yellow-500 mb-4" size={48} />
        <h3 className="text-lg font-semibold text-foreground mb-2">暂不支持该功能</h3>
        <p className="text-muted">您还未加入任何团队，请先加入企业</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* 页头 */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">团队管理</h2>
          <p className="text-sm text-muted">管理团队信息、成员邀请和角色分配</p>
        </div>
        
        {/* 用户余额信息 */}
        {showQuotaInfo && currentUserQuotaInfo && (
          <div className="flex items-center gap-4 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">余额:</span>
              <span className="text-sm font-semibold text-foreground">¥{currentUserQuotaInfo.quotaRmb}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">积分:</span>
              <span className="text-sm font-semibold text-foreground">{currentUserQuotaInfo.score}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">等级:</span>
              <span className={`text-xs px-2 py-1 rounded ${getMemberLevelColor(currentUserQuotaInfo.memberLevel)}`}>
                {currentUserQuotaInfo.memberLevel}
                      </span>
                  </div>
                  </div>
                )}
                  </div>

      {/* 工具栏 */}
      <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="flex gap-2">
          {canCreateTeam && (
              <button
                onClick={handleAddTeam}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
              新增团队
              </button>
          )}
              <button
                onClick={fetchTeamList}
                disabled={teamLoading}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={16} className={teamLoading ? 'animate-spin' : ''} />
            刷新
              </button>
            </div>
        
        <div className="flex items-center gap-2">
              <input
                type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchTeamList()}
            placeholder="搜索团队名称"
            className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-background"
          />
                <button
            onClick={fetchTeamList}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
            <Search size={16} />
                </button>
              </div>
      </div>

      {/* 团队列表表格 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">团队名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">创建时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
            <tbody className="divide-y divide-border">
              {teamLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    <Loader2 className="animate-spin mx-auto text-indigo-600" size={32} />
                  </td>
                </tr>
              ) : teamList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted">
                    暂无团队数据
                  </td>
                </tr>
              ) : (
                teamList.map((team) => (
                  <tr key={team.teamId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">{team.teamName}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">{team.createTime}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded ${team.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {team.status === 1 ? '正常' : '禁用'}
                            </span>
                        </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewMembers(team)}
                          className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
                        >
                          <Eye size={14} />
                          查看成员
                        </button>
                        {canManageTeam(team) && (
                          <>
                            <button
                              onClick={() => handleEditTeam(team)}
                              className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
                            >
                              <Edit2 size={14} />
                              编辑
                            </button>
                            <button
                              onClick={() => handleInviteMember(team)}
                              className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1"
                            >
                              <UserPlus size={14} />
                              邀请成员
                            </button>
                            <button
                              onClick={() => handleAddMember(team)}
                              className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
                            >
                              <UserPlus2 size={14} />
                              添加成员
                            </button>
                          </>
                        )}
                        {canDeleteTeam(team) && (
                            <button
                              onClick={() => handleDeleteTeam(team)}
                            className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                            >
                            <Trash2 size={14} />
                            删除
                            </button>
                        )}
                          </div>
                        </td>
                      </tr>
                ))
              )}
                  </tbody>
                </table>
          </div>

        {/* 分页 */}
        {pagination.total > 0 && (
          <div className="px-6 py-4 border-t border-border flex justify-between items-center">
              <div className="text-sm text-muted">
              共 {pagination.total} 条记录
              </div>
            <div className="flex gap-2">
                <button
                onClick={() => setPagination(prev => ({ ...prev, current: Math.max(1, prev.current - 1) }))}
                disabled={pagination.current === 1}
                className="px-3 py-1 border border-border rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
              <span className="px-3 py-1">
                {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize)}
                </span>
                <button
                onClick={() => setPagination(prev => ({ ...prev, current: Math.min(Math.ceil(pagination.total / pagination.pageSize), prev.current + 1) }))}
                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                className="px-3 py-1 border border-border rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>

      {/* 新增/编辑团队弹窗 */}
      {teamModalVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex justify-between items-center">
                <h3 className="text-lg font-semibold text-foreground">
                {isTeamEditMode ? '编辑团队' : '新增团队'}
                </h3>
                <button
                onClick={() => {
                  setTeamModalVisible(false);
                  setRoleInputValue('');
                }}
                className="text-muted hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>
            
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                  团队名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                  value={teamFormData.teamName}
                  onChange={(e) => setTeamFormData(prev => ({ ...prev, teamName: e.target.value }))}
                  placeholder="请输入团队名称"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                  团队角色 <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full min-h-[42px] px-3 py-2 border border-border rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent bg-background">
                    <div className="flex flex-wrap gap-2 items-center">
                      {teamFormData.teamRoles?.map((role, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-sm"
                        >
                          {role}
                          <button
                            type="button"
                            onClick={() => {
                              setTeamFormData(prev => ({
                                ...prev,
                                teamRoles: prev.teamRoles?.filter((_, i) => i !== index) || []
                              }));
                            }}
                            className="hover:text-indigo-900 dark:hover:text-indigo-100"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={roleInputValue}
                        onChange={(e) => {
                          const value = e.target.value;
                          setRoleInputValue(value);
                          
                          if (value.includes(',')) {
                            const newRoles = value.split(',').map(r => r.trim()).filter(r => r);
                            const currentRoles = teamFormData.teamRoles || [];
                            const updatedRoles = [...currentRoles, ...newRoles].filter((role, index, self) => 
                              self.indexOf(role) === index
                            );
                            if (updatedRoles.length <= 10) {
                              setTeamFormData(prev => ({
                                ...prev,
                                teamRoles: updatedRoles
                              }));
                              setRoleInputValue('');
                            } else {
                              toast.error('团队角色最多支持10个');
                              setRoleInputValue(newRoles.slice(0, 10 - currentRoles.length).join(','));
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            const value = roleInputValue.trim();
                            if (value) {
                              const currentRoles = teamFormData.teamRoles || [];
                              if (currentRoles.length >= 10) {
                                toast.error('团队角色最多支持10个');
                                setRoleInputValue('');
                                return;
                              }
                              if (!currentRoles.includes(value)) {
                                setTeamFormData(prev => ({
                                  ...prev,
                                  teamRoles: [...(prev.teamRoles || []), value]
                                }));
                              }
                              setRoleInputValue('');
                            }
                          } else if (e.key === 'Backspace' && roleInputValue === '' && teamFormData.teamRoles && teamFormData.teamRoles.length > 0) {
                            setTeamFormData(prev => ({
                              ...prev,
                              teamRoles: prev.teamRoles?.slice(0, -1) || []
                            }));
                          }
                        }}
                        placeholder={teamFormData.teamRoles?.length === 0 ? "请输入团队角色，如:开发者、测试员、观察者" : ""}
                        className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    （请输入团队角色，按回车或逗号添加，一个团队最多支持10个角色）
                  </p>
                </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">备注</label>
                <textarea
                  value={teamFormData.remark}
                  onChange={(e) => setTeamFormData(prev => ({ ...prev, remark: e.target.value }))}
                  placeholder="请输入团队备注"
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-background"
                />
                  </div>
                </div>

            <div className="p-6 border-t border-border flex justify-end gap-2">
                  <button
                onClick={() => {
                  setTeamModalVisible(false);
                  setRoleInputValue('');
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    取消
                  </button>
                  <button
                onClick={handleTeamSubmit}
                disabled={teamSubmitting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                {teamSubmitting && <Loader2 className="animate-spin" size={16} />}
                确定
                  </button>
                </div>
              </div>
            </div>
      )}

      {/* 查看成员弹窗 */}
      {viewMembersModalVisible && currentTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">团队成员列表</h3>
              <button
                onClick={() => setViewMembersModalVisible(false)}
                className="text-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
          </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">用户信息</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">昵称</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">手机号码</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">用户权限</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">用户角色</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">剩余额度</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">已用额度</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">加入时间</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {memberViewLoading ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center">
                          <Loader2 className="animate-spin mx-auto text-indigo-600" size={32} />
                        </td>
                      </tr>
                    ) : teamMemberList.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-muted">
                          暂无成员数据
                        </td>
                      </tr>
                    ) : (
                      teamMemberList.map((member) => (
                        <tr key={`${member.userId}-${member.userAuthType}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 text-sm">{member.userName}</td>
                          <td className="px-4 py-3 text-sm">{member.nickName}</td>
                          <td className="px-4 py-3 text-sm">{member.phoneNumber || '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded ${getAuthTypeColor(member.userAuthType)}`}>
                              {getAuthTypeText(member.userAuthType)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{member.roleName || '暂无角色'}</td>
                          <td className="px-4 py-3 text-sm">¥{member.quotaRmb || '0.00'}</td>
                          <td className="px-4 py-3 text-sm">¥{member.usedQuotaRmb || '0.00'}</td>
                          <td className="px-4 py-3 text-sm">{member.createTime}</td>
                          <td className="px-4 py-3">
                            {canManageMembers(currentTeam) && (
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleEditMemberRole(member)}
                                  className="text-indigo-600 hover:text-indigo-700 text-xs"
                                >
                                  编辑角色
                                </button>
                                <button
                                  onClick={() => handleEditMemberAuth(member)}
                                  className="text-green-600 hover:text-green-700 text-xs"
                                >
                                  修改权限
                                </button>
                                {!isCurrentUser(member) && (
                                  <button
                                    onClick={() => handleAllocateQuota(member)}
                                    className="text-indigo-600 hover:text-indigo-700 text-xs"
                                  >
                                    配额
                                  </button>
                                )}
                                <button
                                  onClick={() => handleRemoveMember(member)}
                                  className="text-red-600 hover:text-red-700 text-xs"
                                >
                                  移除
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end">
                <button
                onClick={() => setViewMembersModalVisible(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 邀请成员类型选择弹窗 */}
      {inviteTypeModalVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">选择邀请对象</h3>
              <button
                onClick={() => setInviteTypeModalVisible(false)}
                  className="text-muted hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>
            
            <div className="p-6">
              <p className="text-sm text-muted mb-4 text-center">
                请选择要邀请新用户还是老用户加入团队
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleInviteNewUser}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  新用户（注册）
                </button>
                <button
                  onClick={handleInviteOldUser}
                  className="w-full px-4 py-3 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  老用户（登录）
                </button>
                <button
                  onClick={() => setInviteTypeModalVisible(false)}
                  className="w-full px-4 py-3 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 添加成员弹窗 */}
      {addMemberModalVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">添加团队成员</h3>
              <button
                onClick={() => setAddMemberModalVisible(false)}
                className="text-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                  <input
                    type="text"
                  value={memberSearchKeyword}
                  onChange={(e) => setMemberSearchKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchInviteUserList()}
                  placeholder="搜索用户名或邮箱"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-background"
                  />
                </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left">
                  <input
                          type="checkbox"
                          checked={selectedMemberIds.length === inviteUserList.filter(u => !teamMemberList.some(m => m.userId === u.userId)).length && inviteUserList.length > 0}
                    onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMemberIds(inviteUserList.filter(u => !teamMemberList.some(m => m.userId === u.userId)).map(u => u.userId));
                            } else {
                              setSelectedMemberIds([]);
                            }
                          }}
                          className="rounded"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">用户账号</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">用户昵称</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">手机号码</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">注册时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {memberLoading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center">
                          <Loader2 className="animate-spin mx-auto text-indigo-600" size={32} />
                        </td>
                      </tr>
                    ) : inviteUserList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted">
                          暂无用户数据
                        </td>
                      </tr>
                    ) : (
                      inviteUserList.map((user) => {
                        const isExistingMember = teamMemberList.some(m => m.userId === user.userId);
                        return (
                          <tr key={user.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedMemberIds.includes(user.userId)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedMemberIds(prev => [...prev, user.userId]);
                                  } else {
                                    setSelectedMemberIds(prev => prev.filter(id => id !== user.userId));
                                  }
                                }}
                                disabled={isExistingMember}
                                className="rounded disabled:opacity-50"
                              />
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {user.userName}
                              {isExistingMember && (
                                <span className="ml-2 text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">
                                  已是成员
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">{user.nickName}</td>
                            <td className="px-4 py-3 text-sm">{user.phoneNumber || '-'}</td>
                            <td className="px-4 py-3 text-sm">{user.createTime}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
                </div>
            </div>

            <div className="p-6 border-t border-border flex justify-between items-center">
              <div className="text-sm text-muted">
                已选择 {selectedMemberIds.length} 个成员
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setAddMemberModalVisible(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddMemberSubmit}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑角色弹窗 */}
      {editRoleModalVisible && currentEditMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">编辑成员角色</h3>
              <button
                onClick={() => setEditRoleModalVisible(false)}
                className="text-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">成员信息</h4>
                <p className="text-sm text-muted">用户名：{currentEditMember.userName}</p>
                <p className="text-sm text-muted">当前角色：{currentEditMember.roleName || '暂无角色'}</p>
              </div>

                <div>
                <label className="block text-sm font-medium text-foreground mb-2">选择新角色</label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-background"
                >
                  <option value={0}>暂无角色</option>
                  {teamRoleList.map((role) => (
                    <option key={role.roleId} value={role.roleId}>
                      {role.roleName}
                    </option>
                  ))}
                </select>
                </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-2">
                  <button
                onClick={() => setEditRoleModalVisible(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    取消
                  </button>
                  <button
                onClick={handleEditRoleSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                确定
                  </button>
                </div>
              </div>
            </div>
      )}

      {/* 修改权限弹窗 */}
      {editAuthModalVisible && currentEditMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">修改成员权限</h3>
              <button
                onClick={() => setEditAuthModalVisible(false)}
                className="text-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
          </div>
            
            <div className="p-6">
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">成员信息</h4>
                <p className="text-sm text-muted">用户名：{currentEditMember.userName}</p>
                <p className="text-sm text-muted">当前权限：{getAuthTypeText(currentEditMember.userAuthType)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">选择新权限</label>
                <select
                  value={selectedAuthType}
                  onChange={(e) => setSelectedAuthType(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-background"
                >
                  <option value={1}>成员</option>
                  <option value={2}>leader</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => setEditAuthModalVisible(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleEditAuthSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />

      {/* 配额弹窗 */}
      {allocateQuotaModalVisible && currentAllocateMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full mx-4">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">配额给团队成员</h3>
              <button
                onClick={() => setAllocateQuotaModalVisible(false)}
                className="text-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* 成员信息部分 */}
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="text-sm font-semibold text-foreground mb-3">成员信息</h4>
                <p className="text-sm text-muted mb-2">
                  用户名：{currentAllocateMember.userName}
                </p>
                <p className="text-sm text-muted mb-2">
                  当前余额：¥{formatRmb(currentAllocateMember.quota)}
                  {allocateQuotaAmountRmb > 0 && (
                    <span className="text-green-600 font-semibold ml-2">
                      → ¥{memberAfterQuotaRmb}
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted mb-2">
                  积分：{calculateScore(currentAllocateMember.quota, currentUserQuotaInfo?.memberLevel)}
                  {allocateQuotaAmountRmb > 0 && (
                    <span className="text-green-600 font-semibold ml-2">
                      → {memberAfterQuotaScore}
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted">
                  会员等级：
                  <span className={`ml-2 text-xs px-2 py-1 rounded ${getMemberLevelColor(currentAllocateMember.memberLevel)}`}>
                    {getMemberLevelText(currentAllocateMember.memberLevel)}
                  </span>
                </p>
              </div>

              {/* 我的余额部分 */}
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="text-sm font-semibold text-foreground mb-3">我的余额</h4>
                <p className="text-sm text-muted mb-2">
                  当前余额：¥{currentUserQuotaInfo?.quotaRmb || '0.00'}
                  {allocateQuotaAmountRmb > 0 && (
                    <span className="text-green-600 font-semibold ml-2">
                      → ¥{myAfterQuotaRmb}
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted mb-2">
                  积分：{currentUserQuotaInfo?.score || '0.00'}
                  {allocateQuotaAmountRmb > 0 && (
                    <span className="text-green-600 font-semibold ml-2">
                      → {myAfterQuotaScore}
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted">
                  会员等级：
                  <span className={`ml-2 text-xs px-2 py-1 rounded ${getMemberLevelColor(currentUserQuotaInfo?.memberLevel)}`}>
                    {getMemberLevelText(currentUserQuotaInfo?.memberLevel)}
                  </span>
                </p>
              </div>

              {/* 配额金额输入 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">配额金额（人民币）</label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-r-0 border-border rounded-l-lg text-sm">
                    ¥
                  </span>
                  <input
                    type="number"
                    min={0.01}
                    max={getMaxAllocateAmount()}
                    step={0.01}
                    value={allocateQuotaAmountRmb || ''}
                    onChange={(e) => setAllocateQuotaAmountRmb(parseFloat(e.target.value) || 0)}
                    placeholder="请输入配额金额"
                    className="flex-1 px-4 py-2 border border-border rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-background"
                  />
                </div>
                <p className="text-xs text-muted mt-1">
                  配额金额不能超过您的剩余余额 ¥{currentUserQuotaInfo?.quotaRmb || '0.00'}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => {
                  setAllocateQuotaModalVisible(false);
                  setAllocateQuotaAmountRmb(0);
                  setCurrentAllocateMember(null);
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={quotaLoading}
              >
                取消
              </button>
              <button
                onClick={handleAllocateQuotaSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={quotaLoading}
              >
                {quotaLoading && <Loader2 size={16} className="animate-spin" />}
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterprisePage;
