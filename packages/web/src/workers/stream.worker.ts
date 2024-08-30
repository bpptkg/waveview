import { StreamRequestData, StreamResponseData, WorkerRequestData, WorkerResponseData, readStream } from '@waveview/charts';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { WebSocketRequest, WebSocketSetupData } from '../types/websocket';

import { wsUrl } from '../services/api';

let socket: ReconnectingWebSocket;

function setup(data: WebSocketSetupData): void {
  const { token } = data;

  const url = `${wsUrl}/ws/stream/?token=${token.access}`;
  socket = new ReconnectingWebSocket(url);

  socket.addEventListener('open', () => {});

  socket.addEventListener('message', (event: MessageEvent<Blob>) => {
    const { data } = event;
    processBlob(data);
  });

  socket.addEventListener('close', () => {});
}

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

  if (type === 'stream.fetch') {
    streamFetch(payload as StreamRequestData);
  } else if (type === 'ping') {
    ping();
  } else if (type === 'setup') {
    setup(payload as WebSocketSetupData);
  }
});
