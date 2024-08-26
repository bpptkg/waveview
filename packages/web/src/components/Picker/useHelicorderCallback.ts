import { useCallback, useRef } from 'react';
import { getEventTypeColor } from '../../shared/theme';
import { uuid4 } from '../../shared/uuid';
import { useAppStore } from '../../stores/app';
import { useAuthStore } from '../../stores/auth';
import { useCatalogStore } from '../../stores/catalog';
import { useOrganizationStore } from '../../stores/organization';
import { usePickerStore } from '../../stores/picker';
import { Channel } from '../../types/channel';
import { EventResponseData } from '../../types/fetcher';
import { usePickerContext } from './PickerContext';
import { useFetcherWorker } from './useFetchWorker';

export function useHelicorderCallback() {
  const {
    eventMarkers,
    addEventMarker,
    clearEventMarkers,
    setHelicorderOffsetDate,
    setHelicorderChannelId,
    setHelicorderInterval,
    setHelicorderDuration,
    setLastTrackExtent,
    seismogramToolbarRemoveCheckedValue,
    setSelectedChart,
    setLastSelection,
    fetchEventMarkers,
  } = usePickerStore();

  const { heliChartRef, seisChartRef, setHeliChartReady } = usePickerContext();
  const selectingTrackRef = useRef<boolean | null>(null);

  const handleHelicorderShiftViewUp = useCallback(() => {
    heliChartRef.current?.shiftViewUp();
  }, [heliChartRef]);

  const handleHelicorderShiftViewDown = useCallback(() => {
    heliChartRef.current?.shiftViewDown();
  }, [heliChartRef]);

  const handleHelicorderShiftViewToNow = useCallback(() => {
    const now = Date.now();
    heliChartRef.current?.setOffsetDate(now);
    setHelicorderOffsetDate(now);
  }, [heliChartRef, setHelicorderOffsetDate]);

  const handleHelicorderIncreaseAmplitude = useCallback(() => {
    heliChartRef.current?.increaseAmplitude(0.1);
  }, [heliChartRef]);

  const handleHelicorderDecreaseAmplitude = useCallback(() => {
    heliChartRef.current?.decreaseAmplitude(0.1);
  }, [heliChartRef]);

  const handleHelicorderResetAmplitude = useCallback(() => {
    heliChartRef.current?.resetAmplitude();
  }, [heliChartRef]);

  const handleHelicorderChannelChange = useCallback(
    (channel: Channel) => {
      setHelicorderChannelId(channel.id);
      heliChartRef.current?.setChannel({ id: channel.id, label: channel.stream_id });
    },
    [heliChartRef, setHelicorderChannelId]
  );

  const handleHelicorderChangeInterval = useCallback(
    (interval: number) => {
      setHelicorderInterval(interval);
      heliChartRef.current?.setInterval(interval);
    },
    [heliChartRef, setHelicorderInterval]
  );

  const handleHelicorderChangeDuration = useCallback(
    (duration: number) => {
      setHelicorderDuration(duration);
      heliChartRef.current?.setDuration(duration);
    },
    [heliChartRef, setHelicorderDuration]
  );

  const handleTrackSelected = useCallback(
    (trackIndex: number) => {
      if (selectingTrackRef.current) {
        return;
      }

      if (heliChartRef.current && seisChartRef.current) {
        const extent = heliChartRef.current.getTrackExtent(trackIndex);
        seisChartRef.current.setExtent(extent);

        setLastTrackExtent(extent);
      }
    },
    [heliChartRef, seisChartRef, setLastTrackExtent]
  );

  const handleHelicorderFocus = useCallback(() => {
    seisChartRef.current?.blur();
    seisChartRef.current?.deactivateZoomRectangle();
    seismogramToolbarRemoveCheckedValue('options', 'zoom-rectangle');
    setSelectedChart('helicorder');
  }, [seisChartRef, seismogramToolbarRemoveCheckedValue, setSelectedChart]);

  const handleHelicorderOffsetChange = useCallback(
    (date: number) => {
      setHelicorderOffsetDate(date);
    },
    [setHelicorderOffsetDate]
  );

  const handleHelicorderSelectionChange = useCallback(
    (selection: number) => {
      setLastSelection(selection);
    },
    [setLastSelection]
  );

  const handleHelicorderOnReady = useCallback(() => {
    setHeliChartReady(true);

    async function fetchEvents() {
      const helicorderExtent = heliChartRef.current?.getChartExtent();
      if (helicorderExtent) {
        await fetchEventMarkers(helicorderExtent[0], helicorderExtent[1]);
      }
    }
    fetchEvents();
  }, [heliChartRef, fetchEventMarkers, setHeliChartReady]);

  const { currentOrganization } = useOrganizationStore();
  const { currentCatalog } = useCatalogStore();
  const { token } = useAuthStore();
  const { darkMode } = useAppStore();
  const { props } = usePickerContext();
  const { showEventMarkers } = props;

  const handlePlotEventMarkers = useCallback(() => {
    eventMarkers.forEach((event) => {
      const color = getEventTypeColor(event.type, darkMode);
      heliChartRef.current?.addEventMarker({ value: new Date(event.time).getTime(), color, width: 3 });
      seisChartRef.current?.addEventMarker({
        start: new Date(event.time).getTime(),
        end: new Date(event.time).getTime() + event.duration * 1_000,
        color,
      });
    });
  }, [seisChartRef, heliChartRef, eventMarkers, darkMode]);

  const { fetcherWorkerRef } = useFetcherWorker({
    onMessage: (event: EventResponseData) => {
      if (!showEventMarkers) {
        return;
      }

      clearEventMarkers();

      const { events } = event;
      events.forEach((event) => {
        addEventMarker(event);
      });

      heliChartRef.current?.clearAllEventMarkers();
      seisChartRef.current?.clearAllEventMarkers();

      handlePlotEventMarkers();
    },
  });

  const handleFetchEvents = useCallback(() => {
    const helicorderExtent = heliChartRef.current?.getChartExtent();
    if (helicorderExtent && currentOrganization && currentCatalog && token) {
      const [start, end] = helicorderExtent;

      fetcherWorkerRef.current?.fetchEvents({
        requestId: uuid4(),
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
        organizationId: currentOrganization.id,
        catalogId: currentCatalog.id,
        accessToken: token.access,
      });
    }
  }, [heliChartRef, fetcherWorkerRef, currentOrganization, currentCatalog, token]);

  const handleHelicorderSelectOffsetDate = useCallback(
    (date: Date) => {
      const offsetDate = date.getTime();
      heliChartRef.current?.setOffsetDate(offsetDate);
      handleFetchEvents();
    },
    [heliChartRef, handleFetchEvents]
  );

  return {
    handleHelicorderShiftViewUp,
    handleHelicorderShiftViewDown,
    handleHelicorderShiftViewToNow,
    handleHelicorderIncreaseAmplitude,
    handleHelicorderDecreaseAmplitude,
    handleHelicorderResetAmplitude,
    handleHelicorderChannelChange,
    handleHelicorderChangeInterval,
    handleHelicorderChangeDuration,
    handleHelicorderSelectOffsetDate,
    handleTrackSelected,
    handleHelicorderFocus,
    handleHelicorderOffsetChange,
    handleHelicorderSelectionChange,
    handleHelicorderOnReady,
    handlePlotEventMarkers,
  };
}
