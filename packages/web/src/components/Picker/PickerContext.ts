import { createContext, MutableRefObject, useContext } from 'react';
import { HelicorderChartRef } from './HelicorderChart';
import { PickerWorkspaceProps } from './PickerWorkspace.types';
import { SeismogramChartRef } from './SeismogramChart';
import { ContextMenuRef } from './SeismogramContextMenu';
import { EventRequestData, EventResponseData } from '../../types/fetcher';

export class FetcherWorker {
  worker: Worker;

  constructor() {
    this.worker = new Worker(new URL('../../workers/fetcher.worker.ts', import.meta.url), { type: 'module' });
  }

  fetchEvents(msg: EventRequestData): void {
    this.worker.postMessage(msg);
  }

  terminate(): void {
    this.worker.terminate();
  }

  onMessage(callback: (events: EventResponseData) => void): void {
    this.worker.addEventListener('message', (event: MessageEvent<EventResponseData>) => {
      callback(event.data);
    });
  }
}

export interface PickerContextValue {
  props: PickerWorkspaceProps;
  seisChartRef: MutableRefObject<SeismogramChartRef | null>;
  heliChartRef: MutableRefObject<HelicorderChartRef | null>;
  contextMenuRef: MutableRefObject<ContextMenuRef | null>;
  heliChartReadyRef: MutableRefObject<boolean>;
  seisChartReadyRef: MutableRefObject<boolean>;
  fetcherWorkerRef: MutableRefObject<FetcherWorker | null>;
  setSeisChartRef: (ref: SeismogramChartRef | null) => void;
  setHeliChartRef: (ref: HelicorderChartRef | null) => void;
  setContextMenuRef: (ref: ContextMenuRef | null) => void;
  setHeliChartReady: (ready: boolean) => void;
  setSeisChartReady: (ready: boolean) => void;
}

export const PickerContext = createContext<PickerContextValue | null>(null);

export const usePickerContext = (): PickerContextValue => {
  const value = useContext(PickerContext);
  if (!value) {
    throw new Error('usePickerContext must be used within a PickerContextProvider');
  }
  return value;
};

export const useDefaultProps = (props: PickerWorkspaceProps): PickerWorkspaceProps => {
  return {
    ...props,
    showHelicorder: props.showHelicorder ?? true,
    showSeismogram: props.showSeismogram ?? true,
    showEventMarkers: props.showEventMarkers ?? true,
  };
};
