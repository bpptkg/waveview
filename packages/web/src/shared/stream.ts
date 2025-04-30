import { ZstdCodec } from 'zstd-codec';
import { WebSocketCommand, WebSocketHeader } from '../types/websocket';
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

export async function parseWebSocketHeader(blob: Blob): Promise<WebSocketHeader> {
  const decompressed = await decompress(blob);
  const buffer = await decompressed.arrayBuffer();
  const view = new DataView(buffer);

  let offset = 0;
  view.getInt32(offset, true); // version
  offset += 4;

  function readString(len: number): string {
    const bytes = new Uint8Array(buffer, offset, len);
    offset += len;
    const decoder = new TextDecoder();
    return decoder.decode(bytes).replace(/\0/g, '');
  }

  const requestId = readString(64);
  const command = readString(64) as WebSocketCommand;

  return { requestId, command };
}

export async function readStream(blob: Blob): Promise<StreamResponseData> {
  const decompressed = await decompress(blob); // MUST decompress fully
  const buffer = await decompressed.arrayBuffer();
  const view = new DataView(buffer);

  let offset = 0;

  view.getInt32(offset, true); // version
  offset += 4;

  function readString(len: number): string {
    const bytes = new Uint8Array(buffer, offset, len);
    offset += len;
    const decoder = new TextDecoder();
    return decoder.decode(bytes).replace(/\0/g, '');
  }

  const requestId = readString(64);
  const command = readString(64);
  const channelId = readString(64);

  const start = Number(view.getBigInt64(offset, true));
  offset += 8;
  const end = Number(view.getBigInt64(offset, true));
  offset += 8;

  const time = view.getFloat64(offset, true);
  offset += 8;
  const samplingRate = view.getFloat32(offset, true);
  offset += 4;

  const nSamples = view.getInt32(offset, true);
  offset += 4;

  const min = view.getFloat32(offset, true);
  offset += 4;
  const max = view.getFloat32(offset, true);
  offset += 4;

  const data = new Float32Array(buffer, offset, nSamples);
  offset += nSamples * 4;

  const nMaskBytes = Math.ceil(nSamples / 8);
  const maskBytes = new Uint8Array(buffer, offset, nMaskBytes);
  offset += nMaskBytes;

  const mask: boolean[] = [];
  for (let i = 0; i < nSamples; i++) {
    const byte = maskBytes[Math.floor(i / 8)];
    mask.push((byte & (1 << i % 8)) !== 0);
  }

  const count = nSamples;

  const index = new Float64Array(nSamples);
  for (let i = 0; i < nSamples; i++) {
    index[i] = time + (i / samplingRate) * ONE_SECOND;
  }

  return {
    requestId,
    command,
    channelId,
    start,
    end,
    index,
    data,
    mask,
    min,
    max,
    count,
  };
}

export async function readSpectrogram(blob: Blob): Promise<SpectrogramResponseData> {
  const decompressed = await decompress(blob);
  const buffer = await decompressed.arrayBuffer();
  const view = new DataView(buffer);

  let offset = 0;
  view.getInt32(offset, true); // version
  offset += 4;

  function readString(len: number): string {
    const bytes = new Uint8Array(buffer, offset, len);
    offset += len;
    const decoder = new TextDecoder();
    return decoder.decode(bytes).replace(/\0/g, '');
  }

  const requestId = readString(64);
  const command = readString(64);
  const channelId = readString(64);
  const start = Number(view.getBigInt64(offset, true));
  offset += 8;
  const end = Number(view.getBigInt64(offset, true));
  offset += 8;
  const timeMin = Number(view.getFloat64(offset, true));
  offset += 8;
  const timeMax = Number(view.getFloat64(offset, true));
  offset += 8;
  const freqMin = Number(view.getFloat64(offset, true));
  offset += 8;
  const freqMax = Number(view.getFloat64(offset, true));
  offset += 8;
  const timeLength = Number(view.getInt32(offset, true));
  offset += 4;
  const freqLength = Number(view.getInt32(offset, true));
  offset += 4;
  const min = Number(view.getFloat32(offset, true));
  offset += 4;
  const max = Number(view.getFloat32(offset, true));
  offset += 4;
  const image = new Uint8Array(buffer, offset);

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
