import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Download } from 'lucide-react';
import { expenseService } from '../services/expenseService';
import toast from 'react-hot-toast';

interface TeamLogsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TeamLogsImportModal: React.FC<TeamLogsImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [updateSupport, setUpdateSupport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 重置状态
  const resetState = () => {
    setFile(null);
    setUpdateSupport(false);
    setLoading(false);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 关闭模态框
  const handleClose = () => {
    resetState();
    onClose();
  };

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // 验证文件类型
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(fileExtension)) {
      toast.error('请上传 Excel 文件（.xlsx 或 .xls）');
      return;
    }

    // 验证文件大小（最大 10MB）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      toast.error('文件大小不能超过 10MB');
      return;
    }

    setFile(selectedFile);
  };

  // 下载模板
  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      const blob = await expenseService.downloadTeamLogsImportTemplate();
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `团队日志导入模板_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('模板下载成功');
    } catch (error: any) {
      console.error('下载模板失败:', error);
      toast.error(error?.message || '下载模板失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 提交导入
  const handleSubmit = async () => {
    if (!file) {
      toast.error('请先选择要导入的文件');
      return;
    }

    try {
      setUploading(true);
      const result = await expenseService.importTeamLogs(file, updateSupport);
      
      if (result.code === 200) {
        toast.success('导入成功');
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // 显示后端返回的错误信息（可能包含详细的导入结果）
        toast.error(result.msg || '导入失败');
      }
    } catch (error: any) {
      console.error('导入失败:', error);
      toast.error(error?.message || '导入失败，请稍后重试');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">团队日志导入</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={uploading}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* 文件上传区域 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择文件
            </label>
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                file
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
              } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
              
              {file ? (
                <div className="flex flex-col items-center">
                  <FileSpreadsheet size={48} className="text-indigo-500 mb-2" />
                  <p className="text-sm font-medium text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload size={48} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">点击或拖拽文件到此处上传</p>
                  <p className="text-xs text-gray-400 mt-1">支持 .xlsx, .xls 格式</p>
                </div>
              )}
            </div>
          </div>

          {/* 下载模板 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">允许导入 xlsx, xls 文件</span>
            <button
              onClick={handleDownloadTemplate}
              disabled={loading || uploading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              <span>下载模板</span>
            </button>
          </div>

          {/* 更新支持选项 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className={`text-sm ${updateSupport ? 'text-red-600' : 'text-gray-700'}`}>
              是否更新/覆盖已存在的日志数据
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={updateSupport}
                onChange={(e) => setUpdateSupport(e.target.checked)}
                disabled={uploading}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || uploading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>导入中...</span>
              </>
            ) : (
              '确认导入'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamLogsImportModal;

