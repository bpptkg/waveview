import { Button, makeStyles } from '@fluentui/react-components';
import { ArrowReply20Regular } from '@fluentui/react-icons';
import { FederatedPointerEvent } from 'pixi.js';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { getEventTypeColor } from '../../shared/theme';
import { uuid4 } from '../../shared/uuid';
import { useAppStore } from '../../stores/app';
import { useAuthStore } from '../../stores/auth';
import { useCatalogStore } from '../../stores/catalog';
import { useInventoryStore } from '../../stores/inventory';
import { useOrganizationStore } from '../../stores/organization';
import { usePickerStore } from '../../stores/picker';
import { SeismicEventDetail } from '../../types/event';
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

export type EditedEvent = SeismicEventDetail;

export interface PickWorkspaceProps {
  /**
   * The seismic event to be edited. If provided, the picker will be in event
   * editing mode. Otherwise, it will be in pick mode.
   */
  event?: EditedEvent;
  /**
   * Whether the helicorder chart should be shown.
   */
  showHelicorder?: boolean;
  /**
   * Whether the seismogram chart should be shown.
   */
  showSeismogram?: boolean;
  /**
   * Whether the event markers should be shown on the charts.
   */
  showEventMarkers?: boolean;
  /**
   * Callback to be called when the event is saved to the server.
   */
  onSave?: (event: SeismicEventDetail) => void;
  /**
   * Callback to be called when the picker is canceled or closed.
   */
  onCancel?: () => void;
}

const useStyles = makeStyles({
  backButton: {
    position: 'absolute',
    left: '5px',
    top: '5px',
    zIndex: 10,
  },
});

const ONE_SECOND = 1_000;

const getPickExtent = (event: EditedEvent) => {
  const start = new Date(event.time).getTime();
  const end = start + event.duration * ONE_SECOND;
  return [start, end];
};

const calcHelicorderOffsetDate = (event: EditedEvent) => {
  const [start, end] = getPickExtent(event);
  return new Date((start + end) / 2);
};

const PickerWorkspace: React.FC<PickWorkspaceProps> = (props) => {
  const { event, showEventMarkers = true, showHelicorder = true, showSeismogram = true, onSave, onCancel } = props;

  const workspaceRef = useRef<HTMLDivElement | null>(null);
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
    setSelectedChart,
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
    handleRestoreChannels,
    handleSeismogramFocus,
    handleSeismogramExtentChange,
    handleSeismogramPickChange,
    handleSeismogramDeactivatePickMode,
    handleSeismogramOnReady,
  } = useSeismogramCallback(seisChartRef, heliChartRef);

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
    const handleClickOutside = (event: MouseEvent) => {
      if (workspaceRef.current && !workspaceRef.current.contains(event.target as Node)) {
        heliChartRef.current?.blur();
        seisChartRef.current?.blur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isEditMode = useMemo(() => {
    return !!event;
  }, [event]);

  const setupEventEditing = useCallback(
    (event: EditedEvent) => {
      if (event) {
        const [start, end] = getPickExtent(event);
        setPickRange([start, end]);
        seisChartRef.current?.setPickRange([start, end]);

        handleSeismogramCheckValueChange('options', ['pick-mode']);
        handleSeismogramPickModeChange(true);
        setSelectedChart('seismogram');
        handleSeismogramFocus();
      }
    },
    [setPickRange, setSelectedChart, handleSeismogramCheckValueChange, handleSeismogramPickModeChange, handleSeismogramFocus]
  );

  const clearEventEditing = useCallback(() => {
    handleSeismogramCheckValueChange('options', []);
    handleSeismogramPickModeChange(false);
  }, [handleSeismogramCheckValueChange, handleSeismogramPickModeChange]);

  const plotEventMarkers = useCallback(() => {
    eventMarkers.forEach((event) => {
      const color = getEventTypeColor(event.type, darkMode);
      heliChartRef.current?.addEventMarker({ value: new Date(event.time).getTime(), color, width: 3 });
      seisChartRef.current?.addEventMarker({
        start: new Date(event.time).getTime(),
        end: new Date(event.time).getTime() + event.duration * 1_000,
        color,
      });
    });
  }, [eventMarkers, darkMode]);

  useEffect(() => {
    if (!showEventMarkers) {
      return;
    }

    if (heliChartReadyRef.current && seisChartReadyRef.current) {
      plotEventMarkers();
    }
  }, [showEventMarkers, plotEventMarkers]);

  const { fetcherWorkerRef } = useFetcherWorker({
    onMessage: (event: EventResponseData) => {
      if (!showEventMarkers) {
        return;
      }

      clearEventMarkers();

      const { events } = event;
      events.forEach((event) => {
        addEventMarker(event);
      });

      heliChartRef.current?.clearAllEventMarkers();
      seisChartRef.current?.clearAllEventMarkers();

      plotEventMarkers();
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
    onCancel?.();
  }, [clearPick, onCancel]);

  const handlePickSave = useCallback(
    (savedEvent: SeismicEventDetail) => {
      onSave?.(savedEvent);

      if (!isEditMode) {
        addEventMarker(savedEvent);
      }

      if (pickStart && pickEnd) {
        const { time, duration } = savedEvent;
        const start = new Date(time).getTime();
        const end = start + duration * 1_000;
        const color = getEventTypeColor(savedEvent.type, darkMode);
        seisChartRef.current?.addEventMarker({
          start,
          end,
          color,
        });
        heliChartRef.current?.addEventMarker({ value: start, color, width: 3 });
        seisChartRef.current?.clearPickRange();
        clearPick();
      }
    },
    [pickStart, pickEnd, isEditMode, darkMode, clearPick, addEventMarker, onSave]
  );

  const handleUnifiedHelicorderOnReady = useCallback(() => {
    heliChartReadyRef.current = true;
    handleHelicorderOnReady();
  }, [handleHelicorderOnReady]);

  const handleUnifiedSeismogramOnReady = useCallback(() => {
    seisChartReadyRef.current = true;
    handleSeismogramOnReady();

    if (event) {
      setupEventEditing(event);
    }
  }, [event, setupEventEditing, handleSeismogramOnReady]);

  // Clear event editing when picker is closed.
  useEffect(() => {
    return () => {
      clearEventEditing();
    };
  }, [clearEventEditing]);

  const helicorderClassName = useMemo(() => {
    if (event) {
      return 'border border-transparent';
    }
    return selectedChart === 'helicorder' ? 'border border-brand-hosts-80' : 'border border-transparent';
  }, [selectedChart, event]);

  const seismogramClassName = useMemo(() => {
    if (event) {
      return 'border border-transparent';
    }
    return selectedChart === 'seismogram' ? 'border border-brand-hosts-80' : 'border border-transparent';
  }, [selectedChart, event]);

  const helicorderInitOptions = useMemo(() => {
    const initialOffsetDate = event ? calcHelicorderOffsetDate(event) : new Date(offsetDate);
    const initOptions = {
      interval,
      duration,
      channel: {
        id: channelId,
      },
      darkMode,
      offsetDate: initialOffsetDate.getTime(),
      grid: {
        top: 30,
        right: 15,
        bottom: 5,
        left: 80,
      },
      devicePixelRatio: window.devicePixelRatio,
      useUTC,
    };
    return initOptions;
  }, [interval, duration, channelId, darkMode, offsetDate, useUTC, event]);

  const seismogramInitOptions = useMemo(() => {
    const determinteInitialExtent = () => {
      if (event) {
        const [start, end] = getPickExtent(event);
        const margin = 10 * ONE_SECOND;
        return [start - margin, end + margin];
      }

      return [undefined, undefined];
    };
    const [startTime, endTime] = determinteInitialExtent();

    const initOptions = {
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
      startTime,
      endTime,
    };
    return initOptions;
  }, [selectedChannels, darkMode, useUTC, event]);

  return (
    <div className="flex flex-col flex-grow relative overflow-hidden" ref={workspaceRef}>
      {selectedChart === 'helicorder' && showHelicorder && (
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

      {selectedChart === 'seismogram' && showSeismogram && (
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
          {showHelicorder && (
            <div className="relative w-1/4 h-full">
              <HelicorderChart
                ref={heliChartRef}
                className={helicorderClassName}
                initOptions={helicorderInitOptions}
                onTrackSelected={handleTrackSelected}
                onFocus={handleHelicorderFocus}
                onOffsetChange={(date: number) => {
                  handleHelicorderOffsetChange(date);
                  handleFetchEvents();
                }}
                onSelectionChange={handleHelicorderSelectionChange}
                onReady={handleUnifiedHelicorderOnReady}
              />
            </div>
          )}

          {showSeismogram && (
            <div className="relative flex-1 h-full">
              <SeismogramChart
                ref={seisChartRef}
                className={seismogramClassName}
                initOptions={seismogramInitOptions}
                onFocus={handleSeismogramFocus}
                onExtentChange={handleSeismogramExtentChange}
                onContextMenuRequested={handleContextMenuRequested}
                onPick={handleSeismogramPickChange}
                onReady={handleUnifiedSeismogramOnReady}
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
          )}

          {isPickModeActive() && (
            <div className="relative w-[300px] h-full">
              <EventDrawer>
                {isPickEmpty() ? (
                  <PickGuide onClose={handleSeismogramDeactivatePickMode} />
                ) : (
                  <PickEdit
                    eventId={event?.id}
                    time={pickStart}
                    duration={(pickEnd - pickStart) / 1000}
                    eventType={event?.type.id}
                    stationOfFirstArrival={event?.station_of_first_arrival_id}
                    note={event?.note}
                    useUTC={useUTC}
                    attachments={event?.attachments}
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
    </div>
  );
};

export default PickerWorkspace;
