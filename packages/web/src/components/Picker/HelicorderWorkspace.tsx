import { Button, makeStyles } from '@fluentui/react-components';
import { ArrowReply20Regular } from '@fluentui/react-icons';
import { useRef } from 'react';
import { useAppStore } from '../../stores/app';
import { usePickerStore } from '../../stores/picker';
import HelicorderChart, { HelicorderChartRef } from './HelicorderChart';
import RealtimeClock from './RealtimeClock';
import SeismogramChart, { SeismogramChartRef } from './SeismogramChart';
import TimeZoneSelector from './TimezoneSelector';
import HelicorderToolbar from './Toolbar/HelicorderToolbar';
import SeismogramToolbar from './Toolbar/SeismogramToolbar';
import { useHelicorderCallback } from './useHelicorderCallback';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useSeismogramCallback } from './useSeismogramCallback';
import { useThemeEffect } from './useThemeEffect';
import { useTimeZoneEffect } from './useTimeZoneEffect';

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
    handleSeismogramShowEvent,
    handleSeismogramZoomRectangleChange,
    handleSeismogramCheckValueChange,
    handleSeismogramRemoveChannel,
    handleSeismogramMoveChannelUp,
    handleSeismogramMoveChannelDown,
    handleTrackDoubleClicked,
    handleRestoreChannels,
    handleSeismogramFocus,
    handleSeismogramExtentChange,
  } = useSeismogramCallback(seisChartRef, heliChartRef);

  useKeyboardShortcuts(seisChartRef);
  useThemeEffect(heliChartRef, seisChartRef);
  useTimeZoneEffect(heliChartRef, seisChartRef);

  return (
    <>
      {selectedChart === 'helicorder' && (
        <HelicorderToolbar
          channel={channel}
          interval={interval}
          duration={duration}
          showEvent={showEvent}
          offsetDate={new Date(offsetDate)}
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
              onFocus={handleHelicorderFocus}
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
              onExtentChange={handleSeismogramExtentChange}
              onRemoveChannel={handleSeismogramRemoveChannel}
              onMoveChannelUp={handleSeismogramMoveChannelUp}
              onMoveChannelDown={handleSeismogramMoveChannelDown}
              onTrackDoubleClick={handleTrackDoubleClicked}
            />
            <Button className={styles.backButton} icon={<ArrowReply20Regular />} size="small" appearance="transparent" onClick={handleRestoreChannels}></Button>
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
