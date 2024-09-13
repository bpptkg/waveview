import { useEffect, useMemo, useRef } from 'react';
import { usePickerStore } from '../../stores/picker';
import { HelicorderChart, HelicorderChartRef } from './HelicorderChart';
import { usePickerContext } from './PickerContext';
import { SeismogramChart, SeismogramChartRef } from './SeismogramChart';
import SeismogramContextMenu, { ContextMenuRef } from './SeismogramContextMenu';
import Sidebar from './Sidebar/Sidebar';
import { usePickerCallback } from './usePickerCallback';
import { useThemeEffect } from './useThemeEffect';
import { useTimeZoneEffect } from './useTimeZoneEffect';

const PickerChart = () => {
  const heliChartRef = useRef<HelicorderChartRef | null>(null);
  const seisChartRef = useRef<SeismogramChartRef | null>(null);
  const contextMenuRef = useRef<ContextMenuRef | null>(null);

  const { props, setSeisChartRef, setHeliChartRef, setContextMenuRef } = usePickerContext();
  const {
    handleHelicorderFocus,
    handleHelicorderSelectionChange,
    handleHelicorderOnReady,
    handleSeismogramFocus,
    handleSeismogramExtentChange,
    handleContextMenuRequested,
    handleSeismogramPickChange,
    handleSeismogramRemoveChannel,
    handleSeismogramMoveChannelUp,
    handleSeismogramMoveChannelDown,
    getSeismogramInitOptions,
    getHelicorderInitOptions,
    handleSeismogramOnReady,
  } = usePickerCallback();

  const { showHelicorder, showSeismogram } = props;
  const { selectedChart, eventId } = usePickerStore();

  const helicorderClassName = useMemo(() => {
    if (eventId) {
      return 'border border-transparent';
    }
    return selectedChart === 'helicorder' ? 'border border-brand-hosts-80' : 'border border-transparent';
  }, [selectedChart, eventId]);

  const seismogramClassName = useMemo(() => {
    if (eventId) {
      return 'border border-transparent';
    }
    return selectedChart === 'seismogram' ? 'border border-brand-hosts-80' : 'border border-transparent';
  }, [selectedChart, eventId]);

  // Set refs on mount
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

  useThemeEffect(heliChartRef, seisChartRef);
  useTimeZoneEffect(heliChartRef, seisChartRef);

  return (
    <div className="flex-grow relative flex mt-1 border-t dark:border-transparent">
      <div className="flex flex-1 relative">
        {showHelicorder && (
          <div className="relative w-1/4 h-full">
            <HelicorderChart
              ref={heliChartRef}
              className={helicorderClassName}
              initOptions={getHelicorderInitOptions()}
              onFocus={handleHelicorderFocus}
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

        <Sidebar />
      </div>
    </div>
  );
};

export default PickerChart;
