import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { EventType } from '../../types/event';
import { CustomError } from '../../types/response';
import { useOrganizationStore } from '../organization';
import { EventTypeStore } from './types';

const eventTypeStore = create<EventTypeStore>((set) => ({
  eventTypes: [],
  fetchEventTypes: async () => {
    const currentOrganization = useOrganizationStore.getState().currentOrganization;
    if (!currentOrganization) {
      return;
    }

    const response = await api(apiVersion.listEventType.v1(currentOrganization.id));
    if (!response.ok) {
      throw CustomError.fromErrorData(await response.json());
    }
    const data: EventType[] = await response.json();
    data.sort((a, b) => a.code.localeCompare(b.code));
    set({ eventTypes: data });
  },
}));

export const useEventTypeStore = createSelectors(eventTypeStore);
