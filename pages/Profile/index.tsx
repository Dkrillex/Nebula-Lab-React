import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { profileService, UserProfileData } from '../../services/profileService';
import { useAuthStore } from '../../stores/authStore';
import { User, Phone, Mail, Calendar, Shield, Lock, Upload, Loader2, Building2, Eye, EyeOff } from 'lucide-react';
import EnterprisePage from '../Enterprise';
import { useAppOutletContext } from '../../router';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { t: rawT } = useAppOutletContext();
  const t = rawT.profilePage;
  const { user, fetchUserInfo } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'basic' | 'security' | 'enterprise'>('basic');
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

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 从URL参数获取当前标签页
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'enterprise') {
      setActiveTab('enterprise');
    } else if (tab === 'security') {
      setActiveTab('security');
    } else {
      setActiveTab('basic');
    }
  }, [location.search]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getUserProfile();
      if (data) {
        setProfile(data);
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
      toast.warning('请填写所有密码字段');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.warning('新密码长度至少为6位');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.warning('两次输入的新密码不一致');
      return;
    }

    if (passwordForm.oldPassword === passwordForm.newPassword) {
      toast.warning('新密码不能与旧密码相同');
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

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  const handleTabChange = (tab: 'basic' | 'security' | 'enterprise') => {
    setActiveTab(tab);
    const params = new URLSearchParams(location.search);
    if (tab === 'basic') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    navigate({ search: params.toString() }, { replace: true });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
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
              团队管理
            </div>
          </button>
        </div>
      </div>

      {/* Basic Info Tab */}
      {activeTab === 'basic' && profile && (
        <div className="max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-start gap-8">
              {/* 头像部分 */}
              <div className="flex-shrink-0">
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

              {/* 信息列表 */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted mb-1">账号名称</label>
                    <div className="text-foreground">{profile.user.userName}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted mb-1">账号昵称</label>
                    <div className="text-foreground">{profile.user.nickName}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted mb-1">
                      <Mail className="inline mr-1" size={14} />
                      邮箱
                    </label>
                    <div className="text-foreground">{profile.user.email || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted mb-1">
                      <Phone className="inline mr-1" size={14} />
                      手机号
                    </label>
                    <div className="text-foreground">{profile.user.phonenumber || '未绑定'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted mb-1">
                      <Calendar className="inline mr-1" size={14} />
                      注册时间
                    </label>
                    <div className="text-foreground">{profile.user.createTime}</div>
                  </div>
                </div>
              </div>
            </div>
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
        <EnterprisePage t={t?.enterprisePage || t} />
      )}
    </div>
  );
};

export default ProfilePage;
