import { Field, Input, makeStyles, Select, Textarea } from '@fluentui/react-components';
import { useCallback, useMemo } from 'react';
import { useAppStore } from '../../../../stores/app';
import { useTectonicEventStore } from '../../../../stores/visual';
import { MMIScale, MMIScaleOptions } from '../../../../types/observation';

const useStyles = makeStyles({
  textArea: {
    '& textarea': {
      height: '150px',
      maxHeight: '250px',
    },
  },
});

const VisualTectonicEvent = () => {
  const { mmiScale, magnitude, depth, note, setMmiScale, setMagnitude, setDepth, setNote } = useTectonicEventStore();
  const styles = useStyles();
  const { darkMode } = useAppStore();
  const appearance = useMemo(() => {
    return darkMode ? 'filled-lighter' : 'filled-darker';
  }, [darkMode]);

  const handleMMIScaleChange = useCallback(
    (value: string) => {
      setMmiScale(value as MMIScale);
    },
    [setMmiScale]
  );

  const handleMagnitudeChange = useCallback(
    (value: string) => {
      if (!value.length) {
        return;
      }
      setMagnitude(parseFloat(value));
    },
    [setMagnitude]
  );

  const handleDepthChange = useCallback(
    (value: string) => {
      if (!value.length) {
        return;
      }
      setDepth(parseFloat(value));
    },
    [setDepth]
  );

  const handleNoteChange = useCallback(
    (value: string) => {
      setNote(value);
    },
    [setNote]
  );

  return (
    <div>
      <Field label={'MMI Scale'}>
        <Select appearance={appearance} defaultValue={mmiScale} onChange={(_, data) => handleMMIScaleChange(data.value)}>
          {MMIScaleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={'Magnitude'}>
        <Input appearance={appearance} type="number" min={0} value={magnitude.toString()} onChange={(_, data) => handleMagnitudeChange(data.value)} />
      </Field>
      <Field label={'Depth (km)'}>
        <Input appearance={appearance} type="number" min={0} value={depth.toString()} onChange={(_, data) => handleDepthChange(data.value)} />
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

export default VisualTectonicEvent;
