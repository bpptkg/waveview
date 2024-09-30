import { Model } from "../../core/model";

export interface EventMarkerOptions {
  start: number;
  end: number;
  color: string;
  eventType: string;
  show?: boolean;
  opacity?: number;
  pill?: boolean;
  data?: any;
}

export class EventMarkerModel extends Model<EventMarkerOptions> {
  static readonly defaultOptions: EventMarkerOptions = {
    show: true,
    start: 0,
    end: 0,
    color: "red",
    opacity: 0.5,
    pill: true,
    eventType: "",
    data: undefined,
  };
  constructor(options: EventMarkerOptions) {
    const opts = { ...EventMarkerModel.defaultOptions, ...options };
    super(opts);
  }

  getWindow(): [number, number] {
    return [this.options.start, this.options.end];
  }
}

export type SeismogramEventMarkerData = EventMarkerOptions;
