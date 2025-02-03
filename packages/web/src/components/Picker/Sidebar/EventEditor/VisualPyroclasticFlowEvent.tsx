import { Button, Checkbox, Field, Input, makeStyles, Select, Textarea, Tooltip } from '@fluentui/react-components';
import { DeleteRegular } from '@fluentui/react-icons';
import { useCallback, useMemo } from 'react';
import { useAppStore } from '../../../../stores/app';
import { useFallDirectionStore, usePyroclasticFlowEventStore } from '../../../../stores/visual';
import { EventSize, EventSizeOptions, FallDirection, ObservationForm, ObservationFormOptions } from '../../../../types/observation';
import FallDirectionPicker from './FallDirectionPicker';

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
    fallDirections,
    amplitude,
    duration,
    note,
    setIsLavaFlow,
    setObservationForm,
    setEventSize,
    setRunoutDistance,
    addFallDirection,
    removeFallDirection,
    setAmplitude,
    setDuration,
    setNote,
  } = usePyroclasticFlowEventStore();
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

  const handleAddFallDirection = useCallback(
    (direction: FallDirection) => {
      addFallDirection(direction);
    },
    [addFallDirection]
  );

  const handleRemoveFallDirection = useCallback(
    (index: number) => {
      removeFallDirection(fallDirections[index].id);
    },
    [fallDirections, removeFallDirection]
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
      <div>
        <FallDirectionPicker directions={allFallDirections} excludes={fallDirections} onSelected={handleAddFallDirection} />
        <div>
          {fallDirections.length > 0 ? (
            fallDirections.map((direction, index) => {
              return (
                <div
                  key={direction.id}
                  className="flex items-center justify-between cursor-pointer p-1 group hover:bg-gray-200 dark:hover:bg-gray-700 hover:rounded-sm"
                >
                  <div>{direction.name}</div>
                  <div>
                    <Tooltip content={`Remove ${direction.name}`} relationship="label">
                      <Button size="small" appearance="transparent" icon={<DeleteRegular />} onClick={() => handleRemoveFallDirection(index)} />
                    </Tooltip>
                  </div>
                </div>
              );
            })
          ) : (
            <div>No items</div>
          )}
        </div>
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

export default VisualPyroclasticFlowEvent;
