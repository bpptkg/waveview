import { Organization } from '../../types/organization';

export interface OrganizationStore {
  organization: Organization | null;
  organizations: Organization[];
  setOrganizations: (organizations: Organization[]) => void;
  setOrganization: (organization: Organization) => void;
  fetchOrganizations: () => Promise<void>;
}
