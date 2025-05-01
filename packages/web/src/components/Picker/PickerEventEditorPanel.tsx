import { ProgressBar } from '@fluentui/react-components';
import { useEffect, useRef } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useFilterStore } from '../../stores/filter';
import { usePickerStore } from '../../stores/picker';
import { usePickerContext } from './PickerContext';
import RestoreViewButton from './RestoreViewButton';
import { SeismogramChart, SeismogramChartRef } from './SeismogramChart';
import Sidebar from './Sidebar/Sidebar';
import SeismogramToolbar from './Toolbar/SeismogramToolbar';
import { useSeismogramKeyboardShortcuts } from './useKeyboardShortcuts';
import { useSeismogramCallback } from './useSeismogramCallback';
import { useSeismogramThemeEffect } from './useThemeEffect';
import { useSeismogramTimeZoneEffect } from './useTimeZoneEffect';

const PickerEventEditorPanel = () => {
  const seisChartRef = useRef<SeismogramChartRef | null>(null);
  const { setSeisChartRef } = usePickerContext();

  useEffect(() => {
    setSeisChartRef(seisChartRef.current);

    return () => {
      setSeisChartRef(null);
    };
  }, [setSeisChartRef]);

  const { showEvent, seismogramToolbarCheckedValues, getSeismogramFilterOptions, seismogramLoading } = usePickerStore();
  const { appliedFilter, setAppliedFilter } = useFilterStore();
  const {
    getSeismogramInitOptions,
    handleSeismogramCheckValueChange,
    handleSeismogramDecreaseAmplitude,
    handleSeismogramExtentChange,
    handleSeismogramFilterChange,
    handleSeismogramFitToWindow,
    handleSeismogramFocus,
    handleSeismogramIncreaseAmplitude,
    handleSeismogramMouseWheel,
    handleSeismogramOnDestroy,
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
  } = useSeismogramCallback();

  useSeismogramThemeEffect(seisChartRef);
  useSeismogramTimeZoneEffect(seisChartRef);
  useSeismogramKeyboardShortcuts(seisChartRef);

  // Cleanup when unmount.
  useEffect(() => {
    return () => {
      handleSeismogramOnDestroy();
      setAppliedFilter(null);
    };
  }, [handleSeismogramOnDestroy, setAppliedFilter]);

  return (
    <PanelGroup direction="horizontal">
      <Panel minSize={10} order={1} className="relative">
        <div className="flex flex-col relative h-full">
          <SeismogramToolbar
            showEvent={showEvent}
            checkedValues={seismogramToolbarCheckedValues}
            appliedFilter={appliedFilter}
            showHideEvent={false}
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
          <div className="flex-grow relative">
            <div className="h-1 absolute top-0 left-0 right-0 z-10">{seismogramLoading && <ProgressBar />}</div>
            <SeismogramChart
              ref={seisChartRef}
              initOptions={getSeismogramInitOptions()}
              appliedFilter={appliedFilter}
              onFocus={handleSeismogramFocus}
              onExtentChange={handleSeismogramExtentChange}
              onMouseWheel={handleSeismogramMouseWheel}
              onPick={handleSeismogramPickChange}
              onReady={handleSeismogramOnReady}
              onTrackDoubleClick={handleSeismogramTrackDoubleClick}
              onLoading={handleSeismogramOnLoading}
            />
            <RestoreViewButton />
          </div>
        </div>
      </Panel>
      <PanelResizeHandle />
      <Panel defaultSize={20} minSize={10} order={2} className="relative">
        <Sidebar />
      </Panel>
    </PanelGroup>
  );
};

export default PickerEventEditorPanel;
