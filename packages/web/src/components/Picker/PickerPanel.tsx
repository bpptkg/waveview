import { ProgressBar } from '@fluentui/react-components';
import { ElementEvent, SeismogramEventMarkerOptions } from '@waveview/zcharts';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useFilterStore } from '../../stores/filter';
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
import HelicorderToolbar from './Toolbar/HelicorderToolbar';
import SeismogramToolbar from './Toolbar/SeismogramToolbar';
import { useHelicorderKeyboardShortcuts, useSeismogramKeyboardShortcuts } from './useKeyboardShortcuts';
import { usePickerCallback } from './usePickerCallback';
import { useHelicorderThemeEffect, useSeismogramThemeEffect } from './useThemeEffect';
import { useHelicorderTimeZoneEffect, useSeismogramTimeZoneEffect } from './useTimeZoneEffect';

const PickerPanel = () => {
  const heliChartRef = useRef<HelicorderChartRef | null>(null);
  const seisChartRef = useRef<SeismogramChartRef | null>(null);
  const eventMarkerContextMenuRef = useRef<EventMarkerContextMenuRef | null>(null);
  const trackContextMenuRef = useRef<TrackContextMenuRef | null>(null);
  const helicorderContainerRef = useRef<HTMLDivElement | null>(null);
  const seismogramContainerRef = useRef<HTMLDivElement | null>(null);

  const { setSeisChartRef, setHeliChartRef, setContextMenuRef } = usePickerContext();
  const {
    offsetDate,
    showEvent,
    helicorderFilter,
    selectedChart,
    autoUpdate,
    autoUpdateInterval,
    seismogramToolbarCheckedValues,
    helicorderToolbarCheckedValues,
    helicorderLoading,
    seismogramLoading,
    getSeismogramFilterOptions,
  } = usePickerStore();
  const {
    getHelicorderInitOptions,
    getSeismogramInitOptions,
    handleHelicorderAutoUpdate,
    handleHelicorderCheckValueChange,
    handleHelicorderDecreaseAmplitude,
    handleHelicorderEventMarkerClick,
    handleHelicorderFocus,
    handleHelicorderIncreaseAmplitude,
    handleHelicorderOffsetDateChange,
    handleHelicorderOnLoading,
    handleHelicorderOnReady,
    handleHelicorderRefreshData,
    handleHelicorderResetAmplitude,
    handleHelicorderScalingChange,
    handleHelicorderSelectionChange,
    handleHelicorderSelectOffsetDate,
    handleHelicorderShiftViewDown,
    handleHelicorderShiftViewToNow,
    handleHelicorderShiftViewUp,
    handleSeismogramCheckValueChange,
    handleSeismogramDecreaseAmplitude,
    handleSeismogramExtentChange,
    handleSeismogramFilterChange,
    handleSeismogramFitToWindow,
    handleSeismogramFocus,
    handleSeismogramIncreaseAmplitude,
    handleSeismogramMouseWheel,
    handleSeismogramOnLoading,
    handleSeismogramOnReady,
    handleSeismogramPickChange,
    handleSeismogramResetAmplitude,
    handleSeismogramScalingChange,
    handleSeismogramScrollLeft,
    handleSeismogramScrollRight,
    handleSeismogramShowEvent,
    handleSeismogramSignalChange,
    handleSeismogramSpectrogramChange,
    handleSeismogramTrackDoubleClick,
    handleSeismogramZoomFirstMinute,
    handleSeismogramZoomIn,
    handleSeismogramZoomOut,
  } = usePickerCallback();

  const helicorderClassName = useMemo(() => {
    return selectedChart === 'helicorder' ? 'border border-gray-300 dark:border-gray-700' : 'border border-transparent';
  }, [selectedChart]);

  const seismogramClassName = useMemo(() => {
    return selectedChart === 'seismogram' ? 'border border-gray-300 dark:border-gray-700' : 'border border-transparent';
  }, [selectedChart]);

  useEffect(() => {
    setHeliChartRef(heliChartRef.current);
    setSeisChartRef(seisChartRef.current);

    return () => {
      setSeisChartRef(null);
      setHeliChartRef(null);
      setContextMenuRef(null);
    };
  }, [setSeisChartRef, setHeliChartRef, setContextMenuRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (helicorderContainerRef.current && !helicorderContainerRef.current.contains(event.target as Node)) {
        heliChartRef.current?.blur();
      }
      if (seismogramContainerRef.current && !seismogramContainerRef.current.contains(event.target as Node)) {
        seisChartRef.current?.blur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [heliChartRef, seisChartRef]);

  useHelicorderThemeEffect(heliChartRef);
  useSeismogramThemeEffect(seisChartRef);
  useHelicorderTimeZoneEffect(heliChartRef);
  useSeismogramTimeZoneEffect(seisChartRef);
  useSeismogramKeyboardShortcuts(seisChartRef);
  useHelicorderKeyboardShortcuts(heliChartRef);

  const { showHelicorder, showSidebar } = useSidebarStore();

  useEffect(() => {
    const interval = setInterval(() => {
      if (autoUpdate && showHelicorder && showEvent) {
        handleHelicorderAutoUpdate();
      }
    }, autoUpdateInterval * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [showHelicorder, autoUpdate, autoUpdateInterval, showEvent, handleHelicorderAutoUpdate]);

  const handleEventMarkerContextMenu = useCallback((e: ElementEvent, marker: SeismogramEventMarkerOptions) => {
    eventMarkerContextMenuRef.current?.open(e, marker);
  }, []);

  const handleTrackContextMenu = useCallback((e: ElementEvent, index: number) => {
    trackContextMenuRef.current?.open(e, index);
  }, []);

  const { appliedFilter } = useFilterStore();

  return (
    <div className="flex-grow relative flex mt-1 border-t dark:border-t-gray-800 dark:border-transparent">
      <PanelGroup direction="horizontal" className="relative">
        {showHelicorder && (
          <>
            <Panel id="panel-helicorder" defaultSize={25} minSize={10} order={1} className="relative">
              <div className="flex flex-col relative h-full">
                <HelicorderToolbar
                  offsetDate={new Date(offsetDate)}
                  checkedValues={helicorderToolbarCheckedValues}
                  onShiftViewUp={handleHelicorderShiftViewUp}
                  onShiftViewDown={handleHelicorderShiftViewDown}
                  onShiftViewToNow={handleHelicorderShiftViewToNow}
                  onIncreaseAmplitude={handleHelicorderIncreaseAmplitude}
                  onDecreaseAmplitude={handleHelicorderDecreaseAmplitude}
                  onResetAmplitude={handleHelicorderResetAmplitude}
                  onOffsetDateChange={handleHelicorderSelectOffsetDate}
                  onRefreshData={handleHelicorderRefreshData}
                  onCheckedValueChange={handleHelicorderCheckValueChange}
                  onScalingChange={handleHelicorderScalingChange}
                />
                <div ref={helicorderContainerRef} className="flex-grow relative">
                  <div className="h-1 absolute top-0 left-0 right-0 z-10">{helicorderLoading && <ProgressBar />}</div>
                  <HelicorderChart
                    ref={heliChartRef}
                    className={helicorderClassName}
                    appliedFilter={helicorderFilter}
                    initOptions={getHelicorderInitOptions()}
                    onOffsetDateChange={handleHelicorderOffsetDateChange}
                    onFocus={handleHelicorderFocus}
                    onSelectionChange={handleHelicorderSelectionChange}
                    onEventMarkerClick={handleHelicorderEventMarkerClick}
                    onLoading={handleHelicorderOnLoading}
                    onReady={handleHelicorderOnReady}
                  />
                </div>
              </div>
            </Panel>
            <PanelResizeHandle id="resize-handle-left" />
          </>
        )}
        <Panel id="panel-seismogram" minSize={20} order={2} className="relative">
          <div className="flex flex-col relative h-full">
            <SeismogramToolbar
              showEvent={showEvent}
              checkedValues={seismogramToolbarCheckedValues}
              appliedFilter={appliedFilter}
              filterOptions={getSeismogramFilterOptions()}
              onZoomIn={handleSeismogramZoomIn}
              onZoomOut={handleSeismogramZoomOut}
              onZoomFirstMinute={handleSeismogramZoomFirstMinute}
              onZoomFit={handleSeismogramFitToWindow}
              onScrollLeft={handleSeismogramScrollLeft}
              onScrollRight={handleSeismogramScrollRight}
              onIncreaseAmplitude={handleSeismogramIncreaseAmplitude}
              onDecreaseAmplitude={handleSeismogramDecreaseAmplitude}
              onResetAmplitude={handleSeismogramResetAmplitude}
              onShowEventChange={handleSeismogramShowEvent}
              onCheckedValueChange={handleSeismogramCheckValueChange}
              onSpectrogramChange={handleSeismogramSpectrogramChange}
              onSignalChange={handleSeismogramSignalChange}
              onScalingChange={handleSeismogramScalingChange}
              onFilterChange={handleSeismogramFilterChange}
            />
            <div ref={seismogramContainerRef} className="flex-grow relative">
              <div className="h-1 absolute top-0 left-0 right-0 z-10">{seismogramLoading && <ProgressBar />}</div>
              <SeismogramChart
                ref={seisChartRef}
                className={seismogramClassName}
                initOptions={getSeismogramInitOptions()}
                appliedFilter={appliedFilter}
                onFocus={handleSeismogramFocus}
                onExtentChange={handleSeismogramExtentChange}
                onMouseWheel={handleSeismogramMouseWheel}
                onPick={handleSeismogramPickChange}
                onEventMarkerContextMenu={handleEventMarkerContextMenu}
                onTrackContextMenu={handleTrackContextMenu}
                onTrackDoubleClick={handleSeismogramTrackDoubleClick}
                onLoading={handleSeismogramOnLoading}
                onReady={handleSeismogramOnReady}
              />
              <RestoreViewButton />
              <EventMarkerContextMenu ref={eventMarkerContextMenuRef} />
              <TrackContextMenu ref={trackContextMenuRef} />
            </div>
          </div>
        </Panel>
        {showSidebar && (
          <>
            <PanelResizeHandle id="resize-handle-right" />
            <Panel id="panel-sidebar" defaultSize={20} minSize={10} order={3} className="relative">
              <Sidebar />
            </Panel>
          </>
        )}
      </PanelGroup>
      <PickerSettings />
    </div>
  );
};

export default PickerPanel;
