import { Tooltip } from '@fluentui/react-components';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import { useVisualHook } from '../../hooks/useVisualHook';
import { formatNumber } from '../../shared/formatting';
import { SeismicEventDetail } from '../../types/event';
import { ExplosionEvent } from '../../types/observation';

export interface EventDetailVisualExplosionProps {
  event: SeismicEventDetail;
}

const EventDetailVisualExplosion: React.FC<EventDetailVisualExplosionProps> = ({ event }) => {
  const { getObservationFormLabel, getEmissionColorLabel } = useVisualHook();
  const observation = event.observation as ExplosionEvent;
  return (
    <div className="p-2 flex flex-col gap-2 mr-2">
      <div className="flex flex-col gap-2">
        <div className="font-semibold">Explosion Detail</div>
        <div>
          <div className="flex items-center justify-between">
            <div>Observation form</div>
            <div>{getObservationFormLabel(observation.observation_form)}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>Column height</div>
            <div>{formatNumber(observation.column_height, { unit: ' m' })}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>Color</div>
            <div>{getEmissionColorLabel(observation.color)}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>Intensity</div>
            <div>{formatNumber(observation.intensity, { unit: ' kt' })}</div>
          </div>
          <div className="flex items-center justify-between">
            <div>VEI</div>
            <div>{observation.vei}</div>
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

export default EventDetailVisualExplosion;
