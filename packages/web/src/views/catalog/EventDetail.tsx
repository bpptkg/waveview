import { Button, Tab, TabList, TabListProps } from '@fluentui/react-components';
import { Dismiss20Regular, Edit20Regular, MoreHorizontal20Regular, ShareIos20Regular, Star20Regular } from '@fluentui/react-icons';
import React from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

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

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-md font-semibold p-4">Event Detail</h2>
        <div className="flex items-center">
          <Button icon={<Star20Regular />} appearance="transparent" />
          <Button icon={<Edit20Regular />} appearance="transparent" />
          <Button icon={<ShareIos20Regular />} appearance="transparent" />
          <Button icon={<MoreHorizontal20Regular />} appearance="transparent" />
          <Button icon={<Dismiss20Regular />} appearance="transparent" onClick={handleClose} />
        </div>
      </div>
      <hr />
      <TabList onTabSelect={handleTabSelect} selectedValue={location.pathname}>
        <Tab value={`/catalog/events/${eventId}/summary`}>Summary</Tab>
        <Tab value={`/catalog/events/${eventId}/amplitude`}>Amplitude</Tab>
        <Tab value={`/catalog/events/${eventId}/magnitude`}>Magnitude</Tab>
        <Tab value={`/catalog/events/${eventId}/location`}>Location</Tab>
        <Tab value={`/catalog/events/${eventId}/waveform`}>Waveform</Tab>
        <Tab value={`/catalog/events/${eventId}/attachments`}>Attachments</Tab>
      </TabList>
      <Outlet />
    </>
  );
};

export default EventDetail;
