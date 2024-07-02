import { Channel } from "../util/types";
import { ChartEventMap } from "../view";

export interface SeismogramEventMap extends ChartEventMap {
  channelAdded: (channel: Channel) => void;
  channelRemoved: (channel: Channel) => void;
  channelMoved: (from: number, to: number) => void;
  amplitudeChanged: (range: [number, number]) => void;
  trackSelected: (index: number) => void;
  trackUnselected: () => void;
  extentChanged: (extent: [number, number]) => void;
  resize: (width: number, height: number) => void;
  trackDoubleClicked: (index: number) => void;
}
