import { Channel } from "../util/types";
import { ChartEventMap } from "../view/chartView";

export interface HelicorderEventMap extends ChartEventMap {
  channelChanged: (channel: Channel) => void;
  offsetChanged: (offset: number) => void;
  intervalChanged: (interval: number) => void;
  durationChanged: (duration: number) => void;
  amplitudeChanged: (range: [number, number]) => void;
  trackSelected: (index: number) => void;
  trackDeselected: () => void;
  viewShiftedUp: (range: [number, number]) => void;
  viewShiftedDown: (range: [number, number]) => void;
  viewShiftedToNow: () => void;
  viewShiftedToTime: (time: number) => void;
}
