import { Series } from '@waveview/ndarray';
import { Seismogram, SpectrogramData } from '@waveview/zcharts';
import { ONE_MINUTE } from '../../../shared/time';
import { uuid4 } from '../../../shared/uuid';
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
}

export class SeismogramWebWorker {
  private worker: Worker;
  private chart: Seismogram;
  private options: SeismogramWebWorkerOptions;

  static readonly defaultOptions: SeismogramWebWorkerOptions = {
    forceCenter: true,
    selectionWindow: [Date.now() - 5 * ONE_MINUTE, Date.now()],
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
    this.chart.refreshChannelData();
    this.chart.render();
  }

  fetchChannelData(channelId: string): void {
    const [start, end] = this.options.selectionWindow;
    const requestId = uuid4();
    const { forceCenter } = this.options;
    const msg: WorkerRequestData<StreamRequestData> = {
      type: 'stream.fetch',
      payload: {
        requestId,
        channelId,
        start,
        end,
        forceCenter,
        resample: true,
        sampleRate: 20,
      },
    };

    this.worker.postMessage(msg);
  }

  fetchAllSpectrogramData(): void {
    for (const channel of this.chart.getChannels()) {
      this.fetchSpecrogramData(channel.id);
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
    const msg: WorkerRequestData<SpectrogramRequestData> = {
      type: 'stream.spectrogram',
      payload: {
        requestId,
        channelId,
        start,
        end,
        width,
        height,
        resample: true,
        sampleRate: 20, // Need to be the same as the sample rate of the seismogram data.
      },
    };

    this.worker.postMessage(msg);
  }

  fetchAllFiltersData(options: FilterOperationOptions): void {
    for (const channel of this.chart.getChannels()) {
      this.fetchFilterData(channel.id, options);
    }
  }

  fetchFilterData(channelId: string, options: FilterOperationOptions): void {
    const { filterType, filterOptions, taperType, taperWidth } = options;
    if (filterType === 'none') {
      return;
    }

    const [start, end] = this.options.selectionWindow;
    const msg: WorkerRequestData<FilterRequestData> = {
      type: 'stream.filter',
      payload: {
        requestId: uuid4(),
        channelId,
        filterType,
        start,
        end,
        filterOptions,
        taperType,
        taperWidth,
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
      case 'stream.spectrogram':
        this.onSpecrogramFetchMessage(payload as SpectrogramResponseData);
        break;
      case 'stream.filter':
        this.onStreamFilterMessage(payload as StreamResponseData);
        break;
      default:
        break;
    }
  }

  private onStreamFetchMessage(payload: StreamResponseData): void {
    const { data, index, channelId } = payload;
    const series = new Series(data, {
      index: index,
      name: channelId,
    });
    this.chart.setChannelData(channelId, series);
    this.chart.refreshChannelData();
    this.chart.render();

    const [start, end] = this.options.selectionWindow;
    const key = JSON.stringify([channelId, start, end]);
    signalCache.set(key, series);
  }

  private onSpecrogramFetchMessage(payload: SpectrogramResponseData): void {
    const { image, channelId, timeMin, timeMax, freqMin, freqMax, timeLength, freqLength, min, max } = payload;
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
    if (specgram.isEmpty()) {
      return;
    }
    this.chart.setSpectrogramData(channelId, specgram);
    this.chart.render();
  }

  private onStreamFilterMessage(payload: StreamResponseData): void {
    const { data, index, channelId } = payload;
    const series = new Series(data, {
      index: index,
      name: channelId,
    });
    this.chart.setChannelData(channelId, series);
    this.chart.refreshChannelData();
    this.chart.render();
  }
}
