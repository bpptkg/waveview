import { TrackView } from "../track/trackView";
import { Channel } from "../util/types";
import { Seismogram } from "./seismogram";

export class TrackManager {
  private store: [Channel, TrackView][] = [];
  private chart: Seismogram;

  constructor(chart: Seismogram) {
    this.chart = chart;
  }

  count(): number {
    return this.store.length;
  }

  add(channel: Channel, track: TrackView): void {
    this.store.push([channel, track]);
  }

  remove(index: number): [Channel, TrackView] {
    return this.store.splice(index, 1)[0];
  }

  indexOf(channel: Channel): number {
    return this.store.findIndex(([c]) => c.id === channel.id);
  }

  move(from: number, to: number): void {
    const [item] = this.store.splice(from, 1);
    this.store.splice(to, 0, item);
  }

  clear(): void {
    this.store = [];
  }

  getTrackByIndex(index: number): TrackView {
    return this.store[index][1];
  }

  getTrackByChannelId(channelId: string): TrackView | undefined {
    const item = this.store.find(([channel]) => channel.id === channelId);
    return item ? item[1] : undefined;
  }

  getTrackIndexByY(y: number): number {
    const trackCount = this.count();
    const trackHeight = this.chart.getRect().height / trackCount;
    const index = Math.floor(y / trackHeight);
    return Math.min(index, trackCount - 1);
  }

  *items(): Generator<[Channel, TrackView]> {
    for (const item of this.store) {
      yield item;
    }
  }

  *tracks(): Generator<TrackView> {
    for (const [, track] of this.store) {
      yield track;
    }
  }

  *channels(): Generator<Channel> {
    for (const [channel] of this.store) {
      yield channel;
    }
  }
}
