export interface Volcano {
  id: string;
  organization_id: string;
  slug: string;
  name: string;
  description: string;
  elevation: number;
  location: string;
  country: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  is_default: boolean;
}
