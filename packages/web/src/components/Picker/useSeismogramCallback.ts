import { useCallback } from 'react';
import { usePickerStore } from '../../stores/picker';
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
  } = usePickerStore();

  return {
    handleSeismogramChannelAdd: useCallback(
      (channelId: string) => {
        addSeismogramChannel(channelId);
        seisChartRef.current?.addChannel(channelId);
      },
      [seisChartRef, addSeismogramChannel]
    ),

    handleSeismogramZoomIn: useCallback(() => {
      seisChartRef.current?.zoomIn(0.05);
    }, [seisChartRef]),

    handleSeismogramZoomOut: useCallback(() => {
      seisChartRef.current?.zoomOut(0.05);
    }, [seisChartRef]),

    handleSeismogramScrollLeft: useCallback(() => {
      seisChartRef.current?.scrollLeft(0.05);
    }, [seisChartRef]),

    handleSeismogramScrollRight: useCallback(() => {
      seisChartRef.current?.scrollRight(0.05);
    }, [seisChartRef]),

    handleSeismogramScrollToNow: useCallback(() => {
      seisChartRef.current?.scrollToNow();
    }, [seisChartRef]),

    handleSeismogramIncreaseAmplitude: useCallback(() => {
      seisChartRef.current?.increaseAmplitude(0.05);
    }, [seisChartRef]),

    handleSeismogramDecreaseAmplitude: useCallback(() => {
      seisChartRef.current?.decreaseAmplitude(0.05);
    }, [seisChartRef]),

    handleSeismogramResetAmplitude: useCallback(() => {
      seisChartRef.current?.resetAmplitude();
    }, [seisChartRef]),

    handleSeismogramShowEvent: useCallback(
      (showEvent: boolean) => {
        if (showEvent) {
          seisChartRef.current?.showVisibleMarkers();
          setShowEvent(true);
        } else {
          seisChartRef.current?.hideVisibleMarkers();
          setShowEvent(false);
        }
      },
      [seisChartRef, setShowEvent]
    ),

    handleSeismogramZoomRectangleChange: useCallback(
      (active: boolean) => {
        if (active) {
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

    handleTrackDoubleClicked: useCallback(() => {
      seisChartRef.current?.setChannels(['VG.MEPH.00.HHZ', 'VG.MEPH.00.HHN', 'VG.MEPH.00.HHE']);
      setExpandMode(true);
    }, [seisChartRef, setExpandMode]),

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
  };
};
