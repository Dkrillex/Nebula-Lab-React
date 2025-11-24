import React from 'react';

// 视频标记点类型定义
export interface VideoMarker {
  id: string;
  type: 'modify' | 'protect';
  x: number;
  y: number;
  radius: number;
  time: number; // 标记的时间点（秒）
}

// VideoEditingModal 组件属性
export interface VideoEditingModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoProcessTaskId?: string;
  onSave?: (markers: VideoMarker[]) => void;
  onVideoMaskSuccess?: (data: { taskId: string; trackingVideoPath: string }) => void;
}

// 视频编辑器模态框组件
const VideoEditingModal: React.FC<VideoEditingModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  videoProcessTaskId,
  onSave,
  onVideoMaskSuccess,
}) => {
  // TODO: 实现视频编辑器功能
  // 借鉴 Nebula1 的实现：
  // 1. 视频预览和播放控制
  // 2. 标记修改区域和保护区域
  // 3. 时间轴控制
  // 4. 提交视频掩码绘制任务
  // 5. 轮询查询任务状态
  // 6. 成功后调用 onVideoMaskSuccess 回调

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">视频编辑器</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-4">
          <video
            src={videoUrl}
            controls
            className="w-full max-h-[400px]"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            取消
          </button>
          <button
            onClick={() => {
              // TODO: 实现确认逻辑
              // 提交视频掩码绘制任务
              // 成功后调用 onVideoMaskSuccess
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoEditingModal;

