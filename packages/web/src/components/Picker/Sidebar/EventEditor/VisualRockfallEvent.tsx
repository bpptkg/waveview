import { Checkbox, Field, Input, Label, makeStyles, Select, Textarea } from '@fluentui/react-components';
import { useCallback, useMemo } from 'react';
import { useAppStore } from '../../../../stores/app';
import { useFallDirectionStore, useRockfallEventStore } from '../../../../stores/visual';
import { EventSize, EventSizeOptions, FallDirection, ObservationForm, ObservationFormOptions } from '../../../../types/observation';
import FallDirectionCheckbox from './FallDirectionCheckbox';

const useStyles = makeStyles({
  textArea: {
    '& textarea': {
      height: '150px',
      maxHeight: '250px',
    },
  },
});

const VisualRockfallEvent = () => {
  const {
    observationForm,
    isLavaFlow,
    eventSize,
    runoutDistance,
    fallDirections,
    amplitude,
    duration,
    note,
    setIsLavaFlow,
    setObservationForm,
    setEventSize,
    setRunoutDistance,
    setFallDirections,
    setAmplitude,
    setDuration,
    setNote,
  } = useRockfallEventStore();
  const { allFallDirections } = useFallDirectionStore();
  const styles = useStyles();
  const { darkMode } = useAppStore();
  const appearance = useMemo(() => {
    return darkMode ? 'filled-lighter' : 'filled-darker';
  }, [darkMode]);

  const handleObservationFormChange = useCallback(
    (value: string) => {
      setObservationForm(value as ObservationForm);
    },
    [setObservationForm]
  );

  const handleEventSizeChange = useCallback(
    (value: string) => {
      setEventSize(value as EventSize);
    },
    [setEventSize]
  );

  const handleRunoutDistanceChange = useCallback(
    (value: string) => {
      if (!value.length) {
        return;
      }
      setRunoutDistance(parseFloat(value));
    },
    [setRunoutDistance]
  );

  const handleAmplitudeChange = useCallback(
    (value: string) => {
      if (!value.length) {
        return;
      }
      setAmplitude(parseFloat(value));
    },
    [setAmplitude]
  );

  const handleDurationChange = useCallback(
    (value: string) => {
      if (!value.length) {
        return;
      }
      setDuration(parseFloat(value));
    },
    [setDuration]
  );

  const handleNoteChange = useCallback(
    (value: string) => {
      setNote(value);
    },
    [setNote]
  );

  const handleFallDirectionChange = useCallback(
    (checked: FallDirection[]) => {
      setFallDirections(checked);
    },
    [setFallDirections]
  );

  return (
    <div>
      <Field label={'Observation Form'}>
        <Select appearance={appearance} defaultValue={observationForm} onChange={(_, data) => handleObservationFormChange(data.value)}>
          {ObservationFormOptions.map((option) => {
            return (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            );
          })}
        </Select>
      </Field>
      <Field label={'Lava Flow'}>
        <Checkbox label={'Is Incandescent Lava'} checked={isLavaFlow} onChange={() => setIsLavaFlow(!isLavaFlow)} />
      </Field>
      <Field label={'Event Size'}>
        <Select appearance={appearance} defaultValue={eventSize} onChange={(_, data) => handleEventSizeChange(data.value)}>
          {EventSizeOptions.map((option) => {
            return (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            );
          })}
        </Select>
      </Field>
      <Field label={'Runout Distance (m)'}>
        <Input appearance={appearance} min={0} type="number" value={runoutDistance.toString()} onChange={(_, data) => handleRunoutDistanceChange(data.value)} />
      </Field>
      <div className='my-2'>
        <Label>Fall Directions</Label>
        <FallDirectionCheckbox options={allFallDirections} checked={fallDirections} onChange={handleFallDirectionChange} />
      </div>
      <Field label={'Amplitude (mm)'}>
        <Input appearance={appearance} min={0} type="number" value={amplitude.toString()} onChange={(_, data) => handleAmplitudeChange(data.value)} />
      </Field>
      <Field label={'Duration (s)'}>
        <Input appearance={appearance} min={0} type="number" value={duration.toString()} onChange={(_, data) => handleDurationChange(data.value)} />
      </Field>
      <Field label={'Note'}>
        <Textarea
          appearance={appearance}
          className={styles.textArea}
          resize="vertical"
          size="large"
          value={note}
          onChange={(_, data) => handleNoteChange(data.value)}
        />
      </Field>
    </div>
  );
};

export default VisualRockfallEvent;
