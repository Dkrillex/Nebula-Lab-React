import { translations } from '../../translations';

export interface Tool {
  key: string;
  title: string;
  emoji: string;
  description: string;
  flitType: 'image' | 'video' | 'audio' | 'other';
  route?: string;
  prompt?: string;
  isMultiImage?: boolean;
  isSecondaryOptional?: boolean;
  isTwoStep?: boolean;
  stepTwoPrompt?: string;
  primaryUploaderTitle?: string;
  primaryUploaderDescription?: string;
  secondaryUploaderTitle?: string;
  secondaryUploaderDescription?: string;
  isVideo?: boolean;
}

// 工具配置模板（包含所有工具的固定属性）
const TOOLS_CONFIG: Omit<Tool, 'title' | 'description' | 'emoji' | 'primaryUploaderTitle' | 'primaryUploaderDescription' | 'secondaryUploaderTitle' | 'secondaryUploaderDescription'>[] = [
  {
    key: 'translation',
    flitType: 'video',
    route: '/create/aiFaceSwap',
  },
  {
    key: 'tts',
    flitType: 'audio',
    route: '/create/tts',
  },
  {
    key: '3dModel',
    flitType: 'image',
    route: '/create/3dModel',
  },
  {
    key: 'customPrompt',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'CUSTOM',
    isMultiImage: true,
    isSecondaryOptional: true,
  },
  {
    key: 'imageTranslation',
    flitType: 'image',
    route: '/create/imageTranslation',
  },
  {
    key: 'aiTemplate',
    flitType: 'image',
    route: '/create/templateUi',
  },
  {
    key: 'figurine',
    flitType: 'image',
    route: '/create/useTool',
    prompt: "turn this photo into a character figure. Behind it, place a box with the character's image printed on it, and a computer showing the Blender modeling process on its screen. In front of the box, add a round plastic base with the character figure standing on it. set the scene indoors if possible",
  },
  {
    key: 'funko',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Transform the person into a Funko Pop figure, shown inside and next to its packaging.',
  },
  {
    key: 'lego',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Transform the person into a LEGO minifigure, inside its packaging box.',
  },
  {
    key: 'crochet',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Transform the subject into a handmade crocheted yarn doll with a cute, chibi-style appearance.',
  },
  {
    key: 'cosplay',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Generate a highly detailed, realistic photo of a person cosplaying the character in this illustration. Replicate the pose, expression, and framing.',
  },
  {
    key: 'plushie',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Turn the person in this photo into a cute, soft plushie doll.',
  },
  {
    key: 'keychain',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Turn the subject into a cute acrylic keychain, shown attached to a bag.',
  },
  {
    key: 'hdEnhance',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Enhance this image to high resolution, improving sharpness and clarity.',
  },
  {
    key: 'pose',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Apply the pose from the second image to the character in the first image. Render as a professional studio photograph.',
    isMultiImage: true,
  },
  {
    key: 'photorealistic',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Turn this illustration into a photorealistic version.',
  },
  {
    key: 'fashion',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Transform the photo into a stylized, ultra-realistic fashion magazine portrait with cinematic lighting.',
  },
  {
    key: 'hyperrealistic',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Generate a hyper-realistic, fashion-style photo with strong, direct flash lighting, grainy texture, and a cool, confident pose.',
  },
  {
    key: 'architecture',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Convert this photo of a building into a miniature architecture model, placed on a cardstock in an indoor setting. Show a computer with modeling software in the background.',
  },
  {
    key: 'productRender',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Turn this product sketch into a photorealistic 3D render with studio lighting.',
  },
  {
    key: 'sodaCan',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Design a soda can using this image as the main graphic, and show it in a professional product shot.',
  },
  {
    key: 'industrialDesign',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Turn this industrial design sketch into a realistic product photo, rendered with light brown leather and displayed in a minimalist museum setting.',
  },
  {
    key: 'iphoneWallpaper',
    flitType: 'image',
    route: '/create/useTool',
    prompt: "Turn the image into an iPhone lock screen wallpaper effect, with the phone's time (01:16), date (Sunday, September 16), and status bar information (battery, signal, etc.), with the flashlight and camera buttons at the bottom, overlaid on the image. The original image should be adapted to a vertical composition that fits a phone screen. The phone is placed on a solid color background of the same color scheme.",
  },
  {
    key: 'colorPalette',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Turn this image into a clean, hand-drawn line art sketch.',
    isMultiImage: true,
    isTwoStep: true,
    stepTwoPrompt: 'Color the line art using the colors from the second image.',
  },
  {
    key: 'videoGeneration',
    flitType: 'video',
    route: '/create/useTool',
    prompt: 'CUSTOM',
    isVideo: true,
  },
  {
    key: 'isolate',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Isolate the person in the masked area and generate a high-definition photo of them against a neutral background.',
  },
  {
    key: 'screen3d',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'For an image with a screen, add content that appears to be glasses-free 3D, popping out of the screen.',
  },
  {
    key: 'makeup',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Analyze the makeup in this photo and suggest improvements by drawing with a red pen.',
  },
  {
    key: 'background',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Change the background to a Y2K aesthetic style.',
  },
  {
    key: 'addIllustration',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Add a cute, cartoon-style illustrated couple into the real-world scene, sitting and talking.',
  },
  {
    key: 'pixelArt',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Redraw the image in the retro 8-bit pixel art style.',
  },
  {
    key: 'watercolor',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Transform the image into a soft and vibrant watercolor painting.',
  },
  {
    key: 'popArt',
    flitType: 'image',
    route: '/create/useTool',
    prompt: "Reimagine the image in the style of Andy Warhol's pop art, with bold colors and screen-print effects.",
  },
  {
    key: 'comicBook',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Convert the image into a classic comic book panel with halftones, bold outlines, and action text.',
  },
  {
    key: 'claymation',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Recreate the image as a charming stop-motion claymation scene.',
  },
  {
    key: 'ukiyoE',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Redraw the image in the style of a traditional Japanese Ukiyo-e woodblock print.',
  },
  {
    key: 'stainedGlass',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Transform the image into a vibrant stained glass window with dark lead lines.',
  },
  {
    key: 'origami',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Reconstruct the subject of the image using folded paper in an origami style.',
  },
  {
    key: 'neonGlow',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Outline the subject in bright, glowing neon lights against a dark background.',
  },
  {
    key: 'doodleArt',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Overlay the image with playful, hand-drawn doodle-style illustrations.',
  },
  {
    key: 'vintagePhoto',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Give the image an aged, sepia-toned vintage photograph look from the early 20th century.',
  },
  {
    key: 'blueprintSketch',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Convert the image into a technical blueprint-style architectural drawing.',
  },
  {
    key: 'glitchArt',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Apply a digital glitch effect with datamoshing, pixel sorting, and RGB shifts.',
  },
  {
    key: 'doubleExposure',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Create a double exposure effect, blending the image with a nature scene like a forest or a mountain range.',
  },
  {
    key: 'hologram',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Project the subject as a futuristic, glowing blue hologram.',
  },
  {
    key: 'lowPoly',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Reconstruct the image using a low-polygon geometric mesh.',
  },
  {
    key: 'charcoalSketch',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Redraw the image as a dramatic, high-contrast charcoal sketch on textured paper.',
  },
  {
    key: 'impressionism',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Repaint the image in the style of an Impressionist masterpiece, with visible brushstrokes and a focus on light.',
  },
  {
    key: 'cubism',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Deconstruct and reassemble the subject in the abstract, geometric style of Cubism.',
  },
  {
    key: 'steampunk',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Reimagine the subject with steampunk aesthetics, featuring gears, brass, and Victorian-era technology.',
  },
  {
    key: 'fantasyArt',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Transform the image into an epic fantasy-style painting, with magical elements and dramatic lighting.',
  },
  {
    key: 'graffiti',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Spray-paint the image as vibrant graffiti on a brick wall.',
  },
  {
    key: 'minimalistLineArt',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Reduce the image to a single, continuous, minimalist line drawing.',
  },
  {
    key: 'storybook',
    flitType: 'image',
    route: '/create/useTool',
    prompt: "Redraw the image in the style of a whimsical children's storybook illustration.",
  },
  {
    key: 'thermal',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Apply a thermal imaging effect with a heat map color palette.',
  },
  {
    key: 'risograph',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Simulate a risograph print effect with grainy textures and limited, overlapping color layers.',
  },
  {
    key: 'crossStitch',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Convert the image into a textured, handmade cross-stitch pattern.',
  },
  {
    key: 'tattoo',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Redesign the subject as a classic American traditional style tattoo.',
  },
  {
    key: 'psychedelic',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Apply a vibrant, swirling, psychedelic art style from the 1960s.',
  },
  {
    key: 'gothic',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Reimagine the scene with a dark, gothic art style, featuring dramatic shadows and architecture.',
  },
  {
    key: 'tribal',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Redraw the subject using patterns and motifs from traditional tribal art.',
  },
  {
    key: 'dotPainting',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Recreate the image using the dot painting technique of Aboriginal art.',
  },
  {
    key: 'chalk',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Draw the image as a colorful chalk illustration on a sidewalk.',
  },
  {
    key: 'sandArt',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Recreate the image as if it were made from colored sand.',
  },
  {
    key: 'mosaic',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Transform the image into a mosaic made of small ceramic tiles.',
  },
  {
    key: 'paperQuilling',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Reconstruct the subject using the art of paper quilling, with rolled and shaped strips of paper.',
  },
  {
    key: 'woodCarving',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Recreate the subject as a detailed wood carving.',
  },
  {
    key: 'iceSculpture',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Transform the subject into a translucent, detailed ice sculpture.',
  },
  {
    key: 'bronzeStatue',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Turn the subject into a weathered bronze statue on a pedestal.',
  },
  {
    key: 'galaxy',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Blend the image with a vibrant nebula and starry galaxy background.',
  },
  {
    key: 'fire',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Reimagine the subject as if it were formed from roaring flames.',
  },
  {
    key: 'water',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Reimagine the subject as if it were formed from flowing, liquid water.',
  },
  {
    key: 'smokeArt',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Create the subject from elegant, swirling wisps of smoke.',
  },
  {
    key: 'vectorArt',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Convert the photo into clean, scalable vector art with flat colors and sharp lines.',
  },
  {
    key: 'infrared',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Simulate an infrared photo effect with surreal colors and glowing foliage.',
  },
  {
    key: 'knitted',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Recreate the image as a cozy, knitted wool pattern.',
  },
  {
    key: 'etching',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Redraw the image as a classic black and white etching or engraving.',
  },
  {
    key: 'diorama',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Turn the scene into a miniature 3D diorama inside a box.',
  },
  {
    key: 'paintingProcess',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Generate a 4-panel grid showing the artistic process of creating this image, from sketch to final render.',
  },
  {
    key: 'markerSketch',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Redraw the image in the style of a Copic marker sketch, often used in design.',
  },
  {
    key: 'vanGogh',
    flitType: 'image',
    route: '/create/useTool',
    prompt: "Reimagine the photo in the style of Van Gogh's 'Starry Night'.",
  },
  {
    key: 'cyberpunk',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Transform the scene into a futuristic cyberpunk city.',
  },
  {
    key: 'lineArt',
    flitType: 'image',
    route: '/create/useTool',
    prompt: 'Turn the image into a clean, hand-drawn line art sketch.',
  },
];

// 根据语言生成工具数据
export function getToolsData(lang: 'zh' | 'en' | 'id' = 'zh'): Tool[] {
  const t = translations[lang]?.createPage?.workshop?.tools || translations['zh'].createPage.workshop.tools;
  
  return TOOLS_CONFIG.map(config => {
    const toolTranslation = t[config.key as keyof typeof t];
    if (!toolTranslation) {
      // 如果翻译不存在，使用中文作为后备
      const fallbackT = translations['zh'].createPage.workshop.tools;
      const fallbackTranslation = fallbackT[config.key as keyof typeof fallbackT];
      return {
        ...config,
        title: fallbackTranslation?.title || config.key,
        description: fallbackTranslation?.description || '',
        emoji: fallbackTranslation?.emoji || '🎨',
      ...(config.key === 'customPrompt' || config.key === 'pose' || config.key === 'colorPalette' ? {
        primaryUploaderTitle: (toolTranslation as any)?.primaryUploaderTitle || (fallbackTranslation as any)?.primaryUploaderTitle,
        primaryUploaderDescription: (toolTranslation as any)?.primaryUploaderDescription || (fallbackTranslation as any)?.primaryUploaderDescription,
        secondaryUploaderTitle: (toolTranslation as any)?.secondaryUploaderTitle || (fallbackTranslation as any)?.secondaryUploaderTitle,
        secondaryUploaderDescription: (toolTranslation as any)?.secondaryUploaderDescription || (fallbackTranslation as any)?.secondaryUploaderDescription,
      } : {}),
      };
    }
    
    return {
      ...config,
      title: toolTranslation.title,
      description: toolTranslation.description,
      emoji: toolTranslation.emoji,
      ...(config.key === 'customPrompt' || config.key === 'pose' || config.key === 'colorPalette' ? {
        primaryUploaderTitle: (toolTranslation as any).primaryUploaderTitle,
        primaryUploaderDescription: (toolTranslation as any).primaryUploaderDescription,
        secondaryUploaderTitle: (toolTranslation as any).secondaryUploaderTitle,
        secondaryUploaderDescription: (toolTranslation as any).secondaryUploaderDescription,
      } : {}),
    };
  });
}

// 默认导出中文版本（向后兼容）
export const TOOLS_DATA: Tool[] = getToolsData('zh');

