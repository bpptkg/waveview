import { Button, MenuItem, MenuList, Popover, PopoverSurface, PopoverTrigger, Tooltip } from '@fluentui/react-components';
import { AddRegular, DocumentAddRegular, ImageAddRegular, VideoAddRegular } from '@fluentui/react-icons';
import React, { useRef, useState } from 'react';
import { MediaType } from '../../types/media';

export interface AttachmentPickerProps {
  onFilesSelected?: (mediaType: MediaType, files: FileList) => void;
}

const AttachmentPicker: React.FC<AttachmentPickerProps> = ({ onFilesSelected }) => {
  const [open, setOpen] = useState(false);
  const photoRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLInputElement | null>(null);
  const documentRef = useRef<HTMLInputElement | null>(null);

  const [selectedFileType, setSelectedFileType] = useState<MediaType | null>(null);

  const reset = () => {
    setSelectedFileType(null);
    photoRef.current?.value && (photoRef.current.value = '');
    videoRef.current?.value && (videoRef.current.value = '');
    documentRef.current?.value && (documentRef.current.value = '');
  };

  const handleMenuItemClick = (fileType: MediaType) => {
    reset();
    setSelectedFileType(fileType);
    if (fileType === 'photo') {
      photoRef.current?.click();
    } else if (fileType === 'video') {
      videoRef.current?.click();
    } else if (fileType === 'document') {
      documentRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (selectedFileType && files && files.length > 0) {
      onFilesSelected?.(selectedFileType, files);
    }
  };

  return (
    <div>
      <Popover trapFocus open={open} onOpenChange={() => setOpen(!open)}>
        <PopoverTrigger>
          <Tooltip content="Add attachment" relationship="label" showDelay={1500}>
            <Button appearance="transparent" icon={<AddRegular fontSize={20} />} />
          </Tooltip>
        </PopoverTrigger>
        <PopoverSurface>
          <MenuList>
            <MenuItem icon={<ImageAddRegular fontSize={20} />} onClick={() => handleMenuItemClick('photo')}>
              Photos
            </MenuItem>
            <MenuItem icon={<VideoAddRegular fontSize={20} />} onClick={() => handleMenuItemClick('video')}>
              Videos
            </MenuItem>
            <MenuItem icon={<DocumentAddRegular fontSize={20} />} onClick={() => handleMenuItemClick('document')}>
              Documents
            </MenuItem>
          </MenuList>
        </PopoverSurface>
      </Popover>

      <input ref={photoRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} accept="image/*" multiple />
      <input ref={videoRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} accept="video/*" multiple />
      <input ref={documentRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} accept="*/*" multiple />
    </div>
  );
};

export default AttachmentPicker;
