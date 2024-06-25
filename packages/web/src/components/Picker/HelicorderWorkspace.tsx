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

  const {
    useUTC,
    channel,
    channels,
    offsetDate,
    interval,
    duration,
    showEvent,
    selectedChart,
    lastTrackExtent,
    lastSelection,
    seismogramToolbarCheckedValues,
    setHelicorderInterval,
    setHelicorderDuration,
    setHelicorderChannel,
    setShowEvent,
    setSelectedChart,
    setHelicorderOffsetDate,
    setLastTrackExtent,
    setLastSelection,
    seismogramToolbarSetCheckedValues,
    seismogramToolbarAddCheckedValue,
    seismogramToolbarRemoveCheckedValue,
    addSeismogramChannel,
  } = usePickerStore();

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
    setHelicorderOffsetDate(now);
  }, [setHelicorderOffsetDate]);

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
      setHelicorderChannel(channelId);
      heliChartRef.current?.setChannel(channelId);
    },
    [setHelicorderChannel]
  );

  const handleHelicorderChangeInterval = useCallback(
    (interval: number) => {
      setHelicorderInterval(interval);
      heliChartRef.current?.setInterval(interval);
    },
    [setHelicorderInterval]
  );

  const handleHelicorderChangeDuration = useCallback(
    (duration: number) => {
      setHelicorderDuration(duration);
      heliChartRef.current?.setDuration(duration);
    },
    [setHelicorderDuration]
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
  const handleSeismogramChannelAdd = useCallback(
    (channelId: string) => {
      addSeismogramChannel(channelId);
      seisChartRef.current?.addChannel(channelId);
    },
    [addSeismogramChannel]
  );

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
    seisChartRef.current?.deactivateZoomRectangle();
    seismogramToolbarRemoveCheckedValue('options', 'zoom-rectangle');
    setSelectedChart('helicorder');
  }, [seismogramToolbarRemoveCheckedValue, setSelectedChart]);

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
      setHelicorderOffsetDate(date);
    },
    [setHelicorderOffsetDate]
  );

  const handleHelicorderSelectionChange = useCallback(
    (selection: number) => {
      setLastSelection(selection);
    },
    [setLastSelection]
  );

  const handleSeismogramCheckValueChange = useCallback(
    (name: string, values: string[]) => {
      seismogramToolbarSetCheckedValues(name, values);
    },
    [seismogramToolbarSetCheckedValues]
  );

  // Keyboard Shortcuts
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

  // Initial Render
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

    heliChartRef.current?.setUseUTC(useUTC);
    seisChartRef.current?.setUseUTC(useUTC);
  }, [darkMode, useUTC]);

  return (
    <>
      {selectedChart === 'helicorder' && (
        <HelicorderToolbar
          channel={channel}
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
          checkedValues={seismogramToolbarCheckedValues}
          onChannelAdd={handleSeismogramChannelAdd}
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
        />
      )}
      <div className="flex-grow relative mt-1 flex flex-col h-full">
        <div className="flex-1 flex relative">
          <div className="relative w-1/3 h-full">
            <HelicorderChart
              ref={heliChartRef}
              className={selectedChart === 'helicorder' ? 'border border-brand-hosts-80' : 'border border-transparent'}
              initOptions={{
                interval,
                duration,
                channel,
                darkMode,
                offsetDate,
                selection: lastSelection,
                grid: {
                  top: 30,
                  right: 15,
                  bottom: 5,
                  left: 80,
                },
                devicePixelRatio: window.devicePixelRatio,
                useUTC,
              }}
              onTrackSelected={handleTrackSelected}
              onTrackDeselected={handleTrackDeselected}
              onFocus={handleHelicorderFocus}
              onBlur={handleHelicorderBlur}
              onOffsetChange={handleHelicorderOffsetChange}
              onSelectionChange={handleHelicorderSelectionChange}
            />
          </div>
          <div className="relative w-2/3 h-full">
            <SeismogramChart
              ref={seisChartRef}
              className={selectedChart === 'seismogram' ? 'border border-brand-hosts-80' : 'border border-transparent'}
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
                startTime: lastTrackExtent[0],
                endTime: lastTrackExtent[1],
                useUTC,
              }}
              onFocus={handleSeismogramFocus}
              onBlur={handleSeismogramBlur}
              onExtentChange={handleSeismogramExtentChange}
            />
          </div>
        </div>
        <div className="bg-white dark:bg-black relative flex items-center justify-end gap-2 mr-2 h-[20px]">
          <RealtimeClock />
          <TimeZoneSelector />
        </div>
      </div>
    </>
  );
};

export default HelicorderWorkspace;
