import { Index, Series } from "@waveview/ndarray";
import { LinearScale } from "../scale/linear";
import {
  OffscreenRenderContext,
  OffscreenRenderResult,
  OffscreenRenderTrackInfo,
} from "../seismogram/offscreen";
import { debounce } from "../util/debounce";
import { getGlobalNormFactor, getLocalNormFactor } from "../util/norm";

/**
 * Render the seismogram tracks to an offscreen canvas.
 */
const render = debounce((event: MessageEvent) => {
  const renderContext = event.data as OffscreenRenderContext;
  const { gridRect, tracks, pixelRatio, color, scaling, timeMin, timeMax } =
    renderContext;
  // Create an offscreen canvas with the same size as the grid rect.
  const canvas = new OffscreenCanvas(
    gridRect.width * pixelRatio,
    gridRect.height * pixelRatio
  );
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas 2D context");
  }
  ctx.scale(pixelRatio, pixelRatio);
  ctx.strokeStyle = color;

  let first = true;
  const globalNormFactor = getGlobalNormFactor(
    tracks.map(({ min, max }) => [min, max])
  );

  const trackInfo: OffscreenRenderTrackInfo[] = [];

  tracks.forEach((track) => {
    ctx.beginPath();
    const {
      channelId,
      trackRect,
      xScaleOptions,
      yScaleOptions,
      series,
      min,
      max,
    } = track;
    const xScale = new LinearScale(xScaleOptions);
    const yScale = new LinearScale(yScaleOptions);
    const { name, index, values } = series;
    const data = Series.from(new Float64Array(values), {
      index: new Index(new Float64Array(index)),
      name,
    });
    let norm: Series;
    let localNormFactor: number = 1;
    if (scaling === "global") {
      norm = data.scalarDivide(globalNormFactor);
    } else {
      localNormFactor = getLocalNormFactor(min, max);
      norm = data.scalarDivide(localNormFactor);
    }
    trackInfo.push({
      channelId,
      scaling,
      min,
      max,
      normFactor: scaling === "global" ? globalNormFactor : localNormFactor,
      normMin: norm.min(),
      normMax: norm.max(),
    });

    // Invert the x value to the canvas coordinate system.
    const invertX = (value: number): number => {
      const { width } = gridRect;

      const percent = xScale.valueToPercentage(value);
      return width * percent;
    };

    // Invert the y value to the canvas coordinate system.
    const invertY = (value: number): number => {
      const { y, height } = trackRect;
      const percent = yScale.valueToPercentage(value);
      return y + height * (1 - percent) - gridRect.y;
    };

    for (const [x, y] of norm.iterIndexValuePairs()) {
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
      const result: OffscreenRenderResult = {
        image: reader.result as string,
        start: timeMin,
        end: timeMax,
        info: trackInfo,
      };
      postMessage(result);
    };
    reader.readAsDataURL(blob);
  });
}, 100);

self.addEventListener("message", (event: MessageEvent) => {
  render(event);
});
