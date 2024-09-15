import { useMemo } from 'react';
import { useEventTypeStore } from '../../../../stores/eventType';
import { usePickerStore } from '../../../../stores/picker';
import VisualExplosionEvent from './VisualExplosionEvent';
import VisualPyroclasticFlowEvent from './VisualPyroclasticFlowEvent';
import VisualRockfallEvent from './VisualRockfallEvent';
import VisualTectonicEvent from './VisualTectonicEvent';
import VisualVolcanicEmissionEvent from './VisualVolcanicEmissionEvent';

const PickEditVisual = () => {
  const { eventTypeId } = usePickerStore();
  const { eventTypes } = useEventTypeStore();

  const observationType = useMemo(() => {
    return eventTypes.find((et) => et.id === eventTypeId)?.observation_type;
  }, [eventTypeId, eventTypes]);

  switch (observationType) {
    case 'explosion':
      return <VisualExplosionEvent />;
    case 'pyroclastic_flow':
      return <VisualPyroclasticFlowEvent />;
    case 'rockfall':
      return <VisualRockfallEvent />;
    case 'tectonic':
      return <VisualTectonicEvent />;
    case 'volcanic_emission':
      return <VisualVolcanicEmissionEvent />;
    default:
      return <div className="p-2">Not available</div>;
  }
};

export default PickEditVisual;
