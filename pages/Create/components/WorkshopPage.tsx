import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Image, Video, Music, Box } from 'lucide-react';
import { getToolsData, Tool } from '../data';
import { translations } from '../../../translations';

interface WorkshopPageProps {
  t: any;
}

const WorkshopPage: React.FC<WorkshopPageProps> = ({ t }) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<'all' | 'image' | 'video' | 'audio' | 'other'>('all');

  // 根据翻译对象推断语言
  const lang = useMemo(() => {
    // 检查是否是中文（通过检查特定的翻译键）
    if (t?.description === '我能帮你创造什么?' || t?.allTools === '全部工具') {
      return 'zh';
    }
    // 检查是否是英文
    if (t?.description === 'What can I help you create?' || t?.allTools === 'All Tools') {
      return 'en';
    }
    // 检查是否是印尼语
    if (t?.description?.includes('Apa yang bisa saya bantu') || t?.allTools === 'Semua Alat') {
      return 'id';
    }
    // 默认返回中文
    return 'zh';
  }, [t]);

  // 使用翻译后的工具数据
  const tools: Tool[] = useMemo(() => getToolsData(lang), [lang]);

  // 分类数据
  const categories = [
    { id: 'all' as const, name: t.allTools || '全部工具', icon: Box },
    { id: 'image' as const, name: t.image || '图像', icon: Image },
    { id: 'video' as const, name: t.video || '视频', icon: Video },
    { id: 'audio' as const, name: t.audio || '音频', icon: Music },
    { id: 'other' as const, name: t.others || '其他', icon: Sparkles },
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
      // 如果路由是绝对路径（以 /create/ 开头），直接导航
      // 否则使用 query 参数方式（兼容旧逻辑）
      if (tool.route.startsWith('/create/')) {
        // 如果工具没有独立路由（route 是 /create/useTool），在 URL 中添加 tool 参数
        const route = tool.route === '/create/useTool' 
          ? `/create/useTool?tool=${tool.key}`
          : tool.route;
        navigate(route, { state: { toolKey: tool.key }, replace: false });
      } else {
        navigate(tool.route, { state: { toolKey: tool.key } });
      }
    } else {
      // 默认跳转到通用工具页面，在 URL 中添加 tool 参数
      navigate(`/create/useTool?tool=${tool.key}`, { state: { toolKey: tool.key }, replace: false });
    }
  };

  return (
    <div className="w-full h-full bg-background overflow-hidden flex flex-col">
      {/* 页面头部 */}
      <div className="text-center py-8 px-4 flex-shrink-0">
        <p className="text-4xl font-semibold mb-2">
          <span className="bg-gradient-to-r from-orange-400 via-pink-500 via-blue-500 to-blue-400 bg-clip-text text-transparent">
            {t.description || '我能帮你创造什么?'}
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
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 px-2" title={tool.description}>
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
