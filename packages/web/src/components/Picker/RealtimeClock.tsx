import { formatDate } from '@waveview/charts';
import React, { useEffect, useState } from 'react';

export interface RealtimeClockProps {
  useUTC?: boolean;
}

const RealtimeClock: React.FC<RealtimeClockProps> = (props) => {
  const { useUTC = false } = props;

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

  return <span className="text-sm">{useUTC ? formatUTC(time) : formatLocal(time)}</span>;
};

export default RealtimeClock;
