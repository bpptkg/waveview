export class DataStore<T> {
  private data: Map<string, T> = new Map();

  set(key: string, data: T): void {
    this.data.set(key, data);
  }

  get(key: string): T | undefined {
    return this.data.get(key);
  }

  has(key: string): boolean {
    return this.data.has(key);
  }

  remove(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }

  size(): number {
    return this.data.size;
  }
}
