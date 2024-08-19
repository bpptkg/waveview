import { Button, Label, Popover, PopoverSurface, PopoverTrigger, Select } from '@fluentui/react-components';
import { CalendarRegular } from '@fluentui/react-icons';
import { sub } from 'date-fns';
import React, { useState } from 'react';
import { PeriodItem } from '../../types/period';
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';
import { today } from './utils';

export interface DateRangePickerProps {
  periods?: PeriodItem[];
  defaultIndex?: number;
  startDate?: Date;
  endDate?: Date;
  onChange?: (index: number, start: Date, end: Date) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = (props) => {
  const { periods = [], startDate = today(), endDate = today(), defaultIndex = 0, onChange } = props;

  const [selectedPeriod, setSelectedPeriod] = useState<number>(defaultIndex);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [pickedStartDate, setPickedStartDate] = useState<Date>(startDate);
  const [pickedEndDate, setPickedEndDate] = useState<Date>(endDate);

  const handleSelectPeriod = (value: string) => {
    const periodIndex = parseInt(value);
    setSelectedPeriod(periodIndex);

    const period = periods[periodIndex];
    const end = new Date();
    const start = sub(end, { [period.unit]: period.value });
    onChange?.(periodIndex, start, end);
  };

  const handleStartDateSelected = (date: Date) => {
    setPickedStartDate(date);
  };

  const handleEndDateSelected = (date: Date) => {
    setPickedEndDate(date);
  };

  const handleApply = () => {
    onChange?.(-1, pickedStartDate, pickedEndDate);
    setDatePickerOpen(false);
  };

  return (
    <div className="flex items-center">
      <Select appearance="underline" defaultValue={selectedPeriod} onChange={(_, data) => handleSelectPeriod(data.value)}>
        {periods.map((period, index) => (
          <option key={index} value={index}>
            {period.label}
          </option>
        ))}
        <option value={-1}>Custom</option>
      </Select>

      {selectedPeriod === -1 && (
        <Popover trapFocus open={datePickerOpen} onOpenChange={() => setDatePickerOpen(!datePickerOpen)}>
          <PopoverTrigger disableButtonEnhancement>
            <Button aria-label="Pick custom date range" appearance="transparent" icon={<CalendarRegular fontSize={20} />}>
              Custom date range
            </Button>
          </PopoverTrigger>
          <PopoverSurface>
            <div className="flex flex-col gap-2">
              <div>
                <Label>Start date</Label>
                <div className="flex gap-1">
                  <DatePicker selected={pickedStartDate} onChange={handleStartDateSelected} />
                  <TimePicker timeInterval={10} selected={pickedStartDate} onChange={handleStartDateSelected} />
                </div>
              </div>
              <div>
                <Label>End date</Label>
                <div className="flex gap-1">
                  <DatePicker selected={pickedEndDate} onChange={handleEndDateSelected} />
                  <TimePicker timeInterval={10} selected={pickedEndDate} onChange={handleEndDateSelected} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button appearance="primary" onClick={handleApply}>
                  Apply
                </Button>
              </div>
            </div>
          </PopoverSurface>
        </Popover>
      )}
    </div>
  );
};

export default DateRangePicker;
