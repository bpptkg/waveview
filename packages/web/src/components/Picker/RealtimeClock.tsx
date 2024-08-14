import { formatDate } from '@waveview/charts';
import { useEffect, useState } from 'react';
import { useAppStore } from '../../stores/app';

const RealtimeClock = () => {
  const { useUTC } = useAppStore();

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUTC = (date: Date) => {
    return formatDate(date, '{HH}:{mm}:{ss}', true);
  };

  const formatLocal = (date: Date) => {
    return formatDate(date, '{HH}:{mm}:{ss}', false);
  };

  return <span className="text-xs dark:text-neutral-grey-84">{useUTC ? formatUTC(time) : formatLocal(time)}</span>;
};

export default RealtimeClock;
