import { useRef } from 'react';
import { HelicorderChartRef } from './HelicorderChart';
import PickerChart from './PickerChart';
import { PickerContext, PickerContextValue, useDefaultProps } from './PickerContext';
import PickerMenu from './PickerMenu/PickerMenu';
import PickerRoot from './PickerRoot';
import PickerToolbar from './PickerToolbar';
import { PickerWorkspaceProps } from './PickerWorkspace.types';
import { SeismogramChartRef } from './SeismogramChart';
import { ContextMenuRef } from './SeismogramContextMenu';
import StatusBar from './StatusBar/StatusBar';

const PickerWorkspace: React.FC<PickerWorkspaceProps> = (props) => {
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
      <PickerRoot>
        <PickerMenu />
        <PickerToolbar />
        <PickerChart />
        <StatusBar />
      </PickerRoot>
    </PickerContext.Provider>
  );
};

export default PickerWorkspace;
