import { useEffect, useRef } from 'react';
import { HelicorderChartRef } from './HelicorderChart';
import PickerChart from './PickerChart';
import { FetcherWorker, PickerContext, PickerContextValue, useDefaultProps } from './PickerContext';
import PickerRoot from './PickerRoot';
import PickerToolbar from './PickerToolbar';
import { PickerWorkspaceProps } from './PickerWorkspace.types';
import { SeismogramChartRef } from './SeismogramChart';
import { ContextMenuRef } from './SeismogramContextMenu';
import StatusBar from './StatusBar';

const PickerWorkspace: React.FC<PickerWorkspaceProps> = (props) => {
  const heliChartRef = useRef<HelicorderChartRef | null>(null);
  const seisChartRef = useRef<SeismogramChartRef | null>(null);
  const contextMenuRef = useRef<ContextMenuRef | null>(null);
  const fetcherWorkerRef = useRef<FetcherWorker | null>(null);
  const heliChartReadyRef = useRef<boolean>(false);
  const seisChartReadyRef = useRef<boolean>(false);

  const setHeliChartRef = (ref: HelicorderChartRef | null) => {
    heliChartRef.current = ref;
  };
  const setSeisChartRef = (ref: SeismogramChartRef | null) => {
    seisChartRef.current = ref;
  };
  const setContextMenuRef = (ref: ContextMenuRef | null) => {
    contextMenuRef.current = ref;
  };
  const setHeliChartReady = (ready: boolean) => {
    heliChartReadyRef.current = ready;
  };
  const setSeisChartReady = (ready: boolean) => {
    seisChartReadyRef.current = ready;
  };

  const context: PickerContextValue = {
    props: useDefaultProps(props),
    seisChartRef,
    heliChartRef,
    contextMenuRef,
    heliChartReadyRef,
    seisChartReadyRef,
    fetcherWorkerRef,
    setSeisChartRef,
    setHeliChartRef,
    setContextMenuRef,
    setHeliChartReady,
    setSeisChartReady,
  };

  useEffect(() => {
    const worker = new FetcherWorker();
    fetcherWorkerRef.current = worker;
    return () => {
      worker.terminate();
    };
  }, []);

  return (
    <PickerContext.Provider value={context}>
      <PickerRoot>
        <PickerToolbar />
        <PickerChart />
        <StatusBar />
      </PickerRoot>
    </PickerContext.Provider>
  );
};

export default PickerWorkspace;
