import { expect, test } from "vitest";
import { Index } from "../src/index";
import { Series } from "../src/series";

test("should initializes correctly", () => {
  const data = new Uint32Array([1, 2, 3]);
  const mask = [true, false, true];
  const index = new Index(data, mask);
  const series = new Series(data, {
    index,
    mask,
  });
  expect(index.values).toEqual(data);
  expect(index.mask).toEqual(mask);
  expect(series.values).toEqual(data);
});

test("should get minimum value correctly", () => {
  const data = new Uint32Array([3, 1, 2]);
  const mask = [true, false, true];
  const index = new Index(data, mask);
  const series = new Series(data, {
    index,
    mask,
  });
  expect(series.min()).toEqual(1);
});

test("should get maximum value correctly", () => {
  const data = new Uint32Array([3, 1, 2]);
  const mask = [true, false, false];
  const index = new Index(data, mask);
  const series = new Series(data, {
    index,
    mask,
  });
  expect(series.max()).toEqual(2);
});

test("should get mean value correctly", () => {
  const data = new Uint32Array([3, 1, 2]);
  const mask = [false, false, true];
  const index = new Index(data, mask);
  const series = new Series(data, {
    index,
    mask,
  });
  expect(series.mean()).toEqual(2);
});

test("should get sum value correctly", () => {
  const data = new Uint32Array([3, 1, 2]);
  const mask = [true, false, false];
  const index = new Index(data, mask);
  const series = new Series(data, {
    index,
    mask,
  });
  expect(series.sum()).toEqual(3);
});

test("should calculate scalar add correctly", () => {
  const data = new Uint32Array([3, 1, 2]);
  const mask = [true, false, false];
  const index = new Index(data, mask);
  const series = new Series(data, {
    index,
    mask,
  });
  expect(series.scalarAdd(2).values).toEqual(new Uint32Array([3, 3, 4]));
});

test("should calculate scalar subtract correctly", () => {
  const data = new Uint32Array([3, 1, 2]);
  const mask = [true, false, false];
  const index = new Index(data, mask);
  const series = new Series(data, {
    index,
    mask,
  });
  expect(series.scalarSubtract(2).values).toEqual(new Uint32Array([3, -1, 0]));
});

test("should calculate scalar multiply correctly", () => {
  const data = new Uint32Array([3, 1, 2]);
  const mask = [true, false, false];
  const index = new Index(data, mask);
  const series = new Series(data, {
    index,
    mask,
  });
  expect(series.scalarMultiply(2).values).toEqual(new Uint32Array([3, 2, 4]));
});

test("should calculate scalar divide correctly", () => {
  const data = new Uint32Array([3, 2, 2]);
  const mask = [true, false, false];
  const index = new Index(data, mask);
  const series = new Series(data, {
    index,
    mask,
  });
  expect(series.scalarDivide(2).values).toEqual(new Uint32Array([3, 1, 1]));
});

test("should construct a series with mask from json correctly", () => {
  const data = new Uint32Array([3, 1, 2]);
  const mask = [true, false, false];
  const index = new Index(data, mask);
  const series = new Series(data, {
    index,
    mask,
  });
  const json = series.toJSON();
  const seriesFromJson = Series.from(new Uint32Array(json.values), {
    index: Index.from(new Uint32Array(json.index), json.mask),
    mask: json.mask,
  });
  expect(seriesFromJson.values).toEqual(data);
  expect(seriesFromJson.index).toEqual(index);
  expect(seriesFromJson.index.mask).toEqual(mask);
});

test("should return masked array correctly", () => {
  const data = new Uint32Array([3, 1, 2]);
  const mask = [true, false, false];
  const index = new Index(data, mask);
  const series = new Series(data, {
    index,
    mask,
  });
  expect(series.isMasked()).toBe(true);
});

test("should return unmasked array correctly", () => {
  const data = new Uint32Array([3, 1, 2]);
  const index = new Index(data);
  const series = new Series(data, {
    index,
  });
  expect(series.isMasked()).toBe(false);
});

test("should iter index value mask correctly", () => {
  const data = new Uint32Array([3, 1, 2]);
  const mask = [true, false, false];
  const index = new Index(new Uint32Array([0, 1, 2]), mask);
  const series = new Series(data, {
    index,
    mask,
  });
  for (const [i, v, m] of series.iterIndexValueMask()) {
    expect(series.get(i)).toEqual(data[i]);
    expect(v).toEqual(data[i]);
    expect(m).toEqual(mask[i]);
  }
});

test("should calculate percentile correctly", () => {
  const data = new Uint32Array([3, 1, 2]);
  const mask = [true, false, false];
  const index = new Index(new Uint32Array([0, 1, 2]), mask);
  const series = new Series(data, {
    index,
    mask,
  });
  expect(series.percentile(5)).toEqual(1.05);
});
