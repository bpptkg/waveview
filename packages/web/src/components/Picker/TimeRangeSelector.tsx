import { Calendar } from '@fluentui/react-calendar-compat';
import { Popover, PopoverSurface, PopoverTrigger, Toolbar, ToolbarButton, ToolbarDivider, makeStyles } from '@fluentui/react-components';
import { Calendar20Regular } from '@fluentui/react-icons';
import React, { useCallback, useState } from 'react';

const timeRangeOptions = [
  { value: 15, label: '15m' },
  { value: 30, label: '30m' },
  { value: 60, label: '1h' },
  { value: 120, label: '3h' },
  { value: 240, label: '6h' },
  { value: 480, label: '12h' },
  { value: 1440, label: '1d' },
];

const useStyles = makeStyles({
  btn: {
    minWidth: 'auto',
    padding: '5px 8px',
    height: '24px',
  },
});

export interface TimeRangeSelectorProps {
  offsetDate?: Date;
  onSelected?: (start: number, end: number) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = (props) => {
  const { onSelected, offsetDate } = props;
  const styles = useStyles();

  const handleTimeRangeSelected = (value: number) => {
    const end = Date.now();
    const start = end - value * 60 * 1000;
    onSelected?.(start, end);
  };

  const [offsetDatePickerOpen, setOffsetDatePickerOpen] = useState(false);

  const handleSelectDate = useCallback(
    (date: Date) => {
      setOffsetDatePickerOpen(false);
      const end = date.getTime();
      const start = end - 24 * 60 * 60 * 1000;
      onSelected?.(start, end);
    },
    [onSelected]
  );

  return (
    <Toolbar aria-label="Seismogram Bottom Toolbar" size="small">
      {timeRangeOptions.map((option) => (
        <ToolbarButton
          key={option.value}
          aria-label={`Select Time Range ${option.label}`}
          className={styles.btn}
          onClick={() => handleTimeRangeSelected(option.value)}
        >
          <span className="font-normal text-xs">{option.label}</span>
        </ToolbarButton>
      ))}

      <ToolbarDivider />

      <Popover trapFocus open={offsetDatePickerOpen} onOpenChange={() => setOffsetDatePickerOpen(!offsetDatePickerOpen)}>
        <PopoverTrigger disableButtonEnhancement>
          <ToolbarButton aria-label="Select Custom Date" icon={<Calendar20Regular />} className={styles.btn} />
        </PopoverTrigger>
        <PopoverSurface>
          <Calendar value={offsetDate} onSelectDate={handleSelectDate} />
        </PopoverSurface>
      </Popover>
    </Toolbar>
  );
};

export default TimeRangeSelector;
