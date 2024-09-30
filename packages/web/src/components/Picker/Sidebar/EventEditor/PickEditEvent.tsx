import { Avatar, Dropdown, Field, Input, makeStyles, Option, Textarea } from '@fluentui/react-components';
import { CircleFilled } from '@fluentui/react-icons';
import React, { useCallback, useEffect } from 'react';
import { formatTime } from '../../../../shared/formatting';
import { useAppStore } from '../../../../stores/app';
import { useEventTypeStore } from '../../../../stores/eventType';
import { usePickerStore } from '../../../../stores/picker';
import { usePickerContext } from '../../PickerContext';

const useStyles = makeStyles({
  dropdown: {
    minWidth: 'auto',
  },
});

const PickEditEvent: React.FC = () => {
  const {
    time,
    duration,
    stationOfFirstArrivalId,
    eventTypeId,
    note,
    pickRange,
    editedEvent,
    getSelectedStations,
    setTime,
    setDuration,
    setEventTypeId,
    setStationOfFirstArrivalId,
    setNote,
  } = usePickerStore();
  const { eventTypes } = useEventTypeStore();
  const { useUTC } = useAppStore();
  const { seisChartRef } = usePickerContext();
  const styles = useStyles();

  useEffect(() => {
    seisChartRef?.current?.setPickRange(pickRange);
  }, [seisChartRef, pickRange]);

  const handleTimeChange = useCallback(
    (value: string) => {
      if (!value.length) {
        return;
      }
      const parsedValue = new Date(value).getTime();
      setTime(parsedValue);
    },
    [setTime]
  );

  const handleDurationChange = useCallback(
    (value: string) => {
      if (!value.length) {
        return;
      }
      const parsedValue = parseFloat(value);
      setDuration(parsedValue);
    },
    [setDuration]
  );

  const handleStationChange = useCallback(
    (value: string) => {
      setStationOfFirstArrivalId(value);
    },
    [setStationOfFirstArrivalId]
  );

  const handleEventTypeChange = useCallback(
    (value: string) => {
      setEventTypeId(value);
    },
    [setEventTypeId]
  );

  const handleNoteChange = useCallback(
    (value: string) => {
      setNote(value);
    },
    [setNote]
  );

  return (
    <div className="p-2">
      <Field label="Time">
        <Input appearance="outline" value={formatTime(time, { useUTC })} onChange={(_, data) => handleTimeChange(data.value)} />
      </Field>

      <Field label="Duration (s)">
        <Input min={0} appearance="outline" value={`${duration}`} type="number" onChange={(_, data) => handleDurationChange(data.value)} />
      </Field>

      <Field label="Station of first arrival">
        <Dropdown
          className={styles.dropdown}
          value={getSelectedStations().find((station) => station.id === stationOfFirstArrivalId)?.code}
          onActiveOptionChange={(_, data) => {
            const value = data.nextOption?.value;
            if (value && value !== 'none') {
              handleStationChange(value);
            }
          }}
        >
          <Option disabled value="none">
            Select station
          </Option>
          {getSelectedStations().map((station) => (
            <Option key={station.id} value={station.id} text={station.code}>
              {station.code}
            </Option>
          ))}
        </Dropdown>
      </Field>

      <Field label="Event type">
        <Dropdown
          className={styles.dropdown}
          value={eventTypes.find((event) => event.id === eventTypeId)?.code}
          onActiveOptionChange={(_, data) => {
            const value = data.nextOption?.value;
            if (value && value !== 'none') {
              handleEventTypeChange(value);
            }
          }}
        >
          <Option disabled value="none">
            Select event type
          </Option>
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

      <Field label="Note">
        <Textarea value={note} resize="vertical" size="large" onChange={(_, data) => handleNoteChange(data.value)} />
      </Field>

      {editedEvent && (
        <Field label="Author">
          <div className="inline-flex items-center gap-1">
            <Avatar aria-label={editedEvent.author.name} name={editedEvent.author.name} color="colorful" image={{ src: editedEvent.author.avatar }} />{' '}
            <span>{editedEvent.author.name}</span>
          </div>
        </Field>
      )}
    </div>
  );
};

export default PickEditEvent;
