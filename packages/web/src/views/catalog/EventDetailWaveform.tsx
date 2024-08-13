import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import EventDetailErrorMessage from '../../components/Loading/EventDetailErrorMessage';
import EventDetailLoadingIndicator from '../../components/Loading/EventDetailLoadingIndicator';
import { SeismogramChart, SeismogramChartRef } from '../../components/Picker/SeismogramChart';
import { useAppStore } from '../../stores/app';
import { useEventDetailStore } from '../../stores/eventDetail';
import { usePickerStore } from '../../stores/picker';

const EventDetailWaveform = () => {
  const chartRef = useRef<SeismogramChartRef | null>(null);

  const { eventId } = useParams();
  const { loading, error, event, fetchEvent, hasEventId } = useEventDetailStore();

  const { selectedChannels } = usePickerStore();
  const { darkMode } = useAppStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (eventId && !hasEventId(eventId)) {
      fetchEvent(eventId);
    }
  }, [eventId, fetchEvent, hasEventId]);

  const startTime = useMemo(() => {
    if (!event) {
      return 0;
    }
    return new Date(event.time).getTime() - 5_000;
  }, [event]);

  const endTime = useMemo(() => {
    if (!event) {
      return startTime;
    }
    return startTime + event.duration * 1000;
  }, [event, startTime]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (darkMode) {
      chartRef.current?.setTheme('dark');
    } else {
      chartRef.current?.setTheme('light');
    }
  }, [darkMode, ready]);

  if (loading) {
    return <EventDetailLoadingIndicator message="Loading event details..." />;
  }

  if (error) {
    return <EventDetailErrorMessage message={error} onRetry={() => fetchEvent(eventId!)} />;
  }

  return (
    <div className="relative h-full">
      {event && (
        <SeismogramChart
          ref={chartRef}
          initOptions={{
            channels: selectedChannels.map((channel) => ({
              id: channel.id,
              label: channel.network_station_code,
            })),
            grid: {
              top: 30,
              right: 20,
              bottom: 5,
              left: 80,
            },
            darkMode,
            devicePixelRatio: window.devicePixelRatio,
            startTime,
            endTime,
            useUTC: true,
          }}
          onReady={() => {
            setReady(true);
          }}
        />
      )}
    </div>
  );
};

export default EventDetailWaveform;
