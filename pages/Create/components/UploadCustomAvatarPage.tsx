import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Upload, Loader2, CheckCircle, AlertCircle, Info, Copy, Video, FileVideo } from 'lucide-react';
import { avatarService, UploadedFile, CustomAvatarTaskResult } from '../../../services/avatarService';
import { uploadService } from '../../../services/uploadService';
import { useAuthStore } from '../../../stores/authStore';
import UploadComponent from '../../../components/UploadComponent';
import AddMaterialModal from '../../../components/AddMaterialModal';
import toast from 'react-hot-toast';

interface UploadCustomAvatarPageProps {
  t?: any;
}

const SvgPointsIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <path d="M913.7 430.7c2.9-2.9 7.5-7.4-3.9-21.7L722.6 159.7H302.8l-187 248.9c-11.6 14.6-7 19.2-4.3 21.9l401.2 410.4 401-410.2zM595.5 667.2c-7.7 0-14-6.3-14-14s6.3-14 14-14 14 6.3 14 14c0 7.8-6.3 14-14 14zM746 502.8c6.6 6.6 6.6 17.2 0 23.7L645.2 627.3c-3.3 3.3-7.6 4.9-11.9 4.9-4.3 0-8.6-1.6-11.9-4.9-6.6-6.6-6.6-17.2 0-23.7l100.7-100.7c6.7-6.7 17.3-6.7 23.9-0.1zM346 358.1c-6.7-6.5-6.8-17.1-0.4-23.7 6.4-6.7 17.1-6.8 23.7-0.4l149.6 145 151.5-146.8c6.7-6.5 17.3-6.3 23.7 0.4 6.5 6.7 6.3 17.3-0.4 23.7L535.2 509.9c-0.8 1.8-1.8 3.5-3.3 5-3.3 3.4-7.7 5.1-12.1 5.1-4.2 0-8.4-1.6-11.7-4.7L346 358.1z" fill="#006be6" />
    <path d="M936.4 388.4l-192-255.6c-3.2-4.2-8.1-6.7-13.4-6.7H294.4c-5.3 0-10.3 2.5-13.4 6.7L89.3 388.1c-27.1 34.1-10 57.7-1.6 66.1l413 422.5c3.2 3.2 7.5 5.1 12 5.1s8.8-1.8 12-5.1l412.8-422.4c8.7-8.5 25.7-32.1-1.1-65.9z m-820.5 20.2l187-248.9h419.8L909.9 409c11.3 14.3 6.8 18.8 3.9 21.7l-401 410.2-401.2-410.4c-2.8-2.7-7.3-7.3 4.3-21.9z" fill="#ffffff" className="selected" />
    <path d="M532 514.9c1.4-1.5 2.5-3.2 3.3-5l158.6-153.7c6.7-6.5 6.8-17.1 0.4-23.7-6.5-6.7-17.1-6.8-23.7-0.4L519 478.9 369.4 334c-6.7-6.4-17.3-6.3-23.7 0.4-6.5 6.7-6.3 17.3 0.4 23.7l162.2 157.2c3.3 3.2 7.5 4.7 11.7 4.7 4.3 0 8.7-1.7 12-5.1zM621.5 627.3c3.3 3.3 7.6 4.9 11.9 4.9 4.3 0 8.6-1.6 11.9-4.9L746 526.5c6.6-6.6 6.6-17.2 0-23.7-6.6-6.6-17.2-6.6-23.7 0L621.5 603.5c-6.6 6.6-6.6 17.2 0 23.8z" fill="#ffffff" className="selected" />
  </svg>
);

const UploadCustomAvatarPage: React.FC<UploadCustomAvatarPageProps> = ({ t }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();

  // Form State
  const [formData, setFormData] = useState({
    avatarName: '',
    noticeUrl: '',
    videoFileId: '',
    score: '1',
  });
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [loading, setLoading] = useState(false);

  // Task State
  const [taskId, setTaskId] = useState<string>('');
  const [taskStatus, setTaskStatus] = useState<string>('idle'); // idle, running, success, fail
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<CustomAvatarTaskResult | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);

  // Result State
  const [previewVideoUrl, setPreviewVideoUrl] = useState('');
  const [aiAvatar, setAiAvatar] = useState<any>(null);
  
  // Modals
  const [showMaterialModal, setShowMaterialModal] = useState(false);

  useEffect(() => {
    const queryTaskId = searchParams.get('taskId');
    if (queryTaskId) {
      setTaskId(queryTaskId);
      queryResult(queryTaskId);
    }
  }, [searchParams]);

  const validateForm = () => {
    if (!formData.avatarName.trim()) {
      toast.error(t?.script?.errors?.e1 || '请输入数字人名称');
      return false;
    }
    if (formData.avatarName.length < 2 || formData.avatarName.length > 20) {
      toast.error(t?.script?.errors?.e2 || '名称长度在2-20个字符之间');
      return false;
    }
    if (!formData.videoFileId) {
      toast.error(t?.script?.errors?.e3 || '请上传视频文件');
      return false;
    }
    return true;
  };

  const handleUploadComplete = (file: UploadedFile) => {
    setUploadedFile(file);
    setFormData(prev => ({
      ...prev,
      videoFileId: file.fileId,
      avatarName: prev.avatarName || file.fileName.replace(/\.[^/.]+$/, '').slice(0, 20)
    }));
    toast.success(t?.script?.success?.s1 || '视频上传成功');
  };

  const handleSubmit = async () => {
    if (!token) {
      toast.error('请先登录');
      return;
    }
    if (!validateForm()) return;

    try {
      setLoading(true);
      setProgress(0);
      setTaskStatus('running');
      
      const res = await avatarService.submitCustomAvatarTask({
        avatarName: formData.avatarName,
        noticeUrl: formData.noticeUrl,
        videoFileId: formData.videoFileId,
        score: formData.score
      });

      if (res.code === '200' && res.result?.taskId) {
        const newTaskId = res.result.taskId;
        setTaskId(newTaskId);
        toast.success(t?.script?.success?.s2 || '任务提交成功');
        // Update URL without reloading
        navigate(`?taskId=${newTaskId}`, { replace: true });
        // Start querying
        queryResult(newTaskId);
      } else {
        throw new Error(res.message || '提交失败');
      }
    } catch (error: any) {
      console.error('Submit failed:', error);
      toast.error(error.message || t?.script?.errors?.e5 || '提交失败，请重试');
      setTaskStatus('fail');
    } finally {
      setLoading(false);
    }
  };

  const queryResult = async (currentTaskId: string) => {
    if (!currentTaskId) return;

    try {
      setQueryLoading(true);
      const res = await avatarService.queryCustomAvatarTask(currentTaskId);
      
      if (res.code !== '200' || !res.result) {
          throw new Error(res.message || '查询失败');
      }

      const taskResult = res.result;
      setResult(taskResult);
      setTaskStatus(taskResult.status);

      if (taskResult.status === 'running' || taskResult.status === 'init') {
        // Simulate progress
        if (progress < 90) {
          setProgress(prev => Math.min(prev + Math.random() * 5, 90));
        }
        // Poll again
        setTimeout(() => queryResult(currentTaskId), 10000);
      } else if (taskResult.status === 'success') {
        setProgress(100);
        toast.success(t?.script?.success?.s3 || '任务完成');
        
        // Process result URLs (transfer to OSS)
        const videoUrl = taskResult.aiAvatar?.previewVideoUrl;
        const coverUrl = taskResult.aiAvatar?.coverUrl;
        
        if (videoUrl) {
             // In React version we might just use the URL directly or upload if needed.
             // The Vue version uploads to OSS to prevent expiration.
             try {
                 const uploadRes = await uploadService.uploadByVideoUrl(videoUrl, 'mp4');
                 setPreviewVideoUrl(uploadRes.url || videoUrl);
                 setAiAvatar({
                     ...taskResult.aiAvatar,
                     previewVideoUrl: uploadRes.url || videoUrl,
                     coverUrl: coverUrl // We'll deal with cover upload if needed, or just use video frame
                 });
                 
                 if (coverUrl) {
                      uploadService.uploadByImageUrl(coverUrl, 'jpg').then(res => {
                           setAiAvatar((prev: any) => ({ ...prev, coverUrl: res.url || coverUrl }));
                      }).catch(e => console.warn('Cover upload failed', e));
                 }
             } catch (e) {
                 console.error('Failed to upload result to OSS', e);
                 setPreviewVideoUrl(videoUrl);
                 setAiAvatar(taskResult.aiAvatar);
             }
        }
      } else if (taskResult.status === 'fail') {
        if (taskResult.errorMsg === 'no face detected') {
             toast.error(t?.script?.errors?.e7 || '未检测到人脸');
        } else {
             toast.error(taskResult.errorMsg || taskResult.errorMessage || '生成失败');
        }
      }
    } catch (error) {
      console.error('Query failed:', error);
    } finally {
      setQueryLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      avatarName: '',
      noticeUrl: '',
      videoFileId: '',
      score: '1',
    });
    setUploadedFile(null);
    setTaskId('');
    setTaskStatus('idle');
    setResult(null);
    setPreviewVideoUrl('');
    setAiAvatar(null);
    setProgress(0);
    navigate('/create/uploadCustomAvatar', { replace: true });
    toast.success(t?.script?.success?.s4 || '表单已重置');
  };

  const copyTaskId = () => {
      if (taskId) {
          navigator.clipboard.writeText(taskId);
          toast.success('任务ID已复制');
      }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t?.tips?.page?.title || '自定义数字人视频生成'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t?.tips?.page?.description || '上传您的视频文件，AI将为您生成专业的自定义数字人模型'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              {t?.tips?.form?.title || '生成配置'}
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t?.tips?.form?.label || '视频文件'}
                </label>
                <UploadComponent
                  onUploadComplete={handleUploadComplete}
                  uploadType="tv"
                  accept=".mp4,.mov"
                  maxSize={100}
                  immediate={true}
                  className="h-64"
                  initialUrl={uploadedFile?.fileUrl}
                >
                    <div className="flex flex-col items-center justify-center text-gray-500">
                        <Upload className="w-10 h-10 mb-2 text-gray-400" />
                        <p className="text-sm font-medium">
                            {t?.tips?.form?.uploadText || '点击或拖拽上传视频'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {t?.tips?.form?.uploadHint || '支持 MP4、MOV 格式，文件大小不超过100MB'}
                        </p>
                        <div className="mt-4 text-xs text-left space-y-1 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <p>• {t?.tips?.form?.requirements?.[0] || '分辨率：360p ~ 4K'}</p>
                            <p>• {t?.tips?.form?.requirements?.[1] || '时长：4秒 ~ 3分钟'}</p>
                            <p>• {t?.tips?.form?.requirements?.[2] || '需要正脸数字人视频'}</p>
                        </div>
                    </div>
                </UploadComponent>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t?.tips?.formLabel || '数字人名称'}
                </label>
                <input
                  type="text"
                  value={formData.avatarName}
                  onChange={(e) => setFormData({ ...formData, avatarName: e.target.value })}
                  placeholder={t?.tips?.input || '请输入自定义数字人名称'}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  maxLength={20}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={
                    loading ||
                    taskStatus !== 'idle' ||
                    !formData.videoFileId ||
                    !formData.avatarName
                  }
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : null}
                  {loading ? (t?.tips?.primary || '提交中...') : (<>
                    <SvgPointsIcon className="mr-2 size-6" />
                    <span>{t?.tips?.primary1 || '开始生成'}</span>
                  </>)}
                </button>
                {/* <button
                  onClick={resetForm}
                  className="px-6 py-2.5 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition"
                >
                  {t?.tips?.actionBtn || '重置'}
                </button> */}
              </div>
            </div>
          </div>

          {/* Right: Status */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              {t?.tips?.statusCard || '任务状态'}
            </h3>

            {taskId ? (
                <div className="space-y-6">
                    {/* Generating State */}
                    {taskStatus === 'running' || taskStatus === 'init' ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-full max-w-xs mb-8 relative">
                                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="mt-2 text-right text-sm font-medium text-indigo-600">
                                    {Math.round(progress)}%
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-center mb-2 animate-pulse">
                                {t?.tips?.generatingText || 'AI正在为您生成数字人模型...'}
                            </p>
                            <p className="text-sm text-gray-400 text-center">
                                {t?.tips?.generatingText1 || '训练时长预计2-3分钟'}
                            </p>
                        </div>
                    ) : null}

                    {/* Success State */}
                    {taskStatus === 'success' && previewVideoUrl ? (
                        <div className="py-4">
                            <div className="flex items-center gap-2 text-green-500 mb-4 font-medium">
                                <CheckCircle className="w-5 h-5" />
                                {t?.tips?.successIcon || '生成完成'}
                            </div>
                            <div className="relative rounded-xl overflow-hidden bg-black aspect-video mb-6">
                                <video
                                    src={previewVideoUrl}
                                    controls
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <button
                                onClick={() => setShowMaterialModal(true)}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition"
                            >
                                {t?.tips?.actionBtn2 || '加入素材库'}
                            </button>
                        </div>
                    ) : null}

                    {/* Error State */}
                    {taskStatus === 'fail' ? (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                {t?.tips?.errorIcon || '生成失败'}
                            </h4>
                            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                                {result?.errorMessage || result?.errorMsg || t?.tips?.errorContent || '未知错误'}
                            </p>
                        </div>
                    ) : null}
                    
                    {/* <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm text-gray-500">
                        <span>Task ID: {taskId}</span>
                        <button onClick={copyTaskId} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <Copy className="w-4 h-4" />
                        </button>
                    </div> */}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Info className="w-12 h-12 mb-4 opacity-50" />
                    <p>{t?.tips?.secondary || '请先提交任务'}</p>
                </div>
            )}
          </div>
        </div>
      </div>

      <AddMaterialModal
        isOpen={showMaterialModal}
        onClose={() => setShowMaterialModal(false)}
        onSuccess={() => {
          toast.success(t?.script?.success?.s5 || '已成功加入素材库');
          setShowMaterialModal(false);
        }}
        initialData={aiAvatar ? {
          assetName: aiAvatar.aiavatarName,
          assetId: aiAvatar.aiavatarId,
          assetUrl: aiAvatar.previewVideoUrl,
          coverUrl: aiAvatar.coverUrl,
          assetType: 9, // 9 for AI Avatar based on vben code
          aiAvatarId: aiAvatar.aiavatarId
        } : undefined}
        disableAssetTypeSelection={true}
        isImportMode={true}
      />
    </div>
  );
};

export default UploadCustomAvatarPage;

