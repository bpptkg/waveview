import { ElementEvent } from '@waveview/zcharts';
import { useCallback } from 'react';
import { getPickExtent, ONE_SECOND } from '../../shared/time';
import { useAppStore } from '../../stores/app';
import { usePickerStore } from '../../stores/picker';
import { SeismicEventDetail } from '../../types/event';
import { usePickerContext } from './PickerContext';

export const useSeismogramCallback = () => {
  const {
    lastSeismogramExtent,
    isExpandMode,
    setShowEvent,
    setSelectedChart,
    seismogramToolbarSetCheckedValues,
    setPickRange,
    setPickMode,
    clearPick,
    setEditedEvent,
    setLastSeismogramExtent,
    getChannelsConfig,
    resetEditing,
    setExpandMode,
  } = usePickerStore();

  const { heliChartRef, seisChartRef, contextMenuRef, props, setSeisChartReady } = usePickerContext();

  const handleSeismogramZoomIn = useCallback(() => {
    seisChartRef.current?.zoomIn(0.1);
  }, [seisChartRef]);

  const handleSeismogramZoomOut = useCallback(() => {
    seisChartRef.current?.zoomOut(0.1);
  }, [seisChartRef]);

  const handleSeismogramScrollLeft = useCallback(() => {
    seisChartRef.current?.scrollLeft(0.1);
  }, [seisChartRef]);

  const handleSeismogramScrollRight = useCallback(() => {
    seisChartRef.current?.scrollRight(0.1);
  }, [seisChartRef]);

  const handleSeismogramIncreaseAmplitude = useCallback(() => {
    seisChartRef.current?.increaseAmplitude(0.1);
  }, [seisChartRef]);

  const handleSeismogramDecreaseAmplitude = useCallback(() => {
    seisChartRef.current?.decreaseAmplitude(0.1);
  }, [seisChartRef]);

  const handleSeismogramResetAmplitude = useCallback(() => {
    seisChartRef.current?.resetAmplitude();
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
      setPickRange(pick);
    },
    [setPickRange]
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
        seisChartRef.current?.expandView(index);
        setExpandMode(true);
      }
    },
    [seisChartRef, isExpandMode, setExpandMode]
  );

  const handleSeismogramRestoreView = useCallback(() => {
    seisChartRef.current?.restoreView();
    setExpandMode(false);
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
        if (wheelDelta > 0) {
          chart.zoomOut(center, 0.1);
        } else {
          chart.zoomIn(center, 0.1);
        }
      } else if (altKey) {
        if (wheelDelta > 0) {
          chart.decreaseAmplitude(0.1);
        } else {
          chart.increaseAmplitude(0.1);
        }
      } else {
        if (wheelDelta > 0) {
          chart.scrollRight(0.1);
        } else {
          chart.scrollLeft(0.1);
        }
      }
      chart.render();
    },
    [seisChartRef]
  );

  const handleSetupEventEditing = useCallback(
    (event: SeismicEventDetail) => {
      if (event) {
        handleSeismogramPickModeChange(true);
        setSelectedChart('seismogram');
        handleSeismogramFocus();

        const [start, end] = getPickExtent(event);
        setEditedEvent(event);
        seisChartRef.current?.setPickRange([start, end]);
        seisChartRef.current?.removeEventMarker(start, end);
      }
    },
    [seisChartRef, setEditedEvent, setSelectedChart, handleSeismogramPickModeChange, handleSeismogramFocus]
  );

  const { event } = props;
  const { darkMode, useUTC } = useAppStore();

  const handleSeismogramOnReady = useCallback(() => {
    setSeisChartReady(true);
    if (event) {
      handleSetupEventEditing(event);
    }
  }, [event, handleSetupEventEditing, setSeisChartReady]);

  const handleClearEventEditing = useCallback(() => {
    handleSeismogramPickModeChange(false);
    resetEditing();
  }, [handleSeismogramPickModeChange, resetEditing]);

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

    const initOptions = {
      channels: getChannelsConfig().map((item) => ({
        id: item.channel.id,
        label: item.channel.network_station_code,
        color: item.color,
      })),
      grid: {
        top: 30,
        right: 50,
        bottom: 5,
        left: 80,
      },
      darkMode,
      devicePixelRatio: window.devicePixelRatio,
      useUTC,
      startTime,
      endTime,
    };
    return initOptions;
  }, [darkMode, useUTC, event, lastSeismogramExtent, getChannelsConfig]);

  return {
    handleSeismogramZoomIn,
    handleSeismogramZoomOut,
    handleSeismogramScrollLeft,
    handleSeismogramScrollRight,
    handleSeismogramIncreaseAmplitude,
    handleSeismogramDecreaseAmplitude,
    handleSeismogramResetAmplitude,
    handleSeismogramShowEvent,
    handleSeismogramPickModeChange,
    handleSeismogramCheckValueChange,
    handleSeismogramFocus,
    handleSeismogramExtentChange,
    handleSeismogramPickChange,
    handleSeismogramOnReady,
    handleSeismogramOnDestroy,
    handleClearEventEditing,
    handleContextMenuRequested,
    handleSetupEventEditing,
    getSeismogramInitOptions,
    handleSeismogramSpectrogramChange,
    handleSeismogramSignalChange,
    handleSeismogramMouseWheel,
    handleSeismogramTrackDoubleClick,
    handleSeismogramRestoreView,
  };
};
