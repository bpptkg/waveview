import { JwtToken } from "./auth";

export type WebSocketCommand = 'stream.fetch' | 'ping';

export interface WebSocketRequest<T> {
  command: WebSocketCommand;
  data: T;
}

export interface WebSocketResponse<T> {
  status: 'success' | 'error';
  type: 'request' | 'response' | 'notify';
  command: WebSocketCommand;
  data: T;
}

export interface WebSocketSetupData {
  token: JwtToken;
}
