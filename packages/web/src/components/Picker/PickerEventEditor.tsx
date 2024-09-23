import React, { useRef } from 'react';
import { HelicorderChartRef } from './HelicorderChart';
import { PickerProps } from './Picker.types';
import { PickerContext, PickerContextValue, useDefaultProps } from './PickerContext';
import PickerEventEditorPanel from './PickerEventEditorPanel';
import { SeismogramChartRef } from './SeismogramChart';
import { ContextMenuRef } from './SeismogramContextMenu';
import Statusbar from './Statusbar/Statusbar';

const PickerEventEditor: React.FC<PickerProps> = (props) => {
  const heliChartRef = useRef<HelicorderChartRef | null>(null);
  const seisChartRef = useRef<SeismogramChartRef | null>(null);
  const contextMenuRef = useRef<ContextMenuRef | null>(null);
  const seisChartReadyRef = useRef<boolean>(false);
  const heliChartReadyRef = useRef<boolean>(false);

  const setHeliChartRef = (ref: HelicorderChartRef | null) => {
    heliChartRef.current = ref;
  };
  const setSeisChartRef = (ref: SeismogramChartRef | null) => {
    seisChartRef.current = ref;
  };
  const setContextMenuRef = (ref: ContextMenuRef | null) => {
    contextMenuRef.current = ref;
  };
  const setSeisChartReady = (ready: boolean) => {
    seisChartReadyRef.current = ready;
  };
  const setHeliChartReady = (ready: boolean) => {
    heliChartReadyRef.current = ready;
  };

  const context: PickerContextValue = {
    props: useDefaultProps(props),
    seisChartRef,
    heliChartRef,
    contextMenuRef,
    seisChartReadyRef,
    heliChartReadyRef,
    setSeisChartRef,
    setHeliChartRef,
    setContextMenuRef,
    setSeisChartReady,
    setHeliChartReady,
  };

  return (
    <PickerContext.Provider value={context}>
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          <PickerEventEditorPanel />
        </div>
        <Statusbar />
      </div>
    </PickerContext.Provider>
  );
};

export default PickerEventEditor;
