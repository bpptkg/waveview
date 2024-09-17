import { Series } from '@waveview/ndarray';
import { Helicorder } from '@waveview/zcharts';
import { uuid4 } from '../../../shared/uuid';
import { StreamRequestData, StreamResponseData, WorkerRequestData, WorkerResponseData } from '../../../types/worker';

const cache = new Map<string, Series>();

export interface RefreshOptions {
  mode: 'lazy' | 'force' | 'cache';
}

export class HelicorderWebWorker {
  private worker: Worker;
  private chart: Helicorder;

  constructor(chart: Helicorder, worker: Worker) {
    this.chart = chart;
    this.worker = worker;
    this.worker.addEventListener('message', this.onMessage.bind(this));
  }

  fetchAllTracksData(options?: RefreshOptions): void {
    const { mode } = options || { mode: 'lazy' };
    switch (mode) {
      case 'lazy':
        this.fetchAllTracksDataLazy();
        break;
      case 'force':
        this.fetchAllTracksDataForce();
        break;
      case 'cache':
        this.fetchAllTracksDataCache();
        break;
    }
  }

  private fetchAllTracksDataForce(): void {
    const trackManager = this.chart.getTrackManager();
    for (const segment of trackManager.segments()) {
      this.postRequestMessage(segment);
    }
  }

  private fetchAllTracksDataLazy(): void {
    const trackManager = this.chart.getTrackManager();
    for (const segment of trackManager.segments()) {
      if (this.chart.isTrackDataEmpty(segment)) {
        this.postRequestMessage(segment);
      }
    }
  }

  private fetchAllTracksDataCache(): void {
    const trackManager = this.chart.getTrackManager();
    for (const segment of trackManager.segments()) {
      const key = JSON.stringify(segment);
      const series = cache.get(key);
      if (series) {
        this.chart.setTrackData(segment, series);
      } else {
        this.postRequestMessage(segment);
      }
    }
    this.chart.refreshData();
    this.chart.render();
  }

  postRequestMessage(extent: [number, number]): void {
    const requestId = uuid4();
    const [start, end] = extent;
    const channel = this.chart.getChannel();
    const forceCenter = true;
    const msg: WorkerRequestData<StreamRequestData> = {
      type: 'stream.fetch',
      payload: {
        requestId: requestId,
        channelId: channel.id,
        start,
        end,
        forceCenter,
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
    const key = JSON.stringify(segment);
    cache.set(key, series);
    this.chart.setTrackData(segment, series);
    this.chart.refreshData();
    this.chart.render();
  }
}
