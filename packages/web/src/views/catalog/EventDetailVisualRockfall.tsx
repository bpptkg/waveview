import { Tooltip } from '@fluentui/react-components';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import { useVisualHook } from '../../hooks/useVisualHook';
import { formatNumber } from '../../shared/formatting';
import { SeismicEventDetail } from '../../types/event';
import { RockfallEvent } from '../../types/observation';

export interface EventDetailVisualRockfallProps {
  event: SeismicEventDetail;
}

const EventDetailVisualRockfall: React.FC<EventDetailVisualRockfallProps> = ({ event }) => {
  const { getObservationFormLabel, getEventSizeLabel } = useVisualHook();
  const observation = event.observation as RockfallEvent;
  return (
    <div className="p-2 flex flex-col gap-2 mr-2">
      <div className="flex flex-col gap-2">
        <div className="font-semibold">Rockfall Detail</div>
        <div>
          <div className="flex items-center justify-between">
            <div>Is lava flow</div>
            <div>{observation.is_lava_flow ? 'yes' : 'no'}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>Observation form</div>
            <div>{getObservationFormLabel(observation.observation_form)}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>Event size</div>
            <div>{getEventSizeLabel(observation.event_size)}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>Runout distance</div>
            <div>{formatNumber(observation.runout_distance, { unit: ' m' })}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>Fall direction</div>
            <div>{observation.fall_direction?.name}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>Amplitude</div>
            <div>{formatNumber(observation.amplitude, { unit: ' mm' })}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>Duration</div>
            <div>{formatNumber(observation.duration, { unit: ' s' })}</div>
          </div>
          <div className="flex flex-col">
            <div>Note</div>
            <div>{observation.note}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>Last updated</div>
            <div>
              <Tooltip content={observation.updated_at} relationship="label">
                <span>{formatDistanceToNow(new Date(observation.updated_at), { addSuffix: true })}</span>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailVisualRockfall;
