import { Button, Dropdown, Field, Input, Option, Textarea, Toast, Toaster, ToastTitle, useId, useToastController } from '@fluentui/react-components';
import { CircleFilled } from '@fluentui/react-icons';
import { formatDate } from '@waveview/charts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEventTypeStore } from '../../../stores/eventType';
import { usePickerStore } from '../../../stores/picker';
import { Attachment, SeismicEventDetail } from '../../../types/event';
import { CustomError } from '../../../types/response';
import AttachmentUpload from '../../Gallery/AttachmentUpload';

export interface EventDrawerProps {
  time: number;
  duration: number;
  eventId?: string;
  eventType?: string;
  stationOfFirstArrival?: string;
  note?: string;
  useUTC?: boolean;
  attachments?: Attachment[];
  onTimeChange?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
  onCancel?: () => void;
  onSave?: (event: SeismicEventDetail) => void;
  onError?: (error: CustomError) => void;
}

const formatTime = (time: number, useUTC: boolean) => {
  const date = new Date(time);
  return formatDate(date, '{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}', useUTC);
};

const PickEdit: React.FC<EventDrawerProps> = (props) => {
  const {
    eventId,
    time,
    duration,
    eventType = '',
    stationOfFirstArrival = '',
    note = '',
    useUTC = false,
    attachments = [],
    onTimeChange,
    onDurationChange,
    onCancel,
    onSave,
  } = props;
  const [loading, setLoading] = useState(false);
  const [timeState, setTimeState] = useState(time);
  const [durationState, setDurationState] = useState(duration);
  const [eventTypeState, setEventTypeState] = useState(eventType);
  const [stationOfFirstArrivalState, setStationOfFirstArrivalState] = useState(stationOfFirstArrival);
  const [noteState, setNoteState] = useState(note);
  const [attachmentsState, setAttachmentsState] = useState(attachments);

  useEffect(() => {
    setTimeState(time);
    setDurationState(duration);
  }, [time, duration]);

  const { getSelectedStations, savePickedEvent } = usePickerStore();
  const { eventTypes } = useEventTypeStore();

  const toasterId = useId('pick-editor');
  const { dispatchToast } = useToastController(toasterId);

  const canSave = useMemo(() => {
    return timeState !== 0 && durationState !== 0 && eventTypeState !== '' && stationOfFirstArrivalState !== '';
  }, [timeState, durationState, eventTypeState, stationOfFirstArrivalState]);

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
      setTimeState(parsedValue);
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
      setDurationState(parsedValue);
      onDurationChange?.(parsedValue);
    },
    [onDurationChange]
  );

  const handleStationChange = useCallback((value: string) => {
    setStationOfFirstArrivalState(value);
  }, []);

  const handleEventTypeChange = useCallback((value: string) => {
    setEventTypeState(value);
  }, []);

  const handleNoteChange = useCallback((value: string) => {
    setNoteState(value);
  }, []);

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    try {
      const event = await savePickedEvent({
        eventId,
        time: timeState,
        duration: durationState,
        stationOfFirstArrival: stationOfFirstArrivalState,
        eventType: eventTypeState,
        note: noteState,
        method: 'waveview',
        evaluation_mode: 'manual',
        evaluation_status: 'confirmed',
        attachment_ids: attachmentsState.map((a) => a.id),
      });
      onSave?.(event);
    } catch (error) {
      showErrorToast(error as CustomError);
    } finally {
      setLoading(false);
    }
  }, [eventId, timeState, durationState, stationOfFirstArrivalState, eventTypeState, noteState, attachmentsState, savePickedEvent, showErrorToast, onSave]);

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  const title = useMemo(() => {
    return eventId ? 'Edit Event' : 'Create Event';
  }, [eventId]);

  const handleAttachmentAdd = useCallback((attachment: Attachment) => {
    setAttachmentsState((attachments) => [...attachments, attachment]);
  }, []);

  const handleAttachmentRemove = useCallback((attachment: Attachment) => {
    setAttachmentsState((attachments) => attachments.filter((a) => a.id !== attachment.id));
  }, []);

  return (
    <div className="p-2">
      <div className="flex p-2 items-center justify-between h-[60px]">
        <h1 className="font-bold text-md">{title}</h1>
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
        <Input appearance="outline" value={formatTime(timeState, useUTC)} onChange={(_, data) => handleTimeChange(data.value)} />
      </Field>

      <Field label="Duration (s)">
        <Input appearance="outline" value={`${durationState.toFixed(2)}`} type="number" onChange={(_, data) => handleDurationChange(data.value)} />
      </Field>

      <Field label="Event type">
        <Dropdown
          defaultValue={eventTypes.find((event) => event.id === eventTypeState)?.code}
          onActiveOptionChange={(_, data) => {
            const value = data.nextOption?.value;
            if (value) {
              handleEventTypeChange(value);
            }
          }}
        >
          {eventTypes.map((event) => (
            <Option key={event.id} value={event.id} text={event.code}>
              <div className="flex items-center gap-1">
                <CircleFilled fontSize={20} color={event.color} />
                <span>{event.code}</span>
              </div>
            </Option>
          ))}
        </Dropdown>
      </Field>

      <Field label="Station of first arrival">
        <Dropdown
          defaultValue={getSelectedStations().find((station) => station.id === stationOfFirstArrivalState)?.code}
          onActiveOptionChange={(_, data) => {
            const value = data.nextOption?.value;
            if (value) {
              handleStationChange(value);
            }
          }}
        >
          {getSelectedStations().map((station) => (
            <Option key={station.id} value={station.id} text={station.code}>
              {station.code}
            </Option>
          ))}
        </Dropdown>
      </Field>

      <Field label="Note">
        <Textarea value={noteState} resize="vertical" size="large" onChange={(_, data) => handleNoteChange(data.value)} />
      </Field>

      <Field>
        <AttachmentUpload initialAttachments={attachments} onAdd={handleAttachmentAdd} onRemove={handleAttachmentRemove} />
      </Field>

      <Toaster toasterId={toasterId} />
    </div>
  );
};

export default PickEdit;
