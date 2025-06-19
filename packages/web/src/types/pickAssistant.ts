export interface PickAssistant {
  start: string;
  end: string;
  duration: number;
  stream_id: string;
  channel_id: string;
}

export interface PickAssistantPayload {
  t_onset: string;
}
