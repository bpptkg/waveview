import { Helicorder, HelicorderEventMarkerOptions, HelicorderOptions, SeismogramEventMarkerOptions } from '@waveview/zcharts';
import { useCallback } from 'react';
import { getEventTypeColor } from '../../shared/theme';
import { getPickExtent } from '../../shared/time';
import { useAppStore } from '../../stores/app';
import { useAuthStore } from '../../stores/auth';
import { useCatalogStore } from '../../stores/catalog';
import { useOrganizationStore } from '../../stores/organization';
import { usePickerStore } from '../../stores/picker';
import { useSidebarStore } from '../../stores/sidebar';
import { useVolcanoStore } from '../../stores/volcano/useVolcanoStore';
import { Channel } from '../../types/channel';
import { SeismicEvent, SeismicEventDetail } from '../../types/event';
import { usePickerContext } from './PickerContext';
import { useSeismogramCallback } from './useSeismogramCallback';

export function useHelicorderCallback() {
  const {
    windowSize,
    selectionWindow,
    fetchEditedEvent,
    setHelicorderOffsetDate,
    setHelicorderChannelId,
    setHelicorderInterval,
    setHelicorderDuration,
    setSelectionWindow,
    setSelectedChart,
    fetchEventMarkers,
    setLastSeismogramExtent,
  } = usePickerStore();

  const { heliChartRef, seisChartRef, props } = usePickerContext();

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

  const handleHelicorderFocus = useCallback(() => {
    seisChartRef.current?.blur();
    setSelectedChart('helicorder');
  }, [seisChartRef, setSelectedChart]);

  const handleHelicorderSelectionChange = useCallback(
    (range: [number, number]) => {
      seisChartRef.current?.setExtent(range, { autoZoom: true });
      seisChartRef.current?.clearPickRange();
      setSelectionWindow(range);
      setLastSeismogramExtent(range);
    },
    [seisChartRef, setSelectionWindow, setLastSeismogramExtent]
  );

  const { currentOrganization } = useOrganizationStore();
  const { currentCatalog } = useCatalogStore();
  const { currentVolcano } = useVolcanoStore();
  const { token } = useAuthStore();
  const { darkMode, useUTC } = useAppStore();
  const { event } = props;
  const { eventId, helicorderDuration, helicorderInterval, channelId, offsetDate, eventMarkers } = usePickerStore();
  const { setHeliChartReady } = usePickerContext();
  const { handleSetupEventEditing } = useSeismogramCallback();
  const { setShowSidebar, setSelectedTab } = useSidebarStore();

  const handleSeismogramUpdateEventMarkers = useCallback(() => {
    seisChartRef.current?.clearEventMarkers();

    const markers: SeismogramEventMarkerOptions[] = [];
    eventMarkers.forEach((event) => {
      const [start, end] = getPickExtent(event);
      if (event.id === eventId) {
        return;
      }

      markers.push({
        start,
        end,
        color: getEventTypeColor(event.type, darkMode),
        eventType: event.type.code,
        data: event,
      });
    });
    seisChartRef.current?.addEventMarkers(markers);
  }, [seisChartRef, eventMarkers, darkMode, eventId]);

  const handleHelicorderUpdateEventMarkers = useCallback(async () => {
    heliChartRef.current?.clearEventMarkers();

    const markers: HelicorderEventMarkerOptions[] = [];
    eventMarkers.forEach((event) => {
      const [start, end] = getPickExtent(event);

      markers.push({
        start,
        end,
        color: getEventTypeColor(event.type, darkMode),
        eventType: event.type.code,
        data: event,
      });
    });
    heliChartRef.current?.addEventMarkers(markers);
  }, [heliChartRef, eventMarkers, darkMode]);

  const handleUpdateEventMarkers = useCallback(() => {
    handleSeismogramUpdateEventMarkers();
    handleHelicorderUpdateEventMarkers();
  }, [handleSeismogramUpdateEventMarkers, handleHelicorderUpdateEventMarkers]);

  const handleFetchEvents = useCallback(() => {
    const helicorderExtent = heliChartRef.current?.getChartExtent();
    if (helicorderExtent && currentOrganization && currentVolcano && currentCatalog && token) {
      const [start, end] = helicorderExtent;
      fetchEventMarkers(start, end);
    }
  }, [heliChartRef, currentOrganization, currentVolcano, currentCatalog, token, fetchEventMarkers]);

  const handleHelicorderEventMarkerClick = useCallback(
    (marker: HelicorderEventMarkerOptions) => {
      const event = marker.data as SeismicEvent;
      const { start, end } = marker;
      seisChartRef.current?.removeEventMarker(start, end);
      if (event) {
        fetchEditedEvent(event.id).then((event) => {
          handleSetupEventEditing(event);
          setSelectedTab('eventEditor');
          setShowSidebar(true);
        });
      }
    },
    [seisChartRef, fetchEditedEvent, handleSetupEventEditing, setSelectedTab, setShowSidebar]
  );

  const handleHelicorderOnReady = useCallback(
    (chart: Helicorder) => {
      setHeliChartReady(true);
      async function fetchEvents() {
        const [start, end] = chart.getChartExtent();
        await fetchEventMarkers(start, end);
      }
      fetchEvents();
    },
    [setHeliChartReady, fetchEventMarkers]
  );

  const handleHelicorderSelectOffsetDate = useCallback(
    (date: Date) => {
      const offsetDate = date.getTime();
      heliChartRef.current?.setOffsetDate(offsetDate);
      setHelicorderOffsetDate(offsetDate);
      handleFetchEvents();
    },
    [heliChartRef, setHelicorderOffsetDate, handleFetchEvents]
  );

  const handleHelicorderRefreshData = useCallback(() => {
    heliChartRef.current?.fetchAllData({ mode: 'force' });
    handleFetchEvents();
  }, [heliChartRef, handleFetchEvents]);

  const handleHelicorderAutoUpdate = useCallback(() => {
    heliChartRef.current?.fetchAllData({ mode: 'lazy' });
    handleFetchEvents();
  }, [heliChartRef, handleFetchEvents]);

  const calcHelicorderOffsetDate = (event: SeismicEventDetail) => {
    const [start, end] = getPickExtent(event);
    return new Date((start + end) / 2);
  };

  const getHelicorderInitOptions = useCallback(() => {
    const initialOffsetDate = event ? calcHelicorderOffsetDate(event) : new Date(offsetDate);
    const initOptions: Partial<HelicorderOptions> = {
      interval: helicorderInterval,
      duration: helicorderDuration,
      channel: {
        id: channelId,
      },
      darkMode,
      offsetDate: initialOffsetDate.getTime(),
      grid: {
        top: 30,
        right: 15,
        bottom: 5,
        left: 80,
      },
      devicePixelRatio: window.devicePixelRatio,
      useUTC,
      windowSize,
      selectionWindow,
    };
    return initOptions;
  }, [helicorderDuration, helicorderInterval, channelId, darkMode, offsetDate, useUTC, event, windowSize, selectionWindow]);

  return {
    getHelicorderInitOptions,
    handleHelicorderAutoUpdate,
    handleHelicorderChangeDuration,
    handleHelicorderChangeInterval,
    handleHelicorderChannelChange,
    handleHelicorderDecreaseAmplitude,
    handleHelicorderEventMarkerClick,
    handleHelicorderFocus,
    handleHelicorderIncreaseAmplitude,
    handleHelicorderOnReady,
    handleHelicorderRefreshData,
    handleHelicorderResetAmplitude,
    handleHelicorderSelectionChange,
    handleHelicorderSelectOffsetDate,
    handleHelicorderShiftViewDown,
    handleHelicorderShiftViewToNow,
    handleHelicorderShiftViewUp,
    handleUpdateEventMarkers,
  };
}
