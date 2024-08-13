import { useParams } from 'react-router-dom';

const EventDetailAmplitude = () => {
  const { eventId } = useParams();

  return (
    <div>
      <h1>Event Detail Amplitude: {eventId}</h1>
    </div>
  );
};

export default EventDetailAmplitude;
