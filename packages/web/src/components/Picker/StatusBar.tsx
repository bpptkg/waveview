import RealtimeClock from './RealtimeClock';
import TimeRangeLabel from './TimeRangeLabel';
import TimeZoneSelector from './TimezoneSelector';

const StatusBar = () => {
  return (
    <div className="bg-white dark:bg-black relative flex items-center justify-between gap-2 px-2 h-[20px]">
      <div>
        <TimeRangeLabel />
      </div>
      <div>
        <RealtimeClock />
        <TimeZoneSelector />
      </div>
    </div>
  );
};

export default StatusBar;
