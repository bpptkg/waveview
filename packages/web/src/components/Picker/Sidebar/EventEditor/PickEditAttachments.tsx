import { useCallback } from 'react';
import { usePickerStore } from '../../../../stores/picker';
import { Attachment } from '../../../../types/event';
import AttachmentUpload from '../../../Gallery/AttachmentUpload';

const PickEditAttachments = () => {
  const { attachments, addAttachment, removeAttachment } = usePickerStore();
  const handleAttachmentAdd = useCallback(
    (attachment: Attachment) => {
      addAttachment(attachment);
    },
    [addAttachment]
  );

  const handleAttachmentRemove = useCallback(
    (attachment: Attachment) => {
      removeAttachment(attachment.id);
    },
    [removeAttachment]
  );

  return (
    <div className="px-2">
      <AttachmentUpload label="Attachments" initialAttachments={attachments} onAdd={handleAttachmentAdd} onRemove={handleAttachmentRemove} />
    </div>
  );
};

export default PickEditAttachments;
