import { Series } from '@waveview/ndarray';
import { Seismogram, SpectrogramData } from '@waveview/zcharts';
import { refreshToken } from '../../../services/api';
import { ONE_MINUTE } from '../../../shared/time';
import { uuid4 } from '../../../shared/uuid';
import { getJwtToken } from '../../../stores/auth/utils';
import { JwtToken } from '../../../types/auth';
import { FilterOperationOptions } from '../../../types/filter';
import {
  FilterRequestData,
  SpectrogramRequestData,
  SpectrogramResponseData,
  StreamRequestData,
  StreamResponseData,
  WorkerRequestData,
  WorkerResponseData,
} from '../../../types/worker';

export interface RefreshOptions {
  mode: 'force' | 'cache';
}

export class DataStore<T> {
  private data: Map<string, T> = new Map();

  set(key: string, data: T): void {
    this.data.set(key, data);
  }

  get(key: string): T | undefined {
    return this.data.get(key);
  }

  has(key: string): boolean {
    return this.data.has(key);
  }

  remove(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }

  size(): number {
    return this.data.size;
  }
}

const signalCache = new DataStore<Series>();
const spectrogramCache = new DataStore<SpectrogramData>();

export interface SeismogramWebWorkerOptions {
  /**
   * Force center the data.
   */
  forceCenter: boolean;
  /**
   * Initial selection window. Use this for fetching data instead of chart
   * extent because the chart extent may change when the user zooms in/out.
   */
  selectionWindow: [number, number];
  /**
   * Applied filter options. If null, the worker will fetch the raw data. If not
   * null, the worker will fetch the filtered data.
   */
  appliedFilter: FilterOperationOptions | null;
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

export class SeismogramWebWorker {
  private worker: Worker;
  private chart: Seismogram;
  private options: SeismogramWebWorkerOptions;
  private signalRequests: Map<string, number> = new Map();
  private spectrogramRequests: Map<string, number> = new Map();
  private filterRequests: Map<string, number> = new Map();

  static readonly defaultOptions: SeismogramWebWorkerOptions = {
    forceCenter: true,
    selectionWindow: [Date.now() - 5 * ONE_MINUTE, Date.now()],
    appliedFilter: null,
    resample: false,
    sampleRate: 1,
  };

  constructor(chart: Seismogram, worker: Worker, options?: Partial<SeismogramWebWorkerOptions>) {
    this.worker = worker;
    this.chart = chart;
    this.worker.addEventListener('message', this.onMessage.bind(this));

    this.options = { ...SeismogramWebWorker.defaultOptions, ...options };
  }

  mergeOptions(options: Partial<SeismogramWebWorkerOptions>): void {
    this.options = { ...this.options, ...options };
  }

  getOptions(): SeismogramWebWorkerOptions {
    return this.options;
  }

  hasFilter(): boolean {
    return this.options.appliedFilter !== null && this.options.appliedFilter !== undefined;
  }

  hasSignalRequest(): boolean {
    return this.signalRequests.size > 0;
  }

  hasSpectrogramRequest(): boolean {
    return this.spectrogramRequests.size > 0;
  }

  hasFilterRequest(): boolean {
    return this.filterRequests.size > 0;
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
  restoreAllChannelsData(): void {
    if (this.hasFilter()) {
      this.fetchAllFiltersData();
    } else {
      this.fetchAllChannelsData({ mode: 'cache' });
    }
    if (this.chart.isSpectrogramShown()) {
      this.fetchAllSpectrogramData({ mode: 'cache' });
    }
  }

  fetchAllChannelsData(options?: RefreshOptions): void {
    const { mode } = options || { mode: 'force' };
    switch (mode) {
      case 'force':
        this.fetchAllChannelsDataForce();
        break;
      case 'cache':
        this.fetchAllChannelsDataCache();
        break;
      default:
        break;
    }
  }

  private fetchAllChannelsDataForce(): void {
    for (const channel of this.chart.getChannels()) {
      this.fetchChannelData(channel.id);
    }
  }

  private fetchAllChannelsDataCache(): void {
    for (const channel of this.chart.getChannels()) {
      const [start, end] = this.options.selectionWindow;
      const key = JSON.stringify([channel.id, start, end]);
      const series = signalCache.get(key);
      if (series) {
        this.chart.setChannelData(channel.id, series);
      } else {
        this.fetchChannelData(channel.id);
      }
    }
    if (!this.hasSignalRequest()) {
      this.chart.render();
    }
  }

  fetchChannelData(channelId: string): void {
    const [start, end] = this.options.selectionWindow;
    const requestId = uuid4();
    const { forceCenter, resample, sampleRate } = this.options;
    const msg: WorkerRequestData<StreamRequestData> = {
      type: 'stream.fetch',
      payload: {
        requestId,
        channelId,
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

  fetchAllSpectrogramData(options?: RefreshOptions): void {
    const { mode = 'force' } = options || {};
    switch (mode) {
      case 'force':
        this.fetchAllSpectrogramDataForce();
        break;
      case 'cache':
        this.fetchAllSpectrogramDataCache();
        break;
      default:
        break;
    }
  }

  private fetchAllSpectrogramDataForce(): void {
    for (const channel of this.chart.getChannels()) {
      this.fetchSpecrogramData(channel.id);
    }
  }

  private fetchAllSpectrogramDataCache(): void {
    for (const channel of this.chart.getChannels()) {
      const [start, end] = this.options.selectionWindow;
      const key = JSON.stringify([channel.id, start, end]);
      const specgram = spectrogramCache.get(key);
      if (specgram) {
        this.chart.setSpectrogramData(channel.id, specgram);
      } else {
        this.fetchSpecrogramData(channel.id);
      }
    }
    if (!this.hasSpectrogramRequest()) {
      this.chart.render({ refreshSignal: false });
    }
  }

  fetchSpecrogramData(channelId: string): void {
    const [start, end] = this.options.selectionWindow;
    const trackManager = this.chart.getTrackManager();
    const track = trackManager.getTrackByChannelId(channelId);
    if (!track) {
      return;
    }
    const { width, height } = track.getRect();
    const requestId = uuid4();
    const { resample, sampleRate } = this.options;
    const msg: WorkerRequestData<SpectrogramRequestData> = {
      type: 'stream.spectrogram',
      payload: {
        requestId,
        channelId,
        start,
        end,
        width,
        height,
        resample,
        sampleRate,
      },
    };

    this.worker.postMessage(msg);
    this.spectrogramRequests.set(requestId, Date.now());
  }

  fetchAllFiltersData(): void {
    const { appliedFilter } = this.options;
    if (!appliedFilter) {
      return;
    }
    for (const channel of this.chart.getChannels()) {
      this.fetchFilterData(channel.id, appliedFilter);
    }
  }

  fetchFilterData(channelId: string, options: FilterOperationOptions): void {
    const { filterType, filterOptions, taperType, taperWidth } = options;
    if (filterType === 'none') {
      return;
    }
    const requestId = uuid4();
    const [start, end] = this.options.selectionWindow;
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

  dispose(): void {}

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
      case 'stream.spectrogram':
        this.onSpecrogramFetchMessage(payload as SpectrogramResponseData);
        break;
      case 'stream.filter':
        this.onStreamFilterMessage(payload as StreamResponseData);
        break;
      case 'refreshToken':
        this.refreshToken();
        break;
      default:
        break;
    }
  }

  private onStreamFetchMessage(payload: StreamResponseData): void {
    const { data, index, channelId, requestId } = payload;
    const series = new Series(data, {
      index: index,
      name: channelId,
    });
    this.chart.setChannelData(channelId, series);

    const [start, end] = this.options.selectionWindow;
    const key = JSON.stringify([channelId, start, end]);
    signalCache.set(key, series);

    this.signalRequests.delete(requestId);
    if (this.signalRequests.size === 0) {
      this.chart.render();
    }
  }

  private onSpecrogramFetchMessage(payload: SpectrogramResponseData): void {
    const { image, channelId, timeMin, timeMax, freqMin, freqMax, timeLength, freqLength, min, max, requestId } = payload;
    const specgram = new SpectrogramData({
      image,
      timeMin,
      timeMax,
      freqMin,
      freqMax,
      timeLength,
      freqLength,
      min,
      max,
    });
    if (!specgram.isEmpty()) {
      this.chart.setSpectrogramData(channelId, specgram);

      const [start, end] = this.options.selectionWindow;
      const key = JSON.stringify([channelId, start, end]);
      spectrogramCache.set(key, specgram);
    }

    this.spectrogramRequests.delete(requestId);
    if (this.spectrogramRequests.size === 0) {
      this.chart.render({ refreshSignal: false });
    }
  }

  private onStreamFilterMessage(payload: StreamResponseData): void {
    const { data, index, channelId, requestId } = payload;
    const series = new Series(data, {
      index: index,
      name: channelId,
    });
    this.chart.setChannelData(channelId, series);

    this.signalRequests.delete(requestId);
    if (this.signalRequests.size === 0) {
      this.chart.render();
    }
  }
}
