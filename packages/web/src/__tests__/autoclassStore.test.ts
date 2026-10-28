import { usePickerStore } from '../stores/picker';
import { SeismicEventDetail } from '../types/event';
import * as transport from '../services/api';
import { useOrganizationStore } from '../stores/organization';
import { useVolcanoStore } from '../stores/volcano/useVolcanoStore';
import { useCatalogStore } from '../stores/catalog';
import { useEventTypeStore } from '../stores/eventType';
import { Organization } from '../types/organization';
import { Volcano } from '../types/volcano';
import { Catalog } from '../types/catalog';

const event: SeismicEventDetail = { id: 'event', type: { id: 'auto', code: 'AUTO',
  organization_id:'org',name:'Automatic',description:'',color:'',color_light:'',color_dark:'',
  created_at:0,updated_at:0,observation_type:'rockfall' },
  time: '2026-10-26T03:00:00Z', duration: 35, note: '', station_of_first_arrival_id: 'sta',
  autoclass: { state: 'pending' }, amplitudes: [], attachments: [], observation: null,
  catalog_id:'catalog',type_certainty:'known',method:'stelte',evaluation_mode:'automatic',
  evaluation_status:'preliminary',created_at:'',updated_at:'',author:{} as SeismicEventDetail['author'],
  collaborators:[],origins:[],magnitudes:[],preferred_origin:null,preferred_magnitude:null,
  preferred_amplitude:null,is_bookmarked:false,
};

test('remote prediction refreshes metadata and preserves an unsaved operator draft', () => {
  usePickerStore.setState({ editedEvent: event, eventTypeId: 'manual-type', note: 'unsaved note',
    time: Date.parse(event.time), duration: 35, stationOfFirstArrivalId: 'sta' });
  usePickerStore.getState().applyEventUpdate({ ...event, autoclass: { state: 'succeeded', result: { jenis: 'VTB' } } });
  const state = usePickerStore.getState();
  expect(state.note).toBe('unsaved note');
  expect(state.eventTypeId).toBe('manual-type');
  expect(state.editedEvent?.autoclass?.result?.jenis).toBe('VTB');
  expect(state.remoteUpdate).toBe(true);
});

test('clean editor follows the new event type', () => {
  usePickerStore.setState({ editedEvent: event, eventTypeId: 'auto', note: '',
    time: Date.parse(event.time), duration: 35, stationOfFirstArrivalId: 'sta' });
  usePickerStore.getState().applyEventUpdate({ ...event, type: { ...event.type, id: 'vtb', code: 'VTB' } });
  expect(usePickerStore.getState().eventTypeId).toBe('vtb');
});

test('pilot event without actual visual observation defaults to seismic-only editing', () => {
  usePickerStore.getState().setEditedEvent(event);
  expect(usePickerStore.getState().includeObservation).toBe(false);
});

test('seismic-only save sends no default visual observation', async () => {
  useOrganizationStore.setState({ currentOrganization: { id: 'org' } as Organization });
  useVolcanoStore.setState({ currentVolcano: { id: 'volcano' } as Volcano });
  useCatalogStore.setState({ currentCatalog: { id: 'catalog' } as Catalog });
  useEventTypeStore.setState({ eventTypes: [event.type] });
  usePickerStore.getState().setEditedEvent(event);
  let observation: unknown = 'not called';
  const request = jest.spyOn(transport, 'api').mockImplementation(async (_url, options) => {
    observation = options?.body.observation;
    return { ok: true, json: async () => event } as Response;
  });
  try {
    await usePickerStore.getState().savePickedEvent();
    expect(observation).toBeNull();
  } finally {
    request.mockRestore();
  }
});
