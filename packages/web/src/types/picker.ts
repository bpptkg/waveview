import { Channel } from './channel';
import { Station } from './station';

export interface HelicorderConfig {
  channel: Channel;
  color: string;
  color_light: string;
  color_dark: string;
}

export interface SeismogramStationConfig {
  station: Station;
  color: string;
  color_light: string;
  color_dark: string;
}

export interface SeismogramConfig {
  component: string;
  station_configs: SeismogramStationConfig[];
}

export interface PickerConfig {
  id: string;
  organization_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  helicorder_config: HelicorderConfig;
  seismogram_config: SeismogramConfig;
}
