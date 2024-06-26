import { useCallback, useRef } from 'react';
import { usePickerStore } from '../../stores/picker';
import { HelicorderChartRef } from './HelicorderChart';
import { SeismogramChartRef } from './SeismogramChart';

export function useHelicorderCallback(
  heliChartRef: React.MutableRefObject<HelicorderChartRef | null>,
  seisChartRef: React.MutableRefObject<SeismogramChartRef | null>
) {
  const {
    setHelicorderOffsetDate,
    setHelicorderChannel,
    setHelicorderInterval,
    setHelicorderDuration,
    setLastTrackExtent,
    seismogramToolbarRemoveCheckedValue,
    setSelectedChart,
    setLastSelection,
  } = usePickerStore();
  const selectingTrackRef = useRef<boolean | null>(null);
  return {
    handleHelicorderShiftViewUp: useCallback(() => {
      heliChartRef.current?.shiftViewUp();
    }, [heliChartRef]),

    handleHelicorderShiftViewDown: useCallback(() => {
      heliChartRef.current?.shiftViewDown();
    }, [heliChartRef]),

    handleHelicorderShiftViewToNow: useCallback(() => {
      const now = Date.now();
      heliChartRef.current?.setOffsetDate(now);
      setHelicorderOffsetDate(now);
    }, [heliChartRef, setHelicorderOffsetDate]),

    handleHelicorderIncreaseAmplitude: useCallback(() => {
      heliChartRef.current?.increaseAmplitude(0.1);
    }, [heliChartRef]),

    handleHelicorderDecreaseAmplitude: useCallback(() => {
      heliChartRef.current?.decreaseAmplitude(0.1);
    }, [heliChartRef]),

    handleHelicorderResetAmplitude: useCallback(() => {
      heliChartRef.current?.resetAmplitude();
    }, [heliChartRef]),

    handleHelicorderChannelChange: useCallback(
      (channelId: string) => {
        setHelicorderChannel(channelId);
        heliChartRef.current?.setChannel(channelId);
      },
      [heliChartRef, setHelicorderChannel]
    ),

    handleHelicorderChangeInterval: useCallback(
      (interval: number) => {
        setHelicorderInterval(interval);
        heliChartRef.current?.setInterval(interval);
      },
      [heliChartRef, setHelicorderInterval]
    ),

    handleHelicorderChangeDuration: useCallback(
      (duration: number) => {
        setHelicorderDuration(duration);
        heliChartRef.current?.setDuration(duration);
      },
      [heliChartRef, setHelicorderDuration]
    ),

    handleHelicorderSelectOffsetDate: useCallback(
      (date: Date) => {
        const offsetDate = date.getTime();
        heliChartRef.current?.setOffsetDate(offsetDate);
      },
      [heliChartRef]
    ),

    handleTrackSelected: useCallback(
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
    ),

    handleHelicorderFocus: useCallback(() => {
      seisChartRef.current?.blur();
      seisChartRef.current?.deactivateZoomRectangle();
      seismogramToolbarRemoveCheckedValue('options', 'zoom-rectangle');
      setSelectedChart('helicorder');
    }, [seisChartRef, seismogramToolbarRemoveCheckedValue, setSelectedChart]),

    handleHelicorderOffsetChange: useCallback(
      (date: number) => {
        setHelicorderOffsetDate(date);
      },
      [setHelicorderOffsetDate]
    ),

    handleHelicorderSelectionChange: useCallback(
      (selection: number) => {
        setLastSelection(selection);
      },
      [setLastSelection]
    ),
  };
}
