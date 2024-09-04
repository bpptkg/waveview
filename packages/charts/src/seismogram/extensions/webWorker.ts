import { Series } from "@waveview/ndarray";
import { SpectrogramData } from "../../spectrogram";
import { Debounce } from "../../util/decorators";
import { ONE_MINUTE } from "../../util/time";
import {
  Channel,
  Extension,
  ResampleMode,
  SpectrogramRequestData,
  SpectrogramResponseData,
  StreamRequestData,
  StreamResponseData,
  WorkerRequestData,
  WorkerResponseData,
} from "../../util/types";
import { uuid4 } from "../../util/uuid";
import { Seismogram } from "../seismogram";

export interface SeismogramWebWorkerOptions {
  /**
   * The threshold in minutes to determine the resample mode.
   */
  threshold: number;
  /**
   * The maximum number of points to fetch.
   */
  maxPoints: number;
}

export class SeismogramWebWorker {
  private _worker: Worker;
  private _chart: Seismogram;
  private _options: SeismogramWebWorkerOptions;
  private _onExtentChangedBound: () => void;

  constructor(
    chart: Seismogram,
    worker: Worker,
    options?: Partial<SeismogramWebWorkerOptions>
  ) {
    this._worker = worker;
    this._worker.addEventListener("message", this._onMessage.bind(this));
    this._chart = chart;

    this._options = {
      threshold: 4,
      maxPoints: 100 * 60,
      ...options,
    };
    this._onExtentChangedBound = this._onExtentChanged.bind(this);
  }

  attachEventListeners(): void {
    this._chart.on("extentChanged", this._onExtentChangedBound);
  }

  detachEventListeners(): void {
    this._chart.off("extentChanged", this._onExtentChangedBound);
  }

  private _onExtentChanged(): void {
    this.fetchAllChannelsData();
  }

  fetchAllChannelsData(): void {
    const channels = this._chart.getChannels();

    channels.forEach((channel) => {
      this.postRequestMessage(channel);
    });
  }

  fetchAllSpecrogramData(): void {
    const channels = this._chart.getChannels();

    channels.forEach((channel) => {
      this.postSpectrogramRequestMessage(channel);
    });
  }

  @Debounce(300)
  fetchAllChannelsDataDebounced(): void {
    this.fetchAllChannelsData();
  }

  @Debounce(300)
  fetchAllSpecrogramDataDebounced(): void {
    this.fetchAllSpecrogramData();
  }

  fetchChannelData(channelId: string): void {
    const channel = this._chart.getChannelById(channelId);
    this.postRequestMessage(channel);
  }

  fetchSpecrogramData(channelId: string): void {
    const channel = this._chart.getChannelById(channelId);
    this.postSpectrogramRequestMessage(channel);
  }

  postRequestMessage(channel: Channel): void {
    const extent = this._chart.getXAxis().getExtent();
    const channelId = channel.id;
    const { threshold, maxPoints } = this._options;
    const [start, end] = extent;
    const diffInMinutes = (end - start) / ONE_MINUTE;
    const mode: ResampleMode =
      diffInMinutes < threshold ? "max_points" : "match_width";

    const width = this._chart.getWidth();
    const requestId = uuid4();
    const msg: WorkerRequestData<StreamRequestData> = {
      type: "stream.fetch",
      payload: {
        requestId,
        channelId,
        start,
        end,
        width,
        mode,
        maxPoints: maxPoints,
        forceCenter: true,
      },
    };

    this.postMessage(msg);
  }

  postSpectrogramRequestMessage(channel: Channel): void {
    const [start, end] = this._chart.getChartExtent();
    const { width, height } = this._chart.getXAxis().getRect();
    const payload: SpectrogramRequestData = {
      requestId: uuid4(),
      channelId: channel.id,
      start,
      end,
      width,
      height,
    };
    const msg: WorkerRequestData<SpectrogramRequestData> = {
      type: "stream.spectrogram",
      payload,
    };
    this.postMessage(msg);
  }

  private _onMessage(event: MessageEvent<WorkerResponseData<unknown>>): void {
    const { type, payload } = event.data;

    switch (type) {
      case "stream.fetch":
        this._onStreamFetch(payload as StreamResponseData);
        break;
      case "stream.spectrogram":
        this._onSpecrogramFetch(payload as SpectrogramResponseData);
        break;
      default:
        break;
    }
  }

  private _onStreamFetch(payload: StreamResponseData): void {
    const { data, index, channelId } = payload;
    const seriesData = new Series(data, {
      index: index,
      name: channelId,
    });
    const idx = this._chart.getTrackIndexByChannelId(channelId);
    if (idx !== -1) {
      this._chart.setChannelData(idx, seriesData);
      this._chart.refreshData();
      this._chart.render();
    }
  }

  private _onSpecrogramFetch(payload: SpectrogramResponseData): void {
    const { channelId } = payload;
    const index = this._chart.getTrackIndexByChannelId(channelId);
    if (index !== -1) {
      const data = SpectrogramData.fromSpectrogramResponseData(payload);
      this._chart.setSpectrogramData(index, data);
      this._chart.render();
    }
  }

  postMessage<T>(data: WorkerRequestData<T>): void {
    this._worker.postMessage(data);
  }

  dispose(): void {
    this.detachEventListeners();
    this._worker.terminate();
  }
}

export class SeismogramWebWorkerExtension implements Extension<Seismogram> {
  private worker: Worker;
  private seismogramWebWorker?: SeismogramWebWorker;

  constructor(worker: Worker) {
    this.worker = worker;
  }

  install(chart: Seismogram): void {
    this.seismogramWebWorker = new SeismogramWebWorker(chart, this.worker);
    this.seismogramWebWorker.attachEventListeners();
  }

  uninstall(): void {
    if (this.seismogramWebWorker) {
      this.seismogramWebWorker.detachEventListeners();
    }
  }

  getAPI(): SeismogramWebWorker {
    if (!this.seismogramWebWorker) {
      throw new Error("SeismogramWebWorker extension is not installed");
    }
    return this.seismogramWebWorker;
  }
}
