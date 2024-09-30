import { formatDate, ONE_SECOND } from "../util/time";
import { EventMarkerOptions } from "./eventMarker/eventMarkerModel";
import { Seismogram } from "./seismogram";

export function circle(color: string, { size = 12 } = {}): string {
  const style = `
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        display: inline-block;
      `;
  return `<span style="${style}"></span>`;
}

export class EventTooltip {
  private container: HTMLDivElement;
  private chart: Seismogram;

  constructor(chart: Seismogram) {
    this.chart = chart;
    this.container = document.createElement("div");
    this.container.className = "zchart-tooltip";
    this.container.style.position = "absolute";
    this.container.style.display = "none";
    this.container.style.pointerEvents = "none";
    this.container.style.zIndex = "1000";
    this.container.style.padding = "5px";
    this.container.style.backgroundColor = "white";
    this.container.style.borderRadius = "5px";
    this.container.style.fontSize = "10px";
    document.body.appendChild(this.container);
  }

  private applyThemeStyle(color: string): void {
    const theme = this.chart.getThemeStyle();
    const { textColor, backgroundColor } = theme;
    this.container.style.color = textColor;
    this.container.style.backgroundColor = backgroundColor;
    this.container.style.border = `1px solid ${color}`;
  }

  show(x: number, y: number, marker: EventMarkerOptions): void {
    const { enableTooltip } = this.chart.getModel().getOptions();
    if (!enableTooltip) {
      return;
    }
    const duration = (marker.end - marker.start) / ONE_SECOND;
    const eventType = marker.eventType;
    const time = formatDate(
      marker.start,
      "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}.{SSS}",
      this.chart.getModel().getOptions().useUTC
    );
    const color = marker.color;
    const html = `
        <div style="display: flex; flex-direction: column;">
            <div><strong>Time:</strong> ${time}</div>
            <div style="display: flex; align-items: center; gap: 5px;">
                <strong>Type:</strong> ${eventType}
            </div>
            <div><strong>Duration:</strong> ${duration.toFixed(2)}s</div>
        </div>
        `;
    this.container.innerHTML = html;
    this.container.style.display = "block";
    this.container.style.left = `${x}px`;
    this.container.style.top = `${y}px`;
    this.applyThemeStyle(color);
  }

  hide(): void {
    this.container.style.display = "none";
  }
}
