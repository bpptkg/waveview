import * as PIXI from "pixi.js";
import { RenderableGroup, ThemeStyle } from "../util/types";
import { Helicorder } from "./helicorder";

export interface FooterOptions {
  textColor: string;
  fontSize: number;
  fontFamily: string;
}

export class Footer implements RenderableGroup {
  readonly group = new PIXI.Container();
  private readonly _localTime: PIXI.Text;
  private readonly _timeInMinutes: PIXI.Text;
  private readonly _utcTime: PIXI.Text;
  private _options: FooterOptions;

  static defaultOptions: FooterOptions = {
    textColor: "#000",
    fontSize: 12,
    fontFamily: "Arial",
  };

  constructor(readonly chart: Helicorder, options?: Partial<FooterOptions>) {
    this.chart = chart;
    this._options = { ...Footer.defaultOptions, ...options };

    this._localTime = new PIXI.Text({
      text: "Local",
      anchor: { x: 1, y: 0 },
    });

    this._timeInMinutes = new PIXI.Text({
      text: "Time in minutes",
      anchor: { x: 0.5, y: 0 },
    });

    this._utcTime = new PIXI.Text({
      text: "UTC",
      anchor: { x: 0, y: 0 },
    });

    this.group.addChild(this._localTime);
    this.group.addChild(this._timeInMinutes);
    this.group.addChild(this._utcTime);
  }

  applyThemeStyle(theme: ThemeStyle): void {
    const { textColor, fontSize, fontFamily } = theme;
    this._options = {
      textColor,
      fontSize,
      fontFamily,
    };
  }

  render(): void {
    const margin = 8;

    const { x, y, width, height } = this.chart.getGrid().getRect();
    const { textColor, fontSize, fontFamily } = this._options;

    this._localTime.style = {
      fontFamily,
      fontSize,
      fill: textColor,
      align: "right",
    };
    this._timeInMinutes.style = {
      fontFamily,
      fontSize,
      fill: textColor,
      align: "center",
    };
    this._utcTime.style = {
      fontFamily,
      fontSize,
      fill: textColor,
      align: "left",
    };

    this._localTime.position.set(x - margin, y + height + margin);
    this._timeInMinutes.position.set(x + width / 2, y + height + margin);
    this._utcTime.position.set(x + width + margin, y + height + margin);
  }
}
