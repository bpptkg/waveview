import { Seismogram } from '@waveview/charts';
import { useCallback, useRef } from 'react';
import HelicorderToolbar from './Toolbar/HelicorderToolbar';
import { usePickerStore } from '../../stores/picker';
import HelicorderChart, { HelicorderChartRef } from './HelicorderChart';
import SeismogramChart from './SeismogramChart';
import RealtimeClock from './RealtimeClock';

const HelicorderWorkspace = () => {
  const heliChart = useRef<HelicorderChartRef | null>(null);
  const seisChart = useRef<Seismogram | null>(null);
  const pickerStore = usePickerStore();
  const { channelId, interval, duration, showEvent, useUTC, timeZone, setInterval, setDuration, setChannelId } = pickerStore;

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
      />
      <div className="flex-grow relative mt-1 flex h-full">
        <div className="relative w-1/3">
          <HelicorderChart ref={heliChart} channelId={channelId} interval={interval} duration={duration} initOptions={{
            grid: {
              top: 30,
              right: 80,
              bottom: 25,
              left: 80,
            }
          }} />
        </div>
        <div className="relative w-2/3 h-full flex flex-col">
          <div className="flex-1 relative">
            <SeismogramChart ref={seisChart} initOptions={{
              grid: {
                top: 30,
                right: 10,
                bottom: 5,
                left: 80,
              }
            }} />
          </div>
          <div className=" bg-white dark:bg-black relative flex items-center justify-end gap-2 mr-2 h-[20px]">
            <RealtimeClock />
            <span className="text-sm">{useUTC ? 'UTC' : timeZone}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelicorderWorkspace;
