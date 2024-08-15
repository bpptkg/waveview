import { Tab, TabList, TabListProps } from '@fluentui/react-components';
import { AttachRegular } from '@fluentui/react-icons';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AttachmentGallery from '../../components/Gallery/AttachmentGallery';
import EventDetailErrorMessage from '../../components/Loading/EventDetailErrorMessage';
import EventDetailLoadingIndicator from '../../components/Loading/EventDetailLoadingIndicator';
import { humanizeFileSize } from '../../shared/file';
import { useEventDetailStore } from '../../stores/eventDetail';

type AttachmentType = 'photo' | 'video' | 'audio' | 'document';

const EventDetailAttachments = () => {
  const { eventId } = useParams();
  const { loading, event, error, fetchEvent, hasEventId } = useEventDetailStore();

  useEffect(() => {
    if (eventId && !hasEventId(eventId)) {
      fetchEvent(eventId);
    }
  }, [eventId, fetchEvent, hasEventId]);

  const photos = useMemo(() => {
    if (!event) {
      return [];
    }
    return event?.attachments
      .filter((attachment) => attachment.media_type === 'photo')
      .sort((a, b) => new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime());
  }, [event]);

  const videos = useMemo(() => {
    if (!event) {
      return [];
    }
    return event?.attachments
      .filter((attachment) => attachment.media_type === 'video')
      .sort((a, b) => new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime());
  }, [event]);

  const documents = useMemo(() => {
    if (!event) {
      return [];
    }
    return event?.attachments
      .filter((attachment) => attachment.media_type === 'document')
      .sort((a, b) => new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime());
  }, [event]);

  const [tab, setTab] = useState<AttachmentType>('photo');

  const handleTabSelect: TabListProps['onTabSelect'] = (_, data) => {
    setTab(data.value as AttachmentType);
  };

  if (loading) {
    return <EventDetailLoadingIndicator message="Loading event details..." />;
  }

  if (error) {
    return <EventDetailErrorMessage message={error} onRetry={() => fetchEvent(eventId!)} />;
  }

  return (
    <div className="px-2">
      <TabList onTabSelect={handleTabSelect} defaultSelectedValue={'photo'}>
        <div className="flex justify-between items-center w-full">
          <div className="flex">
            <Tab value="photo">Photos</Tab>
            <Tab value="video">Videos</Tab>
            <Tab value="document">Documents</Tab>
          </div>
        </div>
      </TabList>
      <div className="mt-2">
        {tab === 'photo' && (photos && photos.length ? <AttachmentGallery attachments={photos} /> : <div>No photos</div>)}
        {tab == 'video' && (videos && videos.length ? <AttachmentGallery attachments={videos} /> : <div>No videos</div>)}
        {tab === 'document' && (
          <div className="flex flex-col gap-2">
            {documents && documents.length ? (
              <div className="flex flex-col flex-wrap gap-1">
                {documents.map((attachment) => (
                  <div key={attachment.id} className="flex items-center gap-2">
                    <a href={attachment.file} target="_blank" className="w-[48px] h-[48px] flex items-center justify-center border rounded-md">
                      <AttachRegular fontSize={36} />
                    </a>
                    <div>
                      <div>{attachment.name}</div>
                      <div>{humanizeFileSize(attachment.size)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>No documents</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailAttachments;
