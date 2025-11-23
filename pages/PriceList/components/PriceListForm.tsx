import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { pricingService, PriceListVO, PriceListForm as PriceListFormType } from '../../../services/pricingService';
import { systemTypeService, SystemTypeVO } from '../../../services/systemTypeService';
import { productTypeService, ProductTypeVO } from '../../../services/productTypeService';
import BaseModal from '../../../components/BaseModal';
import toast from 'react-hot-toast';

interface PriceListFormProps {
  visible: boolean;
  item?: PriceListVO | null;
  isViewMode?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PriceListForm: React.FC<PriceListFormProps> = ({
  visible,
  item,
  isViewMode = false,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Partial<PriceListFormType>>({
    systemType: '',
    productType: '',
    productName: '',
    productPrice: undefined,
    productDescription: '',
    productPeriod: '2',
    productQuantity: 1,
    expiryDate: '',
    productScore: undefined,
  });

  const [systemTypes, setSystemTypes] = useState<SystemTypeVO[]>([]);
  const [productTypes, setProductTypes] = useState<ProductTypeVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 加载系统类型列表
  const loadSystemTypes = async () => {
    try {
      const res = await systemTypeService.getSystemTypeList();
      const rows = res.rows || res.data?.rows || [];
      setSystemTypes(rows);
    } catch (error) {
      console.error('加载系统类型失败:', error);
    }
  };

  // 加载产品类型列表
  const loadProductTypes = async (systemId?: string) => {
    try {
      const params = systemId ? { systemId } : {};
      const res = await productTypeService.getProductTypeList(params);
      const rows = res.rows || res.data?.rows || [];
      setProductTypes(rows);
    } catch (error) {
      console.error('加载产品类型失败:', error);
    }
  };

  // 初始化表单数据
  useEffect(() => {
    if (visible) {
      loadSystemTypes();
      
      if (item) {
        // 编辑或查看模式
        setFormData({
          id: item.id,
          systemType: item.systemType,
          productType: item.productType,
          productName: item.productName,
          productPrice: item.productPrice,
          productDescription: item.productDescription || '',
          productPeriod: item.productPeriod,
          productQuantity: item.productQuantity,
          expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().slice(0, 16) : '',
          productScore: item.productScore,
        });
        
        // 加载对应的产品类型
        if (item.systemType) {
          loadProductTypes(item.systemType);
        }
      } else {
        // 新建模式
        setFormData({
          systemType: '',
          productType: '',
          productName: '',
          productPrice: undefined,
          productDescription: '',
          productPeriod: '2',
          productQuantity: 1,
          expiryDate: '',
          productScore: undefined,
        });
        setProductTypes([]);
      }
      setErrors({});
    }
  }, [visible, item]);

  // 当系统类型改变时，重新加载产品类型
  useEffect(() => {
    if (formData.systemType) {
      loadProductTypes(formData.systemType);
      // 清空产品类型选择
      setFormData(prev => ({ ...prev, productType: '' }));
    } else {
      setProductTypes([]);
    }
  }, [formData.systemType]);

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.systemType) {
      newErrors.systemType = '请选择系统类型';
    }

    if (!formData.productType) {
      newErrors.productType = '请选择产品类型';
    }

    if (!formData.productName?.trim()) {
      newErrors.productName = '请输入产品名称';
    }

    if (formData.productPrice === undefined || formData.productPrice === null || formData.productPrice < 0) {
      newErrors.productPrice = '请输入有效的产品价格';
    }

    if (!formData.productPeriod) {
      newErrors.productPeriod = '请选择支付类型';
    }

    if (!formData.productQuantity || formData.productQuantity <= 0) {
      newErrors.productQuantity = '请输入有效的产品数量';
    }

    if (!formData.productScore || formData.productScore < 0) {
      newErrors.productScore = '请输入有效的产品积分';
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = '请选择过期日期';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const submitData: PriceListFormType = {
        ...formData,
        productPrice: Number(formData.productPrice),
        productQuantity: Number(formData.productQuantity),
        productScore: Number(formData.productScore),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString().slice(0, 19).replace('T', ' ') : '',
      } as PriceListFormType;

      if (item?.id) {
        // 更新
        await pricingService.updatePriceList(submitData);
        toast.success('更新成功');
      } else {
        // 新增
        await pricingService.addPriceList(submitData);
        toast.success('新增成功');
      }

      onSuccess();
    } catch (error: any) {
      console.error('提交失败:', error);
      toast.error(error?.msg || '提交失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={visible}
      onClose={onClose}
      title={isViewMode ? '查看定价' : item?.id ? '编辑定价' : '新增定价'}
      width="max-w-2xl"
    >
      <div className="space-y-4">
        {/* 系统类型 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            系统类型 <span className="text-destructive">*</span>
          </label>
          <select
            value={formData.systemType || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, systemType: e.target.value }))}
            disabled={isViewMode}
            className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.systemType ? 'border-destructive' : 'border-border'
            } ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="">请选择系统类型</option>
            {systemTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.systemName}
              </option>
            ))}
          </select>
          {errors.systemType && (
            <p className="mt-1 text-sm text-destructive">{errors.systemType}</p>
          )}
        </div>

        {/* 产品类型 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            产品类型 <span className="text-destructive">*</span>
          </label>
          <select
            value={formData.productType || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, productType: e.target.value }))}
            disabled={isViewMode || !formData.systemType}
            className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.productType ? 'border-destructive' : 'border-border'
            } ${isViewMode || !formData.systemType ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="">请选择产品类型</option>
            {productTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.productName}
              </option>
            ))}
          </select>
          {errors.productType && (
            <p className="mt-1 text-sm text-destructive">{errors.productType}</p>
          )}
        </div>

        {/* 产品名称 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            产品名称 <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={formData.productName || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
            disabled={isViewMode}
            placeholder="请输入产品名称"
            className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.productName ? 'border-destructive' : 'border-border'
            } ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          {errors.productName && (
            <p className="mt-1 text-sm text-destructive">{errors.productName}</p>
          )}
        </div>

        {/* 产品价格和积分 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              产品价格 <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              value={formData.productPrice ?? ''}
              onChange={(e) => setFormData(prev => ({ ...prev, productPrice: e.target.value ? Number(e.target.value) : undefined }))}
              disabled={isViewMode}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.productPrice ? 'border-destructive' : 'border-border'
              } ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {errors.productPrice && (
              <p className="mt-1 text-sm text-destructive">{errors.productPrice}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              产品积分 <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              value={formData.productScore ?? ''}
              onChange={(e) => setFormData(prev => ({ ...prev, productScore: e.target.value ? Number(e.target.value) : undefined }))}
              disabled={isViewMode}
              placeholder="0"
              min="0"
              className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.productScore ? 'border-destructive' : 'border-border'
              } ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {errors.productScore && (
              <p className="mt-1 text-sm text-destructive">{errors.productScore}</p>
            )}
          </div>
        </div>

        {/* 支付类型和产品数量 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              支付类型 <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.productPeriod || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, productPeriod: e.target.value }))}
              disabled={isViewMode}
              className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.productPeriod ? 'border-destructive' : 'border-border'
              } ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="1">年付</option>
              <option value="2">月付</option>
            </select>
            {errors.productPeriod && (
              <p className="mt-1 text-sm text-destructive">{errors.productPeriod}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              产品数量 <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              value={formData.productQuantity ?? ''}
              onChange={(e) => setFormData(prev => ({ ...prev, productQuantity: e.target.value ? Number(e.target.value) : undefined }))}
              disabled={isViewMode}
              placeholder="1"
              min="1"
              className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.productQuantity ? 'border-destructive' : 'border-border'
              } ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {errors.productQuantity && (
              <p className="mt-1 text-sm text-destructive">{errors.productQuantity}</p>
            )}
          </div>
        </div>

        {/* 过期日期 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            过期日期 <span className="text-destructive">*</span>
          </label>
          <input
            type="datetime-local"
            value={formData.expiryDate || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
            disabled={isViewMode}
            className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.expiryDate ? 'border-destructive' : 'border-border'
            } ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          {errors.expiryDate && (
            <p className="mt-1 text-sm text-destructive">{errors.expiryDate}</p>
          )}
        </div>

        {/* 产品描述 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            产品描述
          </label>
          <textarea
            value={formData.productDescription || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, productDescription: e.target.value }))}
            disabled={isViewMode}
            placeholder="请输入产品描述"
            rows={4}
            className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.productDescription ? 'border-destructive' : 'border-border'
            } ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        </div>

        {/* 操作按钮 */}
        {!isViewMode && (
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '提交中...' : item?.id ? '更新' : '新增'}
            </button>
          </div>
        )}

        {isViewMode && (
          <div className="flex justify-end pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors"
            >
              关闭
            </button>
          </div>
        )}
      </div>
    </BaseModal>
  );
};

export default PriceListForm;

