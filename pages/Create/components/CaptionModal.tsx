import React, { useState, useEffect } from 'react';
import BaseModal from '@/components/BaseModal';
import { avatarService, Caption } from '@/services/avatarService';

interface CaptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (caption: Caption) => void;
  selectedCaptionId?: string;
  t?: any;
}

const CaptionModal: React.FC<CaptionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedCaptionId,
  t,
}) => {
  const [loading, setLoading] = useState(false);
  const [captionList, setCaptionList] = useState<Caption[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchCaptions();
    }
  }, [isOpen]);

  const fetchCaptions = async () => {
    setLoading(true);
    try {
      const res = await avatarService.getCaptionList();
      let list: Caption[] = [];
      if (res.code === '200') {
        list = res.result;
      }
      console.log(list);
      
      setCaptionList(list || []);
    } catch (error) {
      console.error('Failed to fetch captions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t?.title || "选择字幕样式"}
      width="max-w-4xl"
    >
      <div className="h-[500px] overflow-y-auto custom-scrollbar">
        {loading ? (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {captionList.map((caption) => (
                    <div
                        key={caption.captionId}
                        onClick={() => { onSelect(caption); onClose(); }}
                        className={`
                            cursor-pointer rounded-xl border-2 transition-all hover:border-indigo-300 p-4 flex items-center justify-center bg-gray-50 dark:bg-gray-800 h-32
                            ${selectedCaptionId === caption.captionId 
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                                : 'border-gray-100 dark:border-gray-700'}
                        `}
                    >
                        <img 
                            src={caption.thumbnail} 
                            alt="Caption Style" 
                            className="max-w-full max-h-full object-contain" 
                        />
                    </div>
                ))}
            </div>
        )}
      </div>
    </BaseModal>
  );
};

export default CaptionModal;

