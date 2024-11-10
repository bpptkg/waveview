import { Button, Field, Input, Label, Select, Switch } from '@fluentui/react-components';
import React, { useMemo } from 'react';
import { useAppStore } from '../../../stores/app';
import { useFilterStore } from '../../../stores/filter';
import { FilterType, TaperType } from '../../../types/filter';
import { usePickerContext } from '../PickerContext';

const validateFreq = (value: number) => {
  if (value <= 0) {
    return 0.001;
  }
  return Math.min(value, 50);
};

const BandpassFilter = () => {
  const { bandpass, setBandpass } = useFilterStore();

  const handleFreqminChange = (value: string) => {
    const freqmin = parseFloat(value);
    if (isNaN(freqmin)) {
      setBandpass({ ...bandpass, freqmin: 0.001 });
    } else {
      setBandpass({ ...bandpass, freqmin: validateFreq(freqmin) });
    }
  };

  const handleFreqmaxChange = (value: string) => {
    const freqmax = parseFloat(value);
    if (isNaN(freqmax)) {
      setBandpass({ ...bandpass, freqmax: 0.001 });
    } else {
      setBandpass({ ...bandpass, freqmax: validateFreq(freqmax) });
    }
  };

  const handleOrderChange = (value: string) => {
    if (isNaN(parseFloat(value))) {
      setBandpass({ ...bandpass, order: 0 });
    } else {
      setBandpass({ ...bandpass, order: parseFloat(value) });
    }
  };

  const handleZeroPhaseChange = (value: boolean) => {
    setBandpass({ ...bandpass, zerophase: value });
  };

  const { darkMode } = useAppStore();
  const appearance = useMemo(() => {
    return darkMode ? 'filled-lighter' : 'filled-darker';
  }, [darkMode]);

  return (
    <div>
      <Field label={'Freq min (Hz)'}>
        <Input
          appearance={appearance}
          type="number"
          min={0.001}
          step={0.01}
          max={50}
          value={bandpass.freqmin.toString()}
          onChange={(_, data) => handleFreqminChange(data.value)}
        />
      </Field>
      <Field label={'Freq max (Hz)'}>
        <Input
          appearance={appearance}
          type="number"
          min={0.001}
          step={0.01}
          max={50}
          value={bandpass.freqmax.toString()}
          onChange={(_, data) => handleFreqmaxChange(data.value)}
        />
      </Field>
      <Field label={'Order'}>
        <Input appearance={appearance} type="number" min={0} value={bandpass.order.toString()} onChange={(_, data) => handleOrderChange(data.value)} />
      </Field>
      <Switch label={'Zero phase'} checked={bandpass.zerophase} onChange={(e) => handleZeroPhaseChange(e.target.checked)} />
    </div>
  );
};

const LowpassFilter = () => {
  const { lowpass, setLowpass } = useFilterStore();

  const handleFreqChange = (value: string) => {
    const freq = parseFloat(value);
    if (isNaN(freq)) {
      setLowpass({ ...lowpass, freq: 0.001 });
    } else {
      setLowpass({ ...lowpass, freq: validateFreq(freq) });
    }
  };

  const handleOrderChange = (value: string) => {
    if (isNaN(parseFloat(value))) {
      setLowpass({ ...lowpass, order: 0 });
    } else {
      setLowpass({ ...lowpass, order: parseFloat(value) });
    }
  };

  const handleZeroPhaseChange = (value: boolean) => {
    setLowpass({ ...lowpass, zerophase: value });
  };

  const { darkMode } = useAppStore();
  const appearance = useMemo(() => {
    return darkMode ? 'filled-lighter' : 'filled-darker';
  }, [darkMode]);

  return (
    <div>
      <Field label={'Freq (Hz)'}>
        <Input
          appearance={appearance}
          type="number"
          min={0.001}
          step={0.01}
          max={50}
          value={lowpass.freq.toString()}
          onChange={(_, data) => handleFreqChange(data.value)}
        />
      </Field>
      <Field label={'Order'}>
        <Input appearance={appearance} type="number" min={0} value={lowpass.order.toString()} onChange={(_, data) => handleOrderChange(data.value)} />
      </Field>
      <Switch label={'Zero phase'} checked={lowpass.zerophase} onChange={(e) => handleZeroPhaseChange(e.target.checked)} />
    </div>
  );
};

const HighpassFilter = () => {
  const { highpass, setHighpass } = useFilterStore();

  const handleFreqChange = (value: string) => {
    const freq = parseFloat(value);
    if (isNaN(freq)) {
      setHighpass({ ...highpass, freq: 0.001 });
    } else {
      setHighpass({ ...highpass, freq: validateFreq(freq) });
    }
  };

  const handleOrderChange = (value: string) => {
    if (isNaN(parseFloat(value))) {
      setHighpass({ ...highpass, order: 0 });
    } else {
      setHighpass({ ...highpass, order: parseFloat(value) });
    }
  };

  const handleZeroPhaseChange = (value: boolean) => {
    setHighpass({ ...highpass, zerophase: value });
  };

  const { darkMode } = useAppStore();
  const appearance = useMemo(() => {
    return darkMode ? 'filled-lighter' : 'filled-darker';
  }, [darkMode]);

  return (
    <div>
      <Field label={'Freq (Hz)'}>
        <Input
          appearance={appearance}
          type="number"
          min={0.001}
          step={0.01}
          max={50}
          value={highpass.freq.toString()}
          onChange={(_, data) => handleFreqChange(data.value)}
        />
      </Field>
      <Field label={'Order'}>
        <Input appearance={appearance} type="number" min={0} value={highpass.order.toString()} onChange={(_, data) => handleOrderChange(data.value)} />
      </Field>
      <Switch label={'Zero phase'} checked={highpass.zerophase} onChange={(e) => handleZeroPhaseChange(e.target.checked)} />
    </div>
  );
};

const TaperOptions = () => {
  const { taperType, taperWidth, setTaperType, setTaperWidth } = useFilterStore();

  const handleTaperTypeChange = (value: string) => {
    setTaperType(value as TaperType);
  };

  const handleTaperWidthChange = (value: string) => {
    if (isNaN(parseFloat(value))) {
      setTaperWidth(0);
    } else {
      setTaperWidth(parseFloat(value));
    }
  };

  const { darkMode } = useAppStore();
  const appearance = useMemo(() => {
    return darkMode ? 'filled-lighter' : 'filled-darker';
  }, [darkMode]);

  return (
    <div>
      <Field label={'Taper type'}>
        <Select appearance={appearance} defaultValue={taperType} onChange={(_, data) => handleTaperTypeChange(data.value)}>
          <option value="none">None</option>
          <option value="cosine">Cosine</option>
          <option value="barthann">Barthann</option>
          <option value="bartlett">Bartlett</option>
          <option value="blackman">Blackman</option>
          <option value="blackmanharris">Blackmanharris</option>
          <option value="bohman">Bohman</option>
          <option value="boxcar">Boxcar</option>
          <option value="chebwin">Chebwin</option>
          <option value="flattop">Flattop</option>
          <option value="gaussian">Gaussian</option>
          <option value="general_gaussian">General gaussian</option>
          <option value="hamming">Hamming</option>
          <option value="hann">Hann</option>
          <option value="kaiser">Kaiser</option>
          <option value="nuttall">Nuttall</option>
          <option value="parzen">Parzen</option>
          <option value="slepian">Slepian</option>
          <option value="triang">Triang</option>
        </Select>
      </Field>
      <Field label={'Taper width (%)'}>
        <Input
          appearance={appearance}
          type="number"
          min={0}
          step={1}
          max={50}
          value={taperWidth.toString()}
          onChange={(_, data) => handleTaperWidthChange(data.value)}
        />
      </Field>
    </div>
  );
};

const FilterToolbox: React.FC = () => {
  const { seisChartRef } = usePickerContext();
  const { filterType, appliedFilter, setFilterType, setAppliedFilter, buildFilterOptions } = useFilterStore();

  const handleFilterTypeChange = (value: string) => {
    setFilterType(value as FilterType);
  };

  const handleReset = () => {
    seisChartRef.current?.resetFilter();
    setAppliedFilter(null);
  };

  const handleApply = () => {
    const options = buildFilterOptions();
    if (!options) {
      return;
    }
    seisChartRef.current?.applyFilter(options);
    setAppliedFilter(options);
  };

  const { darkMode } = useAppStore();
  const appearance = useMemo(() => {
    return darkMode ? 'filled-lighter' : 'filled-darker';
  }, [darkMode]);

  return (
    <div>
      <div className="flex items-center justify-start px-2 h-[40px] border-b dark:border-b-gray-800">
        <div className="font-semibold">Filter Toolbox</div>
      </div>
      <div className="p-2 mb-4">
        <Field label="Type">
          <Select appearance={appearance} defaultValue={filterType} onChange={(_, data) => handleFilterTypeChange(data.value)}>
            <option value="bandpass">Bandpass</option>
            <option value="lowpass">Lowpass</option>
            <option value="highpass">Highpass</option>
          </Select>
        </Field>
        <div className="mt-2">
          <Label>Options</Label>
          {filterType === 'bandpass' && <BandpassFilter />}
          {filterType === 'lowpass' && <LowpassFilter />}
          {filterType === 'highpass' && <HighpassFilter />}
        </div>
        <div className="mt-2">
          <TaperOptions />
        </div>

        <div className="flex gap-1 justify-end mt-2">
          <Button appearance="subtle" onClick={handleReset} disabled={appliedFilter === null}>
            Reset
          </Button>
          <Button appearance="primary" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterToolbox;
