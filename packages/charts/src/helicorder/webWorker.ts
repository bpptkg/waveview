import { Series } from "@waveview/ndarray";
import {
  Extension,
  RefreshMode,
  StreamRequestData,
  StreamResponseData,
  WorkerRequestData,
  WorkerResponseData,
} from "../util/types";
import { Helicorder } from "./helicorder";

export class HelicorderWebWorker {
  private worker: Worker;
  private chart: Helicorder;

  constructor(chart: Helicorder, worker: Worker) {
    this.worker = worker;
    this.worker.addEventListener("message", this.onMessage.bind(this));
    this.chart = chart;
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

    // If all data is present, rerender the chart directly to avoid double
    // rendering.
    if (allDataPresent) {
      this.chart.refreshData();
      this.chart.render();
    }
  }

  postRequestMessage(extent: [number, number]): void {
    const [start, end] = extent;
    const width = this.chart.getWidth();
    const channelId = this.chart.getChannel();
    const msg: WorkerRequestData<StreamRequestData> = {
      type: "stream.fetch",
      payload: {
        channelId,
        start,
        end,
        width,
        mode: "match_width",
      },
    };

    this.postMessage(msg);
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

  onStreamFetch(data: StreamResponseData): void {
    const seriesData = new Series(data.data, {
      index: data.index,
      name: data.channelId,
    });
    this.chart.setTrackData(seriesData, data.start, data.end);
    this.chart.refreshData();
    this.chart.render();
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

  getInstance(): HelicorderWebWorker {
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
