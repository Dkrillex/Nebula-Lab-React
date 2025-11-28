import React from 'react';
import BaseModal from './BaseModal';
import LeadForm, { LeadFormTranslations } from './LeadForm';

export interface EnterpriseContactModalTranslations {
  title?: string;
  subtitle?: string;
  phone?: string;
  serviceTime?: string;
  workDays?: string;
  wechatContact?: string;
  scanToAdd?: string;
  customSolution?: string;
  techSupport?: string;
  dataAnalysis?: string;
  form?: LeadFormTranslations;
}

export interface EnterpriseContactModalProps {
  /** 是否打开 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 翻译文本 */
  translations?: EnterpriseContactModalTranslations;
  /** 微信二维码图片路径 */
  qrCodeImage?: string;
  /** 联系电话 */
  phoneNumber?: string;
}

const EnterpriseContactModal: React.FC<EnterpriseContactModalProps> = ({
  isOpen,
  onClose,
  translations: t = {} as EnterpriseContactModalTranslations,
  qrCodeImage = '/lab/zhenshangWxCode.png',
  phoneNumber = '19210015325',
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t.title || '企业定制服务'}
      width="max-w-4xl"
    >
      <div className="py-2">
        {/* 主要内容区域 */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧：线索表单组件 */}
          <div className="flex-1">
            <LeadForm translations={t.form} />
          </div>

          {/* 右侧：联系方式和微信二维码 */}
          <div className="lg:w-[280px] flex-shrink-0 space-y-4">
            {/* 副标题 */}
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {t.subtitle || '为您提供专业的AI解决方案'}
            </p>

            {/* 联系信息 */}
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl flex-shrink-0">📱</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {t.phone || '联系电话'}
                  </div>
                  <div className="text-base font-medium text-gray-900 dark:text-white">
                    {phoneNumber}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl flex-shrink-0">⏰</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {t.serviceTime || '服务时间'}
                  </div>
                  <div className="text-base font-medium text-gray-900 dark:text-white">
                    {t.workDays || '工作日 9:00-18:00'}
                  </div>
                </div>
              </div>
            </div>

            {/* 微信联系 */}
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t.wechatContact || '微信联系'}
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 mb-2">
                <img
                  src={qrCodeImage}
                  alt="微信联系方式"
                  className="w-[140px] h-[140px] object-contain mx-auto"
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t.scanToAdd || '扫码添加企业微信'}
              </div>
            </div>

            {/* 功能标签 */}
            <div className="flex flex-col items-center gap-2">
              <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
                {t.customSolution || '🎯 定制化方案'}
              </div>
              <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
                {t.techSupport || '🔧 技术支持'}
              </div>
              <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
                {t.dataAnalysis || '📊 数据分析'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default EnterpriseContactModal;

