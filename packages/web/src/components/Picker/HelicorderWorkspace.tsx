import { Button, makeStyles } from '@fluentui/react-components';
import { ArrowReply20Regular } from '@fluentui/react-icons';
import { StreamIdentifier } from '@waveview/stream';
import { FederatedPointerEvent } from 'pixi.js';
import { useCallback, useMemo, useRef } from 'react';
import { useAppStore } from '../../stores/app';
import { usePickerStore } from '../../stores/picker';
import HelicorderChart, { HelicorderChartRef } from './HelicorderChart';
import RealtimeClock from './RealtimeClock';
import SeismogramChart, { SeismogramChartRef } from './SeismogramChart';
import SeismogramContextMenu, { ContextMenuRef } from './SeismogramContextMenu';
import TimeZoneSelector from './TimezoneSelector';
import HelicorderToolbar from './Toolbar/HelicorderToolbar';
import SeismogramToolbar from './Toolbar/SeismogramToolbar';
import { useHelicorderCallback } from './useHelicorderCallback';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useSeismogramCallback } from './useSeismogramCallback';
import { useThemeEffect } from './useThemeEffect';
import { useTimeZoneEffect } from './useTimeZoneEffect';
import EventDrawer from './EventDrawer/EventDrawer';
import PickEdit from './EventDrawer/PickEdit';
import PickGuide from './EventDrawer/PickGuide';
import { SeismicEvent } from '../../types/seismicEvent';

const useStyles = makeStyles({
  backButton: {
    position: 'absolute',
    left: '5px',
    top: '5px',
    zIndex: 10,
  },
});

const HelicorderWorkspace = () => {
  const heliChartRef = useRef<HelicorderChartRef | null>(null);
  const seisChartRef = useRef<SeismogramChartRef | null>(null);
  const contextMenuRef = useRef<ContextMenuRef | null>(null);

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
    isExpandMode,
    expandedChannelIndex,
    availableChannels,
    component,
    pickEnd,
    pickStart,
    isPickEmpty,
    setPickRange,
    getStationChannels,
    addEvent,
  } = usePickerStore();

  const { darkMode } = useAppStore();

  const styles = useStyles();

  const {
    handleHelicorderShiftViewUp,
    handleHelicorderShiftViewDown,
    handleHelicorderShiftViewToNow,
    handleHelicorderIncreaseAmplitude,
    handleHelicorderDecreaseAmplitude,
    handleHelicorderResetAmplitude,
    handleHelicorderChannelChange,
    handleHelicorderChangeInterval,
    handleHelicorderChangeDuration,
    handleHelicorderSelectOffsetDate,
    handleTrackSelected,
    handleHelicorderFocus,
    handleHelicorderOffsetChange,
    handleHelicorderSelectionChange,
  } = useHelicorderCallback(heliChartRef, seisChartRef);

  const {
    handleSeismogramChannelAdd,
    handleSeismogramZoomIn,
    handleSeismogramZoomOut,
    handleSeismogramScrollLeft,
    handleSeismogramScrollRight,
    handleSeismogramScrollToNow,
    handleSeismogramIncreaseAmplitude,
    handleSeismogramDecreaseAmplitude,
    handleSeismogramResetAmplitude,
    handleSeismogramComponentChange,
    handleSeismogramShowEvent,
    handleSeismogramZoomRectangleChange,
    handleSeismogramPickModeChange,
    handleSeismogramCheckValueChange,
    handleSeismogramRemoveChannel,
    handleSeismogramMoveChannelUp,
    handleSeismogramMoveChannelDown,
    handleTrackDoubleClicked,
    handleRestoreChannels,
    handleSeismogramFocus,
    handleSeismogramExtentChange,
    handleSeismogramPickChange,
  } = useSeismogramCallback(seisChartRef, heliChartRef);

  useKeyboardShortcuts(seisChartRef);
  useThemeEffect(heliChartRef, seisChartRef);
  useTimeZoneEffect(heliChartRef, seisChartRef);

  const handleContextMenuRequested = useCallback(
    (e: FederatedPointerEvent) => {
      if (!isExpandMode && seisChartRef.current) {
        contextMenuRef.current?.open(e, {
          chart: seisChartRef.current?.getInstance(),
        });
      }
    },
    [isExpandMode]
  );

  const initialChannels = useMemo(() => {
    if (isExpandMode && expandedChannelIndex !== null) {
      return getStationChannels(expandedChannelIndex);
    } else {
      return channels;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePickDurationChange = useCallback(
    (duration: number) => {
      const end = pickStart + duration * 1000;
      setPickRange([pickStart, end]);
      seisChartRef.current?.setPickRange([pickStart, end]);
    },
    [pickStart, setPickRange]
  );

  const handlePickCancel = useCallback(() => {
    setPickRange([0, 0]);
    seisChartRef.current?.clearPickRange();
  }, [setPickRange]);

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  const handlePickConfirm = useCallback(
    (event: SeismicEvent) => {
      if (pickStart && pickEnd) {
        addEvent(event);

        const color = getRandomColor();
        const { startTime, endTime } = event;
        seisChartRef.current?.addEventMarker(startTime, endTime, color);
        heliChartRef.current?.addEventMarker(startTime, color);
        seisChartRef.current?.clearPickRange();
        setPickRange([0, 0]);
      }
    },
    [pickStart, pickEnd, setPickRange, addEvent]
  );

  return (
    <>
      {selectedChart === 'helicorder' && (
        <HelicorderToolbar
          channel={channel}
          interval={interval}
          duration={duration}
          showEvent={showEvent}
          offsetDate={new Date(offsetDate)}
          availableChannels={availableChannels.filter((c) => c !== channel)}
          onShiftViewUp={handleHelicorderShiftViewUp}
          onShiftViewDown={handleHelicorderShiftViewDown}
          onShiftViewToNow={handleHelicorderShiftViewToNow}
          onIncreaseAmplitude={handleHelicorderIncreaseAmplitude}
          onDecreaseAmplitude={handleHelicorderDecreaseAmplitude}
          onResetAmplitude={handleHelicorderResetAmplitude}
          onChannelChange={handleHelicorderChannelChange}
          onIntervalChange={handleHelicorderChangeInterval}
          onDurationChange={handleHelicorderChangeDuration}
          onOffsetDateChange={handleHelicorderSelectOffsetDate}
        />
      )}
      {selectedChart === 'seismogram' && (
        <SeismogramToolbar
          showEvent={showEvent}
          checkedValues={seismogramToolbarCheckedValues}
          isExpandMode={isExpandMode}
          availableChannels={availableChannels.filter((c) => {
            return !channels.includes(c) && StreamIdentifier.fromId(c).channel.includes(component);
          })}
          component={component}
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
          onComponentChange={handleSeismogramComponentChange}
          onPickModeChange={handleSeismogramPickModeChange}
        />
      )}
      <div className="flex-grow relative mt-1 flex flex-col h-full">
        <div className="flex flex-1 relative">
          <div className="relative w-1/4 h-full">
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
              onFocus={handleHelicorderFocus}
              onOffsetChange={handleHelicorderOffsetChange}
              onSelectionChange={handleHelicorderSelectionChange}
            />
          </div>
          <div className="relative flex-1 h-full">
            <SeismogramChart
              ref={seisChartRef}
              className={selectedChart === 'seismogram' ? 'border border-brand-hosts-80' : 'border border-transparent'}
              initOptions={{
                channels: initialChannels,
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
              onExtentChange={handleSeismogramExtentChange}
              onContextMenuRequested={handleContextMenuRequested}
              onTrackDoubleClick={handleTrackDoubleClicked}
              onPick={handleSeismogramPickChange}
            />
            {isExpandMode && (
              <Button className={styles.backButton} icon={<ArrowReply20Regular />} size="small" appearance="transparent" onClick={handleRestoreChannels} />
            )}
            <SeismogramContextMenu
              onRemoveChannel={handleSeismogramRemoveChannel}
              onMoveChannelUp={handleSeismogramMoveChannelUp}
              onMoveChannelDown={handleSeismogramMoveChannelDown}
              ref={contextMenuRef}
            />
          </div>
          <div className="relative w-[300px] h-full">
            <EventDrawer>
              {isPickEmpty() && <PickGuide />}
              {!isPickEmpty() && (
                <PickEdit
                  start={pickStart}
                  duration={(pickEnd - pickStart) / 1000}
                  onDurationChange={handlePickDurationChange}
                  onCancel={handlePickCancel}
                  onConfirm={handlePickConfirm}
                />
              )}
            </EventDrawer>
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
