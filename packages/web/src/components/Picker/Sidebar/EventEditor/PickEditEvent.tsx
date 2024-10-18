import { Avatar, Dropdown, Field, Input, makeStyles, Option, Spinner, Textarea } from '@fluentui/react-components';
import { CircleFilled } from '@fluentui/react-icons';
import React, { useCallback, useEffect, useMemo } from 'react';
import { formatNumber, formatTime } from '../../../../shared/formatting';
import { useAppStore } from '../../../../stores/app';
import { useEventTypeStore } from '../../../../stores/eventType';
import { usePickerStore } from '../../../../stores/picker';
import { usePickerContext } from '../../PickerContext';

const useStyles = makeStyles({
  dropdown: {
    minWidth: 'auto',
  },
  textArea: {
    '& textarea': {
      height: '150px',
      maxHeight: '250px',
    },
  },
});

const PickEditEvent: React.FC = () => {
  const {
    eventId,
    time,
    duration,
    stationOfFirstArrivalId,
    eventTypeId,
    note,
    pickRange,
    editedEvent,
    amplitudes,
    isCalculatingAmplitudes,
    getSelectedStations,
    setTime,
    setDuration,
    setEventTypeId,
    setStationOfFirstArrivalId,
    setNote,
  } = usePickerStore();
  const { eventTypes } = useEventTypeStore();
  const { useUTC, darkMode } = useAppStore();
  const { seisChartRef } = usePickerContext();
  const styles = useStyles();
  const appearance = useMemo(() => {
    return darkMode ? 'filled-lighter' : 'filled-darker';
  }, [darkMode]);

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
      <div className="h-[32px] font-semibold">{eventId ? 'Edit Event' : 'Pick New Event'}</div>

      <Field label="Time">
        <Input appearance={appearance} value={formatTime(time, { useUTC })} onChange={(_, data) => handleTimeChange(data.value)} />
      </Field>

      <Field label="Duration (s)">
        <Input min={0} appearance={appearance} value={`${duration}`} type="number" onChange={(_, data) => handleDurationChange(data.value)} />
      </Field>

      <Field label="Amplitudes">
        {isCalculatingAmplitudes ? (
          <div className="flex justify-start py-2">
            <Spinner label={<span className="text-md">Calculating amplitudes...</span>} size="extra-tiny" />
          </div>
        ) : amplitudes.length ? (
          amplitudes.map((amplitude, index) => (
            <div key={index} className="flex flex-wrap items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800">
              <div className="text-sm">{amplitude.stream_id}</div>
              <div className="text-sm">{formatNumber(amplitude.amplitude, { precision: 2, unit: ` ${amplitude.unit}` })}</div>
            </div>
          ))
        ) : (
          <div>No amplitude data</div>
        )}
      </Field>

      <Field label="Station of First Arrival">
        <Dropdown
          className={styles.dropdown}
          appearance={appearance}
          defaultValue={''}
          value={getSelectedStations().find((station) => station.id === stationOfFirstArrivalId)?.code || ''}
          onActiveOptionChange={(_, data) => {
            const value = data.nextOption?.value;
            if (value && value !== '') {
              handleStationChange(value);
            }
          }}
        >
          <Option disabled value={''}>
            Select station
          </Option>
          {getSelectedStations().map((station) => (
            <Option key={station.id} value={station.id} text={station.code}>
              {station.code}
            </Option>
          ))}
        </Dropdown>
      </Field>

      <Field label="Event Type">
        <Dropdown
          className={styles.dropdown}
          appearance={appearance}
          defaultValue={''}
          value={eventTypes.find((event) => event.id === eventTypeId)?.code || ''}
          onActiveOptionChange={(_, data) => {
            const value = data.nextOption?.value;
            if (value && value !== '') {
              handleEventTypeChange(value);
            }
          }}
        >
          <Option disabled value={''}>
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
        <Textarea
          className={styles.textArea}
          value={note}
          appearance={appearance}
          resize="vertical"
          size="large"
          onChange={(_, data) => handleNoteChange(data.value)}
        />
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
