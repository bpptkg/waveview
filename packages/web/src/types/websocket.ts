import { JwtToken } from './auth';
import { EventType, SeismicEvent } from './event';
import { User } from './user';

export type WebSocketCommand = 'stream.fetch' | 'stream.spectrogram' | 'stream.filter' | 'ping' | 'notify';
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

export interface WebSocketHeader {
  requestId: string;
  command: WebSocketCommand;
}

export interface WebSocketSetupData {
  token: JwtToken;
}

export interface NewEventNotificationData {
  event: SeismicEvent;
}

export interface EventUpdateNotificationData {
  event: SeismicEvent;
}

export interface DeletedEvent {
  id: string;
  time: string;
  type: EventType;
  duration: number;
  author: User;
  deleted_at: string;
}

export interface EventDeleteNotificationData {
  event: DeletedEvent;
}

export interface NotificationMessage<T = any> {
  type: string;
  title: string;
  body: string;
  data: T;
}

export type NewEventNotificationMessage = NotificationMessage<NewEventNotificationData>;
