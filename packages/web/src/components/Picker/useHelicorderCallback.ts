import { Helicorder, HelicorderEventMarkerOptions, SeismogramEventMarkerOptions } from '@waveview/zcharts';
import { useCallback } from 'react';
import { getEventTypeColor } from '../../shared/theme';
import { getPickExtent } from '../../shared/time';
import { useAppStore } from '../../stores/app';
import { useAuthStore } from '../../stores/auth';
import { useCatalogStore } from '../../stores/catalog';
import { useFilterStore } from '../../stores/filter';
import { useOrganizationStore } from '../../stores/organization';
import { usePickerStore } from '../../stores/picker';
import { useVolcanoStore } from '../../stores/volcano/useVolcanoStore';
import { Channel } from '../../types/channel';
import { SeismicEventDetail } from '../../types/event';
import { usePickerContext } from './PickerContext';

export function useHelicorderCallback() {
  const {
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
  const { setAppliedFilter } = useFilterStore();

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
      seisChartRef.current?.setExtent(range);
      seisChartRef.current?.clearPickRange();
      setSelectionWindow(range);
      setAppliedFilter(null);
      setLastSeismogramExtent(range);
    },
    [seisChartRef, setSelectionWindow, setAppliedFilter, setLastSeismogramExtent]
  );

  const { currentOrganization } = useOrganizationStore();
  const { currentCatalog } = useCatalogStore();
  const { currentVolcano } = useVolcanoStore();
  const { token } = useAuthStore();
  const { darkMode, useUTC } = useAppStore();
  const { event } = props;
  const { eventId, helicorderDuration, helicorderInterval, channelId, offsetDate, eventMarkers } = usePickerStore();
  const { setHeliChartReady } = usePickerContext();

  const handleUpdateEventMarkers = useCallback(async () => {
    seisChartRef.current?.clearEventMarkers();
    heliChartRef.current?.clearEventMarkers();

    const markers: HelicorderEventMarkerOptions[] | SeismogramEventMarkerOptions[] = [];
    eventMarkers.forEach((event) => {
      const [start, end] = getPickExtent(event);
      if (event.id === eventId) {
        return;
      }

      markers.push({
        start,
        end,
        color: getEventTypeColor(event.type, darkMode),
        data: event,
      });
    });
    heliChartRef.current?.addEventMarkers(markers);
    seisChartRef.current?.addEventMarkers(markers);
  }, [seisChartRef, heliChartRef, eventMarkers, darkMode, eventId]);

  const handleFetchEvents = useCallback(() => {
    const helicorderExtent = heliChartRef.current?.getChartExtent();
    if (helicorderExtent && currentOrganization && currentVolcano && currentCatalog && token) {
      const [start, end] = helicorderExtent;
      fetchEventMarkers(start, end);
    }
  }, [heliChartRef, currentOrganization, currentVolcano, currentCatalog, token, fetchEventMarkers]);

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
      handleFetchEvents();
    },
    [heliChartRef, handleFetchEvents]
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
    const initOptions = {
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
    };
    return initOptions;
  }, [helicorderDuration, helicorderInterval, channelId, darkMode, offsetDate, useUTC, event]);

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
    handleHelicorderFocus,
    handleHelicorderSelectionChange,
    handleHelicorderOnReady,
    handleUpdateEventMarkers,
    getHelicorderInitOptions,
    handleHelicorderRefreshData,
    handleHelicorderAutoUpdate,
  };
}
