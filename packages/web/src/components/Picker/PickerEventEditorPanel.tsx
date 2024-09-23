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

  const { showEvent, seismogramToolbarCheckedValues } = usePickerStore();
  const { setAppliedFilter } = useFilterStore();
  const {
    handleSeismogramFocus,
    handleSeismogramExtentChange,
    handleSeismogramPickChange,
    handleSeismogramMouseWheel,
    getSeismogramInitOptions,
    handleSeismogramOnReady,
    handleSeismogramTrackDoubleClick,
    handleSeismogramZoomIn,
    handleSeismogramZoomOut,
    handleSeismogramScrollLeft,
    handleSeismogramScrollRight,
    handleSeismogramIncreaseAmplitude,
    handleSeismogramDecreaseAmplitude,
    handleSeismogramResetAmplitude,
    handleSeismogramShowEvent,
    handleSeismogramCheckValueChange,
    handleSeismogramSpectrogramChange,
    handleSeismogramSignalChange,
    handleSeismogramOnDestroy,
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
            showHideEvent={false}
            onZoomIn={handleSeismogramZoomIn}
            onZoomOut={handleSeismogramZoomOut}
            onScrollLeft={handleSeismogramScrollLeft}
            onScrollRight={handleSeismogramScrollRight}
            onIncreaseAmplitude={handleSeismogramIncreaseAmplitude}
            onDecreaseAmplitude={handleSeismogramDecreaseAmplitude}
            onResetAmplitude={handleSeismogramResetAmplitude}
            onShowEventChange={handleSeismogramShowEvent}
            onCheckedValueChange={handleSeismogramCheckValueChange}
            onSpectrogramChange={handleSeismogramSpectrogramChange}
            onSignalChange={handleSeismogramSignalChange}
          />
          <div className="flex-grow relative">
            <SeismogramChart
              ref={seisChartRef}
              initOptions={getSeismogramInitOptions()}
              onFocus={handleSeismogramFocus}
              onExtentChange={handleSeismogramExtentChange}
              onMouseWheel={handleSeismogramMouseWheel}
              onPick={handleSeismogramPickChange}
              onReady={handleSeismogramOnReady}
              onTrackDoubleClick={handleSeismogramTrackDoubleClick}
            />
            <RestoreViewButton />
          </div>
        </div>
      </Panel>
      <PanelResizeHandle />
      <Panel defaultSize={25} minSize={10} order={2} className="relative">
        <Sidebar />
      </Panel>
    </PanelGroup>
  );
};

export default PickerEventEditorPanel;
