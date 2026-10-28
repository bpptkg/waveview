import { Badge } from '@fluentui/react-components';
import { AutoclassData } from '../../types/event';

const states: Record<string, string> = {
  pending: 'Waiting for waveform data', running: 'Classifying waveform',
  retrying: 'Data or service unavailable; retry scheduled', failed: 'Classification failed; manual review is available',
  skipped: 'Automatic classification skipped', stale: 'Prediction is for a different event time or model revision',
  succeeded: 'Prediction available',
};

const score = (value?: number | null) => value == null ? 'Not available' : `${Math.round(value * 100)}%`;

export default function AutoclassResult({ value, time }: { value?: AutoclassData | null; time?: number }) {
  if (!value) return null;
  const result = value.result;
  const stale = value.state === 'stale' || (time != null && value.input_time != null && Date.parse(value.input_time) !== time);
  const warnings = [...new Set([...(result?.saran || []), result?.catatan, result?.cek_tektonik?.saran].filter(Boolean))];
  return (
    <section aria-label="Autoclass prediction" className="text-sm flex flex-col gap-1 p-2">
      <div><Badge appearance="outline">Autoclass</Badge> {states[value.state] || value.state}</div>
      {stale && <div role="status">This prediction belongs to a different event time or model revision. Review before using it.</div>}
      {result && <>
        <div>Model type: {result.jenis}</div>
        <div>Model score: {score(result.prob_jenis)}</div>
        {result.kelas?.startsWith('APRF') && <div>Combined label: {result.kelas} (original: {result.kelas_10 || result.jenis})</div>}
        {['RF', 'APG'].includes(result.jenis) && <>
          <div>Direction: {result.arah || 'Not available'} · Direction score: {score(result.prob_arah)}</div>
          {result.arah_sumber && <div>Direction source: {result.arah_sumber}</div>}
        </>}
        {result.top3?.length ? <div>Candidates: {result.top3.map(row => `${row.kelas} ${score(row.p)}`).join(', ')}</div> : null}
        {result.tanda_awan_panas && <div role="status">Possible pyroclastic flow — requires operator verification.</div>}
        {warnings.map(warning => <div key={warning}>{warning}</div>)}
        <details><summary>Model and processing details</summary>
          <div>Model: {result.model} · Package: {result.versi}</div>
          <div>Input time: {value.input_time} · Detector: {value.source}</div>
          {['RF', 'APG'].includes(result.jenis) && <div>Model direction: {result.arah_model || 'Not available'}</div>}
          <div>Processed at (UTC): {result.diproses_utc || 'Not available'}</div>
          {value.applied === false && <div>Kept for comparison; the operator decision is unchanged.</div>}
        </details>
      </>}
      {value.sync && ['pending', 'retrying', 'failed'].includes(value.sync.state) && <div>BMA synchronization: {value.sync.state}</div>}
    </section>
  );
}
