import { ElementEvent, SeismogramOptions } from '@waveview/zcharts';
import { useCallback } from 'react';
import { getEventTypeColor } from '../../shared/theme';
import { getPickExtent, ONE_SECOND } from '../../shared/time';
import { useAppStore } from '../../stores/app';
import { useFilterStore } from '../../stores/filter';
import { usePickerStore } from '../../stores/picker';
import { useSidebarStore } from '../../stores/sidebar';
import { SeismicEventDetail } from '../../types/event';
import { FilterOperationOptions } from '../../types/filter';
import { ScalingType } from '../../types/scaling';
import { usePickerContext } from './PickerContext';

export const useSeismogramCallback = () => {
  const {
    lastSeismogramExtent,
    isExpandMode,
    eventMarkers,
    calcSignalAmplitudes,
    clearPick,
    getChannelsConfig,
    getSeismogramScalingType,
    getSelectedStations,
    isPickEmpty,
    isSignalVisible,
    isSpectrogramVisible,
    resetEditing,
    seismogramToolbarSetCheckedValues,
    setEditedEvent,
    setExpandMode,
    setLastSeismogramExtent,
    setPickMode,
    setPickRange,
    setSeismogramLoading,
    setSelectedChart,
    setShowEvent,
    setStationOfFirstArrivalId,
  } = usePickerStore();

  const { heliChartRef, seisChartRef, contextMenuRef, props, setSeisChartReady } = usePickerContext();
  const { setShowSidebar } = useSidebarStore();

  const handleSeismogramZoomIn = useCallback(() => {
    seisChartRef.current?.zoomIn(0.1);
    seisChartRef.current?.render();
  }, [seisChartRef]);

  const handleSeismogramZoomOut = useCallback(() => {
    seisChartRef.current?.zoomOut(0.1);
    seisChartRef.current?.render();
  }, [seisChartRef]);

  const handleSeismogramZoomFirstMinute = useCallback(() => {
    seisChartRef.current?.zoomFirstMinute();
    seisChartRef.current?.render();
  }, [seisChartRef]);

  const handleSeismogramFitToWindow = useCallback(() => {
    seisChartRef.current?.fitToWindow();
    seisChartRef.current?.render();
  }, [seisChartRef]);

  const handleSeismogramScrollLeft = useCallback(() => {
    seisChartRef.current?.scrollLeft(0.1);
    seisChartRef.current?.render();
  }, [seisChartRef]);

  const handleSeismogramScrollRight = useCallback(() => {
    seisChartRef.current?.scrollRight(0.1);
    seisChartRef.current?.render();
  }, [seisChartRef]);

  const handleSeismogramIncreaseAmplitude = useCallback(() => {
    seisChartRef.current?.increaseAmplitude(0.1);
    seisChartRef.current?.render();
  }, [seisChartRef]);

  const handleSeismogramDecreaseAmplitude = useCallback(() => {
    seisChartRef.current?.decreaseAmplitude(0.1);
    seisChartRef.current?.render();
  }, [seisChartRef]);

  const handleSeismogramResetAmplitude = useCallback(() => {
    seisChartRef.current?.resetAmplitude();
    seisChartRef.current?.render();
  }, [seisChartRef]);

  const handleSeismogramShowEvent = useCallback(
    (showEvent: boolean) => {
      async function toggleShowEvent(showEvent: boolean) {
        if (showEvent) {
          seisChartRef.current?.showEventMarkers();
          heliChartRef.current?.showEventMarkers();
          setShowEvent(true);
        } else {
          seisChartRef.current?.hideEventMarkers();
          heliChartRef.current?.hideEventMarkers();
          setShowEvent(false);
        }
        seisChartRef.current?.render();
        heliChartRef.current?.render();
      }

      toggleShowEvent(showEvent);
    },
    [seisChartRef, heliChartRef, setShowEvent]
  );

  const handleSeismogramPickModeChange = useCallback(
    (active: boolean) => {
      if (active) {
        seisChartRef.current?.enablePickMode();
        setPickMode(true);
      } else {
        seisChartRef.current?.disablePickMode();
        seisChartRef.current?.clearPickRange();
        clearPick();
        setPickMode(false);
      }
      seisChartRef.current?.render();
    },
    [seisChartRef, clearPick, setPickMode]
  );

  const handleSeismogramSpectrogramChange = useCallback(
    (active: boolean) => {
      if (active) {
        seisChartRef.current?.showSpectrogram();
      } else {
        seisChartRef.current?.hideSpectrogram();
      }
      seisChartRef.current?.render();
    },
    [seisChartRef]
  );

  const handleSeismogramSignalChange = useCallback(
    (active: boolean) => {
      if (active) {
        seisChartRef.current?.showSignal();
      } else {
        seisChartRef.current?.hideSignal();
      }
      seisChartRef.current?.render();
    },
    [seisChartRef]
  );

  const handleSeismogramCheckValueChange = useCallback(
    (name: string, values: string[]) => {
      seismogramToolbarSetCheckedValues(name, values);
    },
    [seismogramToolbarSetCheckedValues]
  );

  const handleSeismogramFocus = useCallback(() => {
    heliChartRef.current?.blur();
    setSelectedChart('seismogram');
  }, [heliChartRef, setSelectedChart]);

  const handleSeismogramExtentChange = useCallback(() => {
    const extent = seisChartRef.current?.getChartExtent();
    if (extent) {
      setLastSeismogramExtent(extent);
    }
  }, [setLastSeismogramExtent, seisChartRef]);

  const handleSeismogramPickChange = useCallback(
    (pick: [number, number]) => {
      if (isPickEmpty()) {
        // Try to automatically select the station of the first arrival.
        const channelId = seisChartRef.current?.getFirstArrivalChannelId();
        const stationId = channelId
          ? getSelectedStations().find((station) => {
              const ids = station.channels.map((channel) => channel.id);
              return ids.includes(channelId);
            })?.id
          : undefined;
        if (stationId) {
          setStationOfFirstArrivalId(stationId);
        }
      }
      setPickRange(pick);
      calcSignalAmplitudes();
      seisChartRef.current?.render();
    },
    [seisChartRef, isPickEmpty, setPickRange, setStationOfFirstArrivalId, getSelectedStations, calcSignalAmplitudes]
  );

  const handleContextMenuRequested = useCallback(
    (e: ElementEvent) => {
      contextMenuRef.current?.open(e);
    },
    [contextMenuRef]
  );

  const handleSeismogramTrackDoubleClick = useCallback(
    (index: number) => {
      if (!isExpandMode) {
        setExpandMode(true);
        seisChartRef.current?.expandView(index);
        seisChartRef.current?.render();
      }
    },
    [seisChartRef, isExpandMode, setExpandMode]
  );

  const handleSeismogramRestoreView = useCallback(() => {
    setExpandMode(false);
    seisChartRef.current?.restoreView();
    seisChartRef.current?.render();
  }, [seisChartRef, setExpandMode]);

  const handleSeismogramMouseWheel = useCallback(
    (e: ElementEvent) => {
      const x = e.offsetX;
      const y = e.offsetY;
      const wheelDelta = e.wheelDelta;
      const chart = seisChartRef.current?.getInstance();
      if (!chart || !chart.isFocused() || !chart.getGrid().getRect().contain(x, y)) {
        return;
      }

      const event = e.event as unknown as WheelEvent;
      const { altKey, shiftKey } = event;
      if (shiftKey) {
        const center = chart.getXAxis().getValueForPixel(x);
        const zoomPercent = Math.min(0.5, Math.max(0.05, (Math.abs(wheelDelta) / 120) * 0.1));
        if (wheelDelta > 0) {
          chart.zoomOut(center, zoomPercent);
        } else {
          chart.zoomIn(center, zoomPercent);
        }
      } else if (altKey) {
        const ampPercent = Math.min(0.5, Math.max(0.05, (Math.abs(wheelDelta) / 120) * 0.1));
        if (wheelDelta > 0) {
          chart.decreaseAmplitude(ampPercent);
        } else {
          chart.increaseAmplitude(ampPercent);
        }
      } else {
        const percent = Math.min(0.5, Math.max(0.05, (Math.abs(wheelDelta) / 120) * 0.1));
        if (wheelDelta < 0) {
          chart.scrollRight(percent);
        } else {
          chart.scrollLeft(percent);
        }
      }
      chart.render();
    },
    [seisChartRef]
  );

  const handleSetupEventEditing = useCallback(
    (event: SeismicEventDetail) => {
      handleSeismogramPickModeChange(true);
      setSelectedChart('seismogram');
      handleSeismogramFocus();

      const [start, end] = getPickExtent(event);
      seisChartRef.current?.removeEventMarker(start, end);
      seisChartRef.current?.setPickRange([start, end]);
      seisChartRef.current?.render();

      setEditedEvent(event);
      setShowSidebar(true);
    },
    [seisChartRef, setEditedEvent, setSelectedChart, setShowSidebar, handleSeismogramPickModeChange, handleSeismogramFocus]
  );

  const { event } = props;
  const { darkMode, useUTC } = useAppStore();

  const handleSeismogramOnReady = useCallback(() => {
    setSeisChartReady(true);
    if (event) {
      handleSetupEventEditing(event);
    } else {
      handleSeismogramPickModeChange(true);
    }
  }, [event, handleSetupEventEditing, setSeisChartReady, handleSeismogramPickModeChange]);

  const handleClearEventEditing = useCallback(() => {
    resetEditing();
  }, [resetEditing]);

  const handleSeismogramOnDestroy = useCallback(() => {
    handleClearEventEditing();
  }, [handleClearEventEditing]);

  const getSeismogramInitOptions = useCallback(() => {
    const determinteInitialExtent = () => {
      if (event) {
        const [start, end] = getPickExtent(event);
        const margin = 10 * ONE_SECOND;
        return [start - margin, end + margin];
      }

      return lastSeismogramExtent;
    };
    const [startTime, endTime] = determinteInitialExtent();
    const scaling = getSeismogramScalingType();

    const initOptions: Partial<SeismogramOptions> = {
      channels: getChannelsConfig().map((item) => ({
        id: item.channel.id,
        label: item.channel.net_sta_code,
        color: item.color,
      })),
      grid: {
        top: 25,
        right: 50,
        bottom: 5,
        left: 80,
      },
      darkMode,
      devicePixelRatio: window.devicePixelRatio,
      useUTC,
      startTime,
      endTime,
      scaling,
      showSpecrogram: isSpectrogramVisible(),
      showSignal: isSignalVisible(),
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
  }, [darkMode, useUTC, event, lastSeismogramExtent, eventMarkers, getChannelsConfig, getSeismogramScalingType, isSpectrogramVisible, isSignalVisible]);

  const handleSeismogramScalingChange = useCallback(
    (scaling: ScalingType) => {
      seisChartRef.current?.setScaling(scaling);
      seisChartRef.current?.render();
    },
    [seisChartRef]
  );

  const { setAppliedFilter } = useFilterStore();

  const handleSeismogramFilterChange = useCallback(
    (filter: FilterOperationOptions | null) => {
      if (!filter) {
        seisChartRef.current?.resetFilter();
        setAppliedFilter(null);
      } else {
        seisChartRef.current?.applyFilter(filter);
        setAppliedFilter(filter);
      }
    },
    [seisChartRef, setAppliedFilter]
  );

  const handleSeismogramOnLoading = useCallback(
    (loading: boolean) => {
      setSeismogramLoading(loading);
    },
    [setSeismogramLoading]
  );

  return {
    getSeismogramInitOptions,
    handleClearEventEditing,
    handleContextMenuRequested,
    handleSeismogramCheckValueChange,
    handleSeismogramDecreaseAmplitude,
    handleSeismogramExtentChange,
    handleSeismogramFilterChange,
    handleSeismogramFitToWindow,
    handleSeismogramFocus,
    handleSeismogramIncreaseAmplitude,
    handleSeismogramMouseWheel,
    handleSeismogramOnDestroy,
    handleSeismogramOnLoading,
    handleSeismogramOnReady,
    handleSeismogramPickChange,
    handleSeismogramPickModeChange,
    handleSeismogramResetAmplitude,
    handleSeismogramRestoreView,
    handleSeismogramScalingChange,
    handleSeismogramScrollLeft,
    handleSeismogramScrollRight,
    handleSeismogramShowEvent,
    handleSeismogramSignalChange,
    handleSeismogramSpectrogramChange,
    handleSeismogramTrackDoubleClick,
    handleSeismogramZoomFirstMinute,
    handleSeismogramZoomIn,
    handleSeismogramZoomOut,
    handleSetupEventEditing,
  };
};
