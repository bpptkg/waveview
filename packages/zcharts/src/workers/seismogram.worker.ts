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
    const { name, index, mask, values } = series;
    const data = Series.from(new Float32Array(values), {
      index: new Float64Array(index),
      name,
      mask,
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

    let wasMasked = false; // Track the previous mask state
    let lastCx: number | null = null; // Store the last x-coordinate
    let lastCy: number | null = null; // Store the last y-coordinate

    for (const [x, y, m] of norm.iterIndexValueMask()) {
      if (!xScale.contains(x)) {
        continue;
      }

      const cx = invertX(x);
      const cy = invertY(y);

      if (m) {
        if (!wasMasked && lastCx !== null && lastCy !== null) {
          // Close the current path when transitioning to a masked state
          ctx.lineTo(lastCx, lastCy);
          ctx.stroke();
        }
        wasMasked = true;
        continue;
      }

      if (wasMasked) {
        // Start a new path when transitioning from masked to unmasked
        ctx.beginPath();
        ctx.moveTo(lastCx ?? cx, lastCy ?? cy); // Connect to the last point if it exists
        first = false;
      }

      wasMasked = false; // Reset mask state when not masked

      if (first) {
        ctx.moveTo(cx, cy);
        first = false;
      } else {
        ctx.lineTo(cx, cy);
      }

      lastCx = cx; // Update the last x-coordinate
      lastCy = cy; // Update the last y-coordinate
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
