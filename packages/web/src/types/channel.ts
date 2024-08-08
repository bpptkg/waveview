
export interface Channel {
  id: string;
  station_id: string;
  code: string;
  alternate_code: string;
  start_date: string;
  end_date: string;
  historical_code: string;
  location_code: string;
  latitude: number;
  longitude: number;
  elevation: number;
  depth: number;
  restricted_status: string;
  description: string;
  azimuth: number;
  dip: number;
  water_level: number;
  sample_rate: number;
  sample_rate_ratio_number_samples: number;
  sample_rate_ratio_number_seconds: number;
  clock_drift: number;
  calibration_units: string;
  calibration_units_description: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  stream_id: string;
  network_station_code: string;
  station_channel_code: string;
}
