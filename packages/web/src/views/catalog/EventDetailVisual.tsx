import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import EventDetailErrorMessage from '../../components/Loading/EventDetailErrorMessage';
import EventDetailLoadingIndicator from '../../components/Loading/EventDetailLoadingIndicator';
import { useEventDetailStore } from '../../stores/eventDetail';
import EventDetailVisualExplosion from './EventDetailVisualExplosion';
import EventDetailVisualPyroclasticFlow from './EventDetailVisualPyroclasticFlow';
import EventDetailVisualRockfall from './EventDetailVisualRockfall';
import EventDetailVisualTectonic from './EventDetailVisualTectonic';
import EventDetailVisualVolcanicEmission from './EventDetailVisualVolcanicEmission';

const EventDetailVisual = () => {
  const { eventId } = useParams();
  const { loading, event, error, fetchEvent, hasEventId } = useEventDetailStore();

  useEffect(() => {
    if (eventId && !hasEventId(eventId)) {
      fetchEvent(eventId);
    }
  }, [eventId, fetchEvent, hasEventId]);

  if (loading) {
    return <EventDetailLoadingIndicator message="Loading event details..." />;
  }

  if (error) {
    return <EventDetailErrorMessage message={error} onRetry={() => fetchEvent(eventId!)} />;
  }

  if (!event) {
    return null;
  }

  const observation_type = event.type.observation_type;
  switch (observation_type) {
    case 'explosion':
      return <EventDetailVisualExplosion event={event} />;
    case 'pyroclastic_flow':
      return <EventDetailVisualPyroclasticFlow event={event} />;
    case 'rockfall':
      return <EventDetailVisualRockfall event={event} />;
    case 'tectonic':
      return <EventDetailVisualTectonic event={event} />;
    case 'volcanic_emission':
      return <EventDetailVisualVolcanicEmission event={event} />;
    default:
      return null;
  }
};

export default EventDetailVisual;
