import { Network } from './network';

export interface Station {
  id: string;
  network: Network;
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
}
