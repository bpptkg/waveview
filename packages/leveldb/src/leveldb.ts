import { StorageLayer, StorageLayerOptions } from "./layer";
import { StorageEngine } from "./storage";
import { ONE_MINUTE, StorageLevel } from "./types";

export interface LeveldbOptions {
  name: string;
  layers: StorageLayerOptions[];
}

/**
 * LevelDB is a multi-layered storage engine for storing time-series data. Each
 * layer is defined by a specific time sampling or resolution and the maximum
 * number of data points to store per segment.
 */
export class Leveldb {
  readonly name: string;
  private readonly _db: StorageEngine;

  static readonly defaultLayerOptions: StorageLayerOptions[] = [
    { size: 3, maxPoints: 6000 },
    { size: 5, maxPoints: 6000 },
    { size: 10, maxPoints: 6000 },
    { size: 15, maxPoints: 6000 },
    { size: 30, maxPoints: 6000 },
    { size: 60, maxPoints: 6000 },
  ];

  constructor(options?: Partial<LeveldbOptions>) {
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
    for (const segment of sorted) {
      if (durationInMinutes <= segment) {
        return segment;
      }
    }
    return sorted[sorted.length - 1];
  }
}
