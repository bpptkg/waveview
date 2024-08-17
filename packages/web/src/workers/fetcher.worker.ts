import { baseUrl } from '../services/api';
import apiVersion from '../services/apiVersion';
import { debounce } from '../shared/debounce';
import { SeismicEvent } from '../types/event';
import { EventRequestData, EventResponseData } from '../types/fetcher';

const fetchEvents = async (payload: EventRequestData) => {
  const { organizationId, catalogId, start, end } = payload;
  const url = `${baseUrl}${apiVersion.listEvent.v1(organizationId, catalogId)}?start=${start}&end=${end}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${payload.accessToken}`,
    },
  });
  const data: SeismicEvent[] = await response.json();
  const msg: EventResponseData = {
    requestId: payload.requestId,
    events: data,
  };
  self.postMessage(msg);
};

const fetchDebounced = debounce((payload: EventRequestData) => {
  fetchEvents(payload);
}, 1000);

self.addEventListener('message', (event: MessageEvent<EventRequestData>) => {
  fetchDebounced(event.data);
});
