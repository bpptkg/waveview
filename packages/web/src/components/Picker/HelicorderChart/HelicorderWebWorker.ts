import { Series } from '@waveview/ndarray';
import { Helicorder } from '@waveview/zcharts';
import { uuid4 } from '../../../shared/uuid';
import { StreamRequestData, StreamResponseData, WorkerRequestData, WorkerResponseData } from '../../../types/worker';

export class HelicorderWebWorker {
  private worker: Worker;
  private chart: Helicorder;

  constructor(chart: Helicorder, worker: Worker) {
    this.chart = chart;
    this.worker = worker;
    this.worker.addEventListener('message', this.onMessage.bind(this));
  }

  fetchAllTracksData(): void {
    const trackManager = this.chart.getTrackManager();
    for (const segment of trackManager.segments()) {
      if (this.chart.isTrackDataEmpty(segment)) {
        this.postMessage(segment);
      }
    }
  }

  postMessage(extent: [number, number]): void {
    const requestId = uuid4();
    const [start, end] = extent;
    const width = this.chart.getWidth();
    const channel = this.chart.getChannel();
    const msg: WorkerRequestData<StreamRequestData> = {
      type: 'stream.fetch',
      payload: {
        requestId: requestId,
        channelId: channel.id,
        start,
        end,
        width,
        mode: 'match_width',
      },
    };

    this.worker.postMessage(msg);
  }

  private onMessage(event: MessageEvent<WorkerResponseData<unknown>>): void {
    const { type, payload } = event.data;

    switch (type) {
      case 'stream.fetch':
        this.onStreamFetchMessage(payload as StreamResponseData);
        break;
      default:
        break;
    }
  }

  private onStreamFetchMessage(payload: StreamResponseData): void {
    const { data, index, start, end, channelId } = payload;
    const series = new Series(data, {
      index: index,
      name: channelId,
    });
    const segment: [number, number] = [start, end];
    this.chart.setTrackData(segment, series);
    this.chart.refreshData();
    this.chart.render();
  }
}
