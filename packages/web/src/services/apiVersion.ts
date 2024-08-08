export default {
  login: {
    v1: '/api/v1/auth/token/',
  },
  listOrganization: {
    v1: '/api/v1/organizations/',
  },
  createOrganization: {
    v1: '/api/v1/organizations/',
  },
  getOrganization: {
    v1: (id: string) => `/api/v1/organizations/${id}/`,
  },
  getOrganizationSettings: {
    v1: (id: string) => `/api/v1/organizations/${id}/settings/`,
  },
  getInventory: {
    v1: (organizationId: string) => `/api/v1/organizations/${organizationId}/inventory/`,
  },
};
