import { Checkbox, Field, Input, makeStyles, Select, Textarea } from '@fluentui/react-components';
import { useCallback } from 'react';
import { useFallDirectionStore, usePyroclasticFlowEventStore } from '../../../../stores/visual';
import { EventSize, EventSizeOptions, ObservationForm, ObservationFormOptions } from '../../../../types/observation';

const useStyles = makeStyles({
  textArea: {
    '& textarea': {
      height: '150px',
      maxHeight: '250px',
    },
  },
});

const VisualPyroclasticFlowEvent = () => {
  const {
    observationForm,
    isLavaFlow,
    eventSize,
    runoutDistance,
    fallDirection,
    amplitude,
    duration,
    note,
    setIsLavaFlow,
    setObservationForm,
    setEventSize,
    setRunoutDistance,
    setFallDirection,
    setAmplitude,
    setDuration,
    setNote,
  } = usePyroclasticFlowEventStore();
  const { allFallDirections } = useFallDirectionStore();
  const styles = useStyles();

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

  const handleFallDirectionChange = useCallback(
    (value: string) => {
      setFallDirection(value);
    },
    [setFallDirection]
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

  return (
    <div>
      <Field label={'Observation Form'}>
        <Select appearance="filled-darker" defaultValue={observationForm} onChange={(_, data) => handleObservationFormChange(data.value)}>
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
        <Checkbox label={'Is Lava Flow'} checked={isLavaFlow} onChange={() => setIsLavaFlow(!isLavaFlow)} />
      </Field>
      <Field label={'Event Size'}>
        <Select appearance="filled-darker" defaultValue={eventSize} onChange={(_, data) => handleEventSizeChange(data.value)}>
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
        <Input
          appearance="filled-darker"
          min={0}
          type="number"
          value={runoutDistance.toString()}
          onChange={(_, data) => handleRunoutDistanceChange(data.value)}
        />
      </Field>
      <Field label={'Fall Direction'}>
        <Select appearance="filled-darker" defaultValue={fallDirection} onChange={(_, data) => handleFallDirectionChange(data.value)}>
          <option value={''}>Select fall direction</option>
          {allFallDirections.map((option) => {
            return (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            );
          })}
        </Select>
      </Field>
      <Field label={'Amplitude (mm)'}>
        <Input appearance="filled-darker" min={0} type="number" value={amplitude.toString()} onChange={(_, data) => handleAmplitudeChange(data.value)} />
      </Field>
      <Field label={'Duration (s)'}>
        <Input appearance="filled-darker" min={0} type="number" value={duration.toString()} onChange={(_, data) => handleDurationChange(data.value)} />
      </Field>
      <Field label={'Note'}>
        <Textarea
          appearance="filled-darker"
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

export default VisualPyroclasticFlowEvent;
