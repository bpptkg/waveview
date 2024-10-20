import { TrackView } from "../track/trackView";
import { Channel } from "../util/types";
import { Seismogram } from "./seismogram";

/**
 * A manager for seismogram tracks.
 */
export class TrackManager {
  private store: [Channel, TrackView][] = [];
  private chart: Seismogram;

  constructor(chart: Seismogram) {
    this.chart = chart;
  }

  /**
   * Get the number of tracks.
   */
  count(): number {
    return this.store.length;
  }

  /**
   * Add a track to the manager.
   */
  add(channel: Channel, track: TrackView): void {
    this.store.push([channel, track]);
  }

  /**
   * Remove a track from the manager.
   */
  remove(index: number): [Channel, TrackView] {
    return this.store.splice(index, 1)[0];
  }

  /**
   * Get the index of a channel in the manager.
   */
  indexOf(channel: Channel): number {
    return this.store.findIndex(([c]) => c.id === channel.id);
  }

  /**
   * Move a track from one index to another.
   */
  move(from: number, to: number): void {
    const [item] = this.store.splice(from, 1);
    this.store.splice(to, 0, item);
  }

  /**
   * Clear all tracks from the manager. This does not remove the tracks from the
   * chart. It only removes the tracks from the manager.
   */
  clear(): void {
    this.store = [];
  }

  /**
   * Get the channel and track at the specified index.
   */
  getChannelByIndex(index: number): Channel {
    return this.store[index][0];
  }

  /**
   * Get the track at the specified index.
   */
  getTrackByIndex(index: number): TrackView {
    return this.store[index][1];
  }

  /**
   * Get the track for the specified channel ID.
   */
  getTrackByChannelId(channelId: string): TrackView | undefined {
    const item = this.store.find(([channel]) => channel.id === channelId);
    return item ? item[1] : undefined;
  }

  /**
   * Get the track index by the Y pixel value.
   */
  getTrackIndexByY(value: number): number {
    const count = this.count();
    const { y, height } = this.chart.getGrid().getRect();
    const gap = 10;
    const spacing = gap * (count + 1);
    const trackHeight = (height - spacing) / count;
    const index = Math.floor((value - (y + gap)) / (trackHeight + gap));
    return Math.min(index, count - 1);
  }

  /**
   * Get index of a track in the manager.
   */
  indexOfTrack(track: TrackView): number {
    return this.store.findIndex(([, t]) => t === track);
  }

  /**
   * Iterate over the items in the manager.
   */
  *items(): Generator<[Channel, TrackView]> {
    for (const item of this.store) {
      yield item;
    }
  }

  /**
   * Iterate over the tracks in the manager.
   */
  *tracks(): Generator<TrackView> {
    for (const [, track] of this.store) {
      yield track;
    }
  }

  /**
   * Iterate over the channels in the manager.
   */
  *channels(): Generator<Channel> {
    for (const [channel] of this.store) {
      yield channel;
    }
  }
}
