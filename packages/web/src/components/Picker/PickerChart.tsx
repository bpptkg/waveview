import { useEffect, useMemo, useRef } from 'react';
import { usePickerStore } from '../../stores/picker';
import EventEditor from './EventEditor';
import { HelicorderChart, HelicorderChartRef } from './HelicorderChart';
import { usePickerContext } from './PickerContext';
import { SeismogramChart, SeismogramChartRef } from './SeismogramChart';
import SeismogramContextMenu, { ContextMenuRef } from './SeismogramContextMenu';
import { usePickerCallback } from './usePickerCallback';
import { useThemeEffect } from './useThemeEffect';
import { useTimeZoneEffect } from './useTimeZoneEffect';

const PickerChart = () => {
  const heliChartRef = useRef<HelicorderChartRef | null>(null);
  const seisChartRef = useRef<SeismogramChartRef | null>(null);
  const contextMenuRef = useRef<ContextMenuRef | null>(null);

  const { props, heliChartReadyRef, seisChartReadyRef, setSeisChartRef, setHeliChartRef, setContextMenuRef } = usePickerContext();

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

  const { showHelicorder, showSeismogram, showEventMarkers } = props;
  const { selectedChart, editedEvent, isPickModeActive } = usePickerStore();

  const helicorderClassName = useMemo(() => {
    if (editedEvent) {
      return 'border border-transparent';
    }
    return selectedChart === 'helicorder' ? 'border border-brand-hosts-80' : 'border border-transparent';
  }, [selectedChart, editedEvent]);

  const seismogramClassName = useMemo(() => {
    if (editedEvent) {
      return 'border border-transparent';
    }
    return selectedChart === 'seismogram' ? 'border border-brand-hosts-80' : 'border border-transparent';
  }, [selectedChart, editedEvent]);

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
    handleClearEventEditing,
    handlePlotEventMarkers,
    getSeismogramInitOptions,
    getHelicorderInitOptions,
  } = usePickerCallback();

  const { deactivatePickMode, clearPick } = usePickerStore();

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
              initOptions={getHelicorderInitOptions()}
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
              initOptions={getSeismogramInitOptions()}
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

        {isPickModeActive() && <EventEditor />}
      </div>
    </div>
  );
};

export default PickerChart;
