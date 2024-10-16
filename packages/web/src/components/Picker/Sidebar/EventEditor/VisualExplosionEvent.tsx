import { Field, Input, makeStyles, Select, Textarea } from '@fluentui/react-components';
import { useCallback, useMemo } from 'react';
import { useAppStore } from '../../../../stores/app';
import { useExplosionEventStore } from '../../../../stores/visual';
import { EmissionColor, EmissionColorOptions, ObservationForm, ObservationFormOptions, VEIScaleOptions } from '../../../../types/observation';

const useStyles = makeStyles({
  textArea: {
    '& textarea': {
      height: '150px',
      maxHeight: '250px',
    },
  },
});

const VisualExplosionEvent = () => {
  const { observationForm, columnHeight, color, intensity, vei, note, setObservationForm, setColumnHeight, setIntensity, setColor, setVei, setNote } =
    useExplosionEventStore();
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

  const handleColumnHeightChange = useCallback(
    (value: string) => {
      if (!value.length) {
        return;
      }
      setColumnHeight(parseFloat(value));
    },
    [setColumnHeight]
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

  const handleVeiChange = useCallback(
    (value: string) => {
      if (!value.length) {
        return;
      }
      setVei(parseFloat(value));
    },
    [setVei]
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
      <Field label={'Column Height (m)'}>
        <Input type="number" appearance={appearance} min={0} value={columnHeight.toString()} onChange={(_, data) => handleColumnHeightChange(data.value)} />
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
      <Field label={'Intensity (kt)'}>
        <Input appearance={appearance} type="number" min={0} value={intensity.toString()} onChange={(_, data) => handleIntensityChange(data.value)} />
      </Field>
      <Field label={'VEI Scale'}>
        <Select appearance={appearance} defaultValue={vei} onChange={(_, data) => handleVeiChange(data.value)}>
          {VEIScaleOptions.map((option) => {
            return (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            );
          })}
        </Select>
      </Field>
      <Field label={'Note'}>
        <Textarea
          className={styles.textArea}
          appearance={appearance}
          resize="vertical"
          size="large"
          value={note}
          onChange={(_, data) => handleNoteChange(data.value)}
        ></Textarea>
      </Field>
    </div>
  );
};

export default VisualExplosionEvent;
