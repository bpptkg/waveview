import { Index, Series } from "@waveview/ndarray";
import { Segment } from "../helicorder/dataStore";
import {
  OffscreenRenderContext,
  OffscreenRenderResult,
  OffscreenRenderTrackContext,
} from "../helicorder/offscreen";
import { LinearScale } from "../scale/linear";
import { debounce } from "../util/debounce";

/**
 * Get global min and max values of the series data.
 */
const getGlobalNormFactor = (tracks: OffscreenRenderTrackContext[]): number => {
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
 * Get local min and max values of the series data.
 */
const getLocalNormFactor = (series: Series): number => {
  const normFactor = Math.max(Math.abs(series.min()), Math.abs(series.max()));
  return isFinite(normFactor) ? normFactor : 1;
};

/**
 * Threshold for overscale values. Values greater than this threshold will be
 * clipped. It roughly corresponds to 6 track heights.
 */
const OVERSCALE_THRESHOLD = 6;

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
    showClip,
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

  let first = true;
  const globalNormFactor = getGlobalNormFactor(tracks);
  const useGlobalScaling = scaling === "global";

  // Check if the value is overscale.
  const isOverscale = (value: number): boolean => {
    const v = value / globalNormFactor;
    return Math.abs(v) > OVERSCALE_THRESHOLD;
  };

  // Clip the value to the overscale threshold.
  const clipValue = (value: number): number => {
    const ratio = value / globalNormFactor;
    return Math.sign(ratio) * Math.min(OVERSCALE_THRESHOLD, Math.abs(ratio));
  };

  tracks.forEach((track) => {
    ctx.beginPath();
    const { trackRect, xScaleOptions, yScaleOptions, seriesData, segment } =
      track;
    const xScale = new LinearScale(xScaleOptions);
    const yScale = new LinearScale(yScaleOptions);
    const { name, index, values } = seriesData;
    const data = Series.from(new Float64Array(values), {
      index: new Index(new Float64Array(index)),
      name,
    });
    data.setIndex(
      data.index.map((value: number) => timeToOffset(segment, interval, value))
    );
    const localNormFactor = getLocalNormFactor(data);

    // Invert the x value to the canvas coordinate system.
    const invertX = (value: number): number => {
      const { width } = gridRect;

      const percent = xScale.valueToPercentage(value);
      return width * percent;
    };

    // Normalize the value to the range specified by the scaling method.
    const normalize = (value: number): number => {
      if (useGlobalScaling) {
        return clip ? clipValue(value) : value / globalNormFactor;
      } else {
        return value / localNormFactor;
      }
    };

    // Invert the y value to the canvas coordinate system.
    const invertY = (value: number): number => {
      const normValue = normalize(value);
      const { y, height } = trackRect;
      const percent = yScale.valueToPercentage(normValue);
      return y + height * percent - gridRect.y;
    };

    for (const [x, y] of data.iterIndexValuePairs()) {
      if (!xScale.contains(x)) {
        continue;
      }

      const cx = invertX(x);
      const cy = invertY(y);

      if (useGlobalScaling && isOverscale(y)) {
        // Draw the segment up to this point in the default color
        ctx.strokeStyle = color;
        if (!first) {
          ctx.lineTo(cx, cy);
          ctx.stroke();
        }

        if (showClip) {
          // Draw the overscale segment as a red rectangle
          const rectWidth = 2;
          const rectHeight = Math.abs(trackRect.y - cy);
          ctx.fillStyle = "red";
          ctx.fillRect(
            cx - rectWidth / 2,
            Math.min(trackRect.y, cy),
            rectWidth,
            rectHeight
          );
        }

        // Move to the next point
        ctx.beginPath();
        ctx.moveTo(cx, cy);
      } else {
        // Draw the segment in the default color
        ctx.strokeStyle = color;
        if (first) {
          ctx.moveTo(cx, cy);
          first = false;
        } else {
          ctx.lineTo(cx, cy);
        }
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
