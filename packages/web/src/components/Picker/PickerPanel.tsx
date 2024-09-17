import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { usePickerStore } from '../../stores/picker';
import { useSidebarStore } from '../../stores/sidebar';
import { HelicorderChart, HelicorderChartRef } from './HelicorderChart';
import { usePickerContext } from './PickerContext';
import { SeismogramChart, SeismogramChartRef } from './SeismogramChart';
import SeismogramContextMenu, { ContextMenuRef } from './SeismogramContextMenu';
import Sidebar from './Sidebar/Sidebar';
import SidebarTabList from './Sidebar/SidebarTabList';
import { useHelicorderKeyboardShortcuts, useSeismogramKeyboardShortcuts } from './useKeyboardShortcuts';
import { usePickerCallback } from './usePickerCallback';
import { useThemeEffect } from './useThemeEffect';
import { useTimeZoneEffect } from './useTimeZoneEffect';

const PickerPanel = () => {
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
    handleSeismogramMouseWheel,
    getSeismogramInitOptions,
    getHelicorderInitOptions,
    handleSeismogramOnReady,
  } = usePickerCallback();

  const { showHelicorder } = props;
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
  useSeismogramKeyboardShortcuts(seisChartRef);
  useHelicorderKeyboardShortcuts(heliChartRef);

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
            onContextMenuRequested={handleContextMenuRequested}
            onMouseWheel={handleSeismogramMouseWheel}
            onPick={handleSeismogramPickChange}
            onReady={handleSeismogramOnReady}
          />
          <SeismogramContextMenu ref={contextMenuRef} />
        </Panel>
        <PanelResizeHandle onDragging={handleResizeHandleDragging} />
        <Panel ref={sidebarRef} order={3} defaultSize={0} onResize={handleSidebarResize}>
          <Sidebar />
        </Panel>
      </PanelGroup>
      <SidebarTabList />
    </div>
  );
};

export default PickerPanel;
