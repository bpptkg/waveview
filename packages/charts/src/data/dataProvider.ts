export interface DataProvider {
  getData(options?: Record<string, unknown>): number[][];
}
