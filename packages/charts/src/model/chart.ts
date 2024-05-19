import * as PIXI from "pixi.js";
import { merge } from "../util/merge";
import { Axis } from "./axis";
import { Crosshair } from "./crosshair";
import { Layout } from "./layout";
import { Track, TrackManager } from "./track";

export interface GridOptions {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartOptions {
  grid: Partial<GridOptions>;
  backgroundColor: string;
  devicePixelRatio: number;
  darkMode: boolean;
}

const defaultOptions: ChartOptions = {
  grid: {
    top: 50,
    right: 80,
    bottom: 50,
    left: 80,
  },
  backgroundColor: "#fff",
  devicePixelRatio: window.devicePixelRatio,
  darkMode: false,
};

export class Chart {
  readonly dom: HTMLCanvasElement;
  readonly app: PIXI.Application = new PIXI.Application();
  readonly group: PIXI.Container = new PIXI.Container();
  readonly track: TrackManager;
  private _options: ChartOptions;
  private _crosshair!: Crosshair;
  private _xAxis!: Axis;

  constructor(dom: HTMLCanvasElement) {
    this.dom = dom;
    this._options = {} as ChartOptions;
    this.track = new TrackManager(this);
  }

  async init(options?: Partial<ChartOptions>): Promise<void> {
    this.setOptions(options || {});

    await this.app.init({
      canvas: this.dom,
      backgroundColor: this.options.backgroundColor,
      antialias: true,
      autoDensity: true,
      resolution: this.options.devicePixelRatio,
      width: this.dom.width,
      height: this.dom.height,
    });

    this._xAxis = new Axis(this.getLayout(), {
      position: "top",
      type: "time",
      splitLine: {
        show: false,
      },
    });
    this._crosshair = new Crosshair(this, this._xAxis);

    this.app.stage.addChild(this.group);
    this.app.stage.interactive = true;
    this.app.stage.hitArea = new PIXI.Rectangle(
      0,
      0,
      this.dom.width,
      this.dom.height
    );
    this.group.sortableChildren = true;
  }

  get options(): Readonly<ChartOptions> {
    return this._options;
  }

  get crosshair(): Crosshair {
    return this._crosshair;
  }

  get xAxis(): Axis {
    return this._xAxis;
  }

  getLayout(): Layout {
    const { top = 50, right = 50, bottom = 50, left = 50 } = this.options.grid;
    return new Layout({
      x1: 0,
      y1: 0,
      x2: this.app.renderer.width,
      y2: this.app.renderer.height,
      padding: {
        top,
        right,
        bottom,
        left,
      },
    });
  }

  getPrimaryAxis(): Axis {
    return this.xAxis;
  }

  setOptions(options: Partial<ChartOptions>): void {
    this._options = merge(defaultOptions, options);
  }

  getWidth(): number {
    return this.dom.width;
  }

  getHeight(): number {
    return this.dom.height;
  }

  resize(): void {
    this.app.renderer.resize(this.dom.width, this.dom.height);
    this.render();
  }

  clear(): void {
    this.app.stage.removeChildren();
  }

  dispose(): void {
    this.app.destroy();
  }

  render(): void {
    this._drawBorder();
    this._drawTracks();
    this._drawPrimaryAxis();

    this.group.addChild(this.xAxis.group);
    this.group.addChild(this.track.group);
    this.app.stage.addChild(this.crosshair.group);
    this.app.renderer.render(this.app.stage);
  }

  addTrack(track: Track): void {
    this.track.addTrack(track);
  }

  removeTrack(index: number): void {
    this.track.removeTrack(index);
  }

  private _drawPrimaryAxis(): void {
    const xAxis = this.xAxis;
    xAxis.render();
  }

  private _drawBorder(): void {
    const box = this.getLayout().getContentArea();
    const border = new PIXI.Graphics()
      .rect(box.x1, box.y1, box.width, box.height)
      .stroke({
        color: "#000",
        width: 1,
      });
    this.group.addChild(border);
  }

  private _drawTracks(): void {
    this.track.render();
  }
}
