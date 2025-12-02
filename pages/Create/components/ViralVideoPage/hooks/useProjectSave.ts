import { useCallback } from 'react';
import { labProjectService } from '../../../../../services/labProjectService';
import { LabProjectForm } from '../../../../../types';
import { ViralVideoProjectData } from '../types';
import toast from 'react-hot-toast';

interface UseProjectSaveProps {
  projectId: string | number | null;
  setProjectId: (id: string | number | null) => void;
  getProjectData: () => ViralVideoProjectData;
  projectIdStr?: string; // 前端生成的项目ID字符串
}

export const useProjectSave = ({ projectId, setProjectId, getProjectData, projectIdStr }: UseProjectSaveProps) => {
  // 创建项目
  const createProject = useCallback(async (productName?: string): Promise<string | number | null> => {
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

      const response = await labProjectService.createProject(formData);
      if (response.code === 200 && response.data) {
        const newProjectId = response.data.id;
        setProjectId(newProjectId);
        toast.success('项目保存成功');
        return newProjectId;
      } else {
        throw new Error(response.msg || '创建项目失败');
      }
    } catch (error: any) {
      console.error('创建项目失败:', error);
      toast.error(error.message || '创建项目失败，请重试');
      return null;
    }
  }, [getProjectData, setProjectId]);

  // 更新项目
  const updateProject = useCallback(async (): Promise<boolean> => {
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

      const response = await labProjectService.updateProject(formData);
      if (response.code === 200) {
        return true;
      } else {
        throw new Error(response.msg || '更新项目失败');
      }
    } catch (error: any) {
      console.error('更新项目失败:', error);
      toast.error(error.message || '更新项目失败，请重试');
      return false;
    }
  }, [projectId, getProjectData, createProject]);

  // 保存项目（创建或更新）
  const saveProject = useCallback(async (productName?: string): Promise<boolean> => {
    if (!projectId) {
      const newId = await createProject(productName);
      return newId !== null;
    } else {
      return await updateProject();
    }
  }, [projectId, createProject, updateProject]);

  return {
    createProject,
    updateProject,
    saveProject,
  };
};

