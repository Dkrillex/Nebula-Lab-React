# Lab项目管理服务文档

## 概述

本文档描述了 `nebula_lab_project` 表在前端系统中的实现，包括类型定义、服务方法和使用示例。

## 数据库表结构

```sql
create table nebula_lab_project
(
    id           bigint                       not null comment '项目Id' primary key,
    project_id   varchar(255)                 null comment '项目ID（如：nebula_121389）',
    project_name varchar(255)                 not null comment '项目名',
    project_desc varchar(5000)                null comment '项目描述',
    tenant_id    varchar(20) default '000000' null comment '租户编号',
    create_dept  bigint                       null comment '创建部门',
    create_by    bigint                       null comment '创建者',
    create_time  datetime                     null comment '创建时间',
    update_by    bigint                       null comment '更新者',
    update_time  datetime                     null comment '更新时间',
    project_json longtext                     null comment '项目数据',
    project_type varchar(255)                 null comment '项目类型'
)
comment 'Lab项目表';
```

## 后端接口说明

### 接口地址
- **基础路径**: `/ads/labProject`

### 接口列表

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/ads/labProject/list` | 分页查询项目列表 | `ads:labProject:list` |
| GET | `/ads/labProject/{id}` | 获取项目详情 | `ads:labProject:query` |
| POST | `/ads/labProject` | 新增项目 | `ads:labProject:add` |
| PUT | `/ads/labProject` | 更新项目 | `ads:labProject:edit` |
| DELETE | `/ads/labProject/{ids}` | 删除项目 | `ads:labProject:remove` |
| POST | `/ads/labProject/export` | 导出项目列表 | `ads:labProject:export` |

### 请求/响应格式

#### 1. 分页查询列表
**请求参数**:
```typescript
{
  pageNum?: number;      // 页码
  pageSize?: number;     // 每页数量
  projectId?: string;    // 项目ID（如：nebula_121389）
  projectName?: string;  // 项目名（模糊查询）
  projectDesc?: string;  // 项目描述
  projectType?: string;  // 项目类型
  createBy?: number;     // 创建者
  params?: any;          // 日期范围等扩展参数
}
```

**响应格式**:
```typescript
{
  code: number;
  msg: string;
  data: {
    rows: LabProjectVO[];
    total: number;
  }
}
```

#### 2. 获取项目详情
**请求参数**: `id` (路径参数)

**响应格式**:
```typescript
{
  code: number;
  msg: string;
  data: LabProjectVO
}
```

#### 3. 新增/更新项目
**请求体**:
```typescript
{
  id?: number | string;        // 更新时必填
  projectId?: string;          // 项目ID（如：nebula_121389）
  projectName: string;          // 项目名（必填）
  projectDesc?: string;          // 项目描述
  projectJson?: string;         // 项目数据（JSON字符串）
  projectType?: string;         // 项目类型
}
```

## 前端类型定义

### 文件位置
`types.ts`

### 类型定义

#### LabProjectVO - 项目视图对象
```typescript
export interface LabProjectVO {
  /**
   * 项目Id
   */
  id: number | string;

  /**
   * 项目ID（如：nebula_121389）
   */
  projectId?: string;

  /**
   * 项目名
   */
  projectName: string;

  /**
   * 项目描述
   */
  projectDesc?: string;

  /**
   * 项目数据（JSON字符串）
   */
  projectJson?: string;

  /**
   * 项目类型
   */
  projectType?: string;

  /**
   * 租户编号
   */
  tenantId?: string;

  /**
   * 创建部门
   */
  createDept?: number;

  /**
   * 创建者
   */
  createBy?: number;

  /**
   * 创建时间
   */
  createTime?: string;

  /**
   * 更新者
   */
  updateBy?: number;

  /**
   * 更新时间
   */
  updateTime?: string;
}
```

#### LabProjectForm - 项目表单对象
```typescript
export interface LabProjectForm {
  /**
   * 项目Id（编辑时必填）
   */
  id?: number | string;

  /**
   * 项目ID（如：nebula_121389）
   */
  projectId?: string;

  /**
   * 项目名（必填）
   */
  projectName: string;

  /**
   * 项目描述
   */
  projectDesc?: string;

  /**
   * 项目数据（JSON字符串）
   */
  projectJson?: string;

  /**
   * 项目类型
   */
  projectType?: string;
}
```

#### LabProjectQuery - 项目查询参数
```typescript
export interface LabProjectQuery {
  pageNum?: number;
  pageSize?: number;
  /**
   * 项目ID（如：nebula_121389）
   */
  projectId?: string;
  /**
   * 项目名（模糊查询）
   */
  projectName?: string;

  /**
   * 项目描述
   */
  projectDesc?: string;

  /**
   * 项目类型
   */
  projectType?: string;

  /**
   * 创建者
   */
  createBy?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
```

## 前端服务实现

### 文件位置
`services/labProjectService.ts`

### 服务方法

#### 1. getProjectList - 获取项目列表（分页）
```typescript
getProjectList: (params?: LabProjectQuery) => {
  return request.get<ApiResponse<{ rows: LabProjectVO[]; total: number }>>('/ads/labProject/list', {
    params,
  });
}
```

#### 2. getProjectInfo - 获取项目详情
```typescript
getProjectInfo: (projectId: string | number) => {
  return request.get<ApiResponse<LabProjectVO>>(`/ads/labProject/${projectId}`);
}
```

#### 3. createProject - 创建项目
```typescript
createProject: (data: LabProjectForm) => {
  return request.post<ApiResponse<LabProjectVO>>('/ads/labProject', data);
}
```

#### 4. updateProject - 更新项目
```typescript
updateProject: (data: LabProjectForm) => {
  return request.put<ApiResponse<void>>('/ads/labProject', data);
}
```

#### 5. deleteProject - 删除项目
```typescript
deleteProject: (projectId: string | number | (string | number)[]) => {
  const ids = Array.isArray(projectId) ? projectId.join(',') : projectId;
  return request.delete<ApiResponse<void>>(`/ads/labProject/${ids}`);
}
```

#### 6. exportProjectList - 导出项目列表
```typescript
exportProjectList: (params?: LabProjectQuery) => {
  return request.post<Blob>('/ads/labProject/export', params ?? {}, {
    responseType: 'blob',
  });
}
```

## 使用示例

### 1. 导入服务
```typescript
import { labProjectService } from '../services/labProjectService';
import type { LabProjectVO, LabProjectForm, LabProjectQuery } from '../types';
```

### 2. 获取项目列表
```typescript
// 基础查询
const fetchProjects = async () => {
  try {
    const response = await labProjectService.getProjectList({
      pageNum: 1,
      pageSize: 10,
    });
    
    if (response.code === 200) {
      const { rows, total } = response.data;
      console.log('项目列表:', rows);
      console.log('总数:', total);
    }
  } catch (error) {
    console.error('获取项目列表失败:', error);
  }
};

// 带筛选条件的查询
const searchProjects = async (keyword: string) => {
  const response = await labProjectService.getProjectList({
    pageNum: 1,
    pageSize: 10,
    projectName: keyword,
    createBy: currentUserId,
  });
  return response.data;
};
```

### 3. 获取项目详情
```typescript
const getProjectDetail = async (projectId: number) => {
  try {
    const response = await labProjectService.getProjectInfo(projectId);
    if (response.code === 200) {
      const project = response.data;
      console.log('项目详情:', project);
      return project;
    }
  } catch (error) {
    console.error('获取项目详情失败:', error);
  }
};
```

### 4. 创建项目
```typescript
const createNewProject = async () => {
  const projectData: LabProjectForm = {
    projectId: 'nebula_121389', // 项目ID（可选）
    projectName: '新项目',
    projectDesc: '这是一个新项目',
    projectType: '1', // 1: 营销视频, 2: 数字人视频
    projectJson: JSON.stringify({ /* 项目数据 */ }),
  };

  try {
    const response = await labProjectService.createProject(projectData);
    if (response.code === 200) {
      console.log('项目创建成功:', response.data);
      return response.data;
    }
  } catch (error) {
    console.error('创建项目失败:', error);
  }
};
```

### 5. 更新项目
```typescript
const updateProject = async (projectId: number, updates: Partial<LabProjectForm>) => {
  const projectData: LabProjectForm = {
    id: projectId,
    projectName: updates.projectName || '更新后的项目名',
    projectDesc: updates.projectDesc,
    // ... 其他字段
  };

  try {
    const response = await labProjectService.updateProject(projectData);
    if (response.code === 200) {
      console.log('项目更新成功');
    }
  } catch (error) {
    console.error('更新项目失败:', error);
  }
};
```

### 6. 删除项目
```typescript
// 删除单个项目
const deleteSingleProject = async (projectId: number) => {
  try {
    const response = await labProjectService.deleteProject(projectId);
    if (response.code === 200) {
      console.log('项目删除成功');
    }
  } catch (error) {
    console.error('删除项目失败:', error);
  }
};

// 批量删除项目
const deleteMultipleProjects = async (projectIds: number[]) => {
  try {
    const response = await labProjectService.deleteProject(projectIds);
    if (response.code === 200) {
      console.log('批量删除成功');
    }
  } catch (error) {
    console.error('批量删除失败:', error);
  }
};
```

### 7. 导出项目列表
```typescript
const exportProjects = async (queryParams?: LabProjectQuery) => {
  try {
    const blob = await labProjectService.exportProjectList(queryParams);
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `项目列表_${new Date().getTime()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('导出失败:', error);
  }
};
```

### 8. React组件中使用示例
```typescript
import { useState, useEffect } from 'react';
import { labProjectService } from '../services/labProjectService';
import type { LabProjectVO, LabProjectForm } from '../types';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<LabProjectVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 获取项目列表
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await labProjectService.getProjectList({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
      });
      
      if (response.code === 200) {
        setProjects(response.data.rows);
        setPagination(prev => ({
          ...prev,
          total: response.data.total,
        }));
      }
    } catch (error) {
      console.error('获取项目列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [pagination.current, pagination.pageSize]);

  // 创建项目
  const handleCreate = async (data: LabProjectForm) => {
    try {
      const response = await labProjectService.createProject(data);
      if (response.code === 200) {
        // 刷新列表
        fetchProjects();
      }
    } catch (error) {
      console.error('创建项目失败:', error);
    }
  };

  // 删除项目
  const handleDelete = async (projectId: number) => {
    if (!confirm('确定要删除这个项目吗？')) return;
    
    try {
      const response = await labProjectService.deleteProject(projectId);
      if (response.code === 200) {
        // 刷新列表
        fetchProjects();
      }
    } catch (error) {
      console.error('删除项目失败:', error);
    }
  };

  return (
    <div>
      {/* 项目列表UI */}
    </div>
  );
};
```

## 新旧系统对比

### 旧系统（nebula-ads-vben）
- **位置**: `apps/web-Lab/src/api/system/labProject/`
- **方法命名**: 
  - `labProjectList`
  - `labProjectInfo`
  - `labProjectAdd`
  - `labProjectUpdate`
  - `labProjectRemove`
  - `labProjectExport`

### 新系统（Nebula-Lab-React）
- **位置**: `services/labProjectService.ts`
- **方法命名**:
  - `getProjectList`
  - `getProjectInfo`
  - `createProject`
  - `updateProject`
  - `deleteProject`
  - `exportProjectList`

### 主要差异
1. **命名风格**: 新系统采用更统一的命名规范（get/create/update/delete前缀）
2. **导出方式**: 新系统直接返回 Blob，需要手动处理下载
3. **类型定义**: 新系统类型定义更完整，包含所有数据库字段

## 注意事项

1. **权限控制**: 所有接口都需要相应的权限，确保用户有对应权限才能调用
2. **错误处理**: 建议在所有API调用中添加 try-catch 错误处理
3. **分页参数**: 列表查询建议始终传入 `pageNum` 和 `pageSize`
4. **项目类型**: `projectType` 字段的值：
   - `'1'`: 营销视频
   - `'2'`: 数字人视频
5. **项目数据**: `projectJson` 字段存储的是 JSON 字符串，使用时需要 `JSON.parse()` 和 `JSON.stringify()`
6. **删除操作**: 删除接口支持单个ID或ID数组，会自动处理格式转换

## 相关文件

- **类型定义**: `types.ts` (LabProjectVO, LabProjectForm, LabProjectQuery)
- **服务实现**: `services/labProjectService.ts`
- **请求工具**: `lib/request.tsx`
- **后端接口**: `nebula-ads_end/ruoyi-modules/ruoyi-ads/src/main/java/org/dromara/ads/controller/NebulaLabProjectController.java`

## 更新日志

- **2025-01-XX**: 初始版本，从旧系统迁移到新系统

