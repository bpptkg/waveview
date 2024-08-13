import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { EventType } from '../../types/event';
import { useOrganizationStore } from '../organization';
import { EventTypeStore } from './types';

const eventTypeStore = create<EventTypeStore>((set) => ({
  eventTypes: [],
  fetchEventTypes: async () => {
    const currentOrganization = useOrganizationStore.getState().currentOrganization;
    if (!currentOrganization) {
      return;
    }

    const data = await api<EventType[]>(apiVersion.listEventType.v1(currentOrganization.id));
    set({ eventTypes: data });
  },
}));

export const useEventTypeStore = createSelectors(eventTypeStore);