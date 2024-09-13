import { Channel } from '@waveview/zcharts';
import { useCallback } from 'react';
import { getPickExtent, ONE_SECOND } from '../../shared/time';
import { useAppStore } from '../../stores/app';
import { ComponentType, usePickerStore } from '../../stores/picker';
import { SeismicEventDetail } from '../../types/event';
import { usePickerContext } from './PickerContext';

export const useSeismogramCallback = () => {
  const {
    lastSeismogramExtent,
    addSeismogramChannel,
    setShowEvent,
    setSelectedChart,
    seismogramToolbarSetCheckedValues,
    removeSeismogramChannel,
    moveChannel,
    setComponent,
    setPickRange,
    getChannelById,
    setPickMode,
    clearPick,
    setEditedEvent,
    setLastSeismogramExtent,
    getChannels,
  } = usePickerStore();

  const { heliChartRef, seisChartRef, props, setSeisChartReady } = usePickerContext();

  const handleSeismogramChannelAdd = useCallback(
    (channel: Channel) => {
      const chan = getChannelById(channel.id);
      if (chan) {
        addSeismogramChannel(chan);
        seisChartRef.current?.addChannel({ id: chan.id, label: chan.network_station_code });
      }
    },
    [seisChartRef, addSeismogramChannel, getChannelById]
  );

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

  const handleSeismogramComponentChange = useCallback(
    (component: string) => {
      setComponent(component as ComponentType);
      seisChartRef.current?.setChannels(
        getChannels().map((channel) => ({
          id: channel.id,
          label: channel.network_station_code,
        }))
      );
    },
    [seisChartRef, setComponent, getChannels]
  );

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

  const handleSeismogramCheckValueChange = useCallback(
    (name: string, values: string[]) => {
      seismogramToolbarSetCheckedValues(name, values);
    },
    [seismogramToolbarSetCheckedValues]
  );

  const handleSeismogramRemoveChannel = useCallback(
    (index: number) => {
      removeSeismogramChannel(index);
      seisChartRef.current?.removeChannel(index);
    },
    [seisChartRef, removeSeismogramChannel]
  );

  const handleSeismogramMoveChannelUp = useCallback(
    (index: number) => {
      if (index > 0) {
        moveChannel(index, index - 1);
        seisChartRef.current?.moveChannelUp(index);
      }
    },
    [seisChartRef, moveChannel]
  );

  const handleSeismogramMoveChannelDown = useCallback(
    (index: number) => {
      if (index < getChannels().length - 1) {
        moveChannel(index, index + 1);
        seisChartRef.current?.moveChannelDown(index);
      }
    },
    [seisChartRef, moveChannel, getChannels]
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

  const handleContextMenuRequested = useCallback(() => {}, []);

  const handleSetupEventEditing = useCallback(
    (event: SeismicEventDetail) => {
      if (event) {
        handleSeismogramCheckValueChange('options', ['pick-mode']);
        handleSeismogramPickModeChange(true);
        setSelectedChart('seismogram');
        handleSeismogramFocus();

        const [start, end] = getPickExtent(event);
        setEditedEvent(event);
        seisChartRef.current?.setPickRange([start, end]);
        seisChartRef.current?.removeEventMarker(start, end);
      }
    },
    [seisChartRef, setEditedEvent, setSelectedChart, handleSeismogramCheckValueChange, handleSeismogramPickModeChange, handleSeismogramFocus]
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
    handleSeismogramCheckValueChange('options', []);
    handleSeismogramPickModeChange(false);
  }, [handleSeismogramCheckValueChange, handleSeismogramPickModeChange]);

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
      channels: getChannels().map((channel) => ({
        id: channel.id,
        label: channel.network_station_code,
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
  }, [darkMode, useUTC, event, lastSeismogramExtent, getChannels]);

  return {
    handleSeismogramChannelAdd,
    handleSeismogramZoomIn,
    handleSeismogramZoomOut,
    handleSeismogramScrollLeft,
    handleSeismogramScrollRight,
    handleSeismogramIncreaseAmplitude,
    handleSeismogramDecreaseAmplitude,
    handleSeismogramResetAmplitude,
    handleSeismogramComponentChange,
    handleSeismogramShowEvent,
    handleSeismogramPickModeChange,
    handleSeismogramCheckValueChange,
    handleSeismogramRemoveChannel,
    handleSeismogramMoveChannelUp,
    handleSeismogramMoveChannelDown,
    handleSeismogramFocus,
    handleSeismogramExtentChange,
    handleSeismogramPickChange,
    handleSeismogramOnReady,
    handleClearEventEditing,
    handleContextMenuRequested,
    handleSetupEventEditing,
    getSeismogramInitOptions,
    handleSeismogramSpectrogramChange,
  };
};
