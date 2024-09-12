import ReconnectingWebSocket from 'reconnecting-websocket';
import { WebSocketCommand, WebSocketHeader, WebSocketRequest, WebSocketSetupData } from '../types/websocket';
import {
  ConnectionStatus,
  FilterRequestData,
  SpectrogramRequestData,
  SpectrogramResponseData,
  StreamRequestData,
  StreamResponseData,
  WorkerRequestData,
  WorkerResponseData,
} from '../types/worker';

import { wsUrl } from '../services/api';
import { readSpectrogram, readStream } from '../shared/stream';

let socket: ReconnectingWebSocket;

async function parseWebSocketHeader(blob: Blob): Promise<WebSocketHeader> {
  const buffer = await blob.arrayBuffer();
  const requestId = new TextDecoder('utf-8').decode(new Uint8Array(buffer, 0, 64)).replace(/\0+$/, '').trim();
  const command = new TextDecoder('utf-8').decode(new Uint8Array(buffer, 64, 64)).replace(/\0+$/, '').trim() as WebSocketCommand;

  return { requestId, command };
}

function onSetup(data: WebSocketSetupData): void {
  const { token } = data;

  const url = `${wsUrl}/ws/stream/?token=${token.access}`;
  socket = new ReconnectingWebSocket(url);

  socket.addEventListener('open', () => {
    const msg: WorkerResponseData<ConnectionStatus> = {
      type: 'connection.status',
      payload: {
        connected: true,
      },
    };
    self.postMessage(msg);
  });

  socket.addEventListener('close', () => {
    const msg: WorkerResponseData<ConnectionStatus> = {
      type: 'connection.status',
      payload: {
        connected: false,
      },
    };
    self.postMessage(msg);
  });

  socket.addEventListener('message', (event: MessageEvent<Blob>) => {
    const { data } = event;
    onMessage(data);
  });
}

async function onMessage(data: Blob): Promise<void> {
  const { command } = await parseWebSocketHeader(data);
  if (command === 'stream.fetch') {
    onStreamFetchMessage(data);
  } else if (command === 'stream.spectrogram') {
    onStreamSpectrogramMessage(data);
  } else if (command === 'stream.filter') {
    onStreamFilterMessage(data);
  }
}

async function onStreamFetchMessage(blob: Blob): Promise<void> {
  const data = await readStream(blob);

  const msg: WorkerResponseData<StreamResponseData> = {
    type: 'stream.fetch',
    payload: data,
  };

  self.postMessage(msg);
}

async function onStreamSpectrogramMessage(blob: Blob): Promise<void> {
  const data = await readSpectrogram(blob);

  const msg: WorkerResponseData<SpectrogramResponseData> = {
    type: 'stream.spectrogram',
    payload: data,
  };

  self.postMessage(msg);
}

async function onStreamFilterMessage(blob: Blob): Promise<void> {
  const data = await readStream(blob);

  const msg: WorkerResponseData<StreamResponseData> = {
    type: 'stream.filter',
    payload: data,
  };
  self.postMessage(msg);
}

self.addEventListener('message', (event: MessageEvent<WorkerRequestData<unknown>>) => {
  const { type, payload } = event.data;

  if (type === 'stream.fetch') {
    onStreamFetch(payload as StreamRequestData);
  } else if (type === 'stream.spectrogram') {
    onStreamSpectrogram(payload as SpectrogramRequestData);
  } else if (type === 'stream.filter') {
    onStreamFilter(payload as FilterRequestData);
  } else if (type === 'ping') {
    onPing();
  } else if (type === 'setup') {
    onSetup(payload as WebSocketSetupData);
  }
});

function onStreamFetch(data: StreamRequestData): void {
  const msg: WebSocketRequest<StreamRequestData> = {
    command: 'stream.fetch',
    data,
  };
  socket.send(JSON.stringify(msg));
}

function onStreamSpectrogram(data: SpectrogramRequestData): void {
  const msg: WebSocketRequest<SpectrogramRequestData> = {
    command: 'stream.spectrogram',
    data,
  };
  socket.send(JSON.stringify(msg));
}

function onStreamFilter(data: FilterRequestData): void {
  const msg: WebSocketRequest<FilterRequestData> = {
    command: 'stream.filter',
    data,
  };
  socket.send(JSON.stringify(msg));
}

function onPing(): void {
  const msg: WebSocketRequest<string> = {
    command: 'ping',
    data: 'ping',
  };
  socket.send(JSON.stringify(msg));
}
