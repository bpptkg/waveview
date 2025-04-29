import { expect, test } from "vitest";
import { Index } from "../src/indexing";

test("should construct an index", () => {
  const data = new Float32Array([1, 2, 3]);
  const index = new Index(data);

  expect(index.values).toEqual(data);
});

test("should create and index using from", () => {
  const data = new Float32Array([1, 2, 3]);
  const index = Index.from(data);

  expect(index.values).toEqual(data);
});

test("should create an empty index with empty", () => {
  const index = Index.empty();

  expect(index.isEmpty()).toEqual(true);
});

test("should create an index with default values", () => {
  const index = Index.defaults(3);

  expect(index.values).toEqual(new Uint32Array([0, 1, 2]));
});

test("should check if the index is empty", () => {
  const data = new Float32Array();
  const index = new Index(data);

  expect(index.isEmpty()).toBe(true);
});

test("should get the length of the index", () => {
  const data = new Float32Array([1, 2, 3]);
  const index = new Index(data);

  expect(index.length).toBe(3);
});

test("should find the nearest position of the index value", () => {
  const data = new Float32Array([1, 2, 3, 4, 5]);
  const index = new Index(data);

  expect(index.getPositionByValue(3)).toBe(2);
});

test("should get the value at a specific index", () => {
  const data = new Float32Array([1, 2, 3]);
  const index = new Index(data);

  expect(index.getValueByPosition(1)).toBe(2);
});

test("should get the first value", () => {
  const data = new Float32Array([1, 2, 3]);
  const index = new Index(data);

  expect(index.first()).toBe(1);
});

test("should get the last value", () => {
  const data = new Float32Array([1, 2, 3]);
  const index = new Index(data);

  expect(index.last()).toBe(3);
});

test("should map a function to each value in the index", () => {
  const data = new Float32Array([1, 2, 3]);
  const index = new Index(data);

  const mapped = index.map((value) => value * 2);

  expect(mapped.values).toEqual(new Float32Array([2, 4, 6]));
});

test("should filter the index values", () => {
  const data = new Float32Array([1, 2, 3]);
  const index = new Index(data);

  const filtered = index.filter((value) => value > 1);

  expect(filtered.values).toEqual(new Float32Array([2, 3]));
});

test("should get the minimum value in the index", () => {
  const data = new Float32Array([1, 2, 3]);
  const index = new Index(data);

  expect(index.min()).toBe(1);
});

test("should get the maximum value in the index", () => {
  const data = new Float32Array([1, 2, 3]);
  const index = new Index(data);

  expect(index.max()).toBe(3);
});

test("should iterate over the index", () => {
  const data = new Float32Array([1, 2, 3]);
  const index = new Index(data);

  const values: number[] = [];
  index.forEach((value) => {
    values.push(value);
  });

  expect(values).toEqual([1, 2, 3]);
});

test("should slice the index", () => {
  const data = new Float32Array([1, 2, 3, 4, 5]);
  const index = new Index(data);

  const sliced = index.slice(1, 3);

  expect(sliced.values).toEqual(new Float32Array([1, 2]));
});

test("should iterate position value pairs", () => {
  const index = Index.defaults(3);

  const values: [number, number][] = [];
  for (const [pos, value] of index.iterPositionValuePairs()) {
    values.push([pos, value]);
  }

  expect(values).toEqual([
    [0, 0],
    [1, 1],
    [2, 2],
  ]);
});

test("should iterate values", () => {
  const data = new Float32Array([1, 2, 3]);
  const index = new Index(data);

  const values: number[] = [];
  for (const value of index.iterValues()) {
    values.push(value);
  }

  expect(values).toEqual([1, 2, 3]);
});

test("should correctly return string representation of the index", () => {
  const data = new Float32Array([1, 2, 3]);
  const index = new Index(data);

  expect(index.toString()).toBe("Index([1, 2, 3])");
});

test("should correctly return array of values", () => {
  const data = new Float32Array([1, 2, 3]);
  const index = new Index(data);

  expect(index.toArray()).toEqual([1, 2, 3]);
});

test("should iter position value mask correctly", () => {
  const mask = [true, false, false];
  const index = new Index(new Float32Array([0, 1, 2]), mask);

  const values: [number, number, boolean][] = [];
  for (const [pos, value, m] of index.iterPositionValueMask()) {
    values.push([pos, value, m]);
  }

  expect(values).toEqual([
    [0, 0, true],
    [1, 1, false],
    [2, 2, false],
  ]);
});
