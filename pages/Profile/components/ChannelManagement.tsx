import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Edit2, Plus, AlertCircle, Loader2, X } from 'lucide-react';
import { channelService } from '../../../services/channelService';
import { LabChannelVO, LabChannelForm } from '../../../types';
import { useAuthStore } from '../../../stores/authStore';
import toast from 'react-hot-toast';

interface ChannelManagementProps {
  t?: any;
}

const ChannelManagement: React.FC<ChannelManagementProps> = ({ t }) => {
  const { user, fetchUserInfo } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [channelList, setChannelList] = useState<LabChannelVO[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<LabChannelForm>({
    channelName: '',
    isShare: 0,
  });

  // 检查用户是否有企业权限
  const hasChannelPermission = useMemo(() => {
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
  }, [user?.channelId]);

  // 获取单个企业信息（取第一个）
  const channelInfo = channelList.length > 0 ? channelList[0] : null;

  // 获取企业信息
  const fetchChannelInfo = useCallback(async () => {
    if (!hasChannelPermission || !user?.channelId) {
      setChannelList([]);
      return;
    }

    setLoading(true);
    try {
      const userChannelId = user.channelId;
      const response = await channelService.getChannelList({
        pageNum: 1,
        pageSize: 10,
        channelId: userChannelId,
      });
      setChannelList(response.rows || []);
    } catch (error) {
      console.error('获取企业信息失败:', error);
      toast.error(t?.enterprise?.getChannelInfoFailed || '获取企业信息失败');
    } finally {
      setLoading(false);
    }
  }, [hasChannelPermission, user?.channelId]);

  // 重置表单
  const resetForm = () => {
    setFormData({
      channelName: '',
      isShare: 0,
    });
  };

  // 打开新增弹窗
  const handleAddChannel = () => {
    resetForm();
    setIsEditMode(false);
    setModalVisible(true);
  };

  // 打开编辑弹窗
  const handleEdit = (record: LabChannelVO) => {
    setFormData({
      channelId: record.channelId,
      channelName: record.channelName,
      isShare: record.isShare,
      userId: record.userId,
      userApiId: record.userApiId,
      userName: record.userName,
    });
    setIsEditMode(true);
    setModalVisible(true);
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!formData.channelName?.trim()) {
      toast.error(t?.enterprise?.enterChannelNameRequired || '请输入企业名称');
      return;
    }

    if (formData.isShare === undefined || formData.isShare === null) {
      toast.error(t?.enterprise?.selectShareAssetsRequired || '请选择是否共享资产');
      return;
    }

    // 新增时验证是否有 channelId
    if (!isEditMode && !user?.channelId) {
      toast.error(t?.enterprise?.noChannelId || '无法获取企业ID，请确认您有企业权限');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        // 编辑
        if (!formData.channelId) {
          toast.error(t?.enterprise?.missingChannelId || '缺少企业ID，无法编辑');
          return;
        }
        await channelService.updateChannel(formData);
        toast.success(t?.enterprise?.editSuccess || '企业信息编辑成功');
      } else {
        // 新增，自动填充用户信息
        const newChannelData: LabChannelForm = {
          ...formData,
          channelId: user.channelId, // 使用用户的channelId作为主键
          userId: user.userId,
          userApiId: user.nebulaApiId,
          userName: user.username, // UserInfo 接口中使用的是 username
        };
        await channelService.createChannel(newChannelData);
        toast.success(t?.enterprise?.addSuccess || '新增成功');
      }

      setModalVisible(false);
      resetForm();
      
      // 重新获取企业信息
      await fetchChannelInfo();
      
      // 更新用户信息
      try {
        await fetchUserInfo();
      } catch (error) {
        console.error('更新用户信息失败:', error);
      }
    } catch (error: any) {
      console.error('操作失败:', error);
      toast.error(error.message || (isEditMode ? (t?.enterprise?.editFailed || '企业信息编辑失败') : (t?.enterprise?.addFailed || '新增失败')));
    } finally {
      setSubmitting(false);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    if (hasChannelPermission) {
      fetchChannelInfo();
    } else {
      setChannelList([]);
    }
  }, [hasChannelPermission, fetchChannelInfo]);

  // 无权限提示
  if (!hasChannelPermission) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="text-yellow-500 mb-4" size={48} />
        <h3 className="text-lg font-semibold text-foreground mb-2">{t?.enterprise?.notSupported || '暂不支持该功能'}</h3>
        <p className="text-muted">{t?.enterprise?.contactAdmin || '请联系管理员开通企业权限'}</p>
      </div>
    );
  }

  return (
    <div className="channel-management p-4">
      {/* 有企业信息时显示卡片 */}
      {channelInfo ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">
              {t?.enterprise?.channelInfo || '企业信息'}：{channelInfo.channelName}
            </h3>
            <button
              onClick={() => handleEdit(channelInfo)}
              className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-sm"
            >
              <Edit2 size={16} />
              {t?.enterprise?.edit || '编辑'}
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">{t?.enterprise?.channelName || '企业名称'}：</label>
                  <div className="text-foreground">{channelInfo.channelName}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">{t?.enterprise?.shareAssets || '是否共享资产'}：</label>
                  <span className={`text-xs px-2 py-1 rounded ${
                    channelInfo.isShare === 1 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {channelInfo.isShare === 1 ? (t?.enterprise?.yes || '是') : (t?.enterprise?.no || '否')}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">{t?.enterprise?.createTime || '创建时间'}：</label>
                  <div className="text-foreground">{channelInfo.createTime || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">{t?.enterprise?.updateTime || '更新时间'}：</label>
                  <div className="text-foreground">{channelInfo.updateTime || '-'}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : !loading ? (
        // 无企业信息时显示空状态
        <div className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="text-gray-400 mb-4" size={48} />
          <p className="text-muted mb-6">{t?.enterprise?.noChannelInfo || '暂无企业信息'}</p>
          <button
            onClick={handleAddChannel}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            {t?.enterprise?.addRelation || '新增用户企业关联'}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      )}

      {/* 新增/编辑弹窗 */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full mx-4">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">
                {isEditMode ? (t?.enterprise?.editRelation || '编辑用户企业关联') : (t?.enterprise?.addRelationTitle || '新增用户企业关联')}
              </h3>
              <button
                onClick={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                className="text-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t?.enterprise?.channelName || '企业名称'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.channelName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, channelName: e.target.value }))}
                  placeholder={t?.enterprise?.enterChannelName || '请输入企业名称'}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t?.enterprise?.shareAssets || '是否共享资产'} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value={1}
                      checked={formData.isShare === 1}
                      onChange={() => setFormData(prev => ({ ...prev, isShare: 1 }))}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-foreground">{t?.enterprise?.yes || '是'}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value={0}
                      checked={formData.isShare === 0}
                      onChange={() => setFormData(prev => ({ ...prev, isShare: 0 }))}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-foreground">{t?.enterprise?.no || '否'}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t?.enterprise?.cancel || '取消'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="animate-spin" size={16} />}
                {t?.enterprise?.confirm || '确定'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelManagement;

