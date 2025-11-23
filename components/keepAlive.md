# React 组件缓存功能说明文档

## 📋 概述

本文档说明了在 React 项目中实现的组件缓存功能，该功能类似于 Vue3 的 `keep-alive`，可以在路由切换时保持组件状态，避免数据丢失。

## 🎯 功能特性

- ✅ **组件状态保持**：切换标签页时，组件状态（包括表单数据、滚动位置等）会被保留
- ✅ **自动缓存管理**：根据路由配置自动管理缓存，无需手动干预
- ✅ **标签页联动**：关闭标签页时自动清除对应缓存
- ✅ **灵活配置**：通过路由元数据 `keepAlive` 控制是否缓存
- ✅ **性能优化**：使用 `react-activation` 库实现高效的组件缓存

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

## 📖 使用方法

### 1. 启用缓存

在路由配置中设置 `meta.keepAlive: true`：

```typescript
// router/routes/local.tsx
{
  path: 'chat',
  element: <ChatPage />,
  meta: {
    title: 'Chat',
    keepAlive: true  // 启用缓存
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

### 3. 在组件中使用

组件无需特殊处理，缓存会自动生效。例如：

```typescript
// pages/Chat/index.tsx
const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState([]);
  // ... 其他状态
  
  // 当切换标签页再回来时，messages 状态会被保留
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

## 🔄 工作流程

1. **路由切换**
   - 用户点击标签页或导航链接
   - `CachedOutlet` 检测路由变化
   - 根据 `routeCacheConfig` 判断是否需要缓存

2. **缓存管理**
   - 如果路由配置了 `keepAlive: true`，组件会被 `KeepAlive` 包装
   - 组件状态保存在 `react-activation` 的缓存中
   - `Layout` 组件根据打开的标签页更新缓存列表

3. **标签页关闭**
   - 用户关闭标签页
   - `Layout` 组件从缓存列表中移除对应组件
   - 组件状态被清除

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

### Q1: 为什么某些页面切换后状态丢失？

**A**: 检查路由配置中是否设置了 `keepAlive: true`，以及 `routeCacheConfig` 中是否包含该路径。

### Q2: 如何手动清除缓存？

**A**: 使用 `useCacheStore` 的 `removeCachedComponent` 方法：

```typescript
import { useCacheStore } from '../stores/cacheStore';

const { removeCachedComponent } = useCacheStore();
removeCachedComponent('/chat'); // 清除指定路由的缓存
```

### Q3: 缓存是否会影响性能？

**A**: 适度使用缓存不会影响性能。建议只对需要保持状态的页面启用缓存，避免缓存过多组件。

### Q4: 如何调试缓存问题？

**A**: 可以在浏览器控制台中查看 `useCacheStore` 的状态：

```typescript
import { useCacheStore } from './stores/cacheStore';
const store = useCacheStore.getState();
console.log('Cached components:', Array.from(store.cachedComponents));
```

## 📝 更新日志

### 2024-11-23
- ✅ 初始实现组件缓存功能
- ✅ 集成 `react-activation` 库
- ✅ 实现基于路由的自动缓存管理
- ✅ 添加标签页联动缓存清除功能
- ✅ 更新所有主要页面路由配置

## 🔗 相关资源

- [react-activation 文档](https://github.com/CJY0208/react-activation)
- [React Router v6 文档](https://reactrouter.com/)
- [Zustand 文档](https://zustand-demo.pmnd.rs/)

## 📞 技术支持

如有问题或建议，请联系开发团队。

