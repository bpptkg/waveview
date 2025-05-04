import { Series } from '@waveview/ndarray';
import { Helicorder, Segment, SeriesData } from '@waveview/zcharts';
import { refreshToken } from '../../../services/api';
import { debounce } from '../../../shared/debounce';
import { ONE_MINUTE } from '../../../shared/time';
import { uuid4 } from '../../../shared/uuid';
import { getJwtToken } from '../../../stores/auth/utils';
import { JwtToken } from '../../../types/auth';
import { FilterOperationOptions } from '../../../types/filter';
import { FilterRequestData, StreamRequestData, StreamResponseData, WorkerRequestData, WorkerResponseData } from '../../../types/worker';

const signalCache = new Map<string, SeriesData>();
const filterCache = new Map<string, SeriesData>();

export interface RefreshOptions {
  /**
   * The mode to fetch data. If the mode is `force`, the worker will fetch data
   * for all tracks. If the mode is `cache`, the worker will fetch data for the
   * tracks that are not in the cache.
   */
  mode?: 'force' | 'cache' | 'refresh';
  /**
   * Whether to debounce the fetch request. If true, the fetch request will be
   * debounced for 300ms.
   */
  debounce?: boolean;
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
    sampleRate: 50,
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
    const { mode = 'cache' } = options || {};
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
        throw new Error(`Unknown mode: ${mode}`);
    }
  }

  private fetchAllTracksDataForce(): void {
    const trackManager = this.chart.getTrackManager();
    for (const segment of trackManager.segments()) {
      this.fetchTrackData(segment);
    }
  }

  private fetchAllTracksDataCache(): void {
    const channelId = this.chart.getChannel().id;
    const trackManager = this.chart.getTrackManager();
    const now = Date.now();
    for (const segment of trackManager.segments()) {
      const key = JSON.stringify([channelId, ...segment]);
      const seriesData = signalCache.get(key);
      if (seriesData) {
        const [, end] = segment;
        if (end + ONE_MINUTE >= now) {
          this.fetchTrackData(segment);
        } else {
          this.chart.setTrackData(segment, seriesData);
        }
      } else {
        this.fetchTrackData(segment);
      }
    }
    if (!this.hasSignalRequests()) {
      this.chart.render({ refreshSignal: true });
    }
  }

  private fetchAllTracksDataRefresh(): void {
    const channelId = this.chart.getChannel().id;
    const trackManager = this.chart.getTrackManager();
    const now = Date.now();
    for (const segment of trackManager.segments()) {
      const key = JSON.stringify([channelId, ...segment]);
      const seriesData = signalCache.get(key);
      if (seriesData) {
        const [, end] = segment;
        if (end + ONE_MINUTE > now) {
          this.fetchTrackData(segment);
        } else {
          this.chart.setTrackData(segment, seriesData);
        }
      } else {
        this.fetchTrackData(segment);
      }
    }
    const [, end] = this.chart.getChartExtent();
    const refreshSignal = end > now;
    if (!this.hasSignalRequests()) {
      this.chart.render({ refreshSignal });
    }
  }

  private fetchTrackData(extent: [number, number]): void {
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
    const { mode = 'cache' } = options || {};
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
        throw new Error(`Unknown mode: ${mode}`);
    }
  }

  private fetchAllFiltersDataForce(options: FilterOperationOptions): void {
    const trackManager = this.chart.getTrackManager();
    for (const segment of trackManager.segments()) {
      this.fetchFilterData(segment, options);
    }
  }

  private fetchAllFiltersDataCache(options: FilterOperationOptions): void {
    const channelId = this.chart.getChannel().id;
    const trackManager = this.chart.getTrackManager();
    const now = Date.now();
    for (const segment of trackManager.segments()) {
      const key = JSON.stringify([channelId, ...segment]);
      const seriesData = filterCache.get(key);
      if (seriesData) {
        const [, end] = segment;
        if (end + ONE_MINUTE > now) {
          this.fetchFilterData(segment, options);
        } else {
          this.chart.setTrackData(segment, seriesData);
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
    const channelId = this.chart.getChannel().id;
    const trackManager = this.chart.getTrackManager();
    const now = Date.now();
    for (const segment of trackManager.segments()) {
      const key = JSON.stringify([channelId, ...segment]);
      const seriesData = filterCache.get(key);
      if (seriesData) {
        const [, end] = segment;
        if (end + ONE_MINUTE > now) {
          this.fetchFilterData(segment, options);
        } else {
          this.chart.setTrackData(segment, seriesData);
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

  setup(jwt?: JwtToken): void {
    const token = jwt || getJwtToken();
    this.worker.postMessage({ type: 'setup', payload: { token } });
  }

  refreshToken(): void {
    refreshToken({ saveToken: false }).then((token) => {
      this.setup(token);
    });
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
      case 'refreshToken':
        this.refreshToken();
        break;
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  }

  private onStreamFetchMessage(payload: StreamResponseData): void {
    this.busy();
    const { requestId, data, index, start, end, channelId, min, max, count, mask } = payload;
    const series = new Series(data, {
      index: index,
      name: channelId,
      mask,
    });
    const seriesData: SeriesData = { series, min, max, count };
    const segment: [number, number] = [start, end];
    const key = JSON.stringify([channelId, ...segment]);
    this.chart.setTrackData(segment, seriesData);
    signalCache.set(key, seriesData);

    this.signalRequests.delete(requestId);
    if (this.signalRequests.size === 0) {
      this.idle();
      this.chart.render({ refreshSignal: true });
    }
  }

  private onStreamFilterMessage(payload: StreamResponseData): void {
    this.busy();
    const { requestId, data, index, start, end, channelId, min, max, count, mask } = payload;
    const series = new Series(data, {
      index: index,
      name: channelId,
      mask,
    });
    const seriesData: SeriesData = { series, min, max, count };
    const segment: [number, number] = [start, end];
    const key = JSON.stringify([channelId, ...segment]);
    this.chart.setTrackData(segment, seriesData);
    filterCache.set(key, seriesData);

    this.filterRequests.delete(requestId);
    if (this.filterRequests.size === 0) {
      this.idle();
      this.chart.render({ refreshSignal: true });
    }
  }
}
