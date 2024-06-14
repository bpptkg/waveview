import { Series } from "@waveview/ndarray";
import { debounce } from "../util/decorators";
import { ONE_MINUTE } from "../util/time";
import {
  Extension,
  ResampleMode,
  StreamRequestData,
  StreamResponseData,
  WorkerRequestData,
  WorkerResponseData,
} from "../util/types";
import { Seismogram } from "./seismogram";

export class SeismogramWebWorker {
  private worker: Worker;
  private chart: Seismogram;

  constructor(chart: Seismogram, worker: Worker) {
    this.worker = worker;
    this.worker.addEventListener("message", this.onMessage.bind(this));
    this.chart = chart;
  }

  attachEventListeners(): void {
    this.chart.on("extentChanged", this.onExtentChanged.bind(this));
  }

  detachEventListeners(): void {
    this.chart.off("extentChanged", this.onExtentChanged.bind(this));
  }

  onExtentChanged(): void {
    this.fetchAllChannelsData();

    this.chart.refreshData();
    this.chart.render();
  }

  @debounce(100)
  fetchAllChannelsData(): void {
    const extent = this.chart.getXAxis().getExtent();
    const channels = this.chart.getChannels();

    channels.forEach((channel) => {
      this.postRequestMessage(channel.id, extent);
    });
  }

  postRequestMessage(channelId: string, extent: [number, number]): void {
    const [start, end] = extent;
    const diffInMinutes = (end - start) / ONE_MINUTE;
    const threshold = 3;
    const mode: ResampleMode =
      diffInMinutes < threshold ? "max_points" : "match_width";

    const width = this.chart.getWidth();
    const msg: WorkerRequestData<StreamRequestData> = {
      type: "stream.fetch",
      payload: {
        channelId,
        start,
        end,
        width,
        mode,
        maxPoints: 100 * 60 * 3,
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
      default:
        break;
    }
  }

  onStreamFetch(data: StreamResponseData): void {
    const seriesData = new Series(data.data, {
      index: data.index,
      name: data.channelId,
    });
    const index = this.chart.getTrackIndexByChannelId(data.channelId);
    if (index !== -1) {
      this.chart.setChannelData(index, seriesData);
      this.chart.refreshData();
      this.chart.render();
    }
  }

  postMessage<T>(data: WorkerRequestData<T>): void {
    this.worker.postMessage(data);
  }

  destroy(): void {
    this.worker.terminate();
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

  getInstance(): SeismogramWebWorker {
    if (!this.seismogramWebWorker) {
      throw new Error("SeismogramWebWorker extension is not installed");
    }
    return this.seismogramWebWorker;
  }
}
