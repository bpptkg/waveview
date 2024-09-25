import { Tooltip } from '@fluentui/react-components';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import KeyValuePair from '../../components/Common/KeyValuePair';
import { useVisualHook } from '../../hooks/useVisualHook';
import { formatNumber } from '../../shared/formatting';
import { SeismicEventDetail } from '../../types/event';
import { VolcanicEmissionEvent } from '../../types/observation';

export interface EventDetailVisualVolcanicEmissionProps {
  event: SeismicEventDetail;
}

const EventDetailVisualVolcanicEmission: React.FC<EventDetailVisualVolcanicEmissionProps> = ({ event }) => {
  const { getObservationFormLabel, getEmissionColorLabel } = useVisualHook();
  const observation = event.observation as VolcanicEmissionEvent;

  const items = [
    { label: 'Observation form', value: getObservationFormLabel(observation.observation_form) },
    { label: 'Height', value: formatNumber(observation.height, { unit: ' m' }) },
    { label: 'Color', value: getEmissionColorLabel(observation.color) },
    { label: 'Intensity', value: formatNumber(observation.intensity, { unit: ' ppm' }) },
    { label: 'Note', value: observation.note, column: true },
    {
      label: 'Last updated',
      value: (
        <Tooltip content={observation.updated_at} relationship="label">
          <span>{formatDistanceToNow(new Date(observation.updated_at), { addSuffix: true })}</span>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="p-2 flex flex-col gap-2 mr-2">
      <div className="flex flex-col gap-2">
        <div className="font-semibold">Degassing Detail</div>
        <div>
          {items.map((item, index) => (
            <KeyValuePair key={index} label={item.label} value={item.value} column={item.column} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventDetailVisualVolcanicEmission;
