# @waveview/ndarray

N-dimensional array library for WaveView. It provides DataFrame-like tabular
interface for storing and manipulating data.

For current version, only Series (one-dimensional indexed value) data structure
with the TypedArray backend is implemented. Other data structures will be
implemented in the future version.

## Example

```ts
import { Series } from "@waveview/ndarray";

// Create a new Series.
const series = new Series(new Float64Array([1, 2, 3, 4, 5]), {
  name: "foo",
  index: new Float64Array([0, 1, 2, 3, 4]),
});

// Access the value at specific index.
const a = series.getValueAt(0);

// Slice the series from index 1 to 3.
const b = series.slice(1, 3);

// Iterate index and value over the series.
for (const [index, value] of series.iterIndexValuePairs()) {
  // do something with index and value.
}

// Find the min and max value in the series.
const min = series.min();
const max = series.max();
```

## License

MIT
