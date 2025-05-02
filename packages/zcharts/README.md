# @waveview/zcharts

2D charting libary for WaveView built using HTML Canvas and
[ZRender](https://ecomfe.github.io/zrender/).

## Helicorder

Below is an example on how to generate helicorder chart.

```ts
import { Helicorder, generateSampleData } from "@waveview/zcharts";

const dom = document.getElementById("chart") as HTMLDivElement;

const chart = new Helicorder(dom, {
  channel: {
    id: "channel",
    label: "Channel",
  },
  interval: 30,
  duration: 12,
  offsetDate: Date.now(),
  forceCenter: true,
});

const trackManager = chart.getTrackManager();
for (const segment of trackManager.segments()) {
  const [start, end] = segment;
  const data = generateSampleData(start, end, 25 * 60 * 30);
  trackManager.setTrackData(segment, data);
}

chart.render({ refreshSignal: true });
```

## Seismogram

Below is an example on how to generate seismogram chart.

```ts
import { Seismogram, generateSampleData } from "@waveview/zcharts";

const endTime = Date.now();
const startTime = endTime - 5 * 60_000;
const channels = Array.from({ length: 5 }, (_, i) => i).map((i) => ({
  id: `channel-${i}`,
  label: `Channel ${i}`,
}));

const dom = document.getElementById("chart") as HTMLDivElement;

const seismogram = new Seismogram(dom, {
  channels,
  startTime,
  endTime,
  forceCenter: true,
});

channels.forEach((channel) => {
  seismogram.setChannelData(
    channel.id,
    generateSampleData(startTime, endTime, 50 * 60 * 5)
  );
});

seismogram.render({ refreshSignal: true });
```

## License

MIT
