import HelicorderChart from '../../components/Chart/HelicorderChart';
import PickerMenu from '../../components/PickerMenu/PickerMenu';
import HelicorderToolbar from '../../components/Toolbar/HelicorderToolbar';
import SeismogramChart from '../../components/Chart/SeismogramChart';

const Picker = () => {
  return (
    <>
      <PickerMenu />
      <HelicorderToolbar />
      <div className="flex-grow relative mt-1 flex">
        <div className="relative w-1/3">
          <HelicorderChart />
        </div>
        <div className="relative w-2/3">
          <SeismogramChart />
        </div>
      </div>
    </>
  );
};

export default Picker;
