export type FieldType = 'DISP' | 'VEL' | 'ACC' | 'DEF';

export interface PlotRemoveResponsePayload {
  channel_id: string;
  time: string;
  duration: number;
  output: FieldType;
  water_level: number | null;
  pre_filt: [number, number, number, number] | null;
  zero_mean: boolean;
  taper: boolean;
  taper_fraction: number;
}

export interface PlotRemoveResponse {
  image: string;
  amplitude_min: number;
  amplitude_max: number;
  amplitude_peak: number;
  amplitude_unit: string;
  empty: boolean;
  error: string | null;
}
