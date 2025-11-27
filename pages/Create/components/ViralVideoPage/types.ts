import { ProductAnalysis } from '../../../../services/viralVideoService';

// 上传图片类型
export interface UploadedImage {
  url: string;
  file?: File;
  id?: string;
}

// 脚本选项类型
export interface ScriptOption {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  description?: string;
}

// 分镜镜头类型
export interface Shot {
  img: string;
  desc: string;
}

// 分镜场景类型
export interface StoryboardScene {
  id: number;
  scene: number;
  shots: Shot[];
  lines: string;
}

// 分镜板类型
export interface Storyboard {
  scriptTitle: string;
  scriptSubtitle: string;
  totalDuration: string;
  scenes: StoryboardScene[];
}

// 视频生成状态类型
export type VideoStatus = 'pending' | 'processing' | 'succeeded' | 'failed';

// 分镜视频信息类型
export interface StoryboardVideo {
  url?: string;
  taskId?: string;
  status: VideoStatus;
  progress?: number;
}

// 页面Props类型
export interface ViralVideoPageProps {
  t: {
    title: string;
    tabs: {
      upload: string;
      link: string;
    };
    uploadArea: {
      title: string;
      desc: string;
      limitation: string;
      selectFromPortfolio: string;
      uploadLocal: string;
    };
    process: {
      uploadImages: string;
      generateVideo: string;
      makeSame: string;
    };
    examples: string;
  };
}

// 导出ProductAnalysis类型
export type { ProductAnalysis };

