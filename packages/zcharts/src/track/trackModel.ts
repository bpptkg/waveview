import { Model } from "../core/model";

export interface TrackOptions {
  label: string;
  margin: number;
  textColor: string;
  fontSize: number;
  fontFamily: string;
}

export class TrackModel extends Model<TrackOptions> {
  static defaultOptions: TrackOptions = {
    label: "",
    margin: 8,
    textColor: "#000",
    fontSize: 12,
    fontFamily: "Arial",
  };

  constructor(options?: Partial<TrackOptions>) {
    super({ ...TrackModel.defaultOptions, ...options });
  }
}
