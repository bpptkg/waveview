import { Organization, OrganizationSettings } from '../../types/organization';

export interface OrganizationStore {
  currentOrganization: Organization | null;
  allOrganizations: Organization[];
  currentOrganizationSettings: OrganizationSettings | null;
  setCurrentOrganization: (organization: Organization) => void;
  fetchAllOrganizations: () => Promise<void>;
  fetchOrganizationSettings: (id: string) => Promise<void>;
}
