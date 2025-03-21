import { ZstdCodec } from 'zstd-codec';
import { SpectrogramResponseData, StreamResponseData } from '../types/worker';
import { ONE_SECOND } from './time';

export async function decompress(blob: Blob): Promise<Blob> {
  const buffer = await blob.arrayBuffer();
  return new Promise((resolve, reject) => {
    ZstdCodec.run((zstd) => {
      try {
        const simple = new zstd.Simple();
        const compressed = new Uint8Array(buffer);
        const decompressed = simple.decompress(compressed);
        resolve(new Blob([decompressed]));
      } catch (error) {
        reject(error);
      }
    });
  });
}

export async function readStream(blob: Blob): Promise<StreamResponseData> {
  const decompressed = await decompress(blob);
  const buffer = await decompressed.arrayBuffer();
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
  const time = Number(header[3]);
  const sampleRate = Number(header[4]);

  const index = new Float64Array(length);
  for (let i = 0; i < length; i++) {
    index[i] = time + (i / sampleRate) * ONE_SECOND;
  }
  const data = new Float64Array(buffer, 64 * 4, length);

  const extent = data.reduce(
    (acc, val) => {
      acc[0] = Math.min(acc[0], val);
      acc[1] = Math.max(acc[1], val);
      return acc;
    },
    [Infinity, -Infinity]
  ) as [number, number];
  const mean = length > 0 ? data.reduce((acc, val) => acc + val, 0) / length : 0;
  const min = isFinite(extent[0]) ? extent[0] : 0;
  const max = isFinite(extent[1]) ? extent[1] : 0;
  const count = length;

  return {
    requestId,
    command,
    channelId,
    start,
    end,
    index,
    data,
    min,
    max,
    mean,
    count,
  };
}

export async function readSpectrogram(blob: Blob): Promise<SpectrogramResponseData> {
  const decompressed = await decompress(blob);
  const buffer = await decompressed.arrayBuffer();
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
