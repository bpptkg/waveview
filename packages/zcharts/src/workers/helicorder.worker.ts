import { Series } from "@waveview/ndarray";
import { Segment } from "../helicorder/dataStore";
import {
  OffscreenRenderContext,
  OffscreenRenderResult,
} from "../helicorder/offscreen";
import { LinearScale } from "../scale/linear";
import { debounce } from "../util/debounce";
import { getLocalNormFactor } from "../util/norm";

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
  const {
    gridRect,
    tracks,
    pixelRatio,
    color,
    scaling,
    interval,
    clip,
    clipScale,
  } = renderContext;
  // Use the grid rect to create an offscreen canvas.
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
  ctx.lineWidth = 0.3;

  let first = true;
  const useGlobalScaling = scaling === "global";

  tracks.forEach((track) => {
    ctx.beginPath();
    const {
      trackRect,
      xScaleOptions,
      yScaleOptions,
      series,
      segment,
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
    data.setIndex(
      data.index.map((value: number) => timeToOffset(segment, interval, value))
    );
    const localNormFactor = getLocalNormFactor(min, max);
    const pMin = data.percentile(5);
    const pMax = data.percentile(95);

    // Invert the x value to the canvas coordinate system.
    const invertX = (value: number): number => {
      const { width } = gridRect;

      const percent = xScale.valueToPercentage(value);
      return width * percent;
    };

    // Normalize the value to the range specified by the scaling method.
    const normalize = (value: number): number => {
      const minScale = 0.5;
      if (useGlobalScaling) {
        const quietRange = pMax - pMin || 1;
        const quietScale = minScale / quietRange;
        const midpoint = (pMax + pMin) / 2;

        const totalRange = max - min || 1;
        const maxAllowedScale = clipScale / (totalRange / 2);

        const finalScale = Math.min(quietScale, maxAllowedScale);
        const scaled = (value - midpoint) * finalScale;

        return clip
          ? Math.max(-clipScale, Math.min(clipScale, scaled))
          : scaled;
      } else {
        const scaled = value / localNormFactor;
        return clip
          ? Math.max(-clipScale, Math.min(clipScale, scaled))
          : scaled;
      }
    };

    // Invert the y value to the canvas coordinate system.
    const invertY = (value: number): number => {
      const normValue = normalize(value);
      const { y, height } = trackRect;
      const percent = yScale.valueToPercentage(normValue);
      return y + height * (1 - percent) - gridRect.y;
    };

    let wasMasked = false; // Track the previous mask state
    let lastCx: number | null = null; // Store the last x-coordinate
    let lastCy: number | null = null; // Store the last y-coordinate

    for (const [x, y, m] of data.iterIndexValueMask()) {
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

      // Draw the segment in the default color
      ctx.strokeStyle = color;
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
        segmentStart: tracks.reduce(
          (acc, { segment }) => {
            const [start] = segment;
            return start < acc[0] ? segment : acc;
          },
          [Infinity, 0]
        ),
        segmentEnd: tracks.reduce(
          (acc, { segment }) => {
            const [, end] = segment;
            return end > acc[0] ? segment : acc;
          },
          [-Infinity, 0]
        ),
      };
      postMessage(result);
    };
    reader.readAsDataURL(blob);
  });
}, 500);

self.addEventListener("message", (event: MessageEvent) => {
  render(event);
});
