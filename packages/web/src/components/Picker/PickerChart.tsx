import { useEffect, useMemo, useRef } from 'react';
import { ONE_SECOND } from '../../shared/time';
import { useAppStore } from '../../stores/app';
import { usePickerStore } from '../../stores/picker';
import EventDrawer from './EventDrawer/EventDrawer';
import PickEdit from './EventDrawer/PickEdit';
import PickGuide from './EventDrawer/PickGuide';
import { HelicorderChart, HelicorderChartRef } from './HelicorderChart';
import { usePickerContext } from './PickerContext';
import { EditedEvent } from './PickerWorkspace.types';
import { SeismogramChart, SeismogramChartRef } from './SeismogramChart';
import SeismogramContextMenu, { ContextMenuRef } from './SeismogramContextMenu';
import { usePickerCallback } from './usePickerCallback';
import { useThemeEffect } from './useThemeEffect';
import { useTimeZoneEffect } from './useTimeZoneEffect';

const getPickExtent = (event: EditedEvent) => {
  const start = new Date(event.time).getTime();
  const end = start + event.duration * ONE_SECOND;
  return [start, end];
};

const calcHelicorderOffsetDate = (event: EditedEvent) => {
  const [start, end] = getPickExtent(event);
  return new Date((start + end) / 2);
};

const PickerChart = () => {
  const heliChartRef = useRef<HelicorderChartRef | null>(null);
  const seisChartRef = useRef<SeismogramChartRef | null>(null);
  const contextMenuRef = useRef<ContextMenuRef | null>(null);

  const { props, heliChartReadyRef, seisChartReadyRef, setSeisChartRef, setHeliChartRef, setContextMenuRef } = usePickerContext();
  const { event, showHelicorder, showSeismogram, showEventMarkers } = props;

  useEffect(() => {
    setSeisChartRef(seisChartRef.current);
    setHeliChartRef(heliChartRef.current);
    setContextMenuRef(contextMenuRef.current);

    return () => {
      setSeisChartRef(null);
      setHeliChartRef(null);
      setContextMenuRef(null);
    };
  }, [setSeisChartRef, setHeliChartRef, setContextMenuRef]);

  const { selectedChart, offsetDate, interval, duration, channelId, selectedChannels, isPickModeActive, isPickEmpty } = usePickerStore();
  const { darkMode, useUTC } = useAppStore();

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

  const {
    handleTrackSelected,
    handleHelicorderFocus,
    handleHelicorderOffsetChange,
    handleHelicorderSelectionChange,
    handleHelicorderOnReady,
    handleSeismogramFocus,
    handleSeismogramExtentChange,
    handleContextMenuRequested,
    handleSeismogramPickChange,
    handleSeismogramOnReady,
    handleSeismogramRemoveChannel,
    handleSeismogramMoveChannelUp,
    handleSeismogramMoveChannelDown,
    handleSeismogramDeactivatePickMode,
    handlePickDurationChange,
    handlePickCancel,
    handlePickSave,
    handleClearEventEditing,
    handlePlotEventMarkers,
  } = usePickerCallback();

  const { pickEnd, pickStart, deactivatePickMode, clearPick } = usePickerStore();

  // Plot event markers
  useEffect(() => {
    if (!showEventMarkers) {
      return;
    }

    if (heliChartReadyRef.current && seisChartReadyRef.current) {
      handlePlotEventMarkers();
    }
  }, [showEventMarkers, heliChartReadyRef, seisChartReadyRef, handlePlotEventMarkers]);

  // Cleanup when unmount
  useEffect(() => {
    return () => {
      deactivatePickMode();
      clearPick();
      handleClearEventEditing();
    };
  }, [deactivatePickMode, clearPick, handleClearEventEditing]);

  useThemeEffect(heliChartRef, seisChartRef);
  useTimeZoneEffect(heliChartRef, seisChartRef);

  return (
    <div className="flex-grow relative flex mt-1">
      <div className="flex flex-1 relative">
        {showHelicorder && (
          <div className="relative w-1/4 h-full">
            <HelicorderChart
              ref={heliChartRef}
              className={helicorderClassName}
              initOptions={helicorderInitOptions}
              onTrackSelected={handleTrackSelected}
              onFocus={handleHelicorderFocus}
              onOffsetChange={handleHelicorderOffsetChange}
              onSelectionChange={handleHelicorderSelectionChange}
              onReady={handleHelicorderOnReady}
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
              onReady={handleSeismogramOnReady}
            />

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
    </div>
  );
};

export default PickerChart;
