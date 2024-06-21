import { Toolbar, ToolbarButton, ToolbarDivider, makeStyles } from '@fluentui/react-components';
import { Calendar20Regular } from '@fluentui/react-icons';
import React from 'react';

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
  onSelected?: (start: number, end: number) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = (props) => {
  const { onSelected } = props;
  const styles = useStyles();

  const handleTimeRangeSelected = (value: number) => {
    const end = Date.now();
    const start = end - value * 60 * 1000;
    onSelected?.(start, end);
  };

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
      <ToolbarButton aria-label="Select Custom Date" icon={<Calendar20Regular />} className={styles.btn} />
    </Toolbar>
  );
};

export default TimeRangeSelector;
