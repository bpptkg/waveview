import { Button, Input, makeStyles, Popover, PopoverSurface, PopoverTrigger } from '@fluentui/react-components';
import { ChevronDownRegular, ChevronUpRegular, ClockRegular } from '@fluentui/react-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { formatTimezonedDate, ONE_HOUR, ONE_MINUTE, ONE_SECOND } from '../../shared/time';
import { useAppStore } from '../../stores/app';
import { today } from './utils';

export interface TimePickerProps {
  selected?: number;
  onChange?: (date: number) => void;
  timeInterval?: number;
}

const useTimePickerStyles = makeStyles({
  input: {
    display: 'inline-flex',
    maxWidth: '120px',
  },
});

type TimeUnit = 'hour' | 'minute' | 'second';

interface TimeSliderProps {
  value: number;
  unit: TimeUnit;
  useUTC: boolean;
  onChange?: (value: number) => void;
}

const add = (value: number, unit: TimeUnit) => {
  switch (unit) {
    case 'hour':
      return value + ONE_HOUR;
    case 'minute':
      return value + ONE_MINUTE;
    case 'second':
      return value + ONE_SECOND;
    default:
      return value;
  }
};

const sub = (value: number, unit: TimeUnit) => {
  switch (unit) {
    case 'hour':
      return value - ONE_HOUR;
    case 'minute':
      return value - ONE_MINUTE;
    case 'second':
      return value - ONE_SECOND;
    default:
      return value;
  }
};

const TimeSlider: React.FC<TimeSliderProps> = (props) => {
  const { value, unit, useUTC, onChange } = props;

  const handleUp = useCallback(() => {
    onChange?.(add(value, unit));
  }, [value, unit, onChange]);

  const handleDown = useCallback(() => {
    onChange?.(sub(value, unit));
  }, [value, unit, onChange]);

  const template = useMemo(() => {
    switch (unit) {
      case 'hour':
        return 'HH';
      case 'minute':
        return 'mm';
      case 'second':
        return 'ss';
      default:
        return '';
    }
  }, [unit]);

  return (
    <div className="flex flex-col justify-center items-center w-[40px]">
      <Button appearance="subtle" icon={<ChevronUpRegular fontSize={20} onClick={handleUp} />} />
      <span>{formatTimezonedDate(value, template, useUTC)}</span>
      <Button appearance="subtle" icon={<ChevronDownRegular fontSize={20} onClick={handleDown} />} />
    </div>
  );
};

const TimePicker: React.FC<TimePickerProps> = (props) => {
  const { selected = today(), onChange } = props;

  const styles = useTimePickerStyles();

  const [open, setOpen] = useState<boolean>(false);
  const { useUTC } = useAppStore();

  const handleChange = useCallback(
    (value: number) => {
      onChange?.(value);
    },
    [onChange]
  );

  return (
    <Popover trapFocus open={open} onOpenChange={() => setOpen(!open)}>
      <PopoverTrigger disableButtonEnhancement>
        <Input
          value={formatTimezonedDate(selected, 'HH:mm:ss', useUTC)}
          aria-label="inline"
          contentAfter={<ClockRegular fontSize={20} />}
          readOnly
          className={styles.input}
        />
      </PopoverTrigger>
      <PopoverSurface>
        <div className="flex items-center">
          <TimeSlider value={selected} unit="hour" useUTC={useUTC} onChange={handleChange} />
          <span>:</span>
          <TimeSlider value={selected} unit="minute" useUTC={useUTC} onChange={handleChange} />
          <span>:</span>
          <TimeSlider value={selected} unit="second" useUTC={useUTC} onChange={handleChange} />
        </div>
      </PopoverSurface>
    </Popover>
  );
};

export default TimePicker;
