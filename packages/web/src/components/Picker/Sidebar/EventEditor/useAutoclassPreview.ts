import { useEffect, useState } from 'react';
import { api } from '../../../../services/api';
import apiVersion from '../../../../services/apiVersion';
import { useCatalogStore } from '../../../../stores/catalog';
import { useOrganizationStore } from '../../../../stores/organization';
import { useVolcanoStore } from '../../../../stores/volcano/useVolcanoStore';
import { AutoclassPreview } from '../../../../types/event';

const DEBOUNCE_MS = 1000;
const POLL_MS = 2000;
const MAX_POLLS = 60;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Returns the server's preview for `time` once it answers, or null while it is still unknown.
// The event is never written: the preview is only a suggestion for the draft time.
export default function useAutoclassPreview(eventId: string | undefined, time: number, active: boolean): AutoclassPreview | null {
  const [answer, setAnswer] = useState<{ time: number; preview: AutoclassPreview } | null>(null);

  useEffect(() => {
    if (!eventId || !active) return;
    const organization = useOrganizationStore.getState().currentOrganization;
    const volcano = useVolcanoStore.getState().currentVolcano;
    const catalog = useCatalogStore.getState().currentCatalog;
    if (!organization || !volcano || !catalog) return;

    const url = apiVersion.autoclassPreviewEvent.v1(organization.id, volcano.id, catalog.id, eventId);
    const iso = new Date(time).toISOString();
    let cancelled = false;

    const run = async () => {
      const start = await api(url, { method: 'POST', body: { time: iso } });
      if (!start.ok) throw new Error(`autoclass preview start failed: ${start.status}`);
      let preview: AutoclassPreview = await start.json();
      for (let i = 0; preview.state === 'pending' && i < MAX_POLLS; i++) {
        await wait(POLL_MS);
        if (cancelled) return;
        const poll = await api(url, { params: { time: iso } });
        if (!poll.ok) break;
        preview = await poll.json();
      }
      if (preview.state === 'pending') preview = { state: 'unavailable' };
      if (!cancelled) setAnswer({ time, preview });
    };

    const timer = setTimeout(() => {
      run().catch(() => {
        if (!cancelled) setAnswer({ time, preview: { state: 'unavailable' } });
      });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [eventId, time, active]);

  return answer?.time === time ? answer.preview : null;
}
