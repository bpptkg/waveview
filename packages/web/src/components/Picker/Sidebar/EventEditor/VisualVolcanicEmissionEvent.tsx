import { Field, Input, makeStyles, Select, Textarea } from '@fluentui/react-components';
import { useCallback, useMemo } from 'react';
import { useAppStore } from '../../../../stores/app';
import { useVolcanicEmissionEventStore } from '../../../../stores/visual';
import { EmissionColor, EmissionColorOptions, ObservationForm, ObservationFormOptions } from '../../../../types/observation';

const useStyles = makeStyles({
  textArea: {
    '& textarea': {
      height: '150px',
      maxHeight: '250px',
    },
  },
});

const VisualVolcanicEmissionEvent = () => {
  const { observationForm, height, color, intensity, note, setObservationForm, setHeight, setColor, setIntensity, setNote } = useVolcanicEmissionEventStore();
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

  const handleHeightChange = useCallback(
    (value: string) => {
      if (!value.length) {
        return;
      }
      setHeight(parseFloat(value));
    },
    [setHeight]
  );

  const handleColorChange = useCallback(
    (value: string) => {
      setColor(value as EmissionColor);
    },
    [setColor]
  );

  const handleIntensityChange = useCallback(
    (value: string) => {
      if (!value.length) {
        return;
      }
      setIntensity(parseFloat(value));
    },
    [setIntensity]
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
      <Field label={'Height (m)'}>
        <Input appearance={appearance} type="number" min={0} value={height.toString()} onChange={(_, data) => handleHeightChange(data.value)} />
      </Field>
      <Field label={'Color'}>
        <Select appearance={appearance} defaultValue={color} onChange={(_, data) => handleColorChange(data.value)}>
          <option value={''}>Select a color</option>
          {EmissionColorOptions.map((option) => {
            return (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            );
          })}
        </Select>
      </Field>
      <Field label={'Intensity (ppm)'}>
        <Input appearance={appearance} type="number" min={0} value={intensity.toString()} onChange={(_, data) => handleIntensityChange(data.value)} />
      </Field>
      <Field label={'Note'}>
        <Textarea
          appearance={appearance}
          className={styles.textArea}
          resize="vertical"
          size="large"
          value={note}
          onChange={(_, data) => handleNoteChange(data.value)}
        ></Textarea>
      </Field>
    </div>
  );
};

export default VisualVolcanicEmissionEvent;
