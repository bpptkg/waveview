import { EventRequestData } from '../../types/fetcher';
import { HelicorderChartRef } from './HelicorderChart';
import { SeismogramChartRef } from './SeismogramChart';

export class PickerWorker {
  worker: Worker;
  seisChartRef: SeismogramChartRef | null;
  heliChartRef: HelicorderChartRef | null;

  constructor(seisChartRef: SeismogramChartRef | null, heliChartRef: HelicorderChartRef | null) {
    this.seisChartRef = seisChartRef;
    this.heliChartRef = heliChartRef;
    this.worker = new Worker(new URL('../../workers/fetcher.worker.ts', import.meta.url), { type: 'module' });
    this.worker.addEventListener('message', this.onMessage.bind(this));
  }

  fetchEvents(msg: EventRequestData): void {
    this.worker.postMessage(msg);
  }

  terminate(): void {
    this.worker.terminate();
  }

  onMessage(): void {}
}
