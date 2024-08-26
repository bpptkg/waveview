import { Channel } from '@waveview/charts';
import { FederatedPointerEvent } from 'pixi.js';
import { useCallback } from 'react';
import { getPickExtent } from '../../shared/time';
import { ComponentType, usePickerStore } from '../../stores/picker';
import { usePickerContext } from './PickerContext';
import { EditedEvent } from './PickerWorkspace.types';

export const useSeismogramCallback = () => {
  const {
    selectedChannels,
    addSeismogramChannel,
    setShowEvent,
    setLastTrackExtent,
    setSelectedChart,
    seismogramToolbarSetCheckedValues,
    removeSeismogramChannel,
    moveChannel,
    setExpandMode,
    setComponent,
    setExpandedChannelIndex,
    setPickRange,
    getChannelById,
    getChannelsByStationIndex,
    deactivatePickMode,
    clearPick,
  } = usePickerStore();

  const { heliChartRef, seisChartRef, contextMenuRef, props, setSeisChartReady } = usePickerContext();
  const { event } = props;

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

  const handleSeismogramScrollToNow = useCallback(() => {
    seisChartRef.current?.scrollToNow();
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
        selectedChannels.map((channel) => ({
          id: channel.id,
          label: channel.network_station_code,
        }))
      );
    },
    [seisChartRef, setComponent, selectedChannels]
  );

  const handleSeismogramShowEvent = useCallback(
    (showEvent: boolean) => {
      async function toggleShowEvent(showEvent: boolean) {
        if (showEvent) {
          seisChartRef.current?.showAllEventMarkers();
          heliChartRef.current?.showAllEventMarkers();
          setShowEvent(true);
        } else {
          seisChartRef.current?.hideAllEventMarkers();
          heliChartRef.current?.hideAllEventMarkers();
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
        seisChartRef.current?.deactivateZoomRectangle();
        seisChartRef.current?.activatePickMode();
      } else {
        seisChartRef.current?.deactivatePickMode();
        clearPick();
      }
    },
    [seisChartRef, clearPick]
  );

  const handleSeismogramDeactivatePickMode = useCallback(() => {
    seisChartRef.current?.deactivatePickMode();
    deactivatePickMode();
    clearPick();
  }, [seisChartRef, deactivatePickMode, clearPick]);

  const handleSeismogramZoomRectangleChange = useCallback(
    (active: boolean) => {
      if (active) {
        seisChartRef.current?.deactivatePickMode();
        seisChartRef.current?.activateZoomRectangle();
      } else {
        seisChartRef.current?.deactivateZoomRectangle();
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
      if (index < selectedChannels.length - 1) {
        moveChannel(index, index + 1);
        seisChartRef.current?.moveChannelDown(index);
      }
    },
    [seisChartRef, moveChannel, selectedChannels]
  );

  const handleTrackDoubleClicked = useCallback(
    (index: number) => {
      const channels = getChannelsByStationIndex(index);
      seisChartRef.current?.setChannels(channels);
      setExpandMode(true);
      setExpandedChannelIndex(index);
    },
    [seisChartRef, setExpandMode, getChannelsByStationIndex, setExpandedChannelIndex]
  );

  const handleRestoreChannels = useCallback(() => {
    seisChartRef.current?.setChannels(selectedChannels);
    setExpandMode(false);
  }, [seisChartRef, selectedChannels, setExpandMode]);

  const handleSeismogramFocus = useCallback(() => {
    heliChartRef.current?.blur();
    setSelectedChart('seismogram');
  }, [heliChartRef, setSelectedChart]);

  const handleSeismogramExtentChange = useCallback(
    (extent: [number, number]) => {
      setLastTrackExtent(extent);
    },
    [setLastTrackExtent]
  );

  const handleSeismogramPickChange = useCallback(
    (pick: [number, number]) => {
      setPickRange(pick);
    },
    [setPickRange]
  );

  const setupEventEditing = useCallback(
    (event: EditedEvent) => {
      if (event) {
        const [start, end] = getPickExtent(event);
        setPickRange([start, end]);
        seisChartRef.current?.setPickRange([start, end]);

        handleSeismogramCheckValueChange('options', ['pick-mode']);
        handleSeismogramPickModeChange(true);
        setSelectedChart('seismogram');
        handleSeismogramFocus();
      }
    },
    [seisChartRef, setPickRange, setSelectedChart, handleSeismogramCheckValueChange, handleSeismogramPickModeChange, handleSeismogramFocus]
  );

  const handleSeismogramOnReady = useCallback(() => {
    setSeisChartReady(true);
    const extent = seisChartRef.current?.getChartExtent();
    if (extent) {
      setLastTrackExtent(extent);
    }

    if (event) {
      setupEventEditing(event);
    }
  }, [seisChartRef, event, setupEventEditing, setLastTrackExtent, setSeisChartReady]);

  const handleClearEventEditing = useCallback(() => {
    handleSeismogramCheckValueChange('options', []);
    handleSeismogramPickModeChange(false);
  }, [handleSeismogramCheckValueChange, handleSeismogramPickModeChange]);

  const handleContextMenuRequested = useCallback(
    (e: FederatedPointerEvent) => {
      if (seisChartRef.current) {
        contextMenuRef.current?.open(e, {
          chart: seisChartRef.current?.getInstance(),
        });
      }
    },
    [seisChartRef, contextMenuRef]
  );

  return {
    handleSeismogramChannelAdd,
    handleSeismogramZoomIn,
    handleSeismogramZoomOut,
    handleSeismogramScrollLeft,
    handleSeismogramScrollRight,
    handleSeismogramScrollToNow,
    handleSeismogramIncreaseAmplitude,
    handleSeismogramDecreaseAmplitude,
    handleSeismogramResetAmplitude,
    handleSeismogramComponentChange,
    handleSeismogramShowEvent,
    handleSeismogramPickModeChange,
    handleSeismogramDeactivatePickMode,
    handleSeismogramZoomRectangleChange,
    handleSeismogramCheckValueChange,
    handleSeismogramRemoveChannel,
    handleSeismogramMoveChannelUp,
    handleSeismogramMoveChannelDown,
    handleTrackDoubleClicked,
    handleRestoreChannels,
    handleSeismogramFocus,
    handleSeismogramExtentChange,
    handleSeismogramPickChange,
    handleSeismogramOnReady,
    handleClearEventEditing,
    handleContextMenuRequested,
  };
};
