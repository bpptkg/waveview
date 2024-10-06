export interface ChannelConfig {
  channel_id: string;
  color?: string;
}

export interface AmplitudeConfig {
  amplitude_calculator: string;
  channels: ChannelConfig[];
}

export interface PickerConfigData {
  helicorder_channel: ChannelConfig;
  seismogram_channels: ChannelConfig[];
  window_size: number;
  force_center: boolean;
  amplitude_config: AmplitudeConfig;
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
}
