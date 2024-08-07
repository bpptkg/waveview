import { Channel } from '@waveview/charts';
import { useCallback } from 'react';
import { ComponentType, usePickerStore } from '../../stores/picker';
import { HelicorderChartRef } from './HelicorderChart';
import { SeismogramChartRef } from './SeismogramChart';

export const useSeismogramCallback = (
  seisChartRef: React.MutableRefObject<SeismogramChartRef | null>,
  heliChartRef: React.MutableRefObject<HelicorderChartRef | null>
) => {
  const {
    channels,
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
    getChannelByStreamId,
    getChannelsByStationIndex,
  } = usePickerStore();

  return {
    handleSeismogramChannelAdd: useCallback(
      (channel: Channel) => {
        const chan = getChannelByStreamId(channel.id);
        if (chan) {
          addSeismogramChannel(chan);
          seisChartRef.current?.addChannel(channel);
        }
      },
      [seisChartRef, addSeismogramChannel, getChannelByStreamId]
    ),

    handleSeismogramZoomIn: useCallback(() => {
      seisChartRef.current?.zoomIn(0.1);
    }, [seisChartRef]),

    handleSeismogramZoomOut: useCallback(() => {
      seisChartRef.current?.zoomOut(0.1);
    }, [seisChartRef]),

    handleSeismogramScrollLeft: useCallback(() => {
      seisChartRef.current?.scrollLeft(0.1);
    }, [seisChartRef]),

    handleSeismogramScrollRight: useCallback(() => {
      seisChartRef.current?.scrollRight(0.1);
    }, [seisChartRef]),

    handleSeismogramScrollToNow: useCallback(() => {
      seisChartRef.current?.scrollToNow();
    }, [seisChartRef]),

    handleSeismogramIncreaseAmplitude: useCallback(() => {
      seisChartRef.current?.increaseAmplitude(0.1);
    }, [seisChartRef]),

    handleSeismogramDecreaseAmplitude: useCallback(() => {
      seisChartRef.current?.decreaseAmplitude(0.1);
    }, [seisChartRef]),

    handleSeismogramResetAmplitude: useCallback(() => {
      seisChartRef.current?.resetAmplitude();
    }, [seisChartRef]),

    handleSeismogramComponentChange: useCallback(
      (component: string) => {
        setComponent(component as ComponentType);
        seisChartRef.current?.setChannels(channels);
      },
      [seisChartRef, setComponent, channels]
    ),

    handleSeismogramShowEvent: useCallback(
      (showEvent: boolean) => {
        if (showEvent) {
          seisChartRef.current?.showAllMarkers();
          setShowEvent(true);
        } else {
          seisChartRef.current?.hideAllMarkers();
          setShowEvent(false);
        }
      },
      [seisChartRef, setShowEvent]
    ),

    handleSeismogramPickModeChange: useCallback(
      (active: boolean) => {
        if (active) {
          seisChartRef.current?.deactivateZoomRectangle();
          seisChartRef.current?.activatePickMode();
        } else {
          seisChartRef.current?.deactivatePickMode();
        }
      },
      [seisChartRef]
    ),

    handleSeismogramZoomRectangleChange: useCallback(
      (active: boolean) => {
        if (active) {
          seisChartRef.current?.deactivatePickMode();
          seisChartRef.current?.activateZoomRectangle();
        } else {
          seisChartRef.current?.deactivateZoomRectangle();
        }
      },
      [seisChartRef]
    ),

    handleSeismogramCheckValueChange: useCallback(
      (name: string, values: string[]) => {
        seismogramToolbarSetCheckedValues(name, values);
      },
      [seismogramToolbarSetCheckedValues]
    ),

    handleSeismogramRemoveChannel: useCallback(
      (index: number) => {
        removeSeismogramChannel(index);
        seisChartRef.current?.removeChannel(index);
      },
      [seisChartRef, removeSeismogramChannel]
    ),

    handleSeismogramMoveChannelUp: useCallback(
      (index: number) => {
        if (index > 0) {
          moveChannel(index, index - 1);
          seisChartRef.current?.moveChannelUp(index);
        }
      },
      [seisChartRef, moveChannel]
    ),

    handleSeismogramMoveChannelDown: useCallback(
      (index: number) => {
        if (index < channels.length - 1) {
          moveChannel(index, index + 1);
          seisChartRef.current?.moveChannelDown(index);
        }
      },
      [seisChartRef, moveChannel, channels]
    ),

    handleTrackDoubleClicked: useCallback(
      (index: number) => {
        const channels = getChannelsByStationIndex(index);
        seisChartRef.current?.setChannels(channels);
        setExpandMode(true);
        setExpandedChannelIndex(index);
      },
      [seisChartRef, setExpandMode, getChannelsByStationIndex, setExpandedChannelIndex]
    ),

    handleRestoreChannels: useCallback(() => {
      seisChartRef.current?.setChannels(channels);
      setExpandMode(false);
    }, [seisChartRef, channels, setExpandMode]),

    handleSeismogramFocus: useCallback(() => {
      heliChartRef.current?.blur();
      setSelectedChart('seismogram');
    }, [heliChartRef, setSelectedChart]),

    handleSeismogramExtentChange: useCallback(
      (extent: [number, number]) => {
        setLastTrackExtent(extent);
      },
      [setLastTrackExtent]
    ),

    handleSeismogramPickChange: useCallback(
      (pick: [number, number]) => {
        setPickRange(pick);
      },
      [setPickRange]
    ),
  };
};
