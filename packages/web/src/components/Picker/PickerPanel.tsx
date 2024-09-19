import { ElementEvent, SeismogramEventMarkerOptions } from '@waveview/zcharts';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { usePickerStore } from '../../stores/picker';
import { useSidebarStore } from '../../stores/sidebar';
import EventMarkerContextMenu, { EventMarkerContextMenuRef } from './ContextMenu/EventMarkerContextMenu';
import TrackContextMenu, { TrackContextMenuRef } from './ContextMenu/TrackContextMenu';
import { HelicorderChart, HelicorderChartRef } from './HelicorderChart';
import { usePickerContext } from './PickerContext';
import PickerSettings from './PickerSettings/PickerSettings';
import RestoreViewButton from './RestoreViewButton';
import { SeismogramChart, SeismogramChartRef } from './SeismogramChart';
import Sidebar from './Sidebar/Sidebar';
import SidebarTabList from './Sidebar/SidebarTabList';
import { useHelicorderKeyboardShortcuts, useSeismogramKeyboardShortcuts } from './useKeyboardShortcuts';
import { usePickerCallback } from './usePickerCallback';
import { useThemeEffect } from './useThemeEffect';
import { useTimeZoneEffect } from './useTimeZoneEffect';

const PickerPanel = () => {
  const heliChartRef = useRef<HelicorderChartRef | null>(null);
  const seisChartRef = useRef<SeismogramChartRef | null>(null);
  const eventMarkerContextMenuRef = useRef<EventMarkerContextMenuRef | null>(null);
  const trackContextMenuRef = useRef<TrackContextMenuRef | null>(null);

  const { props, setSeisChartRef, setHeliChartRef, setContextMenuRef } = usePickerContext();
  const {
    handleHelicorderFocus,
    handleHelicorderSelectionChange,
    handleHelicorderOnReady,
    handleSeismogramFocus,
    handleSeismogramExtentChange,
    handleSeismogramPickChange,
    handleSeismogramMouseWheel,
    getSeismogramInitOptions,
    getHelicorderInitOptions,
    handleSeismogramOnReady,
    handleSeismogramTrackDoubleClick,
    handleHelicorderAutoUpdate,
  } = usePickerCallback();

  const { showHelicorder } = props;
  const { selectedChart, eventId, autoUpdate, autoUpdateInterval } = usePickerStore();

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

    return () => {
      setSeisChartRef(null);
      setHeliChartRef(null);
      setContextMenuRef(null);
    };
  }, [setSeisChartRef, setHeliChartRef, setContextMenuRef]);

  useThemeEffect(heliChartRef, seisChartRef);
  useTimeZoneEffect(heliChartRef, seisChartRef);
  useSeismogramKeyboardShortcuts(seisChartRef);
  useHelicorderKeyboardShortcuts(heliChartRef);

  useEffect(() => {
    const interval = setInterval(() => {
      if (autoUpdate && showHelicorder) {
        handleHelicorderAutoUpdate();
      }
    }, autoUpdateInterval * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [showHelicorder, autoUpdate, autoUpdateInterval, handleHelicorderAutoUpdate]);

  const sidebarRef = useRef<ImperativePanelHandle | null>(null);
  const isResizing = useRef(false);
  const { visible, size, defaultSize, setSize, setVisible } = useSidebarStore();
  const handleSidebarVisibleChange = useCallback(
    (value: boolean) => {
      if (isResizing.current) {
        return;
      }
      setVisible(value);
      if (!sidebarRef.current) {
        return;
      }
      if (value) {
        const newSize = Math.max(size, defaultSize);
        sidebarRef.current.resize(newSize);
      } else {
        sidebarRef.current.resize(0);
      }
    },
    [setVisible, size, defaultSize]
  );
  const handleSidebarResize = useCallback(
    (size: number) => {
      setVisible(size > 0);
      if (size > 0) {
        setSize(size);
      }
    },
    [setVisible, setSize]
  );
  const handleResizeHandleDragging = useCallback((isDragging: boolean) => {
    isResizing.current = isDragging;
  }, []);

  useEffect(() => {
    handleSidebarVisibleChange(visible);
  }, [visible, handleSidebarVisibleChange]);

  const handleEventMarkerContextMenu = useCallback((e: ElementEvent, marker: SeismogramEventMarkerOptions) => {
    eventMarkerContextMenuRef.current?.open(e, marker);
  }, []);

  const handleTrackContextMenu = useCallback((e: ElementEvent, index: number) => {
    trackContextMenuRef.current?.open(e, index);
  }, []);

  return (
    <div className="flex-grow relative flex mt-1 border-t dark:border-transparent">
      <PanelGroup direction="horizontal" className="relative">
        {showHelicorder && (
          <>
            <Panel defaultSize={30} minSize={20} order={1} className="relative">
              <HelicorderChart
                ref={heliChartRef}
                className={helicorderClassName}
                initOptions={getHelicorderInitOptions()}
                onFocus={handleHelicorderFocus}
                onSelectionChange={handleHelicorderSelectionChange}
                onReady={handleHelicorderOnReady}
              />
            </Panel>
            <PanelResizeHandle />
          </>
        )}
        <Panel minSize={20} order={2} className="relative">
          <SeismogramChart
            ref={seisChartRef}
            className={seismogramClassName}
            initOptions={getSeismogramInitOptions()}
            onFocus={handleSeismogramFocus}
            onExtentChange={handleSeismogramExtentChange}
            onMouseWheel={handleSeismogramMouseWheel}
            onPick={handleSeismogramPickChange}
            onReady={handleSeismogramOnReady}
            onEventMarkerContextMenu={handleEventMarkerContextMenu}
            onTrackContextMenu={handleTrackContextMenu}
            onTrackDoubleClick={handleSeismogramTrackDoubleClick}
          />
          <RestoreViewButton />
          <EventMarkerContextMenu ref={eventMarkerContextMenuRef} />
          <TrackContextMenu ref={trackContextMenuRef} />
        </Panel>
        <PanelResizeHandle onDragging={handleResizeHandleDragging} />
        <Panel ref={sidebarRef} order={3} defaultSize={0} onResize={handleSidebarResize}>
          <Sidebar />
        </Panel>
      </PanelGroup>
      <SidebarTabList />
      <PickerSettings />
    </div>
  );
};

export default PickerPanel;
