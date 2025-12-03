import { useCallback } from 'react';
import { labProjectService } from '../../../../../services/labProjectService';
import { LabProjectForm } from '../../../../../types';
import { ViralVideoProjectData } from '../types';
import toast from 'react-hot-toast';

// 延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 带重试的请求函数
const requestWithRetry = async (
  requestFn: () => Promise<any>,
  maxRetries = 3,
  retryDelay = 1000
): Promise<any> => {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error: any) {
      lastError = error;
      console.error(`请求失败 (尝试 ${attempt + 1}/${maxRetries}):`, error);

      if (attempt < maxRetries - 1) {
        // 指数退避延迟
        await delay(retryDelay * Math.pow(2, attempt));
      }
    }
  }

  throw lastError;
};

interface UseProjectSaveProps {
  projectId: string | number | null;
  setProjectId: (id: string | number | null) => void;
  getProjectData: () => ViralVideoProjectData;
  projectIdStr?: string; // 前端生成的项目ID字符串
  onSaveStart?: () => void; // 保存开始回调
  onSaveComplete?: (success: boolean) => void; // 保存完成回调
}

export const useProjectSave = ({ projectId, setProjectId, getProjectData, projectIdStr, onSaveStart, onSaveComplete }: UseProjectSaveProps) => {
  // 创建项目
  const createProject = useCallback(async (productName?: string): Promise<string | number | null> => {
    onSaveStart?.(); // 通知保存开始
    try {
      const projectData = getProjectData();
      const projectJson = JSON.stringify(projectData);

      const formData: LabProjectForm = {
        projectId: projectIdStr, // 使用前端生成的项目ID
        projectName: productName || projectData.productName || `AI混剪视频_${new Date().toLocaleString('zh-CN')}`,
        projectDesc: `商品：${projectData.productName || '未命名商品'}`,
        projectType: '1', // 营销视频
        projectJson: projectJson,
      };

      const response = await requestWithRetry(
        () => labProjectService.createProject(formData),
        3, // 最多重试3次
        1000 // 初始延迟1秒
      );
      if (response.code === 200 && response.data) {
        const newProjectId = response.data.id;
        setProjectId(newProjectId);
        toast.success('项目保存成功');
        onSaveComplete?.(true); // 通知保存成功
        return newProjectId;
      } else {
        throw new Error(response.msg || '创建项目失败');
      }
    } catch (error: any) {
      console.error('创建项目失败:', error);
      toast.error(error.message || '创建项目失败，请重试');
      onSaveComplete?.(false); // 通知保存失败
      return null;
    }
  }, [getProjectData, setProjectId, onSaveStart, onSaveComplete]);

  // 更新项目
  const updateProject = useCallback(async (): Promise<boolean> => {
    onSaveStart?.(); // 通知保存开始
    if (!projectId) {
      // 如果没有项目ID，先创建项目
      const newId = await createProject();
      return newId !== null;
    }

    try {
      const projectData = getProjectData();
      const projectJson = JSON.stringify(projectData);

      const formData: LabProjectForm = {
        id: projectId,
        projectName: projectData.productName || `AI混剪视频_${new Date().toLocaleString('zh-CN')}`,
        projectDesc: `商品：${projectData.productName || '未命名商品'}`,
        projectType: '1',
        projectJson: projectJson,
      };

      const response = await requestWithRetry(
        () => labProjectService.updateProject(formData),
        3, // 最多重试3次
        1000 // 初始延迟1秒
      );
      if (response.code === 200) {
        onSaveComplete?.(true); // 通知保存成功
        return true;
      } else {
        throw new Error(response.msg || '更新项目失败');
      }
    } catch (error: any) {
      console.error('更新项目失败:', error);
      toast.error(error.message || '更新项目失败，请重试');
      onSaveComplete?.(false); // 通知保存失败
      return false;
    }
  }, [projectId, getProjectData, createProject, onSaveStart, onSaveComplete]);

  // 保存项目（创建或更新）- 带重试机制
  const saveProject = useCallback(async (productName?: string): Promise<boolean> => {
    try {
      if (!projectId) {
        const newId = await createProject(productName);
        return newId !== null;
      } else {
        return await updateProject();
      }
    } catch (error: any) {
      console.error('保存项目失败:', error);
      toast.error('保存项目失败，请检查网络连接后重试');
      return false;
    }
  }, [projectId, createProject, updateProject]);

  return {
    createProject,
    updateProject,
    saveProject,
  };
};

