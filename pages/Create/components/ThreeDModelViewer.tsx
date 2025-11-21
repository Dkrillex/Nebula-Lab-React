import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Download, ZoomIn } from 'lucide-react';

interface ThreeDModelViewerProps {
  modelUrl?: string | null;
  fileUrl?: string;
  originalImageUrl?: string | null;
  onImageClick?: (url: string) => void;
  onUseImageAsInput?: (url: string) => void;
}

const ThreeDModelViewer: React.FC<ThreeDModelViewerProps> = ({
  modelUrl,
  fileUrl,
  originalImageUrl,
  onImageClick,
  onUseImageAsInput,
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelLoadingText, setModelLoadingText] = useState('加载模型中...');
  const [hasModelError, setHasModelError] = useState(false);
  const [bgType, setBgType] = useState<'color' | 'image'>('color');
  const [bgColor, setBgColor] = useState('#f0f0f0');
  const [bgImage, setBgImage] = useState('');
  const [displayMode, setDisplayMode] = useState<'default' | 'white' | 'wireframe' | 'metallic' | 'normal'>('default');
  const [lightIntensity, setLightIntensity] = useState(1);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cameraDistance, setCameraDistance] = useState(3);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelSceneRef = useRef<THREE.Object3D | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
  const animationFrameIdRef = useRef<number>(0);
  const backgroundTextureRef = useRef<THREE.Texture | null>(null);
  const originalMaterialsRef = useRef<Map<string, THREE.Material>>(new Map());
  const tempMaterialsRef = useRef<Map<string, THREE.Material>>(new Map());
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const zoomAnimationRef = useRef({
    isAnimating: false,
    startZ: 3,
    targetZ: 0.5,
    duration: 800,
    startTime: 0,
  });

  // 清理场景
  const disposeScene = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = 0;
    }

    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    if (controlsRef.current) {
      controlsRef.current.dispose();
      controlsRef.current = null;
    }

    if (rendererRef.current) {
      rendererRef.current.dispose();
      const canvas = rendererRef.current.domElement;
      if (canvas?.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
      rendererRef.current = null;
    }

    if (sceneRef.current) {
      sceneRef.current.traverse((child) => {
        const mesh = child as THREE.Mesh & {
          geometry?: THREE.BufferGeometry;
          material?: THREE.Material | THREE.Material[];
        };
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          const { material } = mesh;
          if (Array.isArray(material)) {
            material.forEach((mat) => mat?.dispose?.());
          } else {
            material?.dispose?.();
          }
        }
      });
    }

    if (backgroundTextureRef.current) {
      backgroundTextureRef.current.dispose();
      backgroundTextureRef.current = null;
    }

    tempMaterialsRef.current.forEach((material) => {
      material.dispose?.();
    });
    tempMaterialsRef.current.clear();
    originalMaterialsRef.current.clear();

    zoomAnimationRef.current.isAnimating = false;
    sceneRef.current = null;
    cameraRef.current = null;
    modelSceneRef.current = null;
    ambientLightRef.current = null;
    directionalLightRef.current = null;
    setIsModelLoading(false);
    setHasModelError(false);
    setModelLoadingText('加载模型中...');
  };

  // 更新背景
  const updateBackground = () => {
    if (!sceneRef.current) return;

    if (backgroundTextureRef.current) {
      backgroundTextureRef.current.dispose();
      backgroundTextureRef.current = null;
    }

    if (bgType === 'color' || !bgImage) {
      sceneRef.current.background = new THREE.Color(bgColor || '#f0f0f0');
      return;
    }

    const loader = new THREE.TextureLoader();
    backgroundTextureRef.current = loader.load(
      bgImage,
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        if (sceneRef.current) {
          sceneRef.current.background = texture;
        }
      },
      undefined,
      (err) => {
        console.error('背景图片加载失败：', err);
        if (backgroundTextureRef.current) {
          backgroundTextureRef.current.dispose();
          backgroundTextureRef.current = null;
        }
        setBgImage('');
        setBgType('color');
        if (sceneRef.current) {
          sceneRef.current.background = new THREE.Color(bgColor || '#f0f0f0');
        }
      }
    );
  };

  // 更新灯光强度
  const updateLightIntensity = () => {
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = lightIntensity * 1.2;
    }
    if (directionalLightRef.current) {
      directionalLightRef.current.intensity = lightIntensity * 0.9;
    }
  };

  // 应用显示模式
  const applyDisplayMode = () => {
    if (!modelSceneRef.current) return;

    // 恢复原始材质
    modelSceneRef.current.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const original = originalMaterialsRef.current.get(mesh.uuid);
      if (original) {
        mesh.material = original;
        if ('wireframe' in original) {
          (original as THREE.Material & { wireframe?: boolean }).wireframe = false;
        }
        original.needsUpdate = true;
      }
    });

    // 清理临时材质
    tempMaterialsRef.current.forEach((material) => {
      material.dispose?.();
    });
    tempMaterialsRef.current.clear();

    if (displayMode === 'default') return;

    // 应用新模式
    modelSceneRef.current.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const original = originalMaterialsRef.current.get(mesh.uuid);
      if (!original) return;

      let newMaterial: THREE.Material | null = null;
      switch (displayMode) {
        case 'metallic': {
          const cloned = (original as THREE.Material).clone?.() as THREE.MeshStandardMaterial | undefined;
          if (cloned) {
            if (cloned.color) cloned.color.set(0xcfd8dc);
            if (typeof cloned.metalness === 'number') cloned.metalness = 1;
            if (typeof cloned.roughness === 'number') cloned.roughness = 0.15;
            if (typeof cloned.envMapIntensity === 'number') {
              cloned.envMapIntensity = Math.max(cloned.envMapIntensity, 1.2);
            }
            cloned.wireframe = false;
            newMaterial = cloned;
          }
          break;
        }
        case 'normal': {
          newMaterial = new THREE.MeshNormalMaterial({
            flatShading: false,
            transparent: original.transparent ?? false,
            opacity: original.opacity === undefined ? 1 : original.opacity,
            depthTest: original.depthTest ?? true,
            depthWrite: original.depthWrite ?? true,
          });
          (newMaterial as THREE.Material).side = original.side ?? THREE.FrontSide;
          break;
        }
        case 'white': {
          const cloned = (original as THREE.Material).clone?.() as THREE.MeshStandardMaterial | undefined;
          if (cloned) {
            if (cloned.map) cloned.map = null;
            if (cloned.emissive) cloned.emissive.setHex(0x000000);
            if (cloned.color) cloned.color.set(0xffffff);
            cloned.wireframe = false;
            newMaterial = cloned;
          }
          break;
        }
        case 'wireframe': {
          const cloned = (original as THREE.Material).clone?.() as THREE.MeshStandardMaterial | undefined;
          if (cloned) {
            cloned.wireframe = true;
            if (cloned.color) cloned.color.set(0x444444);
            if (cloned.map) cloned.map = null;
            newMaterial = cloned;
          }
          break;
        }
        default:
          break;
      }

      if (!newMaterial) return;
      newMaterial.needsUpdate = true;
      mesh.material = newMaterial;
      tempMaterialsRef.current.set(mesh.uuid, newMaterial);
    });
  };

  // 处理窗口大小变化
  const handleResize = () => {
    if (!viewerRef.current || !rendererRef.current || !cameraRef.current) return;
    const { clientWidth, clientHeight } = viewerRef.current;
    if (!clientWidth || !clientHeight) return;
    cameraRef.current.aspect = clientWidth / clientHeight;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(clientWidth, clientHeight);
    if (cameraRef.current) {
      setCameraDistance(cameraRef.current.position.length());
    }
  };

  // 动画循环
  const startAnimationLoop = () => {
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      
      if (isAutoRotate && modelSceneRef.current) {
        modelSceneRef.current.rotation.y += 0.01;
      }

      if (zoomAnimationRef.current.isAnimating && cameraRef.current) {
        const currentTime = performance.now();
        const elapsed = currentTime - zoomAnimationRef.current.startTime;
        const progress = Math.min(elapsed / zoomAnimationRef.current.duration, 1);
        const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
        cameraRef.current.position.z =
          zoomAnimationRef.current.startZ +
          (zoomAnimationRef.current.targetZ - zoomAnimationRef.current.startZ) * eased;
        if (progress >= 1) {
          zoomAnimationRef.current.isAnimating = false;
        }
      }

      if (cameraRef.current) {
        setCameraDistance(cameraRef.current.position.length());
      }

      controlsRef.current?.update();
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    animationFrameIdRef.current = requestAnimationFrame(animate);
  };

  // 初始化 Three.js 查看器
  const initThreeViewer = (url: string) => {
    if (!viewerRef.current) return;

    disposeScene();

    setIsModelLoading(true);
    setHasModelError(false);
    setModelLoadingText('加载模型中...');

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bgColor || '#f0f0f0');
    sceneRef.current = scene;

    const container = viewerRef.current;
    const width = container.clientWidth || container.offsetWidth || 1;
    const height = container.clientHeight || container.offsetHeight || 1;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 1, 3);
    setCameraDistance(camera.position.length());
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    updateBackground();

    const ambientLight = new THREE.AmbientLight(0xffffff, lightIntensity * 1.2);
    const directionalLight = new THREE.DirectionalLight(0xffffff, lightIntensity * 0.9);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight);
    scene.add(directionalLight);
    ambientLightRef.current = ambientLight;
    directionalLightRef.current = directionalLight;

    updateLightIntensity();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 100;
    controls.minDistance = 0.2;
    controls.addEventListener('start', () => setIsAutoRotate(false));
    controlsRef.current = controls;

    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf: GLTF) => {
        modelSceneRef.current = gltf.scene;
        originalMaterialsRef.current.clear();
        tempMaterialsRef.current.clear();
        modelSceneRef.current.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh) return;
          if (!originalMaterialsRef.current.has(mesh.uuid)) {
            originalMaterialsRef.current.set(mesh.uuid, mesh.material as THREE.Material);
          }
        });
        scene.add(modelSceneRef.current);
        modelSceneRef.current.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });
        applyDisplayMode();
        setIsModelLoading(false);
        setModelLoadingText('加载完成');
      },
      (xhr) => {
        if (xhr.total) {
          const progress = Math.round((xhr.loaded / xhr.total) * 100);
          setModelLoadingText(`加载中...${progress}%`);
        } else {
          setModelLoadingText('加载中...');
        }
      },
      (error) => {
        console.error('GLB 模型加载失败：', error);
        setIsModelLoading(false);
        setHasModelError(true);
        setModelLoadingText('模型加载失败');
      }
    );

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserverRef.current = new ResizeObserver(() => handleResize());
      resizeObserverRef.current.observe(container);
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }

    handleResize();
    startAnimationLoop();
  };

  // 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const tempUrl = URL.createObjectURL(file);
    setBgImage(tempUrl);
    setBgType('image');
  };

  // 清除背景图片
  const clearBackgroundImage = () => {
    if (backgroundTextureRef.current) {
      backgroundTextureRef.current.dispose();
      backgroundTextureRef.current = null;
    }
    setBgImage('');
    setBgType('color');
  };

  // 快速放大
  const handleZoomInMax = () => {
    if (!cameraRef.current) return;
    zoomAnimationRef.current.isAnimating = true;
    zoomAnimationRef.current.startZ = cameraRef.current.position.z;
    zoomAnimationRef.current.targetZ = 0.5;
    zoomAnimationRef.current.startTime = performance.now();
  };

  // 下载文件
  const handleDownloadImage = async () => {
    if (!fileUrl) return;
    try {
      setIsDownloading(true);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = 'doubao-seed3d-file.zip';
      link.click();
    } catch (error) {
      console.error('下载文件失败：', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // 监听 modelUrl 变化
  useEffect(() => {
    if (modelUrl) {
      initThreeViewer(modelUrl);
    }
    return () => {
      disposeScene();
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [modelUrl]);

  // 监听背景相关变化
  useEffect(() => {
    updateBackground();
  }, [bgType, bgColor, bgImage]);

  // 监听显示模式变化
  useEffect(() => {
    applyDisplayMode();
  }, [displayMode]);

  // 监听灯光强度变化
  useEffect(() => {
    updateLightIntensity();
  }, [lightIntensity]);

  return (
    <div className="animate-fade-in result-container w-full">
      <div className="viewer-frame viewer-frame--model">
        <div className="viewer-3d-wrapper">
          <div ref={viewerRef} className="viewer-3d-surface"></div>
          {isModelLoading && (
            <div className="viewer-3d-overlay">
              <div className="viewer-3d-spinner"></div>
              <p className="viewer-3d-status">{modelLoadingText}</p>
            </div>
          )}
          {hasModelError && (
            <div className="viewer-3d-overlay viewer-3d-overlay--error">
              <p className="viewer-3d-status">{modelLoadingText}</p>
            </div>
          )}
        </div>
      </div>

      <div className="operationSection">
        <div className="control-item">
          <label className="switch">
            <input
              type="checkbox"
              checked={isAutoRotate}
              onChange={(e) => setIsAutoRotate(e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
          <span className="switch-label">自动旋转</span>
        </div>

        <h3 className="operationSection__title">背景设置</h3>
        <div className="bg-controls">
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="viewer-bg-type"
                value="color"
                checked={bgType === 'color'}
                onChange={() => setBgType('color')}
              />
              纯色
            </label>
            <label>
              <input
                type="radio"
                name="viewer-bg-type"
                value="image"
                checked={bgType === 'image'}
                onChange={() => setBgType('image')}
              />
              图片
            </label>
          </div>

          {bgType === 'color' && (
            <div className="color-picker">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                title="选择背景色"
              />
              <span className="color-picker__value">当前颜色: {bgColor}</span>
            </div>
          )}

          {bgType === 'image' && (
            <div className="image-upload">
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              {bgImage && (
                <div className="image-preview">
                  <img src={bgImage} alt="背景预览" />
                  <button type="button" onClick={clearBackgroundImage}>清除</button>
                </div>
              )}
              <p className="image-upload__note">支持上传本地图片作为 3D 背景</p>
            </div>
          )}
        </div>

        <div className="control-item control-item--stacked">
          <label className="switch-label" htmlFor="viewer-mode-select">材质显示模式</label>
          <select
            id="viewer-mode-select"
            value={displayMode}
            onChange={(e) => setDisplayMode(e.target.value as any)}
            className="mode-select"
          >
            <option value="default">默认纹理</option>
            <option value="white">白模</option>
            <option value="wireframe">线框</option>
            <option value="metallic">金属高光</option>
            <option value="normal">法线着色</option>
          </select>
        </div>

        <div className="control-item control-item--stacked">
          <label className="switch-label" htmlFor="viewer-light-range">灯光亮度</label>
          <input
            id="viewer-light-range"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={lightIntensity}
            onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
          />
          <span className="zoom-note">当前强度：{lightIntensity.toFixed(1)}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="control-item control-item--stacked" style={{ width: '49%' }}>
            <button
              type="button"
              className="btn-download"
              disabled={isDownloading || !fileUrl}
              onClick={handleDownloadImage}
            >
              <Download size={16} className="mr-2" />
              {isDownloading ? '下载中…' : '下载文件.zip'}
            </button>
          </div>
          <div className="control-item control-item--stacked" style={{ width: '49%' }}>
            <button
              type="button"
              className="btn-zoom"
              onClick={handleZoomInMax}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ZoomIn size={16} className="mr-2" />
              快速放大
              <span style={{ fontSize: '0.7rem', color: '#ddd', marginLeft: '4px' }}>
                (当前缩放距离：{cameraDistance.toFixed(2)})
              </span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .result-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          height: 100%;
          align-items: center;
          margin-top: 0.5rem;
        }

        .viewer-frame {
          position: relative;
          width: 100%;
          flex: 1;
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          background: #ffffff;
          box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
        }

        .viewer-frame--model {
          align-items: stretch;
          justify-content: stretch;
        }

        .operationSection {
          width: 100%;
          margin-top: 2px;
          padding: 10px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .control-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .control-item--stacked {
          flex-direction: column;
          align-items: flex-start;
        }

        .switch-label {
          font-size: 14px;
          color: #374151;
        }

        .operationSection__title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .mode-select {
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: #ffffff;
          font-size: 14px;
          color: #111827;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .mode-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
          outline: none;
        }

        .btn-zoom {
          width: 100%;
          padding: 10px 16px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .btn-zoom:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.25);
        }

        .btn-download {
          width: 100%;
          padding: 10px 16px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-download:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.25);
        }

        .btn-download:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .zoom-note {
          font-size: 12px;
          color: #6b7280;
        }

        input[type='range'] {
          width: 100%;
          accent-color: #3b82f6;
        }

        .bg-controls {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .radio-group {
          display: flex;
          gap: 16px;
          font-size: 14px;
          color: #374151;
        }

        .radio-group input {
          margin-right: 6px;
        }

        .color-picker {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .color-picker__value {
          font-size: 13px;
          color: #6b7280;
        }

        .image-upload {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .image-upload input[type='file'] {
          font-size: 13px;
        }

        .image-preview {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .image-preview img {
          width: 120px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .image-preview button {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          background: #ef4444;
          color: #ffffff;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .image-preview button:hover {
          background: #dc2626;
        }

        .image-upload__note {
          margin: 0;
          font-size: 12px;
          color: #9ca3af;
        }

        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.4s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: '';
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #3b82f6;
        }

        input:checked + .slider:before {
          transform: translateX(26px);
        }

        .slider.round {
          border-radius: 34px;
        }

        .slider.round:before {
          border-radius: 50%;
        }

        .viewer-3d-wrapper {
          position: relative;
          flex: 1;
          width: 100%;
          height: 100%;
          display: flex;
        }

        .viewer-3d-surface {
          width: 100%;
          height: 100%;
          overflow: hidden;
          border-radius: 12px;
        }

        .viewer-3d-surface canvas {
          width: 100%;
          height: 100%;
          display: block;
        }

        .viewer-3d-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.82);
          z-index: 2;
          text-align: center;
          padding: 16px;
        }

        .viewer-3d-overlay--error {
          background: rgba(254, 226, 226, 0.85);
        }

        .viewer-3d-spinner {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 4px solid rgba(59, 130, 246, 0.25);
          border-top-color: rgba(59, 130, 246, 0.9);
          animation: viewer-spin 1s linear infinite;
        }

        .viewer-3d-status {
          margin: 0;
          font-size: 14px;
          color: #374151;
        }

        @keyframes viewer-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ThreeDModelViewer;


