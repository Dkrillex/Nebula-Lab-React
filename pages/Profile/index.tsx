import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { profileService, UserProfileData } from '../../services/profileService';
import { useAuthStore } from '../../stores/authStore';
import { User, Phone, Mail, Calendar, Shield, Lock, Upload, Loader2, Building2, Eye, EyeOff, Users, Gift, Copy, Link, Share2, Check } from 'lucide-react';
import EnterprisePage from '../Enterprise';
import ChannelManagement from './components/ChannelManagement';
import InviteRecord from './components/InviteRecord';
import { useAppOutletContext } from '../../router/context';
import { translations } from '../../translations';
import { CURRENT_SYSTEM, SYSTEM_TYPE } from '../../constants';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { t: rawT } = useAppOutletContext();
  // 安全获取 translations，提供默认值，避免 white screen
  const t = (rawT?.profilePage || translations['zh'].profilePage) as typeof translations['zh']['profilePage'];
  
  const { user, fetchUserInfo } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'basic' | 'security' | 'enterprise' | 'invite'>('basic');
  const [enterpriseSubTab, setEnterpriseSubTab] = useState<'channel' | 'team'>('channel');
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // 修改密码相关状态
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // 基本设置表单相关状态
  const [profileForm, setProfileForm] = useState({
    userName: '',
    nickName: '',
    email: '',
    sex: '0',
    phonenumber: ''
  });
  const [profileFormLoading, setProfileFormLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 邀请码复制状态
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 获取用户邀请码和构建邀请链接
  const inviteCode = user?.inviteCode;
  // 根据系统类型选择域名：模型中心用 openai-nebula.com，创作中心或两者都有用 ai-nebula.com
  const inviteDomain = CURRENT_SYSTEM === SYSTEM_TYPE.MODEL_CENTER ? 'openai-nebula.com' : 'ai-nebula.com';
  const inviteUrl = inviteCode ? `https://${inviteDomain}/login?inviteCode=${inviteCode}` : '';

  // 复制邀请码
  const handleCopyCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCodeCopied(true);
      toast.success('邀请码已复制');
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      toast.error('复制失败');
    }
  };

  // 复制邀请链接
  const handleCopyLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setLinkCopied(true);
      toast.success('邀请链接已复制');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error('复制失败');
    }
  };

  // 从URL参数获取当前标签页
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    const subTab = params.get('subTab');
    
    if (tab === 'enterprise') {
      setActiveTab('enterprise');
      if (subTab === 'team') {
        setEnterpriseSubTab('team');
      } else {
        // 如果没有 subTab 或 subTab 不是 'team'，默认设置为 'channel'
        setEnterpriseSubTab('channel');
        // 如果 URL 中没有 subTab，更新 URL
        if (!subTab) {
          const newParams = new URLSearchParams(location.search);
          newParams.set('subTab', 'channel');
          navigate({ search: newParams.toString() }, { replace: true });
        }
      }
    } else if (tab === 'security') {
      setActiveTab('security');
      setEnterpriseSubTab('channel'); // 重置子 tab
    } else if (tab === 'invite') {
      setActiveTab('invite');
      setEnterpriseSubTab('channel'); // 重置子 tab
    } else {
      setActiveTab('basic');
      setEnterpriseSubTab('channel'); // 重置子 tab
    }
  }, [location.search, navigate]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getUserProfile();
      if (data) {
        setProfile(data);
        // 初始化表单数据
        setProfileForm({
          userName: data.user.userName || '',
          nickName: data.user.nickName || '',
          email: data.user.email || '',
          sex: data.user.sex || '0',
          phonenumber: data.user.phonenumber || ''
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await profileService.updateAvatar(file);
      await fetchUserInfo();
      await loadProfile();
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // 验证
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('请填写所有密码字段');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('新密码长度至少为6位');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('两次输入的新密码不一致');
      return;
    }

    if (passwordForm.oldPassword === passwordForm.newPassword) {
      toast.error('新密码不能与旧密码相同');
      return;
    }

    try {
      setPasswordLoading(true);
      await profileService.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('密码修改成功');
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast.error(error.message || '密码修改失败，请检查旧密码是否正确');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSexChange = (value: string) => {
    setProfileForm(prev => ({ ...prev, sex: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证邮箱格式
    if (profileForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      toast.error('请输入正确的邮箱格式');
      return;
    }

    // 验证手机号格式（如果填写了）
    // 支持国际号码：6-15位数字（与注册/登录页面保持一致）
    if (profileForm.phonenumber && !/^\d{6,15}$/.test(profileForm.phonenumber)) {
      toast.error('请输入正确的手机号码（6-15位数字）');
      return;
    }

    // 验证账号名称格式（如果填写了）
    // 2到30个字符，中文字符、字母、数字或下划线，且必须以非数字开头
    if (profileForm.userName) {
      if (profileForm.userName.length < 2 || profileForm.userName.length > 30) {
        toast.error('账号名称长度必须在2-30个字符之间');
        return;
      }
      if (!/^[^\d]/.test(profileForm.userName)) {
        toast.error('账号名称必须以非数字开头');
        return;
      }
      if (!/^[^\d][\u4e00-\u9fa5a-zA-Z0-9_]*$/.test(profileForm.userName)) {
        toast.error('账号名称只能包含中文字符、字母、数字或下划线');
        return;
      }
    }

    if (!profile) return;

    try {
      setProfileFormLoading(true);
      await profileService.updateProfile({
        userId: profile.user.userId,
        userName: profileForm.userName,
        nickName: profileForm.nickName,
        email: profileForm.email,
        sex: profileForm.sex,
        phonenumber: profileForm.phonenumber
      });
      toast.success('信息更新成功');
      setIsEditing(false);
      await fetchUserInfo();
      await loadProfile();
    } catch (error: any) {
      toast.error(error.message || '信息更新失败');
    } finally {
      setProfileFormLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setProfileForm({
        userName: profile.user.userName || '',
        nickName: profile.user.nickName || '',
        email: profile.user.email || '',
        sex: profile.user.sex || '0',
        phonenumber: profile.user.phonenumber || ''
      });
    }
    setIsEditing(false);
  };

  const handleTabChange = (tab: 'basic' | 'security' | 'enterprise' | 'invite') => {
    setActiveTab(tab);
    const params = new URLSearchParams(location.search);
    if (tab === 'basic') {
      params.delete('tab');
      params.delete('subTab');
    } else if (tab === 'enterprise') {
      params.set('tab', tab);
      // 如果还没有 subTab，默认设置为 channel
      if (!params.get('subTab')) {
        params.set('subTab', 'channel');
      }
    } else {
      params.set('tab', tab);
      params.delete('subTab');
    }
    navigate({ search: params.toString() }, { replace: true });
  };

  const handleEnterpriseSubTabChange = (subTab: 'channel' | 'team') => {
    setEnterpriseSubTab(subTab);
    const params = new URLSearchParams(location.search);
    params.set('tab', 'enterprise');
    params.set('subTab', subTab);
    navigate({ search: params.toString() }, { replace: true });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl min-h-[500px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">个人中心</h1>
        <p className="text-muted">管理您的个人信息和账户设置</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => handleTabChange('basic')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'basic'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <User size={18} />
              基本设置
            </div>
          </button>
          <button
            onClick={() => handleTabChange('security')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'security'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield size={18} />
              安全设置
            </div>
          </button>
          <button
            onClick={() => handleTabChange('enterprise')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'enterprise'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 size={18} />
              企业管理
            </div>
          </button>
          <button
            onClick={() => handleTabChange('invite')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'invite'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Gift size={18} />
              推广邀请记录
            </div>
          </button>
        </div>
      </div>

      {/* Basic Info Tab */}
      {activeTab === 'basic' && (
        <div className="max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border p-6 min-h-[200px] relative">
            {/* 即使没有数据也渲染结构，加载时覆盖 Loading */}
            {loading && !profile && (
               <div className="flex items-center justify-center absolute inset-0 bg-white/50 dark:bg-gray-800/50 z-10">
                 <Loader2 className="animate-spin text-indigo-600" size={32} />
               </div>
            )}
            
            {/* 错误状态或空状态 */}
            {!loading && !profile && (
              <div className="flex flex-col items-center justify-center h-48 text-muted">
                <p>无法加载个人信息</p>
                <button onClick={loadProfile} className="mt-2 text-indigo-600 hover:underline">重试</button>
              </div>
            )}

            {/* 数据存在或正在加载（如果是重新加载）时显示内容 */}
            {profile && (
            <form onSubmit={handleProfileSubmit}>
              <div className="flex flex-col md:flex-row items-start gap-8">
                {/* 头像部分 */}
                <div className="flex-shrink-0 self-center md:self-start">
                  <div className="relative group cursor-pointer" onClick={() => !uploading && fileInputRef.current?.click()}>
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-50 dark:border-indigo-900/30 relative">
                      {profile.user.avatar ? (
                        <img 
                          src={profile.user.avatar} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-500">
                          <User size={40} />
                        </div>
                      )}
                      {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="animate-spin text-white" size={24} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                        <Upload size={16} className="mr-1" />
                        更换头像
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleAvatarUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>
                </div>

                {/* 信息表单 */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* 账号名称（只读） */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        账号名称
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="userName"
                          value={profileForm.userName}
                          onChange={handleProfileFormChange}
                          placeholder="请输入账号名称（2-30个字符，必须以非数字开头）"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        />
                      ) : (
                        <div className="text-foreground">{profile.user.userName || '-'}</div>
                      )}
                    </div>

                    {/* 昵称（可编辑） */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        账号昵称 <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="nickName"
                          value={profileForm.nickName}
                          onChange={handleProfileFormChange}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                          required
                        />
                      ) : (
                        <div className="text-foreground">{profile.user.nickName || '-'}</div>
                      )}
                    </div>

                    {/* 邮箱（可编辑） */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        <Mail className="inline mr-1" size={14} />
                        邮箱
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={profileForm.email}
                          onChange={handleProfileFormChange}
                          placeholder="请输入邮箱"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        />
                      ) : (
                        <div className="text-foreground">{profile.user.email || '-'}</div>
                      )}
                    </div>

                    {/* 手机号（可编辑） */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        <Phone className="inline mr-1" size={14} />
                        手机号
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phonenumber"
                          value={profileForm.phonenumber}
                          onChange={handleProfileFormChange}
                          placeholder="请输入手机号"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        />
                      ) : (
                        <div className="text-foreground">{profile.user.phonenumber || '未绑定'}</div>
                      )}
                    </div>

                    {/* 性别（可编辑） */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        性别
                      </label>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSexChange('0')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              profileForm.sex === '0'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-foreground hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            男
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSexChange('1')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              profileForm.sex === '1'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-foreground hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            女
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSexChange('2')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              profileForm.sex === '2'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-foreground hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            未知
                          </button>
                        </div>
                      ) : (
                        <div className="text-foreground">
                          {profile.user.sex === '0' ? '男' : profile.user.sex === '1' ? '女' : '未知'}
                        </div>
                      )}
                    </div>

                    {/* 注册时间（只读） */}
                    <div>
                      <label className="block text-sm font-medium text-muted mb-1">
                        <Calendar className="inline mr-1" size={14} />
                        注册时间
                      </label>
                      <div className="text-foreground">{profile.user.createTime}</div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={profileFormLoading}
                          className="px-6 py-2 border border-border rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                          取消
                        </button>
                        <button
                          type="submit"
                          disabled={profileFormLoading}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {profileFormLoading && <Loader2 className="animate-spin" size={16} />}
                          保存
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                      >
                        编辑
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="max-w-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
              <Shield size={20} className="text-green-600" />
              <h3 className="text-lg font-bold text-foreground">修改密码</h3>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* 旧密码 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  旧密码 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    name="oldPassword"
                    value={passwordForm.oldPassword}
                    onChange={handlePasswordChange}
                    placeholder="请输入旧密码"
                    className="w-full pl-10 pr-10 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                  >
                    {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* 新密码 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  新密码 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="请输入新密码（至少6位）"
                    className="w-full pl-10 pr-10 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* 确认密码 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  确认密码 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="请再次输入新密码"
                    className="w-full pl-10 pr-10 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* 错误提示 */}
              {passwordError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
                </div>
              )}

              {/* 成功提示 */}
              {passwordSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400">{passwordSuccess}</p>
                </div>
              )}

              {/* 提交按钮 */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {passwordLoading && <Loader2 className="animate-spin" size={16} />}
                  修改密码
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enterprise Management Tab */}
      {activeTab === 'enterprise' && (
        <div>
          {/* 子 Tab */}
          <div className="mb-6 border-b border-border">
            <div className="flex gap-4">
              <button
                onClick={() => handleEnterpriseSubTabChange('channel')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  enterpriseSubTab === 'channel'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 size={18} />
                  企业管理
                </div>
              </button>
              <button
                onClick={() => handleEnterpriseSubTabChange('team')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  enterpriseSubTab === 'team'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  团队管理
                </div>
              </button>
            </div>
          </div>

          {/* 子 Tab 内容 */}
          {enterpriseSubTab === 'channel' ? (
            <ChannelManagement t={t} />
          ) : (
            <EnterprisePage t={t?.enterprisePage || t} />
          )}
        </div>
      )}

      {/* Invite Record Tab */}
      {activeTab === 'invite' && (
        <div className="space-y-6">
          {/* 用户的邀请码 */}
          {inviteCode && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* 邀请码 */}
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm text-muted whitespace-nowrap">邀请码:</span>
                  <span className="font-bold font-mono text-foreground">{inviteCode}</span>
                  <button onClick={handleCopyCode} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" title="复制邀请码">
                    {codeCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-muted" />}
                  </button>
                </div>
                {/* 邀请链接 */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted truncate max-w-[200px] hidden md:inline">{inviteUrl}</span>
                  <button onClick={handleCopyLink} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium">
                    {linkCopied ? <Check size={14} /> : <Link size={14} />}
                    {linkCopied ? '已复制' : '复制链接'}
                  </button>
                  {/* <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: 'NebulaLab 邀请', text: `邀请码：${inviteCode}`, url: inviteUrl }).catch(() => {});
                      } else {
                        handleCopyLink();
                      }
                    }}
                    className="p-1.5 border border-border hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="分享"
                  >
                    <Share2 size={16} className="text-muted" />
                  </button> */}
                </div>
              </div>
              {/* 邀请奖励说明 */}
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted">
                  🎁 邀请好友注册，好友可获得 <span className="text-green-600 dark:text-green-400 font-medium">$10</span> 使用金额
                </p>
              </div>
            </div>
          )}

          {/* 邀请记录 */}
          <InviteRecord t={t} />
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
