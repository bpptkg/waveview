import FilterStatus from './FilterStatus';
import RealtimeClock from './RealtimeClock';
import TimeRangeLabel from './TimeRangeLabel';
import TimeZoneSelector from './TimezoneSelector';

const Statusbar = () => {
  return (
    <div className="bg-white dark:bg-black relative flex items-center justify-between gap-2 px-2 h-[20px] border-t dark:border-transparent">
      <div className="flex gap-1 items-center">
        <TimeRangeLabel />
        <FilterStatus />
      </div>
      <div className="flex gap-1 items-center">
        <RealtimeClock />
        <TimeZoneSelector />
      </div>
    </div>
  );
};

export default Statusbar;
