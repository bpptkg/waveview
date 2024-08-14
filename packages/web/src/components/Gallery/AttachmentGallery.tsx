import React, { useMemo } from 'react';
import { Attachment } from '../../types/event';

export interface AttachmentGalleryProps {
  attachments: Attachment[];
  maxShown?: number;
}

const AttachmentGallery: React.FC<AttachmentGalleryProps> = (props) => {
  const { attachments, maxShown } = props;

  const items = useMemo(() => {
    if (maxShown) {
      return attachments.slice(0, maxShown);
    }
    return attachments;
  }, [attachments, maxShown]);

  return (
    <div className="flex flex-row flex-wrap gap-1">
      {items.map((attachment) => (
        <a key={attachment.id} href={attachment.file} target="_blank">
          <img src={attachment.thumbnail} alt={attachment.name} className="w-[80px] h-[80px] object-cover" />
        </a>
      ))}
      {maxShown && attachments.length > maxShown && (
        <div className="flex items-center justify-center w-[80px] h-[80px]">+{attachments.length - maxShown} more</div>
      )}
    </div>
  );
};

export default AttachmentGallery;
