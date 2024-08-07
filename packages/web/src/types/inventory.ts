import { NetworkWithStation } from './network';

export interface Inventory {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  network_count: number;
  networks: NetworkWithStation[];
}
