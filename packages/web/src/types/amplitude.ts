export interface SignalAmplitude {
  amplitude: number;
  unit: string;
  stream_id: string;
  type: string;
  category: string;
  time: string;
  duration: number;
  label: string;
}

export interface SignalAmplitudePayload {
  time: string;
  duration: number;
  use_median_filter: boolean;
}
