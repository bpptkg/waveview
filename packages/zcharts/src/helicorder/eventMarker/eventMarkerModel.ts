import { merge } from "zrender/lib/core/util";
import { Model } from "../../core/model";

export interface EventMarkerOptions {
  start: number;
  end: number;
  color: string;
  eventType: string;
  show?: boolean;
  opacity?: number;
  data?: any;
}

export class EventMarkerModel extends Model<EventMarkerOptions> {
  static defaultOptions(): EventMarkerOptions {
    return {
      show: true,
      start: 0,
      end: 0,
      color: "red",
      opacity: 0.65,
      eventType: "",
      data: undefined,
    };
  }

  constructor(options: EventMarkerOptions) {
    const opts = merge(EventMarkerModel.defaultOptions(), options || {}, true);
    super(opts);
  }

  getWindow(): [number, number] {
    return [this.options.start, this.options.end];
  }

  contains(time: number): boolean {
    const [start, end] = this.getWindow();
    return time >= start && time <= end;
  }

  between(start: number, end: number): boolean {
    const [markerStart, markerEnd] = this.getWindow();
    return start <= markerStart && end >= markerEnd;
  }
}
