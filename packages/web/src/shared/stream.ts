import { SpectrogramResponseData, StreamResponseData } from '../types/worker';

export async function readStream(blob: Blob): Promise<StreamResponseData> {
  const buffer = await blob.arrayBuffer();
  const requestId = new TextDecoder('utf-8').decode(new Uint8Array(buffer, 0, 64)).replace(/\0+$/, '').trim();
  const command = new TextDecoder('utf-8').decode(new Uint8Array(buffer, 64, 64)).replace(/\0+$/, '').trim();
  const channelId = new TextDecoder('utf-8')
    .decode(new Uint8Array(buffer, 64 * 2, 64))
    .replace(/\0+$/, '')
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

export async function readSpectrogram(blob: Blob): Promise<SpectrogramResponseData> {
  const buffer = await blob.arrayBuffer();
  const requestId = new TextDecoder('utf-8').decode(new Uint8Array(buffer, 0, 64)).replace(/\0+$/, '').trim();
  const command = new TextDecoder('utf-8').decode(new Uint8Array(buffer, 64, 64)).replace(/\0+$/, '').trim();
  const channelId = new TextDecoder('utf-8')
    .decode(new Uint8Array(buffer, 64 * 2, 64))
    .replace(/\0+$/, '')
    .trim();
  const header = new Float64Array(buffer, 64 * 3, 10);
  const start = Number(header[0]);
  const end = Number(header[1]);
  const timeMin = start;
  const timeMax = end;
  const freqMin = Number(header[4]);
  const freqMax = Number(header[5]);
  const timeLength = Number(header[6]);
  const freqLength = Number(header[7]);
  const min = Number(header[8]);
  const max = Number(header[9]);

  const image = new Uint8Array(buffer, 64 * 3 + 10 * 8);

  return {
    requestId,
    command,
    channelId,
    start,
    end,
    image,
    timeMin,
    timeMax,
    freqMin,
    freqMax,
    timeLength,
    freqLength,
    min,
    max,
  };
}
