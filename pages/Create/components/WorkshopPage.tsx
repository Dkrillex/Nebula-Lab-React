import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Image, Video, Music, Box, Loader2 } from 'lucide-react';

interface WorkshopPageProps {
  t: any; // Using any to allow flexibility as we are expanding the list
}

interface Tool {
  key: string;
  title: string;
  emoji: string;
  description: string;
  flitType: 'image' | 'video' | 'audio' | 'other';
  route?: string;
}

// Tool data extracted from vben project
const TOOLS_DATA: Tool[] = [
  {
    key: 'translation',
    title: 'AI视频换脸',
    emoji: '🧍',
    description: '将您的视频中的人脸替换成图片的人脸',
    flitType: 'video',
    route: '/create?tool=aiFaceSwap',
  },
  {
    key: 'tts',
    title: '文本转语音',
    emoji: '🎤',
    description: '将文本转换为自然流畅的语音，支持多种音色和语言',
    flitType: 'audio',
    route: '/create?tool=tts',
  },
  {
    key: '3dModel',
    title: '3D模型',
    emoji: '🤖',
    description: '将您的照片变成一份3D效果图。',
    flitType: 'image',
    route: '/create?tool=3dModel',
  },
  {
    key: 'customPrompt',
    title: '自定义提示',
    emoji: '✍️',
    description: '描述你能想象到的任何变化。最多可上传两张图片作为参考。',
    flitType: 'image',
    route: '/create?tool=useTool',
  },
  {
    key: 'imageTranslation',
    title: 'AI图片换脸',
    emoji: '🧍',
    description: '将您的主图片人脸替换成参考图片的人脸',
    flitType: 'image',
    route: '/create?tool=aIFacSwapping',
  },
  {
    key: 'aiTemplate',
    title: '创意生图',
    emoji: '🖼️',
    description: '根据选中AI模板生成对应内容',
    flitType: 'image',
    route: '/create?tool=templateUi',
  },
  {
    key: 'figurine',
    title: '3D手办',
    emoji: '🧍',
    description: '将您的照片变成一个可收藏的3D角色手办，并配有包装。',
    flitType: 'image',
  },
  {
    key: 'funko',
    title: 'Funko Pop公仔',
    emoji: '📦',
    description: '将您的主题重塑为一个可爱的Funko Pop！乙烯基公仔，放在盒子里。',
    flitType: 'image',
  },
  {
    key: 'lego',
    title: '乐高小人仔',
    emoji: '🧱',
    description: '构建一个乐高小人仔版本的您的主题，准备好玩耍。',
    flitType: 'image',
  },
  {
    key: 'crochet',
    title: '钩针娃娃',
    emoji: '🧶',
    description: '将您的图像变成一个柔软的手工钩针娃娃。',
    flitType: 'image',
  },
  {
    key: 'cosplay',
    title: '动漫转Cosplay',
    emoji: '🎭',
    description: '将动漫角色变为一张逼真的Cosplay照片。',
    flitType: 'image',
  },
  {
    key: 'plushie',
    title: '可爱毛绒玩具',
    emoji: '🧸',
    description: '将您的主题转换成一个可爱的、柔软的毛绒玩具。',
    flitType: 'image',
  },
  {
    key: 'keychain',
    title: '亚克力钥匙扣',
    emoji: '🔑',
    description: '创建一个您的主题的可爱亚克力钥匙扣，非常适合挂在包上。',
    flitType: 'image',
  },
  {
    key: 'hdEnhance',
    title: '高清增强',
    emoji: '🔍',
    description: '放大您的图像，增加清晰度、细节，以获得高分辨率外观。',
    flitType: 'image',
  },
  {
    key: 'pose',
    title: '姿势参考',
    emoji: '💃',
    description: '将一张图像中的姿势应用到另一张图像中的角色上。',
    flitType: 'image',
  },
  {
    key: 'photorealistic',
    title: '转为照片级真实',
    emoji: '🪄',
    description: '将绘画或插图转换为惊人逼真的照片。',
    flitType: 'image',
  },
  {
    key: 'fashion',
    title: '时尚杂志',
    emoji: '📸',
    description: '为您的照片赋予高级时尚、编辑风格的外观，堪比杂志封面。',
    flitType: 'image',
  },
  {
    key: 'hyperrealistic',
    title: '超写实',
    emoji: '✨',
    description: '应用一种粗粝、直闪的摄影风格，打造酷炫的超写实氛围。',
    flitType: 'image',
  },
  {
    key: 'architecture',
    title: '建筑模型',
    emoji: '🏗️',
    description: '将建筑物转变为精细的微缩建筑模型。',
    flitType: 'image',
  },
  {
    key: 'productRender',
    title: '产品渲染',
    emoji: '💡',
    description: '将产品草图变成专业的、照片级的3D渲染图。',
    flitType: 'image',
  },
  {
    key: 'sodaCan',
    title: '汽水罐设计',
    emoji: '🥤',
    description: '将您的图像包装到汽水罐上，并将其放置在精美的产品照片中。',
    flitType: 'image',
  },
  {
    key: 'industrialDesign',
    title: '工业设计渲染',
    emoji: '🛋️',
    description: '将工业设计草图渲染成在博物馆环境中展示的真实产品。',
    flitType: 'image',
  },
  {
    key: 'iphoneWallpaper',
    title: 'iPhone壁纸效果',
    emoji: '📱',
    description: '将您的图片即时转换为时尚的iPhone锁屏界面。',
    flitType: 'image',
  },
  {
    key: 'colorPalette',
    title: '色板换色',
    emoji: '🎨',
    description: '将图像转换为线稿，然后使用第二张图像作为调色板为其上色。',
    flitType: 'image',
  },
  {
    key: 'videoGeneration',
    title: '视频生成',
    emoji: '🎬',
    description: '通过文本提示和可选图像创建短视频。',
    flitType: 'video',
  },
  {
    key: 'isolate',
    title: '分离并增强',
    emoji: '🎯',
    description: '剪出蒙版中的主体，并创建一个干净、高清的肖像。',
    flitType: 'image',
  },
  {
    key: 'screen3d',
    title: '3D屏幕效果',
    emoji: '📺',
    description: '使您照片中屏幕上的内容呈现出裸眼3D效果。',
    flitType: 'image',
  },
  {
    key: 'makeup',
    title: '妆容分析',
    emoji: '💄',
    description: '分析肖像中的妆容，并用红笔标记提出改进建议。',
    flitType: 'image',
  },
  {
    key: 'background',
    title: '更换背景',
    emoji: '🪩',
    description: '将现有背景更换为酷炫的复古Y2K美学风格。',
    flitType: 'image',
  },
  {
    key: 'addIllustration',
    title: '添加插画',
    emoji: '🧑‍🎨',
    description: '在您的真实世界照片中添加迷人的手绘角色。',
    flitType: 'image',
  },
  {
    key: 'pixelArt',
    title: '像素艺术',
    emoji: '👾',
    description: '将您的图像转换为复古的8位像素艺术。',
    flitType: 'image',
  },
  {
    key: 'watercolor',
    title: '水彩画',
    emoji: '🖌️',
    description: '将您的图像转换为柔和、充满活力的水彩画。',
    flitType: 'image',
  },
  {
    key: 'popArt',
    title: '波普艺术',
    emoji: '🎨',
    description: '以安迪·沃霍尔的大胆风格重新想象您的图像。',
    flitType: 'image',
  },
  {
    key: 'comicBook',
    title: '漫画书',
    emoji: '💥',
    description: '将您的照片变成一个经典的漫画书面板。',
    flitType: 'image',
  },
  {
    key: 'claymation',
    title: '黏土动画',
    emoji: '🗿',
    description: '将您的图像重现为一个迷人的定格黏土场景。',
    flitType: 'image',
  },
  {
    key: 'ukiyoE',
    title: '浮世绘',
    emoji: '🌊',
    description: '将您的图像重绘为传统的日本木版画。',
    flitType: 'image',
  },
  {
    key: 'stainedGlass',
    title: '彩色玻璃',
    emoji: '🪟',
    description: '将您的图像转换为一个充满活力的彩色玻璃窗。',
    flitType: 'image',
  },
  {
    key: 'origami',
    title: '折纸',
    emoji: '🦢',
    description: '用折纸风格重建您的主题。',
    flitType: 'image',
  },
  {
    key: 'neonGlow',
    title: '霓虹灯光',
    emoji: '💡',
    description: '用明亮、发光的霓虹灯勾勒您的主题。',
    flitType: 'image',
  },
  {
    key: 'doodleArt',
    title: '涂鸦艺术',
    emoji: '✏️',
    description: '在您的图像上覆盖好玩的手绘涂鸦。',
    flitType: 'image',
  },
  {
    key: 'vintagePhoto',
    title: '复古照片',
    emoji: '📜',
    description: '为您的图像赋予一种陈旧的、深褐色的复古外观。',
    flitType: 'image',
  },
  {
    key: 'blueprintSketch',
    title: '蓝图',
    emoji: '📐',
    description: '将您的图像转换为技术蓝图图纸。',
    flitType: 'image',
  },
  {
    key: 'glitchArt',
    title: '故障艺术',
    emoji: '📉',
    description: '应用数字故障效果，包括数据融合和像素排序。',
    flitType: 'image',
  },
  {
    key: 'doubleExposure',
    title: '双重曝光',
    emoji: '🏞️',
    description: '在双重曝光中将您的图像与自然场景融合。',
    flitType: 'image',
  },
  {
    key: 'hologram',
    title: '全息图',
    emoji: '🌐',
    description: '将您的主题投影为一个未来主义的、发光的蓝色全息图。',
    flitType: 'image',
  },
  {
    key: 'lowPoly',
    title: '低多边形',
    emoji: '🔺',
    description: '使用低多边形几何网格重建您的图像。',
    flitType: 'image',
  },
  {
    key: 'charcoalSketch',
    title: '炭笔素描',
    emoji: '✍🏽',
    description: '将您的图像重绘为一幅戏剧性的、高对比度的炭笔素描。',
    flitType: 'image',
  },
  {
    key: 'impressionism',
    title: '印象派',
    emoji: '👨‍🎨',
    description: '以印象派杰作的风格重绘您的图像。',
    flitType: 'image',
  },
  {
    key: 'cubism',
    title: '立体主义',
    emoji: '🧊',
    description: '以抽象、几何的立体主义风格解构您的主题。',
    flitType: 'image',
  },
  {
    key: 'steampunk',
    title: '蒸汽朋克',
    emoji: '⚙️',
    description: '用齿轮、黄铜和维多利亚时代的技术重新想象您的主题。',
    flitType: 'image',
  },
  {
    key: 'fantasyArt',
    title: '奇幻艺术',
    emoji: '🐉',
    description: '将您的图像转变为一幅史诗般的奇幻风格绘画。',
    flitType: 'image',
  },
  {
    key: 'graffiti',
    title: '涂鸦',
    emoji: '🎨',
    description: '将您的图像喷绘成砖墙上充满活力的涂鸦。',
    flitType: 'image',
  },
  {
    key: 'minimalistLineArt',
    title: '极简线稿',
    emoji: '〰️',
    description: '将您的图像简化为一条连续的线稿。',
    flitType: 'image',
  },
  {
    key: 'storybook',
    title: '故事书',
    emoji: '📖',
    description: '以异想天开的儿童故事书风格重绘您的图像。',
    flitType: 'image',
  },
  {
    key: 'thermal',
    title: '热成像',
    emoji: '🌡️',
    description: '应用带有热图调色板的热成像效果。',
    flitType: 'image',
  },
  {
    key: 'risograph',
    title: 'Risograph',
    emoji: '📠',
    description: '模拟粗糙、色彩有限的Risograph印刷效果。',
    flitType: 'image',
  },
  {
    key: 'crossStitch',
    title: '十字绣',
    emoji: '🧵',
    description: '将您的图像转换为手工制作的十字绣图案。',
    flitType: 'image',
  },
  {
    key: 'tattoo',
    title: '纹身艺术',
    emoji: '🖋️',
    description: '将您的主题重新设计为经典的美式传统纹身。',
    flitType: 'image',
  },
  {
    key: 'psychedelic',
    title: '迷幻风格',
    emoji: '🌀',
    description: '应用20世纪60年代充满活力、旋转的迷幻艺术风格。',
    flitType: 'image',
  },
  {
    key: 'gothic',
    title: '哥特式',
    emoji: '🏰',
    description: '用黑暗的哥特艺术风格重新想象您的场景。',
    flitType: 'image',
  },
  {
    key: 'tribal',
    title: '部落艺术',
    emoji: '🗿',
    description: '使用传统的部落图案重绘您的主题。',
    flitType: 'image',
  },
  {
    key: 'dotPainting',
    title: '点画',
    emoji: '🎨',
    description: '使用原住民点画技术重新创作您的图像。',
    flitType: 'image',
  },
  {
    key: 'chalk',
    title: '粉笔画',
    emoji: '🖍️',
    description: '将您的图像画成人行道上色彩缤纷的粉笔画。',
    flitType: 'image',
  },
  {
    key: 'sandArt',
    title: '沙画',
    emoji: '🏜️',
    description: '重新创作您的图像，仿佛它是由彩色沙子制成的。',
    flitType: 'image',
  },
  {
    key: 'mosaic',
    title: '马赛克',
    emoji: '💠',
    description: '将您的图像转换为由小瓷砖制成的马赛克。',
    flitType: 'image',
  },
  {
    key: 'paperQuilling',
    title: '纸艺',
    emoji: '📜',
    description: '使用卷曲和成形的纸条重建您的主题。',
    flitType: 'image',
  },
  {
    key: 'woodCarving',
    title: '木雕',
    emoji: '🪵',
    description: '将您的主题重塑为精细的木雕。',
    flitType: 'image',
  },
  {
    key: 'iceSculpture',
    title: '冰雕',
    emoji: '🧊',
    description: '将您的主题转变为半透明的冰雕。',
    flitType: 'image',
  },
  {
    key: 'bronzeStatue',
    title: '铜像',
    emoji: '🗿',
    description: '将您的主题变成一尊风化的铜像。',
    flitType: 'image',
  },
  {
    key: 'galaxy',
    title: '星系',
    emoji: '🌌',
    description: '将您的图像与充满活力的星云和星空背景融合。',
    flitType: 'image',
  },
  {
    key: 'fire',
    title: '火焰',
    emoji: '🔥',
    description: '重新想象您的主题，仿佛它是由熊熊火焰形成的。',
    flitType: 'image',
  },
  {
    key: 'water',
    title: '水',
    emoji: '💧',
    description: '重新想象您的主题，仿佛它是由流动的水形成的。',
    flitType: 'image',
  },
  {
    key: 'smokeArt',
    title: '烟雾艺术',
    emoji: '💨',
    description: '用优雅、旋转的烟雾创造您的主题。',
    flitType: 'image',
  },
  {
    key: 'vectorArt',
    title: '矢量艺术',
    emoji: '🎨',
    description: '将您的照片转换为干净、可缩放的矢量艺术。',
    flitType: 'image',
  },
  {
    key: 'infrared',
    title: '红外线',
    emoji: '📸',
    description: '模拟具有超现实色彩的红外照片效果。',
    flitType: 'image',
  },
  {
    key: 'knitted',
    title: '针织',
    emoji: '🧶',
    description: '将您的图像重塑为一个舒适的针织羊毛图案。',
    flitType: 'image',
  },
  {
    key: 'etching',
    title: '蚀刻',
    emoji: '✒️',
    description: '将您的图像重绘为经典的黑白蚀刻画。',
    flitType: 'image',
  },
  {
    key: 'diorama',
    title: '立体模型',
    emoji: '📦',
    description: '将您的场景变成盒子里的微型3D立体模型。',
    flitType: 'image',
  },
  {
    key: 'paintingProcess',
    title: '绘画过程',
    emoji: '🖼️',
    description: '展示一个4步网格，展示您的图像从草图到最终绘画的创作过程。',
    flitType: 'image',
  },
  {
    key: 'markerSketch',
    title: '马克笔素描',
    emoji: '🖊️',
    description: '用Copic马克笔的风格重塑您的照片，创造出充满活力的素描。',
    flitType: 'image',
  },
  {
    key: 'vanGogh',
    title: '梵高风格',
    emoji: '🌌',
    description: '用梵高《星夜》标志性的、旋转的笔触重绘您的照片。',
    flitType: 'image',
  },
  {
    key: 'cyberpunk',
    title: '赛博朋克',
    emoji: '🤖',
    description: '将您的场景转变为一个充满霓虹灯的未来赛博朋克城市。',
    flitType: 'image',
  },
  {
    key: 'lineArt',
    title: '线稿绘画',
    emoji: '✍🏻',
    description: '将您的照片简化为其基本线条，创建一个干净的草图。',
    flitType: 'image',
  },
];

const WorkshopPage: React.FC<WorkshopPageProps> = ({ t }) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<'all' | 'image' | 'video' | 'audio' | 'other'>('all');

  // 使用静态数据，忽略 t.tools 的内容，因为我们已经手动扩展了列表
  const tools: Tool[] = useMemo(() => TOOLS_DATA, []);

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
