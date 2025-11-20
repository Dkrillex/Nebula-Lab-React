import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { profileService, UserProfile, UpdateProfileParams } from '../../services/profileService';
import { useAuthStore } from '../../stores/authStore';
import { User, Phone, Mail, Calendar, Shield, Lock, Upload, Loader2, Building2 } from 'lucide-react';
import { uploadService } from '../../services/uploadService';
import EnterprisePage from '../Enterprise';
import { useAppOutletContext } from '../../router';

const ProfilePage: React.FC = () => {
  const { t: rawT } = useAppOutletContext();
  const t = rawT.profilePage;
  const { user, fetchUserInfo } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'basic' | 'security' | 'enterprise'>('basic');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileParams>({
    nickName: '',
    phonenumber: '',
    email: '',
    sex: '0'
  });

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
      const res = await profileService.getUserProfile();
      if (res.code === 200 && res.data) {
        setProfile(res.data);
        setFormData({
          nickName: res.data.nickName,
          phonenumber: res.data.phonenumber,
          email: res.data.email,
          sex: res.data.sex
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await profileService.updateUserProfile(formData);
      if (res.code === 200) {
        // Refresh user info in store
        await fetchUserInfo();
        // Reload profile data
        await loadProfile();
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await profileService.updateAvatar(file);
      if (res.code === 200) {
        await fetchUserInfo();
        await loadProfile();
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
        <h1 className="text-2xl font-bold text-foreground mb-2">{t.title}</h1>
        <p className="text-muted">{t.subtitle}</p>
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
              {t.basicInfo}
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
              {t.accountSecurity}
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
              {t.enterpriseManagement || '企业管理'}
            </div>
          </button>
        </div>
      </div>

      {/* Enterprise Management Tab */}
      {activeTab === 'enterprise' && (
        <EnterprisePage t={t.enterprisePage || t} />
      )}

      {/* Basic Info & Security Tabs */}
      {activeTab !== 'enterprise' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel - Avatar & Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border p-6 flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => !uploading && fileInputRef.current?.click()}>
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-50 dark:border-indigo-900/30 mb-4 relative">
                {profile?.avatar ? (
                  <img 
                    src={profile.avatar.startsWith('http') ? profile.avatar : `/api/${profile.avatar}`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-500">
                    <User size={48} />
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" size={24} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                  <Upload size={16} className="mr-1" />
                  {t.uploadAvatar}
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
            
            <h2 className="text-xl font-bold text-foreground mb-1">{profile?.nickName || profile?.userName}</h2>
            <p className="text-sm text-muted mb-6">{profile?.dept?.deptName || 'No Department'}</p>
            
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3 text-sm text-muted">
                  <User size={16} />
                  <span>{t.labels.role}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{profile?.roleGroup || '-'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3 text-sm text-muted">
                  <Calendar size={16} />
                  <span>{t.labels.createTime}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{profile?.createTime?.split(' ')[0] || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
              <User size={20} className="text-indigo-600" />
              <h3 className="text-lg font-bold text-foreground">{t.basicInfo}</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">{t.labels.nickname}</label>
                  <input
                    type="text"
                    name="nickName"
                    value={formData.nickName}
                    onChange={handleInputChange}
                    placeholder={t.placeholders.nickname}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">{t.labels.phone}</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input
                      type="text"
                      name="phonenumber"
                      value={formData.phonenumber}
                      onChange={handleInputChange}
                      placeholder={t.placeholders.phone}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">{t.labels.email}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t.placeholders.email}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">{t.labels.gender}</label>
                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sex"
                        value="0"
                        checked={formData.sex === '0'}
                        onChange={handleInputChange}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-foreground">{t.gender.male}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sex"
                        value="1"
                        checked={formData.sex === '1'}
                        onChange={handleInputChange}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-foreground">{t.gender.female}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="animate-spin" size={16} />}
                  {t.buttons.save}
                </button>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
              <Shield size={20} className="text-green-600" />
              <h3 className="text-lg font-bold text-foreground">{t.accountSecurity}</h3>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600">
                  <Lock size={20} />
                </div>
                <div>
                  <div className="font-medium text-foreground">{t.labels.password}</div>
                  <div className="text-xs text-muted">Regularly changing your password helps protect your account</div>
                </div>
              </div>
              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                {t.buttons.changePassword}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default ProfilePage;

