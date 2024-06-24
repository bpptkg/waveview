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
  const initialRenderCompleteRef = useRef<boolean | null>(null);
  const selectingTrackRef = useRef<boolean | null>(null);

  const pickerStore = usePickerStore();
  const {
    channelId,
    offsetDate,
    interval,
    duration,
    showEvent,
    selectedChart,
    lastTrackExtent,
    lastSelection,
    setInterval,
    setDuration,
    setChannelId,
    setShowEvent,
    setSelectedChart,
    setOffsetDate,
    setLastTrackExtent,
    setLastSelection,
  } = pickerStore;

  const { darkMode } = useAppStore();

  // Helicorder Toolbar
  const handleHelicorderShiftViewUp = useCallback(() => {
    heliChartRef.current?.shiftViewUp();
  }, []);

  const handleHelicorderShiftViewDown = useCallback(() => {
    heliChartRef.current?.shiftViewDown();
  }, []);

  const handleHelicorderShiftViewToNow = useCallback(() => {
    const now = Date.now();
    heliChartRef.current?.setOffsetDate(now);
    setOffsetDate(now);
  }, [setOffsetDate]);

  const handleHelicorderIncreaseAmplitude = useCallback(() => {
    heliChartRef.current?.increaseAmplitude(0.05);
  }, []);

  const handleHelicorderDecreaseAmplitude = useCallback(() => {
    heliChartRef.current?.decreaseAmplitude(0.05);
  }, []);

  const handleHelicorderResetAmplitude = useCallback(() => {
    heliChartRef.current?.resetAmplitude();
  }, []);

  const handleHelicorderChannelChange = useCallback(
    (channelId: string) => {
      setChannelId(channelId);
    },
    [setChannelId]
  );

  const handleHelicorderChangeInterval = useCallback(
    (interval: number) => {
      setInterval(interval);
      heliChartRef.current?.setInterval(interval);
    },
    [setInterval]
  );

  const handleHelicorderChangeDuration = useCallback(
    (duration: number) => {
      setDuration(duration);
      heliChartRef.current?.setDuration(duration);
    },
    [setDuration]
  );

  const handleHelicorderShowEventChange = useCallback(
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

  // Seismogram Toolbar
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

  // Dark Mode
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

  // Track Selection
  const handleTrackSelected = useCallback(
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
    [setLastTrackExtent]
  );

  const handleTrackDeselected = useCallback(() => {
    // TODO
  }, []);

  // Focus/Blur
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

  const handleSeismogramExtentChange = useCallback(
    (extent: [number, number]) => {
      setLastTrackExtent(extent);
    },
    [setLastTrackExtent]
  );

  const handleHelicorderOffsetChange = useCallback(
    (date: number) => {
      setOffsetDate(date);
    },
    [setOffsetDate]
  );

  const handleHelicorderSelectionChange = useCallback(
    (selection: number) => {
      setLastSelection(selection);
    },
    [setLastSelection]
  );

  return (
    <>
      {selectedChart === 'helicorder' && (
        <HelicorderToolbar
          channelId={channelId}
          interval={interval}
          duration={duration}
          showEvent={showEvent}
          onShiftViewUp={handleHelicorderShiftViewUp}
          onShiftViewDown={handleHelicorderShiftViewDown}
          onShiftViewToNow={handleHelicorderShiftViewToNow}
          onIncreaseAmplitude={handleHelicorderIncreaseAmplitude}
          onDecreaseAmplitude={handleHelicorderDecreaseAmplitude}
          onResetAmplitude={handleHelicorderResetAmplitude}
          onChannelChange={handleHelicorderChannelChange}
          onIntervalChange={handleHelicorderChangeInterval}
          onDurationChange={handleHelicorderChangeDuration}
          onShowEventChange={handleHelicorderShowEventChange}
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
            initOptions={{
              interval,
              duration,
              channelId,
              darkMode,
              offsetDate,
              selection: lastSelection,
              grid: {
                top: 30,
                right: 80,
                bottom: 25,
                left: 80,
              },
              devicePixelRatio: window.devicePixelRatio,
            }}
            onTrackSelected={handleTrackSelected}
            onTrackDeselected={handleTrackDeselected}
            onFocus={handleHelicorderFocus}
            onBlur={handleHelicorderBlur}
            onOffsetChange={handleHelicorderOffsetChange}
            onSelectionChange={handleHelicorderSelectionChange}
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
                devicePixelRatio: window.devicePixelRatio,
                startTime: lastTrackExtent[0],
                endTime: lastTrackExtent[1],
              }}
              onFocus={handleSeismogramFocus}
              onBlur={handleSeismogramBlur}
              onExtentChange={handleSeismogramExtentChange}
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
