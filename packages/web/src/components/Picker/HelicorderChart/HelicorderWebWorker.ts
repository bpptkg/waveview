import { Series } from '@waveview/ndarray';
import { Helicorder } from '@waveview/zcharts';
import { debounce } from '../../../shared/debounce';
import { uuid4 } from '../../../shared/uuid';
import { FilterRequestData, StreamRequestData, StreamResponseData, WorkerRequestData, WorkerResponseData } from '../../../types/worker';
import { FilterOperationOptions } from '../../../types/filter';
import { Segment } from '../../../../../zcharts/src/helicorder/dataStore';

const signalCache = new Map<string, Series>();
const filterCache = new Map<string, Series>();

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
  /**
   * Applied filter options. If null, the worker will fetch the raw data. If not
   * null, the worker will fetch the filtered data.
   */
  appliedFilter: FilterOperationOptions | null;
}

export class HelicorderWebWorker {
  private worker: Worker;
  private chart: Helicorder;
  private options: HelicorderWebWorkerOptions;
  private signalRequests: Map<string, number> = new Map();
  private filterRequests: Map<string, number> = new Map();

  fetchAllTracksDataDebounced: (options?: RefreshOptions) => void;
  fetchAllFiltersDataDebounced: (options?: RefreshOptions) => void;

  static readonly defaultOptions: HelicorderWebWorkerOptions = {
    forceCenter: true,
    resample: true,
    sampleRate: 25,
    appliedFilter: null,
  };

  constructor(chart: Helicorder, worker: Worker, options?: Partial<HelicorderWebWorkerOptions>) {
    this.chart = chart;
    this.worker = worker;
    this.options = { ...HelicorderWebWorker.defaultOptions, ...options };

    this.worker.addEventListener('message', this.onMessage.bind(this));
    this.fetchAllTracksDataDebounced = debounce(this.fetchAllTracksData, 300);
    this.fetchAllFiltersDataDebounced = debounce(this.fetchAllFiltersData, 300);
  }

  mergeOptions(options: Partial<HelicorderWebWorkerOptions>): void {
    this.options = { ...this.options, ...options };
  }

  hasSignalRequests(): boolean {
    return this.signalRequests.size > 0;
  }

  hasFilterRequests(): boolean {
    return this.filterRequests.size > 0;
  }

  hasFilter(): boolean {
    return this.options.appliedFilter !== null && this.options.appliedFilter !== undefined;
  }

  busy(): void {
    this.chart.emit('loading', true);
  }

  idle(): void {
    this.chart.emit('loading', false);
  }

  /**
   * Convenient method to restore all channels data. Use this when initializing
   * the chart only.
   */
  restoreAllTracksData(): void {
    if (this.hasFilter()) {
      this.fetchAllFiltersData({ mode: 'cache' });
    } else {
      this.fetchAllTracksData({ mode: 'cache' });
    }
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
      const series = signalCache.get(key);
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
    if (!this.hasSignalRequests()) {
      this.chart.render({ refreshSignal: true });
    }
  }

  private fetchAllTracksDataRefresh(): void {
    this.busy();

    const trackManager = this.chart.getTrackManager();
    const now = Date.now();
    for (const segment of trackManager.segments()) {
      const key = JSON.stringify(segment);
      const series = signalCache.get(key);
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
    if (!this.hasSignalRequests()) {
      this.chart.render({ refreshSignal });
    }
  }

  private postRequestMessage(extent: [number, number]): void {
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
    this.signalRequests.set(requestId, Date.now());
  }

  fetchAllFiltersData(options?: RefreshOptions): void {
    const { appliedFilter } = this.options;
    if (!appliedFilter) {
      return;
    }
    const { mode } = options || { mode: 'cache' };
    switch (mode) {
      case 'force':
        this.fetchAllFiltersDataForce(appliedFilter);
        break;
      case 'cache':
        this.fetchAllFiltersDataCache(appliedFilter);
        break;
      case 'refresh':
        this.fetchAllFiltersDataRefresh(appliedFilter);
        break;
      default:
        break;
    }
  }

  private fetchAllFiltersDataForce(options: FilterOperationOptions): void {
    this.busy();

    const trackManager = this.chart.getTrackManager();
    for (const segment of trackManager.segments()) {
      this.fetchFilterData(segment, options);
    }
  }

  private fetchAllFiltersDataCache(options: FilterOperationOptions): void {
    this.busy();

    const trackManager = this.chart.getTrackManager();
    const now = Date.now();
    for (const segment of trackManager.segments()) {
      const key = JSON.stringify(segment);
      const series = filterCache.get(key);
      if (series) {
        const [, end] = segment;
        if (end > now) {
          this.fetchFilterData(segment, options);
        } else {
          this.chart.setTrackData(segment, series);
        }
      } else {
        this.fetchFilterData(segment, options);
      }
    }
    if (!this.hasFilterRequests()) {
      this.chart.render({ refreshSignal: true });
    }
  }

  private fetchAllFiltersDataRefresh(options: FilterOperationOptions): void {
    this.busy();

    const trackManager = this.chart.getTrackManager();
    const now = Date.now();
    for (const segment of trackManager.segments()) {
      const key = JSON.stringify(segment);
      const series = filterCache.get(key);
      if (series) {
        const [, end] = segment;
        if (end > now) {
          this.fetchFilterData(segment, options);
        } else {
          this.chart.setTrackData(segment, series);
        }
      } else {
        this.fetchFilterData(segment, options);
      }
    }
    const [, end] = this.chart.getChartExtent();
    const refreshSignal = end > now;
    if (!this.hasSignalRequests()) {
      this.chart.render({ refreshSignal });
    }
  }

  private fetchFilterData(segment: Segment, options: FilterOperationOptions): void {
    const { filterType, filterOptions, taperType, taperWidth } = options;
    if (filterType === 'none') {
      return;
    }
    const requestId = uuid4();
    const [start, end] = segment;
    const channel = this.chart.getChannel();
    const channelId = channel.id;
    const { resample, sampleRate } = this.options;
    const msg: WorkerRequestData<FilterRequestData> = {
      type: 'stream.filter',
      payload: {
        requestId,
        channelId,
        filterType,
        start,
        end,
        filterOptions,
        taperType,
        taperWidth,
        resample,
        sampleRate,
      },
    };
    this.worker.postMessage(msg);
    this.filterRequests.set(requestId, Date.now());
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
      case 'stream.filter':
        this.onStreamFilterMessage(payload as StreamResponseData);
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
    signalCache.set(key, series);
    this.chart.setTrackData(segment, series);

    this.signalRequests.delete(requestId);
    if (this.signalRequests.size === 0) {
      this.chart.render({ refreshSignal: true });
    }
  }

  private onStreamFilterMessage(payload: StreamResponseData): void {
    const { requestId, data, index, start, end, channelId } = payload;
    const series = new Series(data, {
      index: index,
      name: channelId,
    });
    const segment: [number, number] = [start, end];
    const key = JSON.stringify(segment);
    filterCache.set(key, series);
    this.chart.setTrackData(segment, series);

    this.filterRequests.delete(requestId);
    if (this.filterRequests.size === 0) {
      this.chart.render({ refreshSignal: true });
    }
  }
}
