import { Field, Input, Select, Textarea } from '@fluentui/react-components';
import { useCallback } from 'react';
import { useExplosionEventStore } from '../../../../stores/visual';
import { EmissionColor, EmissionColorOptions, ObservationForm, ObservationFormOptions, VEIScaleOptions } from '../../../../types/observation';

const VisualExplosionEvent = () => {
  const { observationForm, columnHeight, color, intensity, vei, note, setObservationForm, setColumnHeight, setIntensity, setColor, setVei, setNote } =
    useExplosionEventStore();
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
    <div className="p-2">
      <Field label={'Observation Form'}>
        <Select defaultValue={observationForm} onChange={(_, data) => handleObservationFormChange(data.value)}>
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
        <Input type="number" min={0} value={columnHeight.toString()} onChange={(_, data) => handleColumnHeightChange(data.value)} />
      </Field>
      <Field label={'Color'}>
        <Select defaultValue={color} onChange={(_, data) => handleColorChange(data.value)}>
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
        <Input type="number" min={0} value={intensity.toString()} onChange={(_, data) => handleIntensityChange(data.value)} />
      </Field>
      <Field label={'VEI Scale'}>
        <Select defaultValue={vei} onChange={(_, data) => handleVeiChange(data.value)}>
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
        <Textarea resize="vertical" size="large" value={note} onChange={(_, data) => handleNoteChange(data.value)}></Textarea>
      </Field>
    </div>
  );
};

export default VisualExplosionEvent;
