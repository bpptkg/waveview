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
  updateOrganization: {
    v1: (id: string) => `/api/v1/organizations/${id}/`,
  },
  deleteOrganization: {
    v1: (id: string) => `/api/v1/organizations/${id}/`,
  },
  getOrganizationSettings: {
    v1: (id: string) => `/api/v1/organizations/${id}/settings/`,
  },
  getInventory: {
    v1: (organizationId: string) => `/api/v1/organizations/${organizationId}/inventory/`,
  },
  listVolcano: {
    v1: (organizationId: string) => `/api/v1/organizations/${organizationId}/volcanoes/`,
  },
  createVolcano: {
    v1: (organizationId: string) => `/api/v1/organizations/${organizationId}/volcanoes/`,
  },
  getVolcano: {
    v1: (organizationId: string, id: string) => `/api/v1/organizations/${organizationId}/volcanoes/${id}/`,
  },
  updateVolcano: {
    v1: (organizationId: string, id: string) => `/api/v1/organizations/${organizationId}/volcanoes/${id}/`,
  },
  deleteVolcano: {
    v1: (organizationId: string, id: string) => `/api/v1/organizations/${organizationId}/volcanoes/${id}/`,
  },
  listEventType: {
    v1: (organizationId: string) => `/api/v1/organizations/${organizationId}/event-types/`,
  },
  createEventType: {
    v1: (organizationId: string) => `/api/v1/organizations/${organizationId}/event-types/`,
  },
  getEventType: {
    v1: (organizationId: string, id: string) => `/api/v1/organizations/${organizationId}/event-types/${id}/`,
  },
  updateEventType: {
    v1: (organizationId: string, id: string) => `/api/v1/organizations/${organizationId}/event-types/${id}/`,
  },
  deleteEventType: {
    v1: (organizationId: string, id: string) => `/api/v1/organizations/${organizationId}/event-types/${id}/`,
  },
};
