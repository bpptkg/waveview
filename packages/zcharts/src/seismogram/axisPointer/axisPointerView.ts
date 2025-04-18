import * as zrender from "zrender";
import { AxisView } from "../../axis/axisView";
import { View } from "../../core/view";
import { formatDate } from "../../util/time";
import { LayoutRect, ThemeStyle } from "../../util/types";
import { Seismogram } from "../seismogram";
import { AxisPointerModel, AxisPointerOptions } from "./axisPointerModel";

export class AxisPointerView extends View<AxisPointerModel> {
  private readonly chart: Seismogram;
  private readonly axis: AxisView;
  private rect: LayoutRect;
  private onPointerMoveBound: (event: zrender.ElementEvent) => void;
  private onPointerLeaveBound: (event: zrender.ElementEvent) => void;
  private position: zrender.Point = new zrender.Point();
  private verticalLine: zrender.Line;
  private horizontalLine: zrender.Line;
  private timeLabel: zrender.Text;
  private amplitudeLabel: zrender.Text;
  private frequencyLabel: zrender.Text;

  constructor(
    axis: AxisView,
    chart: Seismogram,
    options?: Partial<AxisPointerOptions>
  ) {
    const model = new AxisPointerModel(options);
    super(model);
    this.chart = chart;
    this.axis = axis;
    this.rect = axis.getRect();

    this.verticalLine = new zrender.Line();
    this.horizontalLine = new zrender.Line();
    this.timeLabel = new zrender.Text();
    this.amplitudeLabel = new zrender.Text();
    this.frequencyLabel = new zrender.Text();
    this.group.add(this.verticalLine);
    this.group.add(this.horizontalLine);
    this.group.add(this.timeLabel);
    this.group.add(this.amplitudeLabel);
    this.group.add(this.frequencyLabel);

    this.onPointerMoveBound = this.onPointerMove.bind(this);
    this.onPointerLeaveBound = this.onPointerLeave.bind(this);
  }

  attachEventListeners(): void {
    this.chart.zr.on("mousemove", this.onPointerMoveBound);
    this.chart.zr.on("mouseout", this.onPointerLeaveBound);
  }

  detachEventListeners(): void {
    this.chart.zr.off("mousemove", this.onPointerMoveBound);
    this.chart.zr.off("mouseout", this.onPointerLeaveBound);
  }

  private onPointerMove(event: zrender.ElementEvent): void {
    this.position.x = event.offsetX;
    this.position.y = event.offsetY;
    this.render();
  }

  private onPointerLeave(): void {
    this.position.x = -1;
    this.position.y = -1;
    this.verticalLine.hide();
    this.horizontalLine.hide();
    this.timeLabel.hide();
    this.amplitudeLabel.hide();
    this.frequencyLabel.hide();
  }

  getRect(): LayoutRect {
    return this.rect;
  }

  setRect(rect: LayoutRect): void {
    this.rect = rect;
  }

  resize(): void {
    this.setRect(this.axis.getRect());
  }

  clear(): void {
    this.group.removeAll();
  }

  dispose(): void {
    this.detachEventListeners();
    this.clear();
  }

  applyThemeStyle(theme: ThemeStyle): void {
    const { lineColor, lineWidth, textColor, fontSize, backgroundColor } =
      theme.axisPointerStyle;
    this.getModel().mergeOptions({
      lineColor,
      lineWidth,
      textColor,
      fontSize,
      backgroundColor,
    });
  }

  private hideElements(): void {
    this.verticalLine.hide();
    this.horizontalLine.hide();
    this.timeLabel.hide();
    this.amplitudeLabel.hide();
    this.frequencyLabel.hide();
  }

  private updateVerticalCursor() {
    const { lineColor, lineWidth, textColor, fontSize, backgroundColor } =
      this.getModel().getOptions();
    const { x } = this.position;
    const { y: y0, height } = this.axis.getRect();
    this.verticalLine.attr({
      shape: {
        x1: x,
        y1: y0,
        x2: x,
        y2: y0 + height,
      },
      style: {
        stroke: lineColor,
        lineWidth,
      },
      z: 10,
      silent: true,
    });

    const value = this.axis.getValueForPixel(x);
    const padding = 5;
    const { useUTC } = this.chart.getModel().getOptions();
    const template = "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}.{SSS}";
    const valueFormatted = formatDate(value, template, useUTC);

    this.timeLabel.attr({
      style: {
        text: valueFormatted,
        fill: textColor,
        fontSize,
        backgroundColor,
        padding: [padding, padding],
        align: "center",
        verticalAlign: "bottom",
      },
      x,
      y: y0,
      silent: true,
    });
    const chartWidth = this.chart.getWidth();
    if (x + this.timeLabel.getBoundingRect().width / 2 > chartWidth) {
      this.timeLabel.attr({
        x: chartWidth - this.timeLabel.getBoundingRect().width / 2,
      });
    }

    this.verticalLine.show();
    this.timeLabel.show();
  }

  private updateHorizontalCursor() {
    const { lineColor, lineWidth, textColor, fontSize, backgroundColor } =
      this.getModel().getOptions();
    const { y } = this.position;
    const padding = 5;
    const { x: x0, width } = this.axis.getRect();
    const trackManager = this.chart.getTrackManager();
    const trackIndex = this.chart.isInExpandMode()
      ? this.chart.getExpandIndex()
      : trackManager.getTrackIndexByY(y);

    const hideLabelsAndLine = () => {
      this.amplitudeLabel.hide();
      this.frequencyLabel.hide();
      this.horizontalLine.hide();
    };

    this.horizontalLine.attr({
      shape: {
        x1: x0,
        y1: y,
        x2: x0 + width,
        y2: y,
      },
      style: {
        stroke: lineColor,
        lineWidth,
      },
      z: 10,
      silent: true,
    });

    const showAmplitudeLabel = (
      amplitudeValue: number,
      x: number,
      y: number
    ) => {
      this.amplitudeLabel.attr({
        style: {
          text: amplitudeValue.toFixed(2),
          fill: textColor,
          fontSize,
          backgroundColor,
          padding: [padding, padding],
          align: "right",
          verticalAlign: "middle",
        },
        x,
        y,
        silent: true,
        z: 10,
      });
      this.amplitudeLabel.show();
    };

    const showFrequencyLabel = (
      frequencyValue: number,
      x: number,
      y: number
    ) => {
      this.frequencyLabel.attr({
        style: {
          text: frequencyValue.toFixed(2),
          fill: textColor,
          fontSize,
          backgroundColor,
          padding: [padding, padding],
          align: "left",
          verticalAlign: "middle",
        },
        x,
        y,
        silent: true,
        z: 10,
      });
      this.frequencyLabel.show();
    };

    if (trackIndex !== -1) {
      const track = trackManager.getTrackByIndex(trackIndex);
      const amplitudeValue = track.getLeftYAxis().getValueForPixel(y);
      const normFactor = track.getLeftYAxis().getNormFactor();
      showAmplitudeLabel(amplitudeValue * normFactor, x0, y);

      if (this.chart.isSpectrogramVisible()) {
        const frequencyValue = track.getRightYAxis().getValueForPixel(y);
        showFrequencyLabel(frequencyValue, x0 + width, y);
      } else {
        this.frequencyLabel.hide();
      }

      const trackRect = track.getRect();
      if (y < trackRect.y || y > trackRect.y + trackRect.height) {
        hideLabelsAndLine();
      } else {
        this.horizontalLine.show();
      }
    } else {
      hideLabelsAndLine();
    }
  }

  render(): void {
    if (!this.visible) {
      this.hideElements();
      return;
    }

    const { enable } = this.getModel().getOptions();
    if (!enable) {
      this.hideElements();
      return;
    }

    const { x, y } = this.position;
    if (!this.axis.getRect().contain(x, y)) {
      this.hideElements();
    } else {
      this.updateVerticalCursor();
      this.updateHorizontalCursor();
    }
  }
}
