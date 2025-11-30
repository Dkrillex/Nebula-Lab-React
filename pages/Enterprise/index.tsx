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
import { CURRENT_SYSTEM, SYSTEM_TYPE } from '../../constants';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useAppOutletContext } from '../../router/context';
import { translations } from '../../translations';

const EnterprisePage: React.FC = () => {
  const { t: rootT } = useAppOutletContext();
  const t = rootT?.enterprisePage || translations['zh'].enterprisePage;
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
      return t.quota.normalMember;
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
      1: t.authTypes.member,
      2: t.authTypes.leader,
      3: t.authTypes.admin,
    };
    return typeMap[type] || t.authTypes.unknown;
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
      toast.error(t.messages.fetchTeamListFailed);
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
        toast.error(t.messages.getChannelIdFailed);
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
      toast.error(t.messages.fetchInviteUserListFailed);
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
      toast.error(t.messages.enterTeamName);
      return;
    }

    if (!teamFormData.teamRoles || teamFormData.teamRoles.length === 0) {
      toast.error(t.messages.setTeamRoles);
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
        toast.success(t.messages.updateTeamSuccess);
      } else {
        const response = await teamService.createTeam({
          ...teamFormData,
          channelId: user?.channelId,
        });
        // 根据 request.ts 的处理，如果返回的是数字，直接使用；否则从响应中提取
        teamId = typeof response === 'number' ? response : (response as any)?.teamId || (response as any)?.data;
        toast.success(t.messages.createTeamSuccess);
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
      toast.error(t.messages.fetchTeamListFailed);
    } finally {
      setTeamSubmitting(false);
    }
  };

  const handleDeleteTeam = (team: LabTeamVO) => {
    setConfirmDialog({
      isOpen: true,
      title: t.messages.deleteTeamConfirm,
      message: t.messages.deleteTeamMessage.replace('{teamName}', team.teamName),
      type: 'danger',
      onConfirm: async () => {
        try {
          await teamService.deleteTeam(team.teamId);
          toast.success(t.messages.deleteTeamSuccess);
    fetchTeamList();
        } catch (error) {
          console.error('删除团队失败:', error);
          toast.error(t.messages.deleteTeamFailed);
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
    const inviteDomain = CURRENT_SYSTEM === SYSTEM_TYPE.MODEL_CENTER ? 'openai-nebula.com' : 'ai-nebula.com';
    let inviteUrl = `https://${inviteDomain}/login?channelId=${currentTeam.channelId}&teamId=${currentTeam.teamId}`;
    if (inviteCode) {
      inviteUrl += `&inviteCode=${inviteCode}`;
    }

    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success('邀请链接已复制到剪贴板');
      setInviteTypeModalVisible(false);
    } catch (error) {
      toast(t.messages.inviteLinkTip.replace('{url}', inviteUrl), { duration: 5000 });
    }
  };

  const handleInviteOldUser = async () => {
    if (!currentTeam) return;
    // 获取当前用户的邀请码
    const inviteCode = user?.inviteCode;
    // 构建邀请链接，包含 channelId、teamId 和 inviteCode
    const inviteDomain = CURRENT_SYSTEM === SYSTEM_TYPE.MODEL_CENTER ? 'openai-nebula.com' : 'ai-nebula.com';
    let inviteUrl = `https://${inviteDomain}/login?channelId=${currentTeam.channelId}&teamId=${currentTeam.teamId}`;
    if (inviteCode) {
      inviteUrl += `&inviteCode=${inviteCode}`;
    }

    // 添加提示信息到链接后面（作为注释说明）
    const inviteUrlWithTip = t.messages.inviteLinkTip.replace('{url}', inviteUrl);
    
    try {
      await navigator.clipboard.writeText(inviteUrlWithTip);
      toast.success(t.messages.inviteLinkCopied);
      setInviteTypeModalVisible(false);
    } catch (error) {
      toast(t.messages.inviteLinkTip.replace('{url}', inviteUrl), { duration: 8000 });
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
      toast.error(t.messages.selectMembers);
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

      toast.success(t.messages.addMembersSuccess.replace('{count}', String(selectedMemberIds.length)));
      setAddMemberModalVisible(false);
      setSelectedMemberIds([]);
      
      if (currentTeam) {
        fetchTeamMemberList(currentTeam.teamId);
      }
    } catch (error) {
      console.error('添加成员失败:', error);
      toast.error(t.messages.addMembersFailed);
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

      toast.success(t.messages.updateRoleSuccess);
      setEditRoleModalVisible(false);
      fetchTeamMemberList(currentTeam.teamId);
    } catch (error) {
      console.error('角色更新失败:', error);
      toast.error(t.messages.updateRoleFailed);
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
      toast.error(t.messages.adminAuthDisabled);
      return;
    }

    try {
      await teamUserService.updateMemberAuth(
        currentEditMember.teamId,
        currentEditMember.userId,
        selectedAuthType
      );

      toast.success(t.messages.updateAuthSuccess);
      setEditAuthModalVisible(false);
      fetchTeamMemberList(currentTeam.teamId);
    } catch (error) {
      console.error('权限更新失败:', error);
      toast.error(t.messages.updateAuthFailed);
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
      toast.error(t.messages.enterValidQuota);
      return;
    }

    const maxRmb = getMaxAllocateAmount();
    if (allocateQuotaAmountRmb > maxRmb) {
      toast.error(t.messages.quotaExceeded.replace('{amount}', maxRmb.toFixed(2)));
      return;
    }

    setQuotaLoading(true);
    try {
      const fromUserId = user?.nebulaApiId;
      const toUserId = currentAllocateMember.nebulaApiId;

      if (!fromUserId || !toUserId) {
        toast.error(t.messages.getUserIdFailed);
        return;
      }

      await quotaService.allocateQuota({
        fromUserId,
        toUserId,
        quotaAmount: allocateQuotaAmount,
        memberLevel: currentUserQuotaInfo.memberLevel,
      });

      toast.success(t.messages.allocateQuotaSuccess);
      setAllocateQuotaModalVisible(false);
      
      await fetchCurrentUserQuotaInfo();
      if (currentTeam) {
        fetchTeamMemberList(currentTeam.teamId);
      }
    } catch (error) {
      console.error('配额失败:', error);
      toast.error(t.messages.allocateQuotaFailed);
    } finally {
      setQuotaLoading(false);
    }
  };

  const handleRemoveMember = (member: TeamUserDetailVO) => {
    setConfirmDialog({
      isOpen: true,
      title: t.messages.removeMemberConfirm,
      message: t.messages.removeMemberMessage.replace('{userName}', member.userName),
      type: 'warning',
      onConfirm: async () => {
        try {
          await teamUserService.teamUserRemoveMember(
            member.teamId,
            member.userId,
            member.userAuthType
          );
          
          toast.success(t.messages.removeMemberSuccess);
          if (currentTeam) {
            fetchTeamMemberList(currentTeam.teamId);
          }
        } catch (error) {
          console.error('移除成员失败:', error);
          toast.error(t.messages.removeMemberFailed);
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
        <h3 className="text-lg font-semibold text-foreground mb-2">{t.notSupported}</h3>
        <p className="text-muted">{t.notSupportedDesc}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* 页头 */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">{t.title}</h2>
          <p className="text-sm text-muted">{t.subtitle}</p>
        </div>
        
        {/* 用户余额信息 */}
        {showQuotaInfo && currentUserQuotaInfo && (
          <div className="flex items-center gap-4 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">{t.quota.balance}</span>
              <span className="text-sm font-semibold text-foreground">¥{currentUserQuotaInfo.quotaRmb}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">{t.quota.score}</span>
              <span className="text-sm font-semibold text-foreground">{currentUserQuotaInfo.score}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">{t.quota.level}</span>
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
              {t.buttons.addTeam}
              </button>
          )}
              <button
                onClick={fetchTeamList}
                disabled={teamLoading}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={16} className={teamLoading ? 'animate-spin' : ''} />
            {t.buttons.refresh}
              </button>
            </div>
        
        <div className="flex items-center gap-2">
              <input
                type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchTeamList()}
            placeholder={t.table.searchPlaceholder || t.table.teamName}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">{t.table.teamName}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">{t.table.createTime}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">{t.table.status}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">{t.table.actions}</th>
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
                    {t.table.noData}
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
                        {team.status === 1 ? t.table.normal : t.table.disabled}
                            </span>
                        </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewMembers(team)}
                          className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
                        >
                          <Eye size={14} />
                          {t.buttons.viewMembers}
                        </button>
                        {canManageTeam(team) && (
                          <>
                            <button
                              onClick={() => handleEditTeam(team)}
                              className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
                            >
                              <Edit2 size={14} />
                              {t.buttons.edit}
                            </button>
                            <button
                              onClick={() => handleInviteMember(team)}
                              className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1"
                            >
                              <UserPlus size={14} />
                              {t.buttons.inviteMember}
                            </button>
                            <button
                              onClick={() => handleAddMember(team)}
                              className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
                            >
                              <UserPlus2 size={14} />
                              {t.buttons.addMember}
                            </button>
                          </>
                        )}
                        {canDeleteTeam(team) && (
                            <button
                              onClick={() => handleDeleteTeam(team)}
                            className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                            >
                            <Trash2 size={14} />
                            {t.buttons.delete}
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
              {t.pagination.totalRecords.replace('{total}', String(pagination.total))}
              </div>
            <div className="flex gap-2">
                <button
                onClick={() => setPagination(prev => ({ ...prev, current: Math.max(1, prev.current - 1) }))}
                disabled={pagination.current === 1}
                className="px-3 py-1 border border-border rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.pagination.previous}
                </button>
              <span className="px-3 py-1">
                {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize)}
                </span>
                <button
                onClick={() => setPagination(prev => ({ ...prev, current: Math.min(Math.ceil(pagination.total / pagination.pageSize), prev.current + 1) }))}
                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                className="px-3 py-1 border border-border rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.pagination.next}
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
                {isTeamEditMode ? t.modals.editTeam : t.modals.addTeam}
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
                  {t.modals.teamName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                  value={teamFormData.teamName}
                  onChange={(e) => setTeamFormData(prev => ({ ...prev, teamName: e.target.value }))}
                  placeholder={t.modals.teamNamePlaceholder}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                  {t.modals.teamRoles} <span className="text-red-500">*</span>
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
                              toast.error(t.messages.maxRolesLimit);
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
                                toast.error(t.messages.maxRolesLimit);
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
                        placeholder={teamFormData.teamRoles?.length === 0 ? t.modals.teamRolesPlaceholder : ""}
                        className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    {t.modals.teamRolesHint}
                  </p>
                </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t.modals.remark}</label>
                <textarea
                  value={teamFormData.remark}
                  onChange={(e) => setTeamFormData(prev => ({ ...prev, remark: e.target.value }))}
                  placeholder={t.modals.remarkPlaceholder}
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
                    {t.buttons.cancel}
                  </button>
                  <button
                onClick={handleTeamSubmit}
                disabled={teamSubmitting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                {teamSubmitting && <Loader2 className="animate-spin" size={16} />}
                {t.buttons.confirm}
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
              <h3 className="text-lg font-semibold text-foreground">{t.modals.membersList}</h3>
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">{t.table.userInfo}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">{t.table.nickName}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">{t.table.phoneNumber}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">{t.table.userAuth}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">{t.table.userRole}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">{t.table.remainingQuota}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">{t.table.usedQuota}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">{t.table.joinTime}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">{t.table.actions}</th>
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
                          {t.messages.noMemberData}
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
                          <td className="px-4 py-3 text-sm">{member.roleName || t.modals.noRole}</td>
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
                                  {t.buttons.editRole}
                                </button>
                                <button
                                  onClick={() => handleEditMemberAuth(member)}
                                  className="text-green-600 hover:text-green-700 text-xs"
                                >
                                  {t.buttons.editAuth}
                                </button>
                                {!isCurrentUser(member) && (
                                  <button
                                    onClick={() => handleAllocateQuota(member)}
                                    className="text-indigo-600 hover:text-indigo-700 text-xs"
                                  >
                                    {t.buttons.allocate}
                                  </button>
                                )}
                                <button
                                  onClick={() => handleRemoveMember(member)}
                                  className="text-red-600 hover:text-red-700 text-xs"
                                >
                                  {t.buttons.remove}
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
                {t.buttons.close}
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
              <h3 className="text-lg font-semibold text-foreground">{t.modals.selectInviteType}</h3>
              <button
                onClick={() => setInviteTypeModalVisible(false)}
                  className="text-muted hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>
            
            <div className="p-6">
              <p className="text-sm text-muted mb-4 text-center">
                {t.modals.inviteTypeDesc}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleInviteNewUser}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {t.buttons.newUser}
                </button>
                <button
                  onClick={handleInviteOldUser}
                  className="w-full px-4 py-3 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t.buttons.oldUser}
                </button>
                <button
                  onClick={() => setInviteTypeModalVisible(false)}
                  className="w-full px-4 py-3 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t.buttons.cancel}
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
              <h3 className="text-lg font-semibold text-foreground">{t.modals.addMembers}</h3>
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
                  placeholder={t.modals.searchUserPlaceholder}
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">{t.table.account}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">{t.table.nickName}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">{t.table.phoneNumber}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">{t.table.registerTime}</th>
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
                          {t.messages.noUserData}
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
                                  {t.messages.isMember}
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
                {t.modals.selectedCount.replace('{count}', String(selectedMemberIds.length))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setAddMemberModalVisible(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t.buttons.cancel}
                </button>
                <button
                  onClick={handleAddMemberSubmit}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {t.buttons.confirm}
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
              <h3 className="text-lg font-semibold text-foreground">{t.modals.editMemberRole}</h3>
              <button
                onClick={() => setEditRoleModalVisible(false)}
                className="text-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">{t.modals.memberInfo}</h4>
                <p className="text-sm text-muted">{t.table.userName}：{currentEditMember.userName}</p>
                <p className="text-sm text-muted">{t.modals.currentRole}{currentEditMember.roleName || t.modals.noRole}</p>
              </div>

                <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t.modals.selectNewRole}</label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-background"
                >
                  <option value={0}>{t.modals.noRole}</option>
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
                    {t.buttons.cancel}
                  </button>
                  <button
                onClick={handleEditRoleSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                {t.buttons.confirm}
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
              <h3 className="text-lg font-semibold text-foreground">{t.modals.editMemberAuth}</h3>
              <button
                onClick={() => setEditAuthModalVisible(false)}
                className="text-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
          </div>
            
            <div className="p-6">
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">{t.modals.memberInfo}</h4>
                <p className="text-sm text-muted">{t.table.userName}：{currentEditMember.userName}</p>
                <p className="text-sm text-muted">{t.modals.currentAuth}{getAuthTypeText(currentEditMember.userAuthType)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t.modals.selectNewAuth}</label>
                <select
                  value={selectedAuthType}
                  onChange={(e) => setSelectedAuthType(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-background"
                >
                  <option value={1}>{t.authTypes.member}</option>
                  <option value={2}>{t.authTypes.leader}</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => setEditAuthModalVisible(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t.buttons.cancel}
              </button>
              <button
                onClick={handleEditAuthSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {t.buttons.confirm}
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
              <h3 className="text-lg font-semibold text-foreground">{t.modals.allocateQuota}</h3>
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
                <h4 className="text-sm font-semibold text-foreground mb-3">{t.modals.memberInfoTitle}</h4>
                <p className="text-sm text-muted mb-2">
                  {t.table.userName}：{currentAllocateMember.userName}
                </p>
                <p className="text-sm text-muted mb-2">
                  {t.modals.currentBalance}¥{formatRmb(currentAllocateMember.quota)}
                  {allocateQuotaAmountRmb > 0 && (
                    <span className="text-green-600 font-semibold ml-2">
                      → ¥{memberAfterQuotaRmb}
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted mb-2">
                  {t.modals.score}{calculateScore(currentAllocateMember.quota, currentUserQuotaInfo?.memberLevel)}
                  {allocateQuotaAmountRmb > 0 && (
                    <span className="text-green-600 font-semibold ml-2">
                      → {memberAfterQuotaScore}
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted">
                  {t.modals.memberLevel}
                  <span className={`ml-2 text-xs px-2 py-1 rounded ${getMemberLevelColor(currentAllocateMember.memberLevel)}`}>
                    {getMemberLevelText(currentAllocateMember.memberLevel)}
                  </span>
                </p>
              </div>

              {/* 我的余额部分 */}
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="text-sm font-semibold text-foreground mb-3">{t.modals.myBalance}</h4>
                <p className="text-sm text-muted mb-2">
                  {t.modals.currentBalance}¥{currentUserQuotaInfo?.quotaRmb || '0.00'}
                  {allocateQuotaAmountRmb > 0 && (
                    <span className="text-green-600 font-semibold ml-2">
                      → ¥{myAfterQuotaRmb}
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted mb-2">
                  {t.modals.score}{currentUserQuotaInfo?.score || '0.00'}
                  {allocateQuotaAmountRmb > 0 && (
                    <span className="text-green-600 font-semibold ml-2">
                      → {myAfterQuotaScore}
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted">
                  {t.modals.memberLevel}
                  <span className={`ml-2 text-xs px-2 py-1 rounded ${getMemberLevelColor(currentUserQuotaInfo?.memberLevel)}`}>
                    {getMemberLevelText(currentUserQuotaInfo?.memberLevel)}
                  </span>
                </p>
              </div>

              {/* 配额金额输入 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t.modals.quotaAmount}</label>
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
                    placeholder={t.modals.quotaAmountPlaceholder}
                    className="flex-1 px-4 py-2 border border-border rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-background"
                  />
                </div>
                <p className="text-xs text-muted mt-1">
                  {t.modals.quotaAmountHint.replace('{amount}', currentUserQuotaInfo?.quotaRmb || '0.00')}
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
                {t.buttons.cancel}
              </button>
              <button
                onClick={handleAllocateQuotaSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={quotaLoading}
              >
                {quotaLoading && <Loader2 size={16} className="animate-spin" />}
                {t.buttons.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterprisePage;
