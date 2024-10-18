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
 * Render the helicorder tracks to an offscreen canvas.
 */
const render = debounce((event: MessageEvent) => {
  const renderContext = event.data as OffscreenRenderContext;
  const { gridRect, tracks, pixelRatio, color, scaling, interval } =
    renderContext;
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
      data = series.scalarDivide(globalNormFactor);
    } else {
      const localNormFactor = getLocalNormFactor(series);
      data = series.scalarDivide(localNormFactor);
    }
    data.setIndex(
      data.index.map((value: number) => timeToOffset(segment, interval, value))
    );

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
      return y + height * percent - gridRect.y;
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
