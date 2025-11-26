import { chatService, ChatRequest } from './chatService';
import { ApiResponse } from '../types';

// ==================== 类型定义 ====================

export interface ProductAnalysis {
  productName: string;
  sellingPoints: string[];
  scenes: string[];
  category?: string;
  style?: string;
}

export interface ScriptOption {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  description?: string;
}

export interface Shot {
  img: string;
  desc: string;
}

export interface StoryboardScene {
  id: number;
  scene: number;
  shots: Shot[];
  lines: string;
}

export interface Storyboard {
  scriptTitle: string;
  scriptSubtitle: string;
  totalDuration: string;
  scenes: StoryboardScene[];
}

// ==================== 服务方法 ====================

export const viralVideoService = {
  /**
   * 分析商品图片，提取素材和卖点（单张图片）
   * @param imageUrl 图片URL（OSS URL）
   * @param model 使用的AI模型
   */
  analyzeProductImage: async (
    imageUrl: string,
    model: string = 'qwen3-omni-flash'
  ): Promise<ProductAnalysis> => {
    const systemPrompt = `你是一个专业的商品分析专家。请分析这张商品图片，提取以下信息：
1. 商品名称（简洁准确）
2. 主要卖点（3-5个，用分号分隔）
3. 适用场景（2-3个，用分号分隔）
4. 商品类别（如：服装、鞋靴、配饰等）
5. 风格特点（如：简约、复古、运动等）

请以JSON格式返回，格式如下：
{
  "productName": "商品名称",
  "sellingPoints": ["卖点1", "卖点2", "卖点3"],
  "scenes": ["场景1", "场景2"],
  "category": "类别",
  "style": "风格"
}

只返回JSON，不要其他文字说明。`;

    const userPrompt = `请分析这张商品图片：`;

    const requestData: ChatRequest = {
      model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userPrompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      temperature: 0.3,
    };

    try {
      const response = await chatService.chatCompletions(requestData);
      
      if (response.code !== 200 || !response.data?.choices?.[0]?.message?.content) {
        throw new Error('AI分析失败，请重试');
      }

      const content = response.data.choices[0].message.content.trim();
      
      // 尝试提取JSON（可能包含markdown代码块）
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      } else {
        // 尝试直接提取大括号内容
        const braceMatch = content.match(/\{[\s\S]*\}/);
        if (braceMatch) {
          jsonStr = braceMatch[0];
        }
      }

      const analysis = JSON.parse(jsonStr) as any;
      
      // 验证和规范化数据
      const sellingPointsRaw = analysis.sellingPoints;
      const sellingPoints = Array.isArray(sellingPointsRaw)
        ? sellingPointsRaw
        : typeof sellingPointsRaw === 'string'
        ? sellingPointsRaw.split(/[;；]/).map((s: string) => s.trim()).filter(Boolean)
        : [];
      
      const scenesRaw = analysis.scenes;
      const scenes = Array.isArray(scenesRaw)
        ? scenesRaw
        : typeof scenesRaw === 'string'
        ? scenesRaw.split(/[;；]/).map((s: string) => s.trim()).filter(Boolean)
        : [];

      return {
        productName: analysis.productName || '未知商品',
        sellingPoints: sellingPoints as string[],
        scenes: scenes as string[],
        category: analysis.category || '',
        style: analysis.style || '',
      };
    } catch (error: any) {
      console.error('商品分析失败:', error);
      throw new Error(error.message || '商品分析失败，请重试');
    }
  },

  /**
   * 综合分析多张商品图片，提取素材和卖点
   * @param imageUrls 图片URL数组（OSS URL）
   * @param model 使用的AI模型
   */
  analyzeProductImages: async (
    imageUrls: string[],
    model: string = 'qwen3-omni-flash'
  ): Promise<ProductAnalysis> => {
    if (!imageUrls || imageUrls.length === 0) {
      throw new Error('请至少提供一张图片');
    }

    const systemPrompt = `你是一个专业的商品分析专家。请综合分析这些商品图片（共${imageUrls.length}张），提取以下信息：
1. 商品名称（简洁准确，综合所有图片得出）
2. 主要卖点（5-8个，综合所有图片的特点，用分号分隔）
3. 适用场景（3-5个，综合所有图片展示的场景，用分号分隔）
4. 商品类别（如：服装、鞋靴、配饰等）
5. 风格特点（如：简约、复古、运动等）

请仔细观察所有图片，综合分析：
- 从不同角度、不同场景的图片中提取完整的商品信息
- 合并所有图片中展示的卖点和特点
- 确保分析结果全面、准确

请以JSON格式返回，格式如下：
{
  "productName": "商品名称",
  "sellingPoints": ["卖点1", "卖点2", "卖点3", "卖点4", "卖点5"],
  "scenes": ["场景1", "场景2", "场景3"],
  "category": "类别",
  "style": "风格"
}

只返回JSON，不要其他文字说明。`;

    const userPrompt = `请综合分析这${imageUrls.length}张商品图片，提取商品名称、卖点、场景等信息：`;

    // 构建包含所有图片的content数组
    const content: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> = [
      {
        type: 'text',
        text: userPrompt,
      },
      // 添加所有图片
      ...imageUrls.map(url => ({
        type: 'image_url' as const,
        image_url: {
          url,
        },
      })),
    ];

    const requestData: ChatRequest = {
      model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content,
        },
      ],
      temperature: 0.3,
    };

    try {
      const response = await chatService.chatCompletions(requestData);
      
      if (response.code !== 200 || !response.data?.choices?.[0]?.message?.content) {
        throw new Error('AI分析失败，请重试');
      }

      const responseContent = response.data.choices[0].message.content.trim();
      
      // 尝试提取JSON（可能包含markdown代码块）
      let jsonStr = responseContent;
      const jsonMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      } else {
        // 尝试直接提取大括号内容
        const braceMatch = responseContent.match(/\{[\s\S]*\}/);
        if (braceMatch) {
          jsonStr = braceMatch[0];
        }
      }

      const analysis = JSON.parse(jsonStr) as any;
      
      // 验证和规范化数据
      const sellingPointsRaw = analysis.sellingPoints;
      const sellingPoints = Array.isArray(sellingPointsRaw)
        ? sellingPointsRaw
        : typeof sellingPointsRaw === 'string'
        ? sellingPointsRaw.split(/[;；]/).map((s: string) => s.trim()).filter(Boolean)
        : [];
      
      const scenesRaw = analysis.scenes;
      const scenes = Array.isArray(scenesRaw)
        ? scenesRaw
        : typeof scenesRaw === 'string'
        ? scenesRaw.split(/[;；]/).map((s: string) => s.trim()).filter(Boolean)
        : [];

      return {
        productName: analysis.productName || '未知商品',
        sellingPoints: sellingPoints as string[],
        scenes: scenes as string[],
        category: analysis.category || '',
        style: analysis.style || '',
      };
    } catch (error: any) {
      console.error('商品分析失败:', error);
      throw new Error(error.message || '商品分析失败，请重试');
    }
  },

  /**
   * 基于分析结果生成脚本选项
   * @param analysis 商品分析结果
   * @param model 使用的AI模型
   */
  generateScripts: async (
    analysis: ProductAnalysis,
    model: string = 'qwen3-omni-flash'
  ): Promise<ScriptOption[]> => {
    const systemPrompt = `你是一个专业的短视频营销脚本创作专家。基于商品信息，生成3-5个营销脚本模板。

每个脚本应包含：
1. 标题（简洁有力，如"白裙公式"、"氛围穿搭"等）
2. 副标题（描述脚本特点，如"外观样式+上身效果+..."）
3. 预计时长（如"30s"、"25s"等）
4. 简要描述（可选）

脚本类型可以包括：
- 外观展示型（突出商品外观、设计）
- 情感共鸣型（情绪+外观）
- 痛点解决型（身材焦虑+外观）
- 人设背书型（人设+外观）
- 经典永恒型（经典+外观）

请以JSON数组格式返回，格式如下：
[
  {
    "id": "script-1",
    "title": "脚本标题",
    "subtitle": "副标题描述",
    "time": "30s",
    "description": "脚本描述"
  },
  ...
]

只返回JSON数组，不要其他文字说明。`;

    const userPrompt = `商品信息：
- 商品名称：${analysis.productName}
- 主要卖点：${analysis.sellingPoints.join('、')}
- 适用场景：${analysis.scenes.join('、')}
- 商品类别：${analysis.category || '未知'}
- 风格特点：${analysis.style || '未知'}

请基于以上信息生成营销脚本选项。`;

    const requestData: ChatRequest = {
      model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7,
    };

    try {
      const response = await chatService.chatCompletions(requestData);
      
      if (response.code !== 200 || !response.data?.choices?.[0]?.message?.content) {
        throw new Error('脚本生成失败，请重试');
      }

      const content = response.data.choices[0].message.content.trim();
      
      // 提取JSON数组
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      } else {
        const arrayMatch = content.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          jsonStr = arrayMatch[0];
        }
      }

      const scripts = JSON.parse(jsonStr) as ScriptOption[];
      
      // 验证和规范化
      return scripts
        .filter(s => s.title && s.subtitle && s.time)
        .map((s, index) => ({
          id: s.id || `script-${index + 1}`,
          title: s.title,
          subtitle: s.subtitle,
          time: s.time,
          description: s.description || '',
        }));
    } catch (error: any) {
      console.error('脚本生成失败:', error);
      throw new Error(error.message || '脚本生成失败，请重试');
    }
  },

  /**
   * 生成分镜详情
   * @param script 选中的脚本
   * @param analysis 商品分析结果
   * @param uploadedImages 已上传的图片URL列表
   * @param model 使用的AI模型
   */
  generateStoryboard: async (
    script: ScriptOption,
    analysis: ProductAnalysis,
    uploadedImages: string[],
    model: string = 'qwen3-omni-flash'
  ): Promise<Storyboard> => {
    const systemPrompt = `你是一个专业的视频分镜创作专家。为给定的营销脚本生成详细的分镜方案。

每个分镜应包含：
1. 分镜编号（从1开始）
2. 画面描述（镜头运动、画面内容、展示重点）
3. 台词（与画面配合的文案，自然流畅）
4. 每个分镜可以有1-2个镜头（shots）

分镜要求：
- 总时长控制在30-40秒
- 每个分镜约5-10秒
- 画面描述要具体，包含镜头运动（如：从下往上缓慢移动、缓慢拉近、特写等）
- 台词要口语化，符合短视频风格
- 合理分配商品卖点，每个分镜突出1-2个卖点

请以JSON格式返回，格式如下：
{
  "scriptTitle": "脚本标题",
  "scriptSubtitle": "脚本副标题",
  "totalDuration": "35s",
  "scenes": [
    {
      "id": 1,
      "scene": 1,
      "shots": [
        {
          "img": "图片URL或描述",
          "desc": "镜头从下往上缓慢移动，完整展示连衣裙的廓形。"
        },
        {
          "img": "图片URL或描述",
          "desc": "镜头缓慢拉近，聚焦于胸前的珍珠扣和蕾丝边细节。"
        }
      ],
      "lines": "台词内容，自然流畅的口语化表达。"
    },
    ...
  ]
}

只返回JSON，不要其他文字说明。`;

    const userPrompt = `脚本信息：
- 标题：${script.title}
- 副标题：${script.subtitle}
- 预计时长：${script.time}

商品信息：
- 商品名称：${analysis.productName}
- 主要卖点：${analysis.sellingPoints.join('、')}
- 适用场景：${analysis.scenes.join('、')}

可用图片：${uploadedImages.length}张
${uploadedImages.map((url, idx) => `图片${idx + 1}: ${url}`).join('\n')}

请为这个脚本生成详细的分镜方案。在shots的img字段中，可以使用"图片1"、"图片2"等引用，或者使用具体的图片URL。`;

    const requestData: ChatRequest = {
      model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7,
    };

    try {
      const response = await chatService.chatCompletions(requestData);
      
      if (response.code !== 200 || !response.data?.choices?.[0]?.message?.content) {
        throw new Error('分镜生成失败，请重试');
      }

      const content = response.data.choices[0].message.content.trim();
      
      // 提取JSON
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      } else {
        const braceMatch = content.match(/\{[\s\S]*\}/);
        if (braceMatch) {
          jsonStr = braceMatch[0];
        }
      }

      const storyboard = JSON.parse(jsonStr) as Storyboard;
      
      // 处理图片引用：将"图片1"、"图片2"等替换为实际URL
      storyboard.scenes = storyboard.scenes.map((scene) => ({
        ...scene,
        shots: scene.shots.map((shot) => {
          let imgUrl = shot.img;
          
          // 如果是图片引用（如"图片1"），替换为实际URL
          const imgMatch = imgUrl.match(/图片(\d+)/);
          if (imgMatch) {
            const imgIndex = parseInt(imgMatch[1]) - 1;
            if (imgIndex >= 0 && imgIndex < uploadedImages.length) {
              imgUrl = uploadedImages[imgIndex];
            } else {
              // 如果索引超出，使用第一张图片
              imgUrl = uploadedImages[0] || shot.img;
            }
          }
          
          // 如果仍然是描述性文字，尝试从uploadedImages中分配
          if (!imgUrl.startsWith('http')) {
            // 根据分镜和镜头索引分配图片
            const sceneIndex = scene.id - 1;
            const shotIndex = scene.shots.indexOf(shot);
            const totalIndex = sceneIndex * 2 + shotIndex;
            imgUrl = uploadedImages[totalIndex % uploadedImages.length] || uploadedImages[0] || '';
          }
          
          return {
            ...shot,
            img: imgUrl,
          };
        }),
      }));

      return {
        scriptTitle: storyboard.scriptTitle || script.title,
        scriptSubtitle: storyboard.scriptSubtitle || script.subtitle,
        totalDuration: storyboard.totalDuration || script.time,
        scenes: storyboard.scenes,
      };
    } catch (error: any) {
      console.error('分镜生成失败:', error);
      throw new Error(error.message || '分镜生成失败，请重试');
    }
  },
};

