import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Trash2, Edit2, Plus, RefreshCw, Download, Search, X } from 'lucide-react';
import { pricingService, PriceListVO, PriceListQuery } from '../../services/pricingService';
import { systemTypeService, SystemTypeVO } from '../../services/systemTypeService';
import { productTypeService, ProductTypeVO } from '../../services/productTypeService';
import PriceListForm from './components/PriceListForm';
import ConfirmDialog from '../../components/ConfirmDialog';
import BaseModal from '../../components/BaseModal';
import toast from 'react-hot-toast';

interface PriceListPageProps {}

const PriceListPage: React.FC<PriceListPageProps> = () => {
  const outletContext = useOutletContext<{ t: any }>();
  const t = outletContext?.t?.priceListPage;

  const [priceList, setPriceList] = useState<PriceListVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // 搜索和筛选
  const [searchKeyword, setSearchKeyword] = useState('');
  const [systemTypeFilter, setSystemTypeFilter] = useState<string>('');
  const [productTypeFilter, setProductTypeFilter] = useState<string>('');

  // 系统类型和产品类型选项
  const [systemTypes, setSystemTypes] = useState<SystemTypeVO[]>([]);
  const [productTypes, setProductTypes] = useState<ProductTypeVO[]>([]);
  const [systemTypeMap, setSystemTypeMap] = useState<Record<string, string>>({});
  const [productTypeMap, setProductTypeMap] = useState<Record<string, string>>({});

  // 表单和对话框状态
  const [formVisible, setFormVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<PriceListVO | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);

  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // 加载系统类型列表
  const loadSystemTypes = async () => {
    try {
      const res = await systemTypeService.getSystemTypeList();
      const rows = res.rows || res.data?.rows || [];
      setSystemTypes(rows);
      const map: Record<string, string> = {};
      rows.forEach((item: SystemTypeVO) => {
        map[item.id] = item.systemName;
      });
      setSystemTypeMap(map);
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
      const map: Record<string, string> = {};
      rows.forEach((item: ProductTypeVO) => {
        map[item.id] = item.productName;
      });
      setProductTypeMap(map);
    } catch (error) {
      console.error('加载产品类型失败:', error);
    }
  };

  // 获取定价列表
  const fetchPriceList = async (pageNum = pagination.current) => {
    try {
      setLoading(true);
      const params: PriceListQuery = {
        pageNum,
        pageSize: pagination.pageSize,
      };

      if (searchKeyword) {
        params.productName = searchKeyword;
      }
      if (systemTypeFilter) {
        params.systemType = systemTypeFilter;
      }
      if (productTypeFilter) {
        params.productType = productTypeFilter;
      }

      const res = await pricingService.getPriceListPage(params);
      const data = res.rows || res.data?.rows || [];
      const total = res.total || res.data?.total || 0;

      setPriceList(data);
      setPagination(prev => ({
        ...prev,
        current: pageNum,
        total,
      }));
    } catch (error) {
      console.error('获取定价列表失败:', error);
      toast.error('获取定价列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载数据
  useEffect(() => {
    loadSystemTypes();
    fetchPriceList();
  }, []);

  // 当系统类型改变时，重新加载产品类型
  useEffect(() => {
    if (systemTypeFilter) {
      loadProductTypes(systemTypeFilter);
    } else {
      loadProductTypes();
    }
  }, [systemTypeFilter]);

  // 处理新增
  const handleAdd = () => {
    setCurrentItem(null);
    setIsViewMode(false);
    setFormVisible(true);
  };

  // 处理编辑
  const handleEdit = (item: PriceListVO) => {
    setCurrentItem(item);
    setIsViewMode(false);
    setFormVisible(true);
  };

  // 处理查看
  const handleView = (item: PriceListVO) => {
    setCurrentItem(item);
    setIsViewMode(true);
    setFormVisible(true);
  };

  // 处理删除
  const handleDelete = (item: PriceListVO) => {
    setConfirmDialog({
      isOpen: true,
      title: '确认删除',
      message: `确定要删除定价项 "${item.productName}" 吗？`,
      onConfirm: async () => {
        try {
          await pricingService.removePriceList(item.id);
          toast.success('删除成功');
          fetchPriceList();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('删除失败:', error);
          toast.error('删除失败');
        }
      },
    });
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    // 这里可以实现批量删除功能
    toast.info('批量删除功能待实现');
  };

  // 处理导出
  const handleExport = async () => {
    try {
      const params: PriceListQuery = {};
      if (searchKeyword) params.productName = searchKeyword;
      if (systemTypeFilter) params.systemType = systemTypeFilter;
      if (productTypeFilter) params.productType = productTypeFilter;

      const blob = await pricingService.exportPriceList(params);
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `定价列表_${new Date().getTime()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      toast.error('导出失败');
    }
  };

  // 处理搜索
  const handleSearch = () => {
    fetchPriceList(1);
  };

  // 处理重置
  const handleReset = () => {
    setSearchKeyword('');
    setSystemTypeFilter('');
    setProductTypeFilter('');
    fetchPriceList(1);
  };

  // 处理表单成功
  const handleFormSuccess = () => {
    setFormVisible(false);
    fetchPriceList();
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">定价列表管理</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <Download size={18} />
            导出
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            新增
          </button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-background border border-border rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="搜索产品名称..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <select
            value={systemTypeFilter}
            onChange={(e) => {
              setSystemTypeFilter(e.target.value);
              setProductTypeFilter(''); // 重置产品类型
            }}
            className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">全部系统类型</option>
            {systemTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.systemName}
              </option>
            ))}
          </select>

          <select
            value={productTypeFilter}
            onChange={(e) => setProductTypeFilter(e.target.value)}
            className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={!systemTypeFilter}
          >
            <option value="">全部产品类型</option>
            {productTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.productName}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              搜索
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 表格 */}
      <div className="bg-background border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="animate-spin text-primary" size={24} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">系统类型</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">产品类型</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">产品名称</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">产品价格</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">产品积分</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">支付类型</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">产品数量</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">过期日期</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {priceList.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-muted">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    priceList.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-foreground">{item.id}</td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {systemTypeMap[item.systemType] || item.systemType}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {productTypeMap[item.productType] || item.productType}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">{item.productName}</td>
                        <td className="px-4 py-3 text-sm text-foreground">¥{item.productPrice}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{item.productScore}</td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {item.productPeriod === '1' ? '年付' : item.productPeriod === '2' ? '月付' : item.productPeriod}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">{item.productQuantity}</td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(item)}
                              className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                              title="查看"
                            >
                              查看
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                              title="编辑"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors"
                              title="删除"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {pagination.total > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <div className="text-sm text-muted">
                  共 {pagination.total} 条记录，第 {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize)} 页
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchPriceList(pagination.current - 1)}
                    disabled={pagination.current === 1}
                    className="px-3 py-1 bg-background border border-border rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => fetchPriceList(pagination.current + 1)}
                    disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                    className="px-3 py-1 bg-background border border-border rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 表单模态框 */}
      <PriceListForm
        visible={formVisible}
        item={currentItem}
        isViewMode={isViewMode}
        onClose={() => setFormVisible(false)}
        onSuccess={handleFormSuccess}
      />

      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default PriceListPage;

