import { useParams } from 'react-router-dom';

const EventDetailWaveform = () => {
  const { eventId } = useParams();

  return (
    <div>
      <h1>Event Detail Waveform: {eventId}</h1>
    </div>
  );
};

export default EventDetailWaveform;
