import { useEffect, useMemo, useRef } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
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
      <PanelGroup direction="horizontal" className="relative">
        {showHelicorder && (
          <Panel defaultSize={25} minSize={20} className="relative">
            <HelicorderChart
              ref={heliChartRef}
              className={helicorderClassName}
              initOptions={getHelicorderInitOptions()}
              onFocus={handleHelicorderFocus}
              onSelectionChange={handleHelicorderSelectionChange}
              onReady={handleHelicorderOnReady}
            />
          </Panel>
        )}

        <PanelResizeHandle />

        {showSeismogram && (
          <Panel minSize={20} className="relative">
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
          </Panel>
        )}

        <PanelResizeHandle />

        <Panel defaultSize={20} minSize={15}>
          <Sidebar />
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default PickerChart;
