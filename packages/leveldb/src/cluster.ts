import { StorageLayer } from "./layer";
import { Leveldb } from "./leveldb";

/**
 * LeveldbCluster is a class that manages multiple Leveldb instances. It is
 * useful when you need to manage multiple Leveldb instances in a single
 * application.
 */
export class LeveldbCluster {
  private readonly _store: Map<string, Leveldb>;

  constructor() {
    this._store = new Map();
  }

  get size(): number {
    return this._store.size;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  get(key: string): Leveldb {
    const db = this._store.get(key);
    if (!db) {
      throw new Error(`Leveldb ${key} not found`);
    }
    return db;
  }

  set(key: string, value: Leveldb): void {
    this._store.set(key, value);
  }

  delete(key: string): void {
    this._store.delete(key);
  }

  has(key: string): boolean {
    return this._store.has(key);
  }

  clear(id: string): void {
    if (!this.has(id)) {
      return;
    }
    this.get(id).clear();
  }

  clearAll(): void {
    this._store.clear();
  }

  setDefaultLayer(id: string): void {
    if (!this.has(id)) {
      this.set(id, new Leveldb({ name: id }));
    }
    const db = this.get(id)!;
    for (const layer of Leveldb.defaultLayerOptions) {
      db.addLayer(layer.size, layer);
    }
  }

  removeDefaultLayer(id: string): void {
    if (!this.has(id)) {
      return;
    }
    const db = this.get(id)!;
    for (const layer of Leveldb.defaultLayerOptions) {
      db.removeLayer(layer.size);
    }
  }

  getLayer(id: string, level: number): StorageLayer {
    if (!this.has(id)) {
      throw new Error(`Leveldb ${id} not found`);
    }
    const db = this.get(id)!;
    return db.getLayer(level);
  }

  hasLayer(id: string, level: number): boolean {
    if (!this.has(id)) {
      return false;
    }
    const db = this.get(id)!;
    return db.hasLayer(level);
  }

  determineLevel(id: string, start: number, end: number): number {
    if (!this.has(id)) {
      throw new Error(`Leveldb ${id} not found`);
    }
    const db = this.get(id)!;
    return db.determineLevel(start, end);
  }

  clearLayer(id: string, level: number): void {
    if (!this.has(id)) {
      return;
    }
    const db = this.get(id)!;
    db.getLayer(level).clear();
  }

  clearAllLayers(id: string): void {
    if (!this.has(id)) {
      return;
    }
    const db = this.get(id)!;
    for (const level of db.levels()) {
      db.getLayer(level).clear();
    }
  }
}
