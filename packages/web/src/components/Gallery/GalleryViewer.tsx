import { Button, FluentProvider, Tooltip } from '@fluentui/react-components';
import { ArrowDownloadRegular, ChevronLeftRegular, ChevronRightRegular } from '@fluentui/react-icons';
import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { media } from '../../shared/media';
import { themes } from '../../theme';
import { Attachment } from '../../types/event';

export interface GalleryViewerProps {
  attachments?: Attachment[];
  index?: number;
  onClose?: () => void;
}

const GalleryViewer: React.FC<GalleryViewerProps> = (props) => {
  const { attachments = [], index = 0, onClose } = props;
  const [selectedIndex, setSelectedIndex] = useState(index);

  const supportedAttachments = useMemo(
    () => attachments.filter((attachment) => attachment.media_type === 'photo' || attachment.media_type === 'video'),
    [attachments]
  );

  const selected = useMemo(() => supportedAttachments[selectedIndex], [supportedAttachments, selectedIndex]);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleDownload = useCallback(() => {
    const selected = supportedAttachments[index];
    if (selected) {
      window.open(media(selected.file), '_blank');
    }
  }, [supportedAttachments, index]);

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleSelectNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % supportedAttachments.length);
  }, [supportedAttachments]);

  const handleSelectPrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + supportedAttachments.length) % supportedAttachments.length);
  }, [supportedAttachments]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handleSelectPrevious();
      } else if (event.key === 'ArrowRight') {
        handleSelectNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSelectNext, handleSelectPrevious]);

  return ReactDOM.createPortal(
    <FluentProvider theme={themes.defaultDark}>
      <div className="w-screen h-screen absolute top-0 right-0 bottom-0 left-0 z-[9999] bg-neutral-grey-12 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between relative px-2 py-1">
          <span className="text-white p-2">Gallery</span>
          <div className="flex gap-2">
            <Tooltip content="Download" relationship="label" showDelay={1500}>
              <Button onClick={handleDownload} appearance="transparent" icon={<ArrowDownloadRegular />} />
            </Tooltip>
            <Button onClick={handleClose} appearance="outline">
              Close
            </Button>
          </div>
        </div>
        <div className="flex-1 flex flex-row relative bg-neutral-grey-16">
          <div className="flex flex-col justify-center items-center w-12">
            <Button icon={<ChevronLeftRegular fontSize={32} />} appearance="outline" onClick={handleSelectPrevious} />
          </div>
          <div className="flex-1">
            <div className="flex justify-center items-center h-[80vh]">
              {selected.media_type === 'photo' ? (
                <img src={media(selected.file)} alt={selected.name} className="w-full h-full object-contain" />
              ) : selected.media_type === 'video' ? (
                <video src={media(selected.file)} controls className="w-full h-full object-contain" />
              ) : (
                <div>Unsupported media type</div>
              )}
            </div>
          </div>
          <div className="flex flex-col justify-center items-center w-12">
            <Button icon={<ChevronRightRegular fontSize={32} />} appearance="outline" onClick={handleSelectNext} />
          </div>
        </div>
        <div className="w-full overflow-hidden relative h-[96px]">
          <div className="absolute top-0 right-0 bottom-[-16px] left-0 overflow-x-scroll">
            <div className="flex flex-row gap-2">
              {supportedAttachments.map((attachment, index) => (
                <button
                  className={classNames(
                    'min-w-[78px] max-w-[78px] items-center justify-center bg-lightgray border-2 hover:opacity-80',
                    selectedIndex === index ? 'border-primary' : 'border-transparent'
                  )}
                  onClick={() => handleSelect(index)}
                >
                  <img src={media(attachment.thumbnail)} alt={attachment.name} className="w-[78px] h-[78px] object-cover p-1" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FluentProvider>,
    document.getElementById('root')!
  );
};

export default GalleryViewer;
