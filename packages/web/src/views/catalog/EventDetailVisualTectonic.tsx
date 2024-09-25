import { Tooltip } from '@fluentui/react-components';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import KeyValuePair from '../../components/Common/KeyValuePair';
import { formatNumber } from '../../shared/formatting';
import { SeismicEventDetail } from '../../types/event';
import { TectonicEvent } from '../../types/observation';

export interface EventDetailVisualTectonicProps {
  event: SeismicEventDetail;
}

const EventDetailVisualTectonic: React.FC<EventDetailVisualTectonicProps> = ({ event }) => {
  const observation = event.observation as TectonicEvent;

  const items = [
    { label: 'MMI scale', value: observation.mmi_scale },
    { label: 'Magnitude', value: formatNumber(observation.magnitude) },
    { label: 'Depth', value: formatNumber(observation.depth, { unit: ' km' }) },
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
        <div className="font-semibold">Tectonic Detail</div>
        <div>
          {items.map((item, index) => (
            <KeyValuePair key={index} label={item.label} value={item.value} column={item.column} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventDetailVisualTectonic;
