import { act, render, screen, waitFor } from '@testing-library/react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import AutoclassResult from '../components/Catalog/AutoclassResult';
import NotificationPanel from '../components/Header/NotificationPanel';
import { WebSocketContext } from '../components/WebSocket/WebSocketContext';
import { useEventDetailStore } from '../stores/eventDetail';
import { usePickerStore } from '../stores/picker';
import { SeismicEventDetail } from '../types/event';
import * as transport from '../services/api';
import { useOrganizationStore } from '../stores/organization';
import { useVolcanoStore } from '../stores/volcano/useVolcanoStore';
import { useCatalogStore } from '../stores/catalog';
import { Organization } from '../types/organization';
import { Volcano } from '../types/volcano';
import { Catalog } from '../types/catalog';

const event: SeismicEventDetail = {
  id: 'event', type: { id: 'auto', code: 'AUTO', organization_id: 'org', name: 'Automatic',
    description: '', color: '', color_light: '', color_dark: '', created_at: 0, updated_at: 0, observation_type: 'rockfall' },
  time: '2026-10-26T03:00:00Z', duration: 35, note: '', station_of_first_arrival_id: 'sta',
  autoclass: { state: 'pending' }, attachments: [], amplitudes: [], observation: null,
  updated_at: '2026-10-26T03:00:00Z', author: { id: 'author', username: 'Detector', name: 'Detector', avatar: '' },
  catalog_id: 'catalog', type_certainty: 'known', method: 'stelte', evaluation_mode: 'automatic',
  evaluation_status: 'preliminary', created_at: '2026-10-26T03:00:00Z', collaborators: [],
  origins: [], magnitudes: [], preferred_origin: null, preferred_magnitude: null,
  preferred_amplitude: null, is_bookmarked: false,
};

const DetailPrediction = () => <AutoclassResult value={useEventDetailStore().event?.autoclass} />;

beforeEach(() => {
  useEventDetailStore.getState().clearCache();
  useEventDetailStore.getState().setEvent(event);
  usePickerStore.setState({ editedEvent: event, eventTypeId: 'manual', note: 'unsaved',
    time: Date.parse(event.time), duration: 35, stationOfFirstArrivalId: 'sta',
    fetchEventMarkers: jest.fn().mockResolvedValue(undefined), getHelicorderExtent: () => [0, 1] });
});

test('event notification refreshes the open catalog detail and preserves the picker draft', () => {
  const socket = new EventTarget();
  render(<WebSocketContext.Provider value={socket as unknown as ReconnectingWebSocket}>
    <NotificationPanel /><DetailPrediction />
  </WebSocketContext.Provider>);
  const prediction = { ...event, type: { ...event.type, id: 'vtb', code: 'VTB' },
    autoclass: { state: 'succeeded', result: { jenis: 'VTB', prob_jenis: 0.95 } } };
  act(() => socket.dispatchEvent(new MessageEvent('message', { data: JSON.stringify({
    type: 'notify', data: { type: 'event_update', title: 'Updated', body: '', dirty: true,
      data: { event: prediction, actor: event.author, catalog_name: 'Merapi' } },
  }) })));
  expect(screen.getByText(/Model score: 95%/)).toBeInTheDocument();
  expect(useEventDetailStore.getState().event?.attachments).toEqual([]);
  expect(usePickerStore.getState().note).toBe('unsaved');
  expect(usePickerStore.getState().eventTypeId).toBe('manual');
});

test('reconnect refetches the active catalog detail without using its old cache', async () => {
  const socket = new EventTarget();
  useOrganizationStore.setState({ currentOrganization: { id: 'org' } as Organization });
  useVolcanoStore.setState({ currentVolcano: { id: 'volcano' } as Volcano });
  useCatalogStore.setState({ currentCatalog: { id: 'catalog' } as Catalog });
  const request = jest.spyOn(transport, 'api').mockResolvedValue({ status: 200, json: async () => event } as Response);
  const fetchEdited = jest.spyOn(usePickerStore.getState(), 'fetchEditedEvent').mockResolvedValue(event);
  try {
    await useEventDetailStore.getState().fetchEvent(event.id, { clearCache: true });
    request.mockResolvedValue({ status: 200, json: async () => ({ ...event,
      autoclass: { state: 'succeeded', result: { jenis: 'MP', prob_jenis: 0.97 } },
    }) } as Response);
    render(<WebSocketContext.Provider value={socket as unknown as ReconnectingWebSocket}>
      <NotificationPanel /><DetailPrediction />
    </WebSocketContext.Provider>);
    act(() => socket.dispatchEvent(new Event('open')));
    await waitFor(() => expect(screen.getByText(/Model score: 97%/)).toBeInTheDocument());
  } finally {
    request.mockRestore();
    fetchEdited.mockRestore();
  }
});
