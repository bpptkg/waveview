import { Channel } from "./channel";

export type DataProviderOptions = Record<string, unknown>;

export interface DataProvider {
  getData(
    channel: Channel,
    start: number,
    end: number,
    options?: DataProviderOptions
  ): number[][];
}
