import { act, renderHook } from '@testing-library/react';
import useAutoclassPreview from '../components/Picker/Sidebar/EventEditor/useAutoclassPreview';
import { api } from '../services/api';

jest.mock('../services/api', () => ({ api: jest.fn() }));
jest.mock('../stores/organization', () => ({
  useOrganizationStore: { getState: () => ({ currentOrganization: { id: 'org' } }) },
}));
jest.mock('../stores/volcano/useVolcanoStore', () => ({
  useVolcanoStore: { getState: () => ({ currentVolcano: { id: 'vol' } }) },
}));
jest.mock('../stores/catalog', () => ({
  useCatalogStore: { getState: () => ({ currentCatalog: { id: 'cat' } }) },
}));

const mockApi = api as jest.MockedFunction<typeof api>;
const respond = (status: number, body: unknown) =>
  ({ ok: status < 300, status, json: async () => body }) as Response;

describe('useAutoclassPreview', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockApi.mockReset();
  });
  afterEach(() => jest.useRealTimers());

  test('posts the draft time once, then polls until the result is ready', async () => {
    mockApi
      .mockResolvedValueOnce(respond(202, { state: 'pending' }))
      .mockResolvedValueOnce(respond(200, { state: 'ok', result: { type_code: 'VTB', top3: [] } }));
    const time = Date.parse('2026-10-27T01:00:00Z');
    const { result } = renderHook(() => useAutoclassPreview('ev', time, true));

    expect(result.current).toBeNull();
    await act(async () => { jest.advanceTimersByTime(1000); });
    expect(mockApi).toHaveBeenNthCalledWith(1, expect.stringContaining('/events/ev/autoclass-preview/'),
      { method: 'POST', body: { time: '2026-10-27T01:00:00.000Z' } });

    await act(async () => { jest.advanceTimersByTime(2000); });
    expect(mockApi).toHaveBeenNthCalledWith(2, expect.stringContaining('/events/ev/autoclass-preview/'),
      { params: { time: '2026-10-27T01:00:00.000Z' } });
    expect(result.current).toEqual({ state: 'ok', result: { type_code: 'VTB', top3: [] } });
  });

  test('does not call the server while the time equals the saved time', async () => {
    const time = Date.parse('2026-10-27T01:00:00Z');
    renderHook(() => useAutoclassPreview('ev', time, false));
    await act(async () => { jest.advanceTimersByTime(5000); });
    expect(mockApi).not.toHaveBeenCalled();
  });

  test('reports unavailable when the server never finishes', async () => {
    mockApi.mockResolvedValue(respond(202, { state: 'pending' }));
    const time = Date.parse('2026-10-27T01:00:00Z');
    const { result } = renderHook(() => useAutoclassPreview('ev', time, true));

    await act(async () => { jest.advanceTimersByTime(1000); });
    for (let i = 0; i < 60; i++) {
      await act(async () => { jest.advanceTimersByTime(2000); });
    }

    expect(result.current).toEqual({ state: 'unavailable' });
  });
});
