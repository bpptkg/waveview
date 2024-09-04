import { Track } from "../track/track";
import { Channel } from "../util/types";

export class TrackManager {
  private _store: [Channel, Track][] = [];

  count(): number {
    return this._store.length;
  }

  add(channel: Channel, track: Track): void {
    this._store.push([channel, track]);
  }

  remove(index: number): [Channel, Track] {
    return this._store.splice(index, 1)[0];
  }

  *items(): Generator<[Channel, Track]> {
    for (const pair of this._store) {
      yield pair;
    }
  }

  *tracks(): Generator<Track> {
    for (const [, track] of this._store) {
      yield track;
    }
  }

  *channels(): Generator<Channel> {
    for (const [channel] of this._store) {
      yield channel;
    }
  }

  findTrackIndex(track: Track): number {
    return this._store.findIndex(([, t]) => t === track);
  }

  getTrackByChannel(channel: Channel): Track | undefined {
    const pair = this._store.find(([c]) => c === channel);
    return pair ? pair[1] : undefined;
  }

  getTrackByIndex(index: number): Track {
    return this._store[index][1];
  }

  getTracks(): Track[] {
    return this._store.map(([, track]) => track);
  }

  getChannelByIndex(index: number): Channel {
    return this._store[index][0];
  }

  getChannels(): Channel[] {
    return this._store.map(([channel]) => channel);
  }

  findChannelIndex(id: string): number {
    return this._store.findIndex(([c]) => c.id === id);
  }

  moveChannel(fromIndex: number, toIndex: number): void {
    const [pair] = this._store.splice(fromIndex, 1);
    this._store.splice(toIndex, 0, pair);
  }

  updateChannel(index: number, channel: Channel): void {
    this._store[index][0] = channel;
  }

  updateTrack(index: number, track: Track): void {
    this._store[index][1] = track;
  }

  clear(): void {
    this._store = [];
  }
}
