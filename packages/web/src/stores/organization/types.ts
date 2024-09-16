import { Organization } from '../../types/organization';

export interface OrganizationStore {
  currentOrganization: Organization | null;
  allOrganizations: Organization[];
  /**
   * Sets the current organization context.
   *
   * TODO: This should also change the current catalog and inventory whithin a
   * volcano context.
   */
  setCurrentOrganization: (organization: Organization) => void;
  /**
   * Fetches all organizations the user is a member of.
   */
  fetchAllOrganizations: (slug?: string) => Promise<Organization>;
}
