import { Organization, OrganizationSettings } from '../../types/organization';

export interface OrganizationStore {
  organization: Organization | null;
  organizations: Organization[];
  organizationSettings: OrganizationSettings | null;
  setOrganizations: (organizations: Organization[]) => void;
  setOrganization: (organization: Organization) => void;
  fetchOrganizations: () => Promise<void>;
  fetchOrganization: (id: string) => Promise<void>;
  fetchOrganizationSettings: (id: string) => Promise<void>;
}
