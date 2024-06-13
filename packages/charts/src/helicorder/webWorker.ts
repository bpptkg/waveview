import { Series } from "@waveview/ndarray";
import { Helicorder } from "./helicorder";

export class HelicorderWebWorker {
  private worker: Worker;
  private chart: Helicorder;

  constructor(chart: Helicorder, worker: Worker) {
    this.worker = worker;
    this.worker.onmessage = this.onMessage.bind(this);
    this.chart = chart;
    this.chart.on("offsetChanged", this.onOffsetChanged.bind(this));
  }

  onOffsetChanged(): void {
    this.chart.getTrackExtents().forEach((extent) => {
      this.postMessage({
        type: "offsetChanged",
        extent,
      });
    });
  }

  onMessage(event: MessageEvent): void {
    const { data } = event;
    const msg = data as {
      index: Float64Array;
      values: Float64Array;
      start: number;
      end: number;
    };
    const seriesData = new Series(msg.values, { index: msg.index });
    this.chart.setTrackData(seriesData, msg.start, msg.end);
    this.chart.update();
    this.chart.render();
  }

  postMessage(data: any): void {
    this.worker.postMessage(data);
  }

  terminate(): void {
    this.worker.terminate();
  }
}
