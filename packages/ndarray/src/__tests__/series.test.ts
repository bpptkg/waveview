import { Series } from "../series";

describe("Series", () => {
  test("constructor initializes correctly", () => {
    const data = new Float32Array([1, 2, 3]);
    const index = new Float32Array([0, 1, 2]);
    const options = { name: "Series", index };
    const series = new Series(data, options);

    expect(series.name).toBe("Series");
    expect(series.values).toEqual(data);
    expect(series.index.values).toEqual(index);
  });

  test("empty method creates an empty Series", () => {
    const emptySeries = Series.empty<Float32Array, Float32Array>();

    expect(emptySeries.values.length).toBe(0);
    expect(emptySeries.index.values.length).toBe(0);
  });

  test("getters return correct values", () => {
    const data = new Float32Array([1, 2, 3]);
    const index = new Float32Array([0, 1, 2]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    expect(series.values).toEqual(data);
    expect(series.index.values).toEqual(index);
    expect(series.name).toBe("Series");
    expect(series.length).toBe(3);
  });
});
