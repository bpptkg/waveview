import { StreamRequestData, StreamResponseData, WorkerRequestData, WorkerResponseData, readStream } from '@waveview/charts';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { WebSocketRequest } from '../types/websocket';

const socket = new ReconnectingWebSocket('ws://127.0.0.1:8000/ws/stream/');

socket.addEventListener('open', () => {});

socket.addEventListener('message', (event: MessageEvent<Blob>) => {
  const { data } = event;
  processBlob(data);
});

socket.addEventListener('close', () => {});

async function processBlob(blob: Blob): Promise<void> {
  const data = await readStream(blob);

  const msg: WorkerResponseData<StreamResponseData> = {
    type: 'stream.fetch',
    payload: data,
  };

  self.postMessage(msg);
}

function streamFetch(data: StreamRequestData): void {
  const msg: WebSocketRequest<StreamRequestData> = {
    command: 'stream.fetch',
    data,
  };
  socket.send(JSON.stringify(msg));
}

function ping(): void {
  const msg: WebSocketRequest<string> = {
    command: 'ping',
    data: 'ping',
  };
  socket.send(JSON.stringify(msg));
}

self.addEventListener('message', (event: MessageEvent<WorkerRequestData<unknown>>) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'stream.fetch':
      streamFetch(payload as StreamRequestData);
      break;
    case 'ping':
      ping();
      break;
    default:
      break;
  }
});
