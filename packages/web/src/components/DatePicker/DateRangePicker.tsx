import { Button, Label, Popover, PopoverSurface, PopoverTrigger, Select } from '@fluentui/react-components';
import { CalendarRegular } from '@fluentui/react-icons';
import { sub } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { PeriodItem } from '../../types/period';
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';
import { today } from './utils';

export interface DateRangePickerProps {
  className?: string;
  periods?: PeriodItem[];
  defaultIndex?: number;
  startDate?: number;
  endDate?: number;
  showTimeSelect?: boolean;
  onChange?: (index: number, start: number, end: number) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = (props) => {
  const { className, periods = [], startDate = today(), endDate = today(), defaultIndex = 0, showTimeSelect = true, onChange } = props;

  const [selectedPeriod, setSelectedPeriod] = useState<number>(defaultIndex);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [pickedStartDate, setPickedStartDate] = useState<number>(startDate);
  const [pickedEndDate, setPickedEndDate] = useState<number>(endDate);

  useEffect(() => {
    setSelectedPeriod(defaultIndex);
  }, [defaultIndex]);

  const handleSelectPeriod = (value: string) => {
    const periodIndex = parseInt(value);
    setSelectedPeriod(periodIndex);

    if (periodIndex !== -1) {
      const period = periods[periodIndex];
      const end = Date.now();
      const start = sub(end, { [period.unit]: period.value }).getTime();
      onChange?.(periodIndex, start, end);
    }
  };

  const handleStartDateSelected = (date: number) => {
    setPickedStartDate(date);
  };

  const handleEndDateSelected = (date: number) => {
    setPickedEndDate(date);
  };

  const handleApply = () => {
    onChange?.(-1, pickedStartDate, pickedEndDate);
    setDatePickerOpen(false);
  };

  return (
    <div className={`flex items-center ${className}`}>
      <Select appearance="outline" defaultValue={selectedPeriod} onChange={(_, data) => handleSelectPeriod(data.value)}>
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
                  {showTimeSelect && <TimePicker timeInterval={10} selected={pickedStartDate} onChange={handleStartDateSelected} />}
                </div>
              </div>
              <div>
                <Label>End date</Label>
                <div className="flex gap-1">
                  <DatePicker selected={pickedEndDate} onChange={handleEndDateSelected} />
                  {showTimeSelect && <TimePicker timeInterval={10} selected={pickedEndDate} onChange={handleEndDateSelected} />}
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
