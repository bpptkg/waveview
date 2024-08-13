import { Avatar, Divider, Tooltip } from '@fluentui/react-components';
import { formatDistanceToNow } from 'date-fns';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import EventDetailErrorMessage from '../../components/Loading/EventDetailErrorMessage';
import EventDetailLoadingIndicator from '../../components/Loading/EventDetailLoadingIndicator';
import { useEventDetailStore } from '../../stores/eventDetail';

const EventDetailSummary = () => {
  const { eventId } = useParams();
  const { loading, event, error, fetchEvent, hasEventId, getStationOfFirstArrival } = useEventDetailStore();

  useEffect(() => {
    if (eventId && !hasEventId(eventId)) {
      fetchEvent(eventId);
    }
  }, [eventId, fetchEvent, hasEventId]);

  const firstArrivalStation = getStationOfFirstArrival();

  if (loading) {
    return <EventDetailLoadingIndicator message="Loading event details..." />;
  }

  if (error) {
    return <EventDetailErrorMessage message={error} onRetry={() => fetchEvent(eventId!)} />;
  }

  return (
    <div className="p-2 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>Event ID</div>
        <div>{eventId}</div>
      </div>
      <Divider />
      <div className="font-semibold">Event</div>
      <div className="flex items-center justify-between">
        <div>Station of first arrival</div>
        <div>{firstArrivalStation}</div>
      </div>
      <div className="flex items-center justify-between">
        <div>Time</div>
        <div>{event?.time}</div>
      </div>
      <div className="flex items-center justify-between">
        <div>Duration (s)</div>
        <div>{event?.duration}</div>
      </div>
      <div className="flex items-center justify-between">
        <div>Event type</div>
        <div>{event?.type.code}</div>
      </div>
      <div className="flex flex-col">
        <div>Note</div>
        <div>{event?.note}</div>
      </div>
      <Divider />
      <div className="font-semibold">Amplitude</div>
      <div className="flex items-center justify-between">
        <div>Amplitude</div>
        <div>{event?.preferred_amplitude?.amplitude}</div>
      </div>
      <Divider />
      <div className="font-semibold">Magnitude</div>
      <div className="flex items-center justify-between">
        <div>Magnitude</div>
        <div>{event?.preferred_magnitude?.magnitude}</div>
      </div>
      <Divider />
      <div className="font-semibold">Location</div>
      <div className="flex items-center justify-between">
        <div>Latitude</div>
        <div>{event?.preferred_origin?.latitude}</div>
      </div>
      <div className="flex items-center justify-between">
        <div>Longitude</div>
        <div>{event?.preferred_origin?.longitude}</div>
      </div>
      <div className="flex items-center justify-between">
        <div>Depth</div>
        <div>{event?.preferred_origin?.depth}</div>
      </div>
      <Divider />
      <div className="font-semibold">Attachments</div>
      <div>TODO</div>
      <Divider />
      <div className="font-semibold">Evaluation</div>
      <div className="flex items-center justify-between">
        <div>Status</div>
        <div>{event?.evaluation_status}</div>
      </div>
      <div className="flex items-center justify-between">
        <div>Mode</div>
        <div>{event?.evaluation_mode}</div>
      </div>
      <div className="flex items-center justify-between">
        <div>Method</div>
        <div>{event?.method}</div>
      </div>
      <div className="flex items-center justify-between">
        <div>Author</div>
        <div>
          <Tooltip content={event?.author.name || ''} relationship="label">
            <Avatar aria-label={event?.author.name} name={event?.author.name} color="colorful" image={{ src: event?.author.avatar }} />
          </Tooltip>
        </div>
      </div>
      <Divider />
      <div className="flex items-center justify-between">
        <div>Last updated</div>
        <div>
          <Tooltip content={event?.updated_at || ''} relationship="label">
            <span>{event?.updated_at ? formatDistanceToNow(new Date(event.updated_at), { addSuffix: true }) : ''}</span>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default EventDetailSummary;
