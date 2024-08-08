import { User } from './user';

export interface Organization {
  id: string;
  slug: string;
  name: string;
  email: string;
  description: string;
  url: string;
  address: string;
  avatar?: string;
  author: User;
  created_at: string;
  updated_at: string;
  member_count: number;
}

export interface OrganizationSettingsData {
  default_helicorder_channel_id: string;
  default_helicorder_duration: number;
  default_helicorder_interval: number;
  default_seismogram_station_ids: string[];
  default_seismogram_component: string;
}

export interface OrganizationSettings {
  id: string;
  organization_id: string;
  data: OrganizationSettingsData;
  created_at: string;
  updated_at: string;
}
