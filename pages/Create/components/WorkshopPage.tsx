import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Image, Video, Music, Box, Loader2 } from 'lucide-react';

interface WorkshopPageProps {
  t: {
    title: string;
    description: string;
    allTools: string;
    image: string;
    video: string;
    audio: string;
    others: string;
    tools: {
      [key: string]: {
        title: string;
        description: string;
        emoji: string;
      };
    };
  };
}

interface Tool {
  key: string;
  title: string;
  emoji: string;
  description: string;
  flitType: 'image' | 'video' | 'audio' | 'other';
  route?: string;
}

const WorkshopPage: React.FC<WorkshopPageProps> = ({ t }) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<'all' | 'image' | 'video' | 'audio' | 'other'>('all');

  // 工具数据
  const tools: Tool[] = useMemo(() => [
    {
      key: 'translation',
      title: t.tools?.translation?.title || 'AI换脸',
      emoji: '🧍',
      description: t.tools?.translation?.description || '使用AI技术进行人脸替换',
      flitType: 'video',
      route: '/create?tool=aiFaceSwap',
    },
    {
      key: 'tts',
      title: t.tools?.tts?.title || '文本转语音',
      emoji: '🎤',
      description: t.tools?.tts?.description || '将文本转换为自然语音',
      flitType: 'audio',
      route: '/create?tool=tts',
    },
    {
      key: '3dModel',
      title: t.tools?.glbViewer?.title || '3D模型查看器',
      emoji: '🤖',
      description: t.tools?.glbViewer?.description || '查看和操作3D模型',
      flitType: 'image',
      route: '/create?tool=3dModel',
    },
    {
      key: 'customPrompt',
      title: t.tools?.customPrompt?.title || '自定义提示词',
      emoji: '✍️',
      description: t.tools?.customPrompt?.description || '使用自定义提示词生成图像',
      flitType: 'image',
      route: '/create?tool=useTool',
    },
    {
      key: 'imageTranslation',
      title: t.tools?.imageTranslation?.title || '图像翻译',
      emoji: '🧍',
      description: t.tools?.imageTranslation?.description || '将图像转换为不同风格',
      flitType: 'image',
      route: '/create?tool=aIFacSwapping',
    },
    {
      key: 'aiTemplate',
      title: t.tools?.aiTemplate?.title || 'AI模板',
      emoji: '🖼️',
      description: t.tools?.aiTemplate?.description || '使用AI模板快速生成内容',
      flitType: 'image',
      route: '/create?tool=templateUi',
    },
  ], [t.tools]);

  // 分类数据
  const categories = [
    { id: 'all' as const, name: t.allTools, icon: Box },
    { id: 'image' as const, name: t.image, icon: Image },
    { id: 'video' as const, name: t.video, icon: Video },
    { id: 'audio' as const, name: t.audio, icon: Music },
    { id: 'other' as const, name: t.others, icon: Sparkles },
  ];

  // 筛选工具
  const filteredTools = useMemo(() => {
    if (activeCategory === 'all') {
      return tools;
    }
    return tools.filter(tool => tool.flitType === activeCategory);
  }, [tools, activeCategory]);

  // 打开工具
  const openTool = (tool: Tool) => {
    if (tool.route) {
      navigate(tool.route);
    } else {
      // 默认跳转到通用工具页面
      navigate('/create?tool=useTool', { state: { toolKey: tool.key } });
    }
  };

  return (
    <div className="w-full h-full bg-background overflow-hidden flex flex-col">
      {/* 页面头部 */}
      <div className="text-center py-8 px-4 flex-shrink-0">
        <p className="text-4xl font-semibold mb-2">
          <span className="bg-gradient-to-r from-orange-400 via-pink-500 via-blue-500 to-blue-400 bg-clip-text text-transparent">
            {t.description}
          </span>
          <span className="ml-2">✨</span>
        </p>
      </div>

      {/* 分类标签 */}
      <div className="flex flex-wrap justify-center gap-2 px-4 mb-4 flex-shrink-0">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                activeCategory === category.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Icon size={16} />
              {category.name}
            </button>
          );
        })}
      </div>

      {/* 工具卡片网格 */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {filteredTools.map((tool) => (
            <div
              key={tool.key}
              onClick={() => openTool(tool)}
              className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 h-[240px] flex flex-col items-center justify-center"
            >
              {/* 工具图标 */}
              <div className="w-[200px] h-[150px] flex items-center justify-center text-6xl mb-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                {tool.emoji}
              </div>

              {/* 工具信息 */}
              <div className="text-center w-full">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">
                  {tool.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 px-2">
                  {tool.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <Box size={48} className="mb-4 opacity-50" />
            <p>暂无工具</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopPage;

