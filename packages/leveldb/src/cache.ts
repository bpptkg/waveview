export class Cache {
  private readonly _store: Map<number, any>;

  constructor() {
    this._store = new Map();
  }

  get size(): number {
    return this._store.size;
  }

  get(key: number): any | undefined {
    return this._store.get(key);
  }

  set(key: number, value: any): void {
    this._store.set(key, value);
  }

  delete(key: number): void {
    this._store.delete(key);
  }

  clear(): void {
    this._store.clear();
  }

  has(key: number): boolean {
    return this._store.has(key);
  }
}
