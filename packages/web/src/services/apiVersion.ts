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
  getInventory: {
    v1: (organizationId: string) => `/api/v1/organizations/${organizationId}/inventory/`,
  },
};
