import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
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
  const [edits, setEdits] = useState<Record<number, { ratio: Ratio; rotate: number; zoom: number }>>({});
  const [busy, setBusy] = useState(false);
  const [previews, setPreviews] = useState<Record<number, string>>({});
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex(0);
    setEdits({});
    setPreviews({});
  }, [isOpen]);

  const currentEdit = edits[activeIndex] || { ratio: '3:4', rotate: 0, zoom: 100 };
  const setCurrentEdit = (patch: Partial<{ ratio: Ratio; rotate: number; zoom: number }>) => {
    setEdits((prev) => ({ ...prev, [activeIndex]: { ...currentEdit, ...patch } }));
  };

  // 实时生成右侧缩略图预览
  const generatePreview = useCallback(async (idx: number) => {
    const edit = edits[idx] || { ratio: '3:4', rotate: 0, zoom: 100 };
    const url = images[idx]?.url;
    if (!url) return;
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = await loadImage(url);
    const scale = Math.max(1, edit.zoom / 100);
    const cx = 60;
    const cy = 60;
    ctx.translate(cx, cy);
    ctx.rotate((edit.rotate * Math.PI) / 180);
    ctx.scale(scale, scale);
    const aspect = 1;
    const srcAspect = img.width / img.height;
    let dw = 120;
    let dh = 120;
    if (srcAspect > aspect) {
      dh = 120;
      dw = img.width * (dh / img.height);
    } else {
      dw = 120;
      dh = img.height * (dw / img.width);
    }
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setPreviews((p) => ({ ...p, [idx]: dataUrl }));
  }, [images, edits]);

  // 当前图参数变化时立即刷新预览
  useEffect(() => {
    generatePreview(activeIndex);
  }, [activeIndex, edits, generatePreview]);

  const size = useMemo(() => {
    if (currentEdit.ratio === '3:4') return { w: 1080, h: 1440 };
    if (currentEdit.ratio === '9:16') return { w: 1080, h: 1920 };
    return { w: 1080, h: 1080 };
  }, [currentEdit.ratio]);

  const applyEditForUrl = async (url: string, edit: { ratio: Ratio; rotate: number; zoom: number }) => {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = size.w;
    canvas.height = size.h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context error');

    const scale = Math.max(1, edit.zoom / 100);
    const cx = size.w / 2;
    const cy = size.h / 2;

    ctx.translate(cx, cy);
    ctx.rotate((edit.rotate * Math.PI) / 180);
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
      // 上传全部图片，无论是否被编辑过
      for (let i = 0; i < images.length; i++) {
        const edit = edits[i] || { ratio: '3:4', rotate: 0, zoom: 100 };
        const res = await applyEditForUrl(images[i].url, edit);
        edited.push({ url: res.url, id: images[i].id });
        await sleep(200);
      }
      onSubmit(edited);
      toast.success('已应用编辑并更新全部图片');
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
            <button className={`px-3 py-1.5 rounded-lg border ${currentEdit.ratio === '3:4' ? 'border-indigo-500 text-indigo-600' : 'border-border'}`} onClick={() => setCurrentEdit({ ratio: '3:4' })}>3:4</button>
            <button className={`px-3 py-1.5 rounded-lg border ${currentEdit.ratio === '1:1' ? 'border-indigo-500 text-indigo-600' : 'border-border'}`} onClick={() => setCurrentEdit({ ratio: '1:1' })}>1:1</button>
            <button className={`px-3 py-1.5 rounded-lg border ${currentEdit.ratio === '9:16' ? 'border-indigo-500 text-indigo-600' : 'border-border'}`} onClick={() => setCurrentEdit({ ratio: '9:16' })}>9:16</button>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">旋转</span>
              <input type="range" min={-180} max={180} value={currentEdit.rotate} onChange={(e) => setCurrentEdit({ rotate: Number(e.target.value) })} />
              <span className="text-xs text-muted w-6 text-right">{currentEdit.rotate}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">缩放</span>
              <input type="range" min={50} max={200} value={currentEdit.zoom} onChange={(e) => setCurrentEdit({ zoom: Number(e.target.value) })} />
              <span className="text-xs text-muted w-8 text-right">{currentEdit.zoom}%</span>
            </div>
          </div>
          <div className="bg-black rounded-xl overflow-hidden flex items-center justify-center">
            <div className={`relative`} style={{ width: `${size.w / 3}px`, height: `${size.h / 3}px` }}>
              <img ref={imgRef} src={currentUrl} className="absolute inset-0 w-full h-full object-cover" style={{ transform: `translateZ(0) rotate(${currentEdit.rotate}deg) scale(${currentEdit.zoom / 100})` }} />
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
                <img src={previews[i] || it.url} className="w-full h-full object-cover" />
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
