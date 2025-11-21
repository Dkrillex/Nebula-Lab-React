import React from 'react';
import ImageUploaderBox from './ImageUploaderBox';

interface MultiImageUploaderProps {
  onPrimarySelect: (file: File, dataUrl: string) => void;
  onSecondarySelect: (file: File, dataUrl: string) => void;
  primaryImageUrl: string | null;
  secondaryImageUrl: string | null;
  onClearPrimary: () => void;
  onClearSecondary: () => void;
  primaryTitle?: string;
  primaryDescription?: string;
  secondaryTitle?: string;
  secondaryDescription?: string;
}

const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  onPrimarySelect,
  onSecondarySelect,
  primaryImageUrl,
  secondaryImageUrl,
  onClearPrimary,
  onClearSecondary,
  primaryTitle = '上传主图',
  primaryDescription,
  secondaryTitle = '上传参考图',
  secondaryDescription,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <ImageUploaderBox
        title={primaryTitle}
        description={primaryDescription}
        imageUrl={primaryImageUrl}
        onImageSelect={onPrimarySelect}
        onClear={onClearPrimary}
      />
      <ImageUploaderBox
        title={secondaryTitle}
        description={secondaryDescription}
        imageUrl={secondaryImageUrl}
        onImageSelect={onSecondarySelect}
        onClear={onClearSecondary}
      />
    </div>
  );
};

export default MultiImageUploader;

