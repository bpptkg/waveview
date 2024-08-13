import { Button, Divider, Tab, TabList, TabListProps, Toast, Toaster, ToastTitle, useId, useToastController } from '@fluentui/react-components';
import { Dismiss20Regular, Edit20Regular, MoreHorizontal20Regular, ShareIos20Regular, Star20Filled, Star20Regular } from '@fluentui/react-icons';
import React, { useCallback } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEventDetailStore } from '../../stores/eventDetail';

export interface EventDetailProps {}

const EventDetail: React.FC<EventDetailProps> = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabSelect: TabListProps['onTabSelect'] = (_, data) => {
    navigate(data.value as string);
  };

  const handleClose = () => {
    navigate('/catalog/events');
  };

  const toasterId = useId('event-detail');
  const { dispatchToast } = useToastController(toasterId);

  const { event, bookmarkEvent } = useEventDetailStore();

  const handleToggleBookmark = useCallback(() => {
    bookmarkEvent().catch(() => {
      dispatchToast(
        <Toast>
          <ToastTitle>Failed to bookmark the event.</ToastTitle>
        </Toast>,
        { intent: 'error' }
      );
    });
  }, [bookmarkEvent, dispatchToast]);

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-md font-semibold p-4">Event Detail</h2>
        <div className="flex items-center">
          <Button icon={event?.is_bookmarked ? <Star20Filled color="orange" /> : <Star20Regular />} appearance="transparent" onClick={handleToggleBookmark} />
          <Button icon={<Edit20Regular />} appearance="transparent" />
          <Button icon={<ShareIos20Regular />} appearance="transparent" />
          <Button icon={<MoreHorizontal20Regular />} appearance="transparent" />
          <Button icon={<Dismiss20Regular />} appearance="transparent" onClick={handleClose} />
        </div>
      </div>
      <Divider />
      <TabList onTabSelect={handleTabSelect} selectedValue={location.pathname}>
        <Tab value={`/catalog/events/${eventId}/summary`}>Summary</Tab>
        <Tab value={`/catalog/events/${eventId}/amplitude`}>Amplitude</Tab>
        <Tab value={`/catalog/events/${eventId}/magnitude`}>Magnitude</Tab>
        <Tab value={`/catalog/events/${eventId}/location`}>Location</Tab>
        <Tab value={`/catalog/events/${eventId}/waveform`}>Waveform</Tab>
        <Tab value={`/catalog/events/${eventId}/attachments`}>Attachments</Tab>
      </TabList>
      <Outlet />
      <Toaster toasterId={toasterId} />
    </>
  );
};

export default EventDetail;
