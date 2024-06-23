import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '../../stores/app';
import { usePickerStore } from '../../stores/picker';
import HelicorderChart, { HelicorderChartRef } from './HelicorderChart';
import RealtimeClock from './RealtimeClock';
import SeismogramChart, { SeismogramChartRef } from './SeismogramChart';
import TimeZoneSelector from './TimezoneSelector';
import HelicorderToolbar from './Toolbar/HelicorderToolbar';
import SeismogramToolbar from './Toolbar/SeismogramToolbar';

const HelicorderWorkspace = () => {
  const heliChartRef = useRef<HelicorderChartRef | null>(null);
  const seisChartRef = useRef<SeismogramChartRef | null>(null);
  const initialRenderCompleteRef = useRef<boolean>(false);

  const pickerStore = usePickerStore();
  const { channelId, interval, duration, showEvent, selectedChart, setInterval, setDuration, setChannelId, setShowEvent, setSelectedChart } = pickerStore;

  const { darkMode } = useAppStore();

  const handleShiftViewUp = useCallback(() => {
    heliChartRef.current?.shiftViewUp();
  }, []);

  const handleShiftViewDown = useCallback(() => {
    heliChartRef.current?.shiftViewDown();
  }, []);

  const handleShiftViewToNow = useCallback(() => {
    heliChartRef.current?.shiftViewToNow();
  }, []);

  const handleIncreaseAmplitude = useCallback(() => {
    heliChartRef.current?.increaseAmplitude(0.05);
  }, []);

  const handleDecreaseAmplitude = useCallback(() => {
    heliChartRef.current?.decreaseAmplitude(0.05);
  }, []);

  const handleResetAmplitude = useCallback(() => {
    heliChartRef.current?.resetAmplitude();
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
      heliChartRef.current?.setInterval(interval);
    },
    [setInterval]
  );

  const handleChangeDuration = useCallback(
    (duration: number) => {
      setDuration(duration);
      heliChartRef.current?.setDuration(duration);
    },
    [setDuration]
  );

  const handleShowEventChange = useCallback(
    (showEvent: boolean) => {
      setShowEvent(showEvent);
      if (showEvent) {
        seisChartRef.current?.showVisibleMarkers();
      } else {
        seisChartRef.current?.hideVisibleMarkers();
      }
    },
    [setShowEvent]
  );

  useEffect(() => {
    if (!initialRenderCompleteRef.current) {
      initialRenderCompleteRef.current = true;
      return;
    }

    if (darkMode) {
      heliChartRef.current?.setTheme('dark');
      seisChartRef.current?.setTheme('dark');
    } else {
      heliChartRef.current?.setTheme('light');
      seisChartRef.current?.setTheme('light');
    }
  }, [darkMode]);

  const handleTrackSelected = useCallback((trackId: number) => {
    if (heliChartRef.current && seisChartRef.current) {
      const extent = heliChartRef.current.getTrackExtent(trackId);
      seisChartRef.current.setExtent(extent);
    }
  }, []);

  const handleTrackDeselected = useCallback(() => {
    // TODO
  }, []);

  const handleHelicorderFocus = useCallback(() => {
    seisChartRef.current?.blur();
    setSelectedChart('helicorder');
  }, [setSelectedChart]);

  const handleHelicorderBlur = useCallback(() => {
    // TODO
  }, []);

  const handleSeismogramFocus = useCallback(() => {
    // TODO
    heliChartRef.current?.blur();
    setSelectedChart('seismogram');
  }, [setSelectedChart]);

  const handleSeismogramBlur = useCallback(() => {
    // TODO
  }, []);

  // Seismogram
  const handleSeismogramZoomIn = useCallback(() => {
    seisChartRef.current?.zoomIn(0.05);
  }, []);

  const handleSeismogramZoomOut = useCallback(() => {
    seisChartRef.current?.zoomOut(0.05);
  }, []);

  const handleSeismogramScrollLeft = useCallback(() => {
    seisChartRef.current?.scrollLeft(0.05);
  }, []);

  const handleSeismogramScrollRight = useCallback(() => {
    seisChartRef.current?.scrollRight(0.05);
  }, []);

  const handleSeismogramScrollToNow = useCallback(() => {
    seisChartRef.current?.scrollToNow();
  }, []);

  const handleSeismogramIncreaseAmplitude = useCallback(() => {
    seisChartRef.current?.increaseAmplitude(0.05);
  }, []);

  const handleSeismogramDecreaseAmplitude = useCallback(() => {
    seisChartRef.current?.decreaseAmplitude(0.05);
  }, []);

  const handleSeismogramResetAmplitude = useCallback(() => {
    seisChartRef.current?.resetAmplitude();
  }, []);

  const handleSeismogramShowEvent = useCallback(
    (showEvent: boolean) => {
      if (showEvent) {
        seisChartRef.current?.showVisibleMarkers();
        setShowEvent(true);
      } else {
        seisChartRef.current?.hideVisibleMarkers();
        setShowEvent(false);
      }
    },
    [setShowEvent]
  );

  const handleSeismogramZoomRectangleChange = useCallback((active: boolean) => {
    if (active) {
      seisChartRef.current?.activateZoomRectangle();
    } else {
      seisChartRef.current?.deactivateZoomRectangle();
    }
  }, []);

  return (
    <>
      {selectedChart === 'helicorder' && (
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
      )}
      {selectedChart === 'seismogram' && (
        <SeismogramToolbar
          showEvent={showEvent}
          onZoomIn={handleSeismogramZoomIn}
          onZoomOut={handleSeismogramZoomOut}
          onScrollLeft={handleSeismogramScrollLeft}
          onScrollRight={handleSeismogramScrollRight}
          onScrollToNow={handleSeismogramScrollToNow}
          onIncreaseAmplitude={handleSeismogramIncreaseAmplitude}
          onDecreaseAmplitude={handleSeismogramDecreaseAmplitude}
          onResetAmplitude={handleSeismogramResetAmplitude}
          onShowEventChange={handleSeismogramShowEvent}
          onZoomRectangleChange={handleSeismogramZoomRectangleChange}
        />
      )}
      <div className="flex-grow relative mt-1 flex h-full">
        <div className="relative w-1/3">
          <HelicorderChart
            ref={heliChartRef}
            className={selectedChart === 'helicorder' ? 'border border-brand-hosts-80' : 'border border-transparent'}
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
              channelId,
              darkMode,
            }}
            onTrackSelected={handleTrackSelected}
            onTrackDeselected={handleTrackDeselected}
            onFocused={handleHelicorderFocus}
            onBlurred={handleHelicorderBlur}
          />
        </div>
        <div className="relative w-2/3 h-full flex flex-col">
          <div className="flex-1 relative">
            <SeismogramChart
              ref={seisChartRef}
              className={selectedChart === 'seismogram' ? 'border border-brand-hosts-80' : 'border border-transparent'}
              initOptions={{
                channels: [
                  { id: 'VG.MEPAS.00.HHZ', label: 'VG.MEPAS' },
                  { id: 'VG.MELAB.00.HHz', label: 'VG.MELAB' },
                  { id: 'VG.MEPUS.00.HHz', label: 'VG.MEPUS' },
                  { id: 'VG.MEPLA.00.HHz', label: 'VG.MEPLA' },
                ],
                grid: {
                  top: 30,
                  right: 10,
                  bottom: 5,
                  left: 80,
                },
                darkMode,
              }}
              onFocused={handleSeismogramFocus}
              onBlurred={handleSeismogramBlur}
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
