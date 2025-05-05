import { Tooltip } from '@fluentui/react-components';
import { useMemo } from 'react';
import { formatTimezonedDate } from '../../../shared/time';
import { useAppStore } from '../../../stores/app';
import { usePickerStore } from '../../../stores/picker';

const inSameDay = (date1: number, date2: number) => {
  return new Date(date1).toDateString() === new Date(date2).toDateString();
};

const TimeRangeLabel = () => {
  const { selectionWindow } = usePickerStore();
  const { useUTC } = useAppStore();

  const labelFormatted = useMemo(() => {
    if (!selectionWindow) {
      return '';
    }
    const [start, end] = selectionWindow;
    if (inSameDay(start, end)) {
      return `${formatTimezonedDate(start, 'yyyy/MM/dd HH:mm:ss', useUTC)} - ${formatTimezonedDate(end, 'HH:mm:ss', useUTC)}`;
    } else {
      return `${formatTimezonedDate(start, 'yyyy/MM/dd HH:mm:ss', useUTC)} - ${formatTimezonedDate(end, 'yyyy/MM/dd HH:mm:ss', useUTC)}`;
    }
  }, [selectionWindow, useUTC]);

  return (
    <Tooltip content={`Current time range of seismogram chart: ${labelFormatted}`} relationship="description" showDelay={1500}>
      <span className="text-xs dark:text-neutral-grey-84 px-1">{labelFormatted}</span>
    </Tooltip>
  );
};

export default TimeRangeLabel;
