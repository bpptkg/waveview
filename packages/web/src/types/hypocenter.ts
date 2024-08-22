export interface HypocenterOrigin {
  id: string;
  event_type: string;
  origin_id: string;
  latitude: number;
  latitude_uncertainty?: number;
  longitude: number;
  longitude_uncertainty?: number;
  depth: number;
  depth_uncertainty?: number;
  magnitude: number;
  magnitude_type: string;
}

export interface Hypocenter {
  methods: string[];
  hypocenters: HypocenterOrigin[];
}
