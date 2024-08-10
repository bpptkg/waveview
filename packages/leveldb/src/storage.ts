import { StorageLayer } from "./layer";
import { StorageLevel } from "./types";

/**
 * StorageEngine is a collection of storage layers indexed by their storage
 * level.
 */
export class StorageEngine {
  readonly layers: Map<StorageLevel, StorageLayer>;

  constructor() {
    this.layers = new Map();
  }

  get size(): number {
    return this.layers.size;
  }

  isEmpty(): boolean {
    return this.layers.size === 0;
  }

  clear(): void {
    this.layers.clear();
  }

  delete(level: StorageLevel): void {
    this.layers.delete(level);
  }

  has(level: StorageLevel): boolean {
    return this.layers.has(level);
  }

  get(level: StorageLevel): StorageLayer | undefined {
    return this.layers.get(level);
  }

  set(level: StorageLevel, layer: StorageLayer): void {
    this.layers.set(level, layer);
  }

  keys(): IterableIterator<StorageLevel> {
    return this.layers.keys();
  }

  values(): IterableIterator<StorageLayer> {
    return this.layers.values();
  }
}
