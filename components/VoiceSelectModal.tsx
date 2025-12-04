import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Play, Pause, ChevronDown, ChevronUp, User } from 'lucide-react';
import BaseModal from './BaseModal';
import { useAppOutletContext } from '@/router/context';
import { translations } from '@/translations';

// 支持的语种常量
const STANDARD_LANGUAGES = ['中文', '英语', '法语', '德语', '俄语', '意大利语', '西班牙语', '葡萄牙语', '日语', '韩语'];

// 音色数据接口
export interface VoiceOption {
  value: string;
  label: string;
  description: string;
  gender: 'male' | 'female' | 'neutral';
  language: 'chinese' | 'english' | 'dialect' | 'minority';
  dialect?: string;
  age: 'child' | 'youth' | 'middle' | 'elderly';
  scenario: string[];
  previewUrl: string;
  avatar: string;
  supportedLanguages: string[];
}

// 静态音色数据（基础数据，使用 key 引用翻译）
const VOICE_DATA_BASE = [
  {
    value: 'Cherry',
    labelKey: 'CHERRY',
    descriptionKey: 'CHERRY_DESC',
    gender: 'female',
    language: 'chinese',
    age: 'youth',
    scenarioKeys: ['companionChat', 'voiceAssistant', 'consumerElectronics'],
    previewUrl: 'http://dashscope-result-bj.oss-cn-beijing.aliyuncs.com/1d/0f/20251204/d2033070/200bd649-31b7-49d3-aef5-da26335c87b8.wav?Expires=1764919148&OSSAccessKeyId=LTAI5tKPD3TMqf2Lna1fASuh&Signature=xM%2FG4ZKFQc9xWMuPoCVQDqDexZQ%3D',
    avatar: '',
    supportedLanguages: STANDARD_LANGUAGES,
  },
  {
    value: 'Ethan',
    labelKey: 'ETHAN',
    descriptionKey: 'ETHAN_DESC',
    gender: 'male',
    language: 'chinese',
    age: 'youth',
    scenarioKeys: ['customerService', 'voiceAssistant', 'consumerElectronics'],
    previewUrl: 'http://dashscope-result-bj.oss-cn-beijing.aliyuncs.com/1d/97/20251204/d2033070/09e911b4-2c63-4228-8c36-f1d0a778a564.wav?Expires=1764919275&OSSAccessKeyId=LTAI5tKPD3TMqf2Lna1fASuh&Signature=AsCSyRRc2fxk5DUvVCn824E6CGo%3D',
    avatar: '',
    supportedLanguages: STANDARD_LANGUAGES,
  },
  {
    value: 'Nofish',
    labelKey: 'NOFISH',
    descriptionKey: 'NOFISH_DESC',
    gender: 'male',
    language: 'chinese',
    age: 'youth',
    scenarioKeys: ['companionChat', 'consumerElectronics'],
    previewUrl: 'http://dashscope-result-bj.oss-cn-beijing.aliyuncs.com/1d/6d/20251204/d2033070/6c239baa-3e94-4ac7-bbb5-e96a565db6ca.wav?Expires=1764919612&OSSAccessKeyId=LTAI5tKPD3TMqf2Lna1fASuh&Signature=m7DWt7zWhuylt44%2F0os7ypDF3sQ%3D',
    avatar: '',
    supportedLanguages: STANDARD_LANGUAGES,
  },
  {
    value: 'Jennifer',
    labelKey: 'JENNIFER',
    descriptionKey: 'JENNIFER_DESC',
    gender: 'female',
    language: 'english',
    age: 'youth',
    scenarioKeys: ['audiobook', 'shortVideo', 'ecommerceLive'],
    previewUrl: 'http://dashscope-result-bj.oss-cn-beijing.aliyuncs.com/1d/fa/20251204/d2033070/dadcb064-6919-4891-98be-0f7a2790680a.wav?Expires=1764919948&OSSAccessKeyId=LTAI5tKPD3TMqf2Lna1fASuh&Signature=bJmppHO2h7%2FYvZZLCcW4eDgSiXU%3D',
    avatar: '',
    supportedLanguages: STANDARD_LANGUAGES,
  },
  {
    value: 'Ryan',
    labelKey: 'RYAN',
    descriptionKey: 'RYAN_DESC',
    gender: 'male',
    language: 'english',
    age: 'youth',
    scenarioKeys: ['shortVideo', 'audiobook', 'ecommerceLive'],
    previewUrl: 'http://dashscope-result-bj.oss-cn-beijing.aliyuncs.com/1d/f1/20251204/d2033070/8c224036-99ae-4d2d-bef4-3ea74c36653e.wav?Expires=1764920236&OSSAccessKeyId=LTAI5tKPD3TMqf2Lna1fASuh&Signature=HpaeZz6WaD6Jmglzs%2FZ7aZjSAZk%3D',
    avatar: '',
    supportedLanguages: STANDARD_LANGUAGES,
  },
  {
    value: 'Katerina',
    labelKey: 'KATERINA',
    descriptionKey: 'KATERINA_DESC',
    gender: 'female',
    language: 'english',
    age: 'middle',
    scenarioKeys: ['audiobook', 'shortVideo', 'ecommerceLive'],
    previewUrl: 'http://dashscope-result-bj.oss-cn-beijing.aliyuncs.com/1d/6e/20251204/d2033070/8deb36e7-2e45-40b9-9b4d-060f14f60036.wav?Expires=1764920652&OSSAccessKeyId=LTAI5tKPD3TMqf2Lna1fASuh&Signature=o83d9%2FTKmHOSG8LoWlHnkjojA0c%3D',
    avatar: '',
    supportedLanguages: STANDARD_LANGUAGES,
  },
  {
    value: 'Elias',
    labelKey: 'ELIAS',
    descriptionKey: 'ELIAS_DESC',
    gender: 'male',
    language: 'chinese',
    age: 'middle',
    scenarioKeys: ['audiobook', 'voiceAssistant'],
    previewUrl: 'http://dashscope-result-bj.oss-cn-beijing.aliyuncs.com/1d/96/20251204/d2033070/f2be034f-9fb9-4c6f-8550-4bd5bd3362bf.wav?Expires=1764920675&OSSAccessKeyId=LTAI5tKPD3TMqf2Lna1fASuh&Signature=xNd%2BMGJySimbr4PtZjHr5CW5A58%3D',
    avatar: '',
    supportedLanguages: STANDARD_LANGUAGES,
  },
  {
    value: 'Jada',
    labelKey: 'JADA',
    descriptionKey: 'JADA_DESC',
    gender: 'female',
    language: 'dialect',
    dialect: '上海话',
    age: 'middle',
    scenarioKeys: ['companionChat', 'consumerElectronics'],
    previewUrl: 'http://dashscope-result-wlcb.oss-cn-wulanchabu.aliyuncs.com/1d/be/20251204/f87e520c/e996d3da-2424-4aa0-8178-1952188bbd81.wav?Expires=1764921358&OSSAccessKeyId=LTAI5tKPD3TMqf2Lna1fASuh&Signature=iUa%2FtszjGovqqpv2SWoJhH2fgi8%3D',
    avatar: '',
    supportedLanguages: ['中文(上海话)', ...STANDARD_LANGUAGES.slice(1)],
  },
  {
    value: 'Dylan',
    labelKey: 'DYLAN',
    descriptionKey: 'DYLAN_DESC',
    gender: 'male',
    language: 'dialect',
    dialect: '北京话',
    age: 'youth',
    scenarioKeys: ['companionChat', 'consumerElectronics'],
    previewUrl: 'http://dashscope-result-wlcb.oss-cn-wulanchabu.aliyuncs.com/1d/ec/20251204/f87e520c/19247ae2-c4c6-4f21-8e05-bf1ae9bffe82.wav?Expires=1764921400&OSSAccessKeyId=LTAI5tKPD3TMqf2Lna1fASuh&Signature=QctJXxTJgpJMD%2BJa%2FNpRlD3OpiM%3D',
    avatar: '',
    supportedLanguages: ['中文(北京话)', ...STANDARD_LANGUAGES.slice(1)],
  },
  {
    value: 'Sunny',
    labelKey: 'SUNNY',
    descriptionKey: 'SUNNY_DESC',
    gender: 'female',
    language: 'dialect',
    dialect: '四川话',
    age: 'youth',
    scenarioKeys: ['companionChat', 'consumerElectronics'],
    previewUrl: 'http://dashscope-result-wlcb.oss-cn-wulanchabu.aliyuncs.com/1d/2c/20251204/f87e520c/097109b8-1537-4bc1-93da-0cfac110bb80.wav?Expires=1764921442&OSSAccessKeyId=LTAI5tKPD3TMqf2Lna1fASuh&Signature=krX4m%2F%2Fnrv05G084yxlEA8DRndU%3D',
    avatar: '',
    supportedLanguages: ['中文(四川话)', ...STANDARD_LANGUAGES.slice(1)],
  },
  {
    value: 'Li',
    labelKey: 'LI',
    descriptionKey: 'LI_DESC',
    gender: 'male',
    language: 'dialect',
    dialect: '南京话',
    age: 'middle',
    scenarioKeys: ['companionChat', 'voiceAssistant'],
    previewUrl: 'http://dashscope-result-wlcb.oss-cn-wulanchabu.aliyuncs.com/1d/c1/20251204/f87e520c/ae11bc29-be60-48c8-b651-f4648898062e.wav?Expires=1764921491&OSSAccessKeyId=LTAI5tKPD3TMqf2Lna1fASuh&Signature=j5DQQxpyQwlZthjxoSkixW9pz8Y%3D',
    avatar: '',
    supportedLanguages: ['中文(南京话)', ...STANDARD_LANGUAGES.slice(1)],
  },
  {
    value: 'Marcus',
    labelKey: 'MARCUS',
    descriptionKey: 'MARCUS_DESC',
    gender: 'male',
    language: 'dialect',
    dialect: '陕西话',
    age: 'middle',
    scenarioKeys: ['companionChat', 'consumerElectronics'],
    previewUrl: 'http://dashscope-result-wlcb.oss-cn-wulanchabu.aliyuncs.com/1d/ff/20251204/f87e520c/92a74cab-c935-478e-837a-a25459bc112b.wav?Expires=1764921845&OSSAccessKeyId=LTAI5tKPD3TMqf2Lna1fASuh&Signature=S3G224LvD5N1YM4W5%2BRwmYdl4Fk%3D',
    avatar: '',
    supportedLanguages: ['中文(陕西话)', ...STANDARD_LANGUAGES.slice(1)],
  },
  {
    value: 'Roy',
    labelKey: 'ROY',
    descriptionKey: 'ROY_DESC',
    gender: 'male',
    language: 'dialect',
    dialect: '闽南语',
    age: 'youth',
    scenarioKeys: ['companionChat', 'consumerElectronics'],
    previewUrl: 'http://dashscope-result-wlcb.oss-cn-wulanchabu.aliyuncs.com/1d/2f/20251204/f87e520c/e8305baf-67ca-494d-a8b9-01e5cf1e374d.wav?Expires=1764921902&OSSAccessKeyId=LTAI5tKPD3TMqf2Lna1fASuh&Signature=J6l6kNBnv8aMH883N0B33lbiJDA%3D',
    avatar: '',
    supportedLanguages: ['中文(闽南语)', ...STANDARD_LANGUAGES.slice(1)],
  },
  {
    value: 'Peter',
    labelKey: 'PETER',
    descriptionKey: 'PETER_DESC',
    gender: 'male',
    language: 'dialect',
    dialect: '天津话',
    age: 'middle',
    scenarioKeys: ['companionChat', 'consumerElectronics'],
    previewUrl: 'http://dashscope-result-wlcb.oss-cn-wulanchabu.aliyuncs.com/1d/50/20251204/f87e520c/f509eddf-f8d5-4424-8bf0-725d8cd8fb9c.wav?Expires=1764921942&OSSAccessKeyId=LTAI5tKPD3TMqf2Lna1fASuh&Signature=2FNuwsbjqvP1x11ZIr2iWDAPsAM%3D',
    avatar: '',
    supportedLanguages: ['中文(天津话)', ...STANDARD_LANGUAGES.slice(1)],
  },
  {
    value: 'Rocky',
    labelKey: 'ROCKY',
    descriptionKey: 'ROCKY_DESC',
    gender: 'male',
    language: 'dialect',
    dialect: '粤语',
    age: 'youth',
    scenarioKeys: ['companionChat', 'consumerElectronics'],
    previewUrl: 'http://dashscope-result-wlcb.oss-cn-wulanchabu.aliyuncs.com/1d/a7/20251204/f87e520c/67a983a0-784f-49c3-b9be-876cfdf99aad.wav?Expires=1764920927&OSSAccessKeyId=LTAI5tKPD3TMqf2Lna1fASuh&Signature=RNkrdKDEStd4gpMqehwc9%2FZFMCg%3D',
    avatar: '',
    supportedLanguages: ['中文(粤语)', ...STANDARD_LANGUAGES.slice(1)],
  },
  {
    value: 'Kiki',
    labelKey: 'KIKI',
    descriptionKey: 'KIKI_DESC',
    gender: 'female',
    language: 'dialect',
    dialect: '粤语',
    age: 'youth',
    scenarioKeys: ['companionChat', 'consumerElectronics'],
    previewUrl: 'http://dashscope-result-wlcb.oss-cn-wulanchabu.aliyuncs.com/1d/cf/20251204/f87e520c/627d2013-d1eb-45c5-8e1d-60a6bbe7f107.wav?Expires=1764922043&OSSAccessKeyId=LTAI5tKPD3TMqf2Lna1fASuh&Signature=rBQvtc0X7W2MbrCrJNcVXtXDBm8%3D',
    avatar: '',
    supportedLanguages: ['中文(粤语)', ...STANDARD_LANGUAGES.slice(1)],
  },
  {
    value: 'Eric',
    labelKey: 'ERIC',
    descriptionKey: 'ERIC_DESC',
    gender: 'male',
    language: 'dialect',
    dialect: '四川话',
    age: 'youth',
    scenarioKeys: ['companionChat', 'consumerElectronics'],
    previewUrl: 'http://dashscope-result-wlcb.oss-cn-wulanchabu.aliyuncs.com/1d/76/20251204/f87e520c/4217bfca-1cd0-44c9-a07e-41dcc43e4f52.wav?Expires=1764922084&OSSAccessKeyId=LTAI5tKPD3TMqf2Lna1fASuh&Signature=0bYVPfvY9ODaLLh4f9dJ%2FTVpgCo%3D',
    avatar: '',
    supportedLanguages: ['中文(四川话)', ...STANDARD_LANGUAGES.slice(1)],
  },
];

// 场景 key 到中文的映射（用于筛选）
const SCENARIO_KEY_TO_ZH: Record<string, string> = {
  companionChat: '陪伴聊天',
  voiceAssistant: '语音助手',
  consumerElectronics: '消费电子',
  customerService: '电话客服',
  audiobook: '有声书',
  shortVideo: '短视频配音',
  ecommerceLive: '电商直播',
};

// 根据翻译对象生成带 i18n 的 VOICE_DATA
const getVoiceData = (voicesT: any, scenariosT: any): VoiceOption[] => {
  return VOICE_DATA_BASE.map(voice => ({
    value: voice.value,
    label: voicesT?.[voice.labelKey] || voice.value,
    description: voicesT?.[voice.descriptionKey] || '',
    gender: voice.gender as 'male' | 'female' | 'neutral',
    language: voice.language as 'chinese' | 'english' | 'dialect' | 'minority',
    dialect: voice.dialect,
    age: voice.age as 'child' | 'youth' | 'middle' | 'elderly',
    scenario: voice.scenarioKeys.map(key => {
      // 优先使用翻译的场景名称，如果没有则使用中文映射
      const scenarioKey = scenariosT?.[key];
      return scenarioKey || SCENARIO_KEY_TO_ZH[key] || key;
    }),
    previewUrl: voice.previewUrl,
    avatar: voice.avatar,
    supportedLanguages: voice.supportedLanguages,
  }));
};

interface VoiceSelectModalProps {
  // 如果提供了 onVoiceChange，组件会渲染为按钮+模态框的组合
  // 如果提供了 isOpen 和 onClose，组件只渲染模态框（向后兼容）
  selectedVoice?: string;
  selectedVoiceData?: VoiceOption | null;
  onVoiceChange?: (voice: VoiceOption) => void;
  className?: string;
  label?: string;
  // 向后兼容的 props（如果提供了这些，就只渲染模态框）
  isOpen?: boolean;
  onClose?: () => void;
  onConfirm?: (voice: VoiceOption) => void;
  t?: any; // 翻译对象
}

const VoiceSelectModal: React.FC<VoiceSelectModalProps> = ({
  selectedVoice,
  selectedVoiceData,
  onVoiceChange,
  className = '',
  label,
  // 向后兼容的 props
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onConfirm: externalOnConfirm,
  t: externalT,
}) => {
  // 判断是按钮模式还是纯模态框模式
  const isButtonMode = !!onVoiceChange;
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // 使用内部状态或外部传入的状态
  const isOpen = isButtonMode ? internalIsOpen : (externalIsOpen ?? false);
  const handleClose = isButtonMode ? () => setInternalIsOpen(false) : (externalOnClose || (() => {}));
  
  // 获取翻译对象
  const { t: rootT } = useAppOutletContext();
  const ttsPageT = (rootT?.createPage as any)?.ttsPage || (translations['zh'].createPage as any).ttsPage;
  const modalT = externalT || (rootT?.createPage as any)?.ttsPage?.voiceSelectModal || 
                 (translations['zh'].createPage as any).ttsPage?.voiceSelectModal || {};
  
  // 类型断言，避免 TypeScript 类型检查错误
  const tAny = modalT as any;
  const [searchQuery, setSearchQuery] = useState('');
  
  // 生成带 i18n 的 VOICE_DATA
  const VOICE_DATA = useMemo(() => {
    return getVoiceData(ttsPageT?.voices, tAny?.scenarios);
  }, [ttsPageT?.voices, tAny?.scenarios]);
  
  // 获取当前选中音色的显示名称（按钮模式使用）
  const getCurrentVoiceLabel = () => {
    if (selectedVoiceData) {
      return selectedVoiceData.label;
    }
    if (selectedVoice) {
      // 如果没有 selectedVoiceData，尝试从翻译中获取
      const voiceKey = selectedVoice.toUpperCase();
      const voiceDesc = ttsPageT?.voices?.[`${voiceKey}_DESC`];
      const voiceName = ttsPageT?.voices?.[voiceKey] || selectedVoice;
      return voiceDesc ? `${voiceName} - ${voiceDesc}` : voiceName;
    }
    return label || ttsPageT?.voice || '选择音色';
  };
  
  // 处理确认（按钮模式）
  const handleVoiceConfirm = (voice: VoiceOption) => {
    if (isButtonMode && onVoiceChange) {
      onVoiceChange(voice);
      setInternalIsOpen(false);
    } else if (externalOnConfirm) {
      externalOnConfirm(voice);
    }
  };
  
  // 使用翻译对象获取选项，如果没有则使用默认中文
  const scenarios = useMemo(() => {
    if (tAny && tAny.scenarios) {
      return [
        tAny.scenarios.all || '全部场景',
        tAny.scenarios.customerService || '电话客服',
        tAny.scenarios.consumerElectronics || '消费电子',
        tAny.scenarios.audiobook || '有声书',
        tAny.scenarios.shortVideo || '短视频配音',
        tAny.scenarios.companionChat || '陪伴聊天',
        tAny.scenarios.voiceAssistant || '语音助手',
        tAny.scenarios.ecommerceLive || '电商直播',
      ];
    }
    return ['全部场景', '电话客服', '消费电子', '有声书', '短视频配音', '陪伴聊天', '语音助手', '电商直播'];
  }, [tAny]);

  const ages = useMemo(() => {
    if (tAny && tAny.ages) {
      return [
        tAny.ages.all || '全部年龄',
        tAny.ages.child || '儿童',
        tAny.ages.youth || '青年',
        tAny.ages.middle || '中年',
        tAny.ages.elderly || '老人',
      ];
    }
    return ['全部年龄', '儿童', '青年', '中年', '老人'];
  }, [tAny]);

  const genders = useMemo(() => {
    if (tAny && tAny.genders) {
      return [
        tAny.genders.all || '全部性别',
        tAny.genders.male || '男声',
        tAny.genders.female || '女声',
      ];
    }
    return ['全部性别', '男声', '女声'];
  }, [tAny]);
  
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [selectedAge, setSelectedAge] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [selectedVoiceValue, setSelectedVoiceValue] = useState<string | undefined>(selectedVoice);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // 处理语种选择
  const handleLanguageSelect = (lang: string) => {
    setSelectedLanguage(lang);
    setIsLanguageDropdownOpen(false);
  };

  // 当 selectedVoice prop 变化时更新内部状态
  useEffect(() => {
    setSelectedVoiceValue(selectedVoice);
  }, [selectedVoice]);

  // 初始化筛选器状态（只在组件挂载时）
  useEffect(() => {
    if (scenarios.length > 0 && !selectedScenario) {
      setSelectedScenario(scenarios[0]);
    }
    if (ages.length > 0 && !selectedAge) {
      setSelectedAge(ages[0]);
    }
    if (genders.length > 0 && !selectedGender) {
      setSelectedGender(genders[0]);
    }
    const defaultLanguage = (tAny && tAny.languages && tAny.languages.all) ? tAny.languages.all : '全部语言';
    if (!selectedLanguage) {
      setSelectedLanguage(defaultLanguage);
    }
  }, []); // 只在组件挂载时执行一次
  
  // 获取所有音色支持的语种（去重）
  const allSupportedLanguages = useMemo(() => {
    const langSet = new Set<string>();
    VOICE_DATA.forEach(voice => {
      voice.supportedLanguages.forEach(lang => {
        langSet.add(lang);
      });
    });
    return Array.from(langSet).sort((a, b) => {
      // 中文相关排在前面
      if (a.includes('中文') && !b.includes('中文')) return -1;
      if (!a.includes('中文') && b.includes('中文')) return 1;
      return a.localeCompare(b, 'zh-CN');
    });
  }, [VOICE_DATA]);
  
  // 当翻译对象变化时，如果当前选择不在新选项中，则重置为默认值
  useEffect(() => {
    if (scenarios.length > 0 && selectedScenario && !scenarios.includes(selectedScenario)) {
      setSelectedScenario(scenarios[0]);
    }
    if (ages.length > 0 && selectedAge && !ages.includes(selectedAge)) {
      setSelectedAge(ages[0]);
    }
    if (genders.length > 0 && selectedGender && !genders.includes(selectedGender)) {
      setSelectedGender(genders[0]);
    }
    const defaultLanguage = (tAny && tAny.languages && tAny.languages.all) ? tAny.languages.all : '全部语言';
    // 检查当前选择的语言是否在新的语言选项中
    const isValidLanguage = selectedLanguage === defaultLanguage || 
      (tAny?.languages && Object.values(tAny.languages).includes(selectedLanguage)) ||
      allSupportedLanguages.includes(selectedLanguage);
    if (!isValidLanguage && defaultLanguage) {
      setSelectedLanguage(defaultLanguage);
    }
  }, [scenarios, ages, genders, tAny, allSupportedLanguages, selectedScenario, selectedAge, selectedGender, selectedLanguage]);

  // 中文方言（带括号的）
  const chineseDialects = useMemo(() => {
    return allSupportedLanguages.filter(lang => lang.includes('中文') && lang.includes('('));
  }, [allSupportedLanguages]);

  // 其他语言（除了标准中文和英语，包括中文方言）
  const otherLanguages = useMemo(() => {
    return allSupportedLanguages.filter(lang => {
      return lang !== '中文' && lang !== '英语';
    });
  }, [allSupportedLanguages]);

  // 筛选和搜索音色
  const filteredVoices = useMemo(() => {
    return VOICE_DATA.filter(voice => {
      // 搜索过滤
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !voice.label.toLowerCase().includes(query) &&
          !voice.description.toLowerCase().includes(query) &&
          !voice.value.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // 场景过滤
      const allScenariosKey = (tAny && tAny.scenarios && tAny.scenarios.all) ? tAny.scenarios.all : '全部场景';
      if (selectedScenario && selectedScenario !== allScenariosKey) {
        // VOICE_DATA 中的 scenario 已经是翻译后的文本，直接比较即可
        if (!voice.scenario.includes(selectedScenario)) {
          return false;
        }
      }

      // 年龄过滤
      const allAgesKey = (tAny && tAny.ages && tAny.ages.all) ? tAny.ages.all : '全部年龄';
      if (selectedAge && selectedAge !== allAgesKey) {
        const ageMap: Record<string, string> = {
          [(tAny && tAny.ages && tAny.ages.child) ? tAny.ages.child : '儿童']: 'child',
          [(tAny && tAny.ages && tAny.ages.youth) ? tAny.ages.youth : '青年']: 'youth',
          [(tAny && tAny.ages && tAny.ages.middle) ? tAny.ages.middle : '中年']: 'middle',
          [(tAny && tAny.ages && tAny.ages.elderly) ? tAny.ages.elderly : '老人']: 'elderly',
        };
        const ageValue = ageMap[selectedAge];
        if (ageValue && voice.age !== ageValue) {
          return false;
        }
      }

      // 性别过滤
      const allGendersKey = (tAny && tAny.genders && tAny.genders.all) ? tAny.genders.all : '全部性别';
      if (selectedGender && selectedGender !== allGendersKey) {
        const genderMap: Record<string, string> = {
          [(tAny && tAny.genders && tAny.genders.male) ? tAny.genders.male : '男声']: 'male',
          [(tAny && tAny.genders && tAny.genders.female) ? tAny.genders.female : '女声']: 'female',
        };
        const genderValue = genderMap[selectedGender];
        if (genderValue && voice.gender !== genderValue) {
          return false;
        }
      }

      // 语言过滤 - 根据音色支持的语种列表进行筛选
      const allLanguagesKey = (tAny && tAny.languages && tAny.languages.all) ? tAny.languages.all : '全部语言';
      if (selectedLanguage && selectedLanguage !== allLanguagesKey) {
        // 如果选择的是"中文"，匹配所有中文相关的语种（包括方言）
        const chineseKey = (tAny && tAny.languages && tAny.languages.chinese) ? tAny.languages.chinese : '中文';
        if (selectedLanguage === chineseKey) {
          const hasChinese = voice.supportedLanguages.some(lang => lang.includes('中文'));
          if (!hasChinese) {
            return false;
          }
        } else {
          // 其他语种精确匹配（需要将翻译的语言名称映射回原始中文）
          const languageMap: Record<string, string> = {
            [(tAny && tAny.languages && tAny.languages.chinese) ? tAny.languages.chinese : '中文']: '中文',
            [(tAny && tAny.languages && tAny.languages.english) ? tAny.languages.english : '英语']: '英语',
            [(tAny && tAny.languages && tAny.languages.french) ? tAny.languages.french : '法语']: '法语',
            [(tAny && tAny.languages && tAny.languages.german) ? tAny.languages.german : '德语']: '德语',
            [(tAny && tAny.languages && tAny.languages.russian) ? tAny.languages.russian : '俄语']: '俄语',
            [(tAny && tAny.languages && tAny.languages.italian) ? tAny.languages.italian : '意大利语']: '意大利语',
            [(tAny && tAny.languages && tAny.languages.spanish) ? tAny.languages.spanish : '西班牙语']: '西班牙语',
            [(tAny && tAny.languages && tAny.languages.portuguese) ? tAny.languages.portuguese : '葡萄牙语']: '葡萄牙语',
            [(tAny && tAny.languages && tAny.languages.japanese) ? tAny.languages.japanese : '日语']: '日语',
            [(tAny && tAny.languages && tAny.languages.korean) ? tAny.languages.korean : '韩语']: '韩语',
          };
          const originalLanguage = languageMap[selectedLanguage] || selectedLanguage;
          if (!voice.supportedLanguages.includes(originalLanguage)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [searchQuery, selectedScenario, selectedAge, selectedGender, selectedLanguage, VOICE_DATA, tAny]);


  // 播放/暂停音色预览
  const togglePlay = (voice: VoiceOption) => {
    if (playingVoice === voice.value) {
      // 暂停当前播放
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingVoice(null);
    } else {
      // 停止之前的播放
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // 如果有预览URL，播放音频
      if (voice.previewUrl) {
        const audio = new Audio(voice.previewUrl);
        audioRef.current = audio;
        setPlayingVoice(voice.value);

        audio.addEventListener('ended', () => {
          setPlayingVoice(null);
          audioRef.current = null;
        });

        audio.addEventListener('error', () => {
          setPlayingVoice(null);
          audioRef.current = null;
        });

        audio.play().catch(err => {
          console.error('播放失败:', err);
          setPlayingVoice(null);
          audioRef.current = null;
        });
      } else {
        // 如果没有预览URL，只显示播放状态（后续填充OSS链接后会播放）
        setPlayingVoice(voice.value);
        setTimeout(() => {
          setPlayingVoice(null);
        }, 1000);
      }
    }
  };

  // 清理音频资源
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 处理确定
  const handleConfirm = () => {
    if (selectedVoiceValue) {
      const voice = VOICE_DATA.find(v => v.value === selectedVoiceValue);
      if (voice) {
        handleVoiceConfirm(voice);
      }
    }
    handleClose();
  };

  // 如果只是按钮模式，渲染按钮+模态框
  if (isButtonMode) {
    return (
      <>
        <button
          onClick={() => setInternalIsOpen(true)}
          className={`voice-select-button ${className}`}
        >
          <div className="voice-select-content">
            <div className="voice-select-icon">
              <User size={18} />
            </div>
            <div className="voice-select-text">
              <span className="voice-select-label">{getCurrentVoiceLabel()}</span>
              {selectedVoiceData && (
                <span className="voice-select-desc">{selectedVoiceData.description}</span>
              )}
            </div>
          </div>
          <ChevronDown size={20} className="voice-select-arrow" />
        </button>

        <BaseModal
          isOpen={isOpen}
          onClose={handleClose}
          title={(tAny && tAny.title) ? tAny.title : "选择音色"}
          width="max-w-6xl"
        >
      <div className="flex flex-col h-full">

        {/* 搜索栏 */}
        {/* <div className="mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="搜索音色"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
        </div> */}

        {/* 筛选器 */}
        <div className="mb-5 space-y-3">
          {/* 场景 */}
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              {(tAny && tAny.labels && tAny.labels.scenario) ? tAny.labels.scenario : '场景'}
            </div>
            <div className="flex flex-wrap gap-2">
              {scenarios.map((scenario) => (
                <button
                  key={scenario}
                  onClick={() => setSelectedScenario(scenario)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                    selectedScenario === scenario
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {scenario}
                </button>
              ))}
            </div>
          </div>

          {/* 年龄 */}
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              {(tAny && tAny.labels && tAny.labels.age) ? tAny.labels.age : '年龄'}
            </div>
            <div className="flex flex-wrap gap-2">
              {ages.map((age) => (
                <button
                  key={age}
                  onClick={() => setSelectedAge(age)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                    selectedAge === age
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          {/* 性别 */}
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              {(tAny && tAny.labels && tAny.labels.gender) ? tAny.labels.gender : '性别'}
            </div>
            <div className="flex flex-wrap gap-2">
              {genders.map((gender) => (
                <button
                  key={gender}
                  onClick={() => setSelectedGender(gender)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                    selectedGender === gender
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>

          {/* 语言 */}
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              {(tAny && tAny.labels && tAny.labels.supportedLanguages) ? tAny.labels.supportedLanguages : '可生成对应语种语言'}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {/* 全部语言 */}
              <button
                onClick={() => handleLanguageSelect((tAny && tAny.languages && tAny.languages.all) ? tAny.languages.all : '全部语言')}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                  selectedLanguage === ((tAny && tAny.languages && tAny.languages.all) ? tAny.languages.all : '全部语言')
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {(tAny && tAny.languages && tAny.languages.all) ? tAny.languages.all : '全部语言'}
              </button>
              
              {/* 中文 */}
              <button
                onClick={() => handleLanguageSelect((tAny && tAny.languages && tAny.languages.chinese) ? tAny.languages.chinese : '中文')}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                  selectedLanguage === ((tAny && tAny.languages && tAny.languages.chinese) ? tAny.languages.chinese : '中文') || chineseDialects.includes(selectedLanguage)
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {(tAny && tAny.languages && tAny.languages.chinese) ? tAny.languages.chinese : '中文'}
              </button>
              
              {/* 英语 */}
              <button
                onClick={() => handleLanguageSelect((tAny && tAny.languages && tAny.languages.english) ? tAny.languages.english : '英语')}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                  selectedLanguage === ((tAny && tAny.languages && tAny.languages.english) ? tAny.languages.english : '英语')
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {(tAny && tAny.languages && tAny.languages.english) ? tAny.languages.english : '英语'}
              </button>
              
              {/* 其他语言下拉 */}
              {otherLanguages.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                    className="px-3 py-1.5 rounded-full text-xs transition-all bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-1"
                  >
                    {(tAny && tAny.languages && tAny.languages.other) ? tAny.languages.other : '其他'}
                    {isLanguageDropdownOpen ? (
                      <ChevronUp size={12} />
                    ) : (
                      <ChevronDown size={12} />
                    )}
                  </button>
                  
                  {isLanguageDropdownOpen && (
                    <>
                      {/* 点击外部关闭下拉 */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsLanguageDropdownOpen(false)}
                      />
                      {/* 下拉菜单 */}
                      <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto min-w-[150px]">
                        <div className="p-2">
                          {/* 中文方言分组 */}
                          {chineseDialects.length > 0 && (
                            <>
                              <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 mb-1">
                                {(tAny && tAny.languages && tAny.languages.chineseDialects) ? tAny.languages.chineseDialects : '中文方言'}
                              </div>
                              {chineseDialects.map((lang) => (
                                <button
                                  key={lang}
                                  onClick={() => handleLanguageSelect(lang)}
                                  className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${
                                    selectedLanguage === lang
                                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                  }`}
                                >
                                  {lang}
                                </button>
                              ))}
                              {otherLanguages.filter(lang => !lang.includes('中文')).length > 0 && (
                                <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 mt-1 mb-1">
                                  {(tAny && tAny.languages && tAny.languages.otherLanguages) ? tAny.languages.otherLanguages : '其他语言'}
                                </div>
                              )}
                            </>
                          )}
                          {/* 其他语言 */}
                          {otherLanguages.filter(lang => !lang.includes('中文')).map((lang) => (
                            <button
                              key={lang}
                              onClick={() => handleLanguageSelect(lang)}
                              className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${
                                selectedLanguage === lang
                                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 音色卡片网格 */}
        <div className="flex-1 overflow-y-auto mb-4">
          {filteredVoices.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {(tAny && tAny.noResults) ? tAny.noResults : '没有找到匹配的音色'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {filteredVoices.map((voice) => (
                <div
                  key={voice.value}
                  onClick={() => setSelectedVoiceValue(voice.value)}
                  className={`relative p-3 rounded-lg border-2 transition-all cursor-pointer bg-white dark:bg-gray-800 flex items-center ${
                    selectedVoiceValue === voice.value
                      ? 'border-indigo-500 dark:border-indigo-400 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm'
                  }`}
                >
                  {/* 音色信息 */}
                  <div className="flex-1 pr-8">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{voice.label}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {voice.gender === 'male' ? ((tAny && tAny.genders && tAny.genders.male) ? tAny.genders.male : '男') : voice.gender === 'female' ? ((tAny && tAny.genders && tAny.genders.female) ? tAny.genders.female : '女') : ((tAny && tAny.genders && tAny.genders.neutral) ? tAny.genders.neutral : '中性')} {' '}
                      {voice.age === 'child' ? ((tAny && tAny.ages && tAny.ages.child) ? tAny.ages.child : '儿童') : voice.age === 'youth' ? ((tAny && tAny.ages && tAny.ages.youth) ? tAny.ages.youth : '青年') : voice.age === 'middle' ? ((tAny && tAny.ages && tAny.ages.middle) ? tAny.ages.middle : '中年') : ((tAny && tAny.ages && tAny.ages.elderly) ? tAny.ages.elderly : '老人')} {' '}
                      {voice.description}
                    </p>
                  </div>

                  {/* 播放按钮 - 垂直居中 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay(voice);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 flex items-center justify-center transition-colors group"
                  >
                    {playingVoice === voice.value ? (
                      <Pause size={14} className="text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Play size={14} className="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 ml-0.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 -mx-6 px-6">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            {(tAny && tAny.buttons && tAny.buttons.cancel) ? tAny.buttons.cancel : '取消'}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedVoiceValue}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
          >
            {(tAny && tAny.buttons && tAny.buttons.confirm) ? tAny.buttons.confirm : '确定'}
          </button>
        </div>
      </div>
    </BaseModal>
      </>
    );
  }

  // 纯模态框模式（向后兼容）
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={(tAny && tAny.title) ? tAny.title : "选择音色"}
      width="max-w-6xl"
    >
      <div className="flex flex-col h-full">

        {/* 搜索栏 */}
        {/* <div className="mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="搜索音色"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
        </div> */}

        {/* 筛选器 */}
        <div className="mb-5 space-y-3">
          {/* 场景 */}
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              {(tAny && tAny.labels && tAny.labels.scenario) ? tAny.labels.scenario : '场景'}
            </div>
            <div className="flex flex-wrap gap-2">
              {scenarios.map((scenario) => (
                <button
                  key={scenario}
                  onClick={() => setSelectedScenario(scenario)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                    selectedScenario === scenario
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {scenario}
                </button>
              ))}
            </div>
          </div>

          {/* 年龄 */}
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              {(tAny && tAny.labels && tAny.labels.age) ? tAny.labels.age : '年龄'}
            </div>
            <div className="flex flex-wrap gap-2">
              {ages.map((age) => (
                <button
                  key={age}
                  onClick={() => setSelectedAge(age)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                    selectedAge === age
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          {/* 性别 */}
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              {(tAny && tAny.labels && tAny.labels.gender) ? tAny.labels.gender : '性别'}
            </div>
            <div className="flex flex-wrap gap-2">
              {genders.map((gender) => (
                <button
                  key={gender}
                  onClick={() => setSelectedGender(gender)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                    selectedGender === gender
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>

          {/* 语言 */}
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              {(tAny && tAny.labels && tAny.labels.supportedLanguages) ? tAny.labels.supportedLanguages : '可生成对应语种语言'}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {/* 全部语言 */}
              <button
                onClick={() => handleLanguageSelect((tAny && tAny.languages && tAny.languages.all) ? tAny.languages.all : '全部语言')}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                  selectedLanguage === ((tAny && tAny.languages && tAny.languages.all) ? tAny.languages.all : '全部语言')
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {(tAny && tAny.languages && tAny.languages.all) ? tAny.languages.all : '全部语言'}
              </button>
              
              {/* 中文 */}
              <button
                onClick={() => handleLanguageSelect((tAny && tAny.languages && tAny.languages.chinese) ? tAny.languages.chinese : '中文')}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                  selectedLanguage === ((tAny && tAny.languages && tAny.languages.chinese) ? tAny.languages.chinese : '中文') || chineseDialects.includes(selectedLanguage)
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {(tAny && tAny.languages && tAny.languages.chinese) ? tAny.languages.chinese : '中文'}
              </button>
              
              {/* 英语 */}
              <button
                onClick={() => handleLanguageSelect((tAny && tAny.languages && tAny.languages.english) ? tAny.languages.english : '英语')}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                  selectedLanguage === ((tAny && tAny.languages && tAny.languages.english) ? tAny.languages.english : '英语')
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {(tAny && tAny.languages && tAny.languages.english) ? tAny.languages.english : '英语'}
              </button>
              
              {/* 其他语言下拉 */}
              {otherLanguages.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                    className="px-3 py-1.5 rounded-full text-xs transition-all bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-1"
                  >
                    {(tAny && tAny.languages && tAny.languages.other) ? tAny.languages.other : '其他'}
                    {isLanguageDropdownOpen ? (
                      <ChevronUp size={12} />
                    ) : (
                      <ChevronDown size={12} />
                    )}
                  </button>
                  
                  {isLanguageDropdownOpen && (
                    <>
                      {/* 点击外部关闭下拉 */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsLanguageDropdownOpen(false)}
                      />
                      {/* 下拉菜单 */}
                      <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto min-w-[150px]">
                        <div className="p-2">
                          {/* 中文方言分组 */}
                          {chineseDialects.length > 0 && (
                            <>
                              <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 mb-1">
                                {(tAny && tAny.languages && tAny.languages.chineseDialects) ? tAny.languages.chineseDialects : '中文方言'}
                              </div>
                              {chineseDialects.map((lang) => (
                                <button
                                  key={lang}
                                  onClick={() => handleLanguageSelect(lang)}
                                  className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${
                                    selectedLanguage === lang
                                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                  }`}
                                >
                                  {lang}
                                </button>
                              ))}
                              {otherLanguages.filter(lang => !lang.includes('中文')).length > 0 && (
                                <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 mt-1 mb-1">
                                  {(tAny && tAny.languages && tAny.languages.otherLanguages) ? tAny.languages.otherLanguages : '其他语言'}
                                </div>
                              )}
                            </>
                          )}
                          {/* 其他语言 */}
                          {otherLanguages.filter(lang => !lang.includes('中文')).map((lang) => (
                            <button
                              key={lang}
                              onClick={() => handleLanguageSelect(lang)}
                              className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${
                                selectedLanguage === lang
                                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 音色卡片网格 */}
        <div className="flex-1 overflow-y-auto mb-4">
          {filteredVoices.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {(tAny && tAny.noResults) ? tAny.noResults : '没有找到匹配的音色'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {filteredVoices.map((voice) => (
                <div
                  key={voice.value}
                  onClick={() => setSelectedVoiceValue(voice.value)}
                  className={`relative p-3 rounded-lg border-2 transition-all cursor-pointer bg-white dark:bg-gray-800 flex items-center ${
                    selectedVoiceValue === voice.value
                      ? 'border-indigo-500 dark:border-indigo-400 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm'
                  }`}
                >
                  {/* 音色信息 */}
                  <div className="flex-1 pr-8">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{voice.label}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {voice.gender === 'male' ? ((tAny && tAny.genders && tAny.genders.male) ? tAny.genders.male : '男') : voice.gender === 'female' ? ((tAny && tAny.genders && tAny.genders.female) ? tAny.genders.female : '女') : ((tAny && tAny.genders && tAny.genders.neutral) ? tAny.genders.neutral : '中性')} {' '}
                      {voice.age === 'child' ? ((tAny && tAny.ages && tAny.ages.child) ? tAny.ages.child : '儿童') : voice.age === 'youth' ? ((tAny && tAny.ages && tAny.ages.youth) ? tAny.ages.youth : '青年') : voice.age === 'middle' ? ((tAny && tAny.ages && tAny.ages.middle) ? tAny.ages.middle : '中年') : ((tAny && tAny.ages && tAny.ages.elderly) ? tAny.ages.elderly : '老人')} {' '}
                      {voice.description}
                    </p>
                  </div>

                  {/* 播放按钮 - 垂直居中 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay(voice);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 flex items-center justify-center transition-colors group"
                  >
                    {playingVoice === voice.value ? (
                      <Pause size={14} className="text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Play size={14} className="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 ml-0.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 -mx-6 px-6">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            {(tAny && tAny.buttons && tAny.buttons.cancel) ? tAny.buttons.cancel : '取消'}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedVoiceValue}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
          >
            {(tAny && tAny.buttons && tAny.buttons.confirm) ? tAny.buttons.confirm : '确定'}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default VoiceSelectModal;

