import { Dropdown, Field, Input, makeStyles, Option, Textarea } from '@fluentui/react-components';
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
    <div className="px-2">
      <Field label="Time">
        <Input appearance="outline" value={formatTime(time, { useUTC })} onChange={(_, data) => handleTimeChange(data.value)} />
      </Field>

      <Field label="Duration (s)">
        <Input min={0} appearance="outline" value={`${duration}`} type="number" onChange={(_, data) => handleDurationChange(data.value)} />
      </Field>

      <Field label="Event type">
        <Dropdown
          className={styles.dropdown}
          defaultValue={eventTypes.find((event) => event.id === eventTypeId)?.code}
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
          className={styles.dropdown}
          defaultValue={getSelectedStations().find((station) => station.id === stationOfFirstArrivalId)?.code}
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
        <Textarea value={note} resize="vertical" size="large" onChange={(_, data) => handleNoteChange(data.value)} />
      </Field>
    </div>
  );
};

export default PickEditEvent;