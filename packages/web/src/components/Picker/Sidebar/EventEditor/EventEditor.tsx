import { usePickerStore } from '../../../../stores/picker';
import PickActivate from './PickActivate';
import PickEdit from './PickEdit';
import PickGuide from './PickGuide';

const EventEditor = () => {
  const { isPickEmpty, pickMode } = usePickerStore();

  if (pickMode) {
    return isPickEmpty() ? <PickGuide /> : <PickEdit />;
  } else {
    return <PickActivate />;
  }
};

export default EventEditor;
