import { Model } from "../core/model";

export interface TrackOptions {
  label: string;
  margin: number;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  borderColor: string;
  borderWidth: number;
  style: "default" | "bracket";
}

export class TrackModel extends Model<TrackOptions> {
  static readonly defaultOptions: TrackOptions = {
    label: "",
    margin: 8,
    textColor: "#000",
    fontSize: 12,
    fontFamily: "Arial",
    style: "default",
    borderColor: "#000",
    borderWidth: 1,
  };

  constructor(options?: Partial<TrackOptions>) {
    super({ ...TrackModel.defaultOptions, ...options });
  }
}
