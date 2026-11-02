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
// Works for new picks and edits alike; nothing is written, the result is only a suggestion.
export default function useAutoclassPreview(time: number, active: boolean): AutoclassPreview | null {
  const [answer, setAnswer] = useState<{ time: number; preview: AutoclassPreview } | null>(null);

  useEffect(() => {
    if (!active) return;
    const organization = useOrganizationStore.getState().currentOrganization;
    const volcano = useVolcanoStore.getState().currentVolcano;
    const catalog = useCatalogStore.getState().currentCatalog;
    if (!organization || !volcano || !catalog) return;

    const url = apiVersion.autoclassPreviewCatalog.v1(organization.id, volcano.id, catalog.id);
    // The model works in whole seconds; rounding keeps repeated drags on the same cache entry.
    const iso = new Date(Math.floor(time / 1000) * 1000).toISOString();
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
  }, [time, active]);

  return answer?.time === time ? answer.preview : null;
}
