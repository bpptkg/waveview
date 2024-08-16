import { formatDate } from '@waveview/charts';
import { useMemo } from 'react';
import { useAppStore } from '../../stores/app';
import { usePickerStore } from '../../stores/picker';

const TimeRangeLabel = () => {
  const { lastTrackExtent } = usePickerStore();
  const { useUTC } = useAppStore();

  const labelFormatted = useMemo(() => {
    const [start, end] = lastTrackExtent;
    return `${formatDate(start, '{yyyy}/{MM}/{dd} {HH}:{mm}:{ss}', useUTC)} - ${formatDate(end, '{HH}:{mm}:{ss}', useUTC)}`;
  }, [lastTrackExtent, useUTC]);

  return <span className="text-xs dark:text-neutral-grey-84">{labelFormatted}</span>;
};

export default TimeRangeLabel;
