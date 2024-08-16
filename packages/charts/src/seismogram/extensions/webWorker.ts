import { Series } from "@waveview/ndarray";
import { v4 as uuid4 } from "uuid";
import { Debounce } from "../../util/decorators";
import { ONE_MINUTE } from "../../util/time";
import {
  Extension,
  ResampleMode,
  StreamRequestData,
  StreamResponseData,
  WorkerRequestData,
  WorkerResponseData,
} from "../../util/types";
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
    const extent = this._chart.getXAxis().getExtent();
    const channels = this._chart.getChannels();

    channels.forEach((channel) => {
      this.postRequestMessage(channel.id, extent);
    });
  }

  @Debounce(300)
  fetchAllChannelsDataDebounced(): void {
    this.fetchAllChannelsData();
  }

  fetchChannelData(channelId: string): void {
    const extent = this._chart.getXAxis().getExtent();
    this.postRequestMessage(channelId, extent);
  }

  postRequestMessage(channelId: string, extent: [number, number]): void {
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
      },
    };

    this.postMessage(msg);
  }

  private _onMessage(event: MessageEvent<WorkerResponseData<unknown>>): void {
    const { type, payload } = event.data;

    switch (type) {
      case "stream.fetch":
        this._onStreamFetch(payload as StreamResponseData);
        break;
      case "stream.fetch.error":
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
