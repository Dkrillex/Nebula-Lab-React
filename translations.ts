import { NavItem } from './types';

interface Translation {
  header: {
    searchPlaceholder: string;
    signIn: string;
    nav: NavItem[];
    profile: string; // Add this
    expenses: string;
    notifications: string;
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
    keyboardHint: string;
    sideMenu: {
      home: string;
      createHome: string;
      modelCenter: string;
      creationCenter: string;
      personalCenter: string;
      // Model Center items
      aiExperience: string;
      modelSquare: string;
      apiKeys: string;
      apiDocs: string;
      rank: string;
      // Creation Center items
      viralVideo: string;
      digitalHuman: string;
      imgToVideo: string;
      textToImage: string;
      styleTransfer: string;
      voiceClone: string;
      workshop: string;
      faceSwap: string;
      ttsTool: string;
      glbViewer: string;
      imageTranslation: string;
      videoTranslation: string;
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
      talkingPhoto: string;
      talkingPhotoDesc: string;
    };
    tabs: string[];
    templateTypes?: {
      textToImage: string;
      imageToImage: string;
      textToVideo: string;
      imageToVideo: string;
    };
    templateDetail?: {
      makeSame: string;
      likes: string;
      originalImage: string;
      noTemplates: string;
      featureNotOpen: string;
    };
    authModal?: {
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
      agreePolicy?: string;
      privacyPolicy?: string;
      terms?: string;
    };
    textToImage: {
      title: string;
      subtitle: string;
      inputLabel: string;
      inputPlaceholder: string;
      aiPolish: string;
      aiPolishThinking: string;
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
      actions: {
        clearAll: string;
        downloadAll: string;
        imageToVideo: string;
        addToMaterials: string;
        viewFullSize: string;
        download: string;
      };
      tips: {
        polishSuccess: string;
        polishFailed: string;
        imageSizeLimit: string;
        imageRatioLimit: string;
        uploadSuccess: string;
        uploadFailed: string;
        generateSuccess: string;
        generateEmpty: string;
        generateFailed: string;
        downloadStarted: string;
        downloadFailed: string;
        selectImageTip: string;
        addToMaterialsSuccess: string;
        generating: string;
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
      trySample: string;
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
        tips: {
          lite: string;
          pro: string;
          best: string;
        };
      };
      duration: {
        label: string;
        units: string;
      };
      generatingCount: string;
      negativePrompt: {
        label: string;
        placeholder: string;
      };
      generate: string;
      credits: string;
      actions: {
        clearAll: string;
        downloadAll: string;
      };
      result: {
        label: string;
        emptyState: string;
      };
      generating: string;
      progressStatusShort: string;
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
        mode1_intro: {
          p1: string;
          p2: string;
          p3: string;
        };
        mode2: string;
        mode2_intro: {
          p1: string;
          p2: string;
          p3: string;
        };
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
        buttonTip?: {
          text: string;
          audio: string;
          default: string;
        };
        diamondCoin?: string;
        tryExample: string;
        generate: string;
      };
      voiceModal: {
        title: string;
        tabs: {
          public: string;
          custom: string;
        };
        filters: {
          language: string;
          gender: string;
          age: string;
          style: string;
        };
        filterOptions: {
          allLanguages: string;
          allGenders: string;
          male: string;
          female: string;
          young: string;
          middleAge: string;
          old: string;
          ugc: string;
          ads: string;
        };
      };
    };
    productAvatar: {
      leftPanel: {
        title: string;
        uploadDiy: string;
        picker: string;
      };
      rightPanel: {
        templatePreview: string;
        pickerTemplate: string;
        uploadMyFace: string;
        productConfig: string;
        uploadProductImg: string;
        productImg: string;
        productSize: string;
        aiTips: string;
        aiTipsPlaceholder: string;
        aiTextPlaceholder: string;
        trySample: string;
        startWorking: string;
        replacementSuccess: string;
        uploadAvatar: string;
        autoShow: string;
      };
      sliderMarks: {
        tiny: string;
        small: string;
        medium: string;
        large: string;
        xLarge: string;
        xxLarge: string;
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
    voiceClone: {
      title1: string;
      title2: string;
      desc1: string;
      desc2: string;
      attribute: string;
      audioParameters: string;
      audioName: string;
      audioNamePlaceholder: string;
      speakingSpeed: string;
      audioText: string;
      audioTextPlaceholder: string;
      fileStatus: string;
      audioStatus: string;
      audioUploaded: string;
      audioInfo: string;
      timbreInfo: string;
      fileName: string;
      fileSize: string;
      fileFormat: string;
      audioName2: string;
      sex: string;
      male: string;
      female: string;
      style: string;
      getAudio: string;
      getTimbre: string;
      uploadOrOnline: string;
      selectVoice: string;
      uploadFile: string;
      onlineRecording: string;
      uploadAudio: string;
      supportAudioType: string;
      startRecording: string;
      stopRecording: string;
      uploadRecording: string;
      previewRecording: string;
      clear: string;
      commonVoice: string;
      privateVoice: string;
      allSex: string;
      allStyle: string;
      UGC: string;
      Advertisement: string;
      voiceLoading: string;
      previousPage: string;
      nextPage: string;
      page: string;
      total: string;
      syntheticEffect: string;
      previewRes: string;
      operationProcess: string;
      syntheticText: string;
      ready: string;
      inPreparation: string;
      taskRes: string;
      taskStatus: string;
      outputAudio: string;
      downloadAudio: string;
      clearReset: string;
      startCloning: string;
      startSynthesis: string;
      inProcessing: string;
      recordingCompleted: string;
      recording: string;
      uploadSuccess: string;
      uploadFail: string;
      micPermission: string;
      micPermissionFail: string;
      recording2: string;
      recordingFail: string;
      audioFirst: string;
      recordUploadSuccess: string;
      recordUploadFail: string;
      recordPrepare: string;
      msgConfirm: string;
      messionPushFail: string;
      taskSuccess: string;
      durationInvalid: string;
      queryFail: string;
      trialListening: string;
      emptyState: string;
      resultTitle: string;
      addToLibrary: string;
      addedToLibrary: string;
      addToLibraryFail: string;
      createAudioFile: string;
      audioReadFail: string;
      fileReadFail: string;
      transWAV: string;
      transWAVSuccess: string;
      transWAVFail: string;
      downloadAll: string;
    };
    imageTranslation: {
      title: string;
      subtitle: string;
      primaryLabel: string;
      referenceLabel: string;
      promptPlaceholder: string;
      generate: string;
      resultTitle: string;
      emptyState: string;
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
  rankPage: {
    title: string;
    description: string;
    dataSourceLabel: string;
    dataSourceValue: string;
    columns: {
      model: string;
      intelligence: string;
      coding: string;
      math: string;
      speed: string;
      price: string;
    };
    fetchError: string;
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
    countries?: {
      china: string;
      japan: string;
      indonesia: string;
    };
  };
}

export const translations: Record<string, Translation> = {
  en: {
    header: {
      searchPlaceholder: 'Search models...',
      signIn: 'Sign in',
      nav: [
        { label: 'Model Center', href: '/models' },
        { label: 'Creation Center', href: '/create' },
        { label: 'Personal Center', href: '/profile' },
      ],
      profile: 'Profile',
      expenses: 'Expenses',
      notifications: 'Notifications',
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
      keyboardHint: 'Enter to send · Shift + Enter for new line',
      sideMenu: {
        home: 'Home',
        createHome: 'Creation Home',
        modelCenter: 'Model Center',
        creationCenter: 'Creation Center',
        personalCenter: 'Personal Center',
        aiExperience: 'AI Experience',
        modelSquare: 'Model Square',
        apiKeys: 'API Keys',
        apiDocs: 'API Docs',
        rank: 'Leaderboard',
        viralVideo: 'Viral Video',
        digitalHuman: 'Digital Human',
        imgToVideo: 'Image to Video',
        textToImage: 'Text to Image',
        styleTransfer: 'Style Transfer',
        voiceClone: 'Voice Cloning',
        workshop: 'Workshop',
        faceSwap: 'AI Face Swap',
        ttsTool: 'Text to Speech',
        glbViewer: '3D Model',
        imageTranslation: 'Image Translation',
        videoTranslation: 'Video Translation',
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
        inpaintingDesc: 'Remove or replace objects',
        talkingPhoto: 'Talking Photo',
        talkingPhotoDesc: 'Make photos talk'
      },
      tabs: ['All', 'Characters', 'Animals', 'Anime', 'Creative', 'Food', 'Scenery', 'Product'],
      templateTypes: {
        textToImage: 'Text to Image',
        imageToImage: 'Image to Image',
        textToVideo: 'Text to Video',
        imageToVideo: 'Image to Video',
      },
      templateDetail: {
        makeSame: 'Make Same',
        likes: 'likes',
        originalImage: 'Original:',
        noTemplates: 'No templates found.',
        featureNotOpen: 'This feature is not available yet',
      },
      authModal: {
        loginTitle: 'Welcome Back',
        tabPassword: 'Password',
        tabPhone: 'Phone',
        accountLabel: 'Account',
        accountPlaceholder: 'Enter your account',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Enter your password',
        phoneLabel: 'Phone Number',
        phonePlaceholder: 'Enter your phone number',
        codeLabel: 'Verification Code',
        codePlaceholder: 'Enter verification code',
        sendCode: 'Send Code',
        codeSent: 'Code Sent',
        signIn: 'Sign In',
        agreePolicy: 'I agree to the',
        privacyPolicy: 'Privacy Policy',
        terms: 'Terms of Service',
      },
      textToImage: {
        title: 'AI Image Generation',
        subtitle: 'Generate exquisite images from text descriptions',
        inputLabel: 'Text Description',
        inputPlaceholder: 'Describe the image you want to generate, e.g., A cute little cat in a sunlit garden...',
        aiPolish: 'AI Polish',
        aiPolishThinking: 'Thinking...',
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
        },
        actions: {
          clearAll: 'Clear All',
          downloadAll: 'Download All',
          imageToVideo: 'Image to Video',
          addToMaterials: 'Add to Materials',
          viewFullSize: 'View Full Size',
          download: 'Download'
        },
        tips: {
          polishSuccess: 'Text polished successfully',
          polishFailed: 'Text polishing failed',
          imageSizeLimit: 'Image size cannot exceed 10MB',
          imageRatioLimit: 'Image aspect ratio must be between 1:3 and 3:1',
          uploadSuccess: 'Image uploaded successfully',
          uploadFailed: 'Upload failed',
          generateSuccess: 'Successfully generated images',
          generateEmpty: 'API returned success but no image data found',
          generateFailed: 'Generation failed',
          downloadStarted: 'Download started',
          downloadFailed: 'Download failed',
          selectImageTip: 'Please select an image first',
          addToMaterialsSuccess: 'Added to materials',
          generating: 'Generating...'
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
        trySample: 'Try Sample',
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
          },
          tips: {
            lite: '480P, Faster generation speed',
            pro: '1080P, Improved body movement and physical realism',
            best: 'Best AI video with top-tier motion and physical realism'
          }
        },
        duration: {
          label: 'Video Duration',
          units: 's'
        },
        generatingCount: 'Generating Count:',
        negativePrompt: {
          label: 'Negative Prompt (Optional)',
          placeholder: 'List content you do not want to see in the video. Example: animation, blur, distortion...'
        },
        generate: 'Generate',
        credits: 'Credits',
        actions: {
          clearAll: 'Clear All',
          downloadAll: 'Download All'
        },
        result: {
          label: 'Generation Result',
          emptyState: 'Upload image and enter description text to start your AI video creation journey'
        },
        generating: 'Generating your masterpiece...',
        progressStatusShort: 'Generating'
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
          mode1_intro: {
            p1: 'Image-based digital humans only generate head movements.',
            p2: 'Video-based digital humans only modify lip movements in existing videos.',
            p3: 'Faster generation time.'
          },
          mode2: 'Digital Human 2',
          mode2_intro: {
            p1: 'Lip movements, facial expressions, gestures, and body movements match the speech content, making the video look more natural and realistic.',
            p2: 'Longer generation time.',
            p3: 'Recommended text duration for AI dubbing is 15 seconds for best results; max 28 seconds.'
          },
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
          buttonTip: {
            text: 'Please enter text.',
            audio: 'Please select an audio file.',
            default: '1 Point = 30s or 400 chars'
          },
          diamondCoin: 'Points',
          tryExample: 'Try Example',
          generate: 'Generate after settings'
        },
        voiceModal: {
          title: 'Select Voice',
          tabs: {
            public: 'Public Voices',
            custom: 'My Voices'
          },
          filters: {
            language: 'Language',
            gender: 'Gender',
            age: 'Age',
            style: 'Style'
          },
          filterOptions: {
            allLanguages: 'All Languages',
            allGenders: 'All Genders',
            male: 'Male',
            female: 'Female',
            young: 'Young',
            middleAge: 'Middle Age',
            old: 'Old',
            ugc: 'UGC',
            ads: 'Advertisement'
          }
        }
      },
      productAvatar: {
        leftPanel: {
          title: 'Select Avatar Template',
          uploadDiy: 'Upload Custom',
          picker: 'Pick'
        },
        rightPanel: {
          templatePreview: 'Avatar Preview',
          pickerTemplate: 'Please select an avatar template',
          uploadMyFace: 'Upload Face',
          productConfig: 'Product Config',
          uploadProductImg: 'Upload Product Image',
          productImg: 'Product Image',
          productSize: 'Product Size',
          aiTips: 'AI Mixed Prompt',
          aiTipsPlaceholder: 'Tell AI how to blend the product with the avatar model...',
          aiTextPlaceholder: 'Replace items in image 1 scene with items in image 2. Keep the composition and position of the person in image 1 unchanged, and adjust gestures to fit the size and appearance of the new item. The item must be exactly the same as in image 2.',
          trySample: 'Try Sample',
          startWorking: 'Start Generating',
          replacementSuccess: 'Replacement Successful',
          uploadAvatar: 'Please select or upload an avatar',
          autoShow: 'Auto'
        },
        sliderMarks: {
          tiny: 'Tiny',
          small: 'Small',
          medium: 'Medium',
          large: 'Large',
          xLarge: 'X-Large',
          xxLarge: 'XX-Large'
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
      voiceClone: {
        title1: 'Voice Cloning',
        title2: 'Voice Synthesis',
        desc1: 'Upload or record an audio clip, AI will clone a digital human voice highly similar to yours',
        desc2: 'Select your favorite voice, enter text, and generate high-quality speech with one click',
        attribute: 'Data Attribute',
        audioParameters: 'Configure Audio Parameters',
        audioName: 'Audio Name',
        audioNamePlaceholder: 'Give your audio a name',
        speakingSpeed: 'Speaking Speed Control',
        audioText: 'Audio Text',
        audioTextPlaceholder: 'Please enter the text content to synthesize...',
        fileStatus: 'File Status',
        audioStatus: 'Voice Status',
        audioUploaded: 'Voice Selected',
        audioInfo: 'Audio Information',
        timbreInfo: 'Voice Information',
        fileName: 'File Name',
        fileSize: 'File Size',
        fileFormat: 'Format',
        audioName2: 'Voice Name',
        sex: 'Gender',
        male: 'Male',
        female: 'Female',
        style: 'Style',
        getAudio: 'Audio Acquisition',
        getTimbre: 'Voice Selection',
        uploadOrOnline: 'Upload File or Online Recording',
        selectVoice: 'Select Existing Voice',
        uploadFile: 'File Upload',
        onlineRecording: 'Online Recording',
        uploadAudio: 'Drag or click to upload audio file',
        supportAudioType: 'Supports MP3, WAV formats, file size not exceeding 50MB',
        startRecording: 'Start Recording',
        stopRecording: 'Stop Recording',
        uploadRecording: 'Upload Recording',
        previewRecording: 'Recording Preview',
        clear: 'Clear',
        commonVoice: 'Public Voice',
        privateVoice: 'Private Voice',
        allSex: 'All Genders',
        allStyle: 'All Styles',
        UGC: 'User Generated',
        Advertisement: 'Advertisement',
        voiceLoading: 'Loading voice list...',
        previousPage: 'Previous Page',
        nextPage: 'Next Page',
        page: 'Page',
        total: 'Total',
        syntheticEffect: 'Synthesis Effect',
        previewRes: 'Preview and Manage Results',
        operationProcess: 'Operation Process',
        syntheticText: 'Synthesis Text',
        ready: 'Ready',
        inPreparation: 'Preparing...',
        taskRes: 'Task Result',
        taskStatus: 'Task Status',
        outputAudio: 'Output Audio',
        downloadAudio: 'Download Audio',
        clearReset: 'Clear Reset',
        startCloning: 'Start Cloning',
        startSynthesis: 'Start Synthesis',
        inProcessing: 'Processing...',
        recordingCompleted: 'Recording completed, please click upload',
        recording: 'Recording_',
        uploadSuccess: 'File uploaded successfully',
        uploadFail: 'File upload failed',
        micPermission: 'Requesting microphone permission...',
        micPermissionFail: 'Unable to access microphone, please check permission settings',
        recording2: 'Recording...',
        recordingFail: 'Recording failed',
        audioFirst: 'Please record audio first',
        recordUploadSuccess: 'Recording uploaded successfully',
        recordUploadFail: 'Recording upload failed',
        recordPrepare: 'Prepare Recording',
        msgConfirm: 'Please ensure all required information is filled',
        messionPushFail: 'Task submission failed',
        taskSuccess: 'Task completed',
        durationInvalid: 'Invalid video duration, needs 10s~5 minutes, please re-upload',
        queryFail: 'Failed to query task status',
        trialListening: 'Trial Listening',
        emptyState: 'Configure parameters and start generation, results will be displayed here',
        resultTitle: 'Generation Result',
        addToLibrary: 'Add to Material Library',
        addedToLibrary: 'Added to Material Library',
        addToLibraryFail: 'Failed to add to Material Library',
        createAudioFile: 'Generated Audio File',
        audioReadFail: 'Unable to read audio data',
        fileReadFail: 'File read failed',
        transWAV: 'Converting to WAV format...',
        transWAVSuccess: 'WAV format conversion completed',
        transWAVFail: 'Audio format conversion failed, will use original format',
        downloadAll: 'Download All'
      },
      imageTranslation: {
        title: 'Image Translation',
        subtitle: 'Use AI to swap faces or styles between two images',
        primaryLabel: 'Primary Image',
        referenceLabel: 'Reference Image',
        promptPlaceholder: 'Describe how to translate the reference style onto the primary image',
        generate: 'Generate',
        resultTitle: 'Translation Result',
        emptyState: 'Upload images to open a new canvas',
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
    rankPage: {
      title: 'AI Model Leaderboard',
      description: 'Comprehensive ranking of LLM performance, speed, and pricing',
      dataSourceLabel: 'Data source',
      dataSourceValue: 'artificialanalysis.ai',
      columns: {
        model: 'Model',
        intelligence: 'Intelligence',
        coding: 'Coding',
        math: 'Math',
        speed: 'Speed',
        price: 'Price (1M)'
      },
      fetchError: 'Failed to load ranking data'
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
      codePlaceholder: '4-digit code',
      sendCode: 'Send Code',
      codeSent: 'Sent!',
      signIn: 'Sign In',
      countries: {
        china: 'China',
        japan: 'Japan',
        indonesia: 'Indonesia'
      }
    }
  },
  zh: {
    header: {
      searchPlaceholder: '搜索模型...',
      signIn: '登录',
      nav: [
        { label: '模型中心', href: '/models' },
        { label: '创作中心', href: '/create' },
        { label: '个人中心', href: '/profile' },
      ],
      profile: '个人中心',
      expenses: '消费记录',
      notifications: '消息通知',
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
      keyboardHint: 'Enter 发送 · Shift + Enter 换行',
      sideMenu: {
        home: '首页',
        createHome: '创作首页',
        modelCenter: '模型中心',
        creationCenter: '创作中心',
        personalCenter: '个人中心',
        aiExperience: 'AI体验',
        modelSquare: '模型广场',
        apiKeys: 'API密钥',
        apiDocs: 'API操作文档',
        rank: '排行榜',
        viralVideo: 'AI混剪视频',
        digitalHuman: '数字人视频',
        imgToVideo: '图生视频',
        textToImage: 'AI生图',
        styleTransfer: '万物迁移',
        voiceClone: '声音克隆',
        workshop: '创作工坊',
        faceSwap: 'AI换脸',
        ttsTool: '文本转语音',
        glbViewer: '3D模型',
        imageTranslation: '图像翻译',
        videoTranslation: '视频翻译',
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
        inpaintingDesc: 'AI智能图像编辑，支持涂抹消除',
        talkingPhoto: '照片说话',
        talkingPhotoDesc: '让照片开口说话'
      },
      tabs: ['全部', '人物', '宠物', '动漫', '创意', '食物', '风景', '产品', '电商'],
      templateTypes: {
        textToImage: '文生图',
        imageToImage: '图生图',
        textToVideo: '文生视频',
        imageToVideo: '图生视频',
      },
      templateDetail: {
        makeSame: '做同款',
        likes: '喜欢',
        originalImage: '原图：',
        noTemplates: '暂无模板数据',
        featureNotOpen: '该功能暂未开放',
      },
      authModal: {
        loginTitle: '欢迎回来',
        tabPassword: '密码登录',
        tabPhone: '手机登录',
        accountLabel: '账号',
        accountPlaceholder: '请输入账号',
        passwordLabel: '密码',
        passwordPlaceholder: '请输入密码',
        phoneLabel: '手机号',
        phonePlaceholder: '请输入手机号',
        codeLabel: '验证码',
        codePlaceholder: '请输入验证码',
        sendCode: '发送验证码',
        codeSent: '验证码已发送',
        signIn: '登录',
        agreePolicy: '我已阅读并同意',
        privacyPolicy: '隐私政策',
        terms: '服务条款',
      },
      textToImage: {
        title: 'AI生图',
        subtitle: '通过输入文字描述，让AI为您生成精美的图片作品',
        inputLabel: '文字描述',
        inputPlaceholder: '描述您想要生成的图片，例如：一只可爱的小猫坐在阳光下的花园里，周围开满了五颜六色的花朵，画风唯美，光线柔和...',
        aiPolish: 'AI润色',
        aiPolishThinking: '正在思考..',
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
        },
        actions: {
          clearAll: '清空结果',
          downloadAll: '批量下载',
          imageToVideo: '图生视频',
          addToMaterials: '导入素材',
          viewFullSize: '查看大图',
          download: '下载'
        },
        tips: {
          polishSuccess: '文本润色成功',
          polishFailed: '文本润色失败',
          imageSizeLimit: '图片大小不能超过10MB',
          imageRatioLimit: '图片宽高比应在1/3到3之间',
          uploadSuccess: '图片上传成功',
          uploadFailed: '上传失败',
          generateSuccess: '成功生成图片',
          generateEmpty: 'API返回成功但没有生成图片数据',
          generateFailed: '生成失败',
          downloadStarted: '开始下载',
          downloadFailed: '下载失败',
          selectImageTip: '请先选择一张图片',
          addToMaterialsSuccess: '已添加到素材库',
          generating: '生成中...'
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
        trySample: '试用示例',
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
          },
          tips: {
            lite: '480P，生成速度更快',
            pro: '1080P，改进的身体动作和物理真实感',
            best: '最佳AI视频，具有顶级动作和物理真实感'
          }
        },
        duration: {
          label: '视频时长',
          units: '秒'
        },
        generatingCount: '生成数量:',
        negativePrompt: {
          label: '负面提示词（可选）',
          placeholder: '列出您不想在视频中看到的内容类型。示例：动画、模糊、扭曲、变形、低质量、拼贴、颗粒、微标、抽象、插图、计算机生成、扭曲......'
        },
        generate: '生成',
        credits: '积分',
        actions: {
          clearAll: '清空结果',
          downloadAll: '批量下载'
        },
        result: {
          label: '生成结果',
          emptyState: '上传图片并输入描述文字，开始您的AI视频创作之旅'
        },
        generating: '正在生成您的杰作...',
        progressStatusShort: '生成中'
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
          mode1_intro: {
            p1: '基于图片的数字人只生成头部动作。',
            p2: '基于视频的数字人只修改现有视频中的唇部动作。',
            p3: '生成时间更快。'
          },
          mode2: '数字人2',
          mode2_intro: {
            p1: '数字人的唇部动作、面部表情、手势和身体动作都与语音内容相匹配，使视频看起来更自然和写实。',
            p2: '生成时间较长。',
            p3: '在此输入需要AI配音的文本建议15秒以获得最佳结果；最大28秒。'
          },
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
          buttonTip: {
            text: '请输入文本。',
            audio: '请选择上传一个音频文件。',
            default: '1积分=30秒 或者 400个字符'
          },
          diamondCoin: '积分',
          tryExample: '试用示例',
          generate: '设置完成后可生成'
        },
        voiceModal: {
          title: '选择音色',
          tabs: {
            public: '公共音色',
            custom: '我的音色'
          },
          filters: {
            language: '语言',
            gender: '性别',
            age: '年龄',
            style: '风格'
          },
          filterOptions: {
            allLanguages: '全部语言',
            allGenders: '全部性别',
            male: '男性',
            female: '女性',
            young: '年轻',
            middleAge: '中年',
            old: '老年',
            ugc: 'UGC',
            ads: '广告'
          }
        }
      },
      productAvatar: {
        leftPanel: {
          title: '选择数字人模板',
          uploadDiy: '上传自定义',
          picker: '选择'
        },
        rightPanel: {
          templatePreview: '数字人预览',
          pickerTemplate: '请选择数字人模板',
          uploadMyFace: '上传人脸',
          productConfig: '产品配置',
          uploadProductImg: '上传产品图片',
          productImg: '产品图片',
          productSize: '产品尺寸',
          aiTips: 'AI混合提示',
          aiTipsPlaceholder: '告诉AI如何将产品与数字人模型进行完美融合...',
          aiTextPlaceholder: '将图像1场景中的项目替换为图像2中的项目。保持图像1中人物的构图和位置不变，并调整手势以适应新项目的大小和外观。该项目必须与图2中的项目完全相同。',
          trySample: '试用示例',
          startWorking: '开始生成',
          replacementSuccess: '替换成功',
          uploadAvatar: '请选择一个头像或上传一个头像',
          autoShow: '自动'
        },
        sliderMarks: {
          tiny: '微小',
          small: '小',
          medium: '中',
          large: '大',
          xLarge: '加大',
          xxLarge: '超大'
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
      voiceClone: {
        title1: '声音克隆',
        title2: '声音合成',
        desc1: '上传或录制一段音频，AI 将克隆出与您声音高度相似的数字人声音',
        desc2: '选择喜欢的音色，输入文本，一键生成高品质语音',
        attribute: '数据属性',
        audioParameters: '配置音频参数',
        audioName: '音频名称',
        audioNamePlaceholder: '给您的音频起个名字',
        speakingSpeed: '语速控制',
        audioText: '音频文本',
        audioTextPlaceholder: '请输入要合成的文本内容...',
        fileStatus: '文件状态',
        audioStatus: '音色状态',
        audioUploaded: '音色已选择',
        audioInfo: '音频信息',
        timbreInfo: '音色信息',
        fileName: '文件名',
        fileSize: '文件大小',
        fileFormat: '格式',
        audioName2: '音色名称',
        sex: '性别',
        male: '男性',
        female: '女性',
        style: '风格',
        getAudio: '音频获取',
        getTimbre: '音色选择',
        uploadOrOnline: '上传文件或在线录音',
        selectVoice: '选择现有音色',
        uploadFile: '文件上传',
        onlineRecording: '在线录音',
        uploadAudio: '拖拽或点击上传音频文件',
        supportAudioType: '支持 MP3、WAV 格式，文件大小不超过 50MB',
        startRecording: '开始录音',
        stopRecording: '停止录音',
        uploadRecording: '上传录音',
        previewRecording: '录音预览',
        clear: '清除',
        commonVoice: '公共音色',
        privateVoice: '私有音色',
        allSex: '全部性别',
        allStyle: '全部风格',
        UGC: '用户自制',
        Advertisement: '广告',
        voiceLoading: '加载音色列表...',
        previousPage: '上一页',
        nextPage: '下一页',
        page: '第',
        total: '共',
        syntheticEffect: '合成效果',
        previewRes: '预览和管理结果',
        operationProcess: '操作流程',
        syntheticText: '合成文本',
        ready: '准备就绪',
        inPreparation: '准备中...',
        taskRes: '任务结果',
        taskStatus: '任务状态',
        outputAudio: '输出音频',
        downloadAudio: '下载音频',
        clearReset: '清空重置',
        startCloning: '开始克隆',
        startSynthesis: '开始合成',
        inProcessing: '处理中...',
        recordingCompleted: '录音完成，请点击上传',
        recording: '录音_',
        uploadSuccess: '文件上传成功',
        uploadFail: '文件上传失败',
        micPermission: '请求麦克风权限...',
        micPermissionFail: '无法访问麦克风，请检查权限设置',
        recording2: '正在录音...',
        recordingFail: '录音失败',
        audioFirst: '请先录制音频',
        recordUploadSuccess: '录音上传成功',
        recordUploadFail: '录音上传失败',
        recordPrepare: '准备录音',
        msgConfirm: '请确保已填写必要信息',
        messionPushFail: '任务提交失败',
        taskSuccess: '任务完成',
        durationInvalid: '视频时长无效，需要10s~5分钟，请重新上传',
        queryFail: '查询任务状态失败',
        trialListening: '试听',
        emptyState: '配置参数并开始生成，结果将显示在这里',
        resultTitle: '生成结果',
        addToLibrary: '添加到素材库',
        addedToLibrary: '已添加到素材库',
        addToLibraryFail: '添加到素材库失败',
        createAudioFile: '生成的音频文件',
        audioReadFail: '无法读取音频数据',
        fileReadFail: '文件读取失败',
        transWAV: '正在转换为 WAV 格式...',
        transWAVSuccess: 'WAV 格式转换完成',
        transWAVFail: '音频格式转换失败，将使用原始格式',
        downloadAll: '批量下载'
      },
      imageTranslation: {
        title: '图像翻译',
        subtitle: '使用 AI 在两张图片之间交换风格或面部',
        primaryLabel: '主图',
        referenceLabel: '参考图',
        promptPlaceholder: '描述期望的风格或换脸效果',
        generate: '生成',
        resultTitle: '翻译结果',
        emptyState: '上传图片开始图像翻译',
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
    rankPage: {
      title: 'AI 模型排行榜',
      description: 'LLM 性能、速度与定价的综合排行',
      dataSourceLabel: '数据来源',
      dataSourceValue: 'artificialanalysis.ai',
      columns: {
        model: '模型',
        intelligence: '智能指数',
        coding: '编码指数',
        math: '数学指数',
        speed: '速度',
        price: '价格（1M）'
      },
      fetchError: '排行榜数据加载失败'
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
      codePlaceholder: '4位验证码',
      sendCode: '获取验证码',
      codeSent: '已发送',
      signIn: '立即登录',
      countries: {
        china: '中国大陆',
        japan: '日本',
        indonesia: '印度尼西亚'
      }
    }
  },
  id: {
    header: {
      searchPlaceholder: 'Cari model...',
      signIn: 'Masuk',
      nav: [
        { label: 'Pusat Model', href: '/models' },
        { label: 'Pusat Kreatif', href: '/create' },
        { label: 'Pusat Pribadi', href: '/profile' },
      ],
      profile: 'Profil',
      expenses: 'Pengeluaran',
      notifications: 'Notifikasi',
    },
    hero: {
      status: 'Semua sistem beroperasi',
      titlePrefix: 'Antarmuka Terpadu',
      titleSuffix: 'untuk LLM',
      description: 'Akses model terbaik dari OpenAI, Anthropic, Google, Meta, dan lainnya melalui satu API standar. Harga terendah, latensi terbaik.',
      getStarted: 'Mulai',
      viewPricing: 'Lihat Harga'
    },
    modelList: {
      explore: 'Jelajahi Model',
      searchPlaceholder: 'Filter berdasarkan nama, penyedia, atau tag...',
      headers: {
        model: 'Model',
        context: 'Konteks',
        inputCost: 'Biaya Input',
        outputCost: 'Biaya Output'
      },
      noResults: 'Tidak ada model yang cocok',
      free: 'GRATIS',
      new: 'BARU'
    },
    modelSquare: {
      title: 'Plaza Model',
      totalModels: 'model',
      filterSearch: 'Filter Pencarian',
      filters: {
        searchPlaceholder: 'Cari jalur atau nama model',
        nameLabel: 'Nama Model',
        vendorLabel: 'Seri/Vendor',
        capabilityLabel: 'Tag Kemampuan',
        billingLabel: 'Jenis Penagihan',
        displayLabel: 'Pengaturan Tampilan',
        all: 'Semua',
        reset: 'Reset',
        hideFilters: 'Sembunyikan Filter',
      },
      display: {
        currency: 'Mata Uang',
        unit: 'Unit',
        amount: 'Jumlah',
      },
      card: {
        new: 'Baru',
        perMillion: '1M token',
        perSecond: 'detik',
        actions: {
          calculate: 'Hitung',
          chat: 'Chat',
        }
      }
    },
    createPage: {
      greeting: 'Hai! Apa yang ingin Anda',
      greetingSuffix: 'buat hari ini?',
      inputPlaceholder: 'Jelaskan gambar yang ingin Anda hasilkan...',
      send: 'Hasilkan',
      upload: 'Unggah',
      keyboardHint: 'Enter untuk kirim · Shift + Enter untuk baris baru',
      sideMenu: {
        home: 'Beranda',
        createHome: 'Beranda Kreatif',
        modelCenter: 'Pusat Model',
        creationCenter: 'Pusat Kreatif',
        personalCenter: 'Pusat Pribadi',
        aiExperience: 'Pengalaman AI',
        modelSquare: 'Plaza Model',
        apiKeys: 'Kunci API',
        apiDocs: 'Dokumen API',
        rank: 'Papan Peringkat',
        viralVideo: 'Video Viral',
        digitalHuman: 'Manusia Digital',
        imgToVideo: 'Gambar ke Video',
        textToImage: 'Teks ke Gambar',
        styleTransfer: 'Transfer Gaya',
        voiceClone: 'Kloning Suara',
        workshop: 'Workshop',
        faceSwap: 'Tukar Wajah AI',
        ttsTool: 'Teks ke Ucapan',
        glbViewer: 'Model 3D',
        imageTranslation: 'Terjemahan Gambar',
        videoTranslation: 'Terjemahan Video',
        assets: 'Aset',
        pricing: 'Harga',
        expenses: 'Pengeluaran Saya',
        profile: 'Profil',
      },
      shortcuts: {
        video: 'Video Viral AI',
        videoDesc: 'Buat skrip & video',
        avatar: 'Avatar Produk',
        avatarDesc: 'Manusia digital untuk produk',
        transform: 'Transfer Gaya',
        transformDesc: 'Ubah gaya objek',
        sketch: 'Sketsa ke Gambar',
        sketchDesc: 'Ubah sketsa menjadi seni',
        inpainting: 'Inpainting AI',
        inpaintingDesc: 'Hapus atau ganti objek',
        talkingPhoto: 'Foto Berbicara',
        talkingPhotoDesc: 'Buat foto berbicara'
      },
      tabs: ['Semua', 'Karakter', 'Hewan', 'Anime', 'Kreatif', 'Makanan', 'Pemandangan', 'Produk'],
      templateTypes: {
        textToImage: 'Teks ke Gambar',
        imageToImage: 'Gambar ke Gambar',
        textToVideo: 'Teks ke Video',
        imageToVideo: 'Gambar ke Video',
      },
      templateDetail: {
        makeSame: 'Buat Sama',
        likes: 'suka',
        originalImage: 'Asli:',
        noTemplates: 'Tidak ada template ditemukan.',
        featureNotOpen: 'Fitur ini belum tersedia',
      },
      authModal: {
        loginTitle: 'Selamat Datang Kembali',
        tabPassword: 'Kata Sandi',
        tabPhone: 'Telepon',
        accountLabel: 'Akun',
        accountPlaceholder: 'Masukkan akun Anda',
        passwordLabel: 'Kata Sandi',
        passwordPlaceholder: 'Masukkan kata sandi Anda',
        phoneLabel: 'Nomor Telepon',
        phonePlaceholder: 'Masukkan nomor telepon Anda',
        codeLabel: 'Kode Verifikasi',
        codePlaceholder: 'Masukkan kode verifikasi',
        sendCode: 'Kirim Kode',
        codeSent: 'Kode Terkirim',
        signIn: 'Masuk',
        agreePolicy: 'Saya setuju dengan',
        privacyPolicy: 'Kebijakan Privasi',
        terms: 'Ketentuan Layanan',
      },
      textToImage: {
        title: 'Pembuatan Gambar AI',
        subtitle: 'Hasilkan gambar indah dari deskripsi teks',
        inputLabel: 'Deskripsi Teks',
        inputPlaceholder: 'Jelaskan gambar yang ingin Anda hasilkan, misalnya: Kucing kecil yang lucu di taman yang diterangi matahari...',
        aiPolish: 'Poles AI',
        aiPolishThinking: 'Berpikir...',
        settingsTitle: 'Pengaturan Pembuatan',
        aspectRatio: 'Ukuran Gambar',
        generateConfig: 'Konfigurasi',
        generate: 'Hasilkan',
        resultTitle: 'Hasil Pembuatan',
        emptyState: 'Masukkan deskripsi untuk memulai perjalanan seni AI Anda',
        ratios: {
          square: 'Persegi',
          landscape43: 'Lanskap',
          portrait34: 'Potret',
          widescreen: 'Layar Lebar',
          mobile: 'Mobile',
          photo: 'Foto'
        },
        tabs: {
          textToImage: 'Teks ke Gambar',
          imageToImage: 'Gambar ke Gambar'
        },
        imageToImage: {
          uploadTitle: 'Unggah Gambar Referensi',
          uploadDesc: 'Klik atau seret untuk mengunggah gambar',
          uploadHint: 'Mendukung format JPG, PNG, maks 10MB'
        },
        actions: {
          clearAll: 'Hapus Semua',
          downloadAll: 'Unduh Semua',
          imageToVideo: 'Gambar ke Video',
          addToMaterials: 'Tambahkan ke Materi',
          viewFullSize: 'Lihat Ukuran Penuh',
          download: 'Unduh'
        },
        tips: {
          polishSuccess: 'Teks berhasil dipoles',
          polishFailed: 'Pemolesan teks gagal',
          imageSizeLimit: 'Ukuran gambar tidak boleh melebihi 10MB',
          imageRatioLimit: 'Rasio aspek gambar harus antara 1:3 dan 3:1',
          uploadSuccess: 'Gambar berhasil diunggah',
          uploadFailed: 'Pengunggahan gagal',
          generateSuccess: 'Berhasil menghasilkan gambar',
          generateEmpty: 'API mengembalikan sukses tetapi tidak ada data gambar yang ditemukan',
          generateFailed: 'Pembuatan gagal',
          downloadStarted: 'Unduhan dimulai',
          downloadFailed: 'Unduhan gagal',
          selectImageTip: 'Silakan pilih gambar terlebih dahulu',
          addToMaterialsSuccess: 'Ditambahkan ke materi',
          generating: 'Menghasilkan...'
        }
      },
      viralVideo: {
        title: 'Impor beberapa gambar, hasilkan video pemasaran produk',
        tabs: {
          upload: 'Unggah Aset Produk',
          link: 'Masukkan Tautan Produk'
        },
        uploadArea: {
          title: 'Silakan unggah 4-10 aset produk',
          desc: 'Ukuran gambar 20KB-15MB, resolusi >400*400, <8192*8192',
          limitation: 'Sementara hanya mendukung materi produk kategori pakaian/sepatu SKU yang sama (gambar model memerlukan hak potret), kategori lain akan segera hadir',
          selectFromPortfolio: 'Pilih dari Portofolio',
          uploadLocal: 'Unggah dari Lokal'
        },
        process: {
          uploadImages: 'Unggah Gambar Produk',
          generateVideo: 'Hasilkan Video Siaran',
          makeSame: 'Buat yang Sama dengan Satu Klik'
        },
        examples: 'Contoh Terbaik'
      },
      imgToVideo: {
        title: 'Gambar ke Video',
        subtitle: 'Unggah gambar dan jelaskan teks untuk membuat AI menghasilkan karya video indah untuk Anda',
        tabs: {
          traditional: 'Mode Tradisional',
          startEnd: 'Bingkai Awal/Akhir',
          advanced: 'Mode Lanjutan'
        },
        upload: {
          label: 'Unggah Gambar',
          button: 'Unggah Gambar',
          desc: 'Mendukung format JPG, PNG'
        },
        trySample: 'Coba Contoh',
        generationSettings: 'Pengaturan Pembuatan',
        prompt: {
          label: 'Prompt',
          placeholder: 'Silakan jelaskan konten video yang ingin Anda hasilkan',
          polish: 'Poles AI',
          maxLength: 1500
        },
        quality: {
          label: 'Pilihan Kualitas',
          options: {
            lite: 'Lite',
            pro: 'Pro',
            best: 'Terbaik'
          },
          tips: {
            lite: '480P, Kecepatan pembuatan lebih cepat',
            pro: '1080P, Peningkatan gerakan tubuh dan realisme fisik',
            best: 'Video AI terbaik dengan gerakan dan realisme fisik tingkat atas'
          }
        },
        duration: {
          label: 'Durasi Video',
          units: 's'
        },
        generatingCount: 'Jumlah Pembuatan:',
        negativePrompt: {
          label: 'Prompt Negatif (Opsional)',
          placeholder: 'Daftar konten yang tidak ingin Anda lihat dalam video. Contoh: animasi, blur, distorsi...'
        },
        generate: 'Buat',
        credits: 'Kredit',
        actions: {
          clearAll: 'Hapus Semua',
          downloadAll: 'Unduh Semua'
        },
        result: {
          label: 'Hasil Pembuatan',
          emptyState: 'Unggah gambar dan masukkan teks deskripsi untuk memulai perjalanan pembuatan video AI Anda'
        },
        generating: 'Membuat karya agung Anda...',
        progressStatusShort: 'Membuat'
      },
      digitalHuman: {
        title: 'Pembuatan Video Manusia Digital',
        subtitle: 'Unggah video dan konten audio manusia digital Anda untuk membuat AI menghasilkan karya video manusia digital profesional untuk Anda',
        tabs: {
          video: 'Video Manusia Digital',
          product: 'Manusia Digital Produk',
          singing: 'Manusia Digital Bernyanyi'
        },
        leftPanel: {
          myDigitalHuman: 'Manusia Digital Saya',
          uploadTitle: 'Unggah Video Manusia Digital',
          uploadFormat: '(mp4, mov, webm)',
          uploadDesc: 'Perlu video manusia digital menghadap ke depan, durasi 4s~3menit',
          personalTemplate: 'Template Pribadi',
          publicTemplate: 'Template Publik',
          customUpload: 'Unggah Kustom'
        },
        rightPanel: {
          modeSelection: 'Pilihan Mode',
          mode1: 'Manusia Digital 1',
          mode1_intro: {
            p1: 'Manusia digital berbasis gambar hanya menghasilkan gerakan kepala.',
            p2: 'Manusia digital berbasis video hanya memodifikasi gerakan bibir dalam video yang ada.',
            p3: 'Waktu pembuatan lebih cepat.'
          },
          mode2: 'Manusia Digital 2',
          mode2_intro: {
            p1: 'Gerakan bibir, ekspresi wajah, gerakan tangan, dan gerakan tubuh sesuai dengan konten ucapan, membuat video terlihat lebih alami dan realistis.',
            p2: 'Waktu pembuatan lebih lama.',
            p3: 'Durasi teks yang disarankan untuk dubbing AI adalah 15 detik untuk hasil terbaik; maks 28 detik.'
          },
          scriptContent: 'Konten Skrip',
          textToSpeech: 'Teks ke Ucapan',
          importAudio: 'Impor Audio',
          textPlaceholder: 'Masukkan teks untuk dubbing AI di sini, misalnya: Selamat datang di showcase produk kami, izinkan saya memperkenalkan fitur terbaru kami secara detail...',
          textLimit: 8000,
          voiceType: 'Jenis Suara',
          aiVoice: 'Suara Dubbing AI',
          publicVoice: 'Suara Publik',
          selectVoice: 'Pilih Suara',
          aiSubtitle: 'Subtitle yang Dihasilkan AI',
          selectSubtitleStyle: 'Pilih Gaya Subtitle',
          previewPlaceholder: 'Silakan masukkan teks.',
          buttonTip: {
            text: 'Silakan masukkan teks.',
            audio: 'Silakan pilih file audio.',
            default: '1 Poin = 30s atau 400 karakter'
          },
          diamondCoin: 'Poin',
          tryExample: 'Coba Contoh',
          generate: 'Hasilkan setelah pengaturan'
        },
        voiceModal: {
          title: 'Pilih Suara',
          tabs: {
            public: 'Suara Publik',
            custom: 'Suara Saya'
          },
          filters: {
            language: 'Bahasa',
            gender: 'Jenis Kelamin',
            age: 'Usia',
            style: 'Gaya'
          },
          filterOptions: {
            allLanguages: 'Semua Bahasa',
            allGenders: 'Semua Jenis Kelamin',
            male: 'Pria',
            female: 'Wanita',
            young: 'Muda',
            middleAge: 'Paruh Baya',
            old: 'Tua',
            ugc: 'UGC',
            ads: 'Iklan'
          }
        }
      },
      productAvatar: {
        leftPanel: {
          title: 'Pilih Template Avatar',
          uploadDiy: 'Unggah Kustom',
          picker: 'Pilih'
        },
        rightPanel: {
          templatePreview: 'Pratinjau Avatar',
          pickerTemplate: 'Silakan pilih template avatar',
          uploadMyFace: 'Unggah Wajah',
          productConfig: 'Konfigurasi Produk',
          uploadProductImg: 'Unggah Gambar Produk',
          productImg: 'Gambar Produk',
          productSize: 'Ukuran Produk',
          aiTips: 'Prompt Campuran AI',
          aiTipsPlaceholder: 'Beritahu AI cara mencampur produk dengan model avatar...',
          aiTextPlaceholder: 'Ganti item di gambar 1 dengan item di gambar 2. Pertahankan komposisi dan posisi orang di gambar 1 tidak berubah, dan sesuaikan gerakan agar sesuai dengan ukuran dan penampilan item baru. Item harus sama persis dengan di gambar 2.',
          trySample: 'Coba Contoh',
          startWorking: 'Mulai Menghasilkan',
          replacementSuccess: 'Penggantian Berhasil',
          uploadAvatar: 'Silakan pilih atau unggah avatar',
          autoShow: 'Otomatis'
        },
        sliderMarks: {
          tiny: 'Sangat Kecil',
          small: 'Kecil',
          medium: 'Sedang',
          large: 'Besar',
          xLarge: 'Sangat Besar',
          xxLarge: 'Sangat Besar'
        }
      },
      styleTransfer: {
        title: 'Transfer Gaya',
        subtitle: 'Ubah gaya objek di berbagai adegan',
        modes: {
          standard: {
            title: 'Mode Standar',
            desc: 'Gunakan template untuk transfer gaya'
          },
          creative: {
            title: 'Mode Kreatif',
            desc: 'Gunakan prompt untuk transformasi kreatif'
          },
          clothing: {
            title: 'Mode Pakaian',
            desc: 'Coba pakaian virtual'
          }
        },
        standard: {
          productTitle: 'Gambar Produk',
          productDesc: 'Unggah gambar produk yang ingin Anda ubah',
          uploadProduct: 'Unggah Gambar Produk',
          areaTitle: 'Area Template',
          areaDesc: 'Unggah gambar template atau pilih dari template',
          uploadTemplate: 'Unggah Gambar Template',
          selectTemplate: 'Pilih Template',
          support: 'JPG, PNG, WEBP'
        },
        clothing: {
          garmentTitle: 'Gambar Pakaian',
          garmentDesc: 'Unggah gambar pakaian',
          uploadGarment: 'Unggah Pakaian',
          modelTitle: 'Gambar Model',
          uploadModel: 'Unggah Model',
          types: {
            top: 'Atasan',
            bottom: 'Bawahan',
            full: 'Seluruh Tubuh'
          }
        },
        creative: {
          productTitle: 'Gambar Produk',
          promptTitle: 'Prompt',
          addRef: 'Tambahkan Referensi',
          tryExample: 'Coba Contoh',
          aiPolish: 'Poles AI',
          promptPlaceholder: 'Jelaskan adegan tempat Anda ingin menempatkan produk, misalnya: Tempatkan produk di lingkungan kantor modern dengan latar belakang yang bersih dan profesional...',
          uploadProduct: 'Unggah Gambar Produk',
          support: 'JPG, PNG, WEBP'
        },
        common: {
          generate: 'Hasilkan',
          resultTitle: 'Hasil Pembuatan',
          resultPlaceholder: 'Unggah gambar dan masukkan prompt untuk memulai perjalanan transfer gaya Anda'
        }
      },
      voiceClone: {
        title1: 'Kloning Suara',
        title2: 'Sintesis Suara',
        desc1: 'Unggah atau rekam klip audio, AI akan mengkloning suara manusia digital yang sangat mirip dengan Anda',
        desc2: 'Pilih suara favorit Anda, masukkan teks, dan hasilkan ucapan berkualitas tinggi dengan satu klik',
        attribute: 'Atribut Data',
        audioParameters: 'Konfigurasi Parameter Audio',
        audioName: 'Nama Audio',
        audioNamePlaceholder: 'Beri nama audio Anda',
        speakingSpeed: 'Kontrol Kecepatan Berbicara',
        audioText: 'Teks Audio',
        audioTextPlaceholder: 'Silakan masukkan konten teks untuk disintesis...',
        fileStatus: 'Status File',
        audioStatus: 'Status Suara',
        audioUploaded: 'Suara Dipilih',
        audioInfo: 'Informasi Audio',
        timbreInfo: 'Informasi Suara',
        fileName: 'Nama File',
        fileSize: 'Ukuran File',
        fileFormat: 'Format',
        audioName2: 'Nama Suara',
        sex: 'Jenis Kelamin',
        male: 'Pria',
        female: 'Wanita',
        style: 'Gaya',
        getAudio: 'Akuisisi Audio',
        getTimbre: 'Pilihan Suara',
        uploadOrOnline: 'Unggah File atau Rekaman Online',
        selectVoice: 'Pilih Suara yang Ada',
        uploadFile: 'Unggah File',
        onlineRecording: 'Rekaman Online',
        uploadAudio: 'Seret atau klik untuk mengunggah file audio',
        supportAudioType: 'Mendukung format MP3, WAV, ukuran file tidak melebihi 50MB',
        startRecording: 'Mulai Rekaman',
        stopRecording: 'Hentikan Rekaman',
        uploadRecording: 'Unggah Rekaman',
        previewRecording: 'Pratinjau Rekaman',
        clear: 'Hapus',
        commonVoice: 'Suara Publik',
        privateVoice: 'Suara Pribadi',
        allSex: 'Semua Jenis Kelamin',
        allStyle: 'Semua Gaya',
        UGC: 'Dibuat Pengguna',
        Advertisement: 'Iklan',
        voiceLoading: 'Memuat daftar suara...',
        previousPage: 'Halaman Sebelumnya',
        nextPage: 'Halaman Berikutnya',
        page: 'Halaman',
        total: 'Total',
        syntheticEffect: 'Efek Sintesis',
        previewRes: 'Pratinjau dan Kelola Hasil',
        operationProcess: 'Proses Operasi',
        syntheticText: 'Teks Sintesis',
        ready: 'Siap',
        inPreparation: 'Mempersiapkan...',
        taskRes: 'Hasil Tugas',
        taskStatus: 'Status Tugas',
        outputAudio: 'Audio Output',
        downloadAudio: 'Unduh Audio',
        clearReset: 'Hapus Reset',
        startCloning: 'Mulai Kloning',
        startSynthesis: 'Mulai Sintesis',
        inProcessing: 'Memproses...',
        recordingCompleted: 'Rekaman selesai, silakan klik unggah',
        recording: 'Rekaman_',
        uploadSuccess: 'File berhasil diunggah',
        uploadFail: 'Pengunggahan file gagal',
        micPermission: 'Meminta izin mikrofon...',
        micPermissionFail: 'Tidak dapat mengakses mikrofon, silakan periksa pengaturan izin',
        recording2: 'Merekam...',
        recordingFail: 'Rekaman gagal',
        audioFirst: 'Silakan rekam audio terlebih dahulu',
        recordUploadSuccess: 'Rekaman berhasil diunggah',
        recordUploadFail: 'Pengunggahan rekaman gagal',
        recordPrepare: 'Persiapkan Rekaman',
        msgConfirm: 'Silakan pastikan semua informasi yang diperlukan telah diisi',
        messionPushFail: 'Pengiriman tugas gagal',
        taskSuccess: 'Tugas selesai',
        durationInvalid: 'Durasi video tidak valid, perlu 10s~5 menit, silakan unggah ulang',
        queryFail: 'Gagal meminta status tugas',
        trialListening: 'Dengarkan Percobaan',
        emptyState: 'Konfigurasi parameter dan mulai pembuatan, hasil akan ditampilkan di sini',
        resultTitle: 'Hasil Pembuatan',
        addToLibrary: 'Tambahkan ke Perpustakaan Materi',
        addedToLibrary: 'Ditambahkan ke Perpustakaan Materi',
        addToLibraryFail: 'Gagal menambahkan ke Perpustakaan Materi',
        createAudioFile: 'File Audio yang Dihasilkan',
        audioReadFail: 'Tidak dapat membaca data audio',
        fileReadFail: 'Pembacaan file gagal',
        transWAV: 'Mengonversi ke format WAV...',
        transWAVSuccess: 'Konversi format WAV selesai',
        transWAVFail: 'Konversi format audio gagal, akan menggunakan format asli',
        downloadAll: 'Unduh Semua'
      },
      imageTranslation: {
        title: 'Terjemahan Gambar',
        subtitle: 'Gunakan AI untuk menukar wajah atau gaya antar gambar',
        primaryLabel: 'Gambar Utama',
        referenceLabel: 'Gambar Referensi',
        promptPlaceholder: 'Jelaskan gaya atau wajah yang ingin Anda terjemahkan',
        generate: 'Hasilkan',
        resultTitle: 'Hasil Terjemahan',
        emptyState: 'Unggah gambar untuk memulai',
      },
      workshop: {
        title: 'Workshop Kreatif',
        description: 'Jelajahi alat AI kreatif',
        allTools: 'Semua Alat',
        image: 'Gambar',
        video: 'Video',
        audio: 'Audio',
        others: 'Lainnya',
        tools: {
          translation: {
            title: 'Tukar Wajah AI',
            description: 'Gunakan teknologi AI untuk penggantian wajah',
            emoji: '🧍'
          },
          tts: {
            title: 'Teks ke Ucapan',
            description: 'Ubah teks menjadi ucapan alami',
            emoji: '🎤'
          },
          glbViewer: {
            title: 'Penampil Model 3D',
            description: 'Lihat dan manipulasi model 3D',
            emoji: '🤖'
          },
          customPrompt: {
            title: 'Prompt Kustom',
            description: 'Hasilkan gambar dengan prompt kustom',
            emoji: '✍️'
          },
          imageTranslation: {
            title: 'Terjemahan Gambar',
            description: 'Ubah gambar menjadi gaya berbeda',
            emoji: '🧍'
          },
          aiTemplate: {
            title: 'Template AI',
            description: 'Hasilkan konten dengan cepat menggunakan template AI',
            emoji: '🖼️'
          }
        }
      }
    },
    rankPage: {
      title: 'Papan Peringkat Model AI',
      description: 'Peringkat komprehensif LLM berdasarkan performa, kecepatan, dan harga',
      dataSourceLabel: 'Sumber data',
      dataSourceValue: 'artificialanalysis.ai',
      columns: {
        model: 'Model',
        intelligence: 'Kecerdasan',
        coding: 'Pemrograman',
        math: 'Matematika',
        speed: 'Kecepatan',
        price: 'Harga (1M)'
      },
      fetchError: 'Gagal memuat data peringkat'
    },
    chatPage: {
      settingsTitle: 'Pengaturan Dialog',
      selectModel: 'Pilih Model',
      paramsTitle: 'Parameter',
      temperature: 'Suhu',
      temperatureDesc: 'Kontrol keacakan: lebih tinggi lebih kreatif.',
      presencePenalty: 'Topik Baru',
      presencePenaltyDesc: 'Dorong topik baru: lebih tinggi menghukum pengulangan.',
      shortcutsTitle: 'Pintasan',
      actions: {
        clear: 'Hapus Chat',
        save: 'Simpan Chat',
        new: 'Chat Baru',
        refresh: 'Segarkan Rekaman'
      },
      historyTitle: 'Riwayat',
      noHistory: 'Belum ada rekaman',
      mainTitle: 'Area Dialog',
      statusReady: 'Siap',
      inputPlaceholder: 'Masukkan pertanyaan Anda... (Enter untuk mengirim, Shift+Enter untuk baris baru)',
      send: 'Kirim',
      welcomeMessage: 'Hai! Saya adalah asisten AI Anda. Bagaimana saya bisa membantu Anda hari ini?',
      footerTip: 'Penafian: Konten dihasilkan oleh AI. Akurasi tidak dijamin.'
    },
    keysPage: {
      title: 'Manajemen Kunci API',
      createButton: 'Kunci API Baru',
      labels: {
        limit: 'Batas Total',
        remaining: 'Tersisa',
        used: 'Digunakan',
        expires: 'Kedaluwarsa',
        status: 'Status'
      },
      values: {
        unlimited: 'Tidak Terbatas',
        never: 'Tidak Pernah'
      },
      actions: {
        disable: 'Nonaktifkan',
        enable: 'Aktifkan',
        delete: 'Hapus',
        edit: 'Edit'
      },
      status: {
        active: 'Aktif',
        disabled: 'Dinonaktifkan'
      }
    },
    expensesPage: {
      title: 'Pusat Kredit/Saldo',
      subtitle: 'Lihat dan kelola saldo kredit Anda, pahami penggunaan kredit',
      balanceLabel: 'Saldo',
      convertPoints: 'Poin yang Dapat Dikonversi',
      buttons: {
        points: 'Poin',
        balance: 'Saldo',
        freeMember: 'Anggota Gratis',
        refresh: 'Segarkan',
      },
      recordsTitle: 'Catatan Penggunaan',
      refreshData: 'Segarkan Data',
      record: {
        type: 'Jenis',
        duration: 'Waktu',
        input: 'Input',
        output: 'Output',
        consumption: 'Konsumsi'
      }
    },
    pricingPage: {
      title: 'Daftar Harga',
      subtitle: 'Pilih paket layanan kreatif AI yang paling sesuai untuk Anda dan mulai perjalanan pembuatan konten cerdas Anda',
      paymentCycle: 'Pilihan Siklus Pembayaran',
      questions: 'Pertanyaan tentang isi ulang? Klik di sini',
      paymentMethod: 'Metode Pembayaran:',
      wechatPay: 'WeChat Pay',
      invoice: 'Terbitkan Faktur:',
      invoiceLabel: '',
      starter: {
        title: 'Starter',
        features: [
          '¥ 1.72 / 1 Kredit',
          'Integrasi AI yang fleksibel',
          'Large Model API+ siap pakai',
          'Kemampuan multi-modal, mencakup berbagai skenario',
          'Pratinjau video tidak terbatas',
          '500+ manusia digital dan suara',
          'Pelestarian aset digital tidak terbatas',
          'Foto berbicara panjang video maks 180s',
          'Tanpa Watermark',
          'Kecepatan rendering lebih cepat'
        ]
      },
      business: {
        title: 'Business',
        features: [
          '¥ 1.59 / 1 Kredit',
          'Integrasi AI yang fleksibel, Saluran Prioritas',
          'Large Model API+ siap pakai',
          'Kemampuan multi-modal, mencakup berbagai skenario',
          'Pratinjau video tidak terbatas',
          '500+ manusia digital dan suara',
          'Pelestarian aset digital tidak terbatas',
          'Foto berbicara panjang video maks 1800s',
          'Tanpa Watermark',
          'Kecepatan rendering prioritas tertinggi'
        ]
      },
      enterprise: {
        title: 'Enterprise',
        slogan: "Mari berbicara!",
        features: [
          'Kursi tim kustom',
          'Batas kredit kustom',
          'Manusia digital kustom',
          'Suara AI kustom',
          'Fungsi kustom',
          'Pengembangan fitur yang disesuaikan'
        ]
      },
      labels: {
        credits: 'Kredit Tersedia:',
        quantity: 'Jumlah Pembelian',
        custom: 'Kustom',
        buy: 'Beli Sekarang',
        contact: 'Hubungi Kami'
      }
    },
    assetsPage: {
      title: 'Manajemen Aset AI',
      subtitle: 'Kelola aset video dan gambar Anda. Pratinjau, edit, dan operasi batch.',
      filterSearch: 'Filter Pencarian',
      searchName: 'Nama Aset',
      namePlaceholder: 'Cari nama',
      searchType: 'Jenis Aset',
      chooseType: 'Pilih jenis',
      searchTag: 'Tag Aset',
      tagPlaceholder: 'Cari tag',
      searchDesc: 'Deskripsi',
      descPlaceholder: 'Cari deskripsi',
      search: 'Cari',
      reset: 'Reset',
      newFolder: 'Folder Baru',
      upload: 'Unggah',
      move: 'Pindahkan',
      delete: 'Hapus',
      selectAll: 'Pilih Semua',
      totalFolders: 'Folder',
      totalFiles: 'File',
      searchInResult: 'Cari dalam hasil',
    },
    profilePage: {
      title: 'Pusat Pribadi',
      subtitle: 'Kelola informasi akun dan pengaturan keamanan Anda',
      basicInfo: 'Informasi Dasar',
      accountSecurity: 'Keamanan Akun',
      avatar: 'Avatar',
      uploadAvatar: 'Ubah Avatar',
      labels: {
        nickname: 'Nama Panggilan',
        phone: 'Nomor Telepon',
        email: 'Email',
        gender: 'Jenis Kelamin',
        createTime: 'Waktu Pendaftaran',
        role: 'Peran',
        dept: 'Departemen',
        password: 'Kata Sandi'
      },
      placeholders: {
        nickname: 'Masukkan nama panggilan Anda',
        phone: 'Masukkan nomor telepon Anda',
        email: 'Masukkan email Anda'
      },
      gender: {
        male: 'Pria',
        female: 'Wanita',
        unknown: 'Tidak Diketahui'
      },
      buttons: {
        save: 'Simpan Perubahan',
        reset: 'Reset',
        changePassword: 'Ubah Kata Sandi'
      }
    },
    footer: {
      privacy: 'Privasi',
      terms: 'Ketentuan',
      twitter: 'Twitter',
      discord: 'Discord'
    },
    auth: {
      loginTitle: 'Selamat Datang Kembali',
      tabPassword: 'Kata Sandi',
      tabPhone: 'Telepon',
      accountLabel: 'Email atau Nama Pengguna',
      accountPlaceholder: 'Masukkan email Anda',
      passwordLabel: 'Kata Sandi',
      passwordPlaceholder: 'Masukkan kata sandi Anda',
      phoneLabel: 'Nomor Telepon',
      phonePlaceholder: 'Masukkan nomor telepon',
      codeLabel: 'Kode Verifikasi',
      codePlaceholder: 'Kode 4 digit',
      sendCode: 'Kirim Kode',
      codeSent: 'Terkirim!',
      signIn: 'Masuk',
      countries: {
        china: 'China',
        japan: 'Jepang',
        indonesia: 'Indonesia'
      }
    }
  }
};
