export interface DEMGrid {
  name: string;
  nx: number;
  ny: number;
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
  z_min: number;
  z_max: number;
  xyz: [number, number, number][];
}

export interface DEMXYZInfo {
  id: string;
  volcano_id: string;
  name: string;
  utm_zone: string;
  zone_number: number;
  zone_letter: string;
  is_northern: boolean;
  x_min?: number;
  x_max?: number;
  y_min?: number;
  y_max?: number;
  z_min?: number;
  z_max?: number;
  grid: DEMGrid;
}
