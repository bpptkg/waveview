import { User } from './user';

export interface Organization {
  id: string;
  slug: string;
  name: string;
  email: string;
  description: string;
  url: string;
  address: string;
  avatar?: string;
  author: User;
  created_at: string;
  updated_at: string;
  member_count: number;
  phone_number: string;
  fax_number: string;
  mobile_number: string;
}

export interface OrganizationRole {
  id: string;
  slug: string;
  name: string;
  description: string;
  permissions: string[];
  order: number;
}

export interface OrganizationMembership {
  id: string;
  organization: Organization;
  roles: OrganizationRole[];
  date_added: string;
  expiration_data?: string;
  inviter: User;
}
