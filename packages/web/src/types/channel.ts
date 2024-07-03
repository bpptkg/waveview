import { Station } from './station';

export interface Channel {
  id: string;
  station: Station;
  code: string;
  name: string;
  description: string;
}
