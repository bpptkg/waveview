import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '../../stores/app';
import { usePickerStore } from '../../stores/picker';
import RealtimeClock from './RealtimeClock';
import SeismogramChart, { SeismogramChartRef } from './SeismogramChart';
import TimeRangeSelector from './TimeRangeSelector';
import TimeZoneSelector from './TimezoneSelector';
import SeismogramToolbar from './Toolbar/SeismogramToolbar';

const SeismogramWorkspace = () => {
  const seisChartRef = useRef<SeismogramChartRef | null>(null);
  const initialRenderCompleteRef = useRef<boolean>(false);

  const { showEvent, lastSeismogramExtent, setShowEvent, setLastSeismogramExtent } = usePickerStore();
  const { darkMode } = useAppStore();

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

  const handleSeismogramTimeRangeSelected = useCallback((start: number, end: number) => {
    seisChartRef.current?.setExtent([start, end]);
  }, []);

  const handleSeismogramZoomRectangleChange = useCallback(
    (active: boolean) => {
      if (active) {
        seisChartRef.current?.activateZoomRectangle();
      } else {
        seisChartRef.current?.deactivateZoomRectangle();
      }
    },
    [seisChartRef]
  );

  const handleSeismogramExtentChange = useCallback(
    (extent: [number, number]) => {
      setLastSeismogramExtent(extent);
    },
    [setLastSeismogramExtent]
  );

  useEffect(() => {
    if (!initialRenderCompleteRef.current) {
      initialRenderCompleteRef.current = true;
      return;
    }

    if (darkMode) {
      seisChartRef.current?.setTheme('dark');
    } else {
      seisChartRef.current?.setTheme('light');
    }
  }, [darkMode]);

  useEffect(() => {
    seisChartRef.current?.focus();
  }, []);

  return (
    <>
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
      <div className="flex-grow relative mt-1 flex h-full">
        <SeismogramChart
          ref={seisChartRef}
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
            startTime: lastSeismogramExtent[0],
            endTime: lastSeismogramExtent[1],
          }}
          onExtentChange={handleSeismogramExtentChange}
        />
      </div>
      <div className=" bg-white dark:bg-black">
        <div className="ml-[80px] flex items-center justify-between">
          <TimeRangeSelector onSelected={handleSeismogramTimeRangeSelected} />
          <div className="flex items-center gap-2 mr-2">
            <RealtimeClock />
            <TimeZoneSelector />
          </div>
        </div>
      </div>
    </>
  );
};

export default SeismogramWorkspace;
