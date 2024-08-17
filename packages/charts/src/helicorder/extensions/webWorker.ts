import { Series } from "@waveview/ndarray";
import { Debounce } from "../../util/decorators";
import {
  Extension,
  RefreshMode,
  StreamRequestData,
  StreamResponseData,
  WorkerRequestData,
  WorkerResponseData,
} from "../../util/types";
import { uuid4 } from "../../util/uuid";
import { Helicorder } from "../helicorder";

export class HelicorderWebWorker {
  private _worker: Worker;
  private _chart: Helicorder;
  private _interval?: number;
  private _requests: Map<string, number> = new Map();

  constructor(chart: Helicorder, worker: Worker) {
    this._worker = worker;
    this._worker.addEventListener("message", this.onMessage.bind(this));
    this._chart = chart;
    this._interval = undefined;
    this._requests = new Map();
  }

  attachEventListeners(): void {}

  detachEventListeners(): void {}

  refreshRealtimeFeed(): void {
    const now = Date.now();
    const [start, end] = this._chart.getChartExtent();
    if (this._interval) {
      clearInterval(this._interval);
    }
    if (now >= start && now <= end) {
      this._interval = window.setInterval(() => {
        this.fetchAllTracksData({ mode: "light" });
      }, 3000);
    }
  }

  fetchAllTracksData(options: Partial<RefreshMode> = {}): void {
    const mode = options.mode || "light";
    const extents = this._chart.getTrackExtents();
    const dataStore = this._chart.getDataStore();

    extents.forEach((extent: [number, number]) => {
      const trackId = this._chart.getTrackId(extent);
      if (dataStore.has(trackId)) {
        const [start, end] = extent;
        const now = Date.now();
        if (now >= start && now <= end) {
          // If now is between the start and end of the track, request data.
          this.postRequestMessage(extent);
        }
      } else {
        if (mode === "light") {
          // In light mode, only request data for tracks not in the data store.
          this.postRequestMessage(extent);
        }
      }
    });

    if (mode !== "light") {
      // In modes other than light, request data for all tracks regardless.
      extents.forEach((extent: [number, number]) => {
        this.postRequestMessage(extent);
      });
    }
  }

  @Debounce(300)
  fetchAllTracksDataDebounced(options: Partial<RefreshMode> = {}): void {
    this.fetchAllTracksData(options);
  }

  postRequestMessage(extent: [number, number]): void {
    const requestId = uuid4();
    const [start, end] = extent;
    const width = this._chart.getWidth();
    const channel = this._chart.getChannel();
    const msg: WorkerRequestData<StreamRequestData> = {
      type: "stream.fetch",
      payload: {
        requestId: requestId,
        channelId: channel.id,
        start,
        end,
        width,
        mode: "match_width",
      },
    };

    this.postMessage(msg);

    this._requests.set(requestId, Date.now());
  }

  private onMessage(event: MessageEvent<WorkerResponseData<unknown>>): void {
    const { type, payload } = event.data;

    switch (type) {
      case "stream.fetch":
        this.onStreamFetch(payload as StreamResponseData);
        break;
      case "stream.fetch.error":
        break;
      case "ping":
        break;
      default:
        break;
    }
  }

  private onStreamFetch(payload: StreamResponseData): void {
    const { data, index, channelId, requestId, start, end } = payload;
    const seriesData = new Series(data, {
      index: index,
      name: channelId,
    });
    this._chart.setTrackData(seriesData, start, end);
    this._chart.refreshData();
    this._chart.render();

    this._requests.delete(requestId);
    if (this._requests.size === 0) {
      this.refreshRealtimeFeed();
    }
  }

  postMessage<T>(data: WorkerRequestData<T>): void {
    this._worker.postMessage(data);
  }

  terminate(): void {
    this._worker.terminate();
  }

  dispose(): void {
    this.detachEventListeners();
    this.terminate();
    if (this._interval) {
      clearInterval(this._interval);
    }
  }
}

export class HelicorderWebWorkerExtension implements Extension<Helicorder> {
  private _worker: Worker;
  private _instance?: HelicorderWebWorker;

  constructor(worker: Worker) {
    this._worker = worker;
  }

  install(chart: Helicorder): void {
    this._instance = new HelicorderWebWorker(chart, this._worker);
    this._instance.attachEventListeners();
  }

  uninstall(): void {
    if (this._instance) {
      this.dispose();
    }
  }

  getAPI(): HelicorderWebWorker {
    if (!this._instance) {
      throw new Error("HelicorderWebWorker extension is not installed");
    }
    return this._instance;
  }

  dispose(): void {
    if (this._instance) {
      this._instance.dispose();
      this._instance = undefined;
    }
  }
}
