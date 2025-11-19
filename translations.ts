
import { NavItem } from './types';

interface Translation {
  header: {
    searchPlaceholder: string;
    signIn: string;
    nav: NavItem[];
  };
  hero: {
    status: string;
    titlePrefix: string;
    titleSuffix: string;
    description: string;
    getStarted: string;
    viewPricing: string;
  };
  modelList: {
    explore: string;
    searchPlaceholder: string;
    headers: {
      model: string;
      context: string;
      inputCost: string;
      outputCost: string;
    };
    noResults: string;
    free: string;
    new: string;
  };
  modelSquare: {
    title: string;
    totalModels: string;
    filterSearch: string;
    filters: {
      searchPlaceholder: string;
      nameLabel: string;
      vendorLabel: string;
      capabilityLabel: string;
      billingLabel: string;
      displayLabel: string;
      all: string;
      reset: string;
      hideFilters: string;
    };
    display: {
      currency: string;
      unit: string;
    };
    card: {
      new: string;
      perMillion: string;
      perSecond: string;
      actions: {
        calculate: string;
        chat: string;
      };
    }
  };
  createPage: {
    greeting: string;
    greetingSuffix: string;
    inputPlaceholder: string;
    send: string;
    upload: string;
    sideMenu: {
      home: string;
      modelCenter: string;
      creationCenter: string;
      personalCenter: string;
      // Model Center items
      aiExperience: string;
      modelSquare: string;
      apiKeys: string;
      apiDocs: string;
      // Creation Center items
      viralVideo: string;
      digitalHuman: string;
      imgToVideo: string;
      textToImage: string;
      styleTransfer: string;
      voiceClone: string;
      workshop: string;
      // Personal Center items
      assets: string;
      pricing: string;
      expenses: string;
    };
    shortcuts: {
      video: string;
      videoDesc: string;
      avatar: string;
      avatarDesc: string;
      transform: string;
      transformDesc: string;
      sketch: string;
      sketchDesc: string;
      inpainting: string;
      inpaintingDesc: string;
    };
    tabs: string[];
    textToImage: {
      title: string;
      subtitle: string;
      inputLabel: string;
      inputPlaceholder: string;
      aiPolish: string;
      settingsTitle: string;
      aspectRatio: string;
      generateConfig: string;
      generate: string;
      resultTitle: string;
      emptyState: string;
      ratios: {
        square: string;
        landscape43: string;
        portrait34: string;
        widescreen: string;
        mobile: string;
        photo: string;
      }
    };
  };
  chatPage: {
    settingsTitle: string;
    selectModel: string;
    paramsTitle: string;
    temperature: string;
    temperatureDesc: string;
    presencePenalty: string;
    presencePenaltyDesc: string;
    shortcutsTitle: string;
    actions: {
      clear: string;
      save: string;
      new: string;
      refresh: string;
    };
    historyTitle: string;
    noHistory: string;
    mainTitle: string;
    statusReady: string;
    inputPlaceholder: string;
    send: string;
    welcomeMessage: string;
    footerTip: string;
    
  };
  keysPage: {
    title: string;
    createButton: string;
    labels: {
      limit: string;
      remaining: string;
      used: string;
      expires: string;
      status: string;
    };
    values: {
      unlimited: string;
      never: string;
    };
    actions: {
      disable: string;
      enable: string;
      delete: string;
      edit: string;
    };
    status: {
      active: string;
      disabled: string;
    }
  };
  expensesPage: {
    title: string;
    subtitle: string;
    balanceLabel: string;
    convertPoints: string;
    buttons: {
      points: string;
      balance: string;
      freeMember: string;
      refresh: string;
    };
    recordsTitle: string;
    refreshData: string;
    record: {
      type: string;
      duration: string;
      input: string;
      output: string;
      consumption: string;
    }
  };
  pricingPage: {
    title: string;
    subtitle: string;
    paymentCycle: string;
    questions: string;
    paymentMethod: string;
    wechatPay: string;
    invoice: string;
    invoiceLabel: string;
    starter: {
      title: string;
      features: string[];
    };
    business: {
      title: string;
      features: string[];
    };
    enterprise: {
      title: string;
      slogan: string;
      features: string[];
    };
    labels: {
      credits: string;
      quantity: string;
      custom: string;
      buy: string;
      contact: string;
    }
  };
  assetsPage: {
    title: string;
    subtitle: string;
    filterSearch: string;
    searchName: string;
    namePlaceholder: string;
    searchType: string;
    chooseType: string;
    searchTag: string;
    tagPlaceholder: string;
    searchDesc: string;
    descPlaceholder: string;
    search: string;
    reset: string;
    newFolder: string;
    upload: string;
    move: string;
    delete: string;
    selectAll: string;
    totalFolders: string;
    totalFiles: string;
    searchInResult: string;
  };
  footer: {
    privacy: string;
    terms: string;
    twitter: string;
    discord: string;
  };
  auth: {
    loginTitle: string;
    tabPassword: string;
    tabPhone: string;
    accountLabel: string;
    accountPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    codeLabel: string;
    codePlaceholder: string;
    sendCode: string;
    codeSent: string;
    signIn: string;
  };
}

export const translations: Record<string, Translation> = {
  en: {
    header: {
      searchPlaceholder: 'Search models...',
      signIn: 'Sign in',
      nav: [
        { label: 'Docs', href: '#' },
        { label: 'Create', href: '#create' },
        { label: 'Keys', href: '#keys' },
        { label: 'Activity', href: '#' },
        { label: 'Credits', href: '#expenses' },
      ]
    },
    hero: {
      status: 'All systems operational',
      titlePrefix: 'Unified Interface',
      titleSuffix: 'for LLMs',
      description: 'Access the best models from OpenAI, Anthropic, Google, Meta, and more through a single, standardized API. The lowest prices, best latency.',
      getStarted: 'Get Started',
      viewPricing: 'View Pricing'
    },
    modelList: {
      explore: 'Explore Models',
      searchPlaceholder: 'Filter by name, provider, or tag...',
      headers: {
        model: 'Model',
        context: 'Context',
        inputCost: 'Input Cost',
        outputCost: 'Output Cost'
      },
      noResults: 'No models found matching',
      free: 'FREE',
      new: 'NEW'
    },
    modelSquare: {
      title: 'Model Plaza',
      totalModels: 'models',
      filterSearch: 'Filter Search',
      filters: {
        searchPlaceholder: 'Search model path or name',
        nameLabel: 'Model Name',
        vendorLabel: 'Series/Vendor',
        capabilityLabel: 'Capability Tag',
        billingLabel: 'Billing Type',
        displayLabel: 'Display Settings',
        all: 'All',
        reset: 'Reset',
        hideFilters: 'Hide Filters',
      },
      display: {
        currency: 'Currency',
        unit: 'Unit',
      },
      card: {
        new: 'New',
        perMillion: '1M tokens',
        perSecond: 'sec',
        actions: {
          calculate: 'Calculate',
          chat: 'Chat',
        }
      }
    },
    createPage: {
      greeting: 'Hi! What do you want to',
      greetingSuffix: 'create today?',
      inputPlaceholder: 'Describe the image you want to generate...',
      send: 'Generate',
      upload: 'Upload',
      sideMenu: {
        home: 'Home',
        modelCenter: 'Model Center',
        creationCenter: 'Creation Center',
        personalCenter: 'Personal Center',
        aiExperience: 'AI Experience',
        modelSquare: 'Model Square',
        apiKeys: 'API Keys',
        apiDocs: 'API Docs',
        viralVideo: 'Viral Video',
        digitalHuman: 'Digital Human',
        imgToVideo: 'Image to Video',
        textToImage: 'Text to Image',
        styleTransfer: 'Style Transfer',
        voiceClone: 'Voice Cloning',
        workshop: 'Workshop',
        assets: 'Assets',
        pricing: 'Pricing',
        expenses: 'My Expenses'
      },
      shortcuts: {
        video: 'AI Viral Video',
        videoDesc: 'Create scripts & videos',
        avatar: 'Product Avatar',
        avatarDesc: 'Digital humans for products',
        transform: 'Style Transfer',
        transformDesc: 'Transform object styles',
        sketch: 'Sketch to Image',
        sketchDesc: 'Turn sketches into art',
        inpainting: 'AI Inpainting',
        inpaintingDesc: 'Remove or replace objects'
      },
      tabs: ['All', 'Characters', 'Animals', 'Anime', 'Creative', 'Food', 'Scenery', 'Product'],
      textToImage: {
        title: 'AI Image Generation',
        subtitle: 'Generate exquisite images from text descriptions',
        inputLabel: 'Text Description',
        inputPlaceholder: 'Describe the image you want to generate, e.g., A cute little cat in a sunlit garden...',
        aiPolish: 'AI Polish',
        settingsTitle: 'Generation Settings',
        aspectRatio: 'Image Size',
        generateConfig: 'Config',
        generate: 'Generate',
        resultTitle: 'Generation Result',
        emptyState: 'Enter description to start your AI art journey',
        ratios: {
          square: 'Square',
          landscape43: 'Landscape',
          portrait34: 'Portrait',
          widescreen: 'Widescreen',
          mobile: 'Mobile',
          photo: 'Photo'
        }
      }
    },
    chatPage: {
      settingsTitle: 'Dialogue Settings',
      selectModel: 'Select Model',
      paramsTitle: 'Parameters',
      temperature: 'Temperature',
      temperatureDesc: 'Controls randomness: higher is more creative.',
      presencePenalty: 'New Topic',
      presencePenaltyDesc: 'Encourage new topics: higher penalizes repetition.',
      shortcutsTitle: 'Shortcuts',
      actions: {
        clear: 'Clear Chat',
        save: 'Save Chat',
        new: 'New Chat',
        refresh: 'Refresh Record'
      },
      historyTitle: 'History',
      noHistory: 'No records yet',
      mainTitle: 'Dialogue Area',
      statusReady: 'Ready',
      inputPlaceholder: 'Enter your question... (Enter to send, Shift+Enter for newline)',
      send: 'Send',
      welcomeMessage: 'Hi! I am your AI assistant. How can I help you today?',
      footerTip: 'Disclaimer: Content is AI-generated. Accuracy not guaranteed.'
    },
    keysPage: {
      title: 'API Key Management',
      createButton: 'New API Key',
      labels: {
        limit: 'Total Limit',
        remaining: 'Remaining',
        used: 'Used',
        expires: 'Expires',
        status: 'Status'
      },
      values: {
        unlimited: 'Unlimited',
        never: 'Never'
      },
      actions: {
        disable: 'Disable',
        enable: 'Enable',
        delete: 'Delete',
        edit: 'Edit'
      },
      status: {
        active: 'Active',
        disabled: 'Disabled'
      }
    },
    expensesPage: {
      title: 'Credits/Balance Center',
      subtitle: 'View and manage your credit balance, understand credit usage',
      balanceLabel: 'Balance',
      convertPoints: 'Convertible Points',
      buttons: {
        points: 'Points',
        balance: 'Balance',
        freeMember: 'Free Member',
        refresh: 'Refresh',
      },
      recordsTitle: 'Usage Records',
      refreshData: 'Refresh Data',
      record: {
        type: 'Type',
        duration: 'Time',
        input: 'Input',
        output: 'Output',
        consumption: 'Consumption'
      }
    },
    pricingPage: {
      title: 'Pricing List',
      subtitle: 'Choose the AI creative service package that suits you best and start your journey of intelligent content creation',
      paymentCycle: 'Payment Cycle Selection',
      questions: 'Questions about top-up? Click here',
      paymentMethod: 'Payment Method:',
      wechatPay: 'WeChat Pay',
      invoice: 'Issue Invoice:',
      invoiceLabel: '',
      starter: {
        title: 'Starter',
        features: [
          '¥ 1.72 / 1 Credit',
          'Flexible AI integration',
          'Out-of-the-box Large Model API+',
          'Multi-modal capabilities, covering multiple scenarios',
          'Unlimited video previews',
          '500+ digital humans and voices',
          'Unlimited preservation of digital assets',
          'Talking photo max video length 180s',
          'No Watermark',
          'Faster rendering speed'
        ]
      },
      business: {
        title: 'Business',
        features: [
           '¥ 1.59 / 1 Credit',
           'Flexible AI integration, Priority Channels',
           'Out-of-the-box Large Model API+',
           'Multi-modal capabilities, covering multiple scenarios',
           'Unlimited video previews',
           '500+ digital humans and voices',
           'Unlimited preservation of digital assets',
           'Talking photo max video length 1800s',
           'No Watermark',
           'Highest priority rendering speed'
        ]
      },
      enterprise: {
        title: 'Enterprise',
        slogan: "Let's talk!",
        features: [
          'Custom team seats',
          'Custom credit limits',
          'Custom digital humans',
          'Custom AI voices',
          'Custom functions',
          'Customized feature development'
        ]
      },
      labels: {
        credits: 'Available Credits:',
        quantity: 'Purchase Quantity',
        custom: 'Custom',
        buy: 'Buy Now',
        contact: 'Contact Us'
      }
    },
    assetsPage: {
      title: 'AI Assets Management',
      subtitle: 'Manage your video and image assets. Preview, edit, and batch operations.',
      filterSearch: 'Filter Search',
      searchName: 'Asset Name',
      namePlaceholder: 'Search name',
      searchType: 'Asset Type',
      chooseType: 'Choose type',
      searchTag: 'Asset Tag',
      tagPlaceholder: 'Search tag',
      searchDesc: 'Description',
      descPlaceholder: 'Search description',
      search: 'Search',
      reset: 'Reset',
      newFolder: 'New Folder',
      upload: 'Upload',
      move: 'Move',
      delete: 'Delete',
      selectAll: 'Select All',
      totalFolders: 'Folders',
      totalFiles: 'Files',
      searchInResult: 'Search in result',
    },
    footer: {
      privacy: 'Privacy',
      terms: 'Terms',
      twitter: 'Twitter',
      discord: 'Discord'
    },
    auth: {
      loginTitle: 'Welcome Back',
      tabPassword: 'Password',
      tabPhone: 'Phone',
      accountLabel: 'Email or Username',
      accountPlaceholder: 'Enter your email',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      phoneLabel: 'Phone Number',
      phonePlaceholder: 'Enter phone number',
      codeLabel: 'Verification Code',
      codePlaceholder: '6-digit code',
      sendCode: 'Send Code',
      codeSent: 'Sent!',
      signIn: 'Sign In'
    }
  },
  zh: {
    header: {
      searchPlaceholder: '搜索模型...',
      signIn: '登录',
      nav: [
        { label: '文档', href: '#' },
        { label: '创作', href: '#create' },
        { label: '密钥', href: '#keys' },
        { label: '活动', href: '#' },
        { label: '积分', href: '#expenses' },
      ]
    },
    hero: {
      status: '系统运行正常',
      titlePrefix: '统一的 LLM',
      titleSuffix: '接口平台',
      description: '通过统一的标准 API 访问 OpenAI、Anthropic、Google、Meta 等公司的顶尖模型。最低的价格，最优的延迟。',
      getStarted: '开始使用',
      viewPricing: '查看定价'
    },
    modelList: {
      explore: '探索模型',
      searchPlaceholder: '按名称、提供商或标签筛选...',
      headers: {
        model: '模型',
        context: '上下文',
        inputCost: '输入价格',
        outputCost: '输出价格'
      },
      noResults: '未找到匹配的模型',
      free: '免费',
      new: '新'
    },
    modelSquare: {
      title: '模型广场',
      totalModels: '个模型',
      filterSearch: '筛选搜索',
      filters: {
        searchPlaceholder: '搜索模型路径或显示名',
        nameLabel: '模型名称',
        vendorLabel: '系列/厂商',
        capabilityLabel: '能力标签',
        billingLabel: '计费类型',
        displayLabel: '显示设置',
        all: '全部',
        reset: '重置',
        hideFilters: '隐藏筛选',
      },
      display: {
        currency: '货币:',
        unit: '单位:',
      },
      card: {
        new: '新发布',
        perMillion: '/ 1M tokens',
        perSecond: '/ 秒',
        actions: {
          calculate: '按量计费',
          chat: '对话',
        }
      }
    },
    createPage: {
      greeting: 'Hi! 今天想',
      greetingSuffix: '创作些什么?',
      inputPlaceholder: '描述您想要生成的图片...',
      send: '发送',
      upload: '上传',
      sideMenu: {
        home: '首页',
        modelCenter: '模型中心',
        creationCenter: '创作中心',
        personalCenter: '个人中心',
        aiExperience: 'AI体验',
        modelSquare: '模型广场',
        apiKeys: 'API密钥',
        apiDocs: 'API操作文档',
        viralVideo: 'AI混剪视频',
        digitalHuman: '数字人视频',
        imgToVideo: '图生视频',
        textToImage: 'AI生图',
        styleTransfer: '万物迁移',
        voiceClone: '声音克隆',
        workshop: '创作工坊',
        assets: '素材管理',
        pricing: '定价列表',
        expenses: '我的费用'
      },
      shortcuts: {
        video: 'AI混剪爆款视频',
        videoDesc: 'AI绘制脚本创建营销视频',
        avatar: '产品 + AI数字人',
        avatarDesc: 'AI图片赋形，让产品在数字人手中',
        transform: '万物迁移',
        transformDesc: 'AI智能笔触勾勒产品跨场景展示',
        sketch: 'AI生图',
        sketchDesc: 'AI将文字描述或图片生成精美图像',
        inpainting: '万物编辑',
        inpaintingDesc: 'AI智能图像编辑，支持涂抹消除'
      },
      tabs: ['全部', '人物', '宠物', '动漫', '创意', '食物', '风景', '产品', '电商'],
      textToImage: {
        title: 'AI生图',
        subtitle: '通过输入文字描述，让AI为您生成精美的图片作品',
        inputLabel: '文字描述',
        inputPlaceholder: '描述您想要生成的图片，例如：一只可爱的小猫坐在阳光下的花园里，周围开满了五颜六色的花朵，画风唯美，光线柔和...',
        aiPolish: 'AI润色',
        settingsTitle: '生成设置',
        aspectRatio: '图片尺寸',
        generateConfig: '生成配置',
        generate: '立即生成',
        resultTitle: '生成结果',
        emptyState: '输入描述文字，开始您的AI艺术创作之旅',
        ratios: {
          square: '正方形',
          landscape43: '横屏',
          portrait34: '竖屏',
          widescreen: '宽屏',
          mobile: '竖屏',
          photo: '摄影'
        }
      }
    },
    chatPage: {
      settingsTitle: '对话设置',
      selectModel: '选择模型',
      paramsTitle: '参数设置',
      temperature: '温度',
      temperatureDesc: '控制输出的随机性和创造性，值越高越有创意',
      presencePenalty: '新话题',
      presencePenaltyDesc: '鼓励讨论新话题，负值减少新话题，正值增加新话题',
      shortcutsTitle: '快捷操作',
      actions: {
        clear: '清空对话',
        save: '保存对话',
        new: '新建对话',
        refresh: '刷新记录'
      },
      historyTitle: '历史对话',
      noHistory: '暂无记录',
      mainTitle: '对话区域',
      statusReady: '准备就绪',
      inputPlaceholder: '输入您的问题... (Enter发送，Shift+Enter换行)',
      send: '发送',
      welcomeMessage: '你好！我是AI助手，很高兴为您服务。请问有什么可以帮助您的吗？',
      footerTip: '温馨提示：所有内容均由AI模型生成，准确性和完整性无法保证，不代表平台的态度或观点'
    },
    keysPage: {
      title: 'API 令牌管理',
      createButton: '新建 API 密钥',
      labels: {
        limit: '总额度',
        remaining: '剩余额度',
        used: '已用额度',
        expires: '过期时间',
        status: '状态'
      },
      values: {
        unlimited: '无限',
        never: '永不过期'
      },
      actions: {
        disable: '禁用令牌',
        enable: '启用令牌',
        delete: '删除令牌',
        edit: '编辑令牌'
      },
      status: {
        active: '启用',
        disabled: '禁用'
      }
    },
    expensesPage: {
      title: '积分/余额管理中心',
      subtitle: '查看和管理您的积分余额，了解积分使用情况',
      balanceLabel: '余额',
      convertPoints: '转换可用积分',
      buttons: {
        points: '积分',
        balance: '余额',
        freeMember: '免费会员',
        refresh: '刷新余额',
      },
      recordsTitle: '使用记录',
      refreshData: '刷新数据',
      record: {
        type: '类型:',
        duration: '用时:',
        input: '输入token:',
        output: '输出token:',
        consumption: '消费'
      }
    },
    pricingPage: {
      title: '定价列表',
      subtitle: '选择最适合您的AI创作服务套餐，开启智能内容创作之旅',
      paymentCycle: '付费周期选择',
      questions: '如对充值有疑问？请点击此处',
      paymentMethod: '支付方式：',
      wechatPay: '微信支付',
      invoice: '是否开具发票：',
      invoiceLabel: '',
      starter: {
        title: 'Starter会员',
        features: [
          '¥ 1.72元/1积分',
          '提供灵活的AI集成',
          '开箱即用的大模型 API+',
          '提供多模态模型能力，覆盖多场景',
          '无限视频预览',
          '500+数字人和配音',
          '无限保存产品数字人',
          '照片说话每个视频最长180秒',
          '无水印',
          '更快的渲染速度'
        ]
      },
      business: {
        title: 'Business会员',
        features: [
           '¥ 1.59元/1积分',
           '提供灵活的AI集成，更优先的渠道',
           '开箱即用的大模型 API+',
           '提供多模态模型能力，覆盖多场景',
           '无限视频预览',
           '500+数字人和配音',
           '无限保存产品数字人',
           '照片说话每个视频最长1800秒',
           '无水印',
           '最高优先会级渲染速度'
        ]
      },
      enterprise: {
        title: 'Enterprise',
        slogan: "Let's talk!",
        features: [
          '自定义团队席位',
          '自定义积分额度',
          '自定义数字人',
          '自定义AI音色',
          '自定义功能',
          '定制化功能开发'
        ]
      },
      labels: {
        credits: '可使用积分:',
        quantity: '购买数量',
        custom: '自定义',
        buy: '立即购买',
        contact: '联系我们'
      }
    },
    assetsPage: {
      title: 'AI素材管理中心',
      subtitle: '管理您的视频、图片素材，支持预览、编辑和批量操作',
      filterSearch: '筛选搜索',
      searchName: '素材名称',
      namePlaceholder: '搜索素材名称',
      searchType: '素材类型',
      chooseType: '选择类型',
      searchTag: '素材标签',
      tagPlaceholder: '搜索素材标签',
      searchDesc: '素材描述',
      descPlaceholder: '搜索素材描述',
      search: '搜索',
      reset: '重置',
      newFolder: '新建文件夹',
      upload: '上传素材',
      move: '移动',
      delete: '批量删除',
      selectAll: '全选',
      totalFolders: '个文件夹',
      totalFiles: '个文件',
      searchInResult: '筛选搜索',
    },
    footer: {
      privacy: '隐私政策',
      terms: '服务条款',
      twitter: 'Twitter',
      discord: 'Discord'
    },
    auth: {
      loginTitle: '欢迎回来',
      tabPassword: '账号密码',
      tabPhone: '手机验证',
      accountLabel: '邮箱或用户名',
      accountPlaceholder: '输入邮箱/用户名',
      passwordLabel: '密码',
      passwordPlaceholder: '输入密码',
      phoneLabel: '手机号码',
      phonePlaceholder: '输入手机号',
      codeLabel: '验证码',
      codePlaceholder: '6位验证码',
      sendCode: '获取验证码',
      codeSent: '已发送',
      signIn: '立即登录'
    }
  }
};
