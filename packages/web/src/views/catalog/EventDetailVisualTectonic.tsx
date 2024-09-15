import { Tooltip } from '@fluentui/react-components';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import { formatNumber } from '../../shared/formatting';
import { SeismicEventDetail } from '../../types/event';
import { TectonicEvent } from '../../types/observation';

export interface EventDetailVisualTectonicProps {
  event: SeismicEventDetail;
}

const EventDetailVisualTectonic: React.FC<EventDetailVisualTectonicProps> = ({ event }) => {
  const observation = event.observation as TectonicEvent;
  return (
    <div className="p-2 flex flex-col gap-2 mr-2">
      <div className="flex flex-col gap-2">
        <div className="font-semibold">Tectonic Detail</div>
        <div>
          <div className="flex items-center justify-between">
            <div>MMI scale</div>
            <div>{observation.mmi_scale}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>Magnitude</div>
            <div>{formatNumber(observation.magnitude)}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>Depth</div>
            <div>{formatNumber(observation.depth, { unit: ' km' })}</div>
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

export default EventDetailVisualTectonic;
