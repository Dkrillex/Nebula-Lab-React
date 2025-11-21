import { avatarService, UploadedFile } from '@/services/avatarService';
export const uploadTVFile = async (file: File): Promise<UploadedFile> => {
    let fileType = file.type.split('/')[1];
    if (!fileType && file.name.includes('.')) {
        fileType = file.name.split('.').pop() || '';
    }
    if (!fileType) {
        throw new Error('Invalid file type');
    }
    if (fileType === 'mpeg') {
        fileType = 'mp3';
    }
    // 苹果mov格式
    if (fileType === 'quicktime') {
        fileType = 'mp4';
    }

    const res: any = await avatarService.getUploadCredential(fileType);
    // 兼容处理：如果 request 拦截器已经解包，res 就是凭证；如果没有，res.result 是凭证
    const credential = res.result || res;

    if (!credential || !credential.uploadUrl) {
        throw new Error('Failed to get upload credential');
    }

    const { uploadUrl, fileName, fileId, format } = credential;

    console.log(uploadUrl, '准备上传文件:', {
        fileName,
        fileId,
        format,
        fileSize: file.size,
    });

    const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type,
        },
    });

    if (!uploadRes.ok) {
        const text = await uploadRes.text();
        throw new Error(
            `Upload failed: ${uploadRes.status} ${uploadRes.statusText}. Details: ${text}`,
        );
    }

    console.log('文件上传成功:', { fileId, fileName });
    return {
        fileId,
        fileName,
        format,
        fileUrl: uploadUrl,
    };
};