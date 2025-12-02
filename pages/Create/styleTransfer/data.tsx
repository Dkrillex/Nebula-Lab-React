import { Target, Sparkles, Shirt } from 'lucide-react';

export type ModeType = 'standard' | 'creative' | 'clothing';

export interface GeneratedImage {
  key: number | string;
  url: string;
  revised_prompt?: string;
  b64_json?: string;
  previewVisible?: boolean;
}

export interface StyleTransferPageProps {
  t: {
    title: string;
    subtitle: string;
    modes: {
      standard: { title: string; desc: string };
      creative: { title: string; desc: string };
      clothing: { title: string; desc: string };
    };
    standard: {
      productTitle: string;
      productDesc: string;
      uploadProduct: string;
      areaTitle: string;
      areaDesc: string;
      uploadTemplate: string;
      selectTemplate: string;
      support: string;
    };
    clothing: {
      garmentTitle: string;
      garmentDesc: string;
      uploadGarment: string;
      modelTitle: string;
      uploadModel: string;
      types: { top: string; bottom: string; full: string };
    };
    creative: {
      productTitle: string;
      promptTitle: string;
      addRef: string;
      tryExample: string;
      aiPolish: string;
      promptPlaceholder: string;
      uploadProduct: string;
      support: string;
    };
    common: {
      generate: string;
      resultTitle: string;
      resultPlaceholder: string;
    };
  };
}

export interface Mode {
  id: ModeType;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  desc: string;
}

export const getModes = (t: StyleTransferPageProps['t']): Mode[] => {
  return [
    { id: 'standard', icon: Target, title: t.modes.standard.title, desc: t.modes.standard.desc },
    { id: 'creative', icon: Sparkles, title: t.modes.creative.title, desc: t.modes.creative.desc },
    { id: 'clothing', icon: Shirt, title: t.modes.clothing.title, desc: t.modes.clothing.desc },
  ];
};

