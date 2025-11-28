import React, { useState } from 'react';
import { Check, Loader2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { leadService, LeadFormData, LEAD_CHANNELS } from '../services/leadService';

export interface LeadFormTranslations {
  title?: string;
  description?: string;
  name?: string;
  namePlaceholder?: string;
  email?: string;
  emailPlaceholder?: string;
  phone?: string;
  phonePlaceholder?: string;
  company?: string;
  companyPlaceholder?: string;
  channel?: string;
  channelPlaceholder?: string;
  channels?: Record<string, string>;
  message?: string;
  messagePlaceholder?: string;
  submit?: string;
  submitting?: string;
  submitSuccess?: string;
  submitError?: string;
  successTitle?: string;
  successMessage?: string;
  submitAnother?: string;
  errors?: {
    nameRequired?: string;
    phoneRequired?: string;
    phoneInvalid?: string;
    emailInvalid?: string;
    channelRequired?: string;
  };
}

export interface LeadFormProps {
  /** 翻译文本 */
  translations?: LeadFormTranslations;
  /** 提交成功回调 */
  onSubmitSuccess?: () => void;
  /** 是否显示标题 */
  showTitle?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 变体：默认或紧凑 */
  variant?: 'default' | 'compact';
}

const LeadForm: React.FC<LeadFormProps> = ({
  translations: t = {} as LeadFormTranslations,
  onSubmitSuccess,
  showTitle = true,
  className = '',
  variant = 'default',
}) => {
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    channel: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!formData.name.trim()) {
      toast.error(t.errors?.nameRequired || '请输入姓名');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error(t.errors?.phoneRequired || '请输入电话');
      return;
    }
    // 邮箱验证（如果填写了）
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error(t.errors?.emailInvalid || '请输入有效的邮箱地址');
      return;
    }
    if (!formData.channel) {
      toast.error(t.errors?.channelRequired || '请选择了解渠道');
      return;
    }

    try {
      setSubmitting(true);
      await leadService.submitLead(formData);
      setSubmitted(true);
      toast.success(t.submitSuccess || '提交成功，我们会尽快与您联系！');
      onSubmitSuccess?.();
    } catch (error) {
      console.error('Lead submit error:', error);
      toast.error(t.submitError || '提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      message: '',
      channel: '',
    });
    setSubmitted(false);
  };

  const isCompact = variant === 'compact';
  const inputClass = `w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`;

  // 提交成功状态
  if (submitted) {
    return (
      <div className={`flex flex-col items-center justify-center py-8 text-center ${className}`}>
        <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-4">
          <Check size={24} className="text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
          {t.successTitle || '提交成功！'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-5 max-w-sm text-sm">
          {t.successMessage || '感谢您的咨询，我们的专业顾问会在1-2个工作日内与您联系。'}
        </p>
        <button
          onClick={resetForm}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
        >
          {t.submitAnother || '继续提交'}
        </button>
      </div>
    );
  }

  return (
    <div className={`${isCompact ? 'p-4' : 'p-5'} bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {showTitle && (
        <div className="mb-4">
          <h3 className={`${isCompact ? 'text-sm' : 'text-base'} font-medium text-gray-900 dark:text-white`}>
            {t.title || '留下您的信息'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t.description || '专业顾问将尽快与您联系'}
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={`space-y-${isCompact ? '3' : '3'}`}>
        {/* 姓名 */}
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t.name || '姓名'} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t.namePlaceholder || '请输入您的姓名'}
            className={inputClass}
          />
        </div>

        {/* 电话 */}
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t.phone || '电话'} <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder={t.phonePlaceholder || '请输入您的手机号码'}
            className={inputClass}
          />
        </div>

        {/* 邮箱 */}
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t.email || '邮箱'}
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder={t.emailPlaceholder || '请输入您的邮箱（选填）'}
            className={inputClass}
          />
        </div>

        {/* 公司名称 */}
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t.company || '公司名称'}
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder={t.companyPlaceholder || '请输入您的公司名称（选填）'}
            className={inputClass}
          />
        </div>

        {/* 了解渠道 */}
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t.channel || '了解渠道'} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={formData.channel}
              onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
              className={`${inputClass} appearance-none cursor-pointer pr-8`}
            >
              <option value="">{t.channelPlaceholder || '请选择您是如何了解我们的'}</option>
              {LEAD_CHANNELS.map((channel) => (
                <option key={channel.value} value={channel.value}>
                  {t.channels?.[channel.value] || channel.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* 留言 */}
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t.message || '留言'}
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder={t.messagePlaceholder || '请描述您的需求（选填）'}
            rows={isCompact ? 2 : 3}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {t.submitting || '提交中...'}
            </>
          ) : (
            t.submit || '立即提交'
          )}
        </button>
      </form>
    </div>
  );
};

export default LeadForm;

