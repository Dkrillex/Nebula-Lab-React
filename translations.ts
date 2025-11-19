import { NavItem } from './types';

interface Translation {
  header: {
    searchPlaceholder: string;
    signIn: string;
    nav: NavItem[];
    profile: string; // Add this
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
      amount: string;
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
      profile: string;
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
      };
      tabs: {
        textToImage: string;
        imageToImage: string;
      };
      imageToImage: {
        uploadTitle: string;
        uploadDesc: string;
        uploadHint: string;
      };
    };
    viralVideo: {
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
    imgToVideo: {
      title: string;
      subtitle: string;
      tabs: {
        traditional: string;
        startEnd: string;
        advanced: string;
      };
      upload: {
        label: string;
        button: string;
        desc: string;
      };
      generationSettings: string;
      prompt: {
        label: string;
        placeholder: string;
        polish: string;
        maxLength: number;
      };
      quality: {
        label: string;
        options: {
            lite: string;
            pro: string;
            best: string;
        };
      };
      duration: {
        label: string;
        units: string;
      };
      negativePrompt: {
        label: string;
        placeholder: string;
      };
      generate: string;
      result: {
        label: string;
        emptyState: string;
      };
    };
    digitalHuman: {
      title: string;
      subtitle: string;
      tabs: {
        video: string;
        product: string;
        singing: string;
      };
      leftPanel: {
        myDigitalHuman: string;
        uploadTitle: string;
        uploadFormat: string;
        uploadDesc: string;
        personalTemplate: string;
        publicTemplate: string;
        customUpload: string;
      };
      rightPanel: {
        modeSelection: string;
        mode1: string;
        mode2: string;
        scriptContent: string;
        textToSpeech: string;
        importAudio: string;
        textPlaceholder: string;
        textLimit: number;
        voiceType: string;
        aiVoice: string;
        publicVoice: string;
        selectVoice: string;
        aiSubtitle: string;
        selectSubtitleStyle: string;
        previewPlaceholder: string;
        tryExample: string;
        generate: string;
      };
    };
    styleTransfer: {
      title: string;
      subtitle: string;
      modes: {
        standard: {
          title: string;
          desc: string;
        };
        creative: {
          title: string;
          desc: string;
        };
        clothing: {
          title: string;
          desc: string;
        };
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
        types: {
          top: string;
          bottom: string;
          full: string;
        };
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
    workshop: {
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
  profilePage: {
    title: string;
    subtitle: string;
    basicInfo: string;
    accountSecurity: string;
    enterpriseManagement?: string;
    avatar: string;
    uploadAvatar: string;
    labels: {
      nickname: string;
      phone: string;
      email: string;
      gender: string;
      createTime: string;
      role: string;
      dept: string;
      password: string;
    };
    placeholders: {
      nickname: string;
      phone: string;
      email: string;
    };
    gender: {
      male: string;
      female: string;
      unknown: string;
    };
    buttons: {
      save: string;
      reset: string;
      changePassword: string;
    };
    enterprisePage?: any;
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
      ],
      profile: 'Profile',
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
        amount: 'Amount',
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
        expenses: 'My Expenses',
        profile: 'Profile',
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
        },
        tabs: {
          textToImage: 'Text to Image',
          imageToImage: 'Image to Image'
        },
        imageToImage: {
          uploadTitle: 'Upload Reference Image',
          uploadDesc: 'Click or drag to upload image',
          uploadHint: 'Supports JPG, PNG formats, max 10MB'
        }
      },
      viralVideo: {
        title: 'Import multiple images, generate product marketing videos',
        tabs: {
          upload: 'Upload Product Assets',
          link: 'Input Product Link'
        },
        uploadArea: {
          title: 'Please upload 4-10 product assets',
          desc: 'Image size 20KB-15MB, resolution >400*400, <8192*8192',
          limitation: 'Supports same-SKU clothing/footwear category materials (model images need portrait rights), other categories coming soon',
          selectFromPortfolio: 'Select from Portfolio',
          uploadLocal: 'Upload from Local'
        },
        process: {
          uploadImages: 'Upload Product Images',
          generateVideo: 'Generate Broadcast Video',
          makeSame: 'One-click Make Same'
        },
        examples: 'Excellent Examples'
      },
      imgToVideo: {
        title: 'Image to Video',
        subtitle: 'Upload images and describe text to let AI generate exquisite video works for you',
        tabs: {
          traditional: 'Traditional Mode',
          startEnd: 'Start/End Frame',
          advanced: 'Advanced Mode'
        },
        upload: {
          label: 'Upload Image',
          button: 'Upload Image',
          desc: 'Supports JPG, PNG formats'
        },
        generationSettings: 'Generation Settings',
        prompt: {
          label: 'Prompt',
          placeholder: 'Please describe the video content you want to generate',
          polish: 'AI Polish',
          maxLength: 1500
        },
        quality: {
          label: 'Quality Selection',
          options: {
            lite: 'Lite',
            pro: 'Pro',
            best: 'Best'
          }
        },
        duration: {
          label: 'Video Duration',
          units: 's'
        },
        negativePrompt: {
          label: 'Negative Prompt (Optional)',
          placeholder: 'List content you do not want to see in the video. Example: animation, blur, distortion...'
        },
        generate: '4 Credits',
        result: {
          label: 'Generation Result',
          emptyState: 'Upload image and enter description text to start your AI video creation journey'
        }
      },
      digitalHuman: {
        title: 'Digital Human Video Creation',
        subtitle: 'Upload your digital human video and audio content to let AI generate professional digital human video works for you',
        tabs: {
          video: 'Digital Human Video',
          product: 'Product Digital Human',
          singing: 'Singing Digital Human'
        },
        leftPanel: {
          myDigitalHuman: 'My Digital Human',
          uploadTitle: 'Upload Digital Human Video',
          uploadFormat: '(mp4, mov, webm)',
          uploadDesc: 'Need front-facing digital human video, duration 4s~3min',
          personalTemplate: 'Personal Template',
          publicTemplate: 'Public Template',
          customUpload: 'Custom Upload'
        },
        rightPanel: {
          modeSelection: 'Mode Selection',
          mode1: 'Digital Human 1',
          mode2: 'Digital Human 2',
          scriptContent: 'Script Content',
          textToSpeech: 'Text to Speech',
          importAudio: 'Import Audio',
          textPlaceholder: 'Enter the text for AI dubbing here, e.g.: Welcome to our product showcase, let me introduce our latest features in detail...',
          textLimit: 8000,
          voiceType: 'Voice Type',
          aiVoice: 'AI Dubbing Voice',
          publicVoice: 'Public Voice',
          selectVoice: 'Select Voice',
          aiSubtitle: 'AI Generated Subtitles',
          selectSubtitleStyle: 'Select Subtitle Style',
          previewPlaceholder: 'Please enter text.',
          tryExample: 'Try Example',
          generate: 'Generate after settings'
        }
      },
      styleTransfer: {
        title: 'Style Transfer',
        subtitle: 'Transform object styles across different scenes',
        modes: {
          standard: {
            title: 'Standard Mode',
            desc: 'Use templates for style transfer'
          },
          creative: {
            title: 'Creative Mode',
            desc: 'Use prompts for creative transformation'
          },
          clothing: {
            title: 'Clothing Mode',
            desc: 'Virtual try-on for garments'
          }
        },
        standard: {
          productTitle: 'Product Image',
          productDesc: 'Upload the product image you want to transform',
          uploadProduct: 'Upload Product Image',
          areaTitle: 'Template Area',
          areaDesc: 'Upload template image or select from templates',
          uploadTemplate: 'Upload Template Image',
          selectTemplate: 'Select Template',
          support: 'JPG, PNG, WEBP'
        },
        clothing: {
          garmentTitle: 'Garment Image',
          garmentDesc: 'Upload the garment image',
          uploadGarment: 'Upload Garment',
          modelTitle: 'Model Image',
          uploadModel: 'Upload Model',
          types: {
            top: 'Top',
            bottom: 'Bottom',
            full: 'Full Body'
          }
        },
        creative: {
          productTitle: 'Product Image',
          promptTitle: 'Prompt',
          addRef: 'Add Reference',
          tryExample: 'Try Example',
          aiPolish: 'AI Polish',
          promptPlaceholder: 'Describe the scene you want to place the product in, e.g., Place the product in a modern office environment with a clean and professional background...',
          uploadProduct: 'Upload Product Image',
          support: 'JPG, PNG, WEBP'
        },
        common: {
          generate: 'Generate',
          resultTitle: 'Generation Result',
          resultPlaceholder: 'Upload images and enter prompts to start your style transfer journey'
        }
      },
      workshop: {
        title: 'Creation Workshop',
        description: 'Explore creative AI tools',
        allTools: 'All Tools',
        image: 'Image',
        video: 'Video',
        audio: 'Audio',
        others: 'Others',
        tools: {
          translation: {
            title: 'AI Face Swap',
            description: 'Use AI technology for face replacement',
            emoji: '🧍'
          },
          tts: {
            title: 'Text to Speech',
            description: 'Convert text to natural speech',
            emoji: '🎤'
          },
          glbViewer: {
            title: '3D Model Viewer',
            description: 'View and manipulate 3D models',
            emoji: '🤖'
          },
          customPrompt: {
            title: 'Custom Prompt',
            description: 'Generate images with custom prompts',
            emoji: '✍️'
          },
          imageTranslation: {
            title: 'Image Translation',
            description: 'Transform images into different styles',
            emoji: '🧍'
          },
          aiTemplate: {
            title: 'AI Template',
            description: 'Quickly generate content with AI templates',
            emoji: '🖼️'
          }
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
    profilePage: {
      title: 'Personal Center',
      subtitle: 'Manage your account information and security settings',
      basicInfo: 'Basic Information',
      accountSecurity: 'Account Security',
      avatar: 'Avatar',
      uploadAvatar: 'Change Avatar',
      labels: {
        nickname: 'Nickname',
        phone: 'Phone Number',
        email: 'Email',
        gender: 'Gender',
        createTime: 'Registration Time',
        role: 'Role',
        dept: 'Department',
        password: 'Password'
      },
      placeholders: {
        nickname: 'Enter your nickname',
        phone: 'Enter your phone number',
        email: 'Enter your email'
      },
      gender: {
        male: 'Male',
        female: 'Female',
        unknown: 'Unknown'
      },
      buttons: {
        save: 'Save Changes',
        reset: 'Reset',
        changePassword: 'Change Password'
      }
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
        { label: 'AI大模型', href: '#' },
        { label: '创作中心', href: '#create' },
        { label: '密钥', href: '#keys' },
        { label: '活动', href: '#' },
        { label: '积分', href: '#expenses' },
      ],
      profile: '个人中心',
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
        amount: '数量:',
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
        expenses: '我的费用',
        profile: '个人中心',
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
        },
        tabs: {
          textToImage: '文生图',
          imageToImage: '图生图'
        },
        imageToImage: {
          uploadTitle: '上传参考图片',
          uploadDesc: '点击或拖拽上传图片',
          uploadHint: '支持 JPG、PNG 格式，最大10MB'
        }
      },
      viralVideo: {
        title: '导入多张图片素材，生成商品营销视频',
        tabs: {
          upload: '上传商品素材',
          link: '输入商品链接'
        },
        uploadArea: {
          title: '请上传 4-10 张商品素材',
          desc: '图片大小20KB~15MB之间，分辨率大于400*400，小于8192*8192 图片规则',
          limitation: '暂仅支持同一SKU服饰鞋袜类目的商品素材（模特图需有肖像权），其他类目敬请期待',
          selectFromPortfolio: '从作品选择',
          uploadLocal: '从本地上传'
        },
        process: {
          uploadImages: '上传商品图片',
          generateVideo: '生成口播视频',
          makeSame: '一键做同款'
        },
        examples: '优秀案例'
      },
      imgToVideo: {
        title: '图生视频',
        subtitle: '通过上传图片和描述文字，让AI为您生成精美的视频作品',
        tabs: {
          traditional: '传统模式',
          startEnd: '首尾帧模式',
          advanced: '高级模式'
        },
        upload: {
          label: '上传图片',
          button: '上传图片',
          desc: '支持 JPG、PNG 格式'
        },
        generationSettings: '生成设置',
        prompt: {
          label: '提示词',
          placeholder: '请描述您想要生成的视频内容',
          polish: 'AI润色',
          maxLength: 1500
        },
        quality: {
          label: '质量选择',
          options: {
            lite: 'Lite',
            pro: 'Pro',
            best: 'Best'
          }
        },
        duration: {
          label: '视频时长',
          units: '秒'
        },
        negativePrompt: {
          label: '负面提示词（可选）',
          placeholder: '列出您不想在视频中看到的内容类型。示例：动画、模糊、扭曲、变形、低质量、拼贴、颗粒、微标、抽象、插图、计算机生成、扭曲......'
        },
        generate: '4 积分',
        result: {
          label: '生成结果',
          emptyState: '上传图片并输入描述文字，开始您的AI视频创作之旅'
        }
      },
      digitalHuman: {
        title: '数字人视频创作',
        subtitle: '上传您的数字人视频和音频内容，让AI为您生成专业的数字人视频作品',
        tabs: {
          video: '数字人视频',
          product: '产品数字人',
          singing: '唱歌数字人'
        },
        leftPanel: {
          myDigitalHuman: '我的数字人',
          uploadTitle: '上传数字人视频',
          uploadFormat: '(mp4, mov, webm)',
          uploadDesc: '需要正脸数字人视频，时长4秒~3分钟',
          personalTemplate: '个人模板',
          publicTemplate: '公共模板',
          customUpload: '自定义上传数字人'
        },
        rightPanel: {
          modeSelection: '模式选择',
          mode1: '数字人1',
          mode2: '数字人2',
          scriptContent: '脚本内容',
          textToSpeech: '文本转语音',
          importAudio: '导入音频',
          textPlaceholder: '在此输入需要AI配音的文本，例如：欢迎来到我们的产品展示，让我为您详细介绍我们最新的功能特点...',
          textLimit: 8000,
          voiceType: '音色类型',
          aiVoice: 'AI配音音色',
          publicVoice: '公共音色',
          selectVoice: '选择音色',
          aiSubtitle: 'AI生成字幕',
          selectSubtitleStyle: '选择字幕样式',
          previewPlaceholder: '请输入文本。',
          tryExample: '试用示例',
          generate: '设置完成后可生成'
        }
      },
      styleTransfer: {
        title: '万物迁移',
        subtitle: 'AI智能笔触勾勒产品跨场景展示',
        modes: {
          standard: {
            title: '标准模式',
            desc: '使用模板进行风格迁移'
          },
          creative: {
            title: '创意模式',
            desc: '使用提示词进行创意变换'
          },
          clothing: {
            title: '服装模式',
            desc: '虚拟试衣换装'
          }
        },
        standard: {
          productTitle: '产品图片',
          productDesc: '上传您想要变换的产品图片',
          uploadProduct: '上传产品图片',
          areaTitle: '模板区域',
          areaDesc: '上传模板图片或从模板库中选择',
          uploadTemplate: '上传模板图片',
          selectTemplate: '选择模板',
          support: 'JPG, PNG, WEBP'
        },
        clothing: {
          garmentTitle: '服装图片',
          garmentDesc: '上传服装图片',
          uploadGarment: '上传服装',
          modelTitle: '模特图片',
          uploadModel: '上传模特',
          types: {
            top: '上衣',
            bottom: '下装',
            full: '全身'
          }
        },
        creative: {
          productTitle: '产品图片',
          promptTitle: '提示词',
          addRef: '添加参考',
          tryExample: '试用示例',
          aiPolish: 'AI润色',
          promptPlaceholder: '描述您想要放置产品的场景，例如：将产品放置在现代化的办公环境中，背景简洁专业，突出产品特点...',
          uploadProduct: '上传产品图片',
          support: 'JPG, PNG, WEBP'
        },
        common: {
          generate: '生成',
          resultTitle: '生成结果',
          resultPlaceholder: '上传图片并输入提示词，开始您的风格迁移之旅'
        }
      },
      workshop: {
        title: '创作工坊',
        description: '探索创意AI工具',
        allTools: '全部工具',
        image: '图片',
        video: '视频',
        audio: '音频',
        others: '其他',
        tools: {
          translation: {
            title: 'AI换脸',
            description: '使用AI技术进行人脸替换',
            emoji: '🧍'
          },
          tts: {
            title: '文本转语音',
            description: '将文本转换为自然语音',
            emoji: '🎤'
          },
          glbViewer: {
            title: '3D模型查看器',
            description: '查看和操作3D模型',
            emoji: '🤖'
          },
          customPrompt: {
            title: '自定义提示词',
            description: '使用自定义提示词生成图像',
            emoji: '✍️'
          },
          imageTranslation: {
            title: '图像翻译',
            description: '将图像转换为不同风格',
            emoji: '🧍'
          },
          aiTemplate: {
            title: 'AI模板',
            description: '使用AI模板快速生成内容',
            emoji: '🖼️'
          }
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
    profilePage: {
      title: '个人中心',
      subtitle: '管理您的账户信息和安全设置',
      basicInfo: '基本资料',
      accountSecurity: '账号安全',
      enterpriseManagement: '企业管理',
      avatar: '头像',
      uploadAvatar: '更换头像',
      labels: {
        nickname: '用户昵称',
        phone: '手机号码',
        email: '用户邮箱',
        gender: '性别',
        createTime: '注册时间',
        role: '角色',
        dept: '所属部门',
        password: '用户密码'
      },
      placeholders: {
        nickname: '请输入用户昵称',
        phone: '请输入手机号码',
        email: '请输入邮箱地址'
      },
      gender: {
        male: '男',
        female: '女',
        unknown: '未知'
      },
      buttons: {
        save: '保存配置',
        reset: '重置',
        changePassword: '修改密码'
      },
      enterprisePage: {
        title: '企业管理',
        channelManagement: '渠道管理',
        teamManagement: '团队管理',
        channelName: '渠道名称',
        whetherShareAssets: '是否共享资产',
        yes: '是',
        no: '否',
        createTime: '创建时间',
        updateTime: '更新时间',
        edit: '编辑',
        addUserChannelRelation: '新增用户渠道关联',
        pleaseEnterChannelName: '请输入渠道名称',
        pleaseSelectWhetherShareAssets: '请选择是否共享资产',
        teamName: '团队名称',
        status: '状态',
        normal: '正常',
        disabled: '停用',
        remark: '备注',
        addNewTeam: '新增团队',
        refresh: '刷新',
        searchTeamName: '搜索团队名称',
        viewMembers: '查看成员',
        inviteMembers: '邀请成员',
        addMembers: '添加成员',
        delete: '删除',
        pleaseEnterTeamName: '请输入团队名称',
        pleaseEnterTeamRemark: '请输入团队备注',
        teamRole: '团队角色',
        teamRoleInputHint: '请输入团队角色，如:开发者、测试员、观察者,一个团队最多支持10个角色',
        pleaseEnterTeamRolesExample: '请输入团队角色，多个用逗号分隔'
      }
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
