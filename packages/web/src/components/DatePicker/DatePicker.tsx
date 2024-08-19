import { Calendar } from '@fluentui/react-calendar-compat';
import { Input, Popover, PopoverSurface, PopoverTrigger } from '@fluentui/react-components';
import { CalendarRegular } from '@fluentui/react-icons';
import { format } from 'date-fns';
import React, { useCallback, useState } from 'react';
import { today } from './utils';

export interface DatePickerProps {
  selected?: Date;
  dateFormat?: string;
  onChange?: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = (props) => {
  const { selected = today(), dateFormat = 'EEE MMM dd yyyy', onChange } = props;

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(selected);

  const handleSelectDate = useCallback(
    (date: Date) => {
      setDate(date);
      onChange?.(date);
      setOpen(false);
    },
    [onChange]
  );

  return (
    <Popover trapFocus open={open} onOpenChange={() => setOpen(!open)}>
      <PopoverTrigger disableButtonEnhancement>
        <Input value={format(date, dateFormat)} aria-label="Select a Date" contentAfter={<CalendarRegular fontSize={20} />} readOnly />
      </PopoverTrigger>
      <PopoverSurface>
        <Calendar value={date} onSelectDate={handleSelectDate} />
      </PopoverSurface>
    </Popover>
  );
};

export default DatePicker;
