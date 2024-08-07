import { Channel } from './channel';

export interface Station {
  id: string;
  network_id: string;
  code: string;
  alternate_code: string;
  start_date: string;
  end_date: string;
  historical_code: string;
  latitude: number;
  longitude: number;
  elevation: number;
  restricted_status: string;
  description: string;
  place: string;
  country: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  channel_count: number;
}

export interface StationWithChannel extends Station {
  channels: Channel[];
}
