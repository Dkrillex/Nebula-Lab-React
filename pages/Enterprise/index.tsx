import React, { useState, useEffect } from 'react';
import { Building2, Users, Plus, Edit2, Trash2, RefreshCw, Search, X, CheckCircle2, XCircle } from 'lucide-react';
import { channelService, LabChannelVO, LabChannelForm } from '../../services/channelService';
import { teamService, LabTeamVO, LabTeamForm } from '../../services/teamService';
import { useAuthStore } from '../../stores/authStore';
import { Loader2 } from 'lucide-react';

interface EnterprisePageProps {
  t: {
    title: string;
    channelManagement: string;
    teamManagement: string;
    channelName: string;
    whetherShareAssets: string;
    yes: string;
    no: string;
    createTime: string;
    updateTime: string;
    edit: string;
    addUserChannelRelation: string;
    pleaseEnterChannelName: string;
    pleaseSelectWhetherShareAssets: string;
    teamName: string;
    status: string;
    normal: string;
    disabled: string;
    remark: string;
    addNewTeam: string;
    refresh: string;
    searchTeamName: string;
    viewMembers: string;
    inviteMembers: string;
    addMembers: string;
    delete: string;
    pleaseEnterTeamName: string;
    pleaseEnterTeamRemark: string;
    teamRole: string;
    teamRoleInputHint: string;
    pleaseEnterTeamRolesExample: string;
    [key: string]: any;
  };
}

const EnterprisePage: React.FC<EnterprisePageProps> = ({ t }) => {
  const { user, fetchUserInfo } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'channel' | 'team'>('channel');
  
  // Channel states
  const [channelLoading, setChannelLoading] = useState(false);
  const [channelInfo, setChannelInfo] = useState<LabChannelVO | null>(null);
  const [channelModalVisible, setChannelModalVisible] = useState(false);
  const [channelFormData, setChannelFormData] = useState<LabChannelForm>({
    channelName: '',
    isShare: 0,
  });
  const [isChannelEditMode, setIsChannelEditMode] = useState(false);
  const [channelSubmitting, setChannelSubmitting] = useState(false);
  
  // Team states
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamList, setTeamList] = useState<LabTeamVO[]>([]);
  const [teamSearchKeyword, setTeamSearchKeyword] = useState('');
  const [teamPagination, setTeamPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [teamModalVisible, setTeamModalVisible] = useState(false);
  const [teamFormData, setTeamFormData] = useState<LabTeamForm>({
    teamName: '',
    remark: '',
    status: 1,
    teamRoles: [],
  });
  const [isTeamEditMode, setIsTeamEditMode] = useState(false);
  const [teamSubmitting, setTeamSubmitting] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<LabTeamVO | null>(null);

  // Check if user has channel permission
  const hasChannelPermission = user?.channelId !== null && 
                               user?.channelId !== undefined && 
                               user?.channelId !== '' && 
                               user?.channelId !== 0;

  // Fetch channel info
  const fetchChannelInfo = async () => {
    if (!hasChannelPermission || !user?.channelId) return;
    
    setChannelLoading(true);
    try {
      const res = await channelService.getChannelList({
        pageNum: 1,
        pageSize: 10,
        channelId: user.channelId,
      });
      
      if (res.code === 200) {
        const data = (res as any).data || res;
        const rows = data?.rows || [];
        setChannelInfo(rows.length > 0 ? rows[0] : null);
      }
    } catch (error) {
      console.error('获取渠道信息失败:', error);
    } finally {
      setChannelLoading(false);
    }
  };

  // Fetch team list
  const fetchTeamList = async () => {
    setTeamLoading(true);
    try {
      const res = await teamService.getTeamList({
        pageNum: teamPagination.current,
        pageSize: teamPagination.pageSize,
        teamName: teamSearchKeyword || undefined,
      });
      
      if (res.code === 200) {
        const data = (res as any).data || res;
        const rows = data?.rows || [];
        const total = data?.total || 0;
        setTeamList(rows);
        setTeamPagination(prev => ({ ...prev, total }));
      }
    } catch (error) {
      console.error('获取团队列表失败:', error);
    } finally {
      setTeamLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'channel') {
      fetchChannelInfo();
    } else {
      fetchTeamList();
    }
  }, [activeTab, user?.channelId]);

  useEffect(() => {
    if (activeTab === 'team') {
      fetchTeamList();
    }
  }, [teamPagination.current, teamPagination.pageSize]);

  // Channel handlers
  const handleAddChannel = () => {
    setChannelFormData({
      channelName: '',
      isShare: 0,
      userId: user?.userId,
      userApiId: user?.nebulaApiId,
      userName: user?.username,
    });
    setIsChannelEditMode(false);
    setChannelModalVisible(true);
  };

  const handleEditChannel = (channel: LabChannelVO) => {
    setChannelFormData({
      channelId: channel.channelId,
      channelName: channel.channelName,
      isShare: channel.isShare,
      userId: channel.userId,
      userApiId: channel.userApiId,
      userName: channel.userName,
    });
    setIsChannelEditMode(true);
    setChannelModalVisible(true);
  };

  const handleChannelSubmit = async () => {
    if (!channelFormData.channelName) {
      alert(t.pleaseEnterChannelName);
      return;
    }

    setChannelSubmitting(true);
    try {
      if (isChannelEditMode) {
        await channelService.updateChannel(channelFormData);
      } else {
        await channelService.createChannel({
          ...channelFormData,
          channelId: user?.channelId,
        });
      }
      setChannelModalVisible(false);
      await fetchChannelInfo();
      await fetchUserInfo(); // Refresh user info to update channelId
    } catch (error: any) {
      console.error('保存渠道信息失败:', error);
      alert(error?.response?.data?.msg || '保存失败，请重试');
    } finally {
      setChannelSubmitting(false);
    }
  };

  // Team handlers
  const handleAddTeam = () => {
    setTeamFormData({
      teamName: '',
      remark: '',
      status: 1,
      teamRoles: [],
      channelId: user?.channelId,
    });
    setIsTeamEditMode(false);
    setCurrentTeam(null);
    setTeamModalVisible(true);
  };

  const handleEditTeam = (team: LabTeamVO) => {
    setTeamFormData({
      teamId: team.teamId,
      teamName: team.teamName,
      remark: team.remark || '',
      status: team.status,
      teamRoles: [],
      channelId: team.channelId,
    });
    setIsTeamEditMode(true);
    setCurrentTeam(team);
    setTeamModalVisible(true);
  };

  const handleDeleteTeam = async (team: LabTeamVO) => {
    if (!confirm(`确认删除团队 "${team.teamName}" 吗？`)) return;
    
    try {
      await teamService.deleteTeam(team.teamId);
      await fetchTeamList();
    } catch (error: any) {
      console.error('删除团队失败:', error);
      alert(error?.response?.data?.msg || '删除失败，请重试');
    }
  };

  const handleTeamSubmit = async () => {
    if (!teamFormData.teamName) {
      alert(t.pleaseEnterTeamName);
      return;
    }

    setTeamSubmitting(true);
    try {
      if (isTeamEditMode) {
        await teamService.updateTeam(teamFormData);
      } else {
        await teamService.createTeam(teamFormData);
      }
      setTeamModalVisible(false);
      await fetchTeamList();
    } catch (error: any) {
      console.error('保存团队失败:', error);
      alert(error?.response?.data?.msg || '保存失败，请重试');
    } finally {
      setTeamSubmitting(false);
    }
  };

  const handleTeamSearch = () => {
    setTeamPagination(prev => ({ ...prev, current: 1 }));
    fetchTeamList();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t.title}</h1>
        <p className="text-muted">管理渠道和团队信息</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('channel')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'channel'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 size={18} />
              {t.channelManagement}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'team'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users size={18} />
              {t.teamManagement}
            </div>
          </button>
        </div>
      </div>

      {/* Channel Management */}
      {activeTab === 'channel' && (
        <div className="bg-surface rounded-xl border border-border p-6">
          {!hasChannelPermission ? (
            <div className="text-center py-12">
              <XCircle className="mx-auto text-yellow-500 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-foreground mb-2">暂不支持此功能</h3>
              <p className="text-muted">请联系管理员开通渠道权限</p>
            </div>
          ) : channelLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : channelInfo ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {t.channelManagement}：{channelInfo.channelName}
                </h2>
                <button
                  onClick={() => handleEditChannel(channelInfo)}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-surface transition-colors"
                >
                  <Edit2 size={16} />
                  {t.edit}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-background rounded-lg border border-border">
                  <div className="text-sm text-muted mb-1">{t.channelName}</div>
                  <div className="font-medium text-foreground">{channelInfo.channelName}</div>
                </div>
                <div className="p-4 bg-background rounded-lg border border-border">
                  <div className="text-sm text-muted mb-1">{t.whetherShareAssets}</div>
                  <div>
                    {channelInfo.isShare === 1 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-sm">
                        <CheckCircle2 size={14} />
                        {t.yes}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-sm">
                        <XCircle size={14} />
                        {t.no}
                      </span>
                    )}
                  </div>
                </div>
                {channelInfo.createTime && (
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <div className="text-sm text-muted mb-1">{t.createTime}</div>
                    <div className="font-medium text-foreground">{channelInfo.createTime}</div>
                  </div>
                )}
                {channelInfo.updateTime && (
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <div className="text-sm text-muted mb-1">{t.updateTime}</div>
                    <div className="font-medium text-foreground">{channelInfo.updateTime}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="mx-auto text-muted mb-4" size={48} />
              <p className="text-muted mb-4">暂无渠道信息</p>
              <button
                onClick={handleAddChannel}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mx-auto"
              >
                <Plus size={16} />
                {t.addUserChannelRelation}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Team Management */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-surface rounded-xl border border-border p-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddTeam}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus size={16} />
                {t.addNewTeam}
              </button>
              <button
                onClick={fetchTeamList}
                disabled={teamLoading}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-background transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={teamLoading ? 'animate-spin' : ''} />
                {t.refresh}
              </button>
            </div>
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                type="text"
                value={teamSearchKeyword}
                onChange={(e) => setTeamSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTeamSearch()}
                placeholder={t.searchTeamName}
                className="w-full md:w-64 pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Team List */}
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            {teamLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
              </div>
            ) : teamList.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto text-muted mb-4" size={48} />
                <p className="text-muted mb-4">暂无团队</p>
                <button
                  onClick={handleAddTeam}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mx-auto"
                >
                  <Plus size={16} />
                  {t.addNewTeam}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-foreground">{t.teamName}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-foreground">{t.status}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-foreground">{t.remark}</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-foreground">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamList.map((team) => (
                      <tr key={team.teamId} className="border-b border-border hover:bg-background/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-foreground font-medium">{team.teamName}</td>
                        <td className="px-4 py-3">
                          {team.status === 1 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-xs">
                              <CheckCircle2 size={12} />
                              {t.normal}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs">
                              <XCircle size={12} />
                              {t.disabled}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted">{team.remark || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditTeam(team)}
                              className="px-3 py-1 text-xs text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                            >
                              {t.edit}
                            </button>
                            <button
                              onClick={() => handleDeleteTeam(team)}
                              className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            >
                              {t.delete}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {teamPagination.total > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted">
                共 {teamPagination.total} 条记录
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTeamPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                  disabled={teamPagination.current === 1}
                  className="px-3 py-1 border border-border rounded hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <span className="text-sm text-foreground">
                  {teamPagination.current} / {Math.ceil(teamPagination.total / teamPagination.pageSize)}
                </span>
                <button
                  onClick={() => setTeamPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                  disabled={teamPagination.current >= Math.ceil(teamPagination.total / teamPagination.pageSize)}
                  className="px-3 py-1 border border-border rounded hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Channel Modal */}
      {channelModalVisible && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setChannelModalVisible(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-xl border border-border shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">
                  {isChannelEditMode ? '编辑渠道' : t.addUserChannelRelation}
                </h3>
                <button
                  onClick={() => setChannelModalVisible(false)}
                  className="text-muted hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t.channelName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={channelFormData.channelName || ''}
                    onChange={(e) => setChannelFormData({ ...channelFormData, channelName: e.target.value })}
                    placeholder={t.pleaseEnterChannelName}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t.whetherShareAssets} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={channelFormData.isShare === 1}
                        onChange={() => setChannelFormData({ ...channelFormData, isShare: 1 })}
                        className="text-indigo-600"
                      />
                      <span>{t.yes}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={channelFormData.isShare === 0}
                        onChange={() => setChannelFormData({ ...channelFormData, isShare: 0 })}
                        className="text-indigo-600"
                      />
                      <span>{t.no}</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setChannelModalVisible(false)}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-surface transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleChannelSubmit}
                    disabled={channelSubmitting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {channelSubmitting && <Loader2 className="animate-spin" size={16} />}
                    保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Team Modal */}
      {teamModalVisible && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setTeamModalVisible(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-xl border border-border shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">
                  {isTeamEditMode ? '编辑团队' : t.addNewTeam}
                </h3>
                <button
                  onClick={() => setTeamModalVisible(false)}
                  className="text-muted hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t.teamName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={teamFormData.teamName || ''}
                    onChange={(e) => setTeamFormData({ ...teamFormData, teamName: e.target.value })}
                    placeholder={t.pleaseEnterTeamName}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t.teamRole}</label>
                  <input
                    type="text"
                    value={Array.isArray(teamFormData.teamRoles) ? teamFormData.teamRoles.join(',') : ''}
                    onChange={(e) => {
                      const roles = e.target.value.split(',').map(r => r.trim()).filter(Boolean);
                      setTeamFormData({ ...teamFormData, teamRoles: roles });
                    }}
                    placeholder={t.pleaseEnterTeamRolesExample}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                  <p className="text-xs text-muted mt-1">{t.teamRoleInputHint}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t.remark}</label>
                  <textarea
                    value={teamFormData.remark || ''}
                    onChange={(e) => setTeamFormData({ ...teamFormData, remark: e.target.value })}
                    placeholder={t.pleaseEnterTeamRemark}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setTeamModalVisible(false)}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-surface transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleTeamSubmit}
                    disabled={teamSubmitting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {teamSubmitting && <Loader2 className="animate-spin" size={16} />}
                    保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EnterprisePage;

