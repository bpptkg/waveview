export interface SignalAmplitude {
  amplitude: number;
  unit: string;
  stream_id: string;
  type: string;
  category: string;
  time: string;
  duration: number;
}

export interface SignalAmplitudePayload {
  time: string;
  duration: number;
}
