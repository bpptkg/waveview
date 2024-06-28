import { Button, Dropdown, Field, Input, Option, Textarea } from '@fluentui/react-components';
import { formatDate } from '@waveview/charts';
import { useCallback, useEffect, useState } from 'react';
import { usePickerStore } from '../../../stores/picker';
import { SeismicEvent } from '../../../types/seismicEvent';

export interface EventDrawerProps {
  start: number;
  duration: number;
  useUTC?: boolean;
  onStartChange?: (start: number) => void;
  onDurationChange?: (duration: number) => void;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm?: (event: SeismicEvent) => void;
}

const PickEdit: React.FC<EventDrawerProps> = (props) => {
  const { start, duration, useUTC = false, onDurationChange, onCancel, onConfirm } = props;
  const [startValue, setStartValue] = useState(start);
  const [durationValue, setDurationValue] = useState(duration);

  const handleDurationChange = useCallback(
    (value: string) => {
      if (!value.length) {
        return;
      }
      const parsedValue = parseFloat(value);
      setDurationValue(parsedValue);
      onDurationChange?.(parsedValue);
    },
    [onDurationChange]
  );

  useEffect(() => {
    setStartValue(start);
    setDurationValue(duration);
  }, [start, duration]);

  const formatTime = (time: number) => {
    const date = new Date(time);
    return formatDate(date, '{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}', useUTC);
  };

  const { listStations, eventTypes } = usePickerStore();

  const handleSave = useCallback(() => {
    onConfirm?.({
      id: '',
      startTime: startValue,
      endTime: startValue + durationValue * 1000,
      stationOfFirstArrival: '',
      eventType: '',
      note: '',
    });
  }, [durationValue, onConfirm, startValue]);

  return (
    <div className="p-2">
      <div className="flex p-2 items-center justify-between h-[60px]">
        <h1 className="font-bold">Pick New Event</h1>
        <div className="flex gap-1 items-center">
          <Button size="small" appearance="outline" onClick={() => onCancel?.()}>
            Cancel
          </Button>
          <Button size="small" appearance="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>

      <Field label="Time">
        <Input appearance="outline" value={formatTime(startValue)} />
      </Field>
      <Field label="Duration (s)">
        <Input appearance="outline" value={`${durationValue.toFixed(2)}`} type="number" onChange={(e, data) => handleDurationChange(data.value)} />
      </Field>
      <Field label="Event type">
        <Dropdown placeholder="Select event type">
          {eventTypes.map((event) => (
            <Option key={event.code}>{event.name}</Option>
          ))}
        </Dropdown>
      </Field>
      <Field label="Station of first arrival">
        <Dropdown placeholder="Select station name">
          {listStations.map((station) => (
            <Option key={station}>{station}</Option>
          ))}
        </Dropdown>
      </Field>
      <Field label="Note">
        <Textarea resize="vertical" size="large" />
      </Field>
    </div>
  );
};

export default PickEdit;
