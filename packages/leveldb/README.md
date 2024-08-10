# @waveview/leveldb

LevelDB is a multi-layered storage engine for storing time-series data. Each
layer is defined by a specific time sampling or resolution and the maximum
number of data points to store per segment.

## Example

```ts
import { Leveldb, Segment } from '@waveview/leveldb';

// Create a new Leveldb instance with default layer options.
const db = new Leveldb();
for (const layer of Leveldb.defaultLayerOptions) {
  db.addLayer(layer.size, layer);
}

// Get the layer with level 5 (5 minutes segment size) and set data to segment.
const layer = db.getLayer(5);
const segment = new Segment(Date.now(), layer.options.maxPoints);
for (
  let timestamp = segment.timestamp;
  timestamp < segment.timestamp + layer.size * 60_000;
  timestamp += 60_000
) {
  segment.set(segment.timestamp + layer.size * 60_000, Math.random());
}
layer.set(segment.timestamp, segment);

// Query data from the layer.
const data = layer.getDataPointsInRange(
  segment.timestamp,
  segment.timestamp + layer.size * 60_000
);
```

## License

MIT
