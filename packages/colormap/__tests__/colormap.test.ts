import { ColorMapSpec, createColormap } from "../src/colorMap";
import { test, expect } from "vitest";

test("should create a colormap with default settings", () => {
  const colormap = createColormap();
  expect(colormap).toBeDefined();
  expect(Array.isArray(colormap)).toBe(true);
});

test("should create a colormap with specified nshades", () => {
  const spec: ColorMapSpec = { nshades: 10 };
  const colormap = createColormap(spec);
  expect(colormap.length).toBe(10);
});

test("should throw an error for unsupported colormap", () => {
  const spec: ColorMapSpec = { colormap: "unsupported" };
  expect(() => createColormap(spec)).toThrow(
    "unsupported not a supported colorscale"
  );
});

test("should create a colormap with hex format", () => {
  const spec: ColorMapSpec = { format: "hex" };
  const colormap = createColormap(spec);
  expect(typeof colormap[0]).toBe("string");
  expect(colormap[0]).toMatch(/^#[0-9A-Fa-f]{6}$/);
});

test("should create a colormap with rgbaString format", () => {
  const spec: ColorMapSpec = { format: "rgbaString" };
  const colormap = createColormap(spec);
  expect(typeof colormap[0]).toBe("string");
  expect(colormap[0]).toMatch(/^rgba\(\d+,\d+,\d+,\d+(\.\d+)?\)$/);
});

test("should create a colormap with float format", () => {
  const spec: ColorMapSpec = { format: "float" };
  const colormap = createColormap(spec);
  expect(Array.isArray(colormap[0])).toBe(true);
  expect(colormap[0].length).toBe(4);
  expect(typeof colormap[0][0]).toBe("number");
});

test("should handle alpha values correctly", () => {
  const spec: ColorMapSpec = { alpha: [0.5, 0.8], format: "float" };
  const colormap = createColormap(spec);
  expect(colormap[0][3]).toBeCloseTo(0.5, 1);
  expect(colormap[colormap.length - 1][3]).toBeCloseTo(0.8, 1);
});
