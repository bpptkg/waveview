import { useParams } from 'react-router-dom';

const EventDetailMagnitude = () => {
  const { eventId } = useParams();

  return (
    <div>
      <h1>Event Detail Magnitude: {eventId}</h1>
    </div>
  );
};

export default EventDetailMagnitude;
