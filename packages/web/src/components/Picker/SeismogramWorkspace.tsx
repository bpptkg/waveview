import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '../../stores/app';
import { usePickerStore } from '../../stores/picker';
import RealtimeClock from './RealtimeClock';
import SeismogramChart, { SeismogramChartRef } from './SeismogramChart';
import TimeRangeSelector from './TimeRangeSelector';
import TimeZoneSelector from './TimezoneSelector';
import SeismogramToolbar from './Toolbar/SeismogramToolbar';

const SeismogramWorkspace = () => {
  const seisChart = useRef<SeismogramChartRef | null>(null);
  const initialRenderCompleteRef = useRef<boolean>(false);
  const { showEvent, setShowEvent } = usePickerStore();
  const { darkMode } = useAppStore();

  const handleZoomIn = useCallback(() => {
    seisChart.current?.zoomIn(0.05);
  }, []);

  const handleZoomOut = useCallback(() => {
    seisChart.current?.zoomOut(0.05);
  }, []);

  const handleScrollLeft = useCallback(() => {
    seisChart.current?.scrollLeft(0.05);
  }, []);

  const handleScrollRight = useCallback(() => {
    seisChart.current?.scrollRight(0.05);
  }, []);

  const handleScrollToNow = useCallback(() => {
    seisChart.current?.scrollToNow();
  }, []);

  const handleIncreaseAmplitude = useCallback(() => {
    seisChart.current?.increaseAmplitude(0.05);
  }, []);

  const handleDecreaseAmplitude = useCallback(() => {
    seisChart.current?.decreaseAmplitude(0.05);
  }, []);

  const handleResetAmplitude = useCallback(() => {
    seisChart.current?.resetAmplitude();
  }, []);

  const handleShowEvent = useCallback(
    (showEvent: boolean) => {
      if (showEvent) {
        seisChart.current?.showVisibleMarkers();
        setShowEvent(true);
      } else {
        seisChart.current?.hideVisibleMarkers();
        setShowEvent(false);
      }
    },
    [setShowEvent]
  );

  const handleTimeRangeSelected = useCallback((start: number, end: number) => {
    seisChart.current?.setExtent([start, end]);
  }, []);

  const handleZoomRectangleChange = useCallback(
    (active: boolean) => {
      if (active) {
        seisChart.current?.activateZoomRectangle();
      } else {
        seisChart.current?.deactivateZoomRectangle();
      }
    },
    [seisChart]
  );

  useEffect(() => {
    if (!initialRenderCompleteRef.current) {
      initialRenderCompleteRef.current = true;
      return;
    }

    if (darkMode) {
      seisChart.current?.setTheme('dark');
    } else {
      seisChart.current?.setTheme('light');
    }
  }, [darkMode]);

  useEffect(() => {
    seisChart.current?.focus();
  }, []);

  return (
    <>
      <SeismogramToolbar
        showEvent={showEvent}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onScrollLeft={handleScrollLeft}
        onScrollRight={handleScrollRight}
        onScrollToNow={handleScrollToNow}
        onIncreaseAmplitude={handleIncreaseAmplitude}
        onDecreaseAmplitude={handleDecreaseAmplitude}
        onResetAmplitude={handleResetAmplitude}
        onShowEventChange={handleShowEvent}
        onZoomRectangleChange={handleZoomRectangleChange}
      />
      <div className="flex-grow relative mt-1 flex h-full">
        <SeismogramChart
          ref={seisChart}
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
        />
      </div>
      <div className=" bg-white dark:bg-black">
        <div className="ml-[80px] flex items-center justify-between">
          <TimeRangeSelector onSelected={handleTimeRangeSelected} />
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
