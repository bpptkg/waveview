import { Field, Input, Select, Textarea } from '@fluentui/react-components';
import { useCallback } from 'react';
import { useVolcanicEmissionEventStore } from '../../../../stores/visual';
import { EmissionColor, EmissionColorOptions, ObservationForm, ObservationFormOptions } from '../../../../types/observation';

const VisualVolcanicEmissionEvent = () => {
  const { observationForm, height, color, intensity, note, setObservationForm, setHeight, setColor, setIntensity, setNote } = useVolcanicEmissionEventStore();
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
      <Field label={'Height (m)'}>
        <Input type="number" min={0} value={height.toString()} onChange={(_, data) => handleHeightChange(data.value)} />
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
      <Field label={'Intensity (ppm)'}>
        <Input type="number" min={0} value={intensity.toString()} onChange={(_, data) => handleIntensityChange(data.value)} />
      </Field>
      <Field label={'Note'}>
        <Textarea resize="vertical" size="large" value={note} onChange={(_, data) => handleNoteChange(data.value)}></Textarea>
      </Field>
    </div>
  );
};

export default VisualVolcanicEmissionEvent;
