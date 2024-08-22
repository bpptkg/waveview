export interface HypocenterOrigin {
  id: string;
  event_type: string;
  time: string;
  duration: number;
  origin_id: string;
  latitude: number;
  latitude_uncertainty?: number;
  longitude: number;
  longitude_uncertainty?: number;
  depth: number;
  depth_uncertainty?: number;
  magnitude_value: number;
  magnitude_type: string;
}

export interface Hypocenter {
  methods: string[];
  event_types: string[];
  hypocenters: HypocenterOrigin[];
}
