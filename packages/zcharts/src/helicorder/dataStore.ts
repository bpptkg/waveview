export type Segment = [number, number];
export type Points = [number, number][];

export interface HelicorderData {
  data: Points;
  range: [number, number];
}

export class DataStore<T> {
  private data: Map<string, T> = new Map();

  set(segment: Segment, data: T): void {
    const key = JSON.stringify(segment);
    this.data.set(key, data);
  }

  get(segment: Segment): T | undefined {
    const key = JSON.stringify(segment);
    return this.data.get(key);
  }

  has(segment: Segment): boolean {
    const key = JSON.stringify(segment);
    return this.data.has(key);
  }

  remove(segment: Segment): void {
    const key = JSON.stringify(segment);
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }

  size(): number {
    return this.data.size;
  }
}
