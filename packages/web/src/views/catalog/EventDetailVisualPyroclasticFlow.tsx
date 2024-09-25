import { Tooltip } from '@fluentui/react-components';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import KeyValuePair from '../../components/Common/KeyValuePair';
import { useVisualHook } from '../../hooks/useVisualHook';
import { formatNumber } from '../../shared/formatting';
import { SeismicEventDetail } from '../../types/event';
import { PyroclasticFlowEvent } from '../../types/observation';

export interface EventDetailVisualPyroclasticFlowProps {
  event: SeismicEventDetail;
}

const EventDetailVisualPyroclasticFlow: React.FC<EventDetailVisualPyroclasticFlowProps> = ({ event }) => {
  const { getObservationFormLabel, getEventSizeLabel } = useVisualHook();
  const observation = event.observation as PyroclasticFlowEvent;

  const items = [
    { label: 'Is lava flow', value: observation.is_lava_flow ? 'yes' : 'no' },
    { label: 'Observation form', value: getObservationFormLabel(observation.observation_form) },
    { label: 'Event size', value: getEventSizeLabel(observation.event_size) },
    { label: 'Runout distance', value: formatNumber(observation.runout_distance, { unit: ' m' }) },
    { label: 'Fall direction', value: observation.fall_direction?.name },
    { label: 'Amplitude', value: formatNumber(observation.amplitude, { unit: ' mm' }) },
    { label: 'Duration', value: formatNumber(observation.duration, { unit: ' s' }) },
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
        <div className="font-semibold">Pyroclastic Flow Detail</div>
        <div>
          {items.map((item, index) => (
            <KeyValuePair key={index} label={item.label} value={item.value} column={item.column} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventDetailVisualPyroclasticFlow;
