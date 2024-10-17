import { Index, Series } from "@waveview/ndarray";
import {
  OffscreenRenderContext,
  OffscreenRenderTrackContext,
} from "../helicorder/offscreen";
import { LinearScale } from "../scale/linear";

/**
 * Get global min and max values of the series data.
 */
const getGlobalNormFactor = (tracks: OffscreenRenderTrackContext[]): number => {
  let normFactor = -Infinity;
  tracks.forEach((track) => {
    const { seriesData } = track;
    const { name, index, values } = seriesData;
    const series = Series.from(new Float64Array(values), {
      index: new Index(new Float64Array(index)),
      name,
    });

    if (!series || series.isEmpty()) {
      return;
    }

    const factor = Math.abs(series.max() - series.min());
    if (factor === 0) {
      return;
    }
    normFactor = Math.max(normFactor, factor);
  });
  return isFinite(normFactor) ? normFactor : 1;
};

/**
 * Get local min and max values of the series data.
 */
const getLocalNormFactor = (series: Series): number => {
  const normFactor = Math.max(Math.abs(series.min()), Math.abs(series.max()));
  return isFinite(normFactor) ? normFactor : 1;
};

/**
 * Render the helicorder tracks to an offscreen canvas.
 */
const render = (event: MessageEvent) => {
  const renderContext = event.data as OffscreenRenderContext;
  const { rect, gridRect, tracks, pixelRatio, color, scaling } = renderContext;
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
  const globalNormFactor = getGlobalNormFactor(tracks);

  tracks.forEach((track) => {
    ctx.beginPath();
    const { trackRect, xScaleOptions, yScaleOptions, seriesData } = track;
    const xScale = new LinearScale(xScaleOptions);
    const yScale = new LinearScale(yScaleOptions);
    const { name, index, values } = seriesData;
    const series = Series.from(new Float64Array(values), {
      index: new Index(new Float64Array(index)),
      name,
    });
    let data: Series;
    if (scaling === "global") {
      data = series.scalarDivide(globalNormFactor);
    } else {
      const localNormFactor = getLocalNormFactor(series);
      data = series.scalarDivide(localNormFactor);
    }

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
};

self.addEventListener("message", (event: MessageEvent) => {
  render(event);
});