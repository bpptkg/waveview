import { useStatusBarStore } from '../../../stores/statusbar/useStatusBarStore';
import EventsPanel from './EventsPanel';
import HelicorderChannel from './HelicorderChannel';
import HelicorderFilterStatus from './HelicorderFilterStatus';
import RealtimeClock from './RealtimeClock';
import SeismogramFilterStatus from './SeismogramFilterStatus';
import TimeRangeLabel from './TimeRangeLabel';
import TimeZoneSelector from './TimezoneSelector';

const Statusbar = () => {
  const { message } = useStatusBarStore();
  return (
    <div className="bg-white dark:bg-black relative flex items-center justify-between gap-2 h-[20px] border-t dark:border-t-gray-800">
      <div className="flex items-center gap-2">
        <HelicorderChannel />
        <EventsPanel />
        <HelicorderFilterStatus />
        <SeismogramFilterStatus />
        <TimeRangeLabel />
        <>{message}</>
      </div>
      <div className="flex items-center gap-2">
        <RealtimeClock />
        <TimeZoneSelector />
      </div>
    </div>
  );
};

export default Statusbar;
