import { StreamIdentifier } from "@waveview/stream";
import { Track } from "../track/track";

export class TrackManager {
  private _store: [StreamIdentifier, Track][] = [];

  count(): number {
    return this._store.length;
  }

  add(channel: StreamIdentifier, track: Track): void {
    this._store.push([channel, track]);
  }

  remove(index: number): [StreamIdentifier, Track] {
    return this._store.splice(index, 1)[0];
  }

  *items(): Generator<[StreamIdentifier, Track]> {
    for (const pair of this._store) {
      yield pair;
    }
  }

  *tracks(): Generator<Track> {
    for (const [, track] of this._store) {
      yield track;
    }
  }

  *channels(): Generator<StreamIdentifier> {
    for (const [channel] of this._store) {
      yield channel;
    }
  }

  getTrackByChannel(channel: StreamIdentifier): Track | undefined {
    const pair = this._store.find(([c]) => c === channel);
    return pair ? pair[1] : undefined;
  }

  getTrackByIndex(index: number): Track {
    return this._store[index][1];
  }

  getTracks(): Track[] {
    return this._store.map(([, track]) => track);
  }

  getChannelByIndex(index: number): StreamIdentifier {
    return this._store[index][0];
  }

  getChannels(): StreamIdentifier[] {
    return this._store.map(([channel]) => channel);
  }

  findChannelIndex(id: string): number {
    return this._store.findIndex(([c]) => c.id === id);
  }

  moveChannel(fromIndex: number, toIndex: number): void {
    const [pair] = this._store.splice(fromIndex, 1);
    this._store.splice(toIndex, 0, pair);
  }

  updateChannel(index: number, channel: StreamIdentifier): void {
    this._store[index][0] = channel;
  }

  updateTrack(index: number, track: Track): void {
    this._store[index][1] = track;
  }

  clear(): void {
    this._store = [];
  }
}
