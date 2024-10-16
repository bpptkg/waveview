import { Index, Series } from "@waveview/ndarray";
import {
  OffscreenRenderContext,
  OffscreenRenderTrackContext,
} from "../helicorder/offscreen";
import { LinearScale } from "../scale/linear";
import { debounce } from "../util/debounce";
import { Segment } from "../helicorder/dataStore";

/**
 * Get the minimum and maximum values of the series data.
 */
const getMinMax = (tracks: OffscreenRenderTrackContext[]): number => {
  let normFactor = Infinity;
  tracks.forEach((track) => {
    const { seriesData } = track;
    const { name, index, values } = seriesData;
    const series = Series.from(new Float64Array(values), {
      index: new Index(new Float64Array(index)),
      name,
    });

    const min = series.min();
    const max = series.max();
    normFactor = Math.min(normFactor, Math.abs(max - min));
  });
  return isFinite(normFactor) ? normFactor : 1;
};

/**
 * Convert time to offset, where time is the time in seconds since the start of
 * the segment.
 */
const timeToOffset = (
  segment: Segment,
  interval: number,
  time: number
): number => {
  const [start, end] = segment;
  return ((time - start) / (end - start)) * interval;
};

/**
 * Render the helicorder tracks to an offscreen canvas.
 */
const render = debounce((event: MessageEvent) => {
  const renderContext = event.data as OffscreenRenderContext;
  const { rect, gridRect, tracks, pixelRatio, color, scaling, interval } =
    renderContext;
  const canvas = new OffscreenCanvas(
    rect.width * pixelRatio,
    rect.height * pixelRatio
  );
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas 2D context");
  }
  ctx.scale(pixelRatio, pixelRatio);
  ctx.strokeStyle = color;

  let first = true;
  const norm = getMinMax(tracks);

  tracks.forEach((track) => {
    ctx.beginPath();
    const { trackRect, xScaleOptions, yScaleOptions, seriesData, segment } =
      track;
    const xScale = new LinearScale(xScaleOptions);
    const yScale = new LinearScale(yScaleOptions);
    const { name, index, values } = seriesData;
    const series = Series.from(new Float64Array(values), {
      index: new Index(new Float64Array(index)),
      name,
    });
    let data: Series;
    if (scaling === "global") {
      data = series.scalarDivide(norm);
    } else {
      const localNormFactor = Math.max(
        Math.abs(series.min()),
        Math.abs(series.max())
      );
      data = series.scalarDivide(localNormFactor);
    }
    data.setIndex(
      data.index.map((value: number) => timeToOffset(segment, interval, value))
    );

    const invertX = (value: number): number => {
      const { x, width } = gridRect;

      const percent = xScale.valueToPercentage(value);
      return x + width * percent;
    };

    const invertY = (value: number): number => {
      const { y, height } = trackRect;
      const percent = yScale.valueToPercentage(value);
      return y + height * percent;
    };

    for (const [x, y] of data.iterIndexValuePairs()) {
      if (!xScale.contains(x)) {
        continue;
      }

      const cx = invertX(x);
      const cy = invertY(y);
      if (first) {
        ctx.moveTo(cx, cy);
        first = false;
      } else {
        ctx.lineTo(cx, cy);
      }
    }

    ctx.stroke();
    first = true;
  });

  canvas.convertToBlob().then((blob) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      postMessage(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}, 500);

self.addEventListener("message", (event: MessageEvent) => {
  render(event);
});
