import React, { useEffect } from 'react';
import { Outlet, useSearchParams, useNavigate } from 'react-router-dom';
import { useAppOutletContext } from '../../router/context';

const CreateLayout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // 优先使用 useAppOutletContext 以支持 KeepAlive 上下文
  // 移除所有人工延迟和加载状态，确保组件同步渲染，通过空值检查保证鲁棒性
  const context = useAppOutletContext();

  // 处理旧的 ?tool=xxx 参数跳转 (兼容性)
  // 这部分逻辑主要用于处理外部链接或旧版收藏夹进入的情况
  useEffect(() => {
    const tool = searchParams.get('tool');
    if (tool && tool !== 'home') {
       const map: Record<string, string> = {
         'textToImage': 'textToImage',
         'viralVideo': 'viralVideo',
         'imgToVideo': 'imgToVideo',
         'digitalHuman': 'digitalHuman',
         'styleTransfer': 'styleTransfer',
         'voiceClone': 'voiceClone',
         '3dModel': '3dModel',
         'glbViewer': 'glbViewer',
         'aiFaceSwap': 'aiFaceSwap',
         'faceSwap': 'aiFaceSwap',
         'tts': 'tts',
         'ttsTool': 'tts',
         'useTool': 'useTool',
         'aIFacSwapping': 'imageTranslation',
         'imageTranslation': 'imageTranslation',
         'templateUi': 'templateUi',
         'aiTemplate': 'templateUi',
         'workshop': 'workshop'
       };
       
       if (map[tool]) {
         // 使用 replace 避免历史记录混乱
         // 注意：这里的路径是相对于 /create 的
         // 使用 setTimeout 确保在下一个事件循环中执行，避免与当前渲染冲突
         const timer = setTimeout(() => {
           navigate(map[tool], { replace: true });
         }, 0);
         return () => clearTimeout(timer);
       }
    }
  }, [searchParams, navigate]);

  // 即使 context 可能为空，也直接渲染 Outlet
  // 子组件需要负责处理 context 可能为空的情况（例如使用可选链或默认值）
  // 这样可以避免白屏，确保 KeepAlive 和路由切换尽可能快地响应
  // 添加 h-full w-full 确保容器占满，便于内部组件处理滚动
  return (
    <div className="w-full h-full flex flex-col">
       <Outlet context={context} />
    </div>
  );
};

export default CreateLayout;
