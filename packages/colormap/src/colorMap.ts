import { colorScale } from "./colorScale";

export interface ColorMapSpec {
  colormap?: string | { index: number; rgb: number[] }[];
  nshades?: number;
  format?: "hex" | "rgbaString" | "float";
  alpha?: number | number[];
}

export function lerp(v0: number, v1: number, t: number): number {
  return v0 * (1 - t) + v1 * t;
}

export function rgb2float(rgba: number[]): number[] {
  return [rgba[0] / 255, rgba[1] / 255, rgba[2] / 255, rgba[3]];
}

export function rgb2hex(rgba: number[]): string {
  var dig,
    hex = "#";
  for (var i = 0; i < 3; ++i) {
    dig = rgba[i];
    dig = dig.toString(16);
    hex += ("00" + dig).slice(-2);
  }
  return hex;
}

export function rgbaStr(rgba: number[]): string {
  return "rgba(" + rgba.join(",") + ")";
}

type ColormapReturnType<T extends ColorMapSpec> = T["format"] extends "hex"
  ? string[]
  : T["format"] extends "rgbaString"
  ? string[]
  : number[][];

export function createColormap<T extends ColorMapSpec = ColorMapSpec>(
  spec: ColorMapSpec = {}
): ColormapReturnType<T> {
  let indicies: number[],
    fromrgba: number[],
    torgba: number[],
    nsteps: number,
    cmap: { index: number; rgb: number[] }[],
    colormap: string | { index: number; rgb: number[] }[],
    format: "hex" | "rgbaString" | "float",
    nshades: number,
    colors: number[][],
    alpha: number[],
    i: number;

  nshades = (spec.nshades || 72) - 1;
  format = spec.format || "hex";

  colormap = spec.colormap || "jet";

  if (typeof colormap === "string") {
    colormap = colormap.toLowerCase();

    if (!colorScale[colormap]) {
      throw new Error(`${colormap} not a supported colorscale`);
    }

    cmap = colorScale[colormap];
  } else if (Array.isArray(colormap)) {
    cmap = colormap.slice();
  } else {
    throw new Error("unsupported colormap option");
  }

  if (cmap.length > nshades + 1) {
    throw new Error(
      `${colormap} map requires nshades to be at least size ${cmap.length}`
    );
  }

  if (!Array.isArray(spec.alpha)) {
    if (typeof spec.alpha === "number") {
      alpha = [spec.alpha, spec.alpha];
    } else {
      alpha = [1, 1];
    }
  } else if (spec.alpha.length !== 2) {
    alpha = [1, 1];
  } else {
    alpha = spec.alpha.slice();
  }

  // map index points from 0..1 to 0..n-1
  indicies = cmap.map((c) => Math.round(c.index * nshades));

  // Add alpha channel to the map
  alpha[0] = Math.min(Math.max(alpha[0], 0), 1);
  alpha[1] = Math.min(Math.max(alpha[1], 0), 1);

  const steps = cmap.map((_, i) => {
    const index = cmap[i].index;
    const rgba = cmap[i].rgb.slice();

    // if user supplies their own map use it
    if (rgba.length === 4 && rgba[3] >= 0 && rgba[3] <= 1) {
      return rgba;
    }
    rgba[3] = alpha[0] + (alpha[1] - alpha[0]) * index;

    return rgba;
  });

  /*
   * map increasing linear values between indicies to
   * linear steps in colorvalues
   */
  colors = [];
  for (i = 0; i < indicies.length - 1; ++i) {
    nsteps = indicies[i + 1] - indicies[i];
    fromrgba = steps[i];
    torgba = steps[i + 1];

    for (let j = 0; j < nsteps; j++) {
      const amt = j / nsteps;
      colors.push([
        Math.round(lerp(fromrgba[0], torgba[0], amt)),
        Math.round(lerp(fromrgba[1], torgba[1], amt)),
        Math.round(lerp(fromrgba[2], torgba[2], amt)),
        lerp(fromrgba[3], torgba[3], amt),
      ]);
    }
  }

  // add 1 step as last value
  colors.push(cmap[cmap.length - 1].rgb.concat(alpha[1]));

  if (format === "hex") return colors.map(rgb2hex) as ColormapReturnType<T>;
  else if (format === "rgbaString")
    return colors.map(rgbaStr) as ColormapReturnType<T>;
  else if (format === "float")
    return colors.map(rgb2float) as ColormapReturnType<T>;

  return colors as ColormapReturnType<T>;
}
