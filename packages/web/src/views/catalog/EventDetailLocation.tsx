import { useParams } from 'react-router-dom';

const EventDetailLocation = () => {
  const { eventId } = useParams();

  return (
    <div>
      <h1>Event Detail Location: {eventId}</h1>
    </div>
  );
};

export default EventDetailLocation;
