import { Series } from '@waveview/ndarray';
import { Helicorder } from '@waveview/zcharts';
import { debounce } from '../../../shared/debounce';
import { uuid4 } from '../../../shared/uuid';
import { StreamRequestData, StreamResponseData, WorkerRequestData, WorkerResponseData } from '../../../types/worker';

const cache = new Map<string, Series>();

export interface RefreshOptions {
  /**
   * The mode to fetch data. If the mode is `force`, the worker will fetch data
   * for all tracks. If the mode is `cache`, the worker will fetch data for the
   * tracks that are not in the cache.
   */
  mode: 'force' | 'cache' | 'refresh';
}

export interface HelicorderWebWorkerOptions {
  /**
   * Force center signal in the track when fetching data.
   */
  forceCenter: boolean;
  /**
   * Whether to resample the data in the signal, filtered signal, and
   * spectrogram. Note that when resampling, spectrogram data will be resampled
   * to match the width of the seismogram data.
   */
  resample: boolean;
  /**
   * The sample rate of the data.
   */
  sampleRate: number;
}

export class HelicorderWebWorker {
  private worker: Worker;
  private chart: Helicorder;
  private options: HelicorderWebWorkerOptions;
  private requests: Map<string, number> = new Map();
  fetchAllTracksDataDebounced: (options?: RefreshOptions) => void;

  static readonly defaultOptions: HelicorderWebWorkerOptions = {
    forceCenter: true,
    resample: true,
    sampleRate: 50,
  };

  constructor(chart: Helicorder, worker: Worker, options?: Partial<HelicorderWebWorkerOptions>) {
    this.chart = chart;
    this.worker = worker;
    this.options = { ...HelicorderWebWorker.defaultOptions, ...options };

    this.worker.addEventListener('message', this.onMessage.bind(this));
    this.fetchAllTracksDataDebounced = debounce(this.fetchAllTracksData, 300);
  }

  mergeOptions(options: Partial<HelicorderWebWorkerOptions>): void {
    this.options = { ...this.options, ...options };
  }

  fetchAllTracksData(options?: RefreshOptions): void {
    const { mode } = options || { mode: 'cache' };
    switch (mode) {
      case 'force':
        this.fetchAllTracksDataForce();
        break;
      case 'cache':
        this.fetchAllTracksDataCache();
        break;
      case 'refresh':
        this.fetchAllTracksDataRefresh();
        break;
      default:
        break;
    }
  }

  hasRequest(): boolean {
    return this.requests.size > 0;
  }

  busy(): void {
    this.chart.emit('loading', true);
  }

  idle(): void {
    this.chart.emit('loading', false);
  }

  private fetchAllTracksDataForce(): void {
    this.busy();

    const trackManager = this.chart.getTrackManager();
    for (const segment of trackManager.segments()) {
      this.postRequestMessage(segment);
    }
  }

  private fetchAllTracksDataCache(): void {
    this.busy();

    const trackManager = this.chart.getTrackManager();
    const now = Date.now();
    for (const segment of trackManager.segments()) {
      const key = JSON.stringify(segment);
      const series = cache.get(key);
      if (series) {
        const [, end] = segment;
        if (end > now) {
          this.postRequestMessage(segment);
        } else {
          this.chart.setTrackData(segment, series);
        }
      } else {
        this.postRequestMessage(segment);
      }
    }
    if (!this.hasRequest()) {
      this.chart.render({ refreshSignal: true });
    }
  }

  private fetchAllTracksDataRefresh(): void {
    this.busy();

    const trackManager = this.chart.getTrackManager();
    const now = Date.now();
    for (const segment of trackManager.segments()) {
      const key = JSON.stringify(segment);
      const series = cache.get(key);
      if (series) {
        const [, end] = segment;
        if (end > now) {
          this.postRequestMessage(segment);
        } else {
          this.chart.setTrackData(segment, series);
        }
      } else {
        this.postRequestMessage(segment);
      }
    }
    const [, end] = this.chart.getChartExtent();
    const refreshSignal = end > now;
    if (!this.hasRequest()) {
      this.chart.render({ refreshSignal });
    }
  }

  postRequestMessage(extent: [number, number]): void {
    const requestId = uuid4();
    const [start, end] = extent;
    const channel = this.chart.getChannel();
    const { forceCenter, resample, sampleRate } = this.options;
    const msg: WorkerRequestData<StreamRequestData> = {
      type: 'stream.fetch',
      payload: {
        requestId: requestId,
        channelId: channel.id,
        start,
        end,
        forceCenter,
        resample,
        sampleRate,
      },
    };

    this.worker.postMessage(msg);
    this.requests.set(requestId, Date.now());
  }

  dispose(): void {
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
    this.requests.delete(requestId);
    if (this.requests.size === 0) {
      this.chart.render({ refreshSignal: true });
    }
  }
}
