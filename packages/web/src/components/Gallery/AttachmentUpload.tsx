import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  ProgressBar,
  Toast,
  Toaster,
  ToastTitle,
  Tooltip,
  useId,
  useToastController,
} from '@fluentui/react-components';
import { ArrowCounterclockwiseRegular, DeleteRegular, DismissRegular, DocumentRegular, ImageRegular, VideoRegular } from '@fluentui/react-icons';
import React, { useCallback, useState } from 'react';
import { api, baseUrl } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { humanizeFileSize } from '../../shared/file';
import { media } from '../../shared/media';
import { useAuthStore } from '../../stores/auth';
import { Attachment } from '../../types/event';
import { MediaType } from '../../types/media';
import { CustomError, ErrorData } from '../../types/response';
import AttachmentPicker from './AttachmentPicker';

export interface AttachmentUploadProps {
  initialAttachments?: Attachment[];
  label?: string;
  onAdd?: (attachment: Attachment) => void;
  onRemove?: (attachment: Attachment) => void;
}

interface UploadFileOptions {
  mediaType: MediaType;
  file: File;
  accessToken: string;
  controller?: AbortController;
  onProgress?: (progress: number) => void;
}

const uploadFile = async (options: UploadFileOptions): Promise<Attachment> => {
  const { mediaType, file, onProgress, accessToken, controller } = options;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('media_type', mediaType);

  return new Promise<Attachment>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = new URL(`${baseUrl}${apiVersion.uploadEventAttachments.v1}`);
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        onProgress?.(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const attachment: Attachment = JSON.parse(xhr.responseText);
        resolve(attachment);
      } else {
        const error: ErrorData = JSON.parse(xhr.responseText);
        reject(CustomError.fromErrorData(error));
      }
    };

    xhr.onerror = () => {
      reject(new CustomError('Failed to upload file'));
    };

    if (controller) {
      controller.signal.addEventListener('abort', () => {
        xhr.abort();
        reject(new CustomError('Upload cancelled'));
      });
    }

    xhr.send(formData);
  });
};

const deleteEventAttachment = (id: string) => {
  return api(apiVersion.deleteEventAttachment.v1(id), { method: 'DELETE' });
};

interface UploadFileQueue {
  mediaType: MediaType;
  file: File;
  progress: number;
  isFinished?: boolean;
  error?: boolean;
  errorMessage?: string;
  controller?: AbortController;
}

const truncateFileName = (fileName: string, length: number = 15) => {
  if (fileName.length <= length) {
    return fileName;
  }
  return `${fileName.slice(0, length)}...`;
};

const AttachmentUpload: React.FC<AttachmentUploadProps> = ({ initialAttachments = [], label, onAdd, onRemove }) => {
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
  const [uploadingFiles, setUploadingFiles] = useState<UploadFileQueue[]>([]);
  const { token } = useAuthStore();

  const toasterId = useId('attachment-upload');
  const { dispatchToast } = useToastController(toasterId);

  const showErrorToast = useCallback(
    (error: CustomError) => {
      dispatchToast(
        <Toast>
          <ToastTitle>{error.message}</ToastTitle>
        </Toast>,
        { intent: 'error' }
      );
    },
    [dispatchToast]
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<Attachment | null>(null);

  const handleRemoveAttachment = () => {
    if (attachmentToDelete) {
      removeAttachment(attachmentToDelete);
      setAttachmentToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const removeAttachment = (attachment: Attachment) => {
    if (attachment.id) {
      deleteEventAttachment(attachment.id).catch((error) => {
        showErrorToast(error);
      });
    }
    setAttachments((prev) => prev.filter((a) => a.id !== attachment.id));
    onRemove?.(attachment);
  };

  const handleFilesUpload = async (mediaType: MediaType, files: FileList) => {
    const queues: UploadFileQueue[] = Array.from(files).map((file) => {
      const queue: UploadFileQueue = { file, progress: 0, mediaType, error: false, controller: new AbortController(), isFinished: false };
      return queue;
    });
    setUploadingFiles((prev) => [...prev, ...queues]);

    for (const queue of queues) {
      uploadFile({
        onProgress: (progress: number) => {
          queue.progress = progress;
          setUploadingFiles((prev) => [...prev]);
        },
        file: queue.file,
        mediaType: mediaType as MediaType,
        accessToken: token?.access || '',
        controller: queue.controller,
      })
        .then((attachment) => {
          onAdd?.(attachment);
          setAttachments((prev) => [...prev, attachment]);
          setUploadingFiles((prev) => prev.filter((f) => f.file !== queue.file));
        })
        .catch((error) => {
          showErrorToast(error);
          setUploadingFiles((prev) => prev.map((f) => (f.file === queue.file ? { ...f, error: true } : f)));
        })
        .finally(() => {
          setUploadingFiles((prev) => prev.map((f) => (f.file === queue.file ? { ...f, isFinished: true } : f)));
        });
    }
  };

  const retryUpload = async (queue: UploadFileQueue) => {
    setUploadingFiles((prev) => prev.map((f) => (f.file === queue.file ? { ...f, error: false, isFinished: false } : f)));

    uploadFile({
      onProgress: (progress: number) => {
        queue.progress = progress;
        setUploadingFiles((prev) => [...prev]);
      },
      file: queue.file,
      mediaType: queue.mediaType as MediaType,
      accessToken: token?.access || '',
      controller: queue.controller,
    })
      .then((attachment) => {
        onAdd?.(attachment);
        setAttachments((prev) => [...prev, attachment]);
        setUploadingFiles((prev) => prev.filter((f) => f.file !== queue.file));
      })
      .catch((error) => {
        showErrorToast(error);
        setUploadingFiles((prev) => prev.map((f) => (f.file === queue.file ? { ...f, error: true } : f)));
      })
      .finally(() => {
        setUploadingFiles((prev) => prev.map((f) => (f.file === queue.file ? { ...f, isFinished: true } : f)));
      });
  };

  const cancelUpload = (queue: UploadFileQueue) => {
    queue.controller?.abort();
    setUploadingFiles((prev) => prev.filter((f) => f.file !== queue.file));
  };

  const deleteUpload = (queue: UploadFileQueue) => {
    setUploadingFiles((prev) => prev.filter((f) => f.file !== queue.file));
  };

  const isPreviewable = (attachment: Attachment) => {
    return attachment.media_type === 'photo' || attachment.media_type === 'video';
  };

  const renderIcon = (mediaType: MediaType) => {
    if (mediaType === 'photo') {
      return <ImageRegular fontSize={40} />;
    } else if (mediaType === 'video') {
      return <VideoRegular fontSize={40} />;
    } else {
      return <DocumentRegular fontSize={40} />;
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{label}</div>
        <AttachmentPicker onFilesSelected={handleFilesUpload} />
      </div>

      {attachments.length === 0 && uploadingFiles.length === 0 && <div>No files</div>}

      <div className="flex flex-col gap-1">
        {uploadingFiles.map((queue) => (
          <div key={queue.file.name} className="flex h-[80px] items-center">
            <div className="h-[80px] w-[80px] flex items-center justify-center">{renderIcon(queue.mediaType)}</div>

            <div className="flex-grow flex flex-col gap-0 p-2">
              <span className="text-ellipsis text-wrap text-xs">
                {truncateFileName(queue.file.name)} &middot; {humanizeFileSize(queue.file.size)}
              </span>

              <ProgressBar value={queue.progress} max={100} />

              {queue.error ? <span className="text-red-500 text-xs">Upload failed</span> : <span className="text-xs">{Math.round(queue.progress)}%</span>}
            </div>

            <div className="flex flex-col items-center">
              {queue.isFinished ? (
                <>
                  <Tooltip content={'Retry Upload'} showDelay={1500} relationship="label">
                    <Button size="small" appearance="transparent" icon={<ArrowCounterclockwiseRegular fontSize={16} />} onClick={() => retryUpload(queue)} />
                  </Tooltip>

                  <Tooltip content={'Delete upload'} showDelay={1500} relationship="label">
                    <Button size="small" appearance="transparent" icon={<DeleteRegular fontSize={16} />} onClick={() => deleteUpload(queue)} />
                  </Tooltip>
                </>
              ) : (
                <Tooltip content={'Cancel upload'} showDelay={1500} relationship="label">
                  <Button size="small" appearance="transparent" icon={<DismissRegular fontSize={16} />} onClick={() => cancelUpload(queue)} />
                </Tooltip>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        {attachments.map((attachment) => (
          <div key={attachment.id} className="flex h-[80px] items-center">
            <div className="w-[80px] h-[80px] flex items-center justify-center">
              {isPreviewable(attachment) ? (
                <img src={media(attachment.thumbnail)} alt={attachment.name} className="w-[80px] h-[80px] object-cover" />
              ) : (
                <DocumentRegular fontSize={40} />
              )}
            </div>

            <div className="flex-grow flex flex-col gap-0 p-2">
              <span className="text-wrap text-ellipsis">{truncateFileName(attachment.name)}</span>
              <span className="text-xs">{humanizeFileSize(attachment.size)}</span>
            </div>

            <div>
              <Tooltip content={'Remove'} relationship="label" showDelay={1500}>
                <Button
                  size="small"
                  appearance="transparent"
                  icon={<DeleteRegular />}
                  onClick={() => {
                    setAttachmentToDelete(attachment);
                    setDeleteDialogOpen(true);
                  }}
                />
              </Tooltip>
            </div>
          </div>
        ))}
      </div>

      <Toaster toasterId={toasterId} />

      <Dialog open={deleteDialogOpen} onOpenChange={(_, data) => setDeleteDialogOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Delete File</DialogTitle>
            <DialogContent>Are you sure you want this file?</DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary" onClick={() => setDeleteDialogOpen(false)}>
                  No
                </Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleRemoveAttachment}>
                Yes
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default AttachmentUpload;
