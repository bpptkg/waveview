import { Button, Dropdown, Field, Input, Option, Textarea, Toast, Toaster, ToastTitle, useId, useToastController } from '@fluentui/react-components';
import { formatDate } from '@waveview/charts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEventTypeStore } from '../../../stores/eventType';
import { usePickerStore } from '../../../stores/picker';
import { SeismicEvent } from '../../../types/event';
import { CustomError } from '../../../types/response';

export interface EventDrawerProps {
  time: number;
  duration: number;
  useUTC?: boolean;
  onTimeChange?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
  onCancel?: () => void;
  onSave?: (event: SeismicEvent) => void;
  onError?: (error: CustomError) => void;
}

const formatTime = (time: number, useUTC: boolean) => {
  const date = new Date(time);
  return formatDate(date, '{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}', useUTC);
};

const PickEdit: React.FC<EventDrawerProps> = (props) => {
  const { time, duration, useUTC = false, onTimeChange, onDurationChange, onCancel, onSave } = props;
  const [loading, setLoading] = useState(false);
  const [timeValue, setTimeValue] = useState(time);
  const [durationValue, setDurationValue] = useState(duration);
  const [eventType, setEventType] = useState('');
  const [stationOfFirstArrival, setStationOfFirstArrival] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    setTimeValue(time);
    setDurationValue(duration);
  }, [time, duration]);

  const { getSelectedStations, savePickedEvent } = usePickerStore();
  const { eventTypes } = useEventTypeStore();

  const toasterId = useId('pick-editor');
  const { dispatchToast } = useToastController(toasterId);

  const canSave = useMemo(() => {
    return timeValue !== 0 && durationValue !== 0 && eventType !== '' && stationOfFirstArrival !== '';
  }, [timeValue, durationValue, eventType, stationOfFirstArrival]);

  const showErrorToast = useCallback(
    (error: CustomError) => {
      dispatchToast(
        <Toast>
          <ToastTitle>{error.message}</ToastTitle>
        </Toast>,
        { intent: 'error' }
      );
    },
    [dispatchToast]
  );

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

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    try {
      const event = await savePickedEvent({
        time: timeValue,
        duration: durationValue,
        stationOfFirstArrival: stationOfFirstArrival,
        eventType: eventType,
        note: note,
      });
      onSave?.(event);
    } catch (error) {
      showErrorToast(error as CustomError);
    } finally {
      setLoading(false);
    }
  }, [timeValue, durationValue, stationOfFirstArrival, eventType, note, onSave, showErrorToast, savePickedEvent]);

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
          <Button size="small" appearance="primary" onClick={handleConfirm} disabled={loading || !canSave}>
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
            <Option key={event.id} onClick={() => handleEventTypeChange(event.id)}>
              {event.code}
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
      <Toaster toasterId={toasterId} />
    </div>
  );
};

export default PickEdit;
