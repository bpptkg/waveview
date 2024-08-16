import { Button, makeStyles } from '@fluentui/react-components';
import { ArrowReply20Regular } from '@fluentui/react-icons';
import { FederatedPointerEvent } from 'pixi.js';
import { useCallback, useEffect, useRef } from 'react';
import { uuid4 } from '../../shared/uuid';
import { useAppStore } from '../../stores/app';
import { useAuthStore } from '../../stores/auth';
import { useCatalogStore } from '../../stores/catalog';
import { useInventoryStore } from '../../stores/inventory';
import { useOrganizationStore } from '../../stores/organization';
import { usePickerStore } from '../../stores/picker';
import { SeismicEvent } from '../../types/event';
import { EventResponseData } from '../../types/fetcher';
import EventDrawer from './EventDrawer/EventDrawer';
import PickEdit from './EventDrawer/PickEdit';
import PickGuide from './EventDrawer/PickGuide';
import { HelicorderChart, HelicorderChartRef } from './HelicorderChart';
import { SeismogramChart, SeismogramChartRef } from './SeismogramChart';
import SeismogramContextMenu, { ContextMenuRef } from './SeismogramContextMenu';
import StatusBar from './StatusBar';
import HelicorderToolbar from './Toolbar/HelicorderToolbar';
import SeismogramToolbar from './Toolbar/SeismogramToolbar';
import { useFetcherWorker } from './useFetchWorker';
import { useHelicorderCallback } from './useHelicorderCallback';
import { useSeismogramCallback } from './useSeismogramCallback';
import { useThemeEffect } from './useThemeEffect';
import { useTimeZoneEffect } from './useTimeZoneEffect';

export interface PickWorkspaceProps {
  showMarkersOnReady?: boolean;
  event?: SeismicEvent;
}

const useStyles = makeStyles({
  backButton: {
    position: 'absolute',
    left: '5px',
    top: '5px',
    zIndex: 10,
  },
});

const PickerWorkspace: React.FC<PickWorkspaceProps> = (props) => {
  const { showMarkersOnReady = false } = props;

  const heliChartRef = useRef<HelicorderChartRef | null>(null);
  const seisChartRef = useRef<SeismogramChartRef | null>(null);
  const contextMenuRef = useRef<ContextMenuRef | null>(null);
  const heliChartReadyRef = useRef<boolean>(false);
  const seisChartReadyRef = useRef<boolean>(false);

  const { channels } = useInventoryStore();
  const { darkMode, useUTC } = useAppStore();
  const styles = useStyles();

  const {
    channelId,
    component,
    duration,
    interval,
    isExpandMode,
    offsetDate,
    pickEnd,
    pickStart,
    seismogramToolbarCheckedValues,
    selectedChart,
    showEvent,
    selectedChannels,
    eventMarkers,
    isPickEmpty,
    setPickRange,
    isPickModeActive,
    addEventMarker,
    clearEventMarkers,
    deactivatePickMode,
    clearPick,
  } = usePickerStore();

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
    handleHelicorderOnReady,
  } = useHelicorderCallback(heliChartRef, seisChartRef, heliChartReadyRef);

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
    handleRestoreChannels,
    handleSeismogramFocus,
    handleSeismogramExtentChange,
    handleSeismogramPickChange,
    handleSeismogramDeactivatePickMode,
    handleSeismogramOnReady,
  } = useSeismogramCallback(seisChartRef, heliChartRef, seisChartReadyRef);

  useThemeEffect(heliChartRef, seisChartRef);
  useTimeZoneEffect(heliChartRef, seisChartRef);

  const { currentOrganization } = useOrganizationStore();
  const { currentCatalog } = useCatalogStore();
  const { token } = useAuthStore();

  useEffect(() => {
    return () => {
      deactivatePickMode();
      clearPick();
    };
  }, [deactivatePickMode, clearPick]);

  useEffect(() => {
    if (!showMarkersOnReady) {
      return;
    }

    if (heliChartReadyRef.current && seisChartReadyRef.current) {
      eventMarkers.forEach((event) => {
        heliChartRef.current?.addEventMarker({ value: new Date(event.time).getTime(), color: event.type.color, width: 3 });
        seisChartRef.current?.addEventMarker({
          start: new Date(event.time).getTime(),
          end: new Date(event.time).getTime() + event.duration * 1_000,
          color: event.type.color,
        });
      });
    }
  }, [eventMarkers, showMarkersOnReady]);

  const { fetcherWorkerRef } = useFetcherWorker({
    onMessage: (event: EventResponseData) => {
      clearEventMarkers();

      const { events } = event;
      events.forEach((event) => {
        addEventMarker(event);
      });

      heliChartRef.current?.clearAllEventMarkers();
      seisChartRef.current?.clearAllEventMarkers();

      eventMarkers.forEach((event) => {
        heliChartRef.current?.addEventMarker({ value: new Date(event.time).getTime(), color: event.type.color, width: 3 });
        seisChartRef.current?.addEventMarker({
          start: new Date(event.time).getTime(),
          end: new Date(event.time).getTime() + event.duration * 1_000,
          color: event.type.color,
        });
      });
    },
  });

  const handleFetchEvents = useCallback(() => {
    const helicorderExtent = heliChartRef.current?.getChartExtent();
    if (helicorderExtent && currentOrganization && currentCatalog && token) {
      const [start, end] = helicorderExtent;
      fetcherWorkerRef.current?.fetchEvents({
        requestId: uuid4(),
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
        organizationId: currentOrganization.id,
        catalogId: currentCatalog.id,
        accessToken: token.access,
      });
    }
  }, [heliChartRef, fetcherWorkerRef, currentOrganization, currentCatalog, token]);

  const handleContextMenuRequested = useCallback((e: FederatedPointerEvent) => {
    if (seisChartRef.current) {
      contextMenuRef.current?.open(e, {
        chart: seisChartRef.current?.getInstance(),
      });
    }
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
    clearPick();
    seisChartRef.current?.clearPickRange();
  }, [clearPick]);

  const handlePickSave = useCallback(
    (event: SeismicEvent) => {
      addEventMarker(event);

      if (pickStart && pickEnd) {
        const { time, duration } = event;
        const start = new Date(time).getTime();
        const end = start + duration * 1_000;
        seisChartRef.current?.addEventMarker({
          start,
          end,
          color: event.type.color,
        });
        heliChartRef.current?.addEventMarker({ value: start, color: event.type.color });
        seisChartRef.current?.clearPickRange();
        clearPick();
      }
    },
    [pickStart, pickEnd, clearPick, addEventMarker]
  );

  return (
    <>
      {selectedChart === 'helicorder' && (
        <HelicorderToolbar
          channelId={channelId}
          interval={interval}
          duration={duration}
          showEvent={showEvent}
          offsetDate={new Date(offsetDate)}
          availableChannels={channels()}
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
          onShowEventChange={handleSeismogramShowEvent}
        />
      )}
      {selectedChart === 'seismogram' && (
        <SeismogramToolbar
          showEvent={showEvent}
          checkedValues={seismogramToolbarCheckedValues}
          isExpandMode={isExpandMode}
          availableChannels={channels()}
          selectedChannels={selectedChannels}
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
                channel: {
                  id: channelId,
                },
                darkMode,
                offsetDate,
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
              onOffsetChange={(date: number) => {
                handleHelicorderOffsetChange(date);
                handleFetchEvents();
              }}
              onSelectionChange={handleHelicorderSelectionChange}
              onReady={handleHelicorderOnReady}
            />
          </div>
          <div className="relative flex-1 h-full">
            <SeismogramChart
              ref={seisChartRef}
              className={selectedChart === 'seismogram' ? 'border border-brand-hosts-80' : 'border border-transparent'}
              initOptions={{
                channels: selectedChannels.map((channel) => ({
                  id: channel.id,
                  label: channel.network_station_code,
                })),
                grid: {
                  top: 30,
                  right: 20,
                  bottom: 5,
                  left: 80,
                },
                darkMode,
                devicePixelRatio: window.devicePixelRatio,
                useUTC,
              }}
              onFocus={handleSeismogramFocus}
              onExtentChange={handleSeismogramExtentChange}
              onContextMenuRequested={handleContextMenuRequested}
              onPick={handleSeismogramPickChange}
              onReady={handleSeismogramOnReady}
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
          {isPickModeActive() && (
            <div className="relative w-[300px] h-full">
              <EventDrawer>
                {isPickEmpty() && <PickGuide onClose={handleSeismogramDeactivatePickMode} />}
                {!isPickEmpty() && (
                  <PickEdit
                    time={pickStart}
                    duration={(pickEnd - pickStart) / 1000}
                    onDurationChange={handlePickDurationChange}
                    onCancel={handlePickCancel}
                    onSave={handlePickSave}
                  />
                )}
              </EventDrawer>
            </div>
          )}
        </div>
        <StatusBar />
      </div>
    </>
  );
};

export default PickerWorkspace;
