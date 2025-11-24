import React, { useEffect } from 'react';
import { Outlet, useSearchParams, useNavigate, useOutletContext } from 'react-router-dom';

const CreateLayout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const context = useOutletContext();

  // 处理旧的 ?tool=xxx 参数跳转 (兼容性)
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
         navigate(map[tool], { replace: true });
       }
    }
  }, [searchParams, navigate]);

  return <Outlet context={context} />;
};

export default CreateLayout;
