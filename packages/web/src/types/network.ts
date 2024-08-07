import { StationWithChannel } from './station';

export interface Network {
  id: string;
  inventory_id: string;
  code: string;
  alternate_code: string;
  start_date: string;
  end_date: string;
  historical_code: string;
  description: string;
  region: string;
  restricted_status: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  station_count: number;
}

export interface NetworkWithStation extends Network {
  stations: StationWithChannel[];
}
