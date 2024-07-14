# @waveview/charts

`@waveview/charts` is a specialized charting library tailored for visualizing
seismic signals, offering dedicated components like Helicorder and Seismogram
charts. Built on the powerful [PIXI.js](https://pixijs.com/) framework, it
leverages WebGL for rendering, ensuring high performance and smooth interactions
even with large datasets.

## Example

This example demonstrates how to utilize `@waveview/charts` to create a
Helicorder chart with seamless data fetching through Web Workers. This approach
ensures that data loading does not interfere with the user interface, providing
a smooth and responsive experience.

```ts
import { Helicorder, HelicorderWebWorkerExtension } from "@waveview/charts";

// Create a new worker to fetch data from the server
const worker = new Worker(new URL("./stream.worker.ts", import.meta.url), {
  type: "module",
});
const webWorker = new HelicorderWebWorkerExtension(worker);

// Create a new helicorder chart
const dom = document.getElementById("canvas");
const helicorder = new Helicorder(dom, {
  channel: "VG.MEPAS.00.HHZ",
  interval: 30,
  duration: 12,
});
await helicorder.init();
helicorder.use(webWorker);
helicorder.render();

// Fetch all tracks data from the server asynchronously
webWorker.getAPI().fetchAllTracksData();
```
