import HelicorderChannel from './HelicorderChannel';
import HelicorderFilterStatus from './HelicorderFilterStatus';
import LoadingIndicator from './LoadingIndicator';
import RealtimeClock from './RealtimeClock';
import SeismogramFilterStatus from './SeismogramFilterStatus';
import TimeRangeLabel from './TimeRangeLabel';
import TimeZoneSelector from './TimezoneSelector';

const Statusbar = () => {
  return (
    <div className="bg-white dark:bg-black relative flex items-center justify-between gap-2 px-2 h-[20px] border-t dark:border-t-gray-800">
      <div className="flex gap-2 items-center">
        <HelicorderChannel />
        <HelicorderFilterStatus />
        <TimeRangeLabel />
        <SeismogramFilterStatus />
        <LoadingIndicator />
      </div>
      <div className="flex gap-2 items-center">
        <RealtimeClock />
        <TimeZoneSelector />
      </div>
    </div>
  );
};

export default Statusbar;
