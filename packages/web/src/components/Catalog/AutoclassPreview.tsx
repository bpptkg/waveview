import { Badge, Spinner } from '@fluentui/react-components';
import { AutoclassPreview as Preview } from '../../types/event';
import { score } from './autoclassScore';

const messages: Record<string, string> = {
  disabled: 'Autoclass is not enabled for this catalog.',
  data_unavailable: 'No waveform data for this time; recommendation not available.',
};

export default function AutoclassPreview({ preview }: { preview: Preview }) {
  const result = preview.result;
  const directional = result && ['ROCKFALL', 'AWANPANAS'].includes(result.type_code);
  return (
    <section aria-label="Autoclass recommendation for this time" className="text-sm flex flex-col gap-1 p-2">
      <div><Badge appearance="outline">Autoclass preview</Badge> Not saved; based on the time you are editing</div>
      {preview.state !== 'ok' || !result ? (
        <div role="status">
          {preview.state === 'pending'
            ? <Spinner label={<span className="text-md">Calculating recommendation...</span>} size="extra-tiny" />
            : messages[preview.state] ?? 'Recommendation not available right now. Try again in a moment.'}
        </div>
      ) : <>
        <div>Suggested type: {result.type_code}</div>
        <div>Model score: {score(result.prob_jenis)}</div>
        {directional && <div>Direction: {result.arah || 'Not available'} · Direction score: {score(result.prob_arah)}</div>}
        {result.top3.length ? <div>Candidates: {result.top3.map(row => `${row.type_code} ${score(row.p)}`).join(', ')}</div> : null}
        {result.cek_tektonik && <div>{result.cek_tektonik}</div>}
      </>}
    </section>
  );
}
