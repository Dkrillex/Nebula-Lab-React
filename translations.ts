import { NavItem } from './types';

interface Translation {
  header: {
    searchPlaceholder: string;
    signIn: string;
    nav: NavItem[];
    profile: string; // Add this
    expenses: string;
    notifications: string;
    signOut: string;
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
      uploadCustomAvatar: string;
      faceSwap: string;
      ttsTool: string;
      glbViewer: string;
      imageTranslation: string;
      videoTranslation: string;
      productReplace: string;
      // Personal Center items
      assets: string;
      pricing: string;
      expenses: string;
      profile: string;
      // Footer items
      footer: {
        privacyPolicy: string;
        recordInfo: string;
        icpNumber: string;
        copyright: string;
        companyName: string;
      };
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
      loginSubtitle: string;
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
        previewActions: {
          fullscreen: string;
          download: string;
          addToMaterials: string;
        };
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
        previewGeneratingTip?: string;
        generatingLabel?: string;
        loadingStatus?: string;
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
        automaticMode: string;
        manualMode: string;
        instructionUploadProduct: string;
        instructionDrag: string;
        instructionRotate: string;
        instructionScale: string; // Should mention Alt(Option) for Mac compatibility
        resetPosition: string;
        removingBackground: string;
        waitBackgroundRemoval: string;
        setProductLocation: string;
        generating: string;
        pleaseWait: string;
        previewPlaceholder: string;
        resultTitle: string;
      };
      sliderMarks: {
        tiny: string;
        small: string;
        medium: string;
        large: string;
        xLarge: string;
        xxLarge: string;
      };
      productReplace: {
        pageTitle: string;
        pageDescription: string;
        tip: string;
        tip1: string;
        panelTitle: string;
        panelDescription: string;
        overlayText1: string;
        overlayText2: string;
        regenerateText: string;
        regenerate: string;
        videoConfigTitle: string;
        videoConfigDescription: string;
        modeLabel: string;
        modeDescLite: string;
        modeDescPro: string;
        modeDescAvatar2: string;
        scriptLabel: string;
        scriptPlaceholder: string;
        voiceLabel: string;
        changeVoice: string;
        selectVoice: string;
        captionLabel: string;
        changeCaption: string;
        selectCaption: string;
        generateVideo: string;
        originalMaterial: string;
        configInfo: string;
        configMode: string;
        configVoice: string;
        configScript: string;
        notSelected: string;
        resultTitle: string;
        resultDescription: string;
        exportVideo: string;
        addToMaterials: string;
        imagePreview: string;
        selectImageFirst: string;
        selectVoiceFirst: string;
        selectAudioFirst: string;
        errors: {
          taskTimeout: string;
          queryFailed: string;
          sampleLoadFailed: string;
          generateFailed: string;
        };
        tips: {
          downloadStarted: string;
        };
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
          primaryUploaderTitle?: string;
          primaryUploaderDescription?: string;
          secondaryUploaderTitle?: string;
          secondaryUploaderDescription?: string;
        };
      };
    };
    uploadCustomAvatar: {
      tips: {
        page: {
          title: string;
          description: string;
        };
        form: {
          title: string;
          label: string;
          uploadView: string;
          uploadText: string;
          uploadHint: string;
          requirements: string[];
        };
        formLabel: string;
        input: string;
        primary: string;
        primary1: string;
        actionBtn: string;
        statusCard: string;
        generatingText: string;
        generatingText1: string;
        successIcon: string;
        actionBtn2: string;
        errorIcon: string;
        errorContent: string;
        secondary: string;
        previewVideo: string;
      };
      script: {
        errors: {
          e1: string;
          e2: string;
          e3: string;
          e4: string;
          e5: string;
          e6: string;
          e7: string;
          e8: string;
          e9: string;
        };
        success: {
          s1: string;
          s2: string;
          s3: string;
          s4: string;
          s5: string;
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
    functionMode: {
      title: string;
      chat: string;
      image: string;
      video: string;
    };
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
    };
    status: {
      paid: string; // 已扣款
      unpaid: string; // 未扣款
      failed: string; // 失败
      unknown: string; // 未知
    };
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
    };
    serviceAdvantages: {
      title: string;
      aiCreation: string;
      efficientContent: string;
      techSupport: string;
      dataSecurity: string;
    };
    needHelp: {
      title: string;
      callPhone: string;
    };
    wechatPayModal: {
      scanToPay: string;
      paySuccess: string;
      thankYou: string;
      payAmount: string;
      generatingQR: string;
      pleaseWait: string;
      step1: string;
      step2: string;
      step3: string;
      tip: string;
    };
    consultModal: {
      title: string;
      contactUs: string;
      scanQR: string;
      workTime: string;
      serviceSupport: string;
    };
    enterpriseModal: {
      title: string;
      subtitle: string;
      phone: string;
      serviceTime: string;
      workDays: string;
      wechatContact: string;
      scanToAdd: string;
      customSolution: string;
      techSupport: string;
      dataAnalysis: string;
    };
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
    loginSubtitle: string;
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
  aiVideoFaceSwapPage: {
    title: string;
    subtitle: string;
    uploadVideo: {
      title: string;
      uploading: string;
      clickOrDrag: string;
      formats: string;
      duration: string;
      resolution: string;
      size: string;
      editVideo: string;
    };
    uploadImage: {
      title: string;
      uploading: string;
      clickOrDrag: string;
      formats: string;
      resolution: string;
      size: string;
    };
    buttons: {
      generating: string;
      generateVideo: string;
      clearResult: string;
    };
    result: {
      title: string;
      emptyState: string;
      downloadVideo: string;
      importMaterial: string;
      importedToast: string;
    };
    errors: {
      videoProcessingFailed: string;
      videoUploadFailed: string;
      videoProcessTaskFailed: string;
      videoProcessFailed: string;
      videoUrlMissing: string;
      imageUploadFailed: string;
      imageSizeExceeded: string;
      imageResolutionTooSmall: string;
      imageResolutionTooLarge: string;
      imageValidationFailed: string;
      videoFormatNotSupported: string;
      videoSizeExceeded: string;
      videoDurationExceeded: string;
      videoResolutionExceeded: string;
      videoFpsExceeded: string;
      videoMetadataLoadFailed: string;
      videoMetadataLoadTimeout: string;
      videoLoadFailed: string;
      videoMaskDrawingRequired: string;
      imageRequired: string;
      generateFailed: string;
    };
    videoEditingModal: {
      back: string;
      title: string;
      markModifyArea: string;
      markProtectArea: string;
      clear: string;
      previewAllAreas: string;
      cancel: string;
      confirm: string;
      loadingVideo: string;
      renderingMarks: string;
      generating: string;
      processing: string;
      videoLoadFailed: string;
    };
  };
  error: {
    sessionExpired: string;
    unknownError: string;
    networkError: string;
    timeout: string;
    requestFailed: string;
    errorTitle: string;
    successTitle: string;
    operationSuccess: string;
    close: string;
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
      signOut: 'Sign out',
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
        uploadCustomAvatar: 'Upload Custom Avatar',
        faceSwap: 'AI Video Face Swap',
        ttsTool: 'Text to Speech',
        glbViewer: '3D Model',
        imageTranslation: 'AI Image Face Swap',
        videoTranslation: 'Video Translation',
        productReplace: 'Product Digital Human',
        assets: 'Assets',
        pricing: 'Pricing',
        expenses: 'My Expenses',
        profile: 'Profile',
        footer: {
          privacyPolicy: 'Privacy Policy',
          recordInfo: 'Filing Info',
          icpNumber: 'ICP备2022093288号-4',
          copyright: 'Copyright © 2025',
          companyName: 'Nebula Data (HK) Limited'
        }
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
        loginSubtitle: 'Please enter your phone number to start your creative journey',
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
          emptyState: 'Upload image and enter description text to start your AI video creation journey',
          previewActions: {
            fullscreen: 'View Full Screen',
            download: 'Download',
            addToMaterials: 'Add to Materials'
          }
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
          previewGeneratingTip: 'Generating your video...',
          generatingLabel: 'Generating...',
          loadingStatus: 'Generating',
          buttonTip: {
            text: 'Please enter text.',
            audio: 'Please select an audio file.',
            default: '1 Point = 30s or 400 chars'
          },
          diamondCoin: 'Points',
          tryExample: 'Try Example',
          generate: 'Start Generating'
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
          autoShow: 'Auto',
          automaticMode: 'Automatic Mode',
          manualMode: 'Manual Mode',
          instructionUploadProduct: 'Please upload product image first',
          instructionDrag: 'Drag: Hold left mouse button to move product',
          instructionRotate: 'Rotate: Hold Shift + drag',
          instructionScale: 'Scale: Hold Alt(Option) + drag up/down',
          resetPosition: 'Reset Position',
          removingBackground: 'Removing background...',
          waitBackgroundRemoval: 'Please wait for background removal to complete',
          setProductLocation: 'Please set product location',
          generating: 'AI Generating',
          pleaseWait: 'AI is analyzing...',
          previewPlaceholder: 'Generated results will appear here',
          resultTitle: 'Generation Results'
        },
        sliderMarks: {
          tiny: 'Tiny',
          small: 'Small',
          medium: 'Medium',
          large: 'Large',
          xLarge: 'X-Large',
          xxLarge: 'XX-Large'
        },
        productReplace: {
          pageTitle: 'Product + AI Digital Human Synthesis',
          pageDescription: 'AI is generating professional product showcase videos for you, please wait patiently for amazing results',
          tip: 'Synthesizing images, approximately 1~2 minutes...',
          tip1: 'Synthesizing video, approximately 1~2 minutes...',
          panelTitle: 'View Generation Results',
          panelDescription: 'Nebula Lab has generated product digital human images for you, please combine with copy to drive video',
          overlayText1: 'Version 1',
          overlayText2: 'Version 2',
          regenerateText: 'Generate More Versions',
          regenerate: 'Regenerate',
          videoConfigTitle: 'Video Production Configuration',
          videoConfigDescription: 'Configure your video parameters and voice content',
          modeLabel: 'Generation Mode',
          modeDescLite: 'Fast generation, 720p, up to 60 seconds',
          modeDescPro: 'High quality generation, 1080p, up to 60 seconds',
          modeDescAvatar2: 'Best quality, 1080p, up to 28 seconds',
          scriptLabel: 'AI Voiceover Script',
          scriptPlaceholder: 'Please enter the script content for AI voiceover...',
          voiceLabel: 'Voice Selection',
          changeVoice: 'Change Voice',
          selectVoice: 'Select Voice',
          captionLabel: 'Caption Style',
          changeCaption: 'Change Caption Style',
          selectCaption: 'Select Caption Style',
          generateVideo: 'Consume {points} points to create video',
          originalMaterial: 'Original Material',
          configInfo: 'Configuration Info',
          configMode: 'Generation Mode:',
          configVoice: 'Voice:',
          configScript: 'Script:',
          notSelected: 'Not Selected',
          resultTitle: 'Generation Results',
          resultDescription: 'Your professional product showcase video is ready',
          exportVideo: 'Export Video',
          addToMaterials: 'Add to Materials',
          imagePreview: 'Image Preview',
          selectImageFirst: 'Please select an image first',
          selectVoiceFirst: 'Please select a voice',
          selectAudioFirst: 'Please select an audio file',
          errors: {
            taskTimeout: 'Task timeout',
            queryFailed: 'Query failed',
            sampleLoadFailed: 'Failed to load sample',
            generateFailed: 'Generation failed'
          },
          tips: {
            downloadStarted: 'Download started...'
          }
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
      ttsPage: {
        title: 'Text to Speech',
        description: 'Convert text to natural, fluent speech with multiple voices and languages',
        inputText: 'Input Text',
        inputPlaceholder: 'Enter the text you want AI to voice here, e.g.: Welcome to our product showcase, let me introduce our latest features in detail...',
        voice: 'Voice',
        language: 'Language',
        generate: 'Generate Speech',
        generating: 'Generating...',
        resultTitle: 'Generation Result',
        emptyState: 'Configure parameters and start generation, results will be displayed here',
        generatingState: 'Generating speech...',
        downloadAudio: 'Download Audio',
        importToMaterials: 'Import to Material Library',
        importedToMaterials: 'Imported to Material Library',
        errors: {
          pleaseLogin: 'Please login first',
          enterText: 'Please enter text content',
          generateFailed: 'Generation failed',
          noAudioToImport: 'No audio available to import',
          alreadyImported: 'Already imported to material library',
          importFailed: 'Import failed',
          uploadFailed: 'Upload failed'
        },
        voices: {
          CHERRY: 'Cherry',
          CHERRY_DESC: 'Sweet Female',
          ETHAN: 'Ethan',
          ETHAN_DESC: 'Mature Male',
          NOFISH: 'Nofish',
          NOFISH_DESC: 'Neutral Voice',
          JENNIFER: 'Jennifer',
          JENNIFER_DESC: 'Professional Female',
          RYAN: 'Ryan',
          RYAN_DESC: 'Young Male',
          KATERINA: 'Katerina',
          KATERINA_DESC: 'Elegant Female',
          ELIAS: 'Elias',
          ELIAS_DESC: 'Warm Male',
          JADA: 'Jada',
          JADA_DESC: 'Lively Female',
          DYLAN: 'Dylan',
          DYLAN_DESC: 'Steady Male',
          SUNNY: 'Sunny',
          SUNNY_DESC: 'Sunny Female',
          LI: 'Li',
          LI_DESC: 'Chinese Male',
          MARCUS: 'Marcus',
          MARCUS_DESC: 'Magnetic Male',
          ROY: 'Roy',
          ROY_DESC: 'Rich Male',
          PETER: 'Peter',
          PETER_DESC: 'Clear Male',
          ROCKY: 'Rocky',
          ROCKY_DESC: 'Rough Male',
          KIKI: 'Kiki',
          KIKI_DESC: 'Cute Female',
          ERIC: 'Eric',
          ERIC_DESC: 'Standard Male'
        },
        languages: {
          AUTO: 'Auto Detect',
          CHINESE: 'Chinese',
          ENGLISH: 'English',
          GERMAN: 'German',
          ITALIAN: 'Italian',
          PORTUGUESE: 'Portuguese',
          SPANISH: 'Spanish',
          JAPANESE: 'Japanese',
          KOREAN: 'Korean',
          FRENCH: 'French',
          RUSSIAN: 'Russian'
        }
      },
      workshop: {
        title: 'Creation Workshop',
        description: 'What can I help you create?',
        allTools: 'All Tools',
        image: 'Image',
        video: 'Video',
        audio: 'Audio',
        others: 'Others',
        tools: {
          translation: {
            title: 'AI Video Face Swap',
            description: 'Replace faces in your video with faces from images',
            emoji: '🧍'
          },
          tts: {
            title: 'Text to Speech',
            description: 'Convert text to natural, fluent speech with multiple voices and languages',
            emoji: '🎤'
          },
          '3dModel': {
            title: '3D Model',
            description: 'Transform your photo into a 3D render.',
            emoji: '🤖'
          },
          customPrompt: {
            title: 'Custom Prompt',
            description: 'Describe any transformation you can imagine. Upload up to two images as reference (e.g., character and style reference). Your creativity is the only limit!',
            emoji: '✍️',
            primaryUploaderTitle: 'Primary Image',
            primaryUploaderDescription: 'The main image to edit.',
            secondaryUploaderTitle: 'Reference Image (Optional)',
            secondaryUploaderDescription: 'A second image for style, content, or context.'
          },
          imageTranslation: {
            title: 'AI Image Face Swap',
            description: 'Replace the face in your primary image with the face from the reference image',
            emoji: '🧍'
          },
          aiTemplate: {
            title: 'Creative Image Generation',
            description: 'Generate corresponding content based on selected AI templates',
            emoji: '🖼️'
          },
          figurine: {
            title: '3D Figurine',
            description: 'Transform your photo into a collectible 3D character figurine with packaging.',
            emoji: '🧍'
          },
          funko: {
            title: 'Funko Pop',
            description: 'Reshape your subject into an adorable Funko Pop! vinyl figure, shown in its box.',
            emoji: '📦'
          },
          lego: {
            title: 'LEGO Minifigure',
            description: 'Build a LEGO minifigure version of your subject, ready to play.',
            emoji: '🧱'
          },
          crochet: {
            title: 'Crochet Doll',
            description: 'Transform your image into a soft, handmade crocheted yarn doll.',
            emoji: '🧶'
          },
          cosplay: {
            title: 'Anime to Cosplay',
            description: 'Transform an anime character into a realistic cosplay photo.',
            emoji: '🎭'
          },
          plushie: {
            title: 'Cute Plushie',
            description: 'Transform your subject into a cute, soft plushie doll.',
            emoji: '🧸'
          },
          keychain: {
            title: 'Acrylic Keychain',
            description: 'Create a cute acrylic keychain of your subject, perfect for hanging on a bag.',
            emoji: '🔑'
          },
          hdEnhance: {
            title: 'HD Enhance',
            description: 'Upscale your image, increasing sharpness and detail for a high-resolution look.',
            emoji: '🔍'
          },
          pose: {
            title: 'Pose Reference',
            description: 'Apply the pose from one image to the character in another image.',
            emoji: '💃',
            primaryUploaderTitle: 'Character',
            primaryUploaderDescription: 'Main character',
            secondaryUploaderTitle: 'Pose Reference',
            secondaryUploaderDescription: 'Pose to apply'
          },
          photorealistic: {
            title: 'Photorealistic',
            description: 'Transform paintings or illustrations into stunningly realistic photos.',
            emoji: '🪄'
          },
          fashion: {
            title: 'Fashion Magazine',
            description: 'Give your photo a high-fashion, editorial look worthy of a magazine cover.',
            emoji: '📸'
          },
          hyperrealistic: {
            title: 'Hyperrealistic',
            description: 'Apply a gritty, direct-flash photography style for a cool hyperrealistic vibe.',
            emoji: '✨'
          },
          architecture: {
            title: 'Architecture Model',
            description: 'Transform buildings into detailed miniature architecture models.',
            emoji: '🏗️'
          },
          productRender: {
            title: 'Product Render',
            description: 'Turn product sketches into professional, photorealistic 3D renders.',
            emoji: '💡'
          },
          sodaCan: {
            title: 'Soda Can Design',
            description: 'Wrap your image onto a soda can and place it in a beautiful product photo.',
            emoji: '🥤'
          },
          industrialDesign: {
            title: 'Industrial Design Render',
            description: 'Render industrial design sketches into realistic products displayed in a museum setting.',
            emoji: '🛋️'
          },
          iphoneWallpaper: {
            title: 'iPhone Wallpaper Effect',
            description: 'Instantly transform your image into a stylish iPhone lock screen interface.',
            emoji: '📱'
          },
          colorPalette: {
            title: 'Color Palette Swap',
            description: 'Convert the image to line art, then color it using the second image as a palette.',
            emoji: '🎨',
            primaryUploaderTitle: 'Original Image',
            primaryUploaderDescription: 'Image to convert',
            secondaryUploaderTitle: 'Color Palette',
            secondaryUploaderDescription: 'Color reference'
          },
          videoGeneration: {
            title: 'Video Generation',
            description: 'Create short videos through text prompts and optional images.',
            emoji: '🎬'
          },
          isolate: {
            title: 'Isolate and Enhance',
            description: 'Cut out the subject in the masked area and create a clean, high-definition portrait.',
            emoji: '🎯'
          },
          screen3d: {
            title: '3D Screen Effect',
            description: 'Make content on screens in your photos appear as glasses-free 3D.',
            emoji: '📺'
          },
          makeup: {
            title: 'Makeup Analysis',
            description: 'Analyze makeup in portraits and suggest improvements with red pen markings.',
            emoji: '💄'
          },
          background: {
            title: 'Change Background',
            description: 'Replace the existing background with a cool retro Y2K aesthetic style.',
            emoji: '🪩'
          },
          addIllustration: {
            title: 'Add Illustration',
            description: 'Add charming hand-drawn characters to your real-world photos.',
            emoji: '🧑‍🎨'
          },
          pixelArt: {
            title: 'Pixel Art',
            description: 'Transform your image into retro 8-bit pixel art.',
            emoji: '👾'
          },
          watercolor: {
            title: 'Watercolor',
            description: 'Transform your image into a soft and vibrant watercolor painting.',
            emoji: '🖌️'
          },
          popArt: {
            title: 'Pop Art',
            description: 'Reimagine your image in Andy Warhol\'s bold pop art style.',
            emoji: '🎨'
          },
          comicBook: {
            title: 'Comic Book',
            description: 'Turn your photo into a classic comic book panel.',
            emoji: '💥'
          },
          claymation: {
            title: 'Claymation',
            description: 'Recreate your image as a charming stop-motion claymation scene.',
            emoji: '🗿'
          },
          ukiyoE: {
            title: 'Ukiyo-e',
            description: 'Redraw your image in the style of traditional Japanese woodblock prints.',
            emoji: '🌊'
          },
          stainedGlass: {
            title: 'Stained Glass',
            description: 'Transform your image into a vibrant stained glass window.',
            emoji: '🪟'
          },
          origami: {
            title: 'Origami',
            description: 'Reconstruct your subject using an origami paper-folding style.',
            emoji: '🦢'
          },
          neonGlow: {
            title: 'Neon Glow',
            description: 'Outline your subject in bright, glowing neon lights.',
            emoji: '💡'
          },
          doodleArt: {
            title: 'Doodle Art',
            description: 'Overlay your image with playful, hand-drawn doodle-style illustrations.',
            emoji: '✏️'
          },
          vintagePhoto: {
            title: 'Vintage Photo',
            description: 'Give your image an aged, sepia-toned vintage photograph look.',
            emoji: '📜'
          },
          blueprintSketch: {
            title: 'Blueprint',
            description: 'Convert your image into a technical blueprint-style architectural drawing.',
            emoji: '📐'
          },
          glitchArt: {
            title: 'Glitch Art',
            description: 'Apply digital glitch effects including datamoshing and pixel sorting.',
            emoji: '📉'
          },
          doubleExposure: {
            title: 'Double Exposure',
            description: 'Blend your image with natural scenes in a double exposure effect.',
            emoji: '🏞️'
          },
          hologram: {
            title: 'Hologram',
            description: 'Project your subject as a futuristic, glowing blue hologram.',
            emoji: '🌐'
          },
          lowPoly: {
            title: 'Low Poly',
            description: 'Reconstruct your image using a low-polygon geometric mesh.',
            emoji: '🔺'
          },
          charcoalSketch: {
            title: 'Charcoal Sketch',
            description: 'Redraw your image as a dramatic, high-contrast charcoal sketch.',
            emoji: '✍🏽'
          },
          impressionism: {
            title: 'Impressionism',
            description: 'Repaint your image in the style of an Impressionist masterpiece.',
            emoji: '👨‍🎨'
          },
          cubism: {
            title: 'Cubism',
            description: 'Deconstruct your subject in the abstract, geometric style of Cubism.',
            emoji: '🧊'
          },
          steampunk: {
            title: 'Steampunk',
            description: 'Reimagine your subject with steampunk aesthetics featuring gears, brass, and Victorian-era technology.',
            emoji: '⚙️'
          },
          fantasyArt: {
            title: 'Fantasy Art',
            description: 'Transform your image into an epic fantasy-style painting.',
            emoji: '🐉'
          },
          graffiti: {
            title: 'Graffiti',
            description: 'Spray-paint your image as vibrant graffiti on a brick wall.',
            emoji: '🎨'
          },
          minimalistLineArt: {
            title: 'Minimalist Line Art',
            description: 'Reduce your image to a single, continuous, minimalist line drawing.',
            emoji: '〰️'
          },
          storybook: {
            title: 'Storybook',
            description: 'Redraw your image in the style of a whimsical children\'s storybook illustration.',
            emoji: '📖'
          },
          thermal: {
            title: 'Thermal Imaging',
            description: 'Apply a thermal imaging effect with a heat map color palette.',
            emoji: '🌡️'
          },
          risograph: {
            title: 'Risograph',
            description: 'Simulate a rough, limited-color Risograph print effect.',
            emoji: '📠'
          },
          crossStitch: {
            title: 'Cross Stitch',
            description: 'Convert your image into a textured, handmade cross-stitch pattern.',
            emoji: '🧵'
          },
          tattoo: {
            title: 'Tattoo Art',
            description: 'Redesign your subject as a classic American traditional style tattoo.',
            emoji: '🖋️'
          },
          psychedelic: {
            title: 'Psychedelic Style',
            description: 'Apply a vibrant, swirling psychedelic art style from the 1960s.',
            emoji: '🌀'
          },
          gothic: {
            title: 'Gothic',
            description: 'Reimagine your scene with a dark, gothic art style.',
            emoji: '🏰'
          },
          tribal: {
            title: 'Tribal Art',
            description: 'Redraw your subject using patterns and motifs from traditional tribal art.',
            emoji: '🗿'
          },
          dotPainting: {
            title: 'Dot Painting',
            description: 'Recreate your image using the dot painting technique of Aboriginal art.',
            emoji: '🎨'
          },
          chalk: {
            title: 'Chalk Drawing',
            description: 'Draw your image as a colorful chalk illustration on a sidewalk.',
            emoji: '🖍️'
          },
          sandArt: {
            title: 'Sand Art',
            description: 'Recreate your image as if it were made from colored sand.',
            emoji: '🏜️'
          },
          mosaic: {
            title: 'Mosaic',
            description: 'Transform your image into a mosaic made of small ceramic tiles.',
            emoji: '💠'
          },
          paperQuilling: {
            title: 'Paper Quilling',
            description: 'Reconstruct your subject using the art of paper quilling with rolled and shaped strips of paper.',
            emoji: '📜'
          },
          woodCarving: {
            title: 'Wood Carving',
            description: 'Recreate your subject as a detailed wood carving.',
            emoji: '🪵'
          },
          iceSculpture: {
            title: 'Ice Sculpture',
            description: 'Transform your subject into a translucent, detailed ice sculpture.',
            emoji: '🧊'
          },
          bronzeStatue: {
            title: 'Bronze Statue',
            description: 'Turn your subject into a weathered bronze statue on a pedestal.',
            emoji: '🗿'
          },
          galaxy: {
            title: 'Galaxy',
            description: 'Blend your image with a vibrant nebula and starry galaxy background.',
            emoji: '🌌'
          },
          fire: {
            title: 'Fire',
            description: 'Reimagine your subject as if it were formed from roaring flames.',
            emoji: '🔥'
          },
          water: {
            title: 'Water',
            description: 'Reimagine your subject as if it were formed from flowing, liquid water.',
            emoji: '💧'
          },
          smokeArt: {
            title: 'Smoke Art',
            description: 'Create your subject from elegant, swirling wisps of smoke.',
            emoji: '💨'
          },
          vectorArt: {
            title: 'Vector Art',
            description: 'Convert your photo into clean, scalable vector art with flat colors and sharp lines.',
            emoji: '🎨'
          },
          infrared: {
            title: 'Infrared',
            description: 'Simulate an infrared photo effect with surreal colors and glowing foliage.',
            emoji: '📸'
          },
          knitted: {
            title: 'Knitted',
            description: 'Recreate your image as a cozy, knitted wool pattern.',
            emoji: '🧶'
          },
          etching: {
            title: 'Etching',
            description: 'Redraw your image as a classic black and white etching or engraving.',
            emoji: '✒️'
          },
          diorama: {
            title: 'Diorama',
            description: 'Turn the scene into a miniature 3D diorama inside a box.',
            emoji: '📦'
          },
          paintingProcess: {
            title: 'Painting Process',
            description: 'Display a 4-panel grid showing the artistic process of creating this image, from sketch to final render.',
            emoji: '🖼️'
          },
          markerSketch: {
            title: 'Marker Sketch',
            description: 'Redraw your photo in the style of a Copic marker sketch, often used in design.',
            emoji: '🖊️'
          },
          vanGogh: {
            title: 'Van Gogh Style',
            description: 'Reimagine the photo in the style of Van Gogh\'s \'Starry Night\'.',
            emoji: '🌌'
          },
          cyberpunk: {
            title: 'Cyberpunk',
            description: 'Transform the scene into a futuristic cyberpunk city.',
            emoji: '🤖'
          },
          lineArt: {
            title: 'Line Art Drawing',
            description: 'Simplify your photo to its essential lines, creating a clean sketch.',
            emoji: '✍🏻'
          }
        }
      },
      uploadCustomAvatar: {
        tips: {
          page: {
            title: 'Custom Digital Human Video Generation',
            description: 'Upload your video file, AI will generate a professional custom digital human model for you'
          },
          form: {
            title: 'Generation Configuration',
            label: 'Video File',
            uploadView: 'Upload Video File',
            uploadText: 'Click or drag to upload video',
            uploadHint: 'Supports MP4, MOV formats, max size 100MB',
            requirements: [
              'Resolution: 360p ~ 4K',
              'Duration: 4s ~ 3min',
              'Requires front-facing digital human video'
            ]
          },
          formLabel: 'Digital Human Name',
          input: 'Enter custom digital human name',
          primary: 'Submitting...',
          primary1: 'Start Generation',
          actionBtn: 'Reset',
          statusCard: 'Task Status',
          generatingText: 'AI is generating your digital human model...',
          generatingText1: 'Estimated training time 2-3 minutes',
          successIcon: 'Generation Completed',
          actionBtn2: 'Add to Assets',
          errorIcon: 'Generation Failed',
          errorContent: 'Unknown Error',
          secondary: 'Please submit a task first',
          previewVideo: 'Your browser does not support video playback'
        },
        script: {
          errors: {
            e1: 'Please enter digital human name',
            e2: 'Name length between 2-20 characters',
            e3: 'Please upload video file',
            e4: 'Please enter valid score',
            e5: 'Submission failed, please try again',
            e6: 'Submission failed:',
            e7: 'No face detected',
            e8: 'Failed to query task progress',
            e9: 'Query failed:'
          },
          success: {
            s1: 'Video uploaded successfully',
            s2: 'Task submitted successfully!',
            s3: 'Task completed',
            s4: 'Form reset',
            s5: 'Successfully added to assets'
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
      footerTip: 'Disclaimer: Content is AI-generated. Accuracy not guaranteed.',
      functionMode: {
        title: 'Function Mode',
        chat: 'Chat',
        image: 'Image',
        video: 'Video'
      }
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
      },
      status: {
        paid: 'Paid',
        unpaid: 'Unpaid',
        failed: 'Failed',
        unknown: 'Unknown'
      }
    },
    aiVideoFaceSwapPage: {
      title: 'AI Video Face Swap',
      subtitle: 'Upload video and reference image, let AI generate face swap video for you',
      uploadVideo: {
        title: 'Upload Reference Video',
        uploading: 'Uploading and processing video...',
        clickOrDrag: 'Click or drag to upload video',
        formats: 'MP4, MOV format',
        duration: 'Duration ≤60s, frame rate ≤30fps',
        resolution: 'Resolution ≤1080P',
        size: 'Size ≤200MB',
        editVideo: 'Edit Video'
      },
      uploadImage: {
        title: 'Upload Reference Image',
        uploading: 'Uploading image...',
        clickOrDrag: 'Click or drag to upload image',
        formats: 'jpg/jpeg, png format',
        resolution: 'Resolution 128*128 - 4096*4096',
        size: 'Size not exceed 5MB'
      },
      buttons: {
        generating: 'Generating...',
        generateVideo: 'Generate Face Swap Video',
        clearResult: 'Clear Result'
      },
      result: {
        title: 'Generation Result',
        emptyState: 'Generated video will be displayed here',
        downloadVideo: 'Download Video',
        importMaterial: 'Import Material',
        importedToast: 'This video has been imported to material library'
      },
      errors: {
        videoProcessingFailed: 'Video processing failed',
        videoUploadFailed: 'Video upload failed, missing file ID',
        videoProcessTaskFailed: 'Failed to submit video processing task',
        videoProcessFailed: 'Video processing failed',
        videoUrlMissing: 'Video processing succeeded but no video URL returned',
        imageUploadFailed: 'Image upload failed, missing file ID',
        imageSizeExceeded: 'Image size cannot exceed 5MB after Base64 encoding',
        imageResolutionTooSmall: 'Image resolution cannot be smaller than 128*128',
        imageResolutionTooLarge: 'Image resolution cannot be larger than 4096*4096',
        imageValidationFailed: 'Image validation failed',
        videoFormatNotSupported: 'Video format only supports MP4, MOV, MP4 format is recommended; other formats are not supported yet, will be gradually opened. (HDR video encoding is not supported)',
        videoSizeExceeded: 'Video size cannot exceed 200MB',
        videoDurationExceeded: 'Video duration cannot exceed 60 seconds',
        videoResolutionExceeded: 'Video resolution cannot exceed 1080P (longest side ≤1920, shortest side ≤1080, supports landscape, portrait and lower resolutions)',
        videoFpsExceeded: 'Video frame rate cannot exceed 30fps',
        videoMetadataLoadFailed: 'Video metadata load failed',
        videoMetadataLoadTimeout: 'Video metadata load timeout',
        videoLoadFailed: 'Video load failed, please check if it meets requirements:\n1. Format: MP4, MOV (MP4 recommended, HDR not supported)\n2. Duration ≤60s, frame rate ≤30fps, resolution ≤1080P (longest side ≤1920, shortest side ≤1080)\n3. Size ≤200MB',
        videoMaskDrawingRequired: 'Please upload and process reference video first, and complete video mask drawing',
        imageRequired: 'Please upload reference image',
        generateFailed: 'Generation failed, please try again'
      },
      videoEditingModal: {
        back: 'Back',
        title: 'Click on the video to mark areas to be modified and areas to be protected',
        markModifyArea: 'Mark Modification Area',
        markProtectArea: 'Mark Protection Area',
        clear: 'Clear',
        previewAllAreas: 'Preview All Selected Areas',
        cancel: 'Cancel',
        confirm: 'Confirm',
        loadingVideo: 'Loading video...',
        renderingMarks: 'Rendering mark points, please wait...',
        generating: 'Generating, please wait...',
        processing: 'Processing...',
        videoLoadFailed: 'Video load failed'
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
      },
      serviceAdvantages: {
        title: 'Service Advantages',
        aiCreation: '✨ AI Intelligent Creation',
        efficientContent: '🚀 Efficient Content Generation',
        techSupport: '💎 Professional Tech Support',
        dataSecurity: '🔒 Data Security Guarantee'
      },
      needHelp: {
        title: 'Need Help?',
        callPhone: 'Call:'
      },
      wechatPayModal: {
        scanToPay: 'Scan to Pay',
        paySuccess: 'Payment Successful!',
        thankYou: 'Thank you for your purchase',
        payAmount: 'Payment Amount',
        generatingQR: 'Generating QR Code',
        pleaseWait: 'Please wait...',
        step1: 'Open WeChat Scan',
        step2: 'Scan the QR code above',
        step3: 'Confirm payment to complete',
        tip: 'The window will close automatically after payment. Please do not pay repeatedly.'
      },
      consultModal: {
        title: 'Online Consultation',
        contactUs: 'Contact Us',
        scanQR: 'Scan the QR code below to consult',
        workTime: 'Working Hours: Mon-Fri 9:00-18:00',
        serviceSupport: 'We will provide professional service support'
      },
      enterpriseModal: {
        title: 'Enterprise Custom Service',
        subtitle: 'Professional AI solutions for you',
        phone: 'Contact Phone',
        serviceTime: 'Service Hours',
        workDays: 'Weekdays 9:00-18:00',
        wechatContact: 'WeChat Contact',
        scanToAdd: 'Scan to add WeChat',
        customSolution: '🎯 Custom Solutions',
        techSupport: '🔧 Technical Support',
        dataAnalysis: '📊 Data Analysis'
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
      loginSubtitle: 'Please enter your phone number to start your creative journey',
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
    },
    error: {
      sessionExpired: 'Invalid session or session has expired, please log in again.',
      unknownError: 'Unknown error',
      networkError: 'Backend connection error',
      timeout: 'Request timeout',
      requestFailed: 'Request failed',
      errorTitle: 'Error',
      successTitle: 'Success',
      operationSuccess: 'Operation successful',
      close: 'Close'
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
      signOut: '退出登录',
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
        uploadCustomAvatar: '上传数字人',
        faceSwap: 'AI视频换脸',
        ttsTool: '文本转语音',
        glbViewer: '3D模型',
        imageTranslation: 'AI图片换脸',
        videoTranslation: '视频翻译',
        productReplace: '产品数字人',
        assets: '素材管理',
        pricing: '定价列表',
        expenses: '我的费用',
        profile: '个人中心',
        footer: {
          privacyPolicy: '隐私协议',
          recordInfo: '备案信息',
          icpNumber: '粤ICP备2022093288号-4',
          copyright: 'Copyright © 2025',
          companyName: '星雲數據(香港)有限公司'
        }
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
        loginSubtitle: '请输入您的手机号码以开始您的创意之旅',
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
          emptyState: '上传图片并输入描述文字，开始您的AI视频创作之旅',
          previewActions: {
            fullscreen: '全屏预览',
            download: '下载',
            addToMaterials: '导入素材'
          }
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
          previewGeneratingTip: '正在生成您的视频...',
          generatingLabel: '生成中...',
          loadingStatus: '正在生成',
          buttonTip: {
            text: '请输入文本。',
            audio: '请选择上传一个音频文件。',
            default: '1积分=30秒 或者 400个字符'
          },
          diamondCoin: '积分',
          tryExample: '试用示例',
          generate: '开始生成'
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
          autoShow: '自动',
          automaticMode: '自动模式',
          manualMode: '手动模式',
          instructionUploadProduct: '请先上传产品图片',
          instructionDrag: '拖动：按住鼠标左键移动产品图片',
          instructionRotate: '旋转：按住Shift键+鼠标拖动',
          instructionScale: '缩放：按住Alt(Option)键+鼠标上下拖动',
          resetPosition: '重置图片位置',
          removingBackground: '正在去除背景...',
          waitBackgroundRemoval: '请等待背景去除完成',
          setProductLocation: '请设置产品位置',
          generating: 'AI生成中',
          pleaseWait: 'AI正在分析...',
          previewPlaceholder: '生成结果将在这里显示',
          resultTitle: '生成结果'
        },
        sliderMarks: {
          tiny: '微小',
          small: '小',
          medium: '中',
          large: '大',
          xLarge: '加大',
          xxLarge: '超大'
        },
        productReplace: {
          pageTitle: '产品 + AI数字人合成',
          pageDescription: 'AI正在为您生成专业的产品展示视频，请耐心等待精彩效果',
          tip: '合成图片中大约需要1~2分钟...',
          tip1: '合成视频中大约需要1~2分钟...',
          panelTitle: '查看生成结果',
          panelDescription: 'Nebula Lab为您生成了产品数字人的图片,请结合文案进行驱动视频',
          overlayText1: '版本 1',
          overlayText2: '版本 2',
          regenerateText: '生成更多版本',
          regenerate: '重新生成',
          videoConfigTitle: '视频制作配置',
          videoConfigDescription: '配置您的视频参数和语音内容',
          modeLabel: '生成模式',
          modeDescLite: '快速生成，720p，最长60秒',
          modeDescPro: '高质量生成，1080p，最长60秒',
          modeDescAvatar2: '质量最佳，1080p，最长28秒',
          scriptLabel: 'AI配音文案',
          scriptPlaceholder: '请输入需要AI配音的文案内容...',
          voiceLabel: '音色选择',
          changeVoice: '更换音色',
          selectVoice: '选择音色',
          captionLabel: '字幕样式',
          changeCaption: '更换字幕样式',
          selectCaption: '选择字幕样式',
          generateVideo: '消耗 {points} 积分制作视频',
          originalMaterial: '原始素材',
          configInfo: '配置信息',
          configMode: '生成模式:',
          configVoice: '音色:',
          configScript: '文案:',
          notSelected: '未选择',
          resultTitle: '生成结果',
          resultDescription: '您的专业产品展示视频已制作完成',
          exportVideo: '导出视频',
          addToMaterials: '添加到素材库',
          imagePreview: '图片预览',
          selectImageFirst: '请先选择图片',
          selectVoiceFirst: '请选择音色',
          selectAudioFirst: '请选择音频文件',
          errors: {
            taskTimeout: '任务超时',
            queryFailed: '查询失败',
            sampleLoadFailed: '加载示例失败',
            generateFailed: '生成失败'
          },
          tips: {
            downloadStarted: '开始下载...'
          }
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
      ttsPage: {
        title: '文本转语音',
        description: '将文本转换为自然流畅的语音，支持多种音色和语言',
        inputText: '输入文本',
        inputPlaceholder: '在此输入需要AI配音的文本，例如：欢迎来到我们的产品展示，让我为您详细介绍我们最新的功能特点...',
        voice: '音色',
        language: '语言',
        generate: '生成语音',
        generating: '生成中...',
        resultTitle: '生成结果',
        emptyState: '配置参数并开始生成，结果将显示在这里',
        generatingState: '正在生成语音...',
        downloadAudio: '下载音频',
        importToMaterials: '导入素材库',
        importedToMaterials: '已导入素材库',
        errors: {
          pleaseLogin: '请先登录',
          enterText: '请输入文本内容',
          generateFailed: '生成失败',
          noAudioToImport: '没有可导入的音频',
          alreadyImported: '已导入素材库',
          importFailed: '导入失败',
          uploadFailed: '上传失败'
        },
        voices: {
          CHERRY: 'Cherry',
          CHERRY_DESC: '甜美女性',
          ETHAN: 'Ethan',
          ETHAN_DESC: '成熟男性',
          NOFISH: 'Nofish',
          NOFISH_DESC: '中性声音',
          JENNIFER: 'Jennifer',
          JENNIFER_DESC: '专业女性',
          RYAN: 'Ryan',
          RYAN_DESC: '年轻男性',
          KATERINA: 'Katerina',
          KATERINA_DESC: '优雅女性',
          ELIAS: 'Elias',
          ELIAS_DESC: '温暖男性',
          JADA: 'Jada',
          JADA_DESC: '活泼女性',
          DYLAN: 'Dylan',
          DYLAN_DESC: '沉稳男性',
          SUNNY: 'Sunny',
          SUNNY_DESC: '阳光女性',
          LI: 'Li',
          LI_DESC: '中文男声',
          MARCUS: 'Marcus',
          MARCUS_DESC: '磁性男声',
          ROY: 'Roy',
          ROY_DESC: '浑厚男声',
          PETER: 'Peter',
          PETER_DESC: '清晰男声',
          ROCKY: 'Rocky',
          ROCKY_DESC: '粗犷男声',
          KIKI: 'Kiki',
          KIKI_DESC: '可爱女声',
          ERIC: 'Eric',
          ERIC_DESC: '标准男声'
        },
        languages: {
          AUTO: '自动检测',
          CHINESE: '中文',
          ENGLISH: '英文',
          GERMAN: '德语',
          ITALIAN: '意大利语',
          PORTUGUESE: '葡萄牙语',
          SPANISH: '西班牙语',
          JAPANESE: '日语',
          KOREAN: '韩语',
          FRENCH: '法语',
          RUSSIAN: '俄语'
        }
      },
      workshop: {
        title: '创作工坊',
        description: '我能帮你创造什么?',
        allTools: '全部工具',
        image: '图片',
        video: '视频',
        audio: '音频',
        others: '其他',
        tools: {
          translation: {
            title: 'AI视频换脸',
            description: '将您的视频中的人脸替换成图片的人脸',
            emoji: '🧍'
          },
          tts: {
            title: '文本转语音',
            description: '将文本转换为自然流畅的语音，支持多种音色和语言',
            emoji: '🎤'
          },
          '3dModel': {
            title: '3D模型',
            description: '将您的照片变成一份3D效果图。',
            emoji: '🤖'
          },
          customPrompt: {
            title: '自定义提示',
            description: '描述你能想象到的任何变化。最多可上传两张图片作为参考（例如，角色和风格参考）。你的创造力是唯一的限制！',
            emoji: '✍️',
            primaryUploaderTitle: '主图像',
            primaryUploaderDescription: '要编辑的主要图像。',
            secondaryUploaderTitle: '参考图像（可选）',
            secondaryUploaderDescription: '用于风格、内容或上下文的第二张图像。'
          },
          imageTranslation: {
            title: 'AI图片换脸',
            description: '将您的主图片人脸替换成参考图片的人脸',
            emoji: '🧍'
          },
          aiTemplate: {
            title: '创意生图',
            description: '根据选中AI模板生成对应内容',
            emoji: '🖼️'
          },
          figurine: {
            title: '3D手办',
            description: '将您的照片变成一个可收藏的3D角色手办，并配有包装。',
            emoji: '🧍'
          },
          funko: {
            title: 'Funko Pop公仔',
            description: '将您的主题重塑为一个可爱的Funko Pop！乙烯基公仔，放在盒子里。',
            emoji: '📦'
          },
          lego: {
            title: '乐高小人仔',
            description: '构建一个乐高小人仔版本的您的主题，准备好玩耍。',
            emoji: '🧱'
          },
          crochet: {
            title: '钩针娃娃',
            description: '将您的图像变成一个柔软的手工钩针娃娃。',
            emoji: '🧶'
          },
          cosplay: {
            title: '动漫转Cosplay',
            description: '将动漫角色变为一张逼真的Cosplay照片。',
            emoji: '🎭'
          },
          plushie: {
            title: '可爱毛绒玩具',
            description: '将您的主题转换成一个可爱的、柔软的毛绒玩具。',
            emoji: '🧸'
          },
          keychain: {
            title: '亚克力钥匙扣',
            description: '创建一个您的主题的可爱亚克力钥匙扣，非常适合挂在包上。',
            emoji: '🔑'
          },
          hdEnhance: {
            title: '高清增强',
            description: '放大您的图像，增加清晰度、细节，以获得高分辨率外观。',
            emoji: '🔍'
          },
          pose: {
            title: '姿势参考',
            description: '将一张图像中的姿势应用到另一张图像中的角色上。',
            emoji: '💃',
            primaryUploaderTitle: '角色',
            primaryUploaderDescription: '主要角色',
            secondaryUploaderTitle: '姿势参考',
            secondaryUploaderDescription: '要应用的姿势'
          },
          photorealistic: {
            title: '转为照片级真实',
            description: '将绘画或插图转换为惊人逼真的照片。',
            emoji: '🪄'
          },
          fashion: {
            title: '时尚杂志',
            description: '为您的照片赋予高级时尚、编辑风格的外观，堪比杂志封面。',
            emoji: '📸'
          },
          hyperrealistic: {
            title: '超写实',
            description: '应用一种粗粝、直闪的摄影风格，打造酷炫的超写实氛围。',
            emoji: '✨'
          },
          architecture: {
            title: '建筑模型',
            description: '将建筑物转变为精细的微缩建筑模型。',
            emoji: '🏗️'
          },
          productRender: {
            title: '产品渲染',
            description: '将产品草图变成专业的、照片级的3D渲染图。',
            emoji: '💡'
          },
          sodaCan: {
            title: '汽水罐设计',
            description: '将您的图像包装到汽水罐上，并将其放置在精美的产品照片中。',
            emoji: '🥤'
          },
          industrialDesign: {
            title: '工业设计渲染',
            description: '将工业设计草图渲染成在博物馆环境中展示的真实产品。',
            emoji: '🛋️'
          },
          iphoneWallpaper: {
            title: 'iPhone壁纸效果',
            description: '将您的图片即时转换为时尚的iPhone锁屏界面。',
            emoji: '📱'
          },
          colorPalette: {
            title: '色板换色',
            description: '将图像转换为线稿，然后使用第二张图像作为调色板为其上色。',
            emoji: '🎨',
            primaryUploaderTitle: '原始图像',
            primaryUploaderDescription: '要转换的图像',
            secondaryUploaderTitle: '调色板',
            secondaryUploaderDescription: '颜色参考'
          },
          videoGeneration: {
            title: '视频生成',
            description: '通过文本提示和可选图像创建短视频。',
            emoji: '🎬'
          },
          isolate: {
            title: '分离并增强',
            description: '剪出蒙版中的主体，并创建一个干净、高清的肖像。',
            emoji: '🎯'
          },
          screen3d: {
            title: '3D屏幕效果',
            description: '使您照片中屏幕上的内容呈现出裸眼3D效果。',
            emoji: '📺'
          },
          makeup: {
            title: '妆容分析',
            description: '分析肖像中的妆容，并用红笔标记提出改进建议。',
            emoji: '💄'
          },
          background: {
            title: '更换背景',
            description: '将现有背景更换为酷炫的复古Y2K美学风格。',
            emoji: '🪩'
          },
          addIllustration: {
            title: '添加插画',
            description: '在您的真实世界照片中添加迷人的手绘角色。',
            emoji: '🧑‍🎨'
          },
          pixelArt: {
            title: '像素艺术',
            description: '将您的图像转换为复古的8位像素艺术。',
            emoji: '👾'
          },
          watercolor: {
            title: '水彩画',
            description: '将您的图像转换为柔和、充满活力的水彩画。',
            emoji: '🖌️'
          },
          popArt: {
            title: '波普艺术',
            description: '以安迪·沃霍尔的大胆风格重新想象您的图像。',
            emoji: '🎨'
          },
          comicBook: {
            title: '漫画书',
            description: '将您的照片变成一个经典的漫画书面板。',
            emoji: '💥'
          },
          claymation: {
            title: '黏土动画',
            description: '将您的图像重现为一个迷人的定格黏土场景。',
            emoji: '🗿'
          },
          ukiyoE: {
            title: '浮世绘',
            description: '将您的图像重绘为传统的日本木版画。',
            emoji: '🌊'
          },
          stainedGlass: {
            title: '彩色玻璃',
            description: '将您的图像转换为一个充满活力的彩色玻璃窗。',
            emoji: '🪟'
          },
          origami: {
            title: '折纸',
            description: '用折纸风格重建您的主题。',
            emoji: '🦢'
          },
          neonGlow: {
            title: '霓虹灯光',
            description: '用明亮、发光的霓虹灯勾勒您的主题。',
            emoji: '💡'
          },
          doodleArt: {
            title: '涂鸦艺术',
            description: '在您的图像上覆盖好玩的手绘涂鸦。',
            emoji: '✏️'
          },
          vintagePhoto: {
            title: '复古照片',
            description: '为您的图像赋予一种陈旧的、深褐色的复古外观。',
            emoji: '📜'
          },
          blueprintSketch: {
            title: '蓝图',
            description: '将您的图像转换为技术蓝图图纸。',
            emoji: '📐'
          },
          glitchArt: {
            title: '故障艺术',
            description: '应用数字故障效果，包括数据融合和像素排序。',
            emoji: '📉'
          },
          doubleExposure: {
            title: '双重曝光',
            description: '在双重曝光中将您的图像与自然场景融合。',
            emoji: '🏞️'
          },
          hologram: {
            title: '全息图',
            description: '将您的主题投影为一个未来主义的、发光的蓝色全息图。',
            emoji: '🌐'
          },
          lowPoly: {
            title: '低多边形',
            description: '使用低多边形几何网格重建您的图像。',
            emoji: '🔺'
          },
          charcoalSketch: {
            title: '炭笔素描',
            description: '将您的图像重绘为一幅戏剧性的、高对比度的炭笔素描。',
            emoji: '✍🏽'
          },
          impressionism: {
            title: '印象派',
            description: '以印象派杰作的风格重绘您的图像。',
            emoji: '👨‍🎨'
          },
          cubism: {
            title: '立体主义',
            description: '以抽象、几何的立体主义风格解构您的主题。',
            emoji: '🧊'
          },
          steampunk: {
            title: '蒸汽朋克',
            description: '用齿轮、黄铜和维多利亚时代的技术重新想象您的主题。',
            emoji: '⚙️'
          },
          fantasyArt: {
            title: '奇幻艺术',
            description: '将您的图像转变为一幅史诗般的奇幻风格绘画。',
            emoji: '🐉'
          },
          graffiti: {
            title: '涂鸦',
            description: '将您的图像喷绘成砖墙上充满活力的涂鸦。',
            emoji: '🎨'
          },
          minimalistLineArt: {
            title: '极简线稿',
            description: '将您的图像简化为一条连续的线稿。',
            emoji: '〰️'
          },
          storybook: {
            title: '故事书',
            description: '以异想天开的儿童故事书风格重绘您的图像。',
            emoji: '📖'
          },
          thermal: {
            title: '热成像',
            description: '应用带有热图调色板的热成像效果。',
            emoji: '🌡️'
          },
          risograph: {
            title: 'Risograph',
            description: '模拟粗糙、色彩有限的Risograph印刷效果。',
            emoji: '📠'
          },
          crossStitch: {
            title: '十字绣',
            description: '将您的图像转换为手工制作的十字绣图案。',
            emoji: '🧵'
          },
          tattoo: {
            title: '纹身艺术',
            description: '将您的主题重新设计为经典的美式传统纹身。',
            emoji: '🖋️'
          },
          psychedelic: {
            title: '迷幻风格',
            description: '应用20世纪60年代充满活力、旋转的迷幻艺术风格。',
            emoji: '🌀'
          },
          gothic: {
            title: '哥特式',
            description: '用黑暗的哥特艺术风格重新想象您的场景。',
            emoji: '🏰'
          },
          tribal: {
            title: '部落艺术',
            description: '使用传统的部落图案重绘您的主题。',
            emoji: '🗿'
          },
          dotPainting: {
            title: '点画',
            description: '使用原住民点画技术重新创作您的图像。',
            emoji: '🎨'
          },
          chalk: {
            title: '粉笔画',
            description: '将您的图像画成人行道上色彩缤纷的粉笔画。',
            emoji: '🖍️'
          },
          sandArt: {
            title: '沙画',
            description: '重新创作您的图像，仿佛它是由彩色沙子制成的。',
            emoji: '🏜️'
          },
          mosaic: {
            title: '马赛克',
            description: '将您的图像转换为由小瓷砖制成的马赛克。',
            emoji: '💠'
          },
          paperQuilling: {
            title: '纸艺',
            description: '使用卷曲和成形的纸条重建您的主题。',
            emoji: '📜'
          },
          woodCarving: {
            title: '木雕',
            description: '将您的主题重塑为精细的木雕。',
            emoji: '🪵'
          },
          iceSculpture: {
            title: '冰雕',
            description: '将您的主题转变为半透明的冰雕。',
            emoji: '🧊'
          },
          bronzeStatue: {
            title: '铜像',
            description: '将您的主题变成一尊风化的铜像。',
            emoji: '🗿'
          },
          galaxy: {
            title: '星系',
            description: '将您的图像与充满活力的星云和星空背景融合。',
            emoji: '🌌'
          },
          fire: {
            title: '火焰',
            description: '重新想象您的主题，仿佛它是由熊熊火焰形成的。',
            emoji: '🔥'
          },
          water: {
            title: '水',
            description: '重新想象您的主题，仿佛它是由流动的水形成的。',
            emoji: '💧'
          },
          smokeArt: {
            title: '烟雾艺术',
            description: '用优雅、旋转的烟雾创造您的主题。',
            emoji: '💨'
          },
          vectorArt: {
            title: '矢量艺术',
            description: '将您的照片转换为干净、可缩放的矢量艺术。',
            emoji: '🎨'
          },
          infrared: {
            title: '红外线',
            description: '模拟具有超现实色彩的红外照片效果。',
            emoji: '📸'
          },
          knitted: {
            title: '针织',
            description: '将您的图像重塑为一个舒适的针织羊毛图案。',
            emoji: '🧶'
          },
          etching: {
            title: '蚀刻',
            description: '将您的图像重绘为经典的黑白蚀刻画。',
            emoji: '✒️'
          },
          diorama: {
            title: '立体模型',
            description: '将您的场景变成盒子里的微型3D立体模型。',
            emoji: '📦'
          },
          paintingProcess: {
            title: '绘画过程',
            description: '展示一个4步网格，展示您的图像从草图到最终绘画的创作过程。',
            emoji: '🖼️'
          },
          markerSketch: {
            title: '马克笔素描',
            description: '用Copic马克笔的风格重塑您的照片，创造出充满活力的素描。',
            emoji: '🖊️'
          },
          vanGogh: {
            title: '梵高风格',
            description: '用梵高《星夜》标志性的、旋转的笔触重绘您的照片。',
            emoji: '🌌'
          },
          cyberpunk: {
            title: '赛博朋克',
            description: '将您的场景转变为一个充满霓虹灯的未来赛博朋克城市。',
            emoji: '🤖'
          },
          lineArt: {
            title: '线稿绘画',
            description: '将您的照片简化为其基本线条，创建一个干净的草图。',
            emoji: '✍🏻'
          }
        }
      },
      uploadCustomAvatar: {
        tips: {
          page: {
            title: '自定义数字人视频生成',
            description: '上传您的视频文件，AI将为您生成专业的自定义数字人模型'
          },
          form: {
            title: '生成配置',
            label: '视频文件',
            uploadView: '上传视频文件',
            uploadText: '点击或拖拽上传视频',
            uploadHint: '支持 MP4、MOV 格式，文件大小不超过100MB',
            requirements: [
              '分辨率：360p ~ 4K',
              '时长：4秒 ~ 3分钟',
              '需要正脸数字人视频'
            ]
          },
          formLabel: '数字人名称',
          input: '请输入自定义数字人名称',
          primary: '提交中...',
          primary1: '1 开始生成',
          actionBtn: '重置表单',
          statusCard: '任务状态',
          generatingText: 'AI正在为您生成数字人模型...',
          generatingText1: '训练时长预计2-3分钟',
          successIcon: '生成完成',
          actionBtn2: '加入素材库',
          errorIcon: '生成失败',
          errorContent: '未知错误',
          secondary: '请先提交任务',
          previewVideo: '您的浏览器不支持视频播放'
        },
        script: {
          errors: {
            e1: '请输入数字人名称',
            e2: '名称长度在2-20个字符之间',
            e3: '请上传视频文件',
            e4: '请输入有效的消耗分数',
            e5: '提交失败，请重试',
            e6: '提交失败:',
            e7: '未检测到人脸',
            e8: '查询任务进度失败',
            e9: '查询失败:'
          },
          success: {
            s1: '视频上传成功',
            s2: '任务提交成功！',
            s3: '任务完成',
            s4: '表单已重置',
            s5: '已成功加入素材库'
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
      footerTip: '温馨提示：所有内容均由AI模型生成，准确性和完整性无法保证，不代表平台的态度或观点',
      functionMode: {
        title: '功能模式',
        chat: '对话',
        image: '图片',
        video: '视频'
      }
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
      },
      status: {
        paid: '已扣款',
        unpaid: '未扣款',
        failed: '失败',
        unknown: '未知'
      }
    },
    aiVideoFaceSwapPage: {
      title: 'AI 视频换脸',
      subtitle: '上传视频和参考图片，让 AI 为您生成换脸视频',
      uploadVideo: {
        title: '上传参考视频',
        uploading: '上传并处理视频中...',
        clickOrDrag: '点击或拖拽上传视频',
        formats: 'MP4、MOV 格式',
        duration: '时长≤60秒，帧率≤30fps',
        resolution: '分辨率≤1080P',
        size: '大小≤200MB',
        editVideo: '编辑视频'
      },
      uploadImage: {
        title: '上传参考图片',
        uploading: '上传图片中...',
        clickOrDrag: '点击或拖拽上传图片',
        formats: 'jpg/jpeg、png 格式',
        resolution: '分辨率 128*128 - 4096*4096',
        size: '大小不超过 5MB'
      },
      buttons: {
        generating: '生成中...',
        generateVideo: '生成换脸视频',
        clearResult: '清除结果'
      },
      result: {
        title: '生成结果',
        emptyState: '生成的视频将显示在这里',
        downloadVideo: '下载视频',
        importMaterial: '导入素材',
        importedToast: '该视频已导入素材库'
      },
      errors: {
        videoProcessingFailed: '视频处理失败',
        videoUploadFailed: '视频上传失败，缺少文件ID',
        videoProcessTaskFailed: '提交视频处理任务失败',
        videoProcessFailed: '视频处理失败',
        videoUrlMissing: '视频处理成功但未返回视频URL',
        imageUploadFailed: '图片上传失败，缺少文件ID',
        imageSizeExceeded: '图片大小经Base64编码后不能超过5MB',
        imageResolutionTooSmall: '图片分辨率不能小于128*128',
        imageResolutionTooLarge: '图片分辨率不能大于4096*4096',
        imageValidationFailed: '图片验证失败',
        videoFormatNotSupported: '视频格式仅支持MP4、MOV，建议使用MP4格式；其余格式暂不支持，后续将逐步开放。（不支持高动态范围（HDR）视频编码）',
        videoSizeExceeded: '视频大小不能超过200MB',
        videoDurationExceeded: '视频时长不能超过60秒',
        videoResolutionExceeded: '视频分辨率不能超过1080P（最长边≤1920，最短边≤1080，支持横屏、竖屏及更低分辨率）',
        videoFpsExceeded: '视频帧率不能超过30fps',
        videoMetadataLoadFailed: '视频元数据加载失败',
        videoMetadataLoadTimeout: '视频元数据加载超时',
        videoLoadFailed: '视频加载失败，请检查是否符合要求：\n1. 格式：MP4、MOV（建议MP4，不支持HDR）\n2. 时长≤60秒，帧率≤30fps，分辨率≤1080P（最长边≤1920，最短边≤1080）\n3. 大小≤200MB',
        videoMaskDrawingRequired: '请先上传并处理参考视频，并完成视频掩码绘制',
        imageRequired: '请上传参考图片',
        generateFailed: '生成失败，请重试'
      },
      videoEditingModal: {
        back: '返回',
        title: '点击视频标记需修改区域与需保护区域',
        markModifyArea: '标记修改区域',
        markProtectArea: '标记保护区域',
        clear: '清除',
        previewAllAreas: '预览所有已选区域',
        cancel: '取消',
        confirm: '确认',
        loadingVideo: '加载视频中...',
        renderingMarks: '正在渲染绘制标记点，请稍等...',
        generating: '正在生成绘制,请等待...',
        processing: '处理中...',
        videoLoadFailed: '视频加载失败'
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
      },
      serviceAdvantages: {
        title: '服务优势',
        aiCreation: '✨ AI智能创作',
        efficientContent: '🚀 高效内容生成',
        techSupport: '💎 专业技术支持',
        dataSecurity: '🔒 数据安全保障'
      },
      needHelp: {
        title: '需要帮助？',
        callPhone: '请拨打电话：'
      },
      wechatPayModal: {
        scanToPay: '扫码支付',
        paySuccess: '支付成功！',
        thankYou: '感谢您的购买',
        payAmount: '支付金额',
        generatingQR: '正在生成支付二维码',
        pleaseWait: '请稍候...',
        step1: '打开微信扫一扫',
        step2: '扫描上方二维码',
        step3: '确认支付完成购买',
        tip: '支付完成后将自动关闭此窗口，请勿重复支付'
      },
      consultModal: {
        title: '在线咨询',
        contactUs: '联系我们',
        scanQR: '扫描下方二维码，立即咨询',
        workTime: '工作时间：周一至周五 9:00-18:00',
        serviceSupport: '我们将为您提供专业的服务支持'
      },
      enterpriseModal: {
        title: '企业定制服务',
        subtitle: '为您提供专业的AI解决方案',
        phone: '联系电话',
        serviceTime: '服务时间',
        workDays: '工作日 9:00-18:00',
        wechatContact: '微信联系',
        scanToAdd: '扫码添加企业微信',
        customSolution: '🎯 定制化方案',
        techSupport: '🔧 技术支持',
        dataAnalysis: '📊 数据分析'
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
      loginSubtitle: '请输入您的手机号码以开始您的创意之旅',
      tabPassword: '账号密码',
      tabPhone: '手机登录/注册',
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
    },
    error: {
      sessionExpired: '无效的会话，或者会话已过期，请重新登录。',
      unknownError: '未知错误',
      networkError: '后端接口连接异常',
      timeout: '系统接口请求超时',
      requestFailed: '请求失败',
      errorTitle: '错误提示',
      successTitle: '操作成功',
      operationSuccess: '操作成功',
      close: '关闭'
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
      signOut: 'Keluar',
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
        uploadCustomAvatar: 'Unggah Avatar Kustom',
        faceSwap: 'Tukar Wajah AI',
        ttsTool: 'Teks ke Ucapan',
        glbViewer: 'Model 3D',
        imageTranslation: 'Terjemahan Gambar',
        videoTranslation: 'Terjemahan Video',
        productReplace: 'Produk Digital Human',
        assets: 'Aset',
        pricing: 'Harga',
        expenses: 'Pengeluaran Saya',
        profile: 'Profil',
        footer: {
          privacyPolicy: 'Kebijakan Privasi',
          recordInfo: 'Info Registrasi',
          icpNumber: 'ICP备2022093288号-4',
          copyright: 'Copyright © 2025',
          companyName: 'Nebula Data (HK) Limited'
        }
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
        loginSubtitle: 'Silakan masukkan nomor telepon Anda untuk melanjutkan',
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
          emptyState: 'Unggah gambar dan masukkan teks deskripsi untuk memulai perjalanan pembuatan video AI Anda',
          previewActions: {
            fullscreen: 'Tampilkan Layar Penuh',
            download: 'Unduh',
            addToMaterials: 'Tambahkan ke Materi'
          }
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
          previewGeneratingTip: 'Sedang membuat video Anda...',
          generatingLabel: 'Sedang membuat...',
          loadingStatus: 'Sedang membuat',
          buttonTip: {
            text: 'Silakan masukkan teks.',
            audio: 'Silakan pilih file audio.',
            default: '1 Poin = 30s atau 400 karakter'
          },
          diamondCoin: 'Poin',
          tryExample: 'Coba Contoh',
          generate: 'Mulai membuat'
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
      ttsPage: {
        title: 'Teks ke Ucapan',
        description: 'Ubah teks menjadi ucapan alami dan lancar dengan berbagai suara dan bahasa',
        inputText: 'Masukkan Teks',
        inputPlaceholder: 'Masukkan teks yang ingin diubah menjadi suara oleh AI di sini, misalnya: Selamat datang di pameran produk kami, izinkan saya memperkenalkan fitur terbaru kami secara detail...',
        voice: 'Suara',
        language: 'Bahasa',
        generate: 'Hasilkan Ucapan',
        generating: 'Menghasilkan...',
        resultTitle: 'Hasil Pembuatan',
        emptyState: 'Konfigurasi parameter dan mulai pembuatan, hasil akan ditampilkan di sini',
        generatingState: 'Sedang menghasilkan ucapan...',
        downloadAudio: 'Unduh Audio',
        importToMaterials: 'Impor ke Perpustakaan Materi',
        importedToMaterials: 'Diimpor ke Perpustakaan Materi',
        errors: {
          pleaseLogin: 'Silakan login terlebih dahulu',
          enterText: 'Silakan masukkan konten teks',
          generateFailed: 'Pembuatan gagal',
          noAudioToImport: 'Tidak ada audio yang tersedia untuk diimpor',
          alreadyImported: 'Sudah diimpor ke perpustakaan materi',
          importFailed: 'Impor gagal',
          uploadFailed: 'Unggah gagal'
        },
        voices: {
          CHERRY: 'Cherry',
          CHERRY_DESC: 'Perempuan Manis',
          ETHAN: 'Ethan',
          ETHAN_DESC: 'Pria Dewasa',
          NOFISH: 'Nofish',
          NOFISH_DESC: 'Suara Netral',
          JENNIFER: 'Jennifer',
          JENNIFER_DESC: 'Perempuan Profesional',
          RYAN: 'Ryan',
          RYAN_DESC: 'Pria Muda',
          KATERINA: 'Katerina',
          KATERINA_DESC: 'Perempuan Elegan',
          ELIAS: 'Elias',
          ELIAS_DESC: 'Pria Hangat',
          JADA: 'Jada',
          JADA_DESC: 'Perempuan Lincah',
          DYLAN: 'Dylan',
          DYLAN_DESC: 'Pria Stabil',
          SUNNY: 'Sunny',
          SUNNY_DESC: 'Perempuan Cerah',
          LI: 'Li',
          LI_DESC: 'Pria Cina',
          MARCUS: 'Marcus',
          MARCUS_DESC: 'Pria Magnetis',
          ROY: 'Roy',
          ROY_DESC: 'Pria Kuat',
          PETER: 'Peter',
          PETER_DESC: 'Pria Jelas',
          ROCKY: 'Rocky',
          ROCKY_DESC: 'Pria Kasar',
          KIKI: 'Kiki',
          KIKI_DESC: 'Perempuan Lucu',
          ERIC: 'Eric',
          ERIC_DESC: 'Pria Standar'
        },
        languages: {
          AUTO: 'Deteksi Otomatis',
          CHINESE: 'Cina',
          ENGLISH: 'Inggris',
          GERMAN: 'Jerman',
          ITALIAN: 'Italia',
          PORTUGUESE: 'Portugis',
          SPANISH: 'Spanyol',
          JAPANESE: 'Jepang',
          KOREAN: 'Korea',
          FRENCH: 'Prancis',
          RUSSIAN: 'Rusia'
        }
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
      },
      uploadCustomAvatar: {
        tips: {
          page: {
            title: 'Pembuatan Video Manusia Digital Kustom',
            description: 'Unggah file video Anda, AI akan menghasilkan model manusia digital kustom profesional untuk Anda'
          },
          form: {
            title: 'Konfigurasi Pembuatan',
            label: 'File Video',
            uploadView: 'Unggah File Video',
            uploadText: 'Klik atau seret untuk mengunggah video',
            uploadHint: 'Mendukung format MP4, MOV, ukuran maksimal 100MB',
            requirements: [
              'Resolusi: 360p ~ 4K',
              'Durasi: 4s ~ 3min',
              'Memerlukan video manusia digital menghadap depan'
            ]
          },
          formLabel: 'Nama Manusia Digital',
          input: 'Masukkan nama manusia digital kustom',
          primary: 'Mengirimkan...',
          primary1: 'Mulai Pembuatan',
          actionBtn: 'Reset',
          statusCard: 'Status Tugas',
          generatingText: 'AI sedang membuat model manusia digital Anda...',
          generatingText1: 'Estimasi waktu pelatihan 2-3 menit',
          successIcon: 'Pembuatan Selesai',
          actionBtn2: 'Tambahkan ke Aset',
          errorIcon: 'Pembuatan Gagal',
          errorContent: 'Kesalahan Tidak Diketahui',
          secondary: 'Silakan kirim tugas terlebih dahulu',
          previewVideo: 'Browser Anda tidak mendukung pemutaran video'
        },
        script: {
          errors: {
            e1: 'Silakan masukkan nama manusia digital',
            e2: 'Panjang nama antara 2-20 karakter',
            e3: 'Silakan unggah file video',
            e4: 'Silakan masukkan skor yang valid',
            e5: 'Pengiriman gagal, silakan coba lagi',
            e6: 'Pengiriman gagal:',
            e7: 'Wajah tidak terdeteksi',
            e8: 'Gagal meminta kemajuan tugas',
            e9: 'Permintaan gagal:'
          },
          success: {
            s1: 'Video berhasil diunggah',
            s2: 'Tugas berhasil dikirim!',
            s3: 'Tugas selesai',
            s4: 'Formulir direset',
            s5: 'Berhasil ditambahkan ke aset'
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
      footerTip: 'Penafian: Konten dihasilkan oleh AI. Akurasi tidak dijamin.',
      functionMode: {
        title: 'Mode Fungsi',
        chat: 'Obrolan',
        image: 'Gambar',
        video: 'Video'
      }
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
      },
      status: {
        paid: 'Telah Dikurangi',
        unpaid: 'Belum Dikurangi',
        failed: 'Gagal',
        unknown: 'Tidak Diketahui'
      }
    },
    aiVideoFaceSwapPage: {
      title: 'AI Video Face Swap',
      subtitle: 'Upload video dan gambar referensi, biarkan AI menghasilkan video tukar wajah untuk Anda',
      uploadVideo: {
        title: 'Unggah Video Referensi',
        uploading: 'Mengunggah dan memproses video...',
        clickOrDrag: 'Klik atau seret untuk mengunggah video',
        formats: 'Format MP4, MOV',
        duration: 'Durasi ≤60s, frame rate ≤30fps',
        resolution: 'Resolusi ≤1080P',
        size: 'Ukuran ≤200MB',
        editVideo: 'Edit Video'
      },
      uploadImage: {
        title: 'Unggah Gambar Referensi',
        uploading: 'Mengunggah gambar...',
        clickOrDrag: 'Klik atau seret untuk mengunggah gambar',
        formats: 'Format jpg/jpeg, png',
        resolution: 'Resolusi 128*128 - 4096*4096',
        size: 'Ukuran tidak melebihi 5MB'
      },
      buttons: {
        generating: 'Menghasilkan...',
        generateVideo: 'Hasilkan Video Tukar Wajah',
        clearResult: 'Hapus Hasil'
      },
      result: {
        title: 'Hasil Pembuatan',
        emptyState: 'Video yang dihasilkan akan ditampilkan di sini',
        downloadVideo: 'Unduh Video',
        importMaterial: 'Impor Materi',
        importedToast: 'Video ini telah diimpor ke perpustakaan materi'
      },
      errors: {
        videoProcessingFailed: 'Pemrosesan video gagal',
        videoUploadFailed: 'Pengunggahan video gagal, file ID tidak ada',
        videoProcessTaskFailed: 'Gagal mengirim tugas pemrosesan video',
        videoProcessFailed: 'Pemrosesan video gagal',
        videoUrlMissing: 'Pemrosesan video berhasil tetapi tidak ada URL video yang dikembalikan',
        imageUploadFailed: 'Pengunggahan gambar gagal, file ID tidak ada',
        imageSizeExceeded: 'Ukuran gambar tidak boleh melebihi 5MB setelah encoding Base64',
        imageResolutionTooSmall: 'Resolusi gambar tidak boleh lebih kecil dari 128*128',
        imageResolutionTooLarge: 'Resolusi gambar tidak boleh lebih besar dari 4096*4096',
        imageValidationFailed: 'Validasi gambar gagal',
        videoFormatNotSupported: 'Format video hanya mendukung MP4, MOV, format MP4 direkomendasikan; format lain belum didukung, akan dibuka secara bertahap. (Encoding video HDR tidak didukung)',
        videoSizeExceeded: 'Ukuran video tidak boleh melebihi 200MB',
        videoDurationExceeded: 'Durasi video tidak boleh melebihi 60 detik',
        videoResolutionExceeded: 'Resolusi video tidak boleh melebihi 1080P (sisi terpanjang ≤1920, sisi terpendek ≤1080, mendukung landscape, portrait dan resolusi lebih rendah)',
        videoFpsExceeded: 'Frame rate video tidak boleh melebihi 30fps',
        videoMetadataLoadFailed: 'Pemuatan metadata video gagal',
        videoMetadataLoadTimeout: 'Timeout pemuatan metadata video',
        videoLoadFailed: 'Pemuatan video gagal, harap periksa apakah memenuhi persyaratan:\n1. Format: MP4, MOV (MP4 direkomendasikan, HDR tidak didukung)\n2. Durasi ≤60s, frame rate ≤30fps, resolusi ≤1080P (sisi terpanjang ≤1920, sisi terpendek ≤1080)\n3. Ukuran ≤200MB',
        videoMaskDrawingRequired: 'Harap unggah dan proses video referensi terlebih dahulu, dan selesaikan penggambaran masker video',
        imageRequired: 'Harap unggah gambar referensi',
        generateFailed: 'Pembuatan gagal, harap coba lagi'
      },
      videoEditingModal: {
        back: 'Kembali',
        title: 'Klik pada video untuk menandai area yang akan dimodifikasi dan area yang akan dilindungi',
        markModifyArea: 'Tandai Area Modifikasi',
        markProtectArea: 'Tandai Area Perlindungan',
        clear: 'Hapus',
        previewAllAreas: 'Pratinjau Semua Area yang Dipilih',
        cancel: 'Batal',
        confirm: 'Konfirmasi',
        loadingVideo: 'Memuat video...',
        renderingMarks: 'Merender titik penanda, harap tunggu...',
        generating: 'Menghasilkan, harap tunggu...',
        processing: 'Memproses...',
        videoLoadFailed: 'Gagal memuat video'
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
      },
      serviceAdvantages: {
        title: 'Keunggulan Layanan',
        aiCreation: '✨ Kreasi AI Cerdas',
        efficientContent: '🚀 Pembuatan Konten Efisien',
        techSupport: '💎 Dukungan Teknis Profesional',
        dataSecurity: '🔒 Jaminan Keamanan Data'
      },
      needHelp: {
        title: 'Butuh Bantuan?',
        callPhone: 'Hubungi:'
      },
      wechatPayModal: {
        scanToPay: 'Pindai untuk Bayar',
        paySuccess: 'Pembayaran Berhasil!',
        thankYou: 'Terima kasih atas pembelian Anda',
        payAmount: 'Jumlah Pembayaran',
        generatingQR: 'Membuat Kode QR',
        pleaseWait: 'Mohon tunggu...',
        step1: 'Buka WeChat Scan',
        step2: 'Pindai kode QR di atas',
        step3: 'Konfirmasi pembayaran',
        tip: 'Jendela akan menutup otomatis setelah pembayaran. Jangan bayar berulang.'
      },
      consultModal: {
        title: 'Konsultasi Online',
        contactUs: 'Hubungi Kami',
        scanQR: 'Pindai kode QR di bawah untuk konsultasi',
        workTime: 'Jam Kerja: Sen-Jum 9:00-18:00',
        serviceSupport: 'Kami akan memberikan dukungan layanan profesional'
      },
      enterpriseModal: {
        title: 'Layanan Kustom Perusahaan',
        subtitle: 'Solusi AI profesional untuk Anda',
        phone: 'Telepon Kontak',
        serviceTime: 'Jam Layanan',
        workDays: 'Hari Kerja 9:00-18:00',
        wechatContact: 'Kontak WeChat',
        scanToAdd: 'Pindai untuk menambahkan WeChat',
        customSolution: '🎯 Solusi Kustom',
        techSupport: '🔧 Dukungan Teknis',
        dataAnalysis: '📊 Analisis Data'
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
      loginSubtitle: 'Silakan masukkan nomor telepon Anda untuk melanjutkan',
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
    },
    error: {
      sessionExpired: 'Sesi tidak valid atau sesi telah kedaluwarsa, silakan masuk lagi.',
      unknownError: 'Kesalahan tidak diketahui',
      networkError: 'Kesalahan koneksi backend',
      timeout: 'Permintaan timeout',
      requestFailed: 'Permintaan gagal',
      errorTitle: 'Kesalahan',
      successTitle: 'Berhasil',
      operationSuccess: 'Operasi berhasil',
      close: 'Tutup'
    }
  }
};
