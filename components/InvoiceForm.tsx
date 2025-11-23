import React, { useState, useImperativeHandle, forwardRef } from 'react';
import BaseModal from './BaseModal';
import toast from 'react-hot-toast';

export interface UserInvoiceForm {
  systemId?: number;
  userId?: string;
  userName?: string;
  invoiceName: string;
  taxNumber: string;
  email: string;
  companyAddress: string;
  companyPhone: string;
  openingBank: string;
  bankAccount: string;
  isInvoiced?: number;
  originalPrice?: number;
  invoicePrice?: number;
}

interface InvoiceFormProps {
  invoiceForm: UserInvoiceForm;
  onFormChange?: (form: UserInvoiceForm) => void;
}

export interface InvoiceFormRef {
  open: () => void;
  validate: () => Promise<void>;
  resetForm: () => void;
}

const InvoiceForm = forwardRef<InvoiceFormRef, InvoiceFormProps>(
  ({ invoiceForm, onFormChange }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState<UserInvoiceForm>(invoiceForm);
    const [errors, setErrors] = useState<Partial<Record<keyof UserInvoiceForm, string>>>({});

    useImperativeHandle(ref, () => ({
      open: () => {
        setIsOpen(true);
        setForm(invoiceForm);
        setErrors({});
      },
      validate: async () => {
        const newErrors: Partial<Record<keyof UserInvoiceForm, string>> = {};

        if (!form.invoiceName?.trim()) {
          newErrors.invoiceName = '请输入发票抬头';
        }
        if (!form.taxNumber?.trim()) {
          newErrors.taxNumber = '请输入纳税人识别号';
        }
        if (!form.email?.trim()) {
          newErrors.email = '请输入邮箱';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
          newErrors.email = '请输入有效的邮箱地址';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
          return Promise.reject(newErrors);
        }

        if (onFormChange) {
          onFormChange(form);
        }

        return Promise.resolve();
      },
      resetForm: () => {
        setForm({
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

    const handleSubmit = async () => {
      try {
        // This will be called from parent via ref
        const formRef = ref as React.MutableRefObject<InvoiceFormRef>;
        if (formRef.current) {
          await formRef.current.validate();
          toast.success('填写成功！');
          setIsOpen(false);
        }
      } catch (error) {
        // Validation failed, errors are already set
      }
    };

    const handleChange = (field: keyof UserInvoiceForm, value: string) => {
      const newForm = { ...form, [field]: value };
      setForm(newForm);
      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined });
      }
      if (onFormChange) {
        onFormChange(newForm);
      }
    };

    return (
      <BaseModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="填写发票信息"
        width="max-w-lg"
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              发票抬头 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.invoiceName || ''}
              onChange={(e) => handleChange('invoiceName', e.target.value)}
              placeholder="请输入发票抬头"
              className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                errors.invoiceName ? 'border-red-500' : 'border-border'
              }`}
            />
            {errors.invoiceName && (
              <p className="text-red-500 text-xs mt-1">{errors.invoiceName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              纳税人识别号 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.taxNumber || ''}
              onChange={(e) => handleChange('taxNumber', e.target.value)}
              placeholder="请输入纳税人识别号"
              className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                errors.taxNumber ? 'border-red-500' : 'border-border'
              }`}
            />
            {errors.taxNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.taxNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              邮箱 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="请输入邮箱"
              className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                errors.email ? 'border-red-500' : 'border-border'
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              公司地址
            </label>
            <input
              type="text"
              value={form.companyAddress || ''}
              onChange={(e) => handleChange('companyAddress', e.target.value)}
              placeholder="请输入公司地址"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              公司电话
            </label>
            <input
              type="text"
              value={form.companyPhone || ''}
              onChange={(e) => handleChange('companyPhone', e.target.value)}
              placeholder="请输入公司电话"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              开户银行
            </label>
            <input
              type="text"
              value={form.openingBank || ''}
              onChange={(e) => handleChange('openingBank', e.target.value)}
              placeholder="请输入开户银行"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              银行账号
            </label>
            <input
              type="text"
              value={form.bankAccount || ''}
              onChange={(e) => handleChange('bankAccount', e.target.value)}
              placeholder="请输入银行账号"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-secondary/50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              确定
            </button>
          </div>
        </div>
      </BaseModal>
    );
  }
);

InvoiceForm.displayName = 'InvoiceForm';

export default InvoiceForm;

