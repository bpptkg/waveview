import React, { useCallback, useMemo, useState } from 'react';
import { media } from '../../shared/media';
import { Attachment } from '../../types/event';
import GalleryViewer from './GalleryViewer';

export interface AttachmentGalleryProps {
  attachments: Attachment[];
  maxShown?: number;
}

const AttachmentGallery: React.FC<AttachmentGalleryProps> = (props) => {
  const { attachments, maxShown } = props;
  const [showGallery, setShowGallery] = useState(false);
  const [index, setIndex] = useState(0);

  const items = useMemo(() => {
    if (maxShown) {
      return attachments.slice(0, maxShown);
    }
    return attachments;
  }, [attachments, maxShown]);

  const handleGalleryOpen = useCallback((index: number) => {
    setShowGallery(true);
    setIndex(index);
  }, []);

  return (
    <div className="flex flex-row flex-wrap gap-1">
      {items.map((attachment, index) => (
        <a key={attachment.id} onClick={() => handleGalleryOpen(index)} className="cursor-pointer hover:opacity-80">
          <img src={media(attachment.thumbnail)} alt={attachment.name} className="w-[80px] h-[80px] object-cover" />
        </a>
      ))}
      {maxShown && attachments.length > maxShown && (
        <a className="flex items-center justify-center w-[80px] h-[80px] hover:underline cursor-pointer" onClick={() => handleGalleryOpen(0)}>
          +{attachments.length - maxShown} more
        </a>
      )}
      {showGallery && <GalleryViewer attachments={attachments} index={index} onClose={() => setShowGallery(false)} />}
    </div>
  );
};

export default AttachmentGallery;
