import { StreamResponseData } from "./types";

export async function readStream(blob: Blob): Promise<StreamResponseData> {
  const buffer = await blob.arrayBuffer();
  const requestId = new TextDecoder("utf-8")
    .decode(new Uint8Array(buffer, 0, 64))
    .replace(/\0+$/, "")
    .trim();
  const command = new TextDecoder("utf-8")
    .decode(new Uint8Array(buffer, 64, 64))
    .replace(/\0+$/, "")
    .trim();
  const channelId = new TextDecoder("utf-8")
    .decode(new Uint8Array(buffer, 64 * 2, 64))
    .replace(/\0+$/, "")
    .trim();
  const header = new BigUint64Array(buffer, 64 * 3, 8);
  const start = Number(header[0]);
  const end = Number(header[1]);
  const length = Number(header[2]);

  const index = new Float64Array(buffer, 64 * 4, length);
  const data = new Float64Array(buffer, 64 * 4 + length * 8, length);

  const extent = data.reduce(
    (acc, val) => {
      acc[0] = Math.min(acc[0], val);
      acc[1] = Math.max(acc[1], val);
      return acc;
    },
    [Infinity, -Infinity]
  ) as [number, number];

  return {
    requestId,
    command,
    index,
    data,
    extent,
    channelId,
    start,
    end,
  };
}
