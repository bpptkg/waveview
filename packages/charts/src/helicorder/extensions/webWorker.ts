import { Series } from "@waveview/ndarray";
import { v4 as uuid4 } from "uuid";
import {
  Extension,
  RefreshMode,
  StreamRequestData,
  StreamResponseData,
  WorkerRequestData,
  WorkerResponseData,
} from "../../util/types";
import { Helicorder } from "../helicorder";

export class HelicorderWebWorker {
  private worker: Worker;
  private chart: Helicorder;
  private interval?: number;
  private requests: Map<string, number> = new Map();

  constructor(chart: Helicorder, worker: Worker) {
    this.worker = worker;
    this.worker.addEventListener("message", this.onMessage.bind(this));
    this.chart = chart;
    this.interval = undefined;
    this.requests = new Map();
  }

  attachEventListeners(): void {
    this.chart.on("offsetChanged", this.onOffsetChanged.bind(this));
  }

  detachEventListeners(): void {
    this.chart.off("offsetChanged", this.onOffsetChanged.bind(this));
  }

  onOffsetChanged(): void {
    this.fetchAllTracksData({ mode: "light" });
  }

  refreshRealtimeFeed(): void {
    const now = Date.now();
    const [start, end] = this.chart.getChartExtent();
    if (this.interval) {
      clearInterval(this.interval);
    }
    if (now >= start && now <= end) {
      this.interval = window.setInterval(() => {
        this.fetchAllTracksData({ mode: "light" });
      }, 3000);
    }
  }

  fetchAllTracksData(options: Partial<RefreshMode> = {}): void {
    const mode = options.mode || "light";
    const extents = this.chart.getTrackExtents();
    const dataStore = this.chart.getDataStore();
    let allDataPresent = true;

    extents.forEach((extent: [number, number]) => {
      const trackId = this.chart.getTrackId(extent);
      if (dataStore.has(trackId)) {
        const [start, end] = extent;
        const now = Date.now();
        if (now >= start && now <= end) {
          // If now is between the start and end of the track, request data.
          this.postRequestMessage(extent);
          allDataPresent = false;
        }
      } else {
        allDataPresent = false;
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

    this.chart.refreshData();
    this.chart.render();
  }

  postRequestMessage(extent: [number, number]): void {
    const requestId = uuid4();
    const [start, end] = extent;
    const width = this.chart.getWidth();
    const channel = this.chart.getChannel();
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

    this.requests.set(requestId, Date.now());
  }

  onMessage(event: MessageEvent<WorkerResponseData<unknown>>): void {
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

  onStreamFetch(payload: StreamResponseData): void {
    const { data, index, channelId, requestId, start, end } = payload;
    const seriesData = new Series(data, {
      index: index,
      name: channelId,
    });
    this.chart.setTrackData(seriesData, start, end);
    this.chart.refreshData();
    this.chart.render();

    this.requests.delete(requestId);
    if (this.requests.size === 0) {
      this.refreshRealtimeFeed();
    }
  }

  postMessage<T>(data: WorkerRequestData<T>): void {
    this.worker.postMessage(data);
  }

  terminate(): void {
    this.worker.terminate();
  }

  ping(): void {
    const msg: WorkerRequestData<string> = {
      type: "ping",
      payload: "ping",
    };

    this.worker.postMessage(msg);
  }

  dispose(): void {
    this.detachEventListeners();
    this.terminate();
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}

export class HelicorderWebWorkerExtension implements Extension<Helicorder> {
  private worker: Worker;
  private instance?: HelicorderWebWorker;

  constructor(worker: Worker) {
    this.worker = worker;
  }

  install(chart: Helicorder): void {
    this.instance = new HelicorderWebWorker(chart, this.worker);
    this.instance.attachEventListeners();
  }

  uninstall(): void {
    if (this.instance) {
      this.dispose();
    }
  }

  getAPI(): HelicorderWebWorker {
    if (!this.instance) {
      throw new Error("HelicorderWebWorker extension is not installed");
    }
    return this.instance;
  }

  dispose(): void {
    if (this.instance) {
      this.instance.dispose();
      this.instance = undefined;
    }
  }
}
