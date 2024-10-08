import { Calendar } from '@fluentui/react-calendar-compat';
import { Input, Popover, PopoverSurface, PopoverTrigger } from '@fluentui/react-components';
import { CalendarRegular } from '@fluentui/react-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { formatTimezonedDate } from '../../shared/time';
import { useAppStore } from '../../stores/app';
import { today } from './utils';

export interface DatePickerProps {
  selected?: number;
  dateFormat?: string;
  onChange?: (date: number) => void;
}

const DatePicker: React.FC<DatePickerProps> = (props) => {
  const { selected, dateFormat = 'EEE MMM dd yyyy', onChange } = props;

  const { useUTC } = useAppStore();

  const [open, setOpen] = useState<boolean>(false);
  const [date, setDate] = useState<number | undefined>(selected);

  const handleSelectDate = useCallback(
    (date: Date) => {
      const epoch = useUTC ? Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) : date.getTime();
      setDate(epoch);
      onChange?.(epoch);
      setOpen(false);
    },
    [useUTC, onChange]
  );

  useEffect(() => {
    setDate(selected);
  }, [selected]);

  return (
    <Popover trapFocus open={open} onOpenChange={() => setOpen(!open)}>
      <PopoverTrigger disableButtonEnhancement>
        <Input
          value={date ? formatTimezonedDate(date, dateFormat, useUTC) : ''}
          aria-label="Select a Date"
          contentAfter={<CalendarRegular fontSize={20} />}
          readOnly
        />
      </PopoverTrigger>
      <PopoverSurface>
        <Calendar value={date ? new Date(date) : new Date(today())} onSelectDate={handleSelectDate} />
      </PopoverSurface>
    </Popover>
  );
};

export default DatePicker;
