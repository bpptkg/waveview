import { Model } from "../model/model";
import { merge } from "../util/merge";
import { ThemeStyle } from "../util/types";

export interface HightlightOptions {
  color: string;
  opacity: number;
  borderWidth: number;
}

export interface TrackOptions {
  leftLabel: string;
  rightLabel: string;
  margin: number;
  highlight: HightlightOptions;
  textColor: string;
  fontSize: number;
  fontFamily: string;
}

export class TrackModel extends Model<TrackOptions> {
  override readonly type = "track";

  static defaultOptions: TrackOptions = {
    leftLabel: "",
    rightLabel: "",
    margin: 8,
    textColor: "#000",
    fontSize: 12,
    fontFamily: "Arial",
    highlight: {
      color: "#9747ff",
      opacity: 0.25,
      borderWidth: 1,
    },
  };

  constructor(options?: Partial<TrackOptions>) {
    const opts = merge(
      { ...TrackModel.defaultOptions },
      options || {},
      true
    ) as TrackOptions;
    super(opts);
  }

  applyThemeStyle(theme: ThemeStyle): void {
    const { highlightStyle } = theme;
    this.mergeOptions({
      textColor: theme.textColor,
      fontSize: theme.fontSize,
      fontFamily: theme.fontFamily,
      highlight: {
        color: highlightStyle.color,
        opacity: highlightStyle.opacity,
        borderWidth: highlightStyle.borderWidth,
      },
    });
  }
}
