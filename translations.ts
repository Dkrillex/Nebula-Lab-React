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
      showFilters: string;
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
    };
    compare: {
      button: string;
      buttonShort: string;
      title: string;
      subtitle: string;
      modelLabel: string;
      searchPlaceholder: string;
      noResults: string;
      selectAtLeastOne: string;
      compareFields: {
        provider: string;
        inputPrice: string;
        outputPrice: string;
        contextLength: string;
        billingType: string;
        tags: string;
        description: string;
      };
      tableHeader: string;
      selectedCount: string;
      clearSelection: string;
      finishCompare: string;
      loading: string;
      noModels: string;
      noMatchModels: string;
      billingTypes: {
        payPerUse: string;
        payPerCall: string;
        payPerResource: string;
        payPerSecond: string;
        payPerMultimodal: string;
        payPerImage: string;
        unknown: string;
      };
    };
    detail: {
      title: string;
      type: string;
      pricing: string;
      priceDetails: string;
      priceTable: string;
      audioOptions: string;
      noAudio: string;
      withAudio: string;
      resolutionTable: string;
      singleSecondPrice: string;
      singleCallPrice: string;
      singleImagePrice: string;
      input: string;
      output: string;
      cachePrice: string;
      cacheWrite: string;
      cacheRead: string;
      modelDescription: string;
      capabilityTags: string;
      useForChat: string;
      useForImage: string;
      useForVideo: string;
      noDescription: string;
      exampleCost: string;
      imageEditCost: string;
      tokenTable: string;
      quality: string;
      tokenConsumption: string;
    };
    pagination: {
      total: string;
      page: string;
      perPage: string;
    };
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
      modelsIntro: string;
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
        awaitWorking?: string;
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
      primaryDescription: string;
      referenceLabel: string;
      referenceDescription: string;
      promptLabel: string;
      promptPlaceholder: string;
      promptDefault: string;
      generate: string;
      generating: string;
      generateButton: string;
      resultTitle: string;
      emptyState: string;
      generatingMessage: string;
      tabs: {
        result: string;
        sideBySide: string;
        slider: string;
      };
      labels: {
        original: string;
        result: string;
        preview: string;
        download: string;
        addToMaterials: string;
      };
      errors: {
        uploadPrimaryImage: string;
        uploadReferenceImage: string;
        enterPrompt: string;
        generateFailed: string;
        useImageFailed: string;
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
    useToolPage: {
      promptPlaceholder: string;
      primaryImageLabel: string;
      referenceImageLabel: string;
      optional: string;
      uploadHint: string;
      clearImage: string;
      drawMask: string;
      exitMaskEdit: string;
      brushSize: string;
      undo: string;
      clearMask: string;
      generating: string;
      generateButton: string;
      generatingMagic: string;
      resultPlaceholder: string;
      errors: {
        uploadPrimaryImage: string;
        enterPrompt: string;
        uploadReferenceImage: string;
        generateFailed: string;
        unknownError: string;
      };
    };
    addMaterialModal: {
      messages: {
        selectTeamFirst: string;
        sharedFolderRequired: string;
        enterName: string;
        uploadFileOrLink: string;
        selectTeam: string;
        selectSharedFolder: string;
        uploadingFile: string;
        uploadingMaterial: string;
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
    metrics: {
      intelligence: string;
      coding: string;
      math: string;
      speed: string;
    };
    best: string;
    allModels: string;
    bestIndicator: string;
    showMore: string;
    collapse: string;
    top10: string;
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
    inputPlaceholders: {
      chat: string;
      image: string;
      video: string;
    };
    inputHints: {
      send: string;
      newline: string;
      supportedFormats: string;
      maxSize: string;
    };
    send: string;
    welcomeMessage: string;
    footerTip: string;
    functionMode: {
      title: string;
      chat: string;
      image: string;
      video: string;
    };
    aiCreatingImage: string;
    modelNotSupportImageUpload: string;
    deleteConfirm: {
      title: string;
      message: string;
      confirmText: string;
      cancelText: string;
    };
    toasts: {
      switchToVideoMode: string;
      uploadingVideoToOSS: string;
      videoUploadSuccess: string;
      videoUploadFailed: string;
      imageUploadFailed: string;
      importMaterialFailed: string;
      noMessagesToSave: string;
      savingAndProcessing: string;
      recordUpdated: string;
      recordSaved: string;
      saveRecordFailed: string;
      recordDeleted: string;
      deleteRecordFailed: string;
      linkCopied: string;
      materialImported: string;
    };
    aiRoleDefinition: {
      title: string;
      description: string;
      label: string;
      placeholder: string;
      hint: string;
      tips: string[];
      cancel: string;
      confirm: string;
      roleLabel: string;
      editRole: string;
      defaultContent: string;
      inputRequired: string;
      updateSuccess: string;
    };
    imageValidation: {
      sora2Requirements: string;
      sora2CropTitle: string;
      sora2CropCancel: string;
      doubaoRequirements: string;
      doubaoRatioHint: string;
      minResolution: string;
      maxResolution: string;
      loadFailed: string;
      formatNotSupported: string;
      sizeExceeded: string;
      readFailed: string;
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
    memberLevel: string;
    quickActions: string;
    buttons: {
      points: string;
      balance: string;
      logs: string;
      refresh: string;
      refreshPoints: string;
      refreshLogs: string;
    };
    recordsTitle: string;
    refreshData: string;
    export: string;
    exportBill: string;
    totalRecords: string;
    timeRange: string;
    to: string;
    query: string;
    search: string;
    reset: string;
    loading: string;
    noData: string;
    noRecords: string;
    noUsageRecords: string;
    noPointsRecords: string;
    viewDetails: string;
    collapseDetails: string;
    date: string;
    times: string;
    token: string;
    consumption: string;
    recharge: string;
    netAmount: string;
    total: string;
    consumedPoints: string;
    points: string;
    pointsBill: string;
    exportHeaders: {
      time: string;
      serviceType: string;
      points: string;
      status: string;
      taskId: string;
    };
    balanceExportHeaders: {
      time: string;
      serviceModel: string;
      type: string;
      cost: string;
      duration: string;
      inputToken: string;
      outputToken: string;
    };
    balanceBill: string;
    record: {
      type: string;
      duration: string;
      input: string;
      output: string;
      consumption: string;
      recharge: string;
    };
    status: {
      paid: string; // 已扣款
      unpaid: string; // 未扣款
      failed: string; // 失败
      unknown: string; // 未知
    };
    teamLogs: {
      title: string;
      team: string;
      member: string;
      expenseType: string;
      time: string;
      pleaseSelect: string;
      teamName: string;
      userName: string;
      tokenName: string;
      modelName: string;
      cost: string;
      expenseTypeLabel: string;
      createdAt: string;
      promptTokens: string;
      completionTokens: string;
      addRecharge: string;
      addConsumption: string;
      firstPage: string;
      prevPage: string;
      nextPage: string;
      lastPage: string;
      recordsPerPage: string;
      logsBill: string;
    };
    exportError: string;
    exportSuccess: string;
    selectTeamFirst: string;
    unknownService: string;
    serviceTypes: {
      [key: number]: string;
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
      invoiceInfo: string;
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
      form?: {
        title: string;
        description: string;
        name: string;
        namePlaceholder: string;
        email: string;
        emailPlaceholder: string;
        phone: string;
        phonePlaceholder: string;
        company: string;
        companyPlaceholder: string;
        channel: string;
        channelPlaceholder: string;
        channels?: {
          wechat: string;
          xiaohongshu: string;
          gongzhonghao: string;
          douyin: string;
          weibo: string;
          search: string;
          friend: string;
          other: string;
        };
        message: string;
        messagePlaceholder: string;
        submit: string;
        submitting: string;
        submitSuccess: string;
        submitError: string;
        successTitle: string;
        successMessage: string;
        submitAnother: string;
        errors?: {
          nameRequired: string;
          phoneRequired: string;
          phoneInvalid: string;
          emailInvalid: string;
          channelRequired: string;
        };
      };
    };
    errors?: {
      loginRequired: string;
      invalidAmount: string;
      minAmountRequired: string;
      invoiceOnlyWechat: string;
      invoiceAutoDisabled: string;
      invoiceFormNotInitialized: string;
      invoiceInfoRequired: string;
      invoiceInfoSaved: string;
    };
    invoiceFields?: {
      name: string;
      taxNumber: string;
      email: string;
      companyAddress: string;
      companyPhone: string;
      openingBank: string;
      bankAccount: string;
    };
    paymentOptions?: {
      alipay: string;
      alipayHK: string;
      billEase: string;
      boost: string;
      bpi: string;
      gcash: string;
      kredivo: string;
      linePay: string;
      touchNGo: string;
    };
    invoiceForm?: {
      title: string;
      fillInvoiceInfo: string;
      invoiceName: string;
      taxNumber: string;
      email: string;
      companyAddress: string;
      companyPhone: string;
      openingBank: string;
      bankAccount: string;
      placeholders: {
        invoiceName: string;
        taxNumber: string;
        email: string;
        companyAddress: string;
        companyPhone: string;
        openingBank: string;
        bankAccount: string;
      };
      errors: {
        invoiceNameRequired: string;
        taxNumberRequired: string;
        emailRequired: string;
        emailInvalid: string;
        emailMissingAt: string;
      };
      cancel: string;
      confirm: string;
    };
    quantity?: {
      times: string;
    };
    currency?: {
      yuan: string;
      dollar: string;
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
    personalFiles: string;
    sharedFiles: string;
    confirmDelete: string;
    confirmDeleteItem: string;
    confirmDeleteSelected: string;
    confirm: string;
    cancel: string;
    folder: string;
    material: string;
    moveModal: {
      title: string;
      personalFolder: string;
      sharedFolder: string;
      allFiles: string;
      loading: string;
      newFolder: string;
      newFolderPlaceholder: string;
      unnamedFolder: string;
      noFolders: string;
      enterTeamFolderFirst: string;
      enterTeamFolderBeforeSave: string;
      fileAlreadyInCurrentFolder: string;
      moveToHere: string;
      cancel: string;
      fetchFoldersFailed: string;
      enterFolderName: string;
      folderCreatedSuccess: string;
      folderCreateFailed: string;
    };
    messages: {
      deleteSuccess: string;
      deleteFailed: string;
      shareSuccess: string;
      shareFailedNoTeam: string;
      moveSuccess: string;
      moveFailed: string;
      operationFailed: string;
      sharedFilesCannotDragToRoot: string;
      assetUrlOrNameMissing: string;
    };
  };
  profilePage: {
    title: string;
    subtitle: string;
    tabs: {
      basic: string;
      security: string;
      enterprise: string;
      invite: string;
    };
    basicInfo: string;
    accountSecurity: string;
    enterpriseManagement?: string;
    avatar: string;
    uploadAvatar: string;
    labels: {
      accountName: string;
      nickname: string;
      nicknameRequired: string;
      phone: string;
      email: string;
      gender: string;
      createTime: string;
      role: string;
      dept: string;
      password: string;
      oldPassword: string;
      newPassword: string;
      confirmPassword: string;
      notBound: string;
    };
    placeholders: {
      accountName: string;
      nickname: string;
      phone: string;
      email: string;
      oldPassword: string;
      newPassword: string;
      confirmPassword: string;
    };
    gender: {
      male: string;
      female: string;
      unknown: string;
    };
    buttons: {
      save: string;
      cancel: string;
      edit: string;
      reset: string;
      changePassword: string;
      retry: string;
    };
    messages: {
      loadFailed: string;
      updateSuccess: string;
      updateFailed: string;
      passwordChangeSuccess: string;
      passwordChangeFailed: string;
      allFieldsRequired: string;
      passwordMinLength: string;
      passwordMismatch: string;
      passwordSame: string;
      emailInvalid: string;
      phoneInvalid: string;
      accountNameLength: string;
      accountNameStart: string;
      accountNameFormat: string;
      inviteCodeCopied: string;
      inviteLinkCopied: string;
      copyFailed: string;
    };
    enterprise: {
      management: string;
      teamManagement: string;
      channelInfo: string;
      channelName: string;
      shareAssets: string;
      yes: string;
      no: string;
      createTime: string;
      updateTime: string;
      edit: string;
      addRelation: string;
      noChannelInfo: string;
      notSupported: string;
      contactAdmin: string;
      enterChannelName: string;
      selectShareAssets: string;
      editRelation: string;
      addRelationTitle: string;
      cancel: string;
      confirm: string;
      enterChannelNameRequired: string;
      selectShareAssetsRequired: string;
      getChannelInfoFailed: string;
      editSuccess: string;
      editFailed: string;
      addSuccess: string;
      addFailed: string;
      operationFailed: string;
      noChannelId: string;
      missingChannelId: string;
    };
    invite: {
      title: string;
      subtitle: string;
      inviteCode: string;
      inviteLink: string;
      copyLink: string;
      copied: string;
      noRecords: string;
      tableHeaders: {
        inviteCode: string;
        invitedUser: string;
        registerTime: string;
      };
      pagination: {
        total: string;
        page: string;
        firstPage: string;
        prevPage: string;
        nextPage: string;
        lastPage: string;
      };
      fetchFailed: string;
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
  enterprisePage: {
    title: string;
    subtitle: string;
    notSupported: string;
    notSupportedDesc: string;
    buttons: {
      addTeam: string;
      refresh: string;
      viewMembers: string;
      edit: string;
      inviteMember: string;
      addMember: string;
      delete: string;
      cancel: string;
      confirm: string;
      close: string;
      newUser: string;
      oldUser: string;
      editRole: string;
      editAuth: string;
      allocate: string;
      remove: string;
    };
    table: {
      teamName: string;
      searchPlaceholder: string;
      createTime: string;
      status: string;
      actions: string;
      normal: string;
      disabled: string;
      noData: string;
      userInfo: string;
      nickName: string;
      phoneNumber: string;
      userAuth: string;
      userRole: string;
      remainingQuota: string;
      usedQuota: string;
      joinTime: string;
      userName: string;
      account: string;
      registerTime: string;
    };
    modals: {
      addTeam: string;
      editTeam: string;
      teamName: string;
      teamNamePlaceholder: string;
      teamRoles: string;
      teamRolesPlaceholder: string;
      teamRolesHint: string;
      remark: string;
      remarkPlaceholder: string;
      membersList: string;
      noRole: string;
      selectInviteType: string;
      inviteTypeDesc: string;
      addMembers: string;
      searchUserPlaceholder: string;
      selectedCount: string;
      editMemberRole: string;
      memberInfo: string;
      currentRole: string;
      selectNewRole: string;
      editMemberAuth: string;
      currentAuth: string;
      selectNewAuth: string;
      allocateQuota: string;
      memberInfoTitle: string;
      currentBalance: string;
      score: string;
      memberLevel: string;
      myBalance: string;
      quotaAmount: string;
      quotaAmountPlaceholder: string;
      quotaAmountHint: string;
    };
    messages: {
      fetchTeamListFailed: string;
      enterTeamName: string;
      setTeamRoles: string;
      maxRolesLimit: string;
      updateTeamSuccess: string;
      createTeamSuccess: string;
      deleteTeamConfirm: string;
      deleteTeamMessage: string;
      deleteTeamSuccess: string;
      deleteTeamFailed: string;
      inviteLinkCopied: string;
      inviteLinkTip: string;
      inviteLinkTipText: string;
      selectMembers: string;
      addMembersSuccess: string;
      addMembersFailed: string;
      updateRoleSuccess: string;
      updateRoleFailed: string;
      adminAuthDisabled: string;
      updateAuthSuccess: string;
      updateAuthFailed: string;
      enterValidQuota: string;
      quotaExceeded: string;
      getUserIdFailed: string;
      allocateQuotaSuccess: string;
      allocateQuotaFailed: string;
      removeMemberConfirm: string;
      removeMemberMessage: string;
      removeMemberSuccess: string;
      removeMemberFailed: string;
      getChannelIdFailed: string;
      fetchInviteUserListFailed: string;
      noMemberData: string;
      noUserData: string;
      isMember: string;
    };
    authTypes: {
      member: string;
      leader: string;
      admin: string;
      unknown: string;
    };
    pagination: {
      totalRecords: string;
      previous: string;
      next: string;
    };
    quota: {
      balance: string;
      score: string;
      level: string;
      normalMember: string;
    };
  };
  components: {
    imageCrop: {
      title: string;
      ratio: string;
      reset: string;
      cancel: string;
      confirm: string;
      cropFailed: string;
      loadFailed: string;
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
        showFilters: 'Show Filters',
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
      },
      compare: {
        button: 'Model Compare',
        buttonShort: 'Compare',
        title: 'Model Comparison',
        subtitle: 'Select up to 3 models for comparison analysis',
        modelLabel: 'Model',
        searchPlaceholder: 'Search and select model...',
        noResults: 'No matching models found',
        selectAtLeastOne: 'Please select at least one model to compare',
        compareFields: {
          provider: 'Provider',
          inputPrice: 'Input Price',
          outputPrice: 'Output Price',
          contextLength: 'Context Length',
          billingType: 'Billing Type',
          tags: 'Tags',
          description: 'Description',
        },
        tableHeader: 'Comparison Item',
        selectedCount: 'Selected',
        clearSelection: 'Clear Selection',
        finishCompare: 'Finish Comparison',
        loading: 'Loading model plaza...',
        noModels: 'No model data available',
        noMatchModels: 'No matching models found',
        billingTypes: {
          payPerUse: 'Pay per Use',
          payPerCall: 'Pay per Call',
          payPerResource: 'Pay per Resource',
          payPerSecond: 'Pay per Second',
          payPerMultimodal: 'Pay per Multimodal',
          payPerImage: 'Pay per Image',
          unknown: 'Unknown',
        },
      },
      detail: {
        title: 'Model Details',
        type: 'Type',
        pricing: 'Pricing',
        priceDetails: 'Price Details',
        priceTable: 'Price Table',
        audioOptions: 'Audio Options Price',
        noAudio: 'No Audio:',
        withAudio: 'With Audio:',
        resolutionTable: 'Resolution Price Table',
        singleSecondPrice: 'Single Second Price:',
        singleCallPrice: 'Single Call Price:',
        singleImagePrice: 'Single Image Price:',
        input: 'Input:',
        output: 'Output:',
        cachePrice: 'Cache Price',
        cacheWrite: 'Cache Write:',
        cacheRead: 'Cache Read:',
        modelDescription: 'Model Description',
        capabilityTags: 'Capability Tags',
        useForChat: 'Use this model for chat',
        useForImage: 'Use this model for image generation',
        useForVideo: 'Use this model for video generation',
        noDescription: 'No description available',
        exampleCost: 'Single Image Cost Example (Text to Image)',
        imageEditCost: 'Single Image Cost Example (Image to Image)',
        tokenTable: 'Token Consumption Table',
        quality: 'Quality',
        tokenConsumption: 'Token Consumption Table',
      },
      pagination: {
        total: 'Total',
        page: 'Page',
        perPage: '/ page',
      },
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
        modelsIntro: 'Introduction',
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
        talkingPhoto: 'Image-to-Video',
        talkingPhotoDesc: 'Generate dynamic videos from images with one click, easily creating influencer-level marketing content that naturally attracts traffic.'
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
        progressStatusShort: 'Generating',
        messages: {
          requestFailed: 'Request failed, please try again later'
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
          awaitWorking: 'Start Generating',
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
        title: 'AI Image Face Swap',
        subtitle: 'Upload main image and reference image, let AI generate face swap images for you',
        primaryLabel: 'Upload Main Image',
        primaryDescription: 'Upload the main image for face swap',
        referenceLabel: 'Upload Reference Image',
        referenceDescription: 'Upload the reference image providing the face',
        promptLabel: 'Prompt',
        promptPlaceholder: 'Please enter face swap prompt...',
        promptDefault: 'Please replace the face of the character in the reference image onto the face of the character in the main image, retaining the main image\'s hairstyle, posture, and lighting, only replacing facial features and skin tone, to make the synthesized image natural with no obvious stitching marks, while maintaining the facial expression and details of the character in the reference image',
        generate: 'Generate',
        generating: 'Generating...',
        generateButton: '0.3 Generate Face Swap Image',
        resultTitle: 'Generation Result',
        emptyState: 'The generated image will be displayed here',
        generatingMessage: 'Generating face swap image...',
        tabs: {
          result: 'Result',
          sideBySide: 'Side-by-side',
          slider: 'Slider'
        },
        labels: {
          original: 'Original',
          result: 'Result',
          preview: 'Preview',
          download: 'Download',
          addToMaterials: 'Add to Materials'
        },
        errors: {
          uploadPrimaryImage: 'Please upload main image',
          uploadReferenceImage: 'Please upload reference image',
          enterPrompt: 'Please enter prompt',
          generateFailed: 'Generation failed, please try again',
          useImageFailed: 'Failed to use image as input'
        }
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
        },
        voiceSelectModal: {
          title: 'Select Voice',
          labels: {
            scenario: 'Scenario',
            age: 'Age',
            gender: 'Gender',
            supportedLanguages: 'Supported Languages'
          },
          scenarios: {
            all: 'All Scenarios',
            customerService: 'Customer Service',
            consumerElectronics: 'Consumer Electronics',
            audiobook: 'Audiobook',
            shortVideo: 'Short Video Dubbing',
            companionChat: 'Companion Chat',
            voiceAssistant: 'Voice Assistant',
            ecommerceLive: 'E-commerce Live'
          },
          ages: {
            all: 'All Ages',
            child: 'Child',
            youth: 'Youth',
            middle: 'Middle',
            elderly: 'Elderly'
          },
          genders: {
            all: 'All Genders',
            male: 'Male',
            female: 'Female',
            neutral: 'Neutral'
          },
          languages: {
            all: 'All Languages',
            chinese: 'Chinese',
            english: 'English',
            french: 'French',
            german: 'German',
            russian: 'Russian',
            italian: 'Italian',
            spanish: 'Spanish',
            portuguese: 'Portuguese',
            japanese: 'Japanese',
            korean: 'Korean',
            other: 'Other',
            chineseDialects: 'Chinese Dialects',
            otherLanguages: 'Other Languages'
          },
          buttons: {
            cancel: 'Cancel',
            confirm: 'Confirm'
          },
          noResults: 'No matching voices found'
        }
      },
      threeDModelPage: {
        title: '3D Model',
        description: 'Transform your photo into a 3D render',
        uploadImage: 'Click or drag to upload image',
        generate: 'Generate 3D Model',
        generating: 'Generating...',
        resultTitle: 'Result',
        emptyState: 'Generated results will be displayed here',
        loadingMessages: {
          uploading: 'Uploading image...',
          generating: 'Generating 3D model...',
          waiting: 'Waiting for generation to complete...',
          downloading: 'Downloading file...',
          parsing: 'Parsing model file...',
          default: 'Generating...'
        },
        loadingHint: 'Please wait',
        errors: {
          uploadImage: 'Please upload image',
          imageUploadFailed: 'Image upload failed',
          createTaskFailed: 'Task creation failed',
          downloadFailed: 'Download failed: Resource URL does not exist',
          getDownloadUrlFailed: 'Failed to get download link: No url field in returned data',
          parseGlbFailed: 'Failed to parse GLB file',
          taskFailed: '3D task failed',
          generateFailed: 'Failed to generate 3D effect',
          downloadError: 'Download failed',
          noGlbFile: 'No .glb file in the archive',
          testFailed: 'Test failed'
        },
        testResult: {
          success: '✅ Test successful! GLB file extracted and loaded.',
          failure: '❌ Test failed'
        }
      },
      useToolPage: {
        promptPlaceholder: 'Describe the effect you want, for example: A majestic lion roaring on a rock at sunset...',
        primaryImageLabel: 'Original Image',
        referenceImageLabel: 'Reference Image',
        optional: ' (Optional)',
        uploadHint: 'Click or drag to upload image',
        clearImage: 'Clear Image',
        drawMask: 'Draw Mask',
        exitMaskEdit: 'Exit Mask Edit',
        brushSize: 'Brush Size',
        undo: 'Undo',
        clearMask: 'Clear Mask',
        generating: 'Generating...',
        generateButton: '0.3 Generate Effect',
        generatingMagic: 'Working magic...',
        resultPlaceholder: 'Generated results will be displayed here',
        errors: {
          uploadPrimaryImage: 'Please upload primary image',
          enterPrompt: 'Please enter prompt',
          uploadReferenceImage: 'Please upload reference image',
          generateFailed: 'Generation failed: No valid image URL returned',
          unknownError: 'Unknown error occurred'
        }
      },
      addMaterialModal: {
        editFolder: 'Edit Folder',
        editMaterial: 'Edit Material',
        newFolder: 'New Folder',
        addMaterial: 'Add Material',
        assetType: 'Material Type',
        loading: 'Loading...',
        noAssetType: 'No material type selected',
        noAssetTypes: 'No material types available',
        uploadFile: 'Upload File',
        clickOrDragToUpload: 'Click or drag files here to upload',
        releaseToUpload: 'Release to upload file',
        supportedFormats: 'Supports',
        uploading: 'Uploading...',
        confirmUpload: 'Confirm Upload',
        audioFile: 'Audio File',
        folderName: 'Folder Name',
        materialName: 'Material Name',
        enterFolderName: 'Enter folder name',
        enterMaterialName: 'Enter material name',
        folderTag: 'Folder Tag',
        materialTag: 'Material Tag',
        materialTagPlaceholder: 'Material tags, separate multiple tags with commas',
        materialTagFormat: 'Material tags format: tag1,tag2, separated by English commas!',
        folderDescription: 'Folder Description',
        materialDescription: 'Material Description',
        enterFolderDescription: 'Enter folder description',
        enterMaterialDescription: 'Enter material description',
        privateModel: 'Private Model (Visible only to me)',
        storageLocation: 'Storage Location',
        personalFiles: 'Personal Files',
        sharedFiles: 'Shared Files',
        both: 'Both',
        personalFolder: 'Personal Folder',
        storageFolder: 'Storage Folder',
        selectFolder: 'Select Folder',
        rootDirectory: 'Root Directory',
        selectTeam: 'Select Team',
        sharedFolder: 'Shared Folder',
        sharedFolderCannotBeRoot: 'Shared files must be in a folder, cannot be saved to root directory',
        cancel: 'Cancel',
        confirm: 'Confirm',
        selectSharedFolder: 'Select Shared Folder',
        selectPersonalFolder: 'Select Personal Folder',
        selectedFolder: 'Selected Folder',
        messages: {
          selectTeamFirst: 'Please select a team first',
          sharedFolderRequired: 'Shared files must be in a folder, cannot be saved to root directory',
          enterName: 'Please enter a name',
          uploadFileOrLink: 'Please upload material file or ensure material link exists',
          selectTeam: 'Please select a team',
          selectSharedFolder: 'Please select shared folder (cannot save to root directory)',
          uploadingFile: 'Uploading file...',
          uploadingMaterial: 'Uploading material...',
        },
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
      fetchError: 'Failed to load ranking data',
      metrics: {
        intelligence: 'Intelligence',
        coding: 'Coding',
        math: 'Math',
        speed: 'Speed'
      },
      best: 'Best',
      allModels: 'All Models',
      bestIndicator: '(Crown indicates best in this metric)',
      showMore: 'Show More',
      collapse: 'Collapse',
      top10: 'TOP 10'
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
      inputPlaceholders: {
        chat: 'Enter your question... (Enter to send, Shift+Enter for newline)',
        image: 'Describe the image you want to generate',
        video: 'Describe the video you want to generate, or upload reference images...'
      },
      inputHints: {
        send: 'Send',
        newline: 'New line',
        supportedFormats: 'Supported formats',
        maxSize: 'Max'
      },
      send: 'Send',
      welcomeMessage: 'Hi! I am your AI assistant. How can I help you today?',
      footerTip: 'Disclaimer: Content is AI-generated. Accuracy not guaranteed.',
      functionMode: {
        title: 'Function Mode',
        chat: 'Chat',
        image: 'Image',
        video: 'Video'
      },
      aiCreatingImage: 'AI is creating beautiful images for you...',
      modelNotSupportImageUpload: 'This model does not support image upload, please switch models',
      deleteConfirm: {
        title: 'Confirm Deletion',
        message: 'Are you sure you want to delete this chat record?',
        confirmText: 'Confirm',
        cancelText: 'Cancel'
      },
      toasts: {
        switchToVideoMode: 'Switched to video mode, image loaded automatically',
        uploadingVideoToOSS: 'Uploading video to OSS...',
        videoUploadSuccess: 'Video uploaded successfully',
        videoUploadFailed: 'Video upload to OSS failed',
        imageUploadFailed: 'Image upload to OSS failed',
        importMaterialFailed: 'Failed to import material, please try again',
        noMessagesToSave: 'No messages to save',
        savingAndProcessing: 'Saving and processing images/videos...',
        recordUpdated: 'Chat record updated',
        recordSaved: 'Chat record saved',
        saveRecordFailed: 'Failed to save chat record',
        recordDeleted: 'Chat record deleted',
        deleteRecordFailed: 'Failed to delete chat record',
        linkCopied: 'Link copied',
        materialImported: 'Material imported successfully'
      },
      aiRoleDefinition: {
        title: 'Define AI Assistant Role',
        description: 'Please define the AI assistant\'s role and characteristics, which will affect its reply style and behavior.',
        label: 'AI Role Definition:',
        placeholder: 'For example: You are an excellent programming expert, proficient in Python, JavaScript and other programming languages, capable of helping users solve various programming problems...',
        hint: 'Hint:',
        tips: [
          'You can define AI\'s professional field (e.g., programming, design, writing, etc.)',
          'You can set AI\'s personality traits (e.g., friendly, professional, humorous, etc.)',
          'You can specify AI\'s reply style (e.g., concise, detailed, creative, etc.)'
        ],
        cancel: 'Cancel',
        confirm: 'Confirm',
        roleLabel: 'AI Role Definition',
        editRole: 'Edit AI Role',
        defaultContent: 'You are an excellent AI assistant expert, with rich knowledge and experience, capable of helping users solve various problems.',
        inputRequired: 'Please enter AI role definition',
        updateSuccess: 'AI role definition updated'
      },
      imageValidation: {
        sora2Requirements: 'Image dimensions must exactly match output dimensions',
        sora2CropTitle: 'Crop image to match sora-2 requirements',
        sora2CropCancel: 'You cancelled cropping',
        doubaoRequirements: 'Image aspect ratio requirement not met',
        doubaoRatioHint: 'Please use an image with aspect ratio between 1/3 and 3',
        minResolution: 'Image resolution too low: width and height must be at least {0} pixels',
        maxResolution: 'Image resolution too high: width and height must not exceed {0} pixels',
        loadFailed: 'Failed to load image, please check if file is corrupted',
        formatNotSupported: 'Image format not supported. Supported formats: ',
        sizeExceeded: 'File size exceeded limit. Max allowed: ',
        readFailed: 'Failed to read file',
      }
    },
    keysPage: {
      title: 'API Key Management',
      subtitle: 'Manage your API keys to access services',
      refresh: 'Refresh',
      createButton: 'New API Key',
      tableHeaders: {
        name: 'Name',
        apiKey: 'API Key',
        status: 'Status',
        quotaUsage: 'Quota Usage',
        expirationTime: 'Expiration Time',
        operations: 'Operations'
      },
      labels: {
        limit: 'Total Limit',
        remaining: 'Remaining',
        used: 'Used',
        expires: 'Expires',
        status: 'Status'
      },
      values: {
        unlimited: 'Unlimited',
        never: 'Never Expires',
        expired: 'Expired'
      },
      actions: {
        disable: 'Disable',
        enable: 'Enable',
        delete: 'Delete',
        edit: 'Edit',
        showKey: 'Show Key',
        hideKey: 'Hide Key',
        copyKey: 'Copy Key'
      },
      status: {
        active: 'Active',
        disabled: 'Disabled'
      },
      loading: 'Loading...',
      emptyState: {
        title: 'No Tokens',
        message: 'Click the "New API Key" button above to create your first token'
      },
      totalRecords: 'Total {count} records',
      confirmDelete: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete token "{name}"?'
      },
      messages: {
        copySuccess: 'Key copied',
        copyFailed: 'Copy failed'
      },
      form: {
        title: 'New API Key',
        name: 'Name',
        namePlaceholder: 'Please enter token name',
        nameRequired: 'Please enter token name',
        enableModelLimits: 'Enable Model Restrictions',
        modelLimits: 'Model Restrictions',
        searchModel: 'Search models...',
        unlimitedQuota: 'Unlimited Quota',
        totalQuota: 'Total Quota (RMB)',
        totalQuotaPlaceholder: 'Please enter RMB quota',
        totalQuotaRequired: 'Please enter total quota (must be greater than 0)',
        usedQuota: 'Used Quota',
        remainingQuota: 'Remaining Quota',
        expirationTime: 'Expiration Time',
        apiKey: 'API Key',
        yes: 'Yes',
        no: 'No',
        quickExpire: {
          never: 'Never Expires',
          oneHour: '1 Hour',
          oneDay: '1 Day',
          oneMonth: '1 Month'
        },
        buttons: {
          save: 'Save',
          saving: 'Saving...',
          close: 'Close'
        },
        errors: {
          nameRequired: 'Please enter token name',
          quotaRequired: 'Please enter total quota (must be greater than 0)'
        }
      }
    },
    expensesPage: {
      title: 'Credits/Balance Center',
      subtitle: 'View and manage your credit balance, understand credit usage',
      balanceLabel: 'Available Balance (CNY)',
      convertPoints: 'Convertible Points:',
      memberLevel: 'Member Level:',
      quickActions: 'Quick Actions',
      buttons: {
        points: 'Points',
        balance: 'Balance',
        logs: 'Logs/Bills',
        refresh: 'Refresh Balance',
        refreshPoints: 'Refresh Points',
        refreshLogs: 'Refresh Logs',
      },
      recordsTitle: 'Usage Records',
      refreshData: 'Data synchronization may be delayed',
      export: 'Export',
      exportBill: 'Export Bill',
      totalRecords: 'Total {count} records',
      timeRange: 'Time Range:',
      to: 'to',
      query: 'Query',
      search: 'Search',
      reset: 'Reset',
      loading: 'Loading...',
      noData: 'No Data',
      noRecords: 'No Records',
      noUsageRecords: 'No usage records',
      noPointsRecords: 'No points records',
      viewDetails: 'View Details',
      collapseDetails: 'Collapse Details',
      date: 'Date',
      times: 'Times',
      token: 'Token',
      consumption: 'Consumption',
      recharge: 'Recharge',
      netAmount: 'Net Amount',
      total: 'Total',
      consumedPoints: 'Consumed Points',
      points: 'Points',
      pointsBill: 'Points Bill',
      exportHeaders: {
        time: 'Time',
        serviceType: 'Service Type',
        points: 'Points',
        status: 'Status',
        taskId: 'Task ID',
      },
      balanceExportHeaders: {
        time: 'Time',
        serviceModel: 'Service/Model',
        type: 'Type',
        cost: 'Cost($)',
        duration: 'Duration',
        inputToken: 'Input Token',
        outputToken: 'Output Token',
      },
      balanceBill: 'Balance Bill',
      record: {
        type: 'Type',
        duration: 'Duration',
        input: 'Input Token',
        output: 'Output Token',
        consumption: 'Consumption',
        recharge: 'Recharge',
      },
      status: {
        paid: 'Paid',
        unpaid: 'Unpaid',
        failed: 'Failed',
        unknown: 'Unknown'
      },
      teamLogs: {
        title: 'Logs/Bills',
        team: 'Team',
        member: 'Member',
        expenseType: 'Expense Type',
        time: 'Time',
        pleaseSelect: 'Please Select',
        teamName: 'Team Name',
        userName: 'User Name',
        tokenName: 'Creation/Token',
        modelName: 'Function/Model',
        cost: 'Cost(¥)',
        expenseTypeLabel: 'Expense Type',
        createdAt: 'Time',
        promptTokens: 'Input(Tokens)',
        completionTokens: 'Completion(Tokens)',
        addRecharge: '+ Recharge',
        addConsumption: '+ Consumption',
        firstPage: 'First Page',
        prevPage: 'Previous Page',
        nextPage: 'Next Page',
        lastPage: 'Last Page',
        recordsPerPage: 'records/page',
        logsBill: 'Logs Bill',
      },
      exportError: 'Export failed, please try again later',
      exportSuccess: 'Export successful',
      selectTeamFirst: 'Please select a team first',
      unknownService: 'Unknown Service',
      serviceTypes: {
        1: 'AI Video Mixing',
        2: 'Product Digital Human',
        3: 'Digital Human Video',
        4: 'Image to Video',
        5: 'Original Video',
        6: 'Style Transfer',
        7: 'AI Image Generation',
        8: 'Voice Clone',
        9: 'Custom Digital Human',
        10: 'Singing Digital Human',
        11: 'AI Video Face Swap',
        15: 'Creation Workshop',
      },
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
          '100+ Large Model APIs',
          '500+ Digital Human Templates',
          'Talking Photo up to 180s',
          'No Watermark',
          'Credit price ¥1.72/credit'
        ],
        modelFeatures: [
          '100+ Large Model APIs',
          'Standard Channel'
        ],
        createFeatures: [
          'Credit price ¥1.72/credit',
          'Access all Creation Center features'
        ]
      },
      business: {
        title: 'Business',
        features: [
          '100+ Large Model APIs (Priority)',
          '500+ Digital Human Templates',
          'Talking Photo up to 1800s',
          'No Watermark · Top Priority Rendering',
          'Credit price ¥1.59/credit'
        ],
        modelFeatures: [
          '100+ Large Model APIs',
          'Priority Channel'
        ],
        createFeatures: [
          'Credit price ¥1.59/credit',
          'Access all Creation Center features'
        ]
      },
      enterprise: {
        title: 'Enterprise',
        slogan: "Let's talk!",
        features: [
          'Custom Enterprise Account Management',
          'Custom Channel Management',
          'Lower Credit Conversion Rate',
          'Custom AI Feature Development'
        ]
      },
      labels: {
        credits: 'Available Credits:',
        quantity: 'Purchase Quantity',
        custom: 'Custom',
        buy: 'Buy Now',
        contact: 'Contact Us',
        times: 'x'
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
        invoiceInfo: 'Invoice Information',
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
        dataAnalysis: '📊 Data Analysis',
        form: {
          title: 'Leave Your Information',
          description: 'Our consultant will contact you soon',
          name: 'Name',
          namePlaceholder: 'Please enter your name',
          email: 'Email',
          emailPlaceholder: 'Please enter your email (optional)',
          phone: 'Phone',
          phonePlaceholder: 'Please enter your phone number',
          company: 'Company',
          companyPlaceholder: 'Please enter your company name (optional)',
          channel: 'How did you find us',
          channelPlaceholder: 'Please select how you found us',
          channels: {
            wechat: 'WeChat',
            xiaohongshu: 'Xiaohongshu',
            gongzhonghao: 'WeChat Official Account',
            douyin: 'Douyin/TikTok',
            weibo: 'Weibo',
            search: 'Search Engine',
            friend: 'Friend Referral',
            other: 'Other'
          },
          message: 'Message',
          messagePlaceholder: 'Please describe your needs (optional)',
          submit: 'Submit Now',
          submitting: 'Submitting...',
          submitSuccess: 'Submitted successfully, we will contact you soon!',
          submitError: 'Submission failed, please try again later',
          successTitle: 'Submitted Successfully!',
          successMessage: 'Thank you for your inquiry, our professional consultant will contact you within 1-2 business days.',
          submitAnother: 'Submit Another',
          errors: {
            nameRequired: 'Please enter your name',
            phoneRequired: 'Please enter your phone number',
            phoneInvalid: 'Please enter a valid phone number',
            emailInvalid: 'Please enter a valid email address',
            channelRequired: 'Please select how you found us'
          }
        }
      },
      errors: {
        loginRequired: 'Please login first',
        invalidAmount: 'Please enter a valid amount ({currency})',
        minAmountRequired: '{productName} version minimum amount is {amount}{currency}',
        invoiceOnlyWechat: 'Only WeChat Pay supports invoicing, please select WeChat Pay',
        invoiceAutoDisabled: 'Only WeChat Pay supports invoicing, invoice selection has been automatically disabled',
        invoiceFormNotInitialized: 'Invoice form not initialized, please refresh the page and try again',
        invoiceInfoRequired: 'Please fill in invoice information first',
        invoiceInfoSaved: 'Invoice information saved'
      },
      invoiceFields: {
        name: 'Name:',
        taxNumber: 'Tax Number:',
        email: 'Email:',
        companyAddress: 'Company Address:',
        companyPhone: 'Phone Number:',
        openingBank: 'Opening Bank:',
        bankAccount: 'Bank Account:'
      },
      paymentOptions: {
        alipay: 'Alipay',
        alipayHK: 'AlipayHK',
        billEase: 'BillEase',
        boost: 'Boost',
        bpi: 'BPI',
        gcash: 'GCash',
        kredivo: 'Kredivo',
        linePay: 'Rabbit LINE Pay',
        touchNGo: "Touch'n Go eWallet"
      },
      invoiceForm: {
        title: 'Fill in Invoice Header Information',
        fillInvoiceInfo: 'Fill Invoice Information',
        invoiceName: 'Invoice Header Name',
        taxNumber: 'Taxpayer Identification Number',
        email: 'Email',
        companyAddress: 'Company Address',
        companyPhone: 'Company Phone',
        openingBank: 'Opening Bank',
        bankAccount: 'Bank Account',
        placeholders: {
          invoiceName: 'Please enter invoice header name',
          taxNumber: 'Please enter taxpayer identification number',
          email: 'Please enter email',
          companyAddress: 'Please enter company address',
          companyPhone: 'Please enter company phone',
          openingBank: 'Please enter opening bank',
          bankAccount: 'Please enter bank account'
        },
        errors: {
          invoiceNameRequired: 'Please enter invoice header name',
          taxNumberRequired: 'Please enter taxpayer identification number',
          emailRequired: 'Please enter email',
          emailInvalid: 'Please enter a valid email address',
          emailMissingAt: "Please include '@' in the email address. '@' is missing in '{email}'"
        },
        cancel: 'Cancel',
        confirm: 'Confirm'
      },
      quantity: {
        times: 'times'
      },
      currency: {
        yuan: 'CNY',
        dollar: 'USD'
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
      personalFiles: 'Personal Files',
      sharedFiles: 'Shared Files',
      confirmDelete: 'Confirm Deletion',
      confirmDeleteItem: 'Are you sure you want to delete this {type}?',
      confirmDeleteSelected: 'Are you sure you want to delete {count} selected {item}?',
      confirm: 'Confirm',
      cancel: 'Cancel',
      folder: 'folder',
      material: 'material',
      moveModal: {
        title: 'Move to',
        personalFolder: 'Personal Folder',
        sharedFolder: 'Shared Folder',
        allFiles: 'All Files',
        loading: 'Loading...',
        newFolder: 'New Folder',
        newFolderPlaceholder: 'New Folder',
        unnamedFolder: 'Unnamed Folder',
        noFolders: 'No folders in this directory',
        enterTeamFolderFirst: 'Please enter team folder before operation',
        enterTeamFolderBeforeSave: 'Please enter team folder before saving',
        fileAlreadyInCurrentFolder: 'File is already in current folder, please select another folder',
        moveToHere: 'Move to here',
        cancel: 'Cancel',
        fetchFoldersFailed: 'Failed to get folder list',
        enterFolderName: 'Please enter folder name',
        folderCreatedSuccess: 'Folder created successfully',
        folderCreateFailed: 'Failed to create folder',
      },
      messages: {
        deleteSuccess: 'Deleted successfully',
        deleteFailed: 'Delete failed',
        shareSuccess: 'Shared successfully',
        shareFailedNoTeam: 'Unable to get team information, share failed',
        moveSuccess: 'Moved successfully',
        moveFailed: 'Move failed',
        operationFailed: 'Operation failed',
        sharedFilesCannotDragToRoot: 'Shared files cannot be dragged to root directory',
        assetUrlOrNameMissing: 'Asset URL or name does not exist',
      },
    },
    profilePage: {
      title: 'Personal Center',
      subtitle: 'Manage your account information and security settings',
      tabs: {
        basic: 'Basic Settings',
        security: 'Security Settings',
        enterprise: 'Enterprise Management',
        invite: 'Invitation Records'
      },
      basicInfo: 'Basic Information',
      accountSecurity: 'Account Security',
      avatar: 'Avatar',
      uploadAvatar: 'Change Avatar',
      labels: {
        accountName: 'Account Name',
        nickname: 'Nickname',
        nicknameRequired: 'Account Nickname',
        phone: 'Phone Number',
        email: 'Email',
        gender: 'Gender',
        createTime: 'Registration Time',
        role: 'Role',
        dept: 'Department',
        password: 'Password',
        oldPassword: 'Old Password',
        newPassword: 'New Password',
        confirmPassword: 'Confirm Password',
        notBound: 'Not Bound'
      },
      placeholders: {
        accountName: 'Enter account name (2-30 characters, must start with non-digit)',
        nickname: 'Enter your nickname',
        phone: 'Enter phone number',
        email: 'Enter email',
        oldPassword: 'Enter old password',
        newPassword: 'Enter new password (at least 6 characters)',
        confirmPassword: 'Enter new password again'
      },
      gender: {
        male: 'Male',
        female: 'Female',
        unknown: 'Unknown'
      },
      buttons: {
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        reset: 'Reset',
        changePassword: 'Change Password',
        retry: 'Retry'
      },
      messages: {
        loadFailed: 'Failed to load personal information',
        updateSuccess: 'Information updated successfully',
        updateFailed: 'Information update failed',
        passwordChangeSuccess: 'Password changed successfully',
        passwordChangeFailed: 'Password change failed, please check if the old password is correct',
        allFieldsRequired: 'Please fill in all password fields',
        passwordMinLength: 'New password must be at least 6 characters',
        passwordMismatch: 'The two new passwords do not match',
        passwordSame: 'New password cannot be the same as old password',
        emailInvalid: 'Please enter a valid email format',
        phoneInvalid: 'Please enter a valid phone number (6-15 digits)',
        accountNameLength: 'Account name must be between 2-30 characters',
        accountNameStart: 'Account name must start with a non-digit',
        accountNameFormat: 'Account name can only contain Chinese characters, letters, numbers, or underscores',
        inviteCodeCopied: 'Invitation code copied',
        inviteLinkCopied: 'Invitation link copied',
        copyFailed: 'Copy failed'
      },
      enterprise: {
        management: 'Enterprise Management',
        teamManagement: 'Team Management',
        channelInfo: 'Enterprise Information',
        channelName: 'Channel Name',
        shareAssets: 'Share Assets',
        yes: 'Yes',
        no: 'No',
        createTime: 'Create Time',
        updateTime: 'Update Time',
        edit: 'Edit',
        addRelation: 'Add User Enterprise Relation',
        noChannelInfo: 'No channel information',
        notSupported: 'Feature Not Supported',
        contactAdmin: 'Please contact administrator to enable enterprise permissions',
        enterChannelName: 'Please enter channel name',
        selectShareAssets: 'Please select whether to share assets',
        editRelation: 'Edit User Enterprise Relation',
        addRelationTitle: 'Add User Enterprise Relation',
        cancel: 'Cancel',
        confirm: 'Confirm',
        enterChannelNameRequired: 'Please enter channel name',
        selectShareAssetsRequired: 'Please select whether to share assets',
        getChannelInfoFailed: 'Failed to get channel information',
        editSuccess: 'Enterprise information edited successfully',
        editFailed: 'Enterprise information edit failed',
        addSuccess: 'Added successfully',
        addFailed: 'Add failed',
        operationFailed: 'Operation failed',
        noChannelId: 'Unable to get channel ID, please confirm you have enterprise permissions',
        missingChannelId: 'Missing channel ID, cannot edit'
      },
      invite: {
        title: 'Invitation Records',
        subtitle: 'View user records registered through your invitation code',
        inviteCode: 'Invitation Code',
        inviteLink: 'Invitation Link',
        copyLink: 'Copy Link',
        copied: 'Copied',
        noRecords: 'No invitation records',
        tableHeaders: {
          inviteCode: 'Invitation Code',
          invitedUser: 'Invited User Account',
          registerTime: 'Registration Time'
        },
        pagination: {
          total: 'Total {total} records',
          page: 'Page {current} / {total}',
          firstPage: 'First Page',
          prevPage: 'Previous Page',
          nextPage: 'Next Page',
          lastPage: 'Last Page'
        },
        fetchFailed: 'Failed to get invitation records'
      }
    },
    enterprisePage: {
      title: 'Team Management',
      subtitle: 'Manage team information, member invitations and role assignments',
      notSupported: 'Feature Not Supported',
      notSupportedDesc: 'You have not joined any team yet, please join an enterprise first',
      buttons: {
        addTeam: 'Add Team',
        refresh: 'Refresh',
        viewMembers: 'View Members',
        edit: 'Edit',
        inviteMember: 'Invite Member',
        addMember: 'Add Member',
        delete: 'Delete',
        cancel: 'Cancel',
        confirm: 'Confirm',
        close: 'Close',
        newUser: 'New User (Register)',
        oldUser: 'Existing User (Login)',
        editRole: 'Edit Role',
        editAuth: 'Edit Permission',
        allocate: 'Allocate',
        remove: 'Remove'
      },
      table: {
        teamName: 'Team Name',
        searchPlaceholder: 'Search team name',
        createTime: 'Created Time',
        status: 'Status',
        actions: 'Actions',
        normal: 'Normal',
        disabled: 'Disabled',
        noData: 'No team data',
        userInfo: 'User Info',
        nickName: 'Nickname',
        phoneNumber: 'Phone Number',
        userAuth: 'User Permission',
        userRole: 'User Role',
        remainingQuota: 'Remaining Quota',
        usedQuota: 'Used Quota',
        joinTime: 'Join Time',
        userName: 'User Name',
        account: 'Account',
        registerTime: 'Register Time'
      },
      modals: {
        addTeam: 'Add Team',
        editTeam: 'Edit Team',
        teamName: 'Team Name',
        teamNamePlaceholder: 'Please enter team name',
        teamRoles: 'Team Roles',
        teamRolesPlaceholder: 'Please enter team roles, e.g.: Developer, Tester, Observer',
        teamRolesHint: '(Please enter team roles, press Enter or comma to add, a team supports up to 10 roles)',
        remark: 'Remark',
        remarkPlaceholder: 'Please enter team remark',
        membersList: 'Team Members List',
        noRole: 'No Role',
        selectInviteType: 'Select Invite Type',
        inviteTypeDesc: 'Please select whether to invite a new user or an existing user to join the team',
        addMembers: 'Add Team Members',
        searchUserPlaceholder: 'Search username or email',
        selectedCount: 'Selected {count} members',
        editMemberRole: 'Edit Member Role',
        memberInfo: 'Member Information',
        currentRole: 'Current Role:',
        selectNewRole: 'Select New Role',
        editMemberAuth: 'Edit Member Permission',
        currentAuth: 'Current Permission:',
        selectNewAuth: 'Select New Permission',
        allocateQuota: 'Allocate Quota to Team Member',
        memberInfoTitle: 'Member Information',
        currentBalance: 'Current Balance:',
        score: 'Score:',
        memberLevel: 'Member Level:',
        myBalance: 'My Balance',
        quotaAmount: 'Quota Amount (RMB)',
        quotaAmountPlaceholder: 'Please enter quota amount',
        quotaAmountHint: 'Quota amount cannot exceed your remaining balance ¥{amount}'
      },
      messages: {
        fetchTeamListFailed: 'Failed to fetch team list',
        enterTeamName: 'Please enter team name',
        setTeamRoles: 'Please set team roles',
        maxRolesLimit: 'Team roles support up to 10',
        updateTeamSuccess: 'Team updated successfully',
        createTeamSuccess: 'Team created successfully',
        deleteTeamConfirm: 'Confirm Delete',
        deleteTeamMessage: 'Are you sure you want to delete team "{teamName}"?\nThis will also delete all related data including team roles, team members, team folders, etc. This operation cannot be undone!',
        deleteTeamSuccess: 'Team deleted successfully',
        deleteTeamFailed: 'Failed to delete team',
        inviteLinkCopied: 'Invite link copied to clipboard',
        inviteLinkTip: 'Invite Link: {url}\n\nTip: If the invited account is currently logged in, please log out first before using the invite link to join the team.',
        inviteLinkTipText: 'If the invited account is currently logged in, please log out first before using the invite link to join the team.',
        selectMembers: 'Please select members to add',
        addMembersSuccess: 'Successfully added {count} members',
        addMembersFailed: 'Failed to add members',
        updateRoleSuccess: 'Role updated successfully',
        updateRoleFailed: 'Failed to update role',
        adminAuthDisabled: 'Admin permission has been disabled. Channel owners are administrators by default',
        updateAuthSuccess: 'Permission updated successfully',
        updateAuthFailed: 'Failed to update permission',
        enterValidQuota: 'Please enter a valid quota amount',
        quotaExceeded: 'Quota amount cannot exceed ¥{amount} (0.01 RMB precision margin reserved)',
        getUserIdFailed: 'Unable to get user ID',
        allocateQuotaSuccess: 'Quota allocated successfully',
        allocateQuotaFailed: 'Failed to allocate quota',
        removeMemberConfirm: 'Confirm Remove',
        removeMemberMessage: 'Are you sure you want to remove member "{userName}"?',
        removeMemberSuccess: 'Member removed successfully',
        removeMemberFailed: 'Failed to remove member',
        getChannelIdFailed: 'Failed to get channel ID, please confirm the team has been associated with a channel',
        fetchInviteUserListFailed: 'Failed to fetch invite user list',
        noMemberData: 'No member data',
        noUserData: 'No user data',
        isMember: 'Already a member'
      },
      authTypes: {
        member: 'Member',
        leader: 'Leader',
        admin: 'Admin',
        unknown: 'Unknown'
      },
      pagination: {
        totalRecords: 'Total {total} records',
        previous: 'Previous',
        next: 'Next'
      },
      quota: {
        balance: 'Balance:',
        score: 'Score:',
        level: 'Level:',
        normalMember: 'Normal Member'
      }
    },
    components: {
      imageCrop: {
        title: 'Crop Image',
        ratio: 'Aspect Ratio',
        reset: 'Reset',
        cancel: 'Cancel',
        confirm: 'Confirm Crop',
        cropFailed: 'Crop failed',
        loadFailed: 'Failed to load image',
      },
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
        showFilters: '显示筛选',
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
      },
      compare: {
        button: '模型对比',
        buttonShort: '对比',
        title: '模型对比',
        subtitle: '选择最多3个模型进行对比分析',
        modelLabel: '模型',
        searchPlaceholder: '搜索并选择模型...',
        noResults: '没有找到匹配的模型',
        selectAtLeastOne: '请选择至少一个模型进行对比',
        compareFields: {
          provider: '供应商',
          inputPrice: '输入价格',
          outputPrice: '输出价格',
          contextLength: '上下文长度',
          billingType: '计费类型',
          tags: '标签',
          description: '描述',
        },
        tableHeader: '对比项',
        selectedCount: '已选择',
        clearSelection: '清空选择',
        finishCompare: '完成对比',
        loading: '正在加载模型广场...',
        noModels: '暂无模型数据',
        noMatchModels: '没有找到匹配的模型',
        billingTypes: {
          payPerUse: '按量计费',
          payPerCall: '按次计费',
          payPerResource: '按资源类型计费',
          payPerSecond: '按秒计费',
          payPerMultimodal: '按全模态计费',
          payPerImage: '按张计费',
          unknown: '未知',
        },
      },
      detail: {
        title: '模型详情',
        type: '类型',
        pricing: '定价',
        priceDetails: '价格详情',
        priceTable: '价格表',
        audioOptions: '音频选项价格',
        noAudio: '不含音频:',
        withAudio: '含音频:',
        resolutionTable: '分辨率价格表',
        singleSecondPrice: '单秒价格:',
        singleCallPrice: '单次调用:',
        singleImagePrice: '单张生成:',
        input: '输入:',
        output: '输出:',
        cachePrice: '缓存价格',
        cacheWrite: '缓存写入:',
        cacheRead: '缓存读取:',
        modelDescription: '模型描述',
        capabilityTags: '能力标签',
        useForChat: '使用该模型对话',
        useForImage: '使用该模型生成图片',
        useForVideo: '使用该模型生成视频',
        noDescription: '暂无描述',
        exampleCost: '单张成本示例 (文生图)',
        imageEditCost: '单张成本示例 (图生图)',
        tokenTable: 'Token 消耗表',
        quality: '质量',
        tokenConsumption: 'Token 消耗表',
      },
      pagination: {
        total: '共',
        page: '第',
        perPage: '/ 页',
      },
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
        modelsIntro: '简介',
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
        pricing: '费用充值',
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
        talkingPhoto: '图生视频',
        talkingPhotoDesc: '基于图片一键生成动态视频，轻松打造自带流量属性的网红级营销内容'
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
        progressStatusShort: '生成中',
        messages: {
          requestFailed: '请求失败, 请稍后重试'
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
          awaitWorking: '开始生成',
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
        title: 'AI 图片换脸',
        subtitle: '上传主图和参考图，让 AI 为您生成换脸图片',
        primaryLabel: '上传主图',
        primaryDescription: '上传需要换脸的主图片',
        referenceLabel: '上传参考图',
        referenceDescription: '上传提供脸部的参考图片',
        promptLabel: '提示词',
        promptPlaceholder: '请输入换脸提示词...',
        promptDefault: '请将参考图像中的人物脸部替换到主图像人物的脸上，保留主图像的发型、姿势和光影，只替换面部特征与肤色，使合成后的画面自然、无明显拼接痕迹，同时保持参考图像人物的面部表情与细节',
        generate: '生成',
        generating: '生成中...',
        generateButton: '0.3 生成换脸图片',
        resultTitle: '生成结果',
        emptyState: '生成的图片将显示在这里',
        generatingMessage: '正在生成换脸图片...',
        tabs: {
          result: '结果',
          sideBySide: '并排',
          slider: '滑块'
        },
        labels: {
          original: '原图',
          result: '结果',
          preview: '预览',
          download: '下载',
          addToMaterials: '添加到素材库'
        },
        errors: {
          uploadPrimaryImage: '请上传主图',
          uploadReferenceImage: '请上传参考图',
          enterPrompt: '请输入提示词',
          generateFailed: '生成失败，请重试',
          useImageFailed: '使用图片作为输入失败'
        }
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
        },
        voiceSelectModal: {
          title: '选择音色',
          labels: {
            scenario: '场景',
            age: '年龄',
            gender: '性别',
            supportedLanguages: '可生成对应语种语言'
          },
          scenarios: {
            all: '全部场景',
            customerService: '电话客服',
            consumerElectronics: '消费电子',
            audiobook: '有声书',
            shortVideo: '短视频配音',
            companionChat: '陪伴聊天',
            voiceAssistant: '语音助手',
            ecommerceLive: '电商直播'
          },
          ages: {
            all: '全部年龄',
            child: '儿童',
            youth: '青年',
            middle: '中年',
            elderly: '老人'
          },
          genders: {
            all: '全部性别',
            male: '男声',
            female: '女声',
            neutral: '中性'
          },
          languages: {
            all: '全部语言',
            chinese: '中文',
            english: '英语',
            french: '法语',
            german: '德语',
            russian: '俄语',
            italian: '意大利语',
            spanish: '西班牙语',
            portuguese: '葡萄牙语',
            japanese: '日语',
            korean: '韩语',
            other: '其他',
            chineseDialects: '中文方言',
            otherLanguages: '其他语言'
          },
          buttons: {
            cancel: '取消',
            confirm: '确定'
          },
          noResults: '没有找到匹配的音色'
        }
      },
      threeDModelPage: {
        title: '3D 模型',
        description: '将您的照片变成一份3D效果图',
        uploadImage: '点击或拖拽上传图片',
        generate: '生成 3D 模型',
        generating: '生成中...',
        resultTitle: '结果',
        emptyState: '生成的结果将显示在这里',
        loadingMessages: {
          uploading: '正在上传图片...',
          generating: '正在生成 3D 模型...',
          waiting: '正在等待生成完成...',
          downloading: '正在下载文件...',
          parsing: '正在解析模型文件...',
          default: '正在生成...'
        },
        loadingHint: '请稍候',
        errors: {
          uploadImage: '请上传图片',
          imageUploadFailed: '图片上传失败',
          createTaskFailed: '创建任务失败',
          downloadFailed: '下载失败：资源URL不存在',
          getDownloadUrlFailed: '获取下载链接失败：返回数据中没有 url 字段',
          parseGlbFailed: '解析 GLB 文件失败',
          taskFailed: '3D 任务失败',
          generateFailed: '生成3D效果失败',
          downloadError: '下载失败',
          noGlbFile: '压缩包中没有 .glb 文件',
          testFailed: '测试失败'
        },
        testResult: {
          success: '✅ 测试成功！GLB 文件已提取并加载。',
          failure: '❌ 测试失败'
        }
      },
      useToolPage: {
        promptPlaceholder: '描述你想要的效果，例如：一只雄伟的狮子在日落时分的岩石上咆哮...',
        primaryImageLabel: '原始图像',
        referenceImageLabel: '参考图像',
        optional: ' (可选)',
        uploadHint: '点击或拖拽上传图片',
        clearImage: '清除图片',
        drawMask: '绘制蒙版',
        exitMaskEdit: '退出蒙版编辑',
        brushSize: '画笔大小',
        undo: '撤销',
        clearMask: '清除蒙版',
        generating: '生成中...',
        generateButton: '0.3 生成效果',
        generatingMagic: '正在施展魔法...',
        resultPlaceholder: '生成的结果将显示在这里',
        errors: {
          uploadPrimaryImage: '请上传主图像',
          enterPrompt: '请输入提示词',
          uploadReferenceImage: '请上传参考图像',
          generateFailed: '生成失败：未返回有效的图片URL',
          unknownError: '发生未知错误'
        }
      },
      addMaterialModal: {
        editFolder: '编辑文件夹',
        editMaterial: '编辑素材',
        newFolder: '新建文件夹',
        addMaterial: '添加素材',
        assetType: '素材类型',
        loading: '加载中...',
        noAssetType: '未选择素材类型',
        noAssetTypes: '暂无素材类型',
        uploadFile: '上传文件',
        clickOrDragToUpload: '点击或拖拽文件到此处上传',
        releaseToUpload: '松开以上传文件',
        supportedFormats: '支持',
        uploading: '上传中...',
        confirmUpload: '确认上传',
        audioFile: '音频文件',
        folderName: '文件夹名称',
        materialName: '素材名称',
        enterFolderName: '请输入文件夹名称',
        enterMaterialName: '请输入素材名称',
        folderTag: '文件夹标签',
        materialTag: '素材标签',
        materialTagPlaceholder: '素材标签，多个标签用逗号分隔',
        materialTagFormat: '素材标签格式：标签1,标签2，标签之间用英文逗号隔开！',
        folderDescription: '文件夹描述',
        materialDescription: '素材描述',
        enterFolderDescription: '请输入文件夹描述',
        enterMaterialDescription: '请输入素材描述',
        privateModel: '私有模型 (仅自己可见)',
        storageLocation: '存储位置',
        personalFiles: '个人文件',
        sharedFiles: '共享文件',
        both: '两者都放',
        personalFolder: '个人文件夹',
        storageFolder: '存储文件夹',
        selectFolder: '选择文件夹',
        rootDirectory: '根目录',
        selectTeam: '选择团队',
        sharedFolder: '共享文件夹',
        sharedFolderCannotBeRoot: '共享文件必须选择文件夹，不允许保存到根目录',
        cancel: '取消',
        confirm: '确定',
        selectSharedFolder: '选择共享文件夹',
        selectPersonalFolder: '选择个人文件夹',
        selectedFolder: '已选文件夹',
        messages: {
          selectTeamFirst: '请先选择团队',
          sharedFolderRequired: '共享文件必须选择文件夹，不能保存到根目录',
          enterName: '请输入名称',
          uploadFileOrLink: '请上传素材文件或确保素材链接存在',
          selectTeam: '请选择团队',
          selectSharedFolder: '请选择共享文件夹（不能保存到根目录）',
          uploadingFile: '正在上传文件...',
          uploadingMaterial: '正在上传素材...',
        },
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
      fetchError: '排行榜数据加载失败',
      metrics: {
        intelligence: '智能指数',
        coding: '编码能力',
        math: '数学能力',
        speed: '推理速度'
      },
      best: '最佳',
      allModels: '全部模型',
      bestIndicator: '（表示该指标最佳）',
      showMore: '展示更多',
      collapse: '收起',
      top10: 'TOP 10'
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
      inputPlaceholders: {
        chat: '输入您的问题... (Enter发送, Shift+Enter换行)',
        image: '描述您想要生成的图片',
        video: '描述您想要生成的视频,也可以上传参考图片...'
      },
      inputHints: {
        send: '发送',
        newline: '换行',
        supportedFormats: '支持格式',
        maxSize: '最大'
      },
      send: '发送',
      welcomeMessage: '你好！我是AI助手，很高兴为您服务。请问有什么可以帮助您的吗？',
      footerTip: '温馨提示：所有内容均由AI模型生成，准确性和完整性无法保证，不代表平台的态度或观点',
      functionMode: {
        title: '功能模式',
        chat: '对话',
        image: '图片',
        video: '视频'
      },
      aiCreatingImage: 'AI正在为您创作精美图片...',
      modelNotSupportImageUpload: '该模型不支持上传图片，请切换模型',
      deleteConfirm: {
        title: '确认删除',
        message: '确定要删除这条对话记录吗？',
        confirmText: '确定',
        cancelText: '取消'
      },
      toasts: {
        switchToVideoMode: '已切换到视频模式，图片已自动加载',
        uploadingVideoToOSS: '正在上传视频到 OSS...',
        videoUploadSuccess: '视频上传成功',
        videoUploadFailed: '视频上传到 OSS 失败',
        imageUploadFailed: '图片上传到 OSS 失败',
        importMaterialFailed: '导入素材失败，请重试',
        noMessagesToSave: '没有可保存的消息',
        savingAndProcessing: '正在保存并处理图片/视频...',
        recordUpdated: '对话记录已更新',
        recordSaved: '对话记录已保存',
        saveRecordFailed: '保存对话记录失败',
        recordDeleted: '对话记录已删除',
        deleteRecordFailed: '删除对话记录失败',
        linkCopied: '链接已复制',
        materialImported: '素材导入成功'
      },
      aiRoleDefinition: {
        title: '定义AI助手角色',
        description: '请定义AI助手的角色和特点，这将影响AI的回复风格和行为方式。',
        label: 'AI角色定义：',
        placeholder: '例如：你是一位优秀的编程专家，擅长Python、JavaScript等编程语言，能够帮助用户解决各种编程问题...',
        hint: '提示：',
        tips: [
          '可以定义AI的专业领域（如编程、设计、写作等）',
          '可以设置AI的性格特点（如友好、专业、幽默等）',
          '可以指定AI的回复风格（如简洁、详细、创意等）'
        ],
        cancel: '取消',
        confirm: '确定',
        roleLabel: 'AI角色定义',
        editRole: '编辑AI角色',
        defaultContent: '你是一位优秀的AI助手专家，具有丰富的知识和经验，能够帮助用户解决各种问题。',
        inputRequired: '请输入AI角色定义',
        updateSuccess: 'AI角色定义已更新'
      },
      imageValidation: {
        sora2Requirements: '图片尺寸必须完全匹配输出尺寸',
        sora2CropTitle: '裁剪图片以符合 sora-2 要求',
        sora2CropCancel: '您已取消裁剪',
        doubaoRequirements: '图片宽高比不符合要求',
        doubaoRatioHint: '请使用宽高比在 1/3 到 3 之间的图片',
        minResolution: '图片分辨率不符合要求：宽高需至少 {0} 像素',
        maxResolution: '图片分辨率不符合要求：宽高需不超过 {0} 像素',
        loadFailed: '图片加载失败，请检查文件是否损坏',
        readFailed: '文件读取失败',
        formatNotSupported: '图片格式不支持。仅支持：',
        sizeExceeded: '文件大小超过限制。最大允许：',
      }
    },
    keysPage: {
      title: 'API 令牌管理',
      subtitle: '管理您的 API 密钥以访问服务',
      refresh: '刷新',
      createButton: '新建 API 密钥',
      tableHeaders: {
        name: '名称',
        apiKey: 'API Key',
        status: '状态',
        quotaUsage: '额度使用',
        expirationTime: '过期时间',
        operations: '操作'
      },
      labels: {
        limit: '总额度',
        remaining: '剩余额度',
        used: '已用额度',
        expires: '过期时间',
        status: '状态'
      },
      values: {
        unlimited: '无限',
        never: '永不过期',
        expired: '已过期'
      },
      actions: {
        disable: '禁用',
        enable: '启用',
        delete: '删除',
        edit: '编辑',
        showKey: '显示密钥',
        hideKey: '隐藏密钥',
        copyKey: '复制密钥'
      },
      status: {
        active: '启用',
        disabled: '禁用'
      },
      loading: '加载中...',
      emptyState: {
        title: '暂无令牌',
        message: '点击上方"新建 API 密钥"按钮创建您的第一个令牌'
      },
      totalRecords: '共 {count} 条记录',
      confirmDelete: {
        title: '确认删除',
        message: '确认删除令牌 "{name}" 吗？'
      },
      messages: {
        copySuccess: '密钥已复制',
        copyFailed: '复制失败'
      },
      form: {
        title: '新建 API 密钥',
        name: '名称',
        namePlaceholder: '请输入令牌名称',
        nameRequired: '请输入令牌名称',
        enableModelLimits: '启用模型限制',
        modelLimits: '模型限制',
        searchModel: '搜索模型...',
        unlimitedQuota: '无限额度',
        totalQuota: '总额度（人民币）',
        totalQuotaPlaceholder: '请输入人民币额度',
        totalQuotaRequired: '请输入总额度（必须大于0）',
        usedQuota: '已用额度',
        remainingQuota: '剩余额度',
        expirationTime: '过期时间',
        apiKey: 'API密钥',
        yes: '是',
        no: '否',
        quickExpire: {
          never: '永不过期',
          oneHour: '1小时',
          oneDay: '1天',
          oneMonth: '1个月'
        },
        buttons: {
          save: '保存',
          saving: '保存中...',
          close: '关闭'
        },
        errors: {
          nameRequired: '请输入令牌名称',
          quotaRequired: '请输入总额度（必须大于0）'
        }
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
          '100+ 大模型 API',
          '500+ 数字人模板',
          '照片说话最长 180秒',
          '无水印导出',
          '积分单价 ¥1.72/积分'
        ],
        modelFeatures: [
          '100+ 大模型 API',
          '标准通道'
        ],
        createFeatures: [
          '积分单价 ¥1.72/积分',
          '享受创作中心全部功能'
        ]
      },
      business: {
        title: 'Business会员',
        features: [
          '100+ 大模型 API（优先通道）',
          '500+ 数字人模板',
          '照片说话最长 1800秒',
          '无水印 · 最高优先渲染',
          '积分单价 ¥1.59/积分'
        ],
        modelFeatures: [
          '100+ 大模型 API',
          '优先通道'
        ],
        createFeatures: [
          '积分单价 ¥1.59/积分',
          '享受创作中心全部功能'
        ]
      },
      enterprise: {
        title: 'Enterprise',
        slogan: "Let's talk!",
        features: [
          '自定义企业账号管理',
          '自定义渠道管理',
          '更低积分转换额度',
          '定制化AI功能开发'
        ]
      },
      labels: {
        credits: '可使用积分:',
        quantity: '购买数量',
        custom: '自定义',
        buy: '立即购买',
        contact: '联系我们',
        times: '倍'
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
        invoiceInfo: '发票信息',
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
        dataAnalysis: '📊 数据分析',
        form: {
          title: '留下您的信息',
          description: '专业顾问将尽快与您联系',
          name: '姓名',
          namePlaceholder: '请输入您的姓名',
          email: '邮箱',
          emailPlaceholder: '请输入您的邮箱（选填）',
          phone: '电话',
          phonePlaceholder: '请输入您的手机号码',
          company: '公司名称',
          companyPlaceholder: '请输入您的公司名称（选填）',
          channel: '了解渠道',
          channelPlaceholder: '请选择您是如何了解我们的',
          channels: {
            wechat: '微信',
            xiaohongshu: '小红书',
            gongzhonghao: '公众号',
            douyin: '抖音',
            weibo: '微博',
            search: '搜索引擎',
            friend: '朋友推荐',
            other: '其他'
          },
          message: '留言',
          messagePlaceholder: '请描述您的需求（选填）',
          submit: '立即提交',
          submitting: '提交中...',
          submitSuccess: '提交成功，我们会尽快与您联系！',
          submitError: '提交失败，请稍后重试',
          successTitle: '提交成功！',
          successMessage: '感谢您的咨询，我们的专业顾问会在1-2个工作日内与您联系。',
          submitAnother: '继续提交',
          errors: {
            nameRequired: '请输入姓名',
            phoneRequired: '请输入电话',
            phoneInvalid: '请输入有效的手机号码',
            emailInvalid: '请输入有效的邮箱地址',
            channelRequired: '请选择了解渠道'
          }
        }
      },
      errors: {
        loginRequired: '请先登录',
        invalidAmount: '请输入有效的金额（{currency}）',
        minAmountRequired: '{productName}版本最低金额为{amount}{currency}',
        invoiceOnlyWechat: '只有微信支付支持开发票，请选择微信支付',
        invoiceAutoDisabled: '只有微信支付支持开发票，已自动取消发票选择',
        invoiceFormNotInitialized: '发票表单未初始化，请刷新页面重试',
        invoiceInfoRequired: '请先填写发票信息',
        invoiceInfoSaved: '发票信息已保存'
      },
      invoiceFields: {
        name: '名称:',
        taxNumber: '税号:',
        email: '邮箱:',
        companyAddress: '单位地址:',
        companyPhone: '电话号码:',
        openingBank: '开户银行:',
        bankAccount: '银行账户:'
      },
      paymentOptions: {
        alipay: '支付宝支付',
        alipayHK: 'AlipayHK',
        billEase: 'BillEase',
        boost: 'Boost',
        bpi: 'BPI',
        gcash: 'GCash',
        kredivo: 'Kredivo',
        linePay: 'Rabbit LINE Pay',
        touchNGo: "Touch'n Go eWallet"
      },
      invoiceForm: {
        title: '填写发票抬头信息',
        fillInvoiceInfo: '填写发票信息',
        invoiceName: '发票抬头名称',
        taxNumber: '纳税人识别号',
        email: '邮箱',
        companyAddress: '公司地址',
        companyPhone: '公司电话',
        openingBank: '开户银行',
        bankAccount: '银行账户',
        placeholders: {
          invoiceName: '请输入发票抬头名称',
          taxNumber: '请输入纳税人识别号',
          email: '请输入邮箱',
          companyAddress: '请输入公司地址',
          companyPhone: '请输入公司电话',
          openingBank: '请输入开户银行',
          bankAccount: '请输入银行账户'
        },
        errors: {
          invoiceNameRequired: '请输入发票抬头名称',
          taxNumberRequired: '请输入纳税人识别号',
          emailRequired: '请输入邮箱',
          emailInvalid: '请输入有效的邮箱地址',
          emailMissingAt: "邮箱地址中必须包含 '@' 符号，'{email}' 中缺少 '@'"
        },
        cancel: '取消',
        confirm: '确定'
      },
      quantity: {
        times: '倍'
      },
      currency: {
        yuan: '元',
        dollar: '美元'
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
      personalFiles: '个人文件',
      sharedFiles: '共享文件',
      confirmDelete: '确认删除',
      confirmDeleteItem: '确认删除该{type}吗？',
      confirmDeleteSelected: '确认删除选中的 {count} 个素材吗？',
      confirm: '确定',
      cancel: '取消',
      folder: '文件夹',
      material: '素材',
      moveModal: {
        title: '移动到',
        personalFolder: '个人文件夹',
        sharedFolder: '共享文件夹',
        allFiles: '全部文件',
        loading: '加载中...',
        newFolder: '新建文件夹',
        newFolderPlaceholder: '新建文件夹',
        unnamedFolder: '未命名文件夹',
        noFolders: '该目录下没有文件夹',
        enterTeamFolderFirst: '请进入团队文件夹后再进行操作',
        enterTeamFolderBeforeSave: '请进入团队文件夹后再保存',
        fileAlreadyInCurrentFolder: '文件已在当前文件夹中，请选择其他文件夹',
        moveToHere: '移动到此处',
        cancel: '取消',
        fetchFoldersFailed: '获取文件夹列表失败',
        enterFolderName: '请输入文件夹名称',
        folderCreatedSuccess: '文件夹创建成功',
        folderCreateFailed: '创建文件夹失败',
      },
      messages: {
        deleteSuccess: '删除成功',
        deleteFailed: '删除失败',
        shareSuccess: '分享成功',
        shareFailedNoTeam: '无法获取团队信息，分享失败',
        moveSuccess: '移动成功',
        moveFailed: '移动失败',
        operationFailed: '操作失败',
        sharedFilesCannotDragToRoot: '共享文件不支持拖拽到根目录',
        assetUrlOrNameMissing: '素材URL或名称不存在',
      },
    },
    expensesPage: {
      title: '费用中心',
      subtitle: '查看和管理您的余额和积分，了解使用情况',
      balanceLabel: '可用余额 (CNY)',
      convertPoints: '可转换积分:',
      memberLevel: '会员等级:',
      quickActions: '快捷操作',
      buttons: {
        points: '积分',
        balance: '余额',
        logs: '日志/账单',
        refresh: '刷新余额',
        refreshPoints: '刷新积分',
        refreshLogs: '刷新日志',
      },
      recordsTitle: '使用记录',
      refreshData: '数据同步可能存在延迟',
      export: '导出',
      exportBill: '导出账单',
      totalRecords: '共 {count} 条记录',
      timeRange: '时间范围：',
      to: '至',
      query: '查询',
      search: '搜索',
      reset: '重置',
      loading: '加载中...',
      noData: '暂无数据',
      noRecords: '暂无记录',
      noUsageRecords: '暂无使用记录',
      noPointsRecords: '暂无积分流水',
      viewDetails: '查看明细',
      collapseDetails: '收起明细',
      date: '日期',
      times: '次数',
      token: 'Token',
      consumption: '消费',
      recharge: '充值',
      netAmount: '净额',
      total: '合计',
      consumedPoints: '消耗积分',
      points: '积分',
      pointsBill: '积分账单',
      exportHeaders: {
        time: '时间',
        serviceType: '服务类型',
        points: '积分',
        status: '状态',
        taskId: '任务ID',
      },
      balanceExportHeaders: {
        time: '时间',
        serviceModel: '服务/模型',
        type: '类型',
        cost: '费用(¥)',
        duration: '用时',
        inputToken: '输入Token',
        outputToken: '输出Token',
      },
      balanceBill: '余额账单',
      record: {
        type: '类型',
        duration: '用时',
        input: '输入token',
        output: '输出token',
        consumption: '消费',
        recharge: '充值',
      },
      status: {
        paid: '已扣款',
        unpaid: '未扣款',
        failed: '失败',
        unknown: '未知',
      },
      teamLogs: {
        title: '日志/账单',
        team: '团队',
        member: '成员',
        expenseType: '费用类型',
        time: '时间',
        pleaseSelect: '请选择',
        teamName: '团队名称',
        userName: '用户名',
        tokenName: '创作/令牌',
        modelName: '功能/模型',
        cost: '费用(¥)',
        expenseTypeLabel: '费用类型',
        createdAt: '时间',
        promptTokens: '输入(Tokens)',
        completionTokens: '完成(Tokens)',
        addRecharge: '+ 充值',
        addConsumption: '+ 消费',
        firstPage: '第一页',
        prevPage: '上一页',
        nextPage: '下一页',
        lastPage: '最后一页',
        recordsPerPage: '条/页',
        logsBill: '日志账单',
      },
      exportError: '导出失败，请稍后重试',
      exportSuccess: '导出成功',
      selectTeamFirst: '请先选择团队',
      unknownService: '未知服务',
      serviceTypes: {
        1: 'AI混剪视频',
        2: '产品数字人',
        3: '数字人视频',
        4: '图生视频',
        5: '原创视频',
        6: '万物迁移',
        7: 'AI生图',
        8: '声音克隆',
        9: '自定义数字人',
        10: '唱歌数字人',
        11: 'AI视频换脸',
        15: '创作工坊',
      },
    },
    profilePage: {
      title: '个人中心',
      subtitle: '管理您的账户信息和安全设置',
      tabs: {
        basic: '基本设置',
        security: '安全设置',
        enterprise: '企业管理',
        invite: '推广邀请记录'
      },
      basicInfo: '基本资料',
      accountSecurity: '账号安全',
      enterpriseManagement: '企业管理',
      avatar: '头像',
      uploadAvatar: '更换头像',
      labels: {
        accountName: '账号名称',
        nickname: '账号昵称',
        nicknameRequired: '账号昵称',
        phone: '手机号',
        email: '邮箱',
        gender: '性别',
        createTime: '注册时间',
        role: '角色',
        dept: '所属部门',
        password: '用户密码',
        oldPassword: '旧密码',
        newPassword: '新密码',
        confirmPassword: '确认密码',
        notBound: '未绑定'
      },
      placeholders: {
        accountName: '请输入账号名称（2-30个字符，必须以非数字开头）',
        nickname: '请输入用户昵称',
        phone: '请输入手机号',
        email: '请输入邮箱',
        oldPassword: '请输入旧密码',
        newPassword: '请输入新密码（至少6位）',
        confirmPassword: '请再次输入新密码'
      },
      gender: {
        male: '男',
        female: '女',
        unknown: '未知'
      },
      buttons: {
        save: '保存',
        cancel: '取消',
        edit: '编辑',
        reset: '重置',
        changePassword: '修改密码',
        retry: '重试'
      },
      messages: {
        loadFailed: '无法加载个人信息',
        updateSuccess: '信息更新成功',
        updateFailed: '信息更新失败',
        passwordChangeSuccess: '密码修改成功',
        passwordChangeFailed: '密码修改失败，请检查旧密码是否正确',
        allFieldsRequired: '请填写所有密码字段',
        passwordMinLength: '新密码长度至少为6位',
        passwordMismatch: '两次输入的新密码不一致',
        passwordSame: '新密码不能与旧密码相同',
        emailInvalid: '请输入正确的邮箱格式',
        phoneInvalid: '请输入正确的手机号码（6-15位数字）',
        accountNameLength: '账号名称长度必须在2-30个字符之间',
        accountNameStart: '账号名称必须以非数字开头',
        accountNameFormat: '账号名称只能包含中文字符、字母、数字或下划线',
        inviteCodeCopied: '邀请码已复制',
        inviteLinkCopied: '邀请链接已复制',
        copyFailed: '复制失败'
      },
      enterprise: {
        management: '企业管理',
        teamManagement: '团队管理',
        channelInfo: '企业信息',
        channelName: '企业名称',
        shareAssets: '是否共享资产',
        yes: '是',
        no: '否',
        createTime: '创建时间',
        updateTime: '更新时间',
        edit: '编辑',
        addRelation: '新增用户企业关联',
        noChannelInfo: '暂无企业信息',
        notSupported: '暂不支持该功能',
        contactAdmin: '请联系管理员开通企业权限',
        enterChannelName: '请输入企业名称',
        selectShareAssets: '请选择是否共享资产',
        editRelation: '编辑用户企业关联',
        addRelationTitle: '新增用户企业关联',
        cancel: '取消',
        confirm: '确定',
        enterChannelNameRequired: '请输入企业名称',
        selectShareAssetsRequired: '请选择是否共享资产',
        getChannelInfoFailed: '获取企业信息失败',
        editSuccess: '企业信息编辑成功',
        editFailed: '企业信息编辑失败',
        addSuccess: '新增成功',
        addFailed: '新增失败',
        operationFailed: '操作失败',
        noChannelId: '无法获取企业ID，请确认您有企业权限',
        missingChannelId: '缺少企业ID，无法编辑'
      },
      invite: {
        title: '推广邀请记录',
        subtitle: '查看通过您的邀请码注册的用户记录',
        inviteCode: '邀请码',
        inviteLink: '邀请链接',
        copyLink: '复制链接',
        copied: '已复制',
        noRecords: '暂无邀请记录',
        tableHeaders: {
          inviteCode: '邀请码',
          invitedUser: '受邀用户账号',
          registerTime: '注册时间'
        },
        pagination: {
          total: '共 {total} 条记录',
          page: '第 {current} / {total} 页',
          firstPage: '首页',
          prevPage: '上一页',
          nextPage: '下一页',
          lastPage: '末页'
        },
        fetchFailed: '获取邀请记录失败'
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
    enterprisePage: {
      title: '团队管理',
      subtitle: '管理团队信息、成员邀请和角色分配',
      notSupported: '暂不支持该功能',
      notSupportedDesc: '您还未加入任何团队，请先加入企业',
      buttons: {
        addTeam: '新增团队',
        refresh: '刷新',
        viewMembers: '查看成员',
        edit: '编辑',
        inviteMember: '邀请成员',
        addMember: '添加成员',
        delete: '删除',
        cancel: '取消',
        confirm: '确定',
        close: '关闭',
        newUser: '新用户（注册）',
        oldUser: '老用户（登录）',
        editRole: '编辑角色',
        editAuth: '修改权限',
        allocate: '配额',
        remove: '移除'
      },
      table: {
        teamName: '团队名称',
        searchPlaceholder: '搜索团队名称',
        createTime: '创建时间',
        status: '状态',
        actions: '操作',
        normal: '正常',
        disabled: '禁用',
        noData: '暂无团队数据',
        userInfo: '用户信息',
        nickName: '昵称',
        phoneNumber: '手机号码',
        userAuth: '用户权限',
        userRole: '用户角色',
        remainingQuota: '剩余额度',
        usedQuota: '已用额度',
        joinTime: '加入时间',
        userName: '用户名',
        account: '用户账号',
        registerTime: '注册时间'
      },
      modals: {
        addTeam: '新增团队',
        editTeam: '编辑团队',
        teamName: '团队名称',
        teamNamePlaceholder: '请输入团队名称',
        teamRoles: '团队角色',
        teamRolesPlaceholder: '请输入团队角色，如:开发者、测试员、观察者',
        teamRolesHint: '（请输入团队角色，按回车或逗号添加，一个团队最多支持10个角色）',
        remark: '备注',
        remarkPlaceholder: '请输入团队备注',
        membersList: '团队成员列表',
        noRole: '暂无角色',
        selectInviteType: '选择邀请对象',
        inviteTypeDesc: '请选择要邀请新用户还是老用户加入团队',
        addMembers: '添加团队成员',
        searchUserPlaceholder: '搜索用户名或邮箱',
        selectedCount: '已选择 {count} 个成员',
        editMemberRole: '编辑成员角色',
        memberInfo: '成员信息',
        currentRole: '当前角色：',
        selectNewRole: '选择新角色',
        editMemberAuth: '修改成员权限',
        currentAuth: '当前权限：',
        selectNewAuth: '选择新权限',
        allocateQuota: '配额给团队成员',
        memberInfoTitle: '成员信息',
        currentBalance: '当前余额：',
        score: '积分：',
        memberLevel: '会员等级：',
        myBalance: '我的余额',
        quotaAmount: '配额金额（人民币）',
        quotaAmountPlaceholder: '请输入配额金额',
        quotaAmountHint: '配额金额不能超过您的剩余余额 ¥{amount}'
      },
      messages: {
        fetchTeamListFailed: '获取团队列表失败',
        enterTeamName: '请输入团队名称',
        setTeamRoles: '请设置团队角色',
        maxRolesLimit: '团队角色最多支持10个',
        updateTeamSuccess: '编辑团队成功',
        createTeamSuccess: '新增团队成功',
        deleteTeamConfirm: '确认删除',
        deleteTeamMessage: '确定要删除团队"{teamName}"吗？\n删除后将同时删除团队角色、团队成员、团队文件夹等所有相关数据，此操作不可恢复！',
        deleteTeamSuccess: '删除团队成功',
        deleteTeamFailed: '删除团队失败',
        inviteLinkCopied: '邀请链接已复制到剪贴板',
        inviteLinkTip: '邀请链接：{url}\n\n提示：如果受邀账号当前已登录，请先退出登录后使用邀请链接加入团队。',
        inviteLinkTipText: '提示：如果受邀账号当前已登录，请先退出登录后使用邀请链接加入团队。',
        selectMembers: '请选择要添加的成员',
        addMembersSuccess: '成功添加 {count} 个成员',
        addMembersFailed: '添加成员失败',
        updateRoleSuccess: '角色更新成功',
        updateRoleFailed: '角色更新失败',
        adminAuthDisabled: '管理员权限已下架，渠道拥有者默认为管理员',
        updateAuthSuccess: '权限更新成功',
        updateAuthFailed: '权限更新失败',
        enterValidQuota: '请输入有效的配额金额',
        quotaExceeded: '配额金额不能超过 ¥{amount}（已预留0.01元精度余量）',
        getUserIdFailed: '无法获取用户ID',
        allocateQuotaSuccess: '配额成功',
        allocateQuotaFailed: '配额失败',
        removeMemberConfirm: '确认移除',
        removeMemberMessage: '确认要移除成员"{userName}"吗？',
        removeMemberSuccess: '移除成员成功',
        removeMemberFailed: '移除成员失败',
        getChannelIdFailed: '获取渠道ID失败，请确认团队已关联渠道',
        fetchInviteUserListFailed: '获取邀请用户列表失败',
        noMemberData: '暂无成员数据',
        noUserData: '暂无用户数据',
        isMember: '已是成员'
      },
      authTypes: {
        member: '成员',
        leader: 'leader',
        admin: '管理员',
        unknown: '未知'
      },
      pagination: {
        totalRecords: '共 {total} 条记录',
        previous: '上一页',
        next: '下一页'
      },
      quota: {
        balance: '余额：',
        score: '积分：',
        level: '等级：',
        normalMember: '普通会员'
      }
    },
    components: {
      imageCrop: {
        title: '裁剪图片',
        ratio: '裁剪比例',
        reset: '重置',
        cancel: '取消',
        confirm: '确认裁剪',
        cropFailed: '裁剪失败',
        loadFailed: '图片加载失败',
      },
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
        showFilters: 'Tampilkan Filter',
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
      },
      compare: {
        button: 'Bandingkan Model',
        buttonShort: 'Bandingkan',
        title: 'Perbandingan Model',
        subtitle: 'Pilih hingga 3 model untuk analisis perbandingan',
        modelLabel: 'Model',
        searchPlaceholder: 'Cari dan pilih model...',
        noResults: 'Tidak ada model yang cocok ditemukan',
        selectAtLeastOne: 'Silakan pilih setidaknya satu model untuk dibandingkan',
        compareFields: {
          provider: 'Penyedia',
          inputPrice: 'Harga Input',
          outputPrice: 'Harga Output',
          contextLength: 'Panjang Konteks',
          billingType: 'Jenis Penagihan',
          tags: 'Tag',
          description: 'Deskripsi',
        },
        tableHeader: 'Item Perbandingan',
        selectedCount: 'Dipilih',
        clearSelection: 'Hapus Pilihan',
        finishCompare: 'Selesai Membandingkan',
        loading: 'Memuat plaza model...',
        noModels: 'Tidak ada data model tersedia',
        noMatchModels: 'Tidak ada model yang cocok ditemukan',
        billingTypes: {
          payPerUse: 'Bayar per Penggunaan',
          payPerCall: 'Bayar per Panggilan',
          payPerResource: 'Bayar per Sumber Daya',
          payPerSecond: 'Bayar per Detik',
          payPerMultimodal: 'Bayar per Multimodal',
          payPerImage: 'Bayar per Gambar',
          unknown: 'Tidak Diketahui',
        },
      },
      detail: {
        title: 'Detail Model',
        type: 'Jenis',
        pricing: 'Harga',
        priceDetails: 'Detail Harga',
        priceTable: 'Tabel Harga',
        audioOptions: 'Harga Opsi Audio',
        noAudio: 'Tanpa Audio:',
        withAudio: 'Dengan Audio:',
        resolutionTable: 'Tabel Harga Resolusi',
        singleSecondPrice: 'Harga Per Detik:',
        singleCallPrice: 'Harga Per Panggilan:',
        singleImagePrice: 'Harga Per Gambar:',
        input: 'Input:',
        output: 'Output:',
        cachePrice: 'Harga Cache',
        cacheWrite: 'Tulis Cache:',
        cacheRead: 'Baca Cache:',
        modelDescription: 'Deskripsi Model',
        capabilityTags: 'Tag Kemampuan',
        useForChat: 'Gunakan model ini untuk chat',
        useForImage: 'Gunakan model ini untuk pembuatan gambar',
        useForVideo: 'Gunakan model ini untuk pembuatan video',
        noDescription: 'Tidak ada deskripsi tersedia',
        exampleCost: 'Contoh Biaya Gambar Tunggal (Teks ke Gambar)',
        imageEditCost: 'Contoh Biaya Gambar Tunggal (Gambar ke Gambar)',
        tokenTable: 'Tabel Konsumsi Token',
        quality: 'Kualitas',
        tokenConsumption: 'Tabel Konsumsi Token',
      },
      pagination: {
        total: 'Total',
        page: 'Halaman',
        perPage: '/ halaman',
      },
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
        modelsIntro: 'Pengantar',
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
        talkingPhoto: 'Video yang dibuat dari gambar',
        talkingPhotoDesc: 'Berdasarkan gambar, buat video dinamis dengan satu klik, dengan mudah menciptakan konten pemasaran ala selebriti internet yang sudah memiliki sifat viral.'
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
        progressStatusShort: 'Membuat',
        messages: {
          requestFailed: 'Permintaan gagal, silakan coba lagi nanti'
        }
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
          awaitWorking: 'Mulai membuat',
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
        title: 'AI Tukar Wajah Gambar',
        subtitle: 'Unggah gambar utama dan gambar referensi, biarkan AI menghasilkan gambar tukar wajah untuk Anda',
        primaryLabel: 'Unggah Gambar Utama',
        primaryDescription: 'Unggah gambar utama untuk tukar wajah',
        referenceLabel: 'Unggah Gambar Referensi',
        referenceDescription: 'Unggah gambar referensi yang menyediakan wajah',
        promptLabel: 'Prompt',
        promptPlaceholder: 'Silakan masukkan prompt tukar wajah...',
        promptDefault: 'Ganti wajah karakter dalam gambar referensi ke wajah karakter dalam gambar utama, pertahankan gaya rambut, pose, dan pencahayaan gambar utama, hanya ganti fitur wajah dan warna kulit, untuk membuat gambar yang disintesis terlihat alami tanpa bekas jahitan yang jelas, sambil mempertahankan ekspresi wajah dan detail karakter dalam gambar referensi',
        generate: 'Hasilkan',
        generating: 'Menghasilkan...',
        generateButton: '0.3 Hasilkan Gambar Tukar Wajah',
        resultTitle: 'Hasil Pembuatan',
        emptyState: 'Gambar yang dihasilkan akan ditampilkan di sini',
        generatingMessage: 'Sedang menghasilkan gambar tukar wajah...',
        tabs: {
          result: 'Hasil',
          sideBySide: 'Bersebelahan',
          slider: 'Slider'
        },
        labels: {
          original: 'Asli',
          result: 'Hasil',
          preview: 'Pratinjau',
          download: 'Unduh',
          addToMaterials: 'Tambahkan ke Perpustakaan Materi'
        },
        errors: {
          uploadPrimaryImage: 'Silakan unggah gambar utama',
          uploadReferenceImage: 'Silakan unggah gambar referensi',
          enterPrompt: 'Silakan masukkan prompt',
          generateFailed: 'Pembuatan gagal, silakan coba lagi',
          useImageFailed: 'Gagal menggunakan gambar sebagai input'
        }
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
        },
        voiceSelectModal: {
          title: 'Pilih Suara',
          labels: {
            scenario: 'Skenario',
            age: 'Usia',
            gender: 'Jenis Kelamin',
            supportedLanguages: 'Bahasa yang Didukung'
          },
          scenarios: {
            all: 'Semua Skenario',
            customerService: 'Layanan Pelanggan',
            consumerElectronics: 'Elektronik Konsumen',
            audiobook: 'Buku Audio',
            shortVideo: 'Pengisi Suara Video Pendek',
            companionChat: 'Obrolan Pendamping',
            voiceAssistant: 'Asisten Suara',
            ecommerceLive: 'Live E-commerce'
          },
          ages: {
            all: 'Semua Usia',
            child: 'Anak-anak',
            youth: 'Pemuda',
            middle: 'Paruh Baya',
            elderly: 'Lansia'
          },
          genders: {
            all: 'Semua Jenis Kelamin',
            male: 'Pria',
            female: 'Wanita',
            neutral: 'Netral'
          },
          languages: {
            all: 'Semua Bahasa',
            chinese: 'Cina',
            english: 'Inggris',
            french: 'Prancis',
            german: 'Jerman',
            russian: 'Rusia',
            italian: 'Italia',
            spanish: 'Spanyol',
            portuguese: 'Portugis',
            japanese: 'Jepang',
            korean: 'Korea',
            other: 'Lainnya',
            chineseDialects: 'Dialek Cina',
            otherLanguages: 'Bahasa Lainnya'
          },
          buttons: {
            cancel: 'Batal',
            confirm: 'Konfirmasi'
          },
          noResults: 'Tidak ada suara yang cocok ditemukan'
        }
      },
      threeDModelPage: {
        title: 'Model 3D',
        description: 'Ubah foto Anda menjadi render 3D',
        uploadImage: 'Klik atau seret untuk mengunggah gambar',
        generate: 'Hasilkan Model 3D',
        generating: 'Menghasilkan...',
        resultTitle: 'Hasil',
        emptyState: 'Hasil yang dihasilkan akan ditampilkan di sini',
        loadingMessages: {
          uploading: 'Mengunggah gambar...',
          generating: 'Menghasilkan model 3D...',
          waiting: 'Menunggu pembuatan selesai...',
          downloading: 'Mengunduh file...',
          parsing: 'Mengurai file model...',
          default: 'Menghasilkan...'
        },
        loadingHint: 'Harap tunggu',
        errors: {
          uploadImage: 'Silakan unggah gambar',
          imageUploadFailed: 'Pengunggahan gambar gagal',
          createTaskFailed: 'Pembuatan tugas gagal',
          downloadFailed: 'Pengunduhan gagal: URL sumber tidak ada',
          getDownloadUrlFailed: 'Gagal mendapatkan tautan unduhan: Tidak ada bidang url dalam data yang dikembalikan',
          parseGlbFailed: 'Gagal mengurai file GLB',
          taskFailed: 'Tugas 3D gagal',
          generateFailed: 'Gagal menghasilkan efek 3D',
          downloadError: 'Pengunduhan gagal',
          noGlbFile: 'Tidak ada file .glb di arsip',
          testFailed: 'Tes gagal'
        },
        testResult: {
          success: '✅ Tes berhasil! File GLB diekstrak dan dimuat.',
          failure: '❌ Tes gagal'
        }
      },
      useToolPage: {
        promptPlaceholder: 'Jelaskan efek yang Anda inginkan, misalnya: Seekor singa megah mengaum di atas batu saat matahari terbenam...',
        primaryImageLabel: 'Gambar Utama',
        referenceImageLabel: 'Gambar Referensi',
        optional: ' (Opsional)',
        uploadHint: 'Klik atau seret untuk mengunggah gambar',
        clearImage: 'Hapus Gambar',
        drawMask: 'Gambar Mask',
        exitMaskEdit: 'Keluar dari Edit Mask',
        brushSize: 'Ukuran Kuas',
        undo: 'Batal',
        clearMask: 'Hapus Mask',
        generating: 'Menghasilkan...',
        generateButton: '0.3 Hasilkan Efek',
        generatingMagic: 'Sedang melakukan keajaiban...',
        resultPlaceholder: 'Hasil yang dihasilkan akan ditampilkan di sini',
        errors: {
          uploadPrimaryImage: 'Silakan unggah gambar utama',
          enterPrompt: 'Silakan masukkan prompt',
          uploadReferenceImage: 'Silakan unggah gambar referensi',
          generateFailed: 'Pembuatan gagal, silakan coba lagi',
          useImageFailed: 'Gagal menggunakan gambar sebagai input'
        }
      },
      addMaterialModal: {
        editFolder: 'Edit Folder',
        editMaterial: 'Edit Materi',
        newFolder: 'Folder Baru',
        addMaterial: 'Tambah Materi',
        assetType: 'Jenis Materi',
        loading: 'Memuat...',
        noAssetType: 'Tidak ada jenis materi yang dipilih',
        noAssetTypes: 'Tidak ada jenis materi tersedia',
        uploadFile: 'Unggah File',
        clickOrDragToUpload: 'Klik atau seret file ke sini untuk mengunggah',
        releaseToUpload: 'Lepaskan untuk mengunggah file',
        supportedFormats: 'Mendukung',
        uploading: 'Mengunggah...',
        confirmUpload: 'Konfirmasi Unggah',
        audioFile: 'File Audio',
        folderName: 'Nama Folder',
        materialName: 'Nama Materi',
        enterFolderName: 'Masukkan nama folder',
        enterMaterialName: 'Masukkan nama materi',
        folderTag: 'Tag Folder',
        materialTag: 'Tag Materi',
        materialTagPlaceholder: 'Tag materi, pisahkan beberapa tag dengan koma',
        materialTagFormat: 'Format tag materi: tag1,tag2, dipisahkan dengan koma bahasa Inggris!',
        folderDescription: 'Deskripsi Folder',
        materialDescription: 'Deskripsi Materi',
        enterFolderDescription: 'Masukkan deskripsi folder',
        enterMaterialDescription: 'Masukkan deskripsi materi',
        privateModel: 'Model Pribadi (Hanya terlihat oleh saya)',
        storageLocation: 'Lokasi Penyimpanan',
        personalFiles: 'File Pribadi',
        sharedFiles: 'File Bersama',
        both: 'Keduanya',
        personalFolder: 'Folder Pribadi',
        storageFolder: 'Folder Penyimpanan',
        selectFolder: 'Pilih Folder',
        rootDirectory: 'Direktori Root',
        selectTeam: 'Pilih Tim',
        sharedFolder: 'Folder Bersama',
        sharedFolderCannotBeRoot: 'File bersama harus berada di folder, tidak dapat disimpan ke direktori root',
        cancel: 'Batal',
        confirm: 'Konfirmasi',
        selectSharedFolder: 'Pilih Folder Bersama',
        selectPersonalFolder: 'Pilih Folder Pribadi',
        selectedFolder: 'Folder Terpilih',
        messages: {
          selectTeamFirst: 'Silakan pilih tim terlebih dahulu',
          sharedFolderRequired: 'File bersama harus berada di folder, tidak dapat disimpan ke direktori root',
          enterName: 'Silakan masukkan nama',
          uploadFileOrLink: 'Silakan unggah file materi atau pastikan tautan materi ada',
          selectTeam: 'Silakan pilih tim',
          selectSharedFolder: 'Silakan pilih folder bersama (tidak dapat menyimpan ke direktori root)',
          uploadingFile: 'Mengunggah file...',
          uploadingMaterial: 'Mengunggah materi...',
        },
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
      fetchError: 'Gagal memuat data peringkat',
      metrics: {
        intelligence: 'Kecerdasan',
        coding: 'Pemrograman',
        math: 'Matematika',
        speed: 'Kecepatan'
      },
      best: 'Terbaik',
      allModels: 'Semua Model',
      bestIndicator: '(Mahkota menunjukkan yang terbaik dalam metrik ini)',
      showMore: 'Tampilkan Lebih Banyak',
      collapse: 'Tutup',
      top10: 'TOP 10'
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
      inputPlaceholders: {
        chat: 'Masukkan pertanyaan Anda... (Enter untuk mengirim, Shift+Enter untuk baris baru)',
        image: 'Jelaskan gambar yang ingin Anda hasilkan',
        video: 'Jelaskan video yang ingin Anda hasilkan, atau unggah gambar referensi...'
      },
      inputHints: {
        send: 'Kirim',
        newline: 'Baris baru',
        supportedFormats: 'Format yang didukung',
        maxSize: 'Maks'
      },
      send: 'Kirim',
      welcomeMessage: 'Hai! Saya adalah asisten AI Anda. Bagaimana saya bisa membantu Anda hari ini?',
      footerTip: 'Penafian: Konten dihasilkan oleh AI. Akurasi tidak dijamin.',
      functionMode: {
        title: 'Mode Fungsi',
        chat: 'Obrolan',
        image: 'Gambar',
        video: 'Video'
      },
      aiCreatingImage: 'AI sedang membuat gambar indah untuk Anda...',
      modelNotSupportImageUpload: 'Model ini tidak mendukung unggah gambar, silakan ganti model',
      deleteConfirm: {
        title: 'Konfirmasi Penghapusan',
        message: 'Apakah Anda yakin ingin menghapus catatan obrolan ini?',
        confirmText: 'Konfirmasi',
        cancelText: 'Batal'
      },
      toasts: {
        switchToVideoMode: 'Beralih ke mode video, gambar dimuat otomatis',
        uploadingVideoToOSS: 'Mengunggah video ke OSS...',
        videoUploadSuccess: 'Video berhasil diunggah',
        videoUploadFailed: 'Pengunggahan video ke OSS gagal',
        imageUploadFailed: 'Pengunggahan gambar ke OSS gagal',
        importMaterialFailed: 'Gagal mengimpor materi, silakan coba lagi',
        noMessagesToSave: 'Tidak ada pesan untuk disimpan',
        savingAndProcessing: 'Menyimpan dan memproses gambar/video...',
        recordUpdated: 'Catatan obrolan diperbarui',
        recordSaved: 'Catatan obrolan disimpan',
        saveRecordFailed: 'Gagal menyimpan catatan obrolan',
        recordDeleted: 'Catatan obrolan dihapus',
        deleteRecordFailed: 'Gagal menghapus catatan obrolan',
        linkCopied: 'Tautan disalin',
        materialImported: 'Materi berhasil diimpor'
      },
      aiRoleDefinition: {
        title: 'Definisikan Peran Asisten AI',
        description: 'Silakan definisikan peran dan karakteristik asisten AI, ini akan mempengaruhi gaya balasan dan perilaku AI.',
        label: 'Definisi Peran AI:',
        placeholder: 'Misalnya: Anda adalah ahli pemrograman yang sangat baik, mahir dalam Python, JavaScript dan bahasa pemrograman lainnya, mampu membantu pengguna menyelesaikan berbagai masalah pemrograman...',
        hint: 'Petunjuk:',
        tips: [
          'Anda dapat mendefinisikan bidang profesional AI (misalnya, pemrograman, desain, penulisan, dll.)',
          'Anda dapat mengatur karakteristik kepribadian AI (misalnya, ramah, profesional, humoris, dll.)',
          'Anda dapat menentukan gaya balasan AI (misalnya, ringkas, detail, kreatif, dll.)'
        ],
        cancel: 'Batal',
        confirm: 'Konfirmasi',
        roleLabel: 'Definisi Peran AI',
        editRole: 'Edit Peran AI',
        defaultContent: 'Anda adalah ahli asisten AI yang sangat baik, dengan pengetahuan dan pengalaman yang kaya, mampu membantu pengguna menyelesaikan berbagai masalah.',
        inputRequired: 'Silakan masukkan definisi peran AI',
        updateSuccess: 'Definisi peran AI diperbarui'
      },
      imageValidation: {
        sora2Requirements: 'Dimensi gambar harus persis sesuai dengan dimensi keluaran',
        sora2CropTitle: 'Pangkas gambar agar sesuai dengan persyaratan sora-2',
        sora2CropCancel: 'Anda membatalkan pemangkasan',
        doubaoRequirements: 'Persyaratan rasio aspek gambar tidak terpenuhi',
        doubaoRatioHint: 'Harap gunakan gambar dengan rasio aspek antara 1/3 dan 3',
        minResolution: 'Resolusi gambar terlalu rendah: lebar dan tinggi minimal harus {0} piksel',
        maxResolution: 'Resolusi gambar terlalu tinggi: lebar dan tinggi tidak boleh melebihi {0} piksel',
        loadFailed: 'Gagal memuat gambar, periksa apakah file rusak',
        formatNotSupported: 'Format gambar tidak didukung. Format yang didukung: ',
        sizeExceeded: 'Ukuran file melebihi batas. Maksimal diizinkan: ',
        readFailed: 'Gagal membaca file',
      }
    },
    keysPage: {
      title: 'Manajemen Kunci API',
      subtitle: 'Kelola kunci API Anda untuk mengakses layanan',
      refresh: 'Segarkan',
      createButton: 'Kunci API Baru',
      tableHeaders: {
        name: 'Nama',
        apiKey: 'API Key',
        status: 'Status',
        quotaUsage: 'Penggunaan Kuota',
        expirationTime: 'Waktu Kedaluwarsa',
        operations: 'Operasi'
      },
      labels: {
        limit: 'Batas Total',
        remaining: 'Tersisa',
        used: 'Digunakan',
        expires: 'Kedaluwarsa',
        status: 'Status'
      },
      values: {
        unlimited: 'Tidak Terbatas',
        never: 'Tidak Pernah Kedaluwarsa',
        expired: 'Kedaluwarsa'
      },
      actions: {
        disable: 'Nonaktifkan',
        enable: 'Aktifkan',
        delete: 'Hapus',
        edit: 'Edit',
        showKey: 'Tampilkan Kunci',
        hideKey: 'Sembunyikan Kunci',
        copyKey: 'Salin Kunci'
      },
      status: {
        active: 'Aktif',
        disabled: 'Dinonaktifkan'
      },
      loading: 'Memuat...',
      emptyState: {
        title: 'Tidak Ada Token',
        message: 'Klik tombol "Kunci API Baru" di atas untuk membuat token pertama Anda'
      },
      totalRecords: 'Total {count} catatan',
      confirmDelete: {
        title: 'Konfirmasi Hapus',
        message: 'Apakah Anda yakin ingin menghapus token "{name}"?'
      },
      messages: {
        copySuccess: 'Kunci disalin',
        copyFailed: 'Gagal menyalin'
      },
      form: {
        title: 'Kunci API Baru',
        name: 'Nama',
        namePlaceholder: 'Silakan masukkan nama token',
        nameRequired: 'Silakan masukkan nama token',
        enableModelLimits: 'Aktifkan Pembatasan Model',
        modelLimits: 'Pembatasan Model',
        searchModel: 'Cari model...',
        unlimitedQuota: 'Kuota Tidak Terbatas',
        totalQuota: 'Total Kuota (RMB)',
        totalQuotaPlaceholder: 'Silakan masukkan kuota RMB',
        totalQuotaRequired: 'Silakan masukkan total kuota (harus lebih besar dari 0)',
        usedQuota: 'Kuota yang Digunakan',
        remainingQuota: 'Kuota Tersisa',
        expirationTime: 'Waktu Kedaluwarsa',
        apiKey: 'Kunci API',
        yes: 'Ya',
        no: 'Tidak',
        quickExpire: {
          never: 'Tidak Pernah Kedaluwarsa',
          oneHour: '1 Jam',
          oneDay: '1 Hari',
          oneMonth: '1 Bulan'
        },
        buttons: {
          save: 'Simpan',
          saving: 'Menyimpan...',
          close: 'Tutup'
        },
        errors: {
          nameRequired: 'Silakan masukkan nama token',
          quotaRequired: 'Silakan masukkan total kuota (harus lebih besar dari 0)'
        }
      }
    },
    expensesPage: {
      title: 'Pusat Kredit/Saldo',
      subtitle: 'Lihat dan kelola saldo kredit Anda, pahami penggunaan kredit',
      balanceLabel: 'Saldo Tersedia (CNY)',
      convertPoints: 'Poin yang Dapat Dikonversi:',
      memberLevel: 'Level Anggota:',
      quickActions: 'Tindakan Cepat',
      buttons: {
        points: 'Poin',
        balance: 'Saldo',
        logs: 'Log/Tagihan',
        refresh: 'Segarkan Saldo',
        refreshPoints: 'Segarkan Poin',
        refreshLogs: 'Segarkan Log',
      },
      recordsTitle: 'Catatan Penggunaan',
      refreshData: 'Sinkronisasi data mungkin tertunda',
      export: 'Ekspor',
      exportBill: 'Ekspor Tagihan',
      totalRecords: 'Total {count} catatan',
      timeRange: 'Rentang Waktu:',
      to: 'hingga',
      query: 'Kueri',
      search: 'Cari',
      reset: 'Reset',
      loading: 'Memuat...',
      noData: 'Tidak Ada Data',
      noRecords: 'Tidak Ada Catatan',
      noUsageRecords: 'Tidak ada catatan penggunaan',
      noPointsRecords: 'Tidak ada catatan poin',
      viewDetails: 'Lihat Detail',
      collapseDetails: 'Tutup Detail',
      date: 'Tanggal',
      times: 'Kali',
      token: 'Token',
      consumption: 'Konsumsi',
      recharge: 'Isi Ulang',
      netAmount: 'Jumlah Bersih',
      total: 'Total',
      consumedPoints: 'Poin yang Dikonsumsi',
      points: 'Poin',
      pointsBill: 'Tagihan Poin',
      exportHeaders: {
        time: 'Waktu',
        serviceType: 'Jenis Layanan',
        points: 'Poin',
        status: 'Status',
        taskId: 'ID Tugas',
      },
      balanceExportHeaders: {
        time: 'Waktu',
        serviceModel: 'Layanan/Model',
        type: 'Jenis',
        cost: 'Biaya(Rp)',
        duration: 'Durasi',
        inputToken: 'Token Input',
        outputToken: 'Token Output',
      },
      balanceBill: 'Tagihan Saldo',
      record: {
        type: 'Jenis',
        duration: 'Durasi',
        input: 'Token Input',
        output: 'Token Output',
        consumption: 'Konsumsi',
        recharge: 'Isi Ulang',
      },
      status: {
        paid: 'Telah Dikurangi',
        unpaid: 'Belum Dikurangi',
        failed: 'Gagal',
        unknown: 'Tidak Diketahui'
      },
      teamLogs: {
        title: 'Log/Tagihan',
        team: 'Tim',
        member: 'Anggota',
        expenseType: 'Jenis Biaya',
        time: 'Waktu',
        pleaseSelect: 'Silakan Pilih',
        teamName: 'Nama Tim',
        userName: 'Nama Pengguna',
        tokenName: 'Kreasi/Token',
        modelName: 'Fungsi/Model',
        cost: 'Biaya(¥)',
        expenseTypeLabel: 'Jenis Biaya',
        createdAt: 'Waktu',
        promptTokens: 'Input(Tokens)',
        completionTokens: 'Selesai(Tokens)',
        addRecharge: '+ Isi Ulang',
        addConsumption: '+ Konsumsi',
        firstPage: 'Halaman Pertama',
        prevPage: 'Halaman Sebelumnya',
        nextPage: 'Halaman Berikutnya',
        lastPage: 'Halaman Terakhir',
        recordsPerPage: 'catatan/halaman',
        logsBill: 'Tagihan Log',
      },
      exportError: 'Ekspor gagal, silakan coba lagi nanti',
      exportSuccess: 'Ekspor berhasil',
      selectTeamFirst: 'Silakan pilih tim terlebih dahulu',
      unknownService: 'Layanan Tidak Diketahui',
      serviceTypes: {
        1: 'Pencampuran Video AI',
        2: 'Manusia Digital Produk',
        3: 'Video Manusia Digital',
        4: 'Gambar ke Video',
        5: 'Video Orisinil',
        6: 'Transfer Gaya',
        7: 'Pembuatan Gambar AI',
        8: 'Kloning Suara',
        9: 'Manusia Digital Kustom',
        10: 'Manusia Digital Bernyanyi',
        11: 'Tukar Wajah Video AI',
        15: 'Workshop Kreatif',
      },
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
          '100+ API Model Besar',
          '500+ Template Manusia Digital',
          'Foto Berbicara hingga 180d',
          'Tanpa Watermark',
          'Harga kredit ¥1.72/kredit'
        ],
        modelFeatures: [
          '100+ API Model Besar',
          'Saluran Standar'
        ],
        createFeatures: [
          'Harga kredit ¥1.72/kredit',
          'Akses semua fitur Pusat Kreasi'
        ]
      },
      business: {
        title: 'Business',
        features: [
          '100+ API Model Besar (Prioritas)',
          '500+ Template Manusia Digital',
          'Foto Berbicara hingga 1800d',
          'Tanpa Watermark · Rendering Prioritas',
          'Harga kredit ¥1.59/kredit'
        ],
        modelFeatures: [
          '100+ API Model Besar',
          'Saluran Prioritas'
        ],
        createFeatures: [
          'Harga kredit ¥1.59/kredit',
          'Akses semua fitur Pusat Kreasi'
        ]
      },
      enterprise: {
        title: 'Enterprise',
        slogan: "Mari berbicara!",
        features: [
          'Manajemen Akun Perusahaan Kustom',
          'Manajemen Saluran Kustom',
          'Tingkat Konversi Kredit Lebih Rendah',
          'Pengembangan Fitur AI Kustom'
        ]
      },
      labels: {
        credits: 'Kredit Tersedia:',
        quantity: 'Jumlah Pembelian',
        custom: 'Kustom',
        buy: 'Beli Sekarang',
        contact: 'Hubungi Kami',
        times: 'x'
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
        invoiceInfo: 'Informasi Faktur',
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
        dataAnalysis: '📊 Analisis Data',
        form: {
          title: 'Tinggalkan Informasi Anda',
          description: 'Konsultan kami akan segera menghubungi Anda',
          name: 'Nama',
          namePlaceholder: 'Masukkan nama Anda',
          email: 'Email',
          emailPlaceholder: 'Masukkan email Anda (opsional)',
          phone: 'Telepon',
          phonePlaceholder: 'Masukkan nomor telepon Anda',
          company: 'Perusahaan',
          companyPlaceholder: 'Masukkan nama perusahaan Anda (opsional)',
          channel: 'Bagaimana Anda menemukan kami',
          channelPlaceholder: 'Pilih bagaimana Anda menemukan kami',
          channels: {
            wechat: 'WeChat',
            xiaohongshu: 'Xiaohongshu',
            gongzhonghao: 'Akun Resmi WeChat',
            douyin: 'Douyin/TikTok',
            weibo: 'Weibo',
            search: 'Mesin Pencari',
            friend: 'Referensi Teman',
            other: 'Lainnya'
          },
          message: 'Pesan',
          messagePlaceholder: 'Jelaskan kebutuhan Anda (opsional)',
          submit: 'Kirim Sekarang',
          submitting: 'Mengirim...',
          submitSuccess: 'Berhasil dikirim, kami akan segera menghubungi Anda!',
          submitError: 'Pengiriman gagal, silakan coba lagi nanti',
          successTitle: 'Berhasil Dikirim!',
          successMessage: 'Terima kasih atas pertanyaan Anda, konsultan profesional kami akan menghubungi Anda dalam 1-2 hari kerja.',
          submitAnother: 'Kirim Lagi',
          errors: {
            nameRequired: 'Masukkan nama Anda',
            phoneRequired: 'Masukkan nomor telepon Anda',
            phoneInvalid: 'Masukkan nomor telepon yang valid',
            emailInvalid: 'Masukkan alamat email yang valid',
            channelRequired: 'Pilih bagaimana Anda menemukan kami'
          }
        }
      },
      errors: {
        loginRequired: 'Silakan login terlebih dahulu',
        invalidAmount: 'Silakan masukkan jumlah yang valid ({currency})',
        minAmountRequired: 'Versi {productName} jumlah minimum adalah {amount}{currency}',
        invoiceOnlyWechat: 'Hanya WeChat Pay yang mendukung faktur, silakan pilih WeChat Pay',
        invoiceAutoDisabled: 'Hanya WeChat Pay yang mendukung faktur, pemilihan faktur telah dinonaktifkan secara otomatis',
        invoiceFormNotInitialized: 'Formulir faktur tidak diinisialisasi, silakan refresh halaman dan coba lagi',
        invoiceInfoRequired: 'Silakan isi informasi faktur terlebih dahulu',
        invoiceInfoSaved: 'Informasi faktur disimpan'
      },
      invoiceFields: {
        name: 'Nama:',
        taxNumber: 'Nomor Pajak:',
        email: 'Email:',
        companyAddress: 'Alamat Perusahaan:',
        companyPhone: 'Nomor Telepon:',
        openingBank: 'Bank Pembuka:',
        bankAccount: 'Akun Bank:'
      },
      paymentOptions: {
        alipay: 'Alipay',
        alipayHK: 'AlipayHK',
        billEase: 'BillEase',
        boost: 'Boost',
        bpi: 'BPI',
        gcash: 'GCash',
        kredivo: 'Kredivo',
        linePay: 'Rabbit LINE Pay',
        touchNGo: "Touch'n Go eWallet"
      },
      invoiceForm: {
        title: 'Isi Informasi Header Faktur',
        fillInvoiceInfo: 'Isi Informasi Faktur',
        invoiceName: 'Nama Header Faktur',
        taxNumber: 'Nomor Identifikasi Wajib Pajak',
        email: 'Email',
        companyAddress: 'Alamat Perusahaan',
        companyPhone: 'Telepon Perusahaan',
        openingBank: 'Bank Pembuka',
        bankAccount: 'Akun Bank',
        placeholders: {
          invoiceName: 'Silakan masukkan nama header faktur',
          taxNumber: 'Silakan masukkan nomor identifikasi wajib pajak',
          email: 'Silakan masukkan email',
          companyAddress: 'Silakan masukkan alamat perusahaan',
          companyPhone: 'Silakan masukkan telepon perusahaan',
          openingBank: 'Silakan masukkan bank pembuka',
          bankAccount: 'Silakan masukkan akun bank'
        },
        errors: {
          invoiceNameRequired: 'Silakan masukkan nama header faktur',
          taxNumberRequired: 'Silakan masukkan nomor identifikasi wajib pajak',
          emailRequired: 'Silakan masukkan email',
          emailInvalid: 'Silakan masukkan alamat email yang valid',
          emailMissingAt: "Harap sertakan '@' dalam alamat email. '@' tidak ada di '{email}'"
        },
        cancel: 'Batal',
        confirm: 'Konfirmasi'
      },
      quantity: {
        times: 'kali'
      },
      currency: {
        yuan: 'CNY',
        dollar: 'USD'
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
      personalFiles: 'File Pribadi',
      sharedFiles: 'File Bersama',
      confirmDelete: 'Konfirmasi Hapus',
      confirmDeleteItem: 'Apakah Anda yakin ingin menghapus {type} ini?',
      confirmDeleteSelected: 'Apakah Anda yakin ingin menghapus {count} {item} yang dipilih?',
      confirm: 'Konfirmasi',
      cancel: 'Batal',
      folder: 'folder',
      material: 'materi',
      moveModal: {
        title: 'Pindahkan ke',
        personalFolder: 'Folder Pribadi',
        sharedFolder: 'Folder Bersama',
        allFiles: 'Semua File',
        loading: 'Memuat...',
        newFolder: 'Folder Baru',
        newFolderPlaceholder: 'Folder Baru',
        unnamedFolder: 'Folder Tanpa Nama',
        noFolders: 'Tidak ada folder di direktori ini',
        enterTeamFolderFirst: 'Silakan masuk ke folder tim terlebih dahulu sebelum melakukan operasi',
        enterTeamFolderBeforeSave: 'Silakan masuk ke folder tim terlebih dahulu sebelum menyimpan',
        fileAlreadyInCurrentFolder: 'File sudah ada di folder saat ini, silakan pilih folder lain',
        moveToHere: 'Pindahkan ke sini',
        cancel: 'Batal',
        fetchFoldersFailed: 'Gagal mendapatkan daftar folder',
        enterFolderName: 'Silakan masukkan nama folder',
        folderCreatedSuccess: 'Folder berhasil dibuat',
        folderCreateFailed: 'Gagal membuat folder',
      },
      messages: {
        deleteSuccess: 'Berhasil dihapus',
        deleteFailed: 'Gagal menghapus',
        shareSuccess: 'Berhasil dibagikan',
        shareFailedNoTeam: 'Tidak dapat mendapatkan informasi tim, berbagi gagal',
        moveSuccess: 'Berhasil dipindahkan',
        moveFailed: 'Gagal memindahkan',
        operationFailed: 'Operasi gagal',
        sharedFilesCannotDragToRoot: 'File bersama tidak dapat diseret ke direktori root',
        assetUrlOrNameMissing: 'URL atau nama aset tidak ada',
      },
    },
    profilePage: {
      title: 'Pusat Pribadi',
      subtitle: 'Kelola informasi akun dan pengaturan keamanan Anda',
      tabs: {
        basic: 'Pengaturan Dasar',
        security: 'Pengaturan Keamanan',
        enterprise: 'Manajemen Perusahaan',
        invite: 'Catatan Undangan'
      },
      basicInfo: 'Informasi Dasar',
      accountSecurity: 'Keamanan Akun',
      avatar: 'Avatar',
      uploadAvatar: 'Ubah Avatar',
      labels: {
        accountName: 'Nama Akun',
        nickname: 'Nama Panggilan',
        nicknameRequired: 'Nama Panggilan Akun',
        phone: 'Nomor Telepon',
        email: 'Email',
        gender: 'Jenis Kelamin',
        createTime: 'Waktu Pendaftaran',
        role: 'Peran',
        dept: 'Departemen',
        password: 'Kata Sandi',
        oldPassword: 'Kata Sandi Lama',
        newPassword: 'Kata Sandi Baru',
        confirmPassword: 'Konfirmasi Kata Sandi',
        notBound: 'Tidak Terikat'
      },
      placeholders: {
        accountName: 'Masukkan nama akun (2-30 karakter, harus dimulai dengan non-digit)',
        nickname: 'Masukkan nama panggilan Anda',
        phone: 'Masukkan nomor telepon',
        email: 'Masukkan email',
        oldPassword: 'Masukkan kata sandi lama',
        newPassword: 'Masukkan kata sandi baru (minimal 6 karakter)',
        confirmPassword: 'Masukkan kata sandi baru lagi'
      },
      gender: {
        male: 'Pria',
        female: 'Wanita',
        unknown: 'Tidak Diketahui'
      },
      buttons: {
        save: 'Simpan',
        cancel: 'Batal',
        edit: 'Edit',
        reset: 'Reset',
        changePassword: 'Ubah Kata Sandi',
        retry: 'Coba Lagi'
      },
      messages: {
        loadFailed: 'Gagal memuat informasi pribadi',
        updateSuccess: 'Informasi berhasil diperbarui',
        updateFailed: 'Gagal memperbarui informasi',
        passwordChangeSuccess: 'Kata sandi berhasil diubah',
        passwordChangeFailed: 'Gagal mengubah kata sandi, harap periksa apakah kata sandi lama benar',
        allFieldsRequired: 'Harap isi semua field kata sandi',
        passwordMinLength: 'Kata sandi baru minimal 6 karakter',
        passwordMismatch: 'Dua kata sandi baru tidak cocok',
        passwordSame: 'Kata sandi baru tidak boleh sama dengan kata sandi lama',
        emailInvalid: 'Harap masukkan format email yang valid',
        phoneInvalid: 'Harap masukkan nomor telepon yang valid (6-15 digit)',
        accountNameLength: 'Nama akun harus antara 2-30 karakter',
        accountNameStart: 'Nama akun harus dimulai dengan non-digit',
        accountNameFormat: 'Nama akun hanya boleh berisi karakter Cina, huruf, angka, atau garis bawah',
        inviteCodeCopied: 'Kode undangan disalin',
        inviteLinkCopied: 'Tautan undangan disalin',
        copyFailed: 'Gagal menyalin'
      },
      enterprise: {
        management: 'Manajemen Perusahaan',
        teamManagement: 'Manajemen Tim',
        channelInfo: 'Informasi Perusahaan',
        channelName: 'Nama Perusahaan',
        shareAssets: 'Bagikan Aset',
        yes: 'Ya',
        no: 'Tidak',
        createTime: 'Waktu Pembuatan',
        updateTime: 'Waktu Pembaruan',
        edit: 'Edit',
        addRelation: 'Tambahkan Relasi Perusahaan Pengguna',
        noChannelInfo: 'Tidak ada informasi perusahaan',
        notSupported: 'Fitur Tidak Didukung',
        contactAdmin: 'Harap hubungi administrator untuk mengaktifkan izin perusahaan',
        enterChannelName: 'Harap masukkan nama perusahaan',
        selectShareAssets: 'Harap pilih apakah akan berbagi aset',
        editRelation: 'Edit Relasi Perusahaan Pengguna',
        addRelationTitle: 'Tambahkan Relasi Perusahaan Pengguna',
        cancel: 'Batal',
        confirm: 'Konfirmasi',
        enterChannelNameRequired: 'Harap masukkan nama perusahaan',
        selectShareAssetsRequired: 'Harap pilih apakah akan berbagi aset',
        getChannelInfoFailed: 'Gagal mendapatkan informasi perusahaan',
        editSuccess: 'Informasi perusahaan berhasil diedit',
        editFailed: 'Gagal mengedit informasi perusahaan',
        addSuccess: 'Berhasil ditambahkan',
        addFailed: 'Gagal menambahkan',
        operationFailed: 'Operasi gagal',
        noChannelId: 'Tidak dapat mendapatkan ID perusahaan, harap konfirmasi Anda memiliki izin perusahaan',
        missingChannelId: 'ID perusahaan hilang, tidak dapat mengedit'
      },
      invite: {
        title: 'Catatan Undangan',
        subtitle: 'Lihat catatan pengguna yang terdaftar melalui kode undangan Anda',
        inviteCode: 'Kode Undangan',
        inviteLink: 'Tautan Undangan',
        copyLink: 'Salin Tautan',
        copied: 'Disalin',
        noRecords: 'Tidak ada catatan undangan',
        tableHeaders: {
          inviteCode: 'Kode Undangan',
          invitedUser: 'Akun Pengguna yang Diundang',
          registerTime: 'Waktu Pendaftaran'
        },
        pagination: {
          total: 'Total {total} catatan',
          page: 'Halaman {current} / {total}',
          firstPage: 'Halaman Pertama',
          prevPage: 'Halaman Sebelumnya',
          nextPage: 'Halaman Berikutnya',
          lastPage: 'Halaman Terakhir'
        },
        fetchFailed: 'Gagal mendapatkan catatan undangan'
      }
    },
    enterprisePage: {
      title: 'Manajemen Tim',
      subtitle: 'Kelola informasi tim, undangan anggota dan penugasan peran',
      notSupported: 'Fitur Tidak Didukung',
      notSupportedDesc: 'Anda belum bergabung dengan tim mana pun, silakan bergabung dengan perusahaan terlebih dahulu',
      buttons: {
        addTeam: 'Tambahkan Tim',
        refresh: 'Segarkan',
        viewMembers: 'Lihat Anggota',
        edit: 'Edit',
        inviteMember: 'Undang Anggota',
        addMember: 'Tambahkan Anggota',
        delete: 'Hapus',
        cancel: 'Batal',
        confirm: 'Konfirmasi',
        close: 'Tutup',
        newUser: 'Pengguna Baru (Daftar)',
        oldUser: 'Pengguna Lama (Login)',
        editRole: 'Edit Peran',
        editAuth: 'Edit Izin',
        allocate: 'Alokasi',
        remove: 'Hapus'
      },
      table: {
        teamName: 'Nama Tim',
        searchPlaceholder: 'Cari nama tim',
        createTime: 'Waktu Dibuat',
        status: 'Status',
        actions: 'Tindakan',
        normal: 'Normal',
        disabled: 'Dinonaktifkan',
        noData: 'Tidak ada data tim',
        userInfo: 'Info Pengguna',
        nickName: 'Nama Panggilan',
        phoneNumber: 'Nomor Telepon',
        userAuth: 'Izin Pengguna',
        userRole: 'Peran Pengguna',
        remainingQuota: 'Kuota Tersisa',
        usedQuota: 'Kuota yang Digunakan',
        joinTime: 'Waktu Bergabung',
        userName: 'Nama Pengguna',
        account: 'Akun',
        registerTime: 'Waktu Registrasi'
      },
      modals: {
        addTeam: 'Tambahkan Tim',
        editTeam: 'Edit Tim',
        teamName: 'Nama Tim',
        teamNamePlaceholder: 'Silakan masukkan nama tim',
        teamRoles: 'Peran Tim',
        teamRolesPlaceholder: 'Silakan masukkan peran tim, misalnya: Pengembang, Penguji, Pengamat',
        teamRolesHint: '(Silakan masukkan peran tim, tekan Enter atau koma untuk menambahkan, satu tim mendukung hingga 10 peran)',
        remark: 'Keterangan',
        remarkPlaceholder: 'Silakan masukkan keterangan tim',
        membersList: 'Daftar Anggota Tim',
        noRole: 'Tidak Ada Peran',
        selectInviteType: 'Pilih Jenis Undangan',
        inviteTypeDesc: 'Silakan pilih apakah akan mengundang pengguna baru atau pengguna lama untuk bergabung dengan tim',
        addMembers: 'Tambahkan Anggota Tim',
        searchUserPlaceholder: 'Cari nama pengguna atau email',
        selectedCount: 'Dipilih {count} anggota',
        editMemberRole: 'Edit Peran Anggota',
        memberInfo: 'Informasi Anggota',
        currentRole: 'Peran Saat Ini:',
        selectNewRole: 'Pilih Peran Baru',
        editMemberAuth: 'Edit Izin Anggota',
        currentAuth: 'Izin Saat Ini:',
        selectNewAuth: 'Pilih Izin Baru',
        allocateQuota: 'Alokasikan Kuota ke Anggota Tim',
        memberInfoTitle: 'Informasi Anggota',
        currentBalance: 'Saldo Saat Ini:',
        score: 'Skor:',
        memberLevel: 'Level Anggota:',
        myBalance: 'Saldo Saya',
        quotaAmount: 'Jumlah Kuota (RMB)',
        quotaAmountPlaceholder: 'Silakan masukkan jumlah kuota',
        quotaAmountHint: 'Jumlah kuota tidak boleh melebihi saldo tersisa Anda ¥{amount}'
      },
      messages: {
        fetchTeamListFailed: 'Gagal mengambil daftar tim',
        enterTeamName: 'Silakan masukkan nama tim',
        setTeamRoles: 'Silakan atur peran tim',
        maxRolesLimit: 'Peran tim mendukung hingga 10',
        updateTeamSuccess: 'Tim berhasil diperbarui',
        createTeamSuccess: 'Tim berhasil dibuat',
        deleteTeamConfirm: 'Konfirmasi Hapus',
        deleteTeamMessage: 'Apakah Anda yakin ingin menghapus tim "{teamName}"?\nIni juga akan menghapus semua data terkait termasuk peran tim, anggota tim, folder tim, dll. Operasi ini tidak dapat dibatalkan!',
        deleteTeamSuccess: 'Tim berhasil dihapus',
        deleteTeamFailed: 'Gagal menghapus tim',
        inviteLinkCopied: 'Tautan undangan disalin ke clipboard',
        inviteLinkTip: 'Tautan Undangan: {url}\n\nTip: Jika akun yang diundang saat ini masuk, silakan keluar terlebih dahulu sebelum menggunakan tautan undangan untuk bergabung dengan tim.',
        inviteLinkTipText: 'Tip: Jika akun yang diundang saat ini masuk, silakan keluar terlebih dahulu sebelum menggunakan tautan undangan untuk bergabung dengan tim.',
        selectMembers: 'Silakan pilih anggota untuk ditambahkan',
        addMembersSuccess: 'Berhasil menambahkan {count} anggota',
        addMembersFailed: 'Gagal menambahkan anggota',
        updateRoleSuccess: 'Peran berhasil diperbarui',
        updateRoleFailed: 'Gagal memperbarui peran',
        adminAuthDisabled: 'Izin admin telah dinonaktifkan. Pemilik saluran adalah administrator secara default',
        updateAuthSuccess: 'Izin berhasil diperbarui',
        updateAuthFailed: 'Gagal memperbarui izin',
        enterValidQuota: 'Silakan masukkan jumlah kuota yang valid',
        quotaExceeded: 'Jumlah kuota tidak boleh melebihi ¥{amount} (margin presisi 0,01 RMB dicadangkan)',
        getUserIdFailed: 'Tidak dapat mendapatkan ID pengguna',
        allocateQuotaSuccess: 'Kuota berhasil dialokasikan',
        allocateQuotaFailed: 'Gagal mengalokasikan kuota',
        removeMemberConfirm: 'Konfirmasi Hapus',
        removeMemberMessage: 'Apakah Anda yakin ingin menghapus anggota "{userName}"?',
        removeMemberSuccess: 'Anggota berhasil dihapus',
        removeMemberFailed: 'Gagal menghapus anggota',
        getChannelIdFailed: 'Gagal mendapatkan ID saluran, harap konfirmasi tim telah dikaitkan dengan saluran',
        fetchInviteUserListFailed: 'Gagal mengambil daftar pengguna undangan',
        noMemberData: 'Tidak ada data anggota',
        noUserData: 'Tidak ada data pengguna',
        isMember: 'Sudah menjadi anggota'
      },
      authTypes: {
        member: 'Anggota',
        leader: 'Pemimpin',
        admin: 'Admin',
        unknown: 'Tidak Diketahui'
      },
      pagination: {
        totalRecords: 'Total {total} catatan',
        previous: 'Sebelumnya',
        next: 'Selanjutnya'
      },
      quota: {
        balance: 'Saldo:',
        score: 'Skor:',
        level: 'Level:',
        normalMember: 'Anggota Normal'
      }
    },
    components: {
      imageCrop: {
        title: 'Pangkas Gambar',
        ratio: 'Rasio Aspek',
        reset: 'Atur Ulang',
        cancel: 'Batal',
        confirm: 'Konfirmasi Pangkas',
        cropFailed: 'Pemangkasan gagal',
        loadFailed: 'Gagal memuat gambar',
      },
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
