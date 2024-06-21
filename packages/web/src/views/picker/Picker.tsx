import HelicorderWorkspace from '../../components/Picker/HelicorderWorkspace';
import PickerMenu from '../../components/Picker/PickerMenu/PickerMenu';
import SeismogramWorkspace from '../../components/Picker/SeismogramWorkspace';
import { usePickerStore } from '../../stores/picker';

const Picker = () => {
  const pickerStore = usePickerStore();
  const { workspace } = pickerStore;

  return (
    <>
      <PickerMenu />
      {workspace === 'seismogram' && <SeismogramWorkspace />}
      {workspace === 'helicorder' && <HelicorderWorkspace />}
    </>
  );
};

export default Picker;
