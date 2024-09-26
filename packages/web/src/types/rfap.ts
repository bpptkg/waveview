export interface RfApDailyResult {
  time: string;
  count: number;
  distance: number;
  rf_count: number;
  ap_count: number;
  rf_distance: number;
  ap_distance: number;
}

export interface RfApDirectionalResult {
  direction: number;
  azimuth: number;
  count: number;
  distance: number;
  rf_count: number;
  ap_count: number;
  rf_distance: number;
  ap_distance: number;
  data: RfApDailyResult[];
}

export interface RfApData {
  daily_results: RfApDailyResult[];
  directional_results: RfApDirectionalResult[];
}
