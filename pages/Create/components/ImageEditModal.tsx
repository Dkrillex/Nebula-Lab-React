import React, { useEffect, useMemo, useRef, useState } from 'react';
import BaseModal from '../../../components/BaseModal';
import { Upload, X } from 'lucide-react';
import { uploadService } from '../../../services/uploadService';
import toast from 'react-hot-toast';

interface ImageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{ url: string; id?: string }>;
  onSubmit: (images: Array<{ url: string; id?: string }>) => void;
}

const RATIO_OPTIONS = ['3:4', '1:1', '9:16'] as const;
type Ratio = typeof RATIO_OPTIONS[number];

const ImageEditModal: React.FC<ImageEditModalProps> = ({ isOpen, onClose, images, onSubmit }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [ratio, setRatio] = useState<Ratio>('3:4');
  const [rotate, setRotate] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [busy, setBusy] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex(0);
    setRatio('3:4');
    setRotate(0);
    setZoom(100);
  }, [isOpen]);

  const size = useMemo(() => {
    if (ratio === '3:4') return { w: 1080, h: 1440 };
    if (ratio === '9:16') return { w: 1080, h: 1920 };
    return { w: 1080, h: 1080 };
  }, [ratio]);

  const applyEditForUrl = async (url: string) => {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = size.w;
    canvas.height = size.h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context error');

    const scale = Math.max(1, zoom / 100);
    const cx = size.w / 2;
    const cy = size.h / 2;

    ctx.translate(cx, cy);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale(scale, scale);

    const aspectTarget = size.w / size.h;
    const srcAspect = img.width / img.height;
    let drawW = size.w;
    let drawH = size.h;
    if (srcAspect > aspectTarget) {
      drawH = size.h;
      drawW = img.width * (drawH / img.height);
    } else {
      drawW = size.w;
      drawH = img.height * (drawW / img.width);
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `edited_${Date.now()}.jpg`, { type: 'image/jpeg' });
    const res = await uploadService.uploadFile(file);
    return { url: res.url, id: res.ossId };
  };

  const handleSubmit = async () => {
    if (!images || images.length === 0) return;
    try {
      setBusy(true);
      const edited: Array<{ url: string; id?: string }> = [];
      for (let i = 0; i < images.length; i++) {
        const res = await applyEditForUrl(images[i].url);
        edited.push({ url: res.url, id: images[i].id });
        await sleep(200);
      }
      onSubmit(edited);
      toast.success('已应用编辑并更新图片');
      onClose();
    } catch (e: any) {
      toast.error(e.message || '编辑失败');
    } finally {
      setBusy(false);
    }
  };

  const currentUrl = images[activeIndex]?.url || '';

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="修改视频拟合比例" width="max-w-5xl">
      <div className="flex gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <button className={`px-3 py-1.5 rounded-lg border ${ratio === '3:4' ? 'border-indigo-500 text-indigo-600' : 'border-border'}`} onClick={() => setRatio('3:4')}>3:4</button>
            <button className={`px-3 py-1.5 rounded-lg border ${ratio === '1:1' ? 'border-indigo-500 text-indigo-600' : 'border-border'}`} onClick={() => setRatio('1:1')}>1:1</button>
            <button className={`px-3 py-1.5 rounded-lg border ${ratio === '9:16' ? 'border-indigo-500 text-indigo-600' : 'border-border'}`} onClick={() => setRatio('9:16')}>9:16</button>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">旋转</span>
              <input type="range" min={-180} max={180} value={rotate} onChange={(e) => setRotate(Number(e.target.value))} />
              <span className="text-xs text-muted w-6 text-right">{rotate}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">缩放</span>
              <input type="range" min={50} max={200} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
              <span className="text-xs text-muted w-8 text-right">{zoom}%</span>
            </div>
          </div>
          <div className="bg-black rounded-xl overflow-hidden flex items-center justify-center">
            <div className={`relative`} style={{ width: `${size.w / 3}px`, height: `${size.h / 3}px` }}>
              <img ref={imgRef} src={currentUrl} className="absolute inset-0 w-full h-full object-cover" style={{ transform: `translateZ(0) rotate(${rotate}deg) scale(${zoom / 100})` }} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button onClick={handleSubmit} disabled={busy} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
              <Upload size={16} /> 完成并提交
            </button>
          </div>
        </div>
        <div className="w-64">
          <div className="text-sm font-bold mb-2">已上传图片 ({images.length}/10)</div>
          <div className="grid grid-cols-2 gap-2">
            {images.map((it, i) => (
              <div key={i} className={`relative aspect-square overflow-hidden rounded-lg border cursor-pointer ${activeIndex === i ? 'border-indigo-500' : 'border-border'}`} onClick={() => setActiveIndex(i)}>
                <img src={it.url} className="w-full h-full object-cover" />
                <button className="absolute top-1 right-1 p-1 rounded bg-black/50">
                  <X size={12} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default ImageEditModal;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = url;
  });
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
