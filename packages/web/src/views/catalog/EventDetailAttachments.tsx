import { useParams } from 'react-router-dom';

const EventDetailAttachments = () => {
  const { eventId } = useParams();

  return (
    <div>
      <h1>Event Detail Attachment: {eventId}</h1>
    </div>
  );
};

export default EventDetailAttachments;
