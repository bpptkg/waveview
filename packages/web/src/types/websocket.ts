import { JwtToken } from './auth';
import { SeismicEvent } from './event';

export type WebSocketCommand = 'stream.fetch' | 'ping' | 'notify';
export type WebSocketMessageType = 'request' | 'response' | 'notify';
export type WebSocketMessageStatus = 'success' | 'error';

export interface WebSocketRequest<T = any> {
  command: WebSocketCommand;
  data: T;
}

export interface WebSocketResponse<T = any> {
  status: WebSocketMessageStatus;
  type: WebSocketMessageType;
  command: WebSocketCommand;
  data: T;
}

export interface WebSocketSetupData {
  token: JwtToken;
}

export interface NewEventNotificationData {
  title: string;
  event: SeismicEvent;
}

export interface NotificationMessage<T = any> {
  type: string;
  data: T;
}

export type NewEventNotificationMessage = NotificationMessage<NewEventNotificationData>;
