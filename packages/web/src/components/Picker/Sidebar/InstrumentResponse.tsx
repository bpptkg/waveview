import {
  Button,
  Field,
  Input,
  Label,
  makeStyles,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Select,
  Spinner,
  Switch,
  tokens,
  Tooltip,
} from '@fluentui/react-components';
import { EditRegular } from '@fluentui/react-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatTime } from '../../../shared/formatting';
import { useAppStore } from '../../../stores/app';
import { usePickerStore } from '../../../stores/picker';
import { usePlotRemoveResponseStore } from '../../../stores/plotRemoveResponse';
import { Channel } from '../../../types/channel';
import { FieldType } from '../../../types/instrumentResponse';
import ChannelSelector from '../ChannelSelector';

const useStreamIdSelectorStyles = makeStyles({
  btn: {
    minWidth: 'auto',
  },
  searchBoxWrapper: {
    marginBottom: tokens.spacingVerticalMNudge,
  },
  searchBox: {
    width: '200px',
  },
  popoverSurface: {
    borderRadius: '16px',
  },
  toolbar: {
    gap: '3px',
  },
});

const StreamIdSelector: React.FC = () => {
  const [open, setOpen] = useState(false);
  const styles = useStreamIdSelectorStyles();
  const { channel, setChannel } = usePlotRemoveResponseStore();

  const handleChannelChange = useCallback(
    (channel: Channel) => {
      setChannel(channel);
      setOpen(false);
    },
    [setChannel]
  );

  return (
    <Popover trapFocus open={open} onOpenChange={() => setOpen(!open)} positioning="below">
      <PopoverTrigger disableButtonEnhancement>
        <Tooltip content="Change Stream ID" relationship="label" showDelay={1500}>
          <Button appearance="transparent" aria-label="Select Stream ID" icon={<EditRegular />} />
        </Tooltip>
      </PopoverTrigger>
      <PopoverSurface className={styles.popoverSurface}>
        <ChannelSelector channelId={channel?.id} onChange={handleChannelChange} />
      </PopoverSurface>
    </Popover>
  );
};

const InstrumentResponseEmpty: React.FC = () => {
  return <div className="text-center">No pick selected</div>;
};

const InstrumentResponseResult: React.FC = () => {
  const { result } = usePlotRemoveResponseStore();
  if (!result) {
    return <div>No data</div>;
  }
  return (
    <div>
      <Label>Result</Label>

      {result.empty ? (
        <div>No data</div>
      ) : (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            const newWindow = window.open();
            if (newWindow) {
              newWindow.document.write(`<img src="${result.image}" alt="Instrument Response" />`);
            }
          }}
        >
          <img className="rounded-lg shadow-sm border border-gray-300 dark:border-gray-700" src={result.image} alt="Instrument Response" />
        </a>
      )}

      <div className="mt-2">
        <Label>Amplitude</Label>
        <div className="flex flex-col gap-1 border rounded-lg p-2 border-gray-300 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <Tooltip content="The minimum amplitude of the signal." relationship="description" showDelay={1500}>
              <span>Min</span>
            </Tooltip>
            <span>{result.amplitude_min.toExponential(4)}</span>
          </div>

          <div className="flex items-center justify-between">
            <Tooltip content="The maximum amplitude of the signal." relationship="description" showDelay={1500}>
              <span>Max</span>
            </Tooltip>
            <span>{result.amplitude_max.toExponential(4)}</span>
          </div>

          <div className="flex items-center justify-between">
            <Tooltip content="The half of peak to peak amplitude." relationship="description" showDelay={1500}>
              <span>Peak</span>
            </Tooltip>
            <span>{result.amplitude_peak.toExponential(4)}</span>
          </div>

          <div className="flex items-center justify-between">
            <Tooltip content="The unit of the amplitude." relationship="description" showDelay={1500}>
              <span>Unit</span>
            </Tooltip>
            <span>{result.amplitude_unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const InstrumentResponseError: React.FC = () => {
  const { error } = usePlotRemoveResponseStore();
  return <div>Error: {error}</div>;
};

const useStyles = makeStyles({
  freqInput: {
    width: '100%',
  },
});

const InstrumentResponseContent: React.FC = () => {
  const styles = useStyles();
  const { darkMode, useUTC } = useAppStore();
  const appearance = useMemo(() => {
    return darkMode ? 'filled-lighter' : 'filled-darker';
  }, [darkMode]);
  const { time, duration } = usePickerStore();
  const hasMounted = useRef(false);

  const {
    result,
    error,
    loading,
    channel,
    output,
    useWaterLevel,
    waterLevel,
    usePreFilter,
    f1,
    f2,
    f3,
    f4,
    zeroMean,
    taper,
    taperFraction,
    setOutput,
    setUseWaterLevel,
    setWaterLevel,
    setUsePreFilter,
    setF1,
    setF2,
    setF3,
    setF4,
    setZeroMean,
    setTaper,
    setTaperFraction,
    fetchPlotRemoveResponse,
    clearResult,
  } = usePlotRemoveResponseStore();

  useEffect(() => {
    if (hasMounted.current) {
      clearResult();
    } else {
      hasMounted.current = true;
    }
  }, [time, duration, clearResult]);

  const handleOutputChange = useCallback(
    (value: string) => {
      setOutput(value as FieldType);
    },
    [setOutput]
  );

  const handleUseWaterLevelChange = useCallback(
    (value: boolean) => {
      setUseWaterLevel(value);
    },
    [setUseWaterLevel]
  );

  const handleWaterLevelChange = useCallback(
    (value: string) => {
      if (isNaN(parseFloat(value))) {
        setWaterLevel(0);
      } else {
        setWaterLevel(parseFloat(value));
      }
    },
    [setWaterLevel]
  );

  const handleUsePreFilterChange = useCallback(
    (value: boolean) => {
      setUsePreFilter(value);
    },
    [setUsePreFilter]
  );

  const handleF1Change = useCallback(
    (value: string) => {
      if (isNaN(parseFloat(value))) {
        setF1(0);
      } else {
        setF1(parseFloat(value));
      }
    },
    [setF1]
  );

  const handleF2Change = useCallback(
    (value: string) => {
      if (isNaN(parseFloat(value))) {
        setF2(0);
      } else {
        setF2(parseFloat(value));
      }
    },
    [setF2]
  );

  const handleF3Change = useCallback(
    (value: string) => {
      if (isNaN(parseFloat(value))) {
        setF3(0);
      } else {
        setF3(parseFloat(value));
      }
    },
    [setF3]
  );

  const handleF4Change = useCallback(
    (value: string) => {
      if (isNaN(parseFloat(value))) {
        setF4(0);
      } else {
        setF4(parseFloat(value));
      }
    },
    [setF4]
  );

  const handleZeroMeanChange = useCallback(
    (value: boolean) => {
      setZeroMean(value);
    },
    [setZeroMean]
  );

  const handleTaperChange = useCallback(
    (value: boolean) => {
      setTaper(value);
    },
    [setTaper]
  );

  const handleTaperFractionChange = useCallback(
    (value: string) => {
      if (isNaN(parseFloat(value))) {
        setTaperFraction(0);
      } else {
        setTaperFraction(parseFloat(value));
      }
    },
    [setTaperFraction]
  );

  const canSubmit = useMemo(() => {
    return channel !== null;
  }, [channel]);

  const handleApply = useCallback(() => {
    fetchPlotRemoveResponse();
  }, [fetchPlotRemoveResponse]);

  return (
    <div>
      <Field label="Time">
        <span>{formatTime(time, { useUTC })}</span>
      </Field>

      <Field label="Duration">
        <span>{duration} s</span>
      </Field>

      <Field label="Stream ID">
        <div className="flex flex-wrap items-center">
          <span>{channel?.stream_id ?? 'None'}</span>
          <StreamIdSelector />
        </div>
      </Field>

      <Field label="Output">
        <Select appearance={appearance} defaultValue={output} onChange={(_, data) => handleOutputChange(data.value)}>
          <option value="DISP">Displacement</option>
          <option value="VEL">Velocity</option>
          <option value="ACC">Acceleration</option>
          <option value="DEF">Default</option>
        </Select>
      </Field>

      <Switch label="Use Pre-Filter" checked={usePreFilter} onChange={(e) => handleUsePreFilterChange(e.target.checked)} />
      {usePreFilter && (
        <Field label="Pre-Filter (Hz)">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <Label>f1:</Label>
              <Input
                className={styles.freqInput}
                appearance={appearance}
                type="number"
                min={0}
                step={0.01}
                max={50}
                value={f1.toString()}
                onChange={(_, data) => handleF1Change(data.value)}
              />
            </div>
            <div className="flex items-center gap-1">
              <Label>f2:</Label>
              <Input
                className={styles.freqInput}
                appearance={appearance}
                type="number"
                min={0}
                step={0.01}
                max={50}
                value={f2.toString()}
                onChange={(_, data) => handleF2Change(data.value)}
              />
            </div>
            <div className="flex items-center gap-1">
              <Label>f3:</Label>
              <Input
                className={styles.freqInput}
                appearance={appearance}
                type="number"
                min={0}
                step={0.01}
                max={50}
                value={f3.toString()}
                onChange={(_, data) => handleF3Change(data.value)}
              />
            </div>
            <div className="flex items-center gap-1">
              <Label>f4:</Label>
              <Input
                className={styles.freqInput}
                appearance={appearance}
                type="number"
                min={0}
                step={0.01}
                max={50}
                value={f4.toString()}
                onChange={(_, data) => handleF4Change(data.value)}
              />
            </div>
          </div>
        </Field>
      )}

      <Field>
        <Switch label="Use Water Level" checked={useWaterLevel} onChange={(e) => handleUseWaterLevelChange(e.target.checked)} />
      </Field>
      {useWaterLevel && (
        <Field label="Water Level">
          <Input
            appearance={appearance}
            type="number"
            min={0}
            step={1}
            value={waterLevel.toString()}
            onChange={(_, data) => handleWaterLevelChange(data.value)}
          />
        </Field>
      )}

      <Field>
        <Switch label="Zero Mean" checked={zeroMean} onChange={(e) => handleZeroMeanChange(e.target.checked)} />
      </Field>

      <Field>
        <Switch label="Taper" checked={taper} onChange={(e) => handleTaperChange(e.target.checked)} />
      </Field>
      {taper && (
        <Field label="Taper width (%)">
          <Input
            appearance={appearance}
            type="number"
            min={0}
            step={50}
            value={taperFraction.toString()}
            onChange={(_, data) => handleTaperFractionChange(data.value)}
          />
        </Field>
      )}

      <div className="flex gap-1 justify-end mt-2">
        <Button appearance="primary" onClick={handleApply} disabled={!canSubmit} icon={loading ? <Spinner size="tiny" /> : undefined}>
          {loading ? 'Loading...' : 'Apply'}
        </Button>
      </div>

      <div className="mt-4">{error ? <InstrumentResponseError /> : result ? <InstrumentResponseResult /> : null}</div>
    </div>
  );
};

const InstrumentResponse: React.FC = () => {
  const { isPickEmpty } = usePickerStore();
  return (
    <div>
      <div className="flex items-center justify-start px-2 h-[40px] border-b dark:border-b-gray-800">
        <div className="font-semibold">Instrument Response</div>
      </div>
      <div className="p-2 mb-10">{isPickEmpty() ? <InstrumentResponseEmpty /> : <InstrumentResponseContent />}</div>
    </div>
  );
};

export default InstrumentResponse;
