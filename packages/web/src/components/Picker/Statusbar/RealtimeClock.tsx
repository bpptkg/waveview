import { useEffect, useState } from 'react';
import { useAppStore } from '../../../stores/app';
import { formatTimezonedDate } from '../../../shared/time';

const RealtimeClock = () => {
  const { useUTC } = useAppStore();

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span className="text-xs dark:text-neutral-grey-84 px-1">{formatTimezonedDate(time, 'HH:mm:ss', useUTC)}</span>;
};

export default RealtimeClock;
