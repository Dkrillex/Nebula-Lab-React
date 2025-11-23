# React 组件缓存功能说明文档

## 📋 概述

本文档说明了在 React 项目中尝试实现的组件缓存功能，该功能类似于 Vue3 的 `keep-alive`，可以在路由切换时保持组件状态，避免数据丢失。

**⚠️ 当前状态：功能暂时禁用**

由于 `react-activation` 的 `KeepAlive` 组件在包裹页面组件时会影响 React Router 的 context 传递机制，导致 `useOutletContext()` 返回 null，因此缓存功能暂时禁用。后续需要寻找其他解决方案。

## 🎯 功能特性（计划中）

- ⏸️ **组件状态保持**：切换标签页时，组件状态（包括表单数据、滚动位置等）会被保留（暂时未实现）
- ⏸️ **自动缓存管理**：根据路由配置自动管理缓存，无需手动干预（暂时未实现）
- ⏸️ **标签页联动**：关闭标签页时自动清除对应缓存（暂时未实现）
- ⏸️ **灵活配置**：通过路由元数据 `keepAlive` 控制是否缓存（配置已添加，但功能未启用）
- ⏸️ **性能优化**：使用 `react-activation` 库实现高效的组件缓存（暂时未实现）

## 📁 文件结构

```
Nebula-Lab-React/
├── stores/
│   └── cacheStore.ts              # 缓存状态管理 Store
├── components/
│   ├── KeepAlive.tsx              # KeepAlive 包装组件和 Provider
│   ├── CachedOutlet.tsx           # 支持缓存的 Outlet 组件
│   ├── Layout.tsx                 # 主布局组件（已更新）
│   └── DashboardLayout.tsx       # 仪表板布局组件（已更新）
├── router/
│   ├── AuthGuard.tsx              # 路由守卫（已添加 keepAlive 类型）
│   ├── routes/
│   │   ├── core.tsx               # 核心路由配置（已更新）
│   │   └── local.tsx               # 本地路由配置（已更新）
│   └── index.tsx                  # 路由入口
└── App.tsx                        # 应用入口（已添加 KeepAliveProvider）
```

## 🔧 核心实现

### 1. 缓存 Store (`stores/cacheStore.ts`)

使用 Zustand 管理缓存状态：

```typescript
interface CacheState {
  cachedComponents: Set<string>;           // 需要缓存的组件名称集合
  excludeCachedComponents: Set<string>;    // 需要排除缓存的组件名称集合
  updateCachedComponents: (components: string[]) => void;
  addCachedComponent: (componentName: string) => void;
  removeCachedComponent: (componentName: string) => void;
  // ... 其他方法
}
```

### 2. KeepAlive 组件 (`components/KeepAlive.tsx`)

基于 `react-activation` 实现的缓存包装组件：

- **KeepAliveWrapper**: 根据配置决定是否缓存子组件
- **KeepAliveProvider**: 提供 `AliveScope`，需要在应用根组件中使用

### 3. CachedOutlet 组件 (`components/CachedOutlet.tsx`)

替换标准 `Outlet` 的缓存版本：

- 根据路由路径自动判断是否需要缓存
- 支持查询参数（如 `/create?tool=xxx`）
- 自动更新缓存列表

### 4. 路由配置

在路由元数据中添加 `keepAlive` 属性：

```typescript
{
  path: 'chat',
  element: <ChatPage />,
  meta: {
    title: 'Chat',
    icon: 'message',
    requiresAuth: true,
    keepAlive: true  // 启用缓存
  }
}
```

## 📖 使用方法（暂时禁用）

**注意**：由于当前缓存功能暂时禁用，以下使用方法仅供参考，实际功能未启用。

### 1. 启用缓存（计划中）

在路由配置中设置 `meta.keepAlive: true`（当前已配置，但功能未启用）：

```typescript
// router/routes/local.tsx
{
  path: 'chat',
  element: <ChatPage />,
  meta: {
    title: 'Chat',
    keepAlive: true  // 已配置，但功能暂时禁用
  }
}
```

### 2. 禁用缓存

设置 `meta.keepAlive: false` 或省略该属性：

```typescript
{
  path: 'privacy',
  element: <PrivacyPage />,
  meta: {
    title: 'Privacy',
    keepAlive: false  // 禁用缓存
  }
}
```

### 3. 在组件中使用（计划中）

组件无需特殊处理，缓存会自动生效。例如：

```typescript
// pages/Chat/index.tsx
const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState([]);
  // ... 其他状态
  
  // 当切换标签页再回来时，messages 状态会被保留（当前未实现）
  return (
    <div>
      {/* 组件内容 */}
    </div>
  );
};
```

## ⚙️ 配置说明

### 路由缓存配置映射

在 `CachedOutlet.tsx` 中定义了路由缓存配置：

```typescript
const routeCacheConfig: Record<string, boolean> = {
  '/': false,              // 首页不缓存
  '/privacy': false,       // 隐私页不缓存
  '/create': true,         // 创建页缓存
  '/assets': true,         // 资源页缓存
  '/chat': true,           // 聊天页缓存
  '/keys': true,           // 密钥页缓存
  '/models': true,         // 模型页缓存
  '/expenses': true,       // 费用页缓存
  '/pricing': true,        // 定价页缓存
  '/price-list': true,     // 价格列表页缓存
  '/profile': true,        // 个人资料页缓存
};
```

### 缓存 Key 生成规则

- 基础路径：`/chat` → 缓存 key: `/chat`
- 带查询参数：`/create?tool=image` → 缓存 key: `/create?tool=image`
- 首页：`/` → 缓存 key: `/`

## 🔄 工作流程（计划中）

**注意**：以下工作流程是计划中的实现，当前功能暂时禁用。

1. **路由切换**（计划中）
   - 用户点击标签页或导航链接
   - `CachedOutlet` 检测路由变化
   - 根据 `routeCacheConfig` 判断是否需要缓存

2. **缓存管理**（计划中）
   - 如果路由配置了 `keepAlive: true`，组件会被 `KeepAlive` 包装
   - 组件状态保存在 `react-activation` 的缓存中
   - `Layout` 组件根据打开的标签页更新缓存列表

3. **标签页关闭**（计划中）
   - 用户关闭标签页
   - `Layout` 组件从缓存列表中移除对应组件
   - 组件状态被清除

## 🔧 当前实现状态

### 已完成的组件
- ✅ `stores/cacheStore.ts` - 缓存状态管理 Store（已实现，但未使用）
- ✅ `components/KeepAlive.tsx` - KeepAlive 包装组件和 Provider（已实现，但未使用）
- ✅ `components/KeepAliveWrapper.tsx` - KeepAlive 包装组件（已实现，但暂时禁用）
- ✅ `components/CachedOutlet.tsx` - 支持缓存的 Outlet 组件（已实现，但缓存功能禁用）
- ✅ `App.tsx` - 已添加 `KeepAliveProvider`（已添加，但功能未启用）

### 已配置但未启用的功能
- ⏸️ 路由配置中的 `keepAlive: true` 已添加，但 `KeepAliveWrapper` 已移除
- ⏸️ `Layout` 组件中的缓存管理逻辑已添加，但未启用
- ⏸️ `DashboardLayout` 中的 context 传递已优化，但缓存功能未启用

## 🎨 与 Vue3 实现的对比

| 特性 | Vue3 (keep-alive) | React (本实现) |
|------|------------------|----------------|
| 缓存机制 | `<KeepAlive>` 组件 | `react-activation` 库 |
| 配置方式 | `meta.keepAlive` | `meta.keepAlive` |
| 状态管理 | Pinia Store | Zustand Store |
| 缓存列表 | `cachedTabs` | `cachedComponents` |
| 标签页联动 | ✅ 支持 | ✅ 支持 |

## ⚠️ 注意事项

### 1. 内存管理

- 缓存的组件会占用内存，建议只对需要保持状态的页面启用缓存
- 关闭标签页时会自动清除缓存，无需手动管理

### 2. 组件生命周期

- 缓存的组件不会触发 `useEffect` 的清理函数（除非组件被卸载）
- 如果需要响应路由变化，使用 `useLocation` 或 `useParams` 监听

### 3. 状态同步

- 如果组件依赖外部状态（如全局 Store），状态变化会自动反映到缓存的组件中
- 组件内部状态会被完整保留

### 4. 滚动位置

- `KeepAlive` 组件配置了 `saveScrollPosition="screen"`，会自动保存滚动位置
- 切换回来时会自动恢复滚动位置

## 🐛 常见问题

### Q1: 为什么缓存功能没有生效？

**A**: 当前缓存功能暂时禁用。原因是 `react-activation` 的 `KeepAlive` 会影响 React Router 的 context 传递，导致 `useOutletContext()` 返回 null。所有 `KeepAliveWrapper` 已暂时移除。

### Q2: 页面切换后状态丢失怎么办？

**A**: 由于缓存功能暂时禁用，页面切换时状态会丢失。这是预期行为。如果需要保持状态，可以考虑：
- 使用全局状态管理（如 Zustand）保存关键状态
- 使用 `sessionStorage` 或 `localStorage` 持久化数据
- 等待缓存功能重新实现

### Q3: 什么时候会重新启用缓存功能？

**A**: 需要找到解决 context 传递问题的方案后才会重新启用。可能的方案包括：
- 使用其他缓存库
- 自定义缓存实现
- 等待 `react-activation` 更新
- 修改 `react-activation` 源码

### Q4: 如何调试缓存相关问题？

**A**: 当前缓存功能已禁用，无需调试。如果后续重新启用，可以在浏览器控制台中查看 `useCacheStore` 的状态：

```typescript
import { useCacheStore } from './stores/cacheStore';
const store = useCacheStore.getState();
console.log('Cached components:', Array.from(store.cachedComponents));
```

## ⚠️ 已知问题

### 问题：KeepAlive 影响 Context 传递

**现象**：
- 当使用 `KeepAliveWrapper` 包裹页面组件时，`useOutletContext()` 返回 null
- 导致页面组件无法获取到 context，报错：`Cannot destructure property 't' of 'useAppOutletContext(...)' as it is null`

**原因分析**：
- `react-activation` 的 `KeepAlive` 在缓存组件时，可能会创建新的 React 上下文
- 这导致 React Router 的 `useOutletContext` 无法正确获取到通过 `Outlet` 传递的 context
- Context 传递机制被 `KeepAlive` 的缓存机制干扰

**尝试的解决方案**：
1. ✅ 在路由配置中包裹 `KeepAlive` - 失败，影响 context 传递
2. ✅ 在 `CachedOutlet` 中使用 `useOutlet` 获取组件 - 失败，仍然影响 context
3. ✅ 在 `useAppOutletContext` 中添加默认值处理 - 部分缓解，但根本问题未解决

**当前状态**：
- 所有 `KeepAliveWrapper` 已暂时移除
- 路由配置中的 `keepAlive: true` 保留，但功能未启用
- 页面可以正常打开和使用，但切换标签页时数据会丢失

## 🔄 后续解决方案建议

### 方案 1：使用其他缓存库
- 考虑使用 `react-router-cache-route` 或其他专门为 React Router 设计的缓存库
- 优点：可能更好地兼容 React Router
- 缺点：需要重新实现

### 方案 2：自定义缓存实现
- 在组件内部使用 `useMemo` 或全局状态管理保存关键状态
- 使用 `sessionStorage` 或 `localStorage` 持久化数据
- 优点：完全可控，不影响 context 传递
- 缺点：需要手动管理，实现复杂度较高

### 方案 3：等待 react-activation 更新
- 关注 `react-activation` 库的更新，看是否有修复 context 传递问题的版本
- 或者向库的维护者提交 issue

### 方案 4：修改 react-activation 源码
- Fork `react-activation` 库，修改源码以支持 React Router 的 context 传递
- 优点：可以完全控制实现
- 缺点：需要维护 fork 版本

## 📝 更新日志

### 2024-11-23
- ✅ 初始尝试实现组件缓存功能
- ✅ 集成 `react-activation` 库
- ✅ 创建缓存 Store (`cacheStore.ts`)
- ✅ 创建 `KeepAliveWrapper` 组件
- ✅ 创建 `CachedOutlet` 组件
- ✅ 更新路由配置，添加 `keepAlive` 元数据
- ⚠️ 发现 `KeepAlive` 影响 context 传递的问题
- ⏸️ 暂时禁用缓存功能，等待后续解决方案

## 🔗 相关资源

- [react-activation 文档](https://github.com/CJY0208/react-activation)
- [React Router v6 文档](https://reactrouter.com/)
- [Zustand 文档](https://zustand-demo.pmnd.rs/)

## 📞 技术支持

如有问题或建议，请联系开发团队。

