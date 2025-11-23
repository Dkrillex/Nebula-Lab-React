import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { UserInvoiceForm } from '../services/invoiceService';
import BaseModal from './BaseModal';

export interface InvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: UserInvoiceForm;
  onSubmit?: (data: UserInvoiceForm) => void;
}

export interface InvoiceFormRef {
  validate: () => Promise<UserInvoiceForm>;
  resetForm: () => void;
}

const InvoiceForm = forwardRef<InvoiceFormRef, InvoiceFormProps>(
  ({ isOpen, onClose, initialData, onSubmit }, ref) => {
    const [formData, setFormData] = useState<UserInvoiceForm>({
      invoiceName: '',
      taxNumber: '',
      email: '',
      companyAddress: '',
      companyPhone: '',
      openingBank: '',
      bankAccount: '',
      ...initialData,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // 当初始数据改变时更新表单数据
    useEffect(() => {
      if (initialData) {
        setFormData((prev) => ({ ...prev, ...initialData }));
      }
    }, [initialData]);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      validate: async () => {
        const newErrors: Record<string, string> = {};

        // 验证发票抬头名称
        if (!formData.invoiceName || formData.invoiceName.trim() === '') {
          newErrors.invoiceName = '请输入发票抬头名称';
        }

        // 验证纳税人识别号
        if (!formData.taxNumber || formData.taxNumber.trim() === '') {
          newErrors.taxNumber = '请输入纳税人识别号';
        }

        // 验证邮箱
        if (!formData.email || formData.email.trim() === '') {
          newErrors.email = '请输入邮箱';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = '请输入有效的邮箱地址';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
          throw new Error('表单验证失败');
        }

        return { ...formData };
      },
      resetForm: () => {
        setFormData({
          invoiceName: '',
          taxNumber: '',
          email: '',
          companyAddress: '',
          companyPhone: '',
          openingBank: '',
          bankAccount: '',
        });
        setErrors({});
      },
    }));

    const handleInputChange = (field: keyof UserInvoiceForm, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // 清除该字段的错误
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        // 直接验证表单数据
        const newErrors: Record<string, string> = {};

        // 验证发票抬头名称
        if (!formData.invoiceName || formData.invoiceName.trim() === '') {
          newErrors.invoiceName = '请输入发票抬头名称';
        }

        // 验证纳税人识别号
        if (!formData.taxNumber || formData.taxNumber.trim() === '') {
          newErrors.taxNumber = '请输入纳税人识别号';
        }

        // 验证邮箱
        if (!formData.email || formData.email.trim() === '') {
          newErrors.email = '请输入邮箱';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = '请输入有效的邮箱地址';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
          return;
        }

        onSubmit?.(formData);
        onClose();
      } catch (error) {
        // 验证失败，错误已通过 errors 状态显示
        console.error('表单验证失败:', error);
      }
    };

    const handleClose = () => {
      setErrors({});
      onClose();
    };

    return (
      <BaseModal
        isOpen={isOpen}
        onClose={handleClose}
        title="填写发票抬头信息"
        width="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              发票抬头名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.invoiceName || ''}
              onChange={(e) => handleInputChange('invoiceName', e.target.value)}
              placeholder="请输入发票抬头名称"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.invoiceName
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            />
            {errors.invoiceName && (
              <p className="mt-1 text-sm text-red-500">{errors.invoiceName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              纳税人识别号 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.taxNumber || ''}
              onChange={(e) => handleInputChange('taxNumber', e.target.value)}
              placeholder="请输入纳税人识别号"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.taxNumber
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            />
            {errors.taxNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.taxNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              邮箱 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="请输入邮箱"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.email
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              公司地址
            </label>
            <input
              type="text"
              value={formData.companyAddress || ''}
              onChange={(e) => handleInputChange('companyAddress', e.target.value)}
              placeholder="请输入公司地址"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              公司电话
            </label>
            <input
              type="text"
              value={formData.companyPhone || ''}
              onChange={(e) => handleInputChange('companyPhone', e.target.value)}
              placeholder="请输入公司电话"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              开户银行
            </label>
            <input
              type="text"
              value={formData.openingBank || ''}
              onChange={(e) => handleInputChange('openingBank', e.target.value)}
              placeholder="请输入开户银行"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              银行账户
            </label>
            <input
              type="text"
              value={formData.bankAccount || ''}
              onChange={(e) => handleInputChange('bankAccount', e.target.value)}
              placeholder="请输入银行账户"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              确定
            </button>
          </div>
        </form>
      </BaseModal>
    );
  }
);

InvoiceForm.displayName = 'InvoiceForm';

export default InvoiceForm;
