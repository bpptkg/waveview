import { Series } from '@waveview/ndarray';
import { Helicorder } from '@waveview/zcharts';
import { debounce } from '../../../shared/debounce';
import { uuid4 } from '../../../shared/uuid';
import { StreamRequestData, StreamResponseData, WorkerRequestData, WorkerResponseData } from '../../../types/worker';

const cache = new Map<string, Series>();

export interface RefreshOptions {
  mode: 'lazy' | 'force' | 'cache';
}

export interface HelicorderWebWorkerOptions {
  /**
   * Enable realtime feed for helicorder chart.
   */
  enableRealtimeFeed: boolean;
  /**
   * Refresh interval for realtime feed in seconds.
   */
  refreshInterval: number;
}

export class HelicorderWebWorker {
  private worker: Worker;
  private chart: Helicorder;
  private options: HelicorderWebWorkerOptions;
  private interval?: number;
  private requests: Map<string, number> = new Map();
  fetchAllTracksDataDebounced: (options?: RefreshOptions) => void;

  static readonly defaultOptions: HelicorderWebWorkerOptions = {
    refreshInterval: 30,
    enableRealtimeFeed: true,
  };

  constructor(chart: Helicorder, worker: Worker, options?: Partial<HelicorderWebWorkerOptions>) {
    this.chart = chart;
    this.worker = worker;
    this.options = { ...HelicorderWebWorker.defaultOptions, ...options };
    this.interval = undefined;
    this.worker.addEventListener('message', this.onMessage.bind(this));
    this.fetchAllTracksDataDebounced = debounce(this.fetchAllTracksData, 300);
  }

  refreshRealtimeFeed(): void {
    const { enableRealtimeFeed, refreshInterval } = this.options;
    if (enableRealtimeFeed) {
      const now = Date.now();
      const [start, end] = this.chart.getChartExtent();
      if (this.interval) {
        clearInterval(this.interval);
      }
      if (now >= start && now <= end) {
        this.interval = setInterval(() => {
          this.fetchAllTracksData({ mode: 'lazy' });
        }, refreshInterval * 1000);
      }
    }
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
    const now = Date.now();
    for (const segment of trackManager.segments()) {
      if (this.chart.isTrackDataEmpty(segment)) {
        this.postRequestMessage(segment);
      } else {
        const [, end] = segment;
        if (end > now) {
          this.postRequestMessage(segment);
        }
      }
    }
  }

  private fetchAllTracksDataCache(): void {
    const trackManager = this.chart.getTrackManager();
    const now = Date.now();
    for (const segment of trackManager.segments()) {
      const key = JSON.stringify(segment);
      const series = cache.get(key);
      if (series) {
        this.chart.setTrackData(segment, series);
        const [, end] = segment;
        if (end > now) {
          this.postRequestMessage(segment);
        }
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
        resample: true,
        sampleRate: 10,
      },
    };

    this.worker.postMessage(msg);
    this.requests.set(requestId, Date.now());
  }

  dispose(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.worker.removeEventListener('message', this.onMessage);
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
    const { requestId, data, index, start, end, channelId } = payload;
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

    this.requests.delete(requestId);
    if (this.requests.size === 0) {
      this.refreshRealtimeFeed();
    }
  }
}
