export interface ChannelConfig {
  channel_id: string;
  color?: string;
}

export interface AmplitudeConfigManualInput {
  channel_id: string;
  label: string;
  method: string;
  category: string;
  unit: string;
  type: string;
  is_preferred: boolean;
}

export interface AmplitudeConfig {
  amplitude_calculator: string;
  channels: ChannelConfig[];
  manual_inputs: AmplitudeConfigManualInput[];
}

export interface BaseFilterOptions {
  id: string;
  order: number;
  zerophase: boolean;
  taper: string;
  taper_width: number;
  is_default?: boolean;
}

export interface BandpassFilterOptions extends BaseFilterOptions {
  type: 'bandpass';
  freqmin: number;
  freqmax: number;
}

export interface LowpassFilterOptions extends BaseFilterOptions {
  type: 'lowpass';
  freq: number;
}

export interface HighpassFilterOptions extends BaseFilterOptions {
  type: 'highpass';
  freq: number;
}

export type FilterOptions = BandpassFilterOptions | LowpassFilterOptions | HighpassFilterOptions;

export interface PickerConfigData {
  helicorder_channel: ChannelConfig;
  seismogram_channels: ChannelConfig[];
  window_size: number;
  force_center: boolean;
  amplitude_config: AmplitudeConfig;
  seismogram_filters: FilterOptions[];
  helicorder_filters: FilterOptions[];
  helicorder_filter: FilterOptions | null;
}

export interface PickerConfig {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  data: PickerConfigData;
}

export interface PickerConfigPayload {
  helicorder_channel: ChannelConfig;
  seismogram_channels: ChannelConfig[];
  force_center: boolean;
  window_size: number;
  helicorder_filter: FilterOptions | null;
}
