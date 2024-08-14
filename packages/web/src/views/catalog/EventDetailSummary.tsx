import { Avatar, Divider, Image, Tooltip } from '@fluentui/react-components';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useMemo } from 'react';
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
  const attachments = useMemo(() => {
    if (!event) {
      return [];
    }
    return event?.attachments.filter((attachment) => attachment.media_type === 'photo');
  }, [event]);

  if (loading) {
    return <EventDetailLoadingIndicator message="Loading event details..." />;
  }

  if (error) {
    return <EventDetailErrorMessage message={error} onRetry={() => fetchEvent(eventId!)} />;
  }

  return (
    <div className="p-2 flex flex-col gap-2 mr-2">
      <div>
        <div className="flex items-center justify-between">
          <div>Event ID</div>
          <div>{eventId}</div>
        </div>
      </div>
      <Divider />
      <div className="flex flex-col gap-2">
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
          <div>Duration</div>
          <div>{event?.duration} sec</div>
        </div>
        <div className="flex items-center justify-between">
          <div>Event type</div>
          <div>{event?.type.code}</div>
        </div>
        <div className="flex flex-col">
          <div>Note</div>
          <div>{event?.note}</div>
        </div>
      </div>
      <Divider />
      <div className="flex flex-col gap-2">
        <div className="font-semibold">Amplitude</div>
        {event?.preferred_amplitude ? (
          <div className="flex items-center justify-between">
            <div>{event.preferred_amplitude.type}</div>
            <div>
              {event.preferred_amplitude.amplitude} {event.preferred_amplitude.unit}
            </div>
          </div>
        ) : (
          <div>No data</div>
        )}
      </div>

      <Divider />
      <div className="flex flex-col gap-2">
        <div className="font-semibold">Magnitude</div>
        {event?.preferred_magnitude ? (
          <div className="flex items-center justify-between">
            <div>{event.preferred_magnitude.type}</div>
            <div>{event.preferred_magnitude.magnitude}</div>
          </div>
        ) : (
          <div>No data</div>
        )}
      </div>
      <Divider />
      <div className="flex flex-col gap-2">
        <div className="font-semibold">Location</div>
        <div className="flex items-center justify-between">
          <div>Latitude</div>
          {event?.preferred_origin ? <div>{event.preferred_origin?.latitude} deg</div> : <div>No data</div>}
        </div>
        <div className="flex items-center justify-between">
          <div>Longitude</div>
          {event?.preferred_origin ? <div>{event.preferred_origin?.longitude} deg</div> : <div>No data</div>}
        </div>
        <div className="flex items-center justify-between">
          <div>Depth</div>
          {event?.preferred_origin ? <div>{event.preferred_origin?.depth} km</div> : <div>No data</div>}
        </div>
      </div>
      <Divider />
      <div className="flex flex-col gap-2">
        <div className="font-semibold">Attachments</div>
        {attachments && attachments.length ? (
          <div className="flex flex-row gap-1">
            {attachments.slice(0, 5).map((attachment) => (
              <div key={attachment.id} className="w-[80px] h-[80px]">
                <Image src={attachment.file} alt={attachment.name} fit="cover" shape="rounded" />
              </div>
            ))}
            {attachments.length > 5 && <div className="flex items-center justify-center w-[80px] h-[80px]">and {attachments.length - 5} more</div>}
          </div>
        ) : (
          <div>No attachments</div>
        )}
      </div>
      <Divider />
      <div className="flex flex-col gap-2">
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
      </div>
      <Divider />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>Last updated</div>
          <div>
            <Tooltip content={event?.updated_at || ''} relationship="label">
              <span>{event?.updated_at ? formatDistanceToNow(new Date(event.updated_at), { addSuffix: true }) : ''}</span>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailSummary;
