import { formatDate } from '@waveview/charts';
import { useEffect, useState } from 'react';
import { usePickerStore } from '../../stores/picker';

const RealtimeClock = () => {
  const { useUTC } = usePickerStore();

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

  return <span className="text-xs">{useUTC ? formatUTC(time) : formatLocal(time)}</span>;
};

export default RealtimeClock;
