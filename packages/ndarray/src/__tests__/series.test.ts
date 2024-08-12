import { Index, Series } from "../index";

describe("Series", () => {
  it("should initializes correctly", () => {
    const data = new Float32Array([1, 2, 3]);
    const index = new Float32Array([0, 1, 2]);
    const options = { name: "Series", index };
    const series = new Series(data, options);

    expect(series.name).toBe("Series");
    expect(series.values).toEqual(data);
    expect(series.index.values).toEqual(index);
  });

  it("should create empty Series", () => {
    const emptySeries = Series.empty<Float32Array, Float32Array>();

    expect(emptySeries.values.length).toBe(0);
    expect(emptySeries.index.values.length).toBe(0);
  });

  it("should create Series from an array of values", () => {
    const data = new Float32Array([1, 2, 3]);
    const series = Series.from(data);

    expect(series.values).toEqual(data);
  });

  it("should create Series with default values", () => {
    const series = Series.defaults(3, 1);

    expect(series.values).toEqual(new Float32Array([1, 1, 1]));
  });

  it("should create Series with zeros as values", () => {
    const series = Series.zeros(3);

    expect(series.values).toEqual(new Float32Array([0, 0, 0]));
  });

  it("should create Series with ones as values", () => {
    const series = Series.ones(3);

    expect(series.values).toEqual(new Float32Array([1, 1, 1]));
  });

  it("should returns correct getter values", () => {
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
    expect(series.isEmpty()).toBe(false);
    expect(series.dtype).toBe("Float32Array");
    expect(series.nbytes).toBe(12);
    expect(series.shape).toEqual([3]);
  });

  it("should iterate over the series index and value pairs", () => {
    const data = new Float32Array([1, 2, 3]);
    const index = new Float32Array([0, 1, 2]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    const values: [number, number][] = [];
    for (const [index, value] of series.iterIndexValuePairs()) {
      values.push([index, value]);
    }

    expect(values).toEqual([
      [0, 1],
      [1, 2],
      [2, 3],
    ]);
  });

  it("should iterate over the series values", () => {
    const data = new Float32Array([1, 2, 3]);
    const index = new Float32Array([0, 1, 2]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    const values: number[] = [];
    for (const value of series.iterValues()) {
      values.push(value);
    }

    expect(values).toEqual([1, 2, 3]);
  });

  it("should correctly set index values", () => {
    const data = new Float32Array([1, 2, 3]);
    const index = new Float32Array([0, 1, 2]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    const newIndex = new Index(new Float32Array([3, 4, 5]));
    series.setIndex(newIndex);

    expect(series.index.values).toEqual(newIndex.values);
  });

  it("should correctly get the value at a specific index", () => {
    const data = new Float32Array([1, 2, 3, 4, 5]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    expect(series.getValueByPosition(2)).toBe(3);
  });

  it("should correctly set the value at a nearest index", () => {
    const data = new Float32Array([1, 2, 3, 4, 5]);
    const index = new Float32Array([0, 3, 7, 11, 13]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    expect(series.getValueByIndex(4)).toBe(2);
    expect(series.getValueByIndex(6)).toBe(3);
    expect(series.getValueByIndex(10)).toBe(4);
  });

  it("should correctly set the value at a specific index", () => {
    const data = new Float32Array([1, 2, 3, 4, 5]);
    const index = new Float32Array([0, 3, 7, 11, 13]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    series.setValueByIndex(4, 10);
    series.setValueByPosition(0, 3);

    expect(series.getValueByIndex(4)).toBe(10);
    expect(series.getValueByPosition(0)).toBe(3);
  });

  it("should correctly map the series", () => {
    const data = new Float32Array([1, 2, 3, 4, 5]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    const mapped = series.map((value) => value * 2);

    expect(mapped.values).toEqual(new Float32Array([2, 4, 6, 8, 10]));
    expect(mapped.index.values).toEqual(new Float32Array([0, 1, 2, 3, 4]));
  });

  it("should correctly slice the series", () => {
    const data = new Float32Array([1, 2, 3, 4, 5]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    const sliced = series.slice(1, 3);

    expect(sliced.values).toEqual(new Float32Array([2, 3]));
    expect(sliced.index.values).toEqual(new Float32Array([1, 2]));
  });

  it("should correctly filter the series", () => {
    const data = new Float32Array([1, 2, 3, 4, 5]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    const filtered = series.filter((value) => value > 2);

    expect(filtered.values).toEqual(new Float32Array([3, 4, 5]));
    expect(filtered.index.values).toEqual(new Float32Array([2, 3, 4]));
  });

  it("should correctly iterate over the series", () => {
    const data = new Float32Array([1, 2, 3, 4, 5]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    const values: number[] = [];
    series.forEach((value) => {
      values.push(value);
    });

    expect(values).toEqual([1, 2, 3, 4, 5]);
  });

  it("should correctly get the minimum value", () => {
    const data = new Float32Array([1, 2, 3, 4, 5]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    expect(series.min()).toBe(1);
  });

  it("should correctly get the maximum value", () => {
    const data = new Float32Array([1, 2, 3, 4, 5]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    expect(series.max()).toBe(5);
  });

  it("should correctly get the mean value", () => {
    const data = new Float32Array([1, 2, 3, 4, 5]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    expect(series.mean()).toBe(3);
  });

  it("should correctly get the sum of the series", () => {
    const data = new Float32Array([1, 2, 3, 4, 5]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    expect(series.sum()).toBe(15);
  });

  it("should correctly get the std value", () => {
    const data = new Float32Array([1, 2, 3, 4, 5]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    expect(series.std()).toBeCloseTo(1.4142135623730951);
  });

  it("should correctly get the first value", () => {
    const data = new Float32Array([1, 2, 3, 4, 5]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    expect(series.first()).toBe(1);
  });

  it("should correctly get the last value", () => {
    const data = new Float32Array([1, 2, 3, 4, 5]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    expect(series.last()).toBe(5);
  });

  it("should correctly add two series", () => {
    const data1 = new Float32Array([1, 2, 3, 4, 5]);
    const data2 = new Float32Array([5, 4, 3, 2, 1]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series1 = new Series(data1, options);
    const series2 = new Series(data2, options);

    expect(series1.add(series2).values).toEqual(
      new Float32Array([6, 6, 6, 6, 6])
    );
  });

  it("should correctly subtract two series", () => {
    const data1 = new Float32Array([1, 2, 3, 4, 5]);
    const data2 = new Float32Array([5, 4, 3, 2, 1]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series1 = new Series(data1, options);
    const series2 = new Series(data2, options);

    expect(series1.subtract(series2).values).toEqual(
      new Float32Array([-4, -2, 0, 2, 4])
    );
  });

  it("should correctly multiply two series", () => {
    const data1 = new Float32Array([1, 2, 3, 4, 5]);
    const data2 = new Float32Array([5, 4, 3, 2, 1]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series1 = new Series(data1, options);
    const series2 = new Series(data2, options);

    expect(series1.multiply(series2).values).toEqual(
      new Float32Array([5, 8, 9, 8, 5])
    );
  });

  it("should correctly divide two series", () => {
    const data1 = new Float32Array([1, 2, 3, 4, 5]);
    const data2 = new Float32Array([5, 4, 3, 2, 1]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series1 = new Series(data1, options);
    const series2 = new Series(data2, options);

    expect(series1.divide(series2).values).toEqual(
      new Float32Array([0.2, 0.5, 1, 2, 5])
    );
  });

  it("should correctly add the series values", () => {
    const data = new Float32Array([1, 2, 3, 4, 5]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    expect(series.scalarAdd(2).values).toEqual(
      new Float32Array([3, 4, 5, 6, 7])
    );
  });

  it("should correctly subtract the series values", () => {
    const data = new Float32Array([1, 2, 3, 4, 5]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    expect(series.scalarSubtract(2).values).toEqual(
      new Float32Array([-1, 0, 1, 2, 3])
    );
  });

  it("should correctly multiply the series values", () => {
    const data = new Float32Array([1, 2, 3, 4, 5]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    expect(series.scalarMultiply(2).values).toEqual(
      new Float32Array([2, 4, 6, 8, 10])
    );
  });

  it("should correctly divide the series values", () => {
    const data = new Float32Array([2, 4, 6, 8, 10]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    expect(series.scalarDivide(2).values).toEqual(
      new Float32Array([1, 2, 3, 4, 5])
    );
  });

  it("should correctly check if every value in the series meets the condition", () => {
    const data = new Float32Array([2, 4, 6, 8, 10]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    expect(series.every((value) => value % 2 === 0)).toBe(true);
    expect(series.every((value) => value > 5)).toBe(false);
  });

  it("should correctly check if some values in the series meet the condition", () => {
    const data = new Float32Array([2, 4, 6, 8, 10]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    expect(series.some((value) => value % 2 === 0)).toBe(true);
    expect(series.some((value) => value > 5)).toBe(true);
    expect(series.some((value) => value > 10)).toBe(false);
  });

  it("should correctly get the cumulative sum of the series", () => {
    const data = new Float32Array([1, 2, 3, 4, 5]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);
    const cumsum = series.cumsum();

    expect(cumsum.values).toEqual(new Float32Array([1, 3, 6, 10, 15]));
  });

  it("should correctly calculate the difference of the series", () => {
    const data = new Float32Array([1, 2, 4, 7, 11]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);
    const diff = series.diff();

    expect(diff.values).toEqual(new Float32Array([NaN, 1, 2, 3, 4]));
  });

  it("should correctly return string representation of the series", () => {
    const data = new Float32Array([1, 2, 3]);
    const index = new Float32Array([0, 1, 2]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    expect(series.toString()).toBe("Series([1, 2, 3])");
  });

  it("should correctly return array of values", () => {
    const data = new Float32Array([1, 2, 3, 4, 5]);
    const index = new Float32Array([0, 1, 2, 3, 4]);
    const options = {
      name: "Series",
      index,
    };
    const series = new Series(data, options);

    expect(series.toArray()).toEqual([1, 2, 3, 4, 5]);
  });
});
