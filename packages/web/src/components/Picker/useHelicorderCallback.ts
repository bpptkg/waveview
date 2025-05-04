import { Helicorder, HelicorderEventMarkerOptions, HelicorderOptions, SeismogramEventMarkerOptions } from '@waveview/zcharts';
import { debounce } from 'lodash';
import { useCallback } from 'react';
import { getEventTypeColor } from '../../shared/theme';
import { getPickExtent, ONE_MINUTE } from '../../shared/time';
import { useAppStore } from '../../stores/app';
import { useAuthStore } from '../../stores/auth';
import { useCatalogStore } from '../../stores/catalog';
import { useOrganizationStore } from '../../stores/organization';
import { usePickerStore } from '../../stores/picker';
import { useSidebarStore } from '../../stores/sidebar';
import { useVolcanoStore } from '../../stores/volcano/useVolcanoStore';
import { Channel } from '../../types/channel';
import { SeismicEvent } from '../../types/event';
import { ScalingType } from '../../types/scaling';
import { usePickerContext } from './PickerContext';
import { useSeismogramCallback } from './useSeismogramCallback';

interface HandleFetchEventsOptions {
  before?: () => void;
  after?: () => void;
  debounce?: boolean;
}

export function useHelicorderCallback() {
  const {
    windowSize,
    selectionWindow,
    fetchEditedEvent,
    fetchEventMarkers,
    getHelicorderScalingType,
    helicorderToolbarSetCheckedValues,
    setHelicorderChannelId,
    setHelicorderDuration,
    setHelicorderInterval,
    setHelicorderLoading,
    setHelicorderOffsetDate,
    setLastSeismogramExtent,
    setSelectedChart,
    setSelectionWindow,
  } = usePickerStore();
  const { heliChartRef, seisChartRef } = usePickerContext();
  const { currentOrganization } = useOrganizationStore();
  const { currentCatalog } = useCatalogStore();
  const { currentVolcano } = useVolcanoStore();
  const { token } = useAuthStore();
  const { darkMode, useUTC } = useAppStore();
  const { eventId, helicorderDuration, helicorderInterval, channelId, offsetDate, eventMarkers, showEvent } = usePickerStore();
  const { setHeliChartReady } = usePickerContext();
  const { handleSetupEventEditing } = useSeismogramCallback();
  const { setShowSidebar, setSelectedTab } = useSidebarStore();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchEventMarkers = useCallback(
    debounce((start: number, end: number, after?: () => void) => {
      fetchEventMarkers(start, end).then(() => {
        if (after) after();
      });
    }, 500),
    [fetchEventMarkers]
  );

  const handleFetchEvents = useCallback(
    (options?: HandleFetchEventsOptions) => {
      const { before, after, debounce } = options || {};
      const helicorderExtent = heliChartRef.current?.getChartExtent();
      if (helicorderExtent && currentOrganization && currentVolcano && currentCatalog && token) {
        const [start, end] = helicorderExtent;
        if (before) before();

        if (debounce) {
          debouncedFetchEventMarkers(start, end, after);
        } else {
          fetchEventMarkers(start, end).then(() => {
            if (after) after();
          });
        }
      }
    },
    [heliChartRef, currentOrganization, currentVolcano, currentCatalog, token, fetchEventMarkers, debouncedFetchEventMarkers]
  );

  const handleHelicorderShiftViewUp = useCallback(() => {
    heliChartRef.current?.shiftViewUp();
    heliChartRef.current?.render();
    heliChartRef.current?.fetchAllData({ debounce: true });
    handleFetchEvents({ debounce: true });
  }, [heliChartRef, handleFetchEvents]);

  const handleHelicorderShiftViewDown = useCallback(() => {
    heliChartRef.current?.shiftViewDown();
    heliChartRef.current?.render();
    heliChartRef.current?.fetchAllData({ debounce: true });
    handleFetchEvents({ debounce: true });
  }, [heliChartRef, handleFetchEvents]);

  const handleHelicorderShiftViewToNow = useCallback(() => {
    const now = Date.now();
    setHelicorderOffsetDate(now);
    heliChartRef.current?.setOffsetDate(now);
    heliChartRef.current?.render();
    heliChartRef.current?.fetchAllData({ debounce: true });
    handleFetchEvents({ debounce: true });
  }, [heliChartRef, setHelicorderOffsetDate, handleFetchEvents]);

  const handleHelicorderIncreaseAmplitude = useCallback(() => {
    heliChartRef.current?.increaseAmplitude(0.1);
    heliChartRef.current?.render({ refreshSignal: true });
  }, [heliChartRef]);

  const handleHelicorderDecreaseAmplitude = useCallback(() => {
    heliChartRef.current?.decreaseAmplitude(0.1);
    heliChartRef.current?.render({ refreshSignal: true });
  }, [heliChartRef]);

  const handleHelicorderResetAmplitude = useCallback(() => {
    heliChartRef.current?.resetAmplitude();
    heliChartRef.current?.render({ refreshSignal: true });
  }, [heliChartRef]);

  const handleHelicorderChannelChange = useCallback(
    (channel: Channel) => {
      setHelicorderChannelId(channel.id);
      heliChartRef.current?.clearData();
      heliChartRef.current?.setChannel({ id: channel.id, label: channel.stream_id });
      heliChartRef.current?.fetchAllData({ mode: 'force' });
    },
    [heliChartRef, setHelicorderChannelId]
  );

  const handleHelicorderChangeInterval = useCallback(
    (interval: number) => {
      setHelicorderInterval(interval);
      heliChartRef.current?.setInterval(interval);
      heliChartRef.current?.render({ refreshSignal: true });
      heliChartRef.current?.fetchAllData();
      handleFetchEvents();
    },
    [heliChartRef, setHelicorderInterval, handleFetchEvents]
  );

  const handleHelicorderChangeDuration = useCallback(
    (duration: number) => {
      setHelicorderDuration(duration);
      heliChartRef.current?.setDuration(duration);
      heliChartRef.current?.render({ refreshSignal: true });
      heliChartRef.current?.fetchAllData();
      handleFetchEvents();
    },
    [heliChartRef, setHelicorderDuration, handleFetchEvents]
  );

  const handleHelicorderFocus = useCallback(() => {
    seisChartRef.current?.blur();
    setSelectedChart('helicorder');
  }, [seisChartRef, setSelectedChart]);

  const handleHelicorderSelectionChange = useCallback(
    (range: [number, number]) => {
      setSelectionWindow(range);
      setLastSeismogramExtent(range);
      seisChartRef.current?.clearChannelData();
      seisChartRef.current?.clearSpectrogramData();
      seisChartRef.current?.setExtent(range, { autoZoom: true });
      seisChartRef.current?.clearPickRange();
      seisChartRef.current?.render();
      seisChartRef.current?.fetchAllChannelsData();
    },
    [seisChartRef, setSelectionWindow, setLastSeismogramExtent]
  );

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
    seisChartRef.current?.addEventMarkers(markers, { show: showEvent });
    seisChartRef.current?.render();
  }, [seisChartRef, eventMarkers, darkMode, eventId, showEvent]);

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
    heliChartRef.current?.addEventMarkers(markers, { show: showEvent });
    heliChartRef.current?.render({ refreshSignal: false });
  }, [heliChartRef, eventMarkers, darkMode, showEvent]);

  const handleUpdateEventMarkers = useCallback(() => {
    handleSeismogramUpdateEventMarkers();
    handleHelicorderUpdateEventMarkers();
  }, [handleSeismogramUpdateEventMarkers, handleHelicorderUpdateEventMarkers]);

  const handleEditEvent = useCallback(
    (event: SeismicEvent) => {
      const [start, end] = getPickExtent(event);
      const buffer = ONE_MINUTE;
      const autoZoom = false;
      const range: [number, number] = [start - buffer, end + buffer];

      seisChartRef.current?.clearChannelData();
      seisChartRef.current?.clearSpectrogramData();
      seisChartRef.current?.removeEventMarker(start, end);
      seisChartRef.current?.setExtent(range, { autoZoom });
      seisChartRef.current?.clearPickRange();
      seisChartRef.current?.render();
      seisChartRef.current?.fetchAllChannelsData({ mode: 'force' });

      setSelectionWindow(range);
      setLastSeismogramExtent(range);

      if (event) {
        fetchEditedEvent(event.id).then((event) => {
          handleSetupEventEditing(event);
          setSelectedTab('eventEditor');
          setShowSidebar(true);
        });
      }

      heliChartRef.current?.render({ refreshSignal: false });
    },
    [heliChartRef, seisChartRef, fetchEditedEvent, handleSetupEventEditing, setSelectedTab, setShowSidebar, setLastSeismogramExtent, setSelectionWindow]
  );

  const handleHelicorderEventMarkerClick = useCallback(
    (marker: HelicorderEventMarkerOptions) => {
      const event = marker.data as SeismicEvent;
      if (event) {
        handleEditEvent(event);
      }
    },
    [handleEditEvent]
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
      setHelicorderOffsetDate(offsetDate);
      heliChartRef.current?.setOffsetDate(offsetDate);
      heliChartRef.current?.render({ refreshSignal: true });
      heliChartRef.current?.fetchAllData();
      handleFetchEvents();
    },
    [heliChartRef, setHelicorderOffsetDate, handleFetchEvents]
  );

  const handleHelicorderRefreshData = useCallback(() => {
    heliChartRef.current?.fetchAllData({ mode: 'force' });
    handleFetchEvents();
  }, [heliChartRef, handleFetchEvents]);

  const handleHelicorderAutoUpdate = useCallback(() => {
    heliChartRef.current?.fetchAllData({ mode: 'refresh' });
    handleFetchEvents();
  }, [heliChartRef, handleFetchEvents]);

  const handleHelicorderOnLoading = useCallback(
    (loading: boolean) => {
      setHelicorderLoading(loading);
    },
    [setHelicorderLoading]
  );

  const handleHelicorderCheckValueChange = useCallback(
    (name: string, values: string[]) => {
      helicorderToolbarSetCheckedValues(name, values);
    },
    [helicorderToolbarSetCheckedValues]
  );

  const handleHelicorderScalingChange = useCallback(
    (scaling: ScalingType) => {
      heliChartRef.current?.setScaling(scaling);
      heliChartRef.current?.render({ refreshSignal: true });
    },
    [heliChartRef]
  );

  const handleHelicorderOffsetDateChange = useCallback(
    (date: number) => {
      setHelicorderOffsetDate(date);
    },
    [setHelicorderOffsetDate]
  );

  const getHelicorderInitOptions = useCallback(() => {
    const scaling = getHelicorderScalingType();
    const initOptions: Partial<HelicorderOptions> = {
      interval: helicorderInterval,
      duration: helicorderDuration,
      channel: {
        id: channelId,
      },
      darkMode,
      offsetDate,
      grid: {
        top: 25,
        right: 15,
        bottom: 25,
        left: 80,
      },
      devicePixelRatio: window.devicePixelRatio,
      useUTC,
      windowSize,
      selectionWindow,
      scaling,
      markers: eventMarkers.map((event) => {
        const [start, end] = getPickExtent(event);
        return {
          start,
          end,
          color: getEventTypeColor(event.type, darkMode),
          eventType: event.type.code,
          data: event,
        };
      }),
    };
    return initOptions;
  }, [helicorderDuration, helicorderInterval, channelId, darkMode, offsetDate, useUTC, windowSize, selectionWindow, eventMarkers, getHelicorderScalingType]);

  return {
    getHelicorderInitOptions,
    handleEditEvent,
    handleFetchEvents,
    handleHelicorderAutoUpdate,
    handleHelicorderChangeDuration,
    handleHelicorderChangeInterval,
    handleHelicorderChannelChange,
    handleHelicorderCheckValueChange,
    handleHelicorderDecreaseAmplitude,
    handleHelicorderEventMarkerClick,
    handleHelicorderFocus,
    handleHelicorderIncreaseAmplitude,
    handleHelicorderOffsetDateChange,
    handleHelicorderOnLoading,
    handleHelicorderOnReady,
    handleHelicorderRefreshData,
    handleHelicorderResetAmplitude,
    handleHelicorderScalingChange,
    handleHelicorderSelectionChange,
    handleHelicorderSelectOffsetDate,
    handleHelicorderShiftViewDown,
    handleHelicorderShiftViewToNow,
    handleHelicorderShiftViewUp,
    handleUpdateEventMarkers,
  };
}
