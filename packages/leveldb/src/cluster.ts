import { Leveldb } from "./leveldb";

export class LeveldbCluster {
  private readonly _store: Map<string, Leveldb>;

  constructor() {
    this._store = new Map();
  }

  get size(): number {
    return this._store.size;
  }

  get(key: string): Leveldb | undefined {
    return this._store.get(key);
  }

  set(key: string, value: Leveldb): void {
    this._store.set(key, value);
  }

  delete(key: string): void {
    this._store.delete(key);
  }

  clear(): void {
    this._store.clear();
  }

  has(key: string): boolean {
    return this._store.has(key);
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
}
