import { useCallback, useRef } from 'react';
import { usePickerStore } from '../../stores/picker';
import HelicorderChart, { HelicorderChartRef } from './HelicorderChart';
import RealtimeClock from './RealtimeClock';
import SeismogramChart, { SeismogramChartRef } from './SeismogramChart';
import TimeZoneSelector from './TimezoneSelector';
import HelicorderToolbar from './Toolbar/HelicorderToolbar';

const HelicorderWorkspace = () => {
  const heliChart = useRef<HelicorderChartRef | null>(null);
  const seisChart = useRef<SeismogramChartRef | null>(null);
  const pickerStore = usePickerStore();
  const { channelId, interval, duration, showEvent, setInterval, setDuration, setChannelId, setShowEvent } = pickerStore;

  const handleShiftViewUp = useCallback(() => {
    heliChart.current?.shiftViewUp();
  }, []);

  const handleShiftViewDown = useCallback(() => {
    heliChart.current?.shiftViewDown();
  }, []);

  const handleShiftViewToNow = useCallback(() => {
    heliChart.current?.shiftViewToNow();
  }, []);

  const handleIncreaseAmplitude = useCallback(() => {
    heliChart.current?.increaseAmplitude(0.05);
  }, []);

  const handleDecreaseAmplitude = useCallback(() => {
    heliChart.current?.decreaseAmplitude(0.05);
  }, []);

  const handleResetAmplitude = useCallback(() => {
    heliChart.current?.resetAmplitude();
  }, []);

  const handleChannelChange = useCallback(
    (channelId: string) => {
      setChannelId(channelId);
    },
    [setChannelId]
  );

  const handleChangeInterval = useCallback(
    (interval: number) => {
      setInterval(interval);
      heliChart.current?.setInterval(interval);
    },
    [setInterval]
  );

  const handleChangeDuration = useCallback(
    (duration: number) => {
      setDuration(duration);
      heliChart.current?.setDuration(duration);
    },
    [setDuration]
  );

  const handleShowEventChange = useCallback(
    (showEvent: boolean) => {
      setShowEvent(showEvent);
      if (showEvent) {
        seisChart.current?.showVisibleMarkers();
      } else {
        seisChart.current?.hideVisibleMarkers();
      }
    },
    [setShowEvent]
  );

  return (
    <>
      <HelicorderToolbar
        channelId={channelId}
        interval={interval}
        duration={duration}
        showEvent={showEvent}
        onShiftViewUp={handleShiftViewUp}
        onShiftViewDown={handleShiftViewDown}
        onShiftViewToNow={handleShiftViewToNow}
        onIncreaseAmplitude={handleIncreaseAmplitude}
        onDecreaseAmplitude={handleDecreaseAmplitude}
        onResetAmplitude={handleResetAmplitude}
        onChannelChange={handleChannelChange}
        onIntervalChange={handleChangeInterval}
        onDurationChange={handleChangeDuration}
        onShowEventChange={handleShowEventChange}
      />
      <div className="flex-grow relative mt-1 flex h-full">
        <div className="relative w-1/3">
          <HelicorderChart
            ref={heliChart}
            channelId={channelId}
            interval={interval}
            duration={duration}
            initOptions={{
              grid: {
                top: 30,
                right: 80,
                bottom: 25,
                left: 80,
              },
            }}
          />
        </div>
        <div className="relative w-2/3 h-full flex flex-col">
          <div className="flex-1 relative">
            <SeismogramChart
              ref={seisChart}
              initOptions={{
                grid: {
                  top: 30,
                  right: 10,
                  bottom: 5,
                  left: 80,
                },
              }}
            />
          </div>
          <div className=" bg-white dark:bg-black relative flex items-center justify-end gap-2 mr-2 h-[20px]">
            <RealtimeClock />
            <TimeZoneSelector />
          </div>
        </div>
      </div>
    </>
  );
};

export default HelicorderWorkspace;
