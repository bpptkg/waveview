import { useMemo } from 'react';
import { Switch } from '@fluentui/react-components';
import { useEventTypeStore } from '../../../../stores/eventType';
import { usePickerStore } from '../../../../stores/picker';
import VisualExplosionEvent from './VisualExplosionEvent';
import VisualPyroclasticFlowEvent from './VisualPyroclasticFlowEvent';
import VisualRockfallEvent from './VisualRockfallEvent';
import VisualTectonicEvent from './VisualTectonicEvent';
import VisualVolcanicEmissionEvent from './VisualVolcanicEmissionEvent';

const PickEditVisual = () => {
  const { eventTypeId, editedEvent, includeObservation, setIncludeObservation } = usePickerStore();
  const { eventTypes } = useEventTypeStore();

  const observationType = useMemo(() => {
    return eventTypes.find((et) => et.id === eventTypeId)?.observation_type;
  }, [eventTypeId, eventTypes]);

  const component = useMemo(() => {
    if (observationType === 'explosion') {
      return <VisualExplosionEvent />;
    } else if (observationType === 'pyroclastic_flow') {
      return <VisualPyroclasticFlowEvent />;
    } else if (observationType === 'rockfall') {
      return <VisualRockfallEvent />;
    } else if (observationType === 'tectonic') {
      return <VisualTectonicEvent />;
    } else if (observationType === 'volcanic_emission') {
      return <VisualVolcanicEmissionEvent />;
    } else {
      return <div>Visual not available</div>;
    }
  }, [observationType]);

  return (
    <div className="p-2">
      <div className="h-[32px] font-semibold">Visual</div>
      {editedEvent?.autoclass && <Switch label="Include visual observation" checked={includeObservation}
        onChange={(_, data) => setIncludeObservation(data.checked)} />}
      {includeObservation ? component : <div>Seismic classification can be validated without a visual observation. Existing observations are preserved.</div>}
    </div>
  );
};

export default PickEditVisual;
