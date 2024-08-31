import { StorageLayer, StorageLayerOptions } from "./layer";
import { StorageEngine } from "./storage";
import { ONE_MINUTE, StorageLevel } from "./types";

export interface LeveldbOptions {
  name?: string;
  layers?: StorageLayerOptions[];
}

/**
 * LevelDB is a multi-layered storage engine for storing time-series data. Each
 * layer is defined by a specific time sampling or resolution and the predefined
 * sample rate of data points to store per segment.
 */
export class Leveldb {
  readonly name: string;
  private readonly _db: StorageEngine;

  static readonly defaultLayerOptions: StorageLayerOptions[] = [
    { size: 4, sampleRate: 30 },
    { size: 5, sampleRate: 24 },
    { size: 10, sampleRate: 12 },
    { size: 15, sampleRate: 6 },
    { size: 30, sampleRate: 3 },
    { size: 60, sampleRate: 1 },
  ];

  constructor(options?: LeveldbOptions) {
    this._db = new StorageEngine();
    this.name = options?.name ?? "leveldb";
    if (options?.layers) {
      for (const layer of options.layers) {
        this.addLayer(layer.size, layer);
      }
    }
  }

  get size(): number {
    return this._db.size;
  }

  isEmpty(): boolean {
    return this._db.size === 0;
  }

  clear(): void {
    this._db.clear();
  }

  levels(): IterableIterator<StorageLevel> {
    return this._db.keys();
  }

  addLayer(level: StorageLevel, options: StorageLayerOptions): void {
    if (this._db.has(level)) {
      return;
    }
    this._db.set(level, new StorageLayer(options));
  }

  removeLayer(level: StorageLevel): void {
    this._db.delete(level);
  }

  getLayer(level: StorageLevel): StorageLayer {
    const layer = this._db.get(level);
    if (!layer) {
      throw new Error(`Layer ${level} not found`);
    }
    return layer;
  }

  hasLayer(level: StorageLevel): boolean {
    return this._db.has(level);
  }

  determineLevel(start: number, end: number): number {
    const durationInMinutes = (end - start) / ONE_MINUTE;
    const sorted = Array.from(this._db.keys()).sort((a, b) => a - b);
    for (const level of sorted) {
      if (durationInMinutes <= level) {
        return level;
      }
    }
    return sorted[sorted.length - 1];
  }
}
