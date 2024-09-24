import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import EventDetailErrorMessage from '../../components/Loading/EventDetailErrorMessage';
import EventDetailLoadingIndicator from '../../components/Loading/EventDetailLoadingIndicator';
import { SeismogramChart, SeismogramChartRef } from '../../components/Picker/SeismogramChart';
import { getEventTypeColor } from '../../shared/theme';
import { getPickExtent } from '../../shared/time';
import { useAppStore } from '../../stores/app';
import { useEventDetailStore } from '../../stores/eventDetail';
import { usePickerStore } from '../../stores/picker';

const MARGIN = 10 * 1_000; // 10 seconds

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

  const initOptions = useMemo(() => {
    const [start, end] = event ? getPickExtent(event) : [0, 0];
    const startTime = start - MARGIN;
    const endTime = end + MARGIN;

    return {
      channels: selectedChannels.map((item) => ({
        id: item.channel.id,
        label: item.channel.net_sta_code,
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
    };
  }, [event, selectedChannels, darkMode]);

  const handleSeismogramChartReady = () => {
    setReady(true);
    if (event) {
      const [start, end] = getPickExtent(event);

      chartRef.current?.addEventMarker({
        start,
        end,
        color: getEventTypeColor(event.type, darkMode),
      });
    }
  };

  if (loading) {
    return <EventDetailLoadingIndicator message="Loading event details..." />;
  }

  if (error) {
    return <EventDetailErrorMessage message={error} onRetry={() => fetchEvent(eventId!)} />;
  }

  return <div className="relative h-full">{event && <SeismogramChart ref={chartRef} initOptions={initOptions} onReady={handleSeismogramChartReady} />}</div>;
};

export default EventDetailWaveform;
