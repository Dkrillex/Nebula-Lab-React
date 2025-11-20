# 迁移进度对比：万物迁移 (Product Any Shoot)

本文档对比了 Vue3 版本 (`nebula-ads-vben`) 和 React 版本 (`Nebula-Lab-React`) 中“万物迁移”功能的实现状态。

## 1. 总体结构对比

| 功能模块 | Vue3 组件 (`web-Lab`) | React 组件 (`Nebula-Lab-React`) | 状态 |
| :--- | :--- | :--- | :--- |
| **主页面** | `views/tv/productAnyShoot/index.vue` | `pages/Create/components/StyleTransferPage.tsx` | 🚧 进行中 |
| **服装模式** | `components/clothingV2.vue` | 集成在主页面中 | ✅ 基本完成 |
| **商品背景** | `components/productBackground.vue` | 集成在主页面中 (部分) | ⚠️ 缺少 Canvas 交互 |
| **模板选择** | `components/templateSelect.vue` | ❌ 未实现 (仅有占位符) | ❌ 缺失 |
| **画板工具** | `components/productCanvas.vue` | ❌ 未实现 (无需迁移) | 🚫 忽略 |
| **素材上传** | `components/ossUpload.vue` | 使用 `uploadService` | ✅ 已实现 |

## 2. 功能细节差异

### 2.1 标准模式 (Standard Mode) / 商品背景

| 功能点 | Vue3 实现 | React 实现 | 差异说明 |
| :--- | :--- | :--- | :--- |
| **模板选择** | 独立的模态框组件，支持分类、分页、按样式筛选 | 仅有一个按钮和状态占位 | **React 版本缺失模板选择弹窗** |
| **产品放置** | 支持在模特图上拖拽、缩放、旋转产品图片 (Canvas) | 仅支持上传图片，无法调整位置 | **React 版本缺少 Canvas 交互逻辑** |
| **背景去除** | 支持自动去除产品背景 (`removeBackgroundSubmit`) | 未明确实现显式的背景去除流程 | React 版本可能在后端处理，但前端无交互反馈 |
| **多图生成** | 支持生成数量配置 (1-4) | 支持生成数量配置 | 一致 |

### 2.2 服装模式 (Clothing Mode)

| 功能点 | Vue3 实现 | React 实现 | 差异说明 |
| :--- | :--- | :--- | :--- |
| **服装类型** | 上衣 / 下衣 / 全身 (Radio Group) | 上衣 / 下衣 / 全身 | 一致 |
| **Logo 设置** | 代码存在但被隐藏 (`v-if="0"`) | 未实现 | **均不可用 (无需迁移)** |
| **上传组件** | 支持拖拽、预览、删除 | 支持拖拽、预览、删除 | 一致 |
| **高精度模式** | 代码中存在切换逻辑 | 未实现 | React 版本目前仅支持标准/快速模式 |

### 2.3 创意模式 (Creative Mode)

| 功能点 | Vue3 实现 | React 实现 | 差异说明 |
| :--- | :--- | :--- | :--- |
| **提示词** | 支持输入、计数、润色 | 支持输入、计数、润色 | 一致 |
| **参考图** | 支持上传参考图 | 支持上传参考图 | 一致 |

## 3. 迁移计划 (接下来的步骤)

1.  **实现模板选择模态框 (`TemplateSelectModal`)**:
    *   迁移 `templateSelect.vue` 的逻辑。
    *   实现分类获取、模板列表获取、分页加载。
    *   集成到 `StyleTransferPage.tsx`。

2.  **实现产品交互画布 (`ProductCanvas`)**:
    *   迁移 `productBackground.vue` 中的 Canvas 逻辑。
    *   实现图片的加载、绘制、拖拽、缩放、旋转。
    *   替换 `StyleTransferPage.tsx` 中简单的图片预览。

3.  **完善 API 集成**:
    *   确保 React 端的 `styleTransferService` 涵盖所有必要的 API (如 `templateList`, `templateCategoryList`)。

4.  **样式调整**:
    *   对齐 Vue 版本的 UI 细节 (如加载动画、结果展示布局)。

