import { Series } from "@waveview/ndarray";
import {
  Extension,
  StreamRequestData,
  StreamResponseData,
  WorkerRequestData,
  WorkerResponseData,
} from "../util/types";
import { Helicorder } from "./helicorder";

export interface RefreshMode {
  mode: "light" | "hard";
}

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
      if (!dataStore.has(trackId)) {
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
      this.chart.updateTracks();
      this.chart.render();
    }
  }

  postRequestMessage(extent: [number, number]): void {
    const [start, end] = extent;
    const width = this.chart.getWidth();
    const channelId = this.chart.getChannel().id;
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
    this.chart.updateTracks();
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
}

export class HelicorderWebWorkerExtension implements Extension<Helicorder> {
  private worker: Worker;
  private impl?: HelicorderWebWorker;

  constructor(worker: Worker) {
    this.worker = worker;
  }

  install(chart: Helicorder): void {
    this.impl = new HelicorderWebWorker(chart, this.worker);
    this.impl.attachEventListeners();
  }

  uninstall(): void {
    if (this.impl) {
      this.impl.detachEventListeners();
      this.impl.terminate();
    }
  }

  getInstance(): HelicorderWebWorker {
    if (!this.impl) {
      throw new Error("Extension not installed");
    }
    return this.impl;
  }
}
