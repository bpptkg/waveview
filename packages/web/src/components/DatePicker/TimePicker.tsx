import { Select } from '@fluentui/react-components';
import React, { useCallback, useMemo } from 'react';
import { today } from './utils';

export interface TimePickerProps {
  selected?: Date;
  onChange?: (date: Date) => void;
  timeInterval?: number;
}

const TimePicker: React.FC<TimePickerProps> = (props) => {
  const { selected = today(), onChange, timeInterval = 30 } = props;

  const timePickerOptions = useMemo(() => {
    return Array.from({ length: (24 * 60) / timeInterval }, (_, index) => {
      const hour = Math.floor((index * timeInterval) / 60);
      const minute = (index * timeInterval) % 60;
      return {
        value: index,
        label: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      };
    });
  }, [timeInterval]);

  const handleChange = useCallback(
    (index: string) => {
      const value = parseInt(index);
      const hour = Math.floor((value * timeInterval) / 60);
      const minute = (value * timeInterval) % 60;
      const newDate = new Date(selected);
      newDate.setHours(hour, minute, 0, 0);
      onChange?.(newDate);
    },
    [selected, onChange, timeInterval]
  );

  return (
    <div>
      <Select defaultValue={0} onChange={(_, data) => handleChange(data.value)}>
        {timePickerOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
};

export default TimePicker;
