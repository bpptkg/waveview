import { Button, Dropdown, Field, Input, Option, Textarea } from '@fluentui/react-components';
import { formatDate } from '@waveview/charts';
import { useCallback, useEffect, useState } from 'react';
import { PickedEvent, usePickerStore } from '../../../stores/picker';

export interface EventDrawerProps {
  time: number;
  duration: number;
  useUTC?: boolean;
  onTimeChange?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
  onCancel?: () => void;
  onConfirm?: (event: PickedEvent) => void;
}

const formatTime = (time: number, useUTC: boolean) => {
  const date = new Date(time);
  return formatDate(date, '{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}', useUTC);
};

const PickEdit: React.FC<EventDrawerProps> = (props) => {
  const { time, duration, useUTC = false, onTimeChange, onDurationChange, onCancel, onConfirm } = props;
  const [timeValue, setTimeValue] = useState(time);
  const [durationValue, setDurationValue] = useState(duration);
  const [eventType, setEventType] = useState('');
  const [stationOfFirstArrival, setStationOfFirstArrival] = useState('');
  const [note, setNote] = useState('');

  const handleTimeChange = useCallback(
    (value: string) => {
      if (!value.length) {
        return;
      }
      const parsedValue = new Date(value).getTime();
      setTimeValue(parsedValue);
      onTimeChange?.(parsedValue);
    },
    [onTimeChange]
  );

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

  const handleStationChange = useCallback((value: string) => {
    setStationOfFirstArrival(value);
  }, []);

  const handleEventTypeChange = useCallback((value: string) => {
    setEventType(value);
  }, []);

  const handleNoteChange = useCallback((value: string) => {
    setNote(value);
  }, []);

  useEffect(() => {
    setTimeValue(time);
    setDurationValue(duration);
  }, [time, duration]);

  const { getSelectedStations, eventTypes } = usePickerStore();

  const handleConfirm = useCallback(() => {
    onConfirm?.({
      time: timeValue,
      duration: durationValue,
      stationOfFirstArrival: stationOfFirstArrival,
      eventType: eventType,
      note: note,
    });
  }, [timeValue, durationValue, stationOfFirstArrival, eventType, note, onConfirm]);

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  return (
    <div className="p-2">
      <div className="flex p-2 items-center justify-between h-[60px]">
        <h1 className="font-bold">Pick New Event</h1>
        <div className="flex gap-1 items-center">
          <Button size="small" appearance="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="small" appearance="primary" onClick={handleConfirm}>
            Save
          </Button>
        </div>
      </div>
      <Field label="Time">
        <Input appearance="outline" value={formatTime(timeValue, useUTC)} onChange={(_, data) => handleTimeChange(data.value)} />
      </Field>
      <Field label="Duration (s)">
        <Input appearance="outline" value={`${durationValue.toFixed(2)}`} type="number" onChange={(_, data) => handleDurationChange(data.value)} />
      </Field>
      <Field label="Event type">
        <Dropdown placeholder="Select event type">
          {eventTypes.map((event) => (
            <Option key={event.code} onClick={() => handleEventTypeChange(event.code)}>
              {event.name}
            </Option>
          ))}
        </Dropdown>
      </Field>
      <Field label="Station of first arrival">
        <Dropdown placeholder="Select station name">
          {getSelectedStations().map((station) => (
            <Option key={station.id} onClick={() => handleStationChange(station.id)}>
              {station.code}
            </Option>
          ))}
        </Dropdown>
      </Field>
      <Field label="Note">
        <Textarea value={note} resize="vertical" size="large" onChange={(_, data) => handleNoteChange(data.value)} />
      </Field>
    </div>
  );
};

export default PickEdit;
