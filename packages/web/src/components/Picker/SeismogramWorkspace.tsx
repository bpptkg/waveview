import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '../../stores/app';
import { usePickerStore } from '../../stores/picker';
import RealtimeClock from './RealtimeClock';
import SeismogramChart, { SeismogramChartRef } from './SeismogramChart';
import TimeRangeSelector from './TimeRangeSelector';
import TimeZoneSelector from './TimezoneSelector';
import SeismogramToolbar from './Toolbar/SeismogramToolbar';
import { useSeismogramStore } from '../../stores/seismogram';

const SeismogramWorkspace = () => {
  const seisChartRef = useRef<SeismogramChartRef | null>(null);
  const initialRenderCompleteRef = useRef<boolean>(false);

  const {
    channels,
    useUTC,
    showEvent,
    lastSeismogramExtent,
    seismogramToolbarCheckedValues,
    setShowEvent,
    setLastSeismogramExtent,
    seismogramToolbarSetCheckedValues,
    seismogramToolbarAddCheckedValue,
    seismogramToolbarRemoveCheckedValue,
    addSeismogramChannel,
    removeSeismogramChannel,
    moveChannel,
  } = usePickerStore();
  const { darkMode } = useAppStore();

  const {offsetDate, setOffsetDate} = useSeismogramStore()

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
    setOffsetDate(end)
  }, [setOffsetDate]);

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

  const handleSeismogramCheckValueChange = useCallback(
    (name: string, values: string[]) => {
      seismogramToolbarSetCheckedValues(name, values);
    },
    [seismogramToolbarSetCheckedValues]
  );

  const handleSeismogramChannelAdd = useCallback(
    (channelId: string) => {
      addSeismogramChannel(channelId);
      seisChartRef.current?.addChannel(channelId);
    },
    [addSeismogramChannel]
  );

  const handleSeismogramRemoveChannel = useCallback(
    (index: number) => {
      removeSeismogramChannel(index);
      seisChartRef.current?.removeChannel(index);
    },
    [removeSeismogramChannel]
  );

  const handleSeismogramMoveChannelUp = useCallback(
    (index: number) => {
      if (index > 0) {
        moveChannel(index, index - 1);
        seisChartRef.current?.moveChannelUp(index);
      }
    },
    [moveChannel]
  );

  const handleSeismogramMoveChannelDown = useCallback(
    (index: number) => {
      if (index < channels.length - 1) {
        moveChannel(index, index + 1);
        seisChartRef.current?.moveChannelDown(index);
      }
    },
    [moveChannel, channels]
  );

  // Zoom Rectangle Keydown
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!seisChartRef.current || !seisChartRef.current.isFocused()) {
        return;
      }

      switch (event.key) {
        case 'z':
        case 'Z': {
          if (seisChartRef.current.isZoomRectangleActive()) {
            seisChartRef.current.deactivateZoomRectangle();
            seismogramToolbarRemoveCheckedValue('options', 'zoom-rectangle');
          } else {
            seisChartRef.current?.activateZoomRectangle();
            seismogramToolbarAddCheckedValue('options', 'zoom-rectangle');
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [seismogramToolbarAddCheckedValue, seismogramToolbarRemoveCheckedValue]);

  // Focus on Mount
  useEffect(() => {
    seisChartRef.current?.focus();
  }, []);

  // Initial Render
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

    seisChartRef.current?.setUseUTC(useUTC);
  }, [darkMode, useUTC]);

  return (
    <>
      <SeismogramToolbar
        showEvent={showEvent}
        checkedValues={seismogramToolbarCheckedValues}
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
        onCheckedValueChange={handleSeismogramCheckValueChange}
        onChannelAdd={handleSeismogramChannelAdd}
      />
      <div className="flex-grow relative mt-1 flex h-full">
        <SeismogramChart
          ref={seisChartRef}
          initOptions={{
            channels,
            grid: {
              top: 30,
              right: 20,
              bottom: 5,
              left: 80,
            },
            darkMode,
            devicePixelRatio: window.devicePixelRatio,
            startTime: lastSeismogramExtent[0],
            endTime: lastSeismogramExtent[1],
            useUTC,
          }}
          onExtentChange={handleSeismogramExtentChange}
          onRemoveChannel={handleSeismogramRemoveChannel}
          onMoveChannelUp={handleSeismogramMoveChannelUp}
          onMoveChannelDown={handleSeismogramMoveChannelDown}
        />
      </div>
      <div className="bg-white dark:bg-black">
        <div className="ml-[80px] flex items-center justify-between">
          <TimeRangeSelector offsetDate={new Date(offsetDate)} onSelected={handleSeismogramTimeRangeSelected} />
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
