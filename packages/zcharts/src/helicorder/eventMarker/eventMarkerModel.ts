import { Model } from "../../core/model";

export interface EventMarkerOptions {
  start: number;
  end: number;
  color: string;
  show?: boolean;
  opacity?: number;
}

export class EventMarkerModel extends Model<EventMarkerOptions> {
  static readonly defaultOptions: EventMarkerOptions = {
    show: true,
    start: 0,
    end: 0,
    color: "red",
    opacity: 0.5,
  };
  constructor(options: EventMarkerOptions) {
    const opts = { ...EventMarkerModel.defaultOptions, ...options };
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
