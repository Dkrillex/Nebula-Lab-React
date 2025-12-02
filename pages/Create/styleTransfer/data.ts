import { Target, Sparkles, Shirt } from 'lucide-react';
import { uploadService } from '@/services/uploadService';
import { avatarService } from '@/services/avatarService';
import toast from 'react-hot-toast';

// 类型定义
export interface UploadedImage {
    fileId?: string;
    fileName: string;
    fileUrl: string;
    file?: File;
}

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

export type ModeType = 'standard' | 'creative' | 'clothing';
export type ClothingType = 'top' | 'bottom' | 'full';
export type ImageUploadType = 'product' | 'template' | 'garment' | 'model' | 'reference';

// 常量
export const TEXTS = {
    standard: {
        desc: '精确控制产品位置和形状',
        productDesc: '高清图片效果最佳\n格式:jpg/jpeg/png/webp; 文件大小<10MB',
        areaDesc: '使用笔刷画出遮罩标记产品替换后需要发生变化的区域',
        templateUpload: '上传模板图片\n(png, jpg, jpeg, webp)',
        areaTitle: '画出您想要替换的区域'
    },
    creative: {
        desc: '选中区域物品变化转换',
        productDesc: '高清图片效果最佳\n格式:jpg/jpeg/png; 文件大小<10MB'
    },
    clothing: {
        desc: '服装快速替换'
    }
};

// 模式配置（需要传入 t 对象来获取翻译）
export const getModes = (t: StyleTransferPageProps['t']) => [
    { id: 'standard' as const, icon: Target, title: t.modes.standard.title, desc: TEXTS.standard.desc },
    { id: 'creative' as const, icon: Sparkles, title: t.modes.creative.title, desc: TEXTS.creative.desc },
    { id: 'clothing' as const, icon: Shirt, title: t.modes.clothing.title, desc: TEXTS.clothing.desc },
];

// 工具函数

/**
 * 验证文件类型和大小
 * @param file 文件对象
 * @param type 文件类型（product/template/garment/model/reference）
 * @param mode 当前模式（用于判断创意模式的特殊限制）
 * @returns 是否通过验证
 */
export const validateFileType = (
    file: File,
    type: ImageUploadType,
    mode?: ModeType
): boolean => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

    // 创意模式的产品图和参考图只支持 png, jpg, jpeg
    if (mode === 'creative' && (type === 'product' || type === 'reference')) {
        if (!['png', 'jpg', 'jpeg'].includes(fileExtension)) {
            toast.error(`不支持的文件格式：${file.name}，请上传 PNG, JPG, JPEG 格式的图片`);
            return false;
        }
    } else {
        // 其他情况支持 png, jpg, jpeg, webp
        if (!['png', 'jpg', 'jpeg', 'webp'].includes(fileExtension)) {
            toast.error(`不支持的文件格式：${file.name}，请上传 PNG, JPG, JPEG, WEBP 格式的图片`);
            return false;
        }
    }

    // 文件大小验证 (10MB)
    if (file.size > 10 * 1024 * 1024) {
        toast.error(`文件大小超过限制：${file.name}，文件大小不能超过 10MB`);
        return false;
    }

    return true;
};

/**
 * 上传图片到OSS (服装模式专用)
 * @param image 图片对象
 * @returns 上传后的图片对象（包含 fileId）
 */
export const uploadImageToOss = async (image: UploadedImage): Promise<UploadedImage> => {
    if (image.fileId) return image;
    if (!image.file) throw new Error('No file object found');

    console.log('准备上传文件到OSS:', { fileName: image.file.name, fileSize: image.file.size });

    try {
        const uploadRes = await uploadService.uploadFile(image.file);
        console.log('OSS上传响应:', uploadRes);

        // requestClient已去掉最外层，直接返回data部分
        // 返回格式: { url, fileName, ossId }
        if (!uploadRes || !uploadRes.url) {
            throw new Error('OSS upload failed: No URL returned');
        }

        const { url, ossId, fileName } = uploadRes;
        console.log('文件上传到OSS成功:', { url, ossId, fileName });

        return {
            ...image,
            fileId: ossId,
            fileUrl: url, // 使用OSS返回的URL
            fileName: fileName || image.file.name
        };
    } catch (error) {
        console.error('OSS上传失败:', error);
        throw error;
    }
};

/**
 * 上传图片到TopView (标准模式和创意模式使用)
 * @param image 图片对象
 * @returns 上传后的图片对象（包含 fileId）
 */
export const uploadImageToTopView = async (image: UploadedImage): Promise<UploadedImage> => {
    if (image.fileId) return image;
    if (!image.file) throw new Error('No file object found');

    // Use TopView Upload API (via avatarService.getUploadCredential)
    let fileType = image.file.type.split('/')[1] || 'jpg';
    if (fileType === 'mpeg') fileType = 'mp3';
    if (fileType === 'quicktime') fileType = 'mp4';

    console.log('准备获取TopView上传凭证, fileType:', fileType);
    const credRes = await avatarService.getUploadCredential(fileType);
    console.log('上传凭证响应:', credRes);

    // TopView API 返回的 code 是字符串类型,成功时为 "200"
    if (!credRes || !credRes.result || credRes.code !== '200') {
        console.error('获取上传凭证失败:', credRes);
        throw new Error(credRes?.message || 'Failed to get upload credentials');
    }

    const { uploadUrl, fileName, fileId, format } = credRes.result;
    console.log('准备上传文件到TopView:', { fileName, fileId, format, fileSize: image.file.size });

    // PUT file to uploadUrl
    const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: image.file,
        headers: {
            'Content-Type': image.file.type
        }
    });

    console.log('上传响应状态:', uploadRes.status, uploadRes.statusText);
    if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        console.error('上传失败详情:', errorText);
        throw new Error(`Upload failed: ${uploadRes.status} ${uploadRes.statusText}. Details: ${errorText}`);
    }

    console.log('文件上传到TopView成功:', { fileId, fileName });

    return {
        ...image,
        fileId: fileId,
        fileName: fileName,
        // Use original blob URL for preview, actual URL from CDN may differ
        fileUrl: image.fileUrl
    };
};

/**
 * 将图片URL转换为Base64 (返回包含前缀的完整Data URL)
 * @param url 图片URL
 * @returns Base64字符串（包含 data:image/... 前缀）
 */
export const urlToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            // 不移除前缀，保留完整的 Data URL
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

