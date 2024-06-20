import HelicorderChart from '../../components/Chart/HelicorderChart';
import PickerMenu from '../../components/PickerMenu/PickerMenu';
import HelicorderToolbar from '../../components/Toolbar/HelicorderToolbar';

const Picker = () => {
  return (
    <>
      <PickerMenu />
      <HelicorderToolbar />
      <div className="flex-grow relative mt-1">
        <HelicorderChart />
      </div>
    </>
  );
};

export default Picker;
