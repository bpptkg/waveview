import { Button, Field, Input, Label, Select, Switch } from '@fluentui/react-components';
import React from 'react';
import { useFilterStore } from '../../../stores/filter';
import { FilterType, TaperType } from '../../../types/filter';
import { usePickerContext } from '../PickerContext';

const BandpassFilter = () => {
  const { bandpass, setBandpass } = useFilterStore();
  const handleFreqminChange = (value: string) => {
    if (isNaN(parseFloat(value))) {
      return;
    }
    setBandpass({ ...bandpass, freqmin: parseFloat(value) });
  };
  const handleFreqmaxChange = (value: string) => {
    if (isNaN(parseFloat(value))) {
      return;
    }
    setBandpass({ ...bandpass, freqmax: parseFloat(value) });
  };
  const handleOrderChange = (value: string) => {
    if (isNaN(parseFloat(value))) {
      return;
    }
    setBandpass({ ...bandpass, order: parseFloat(value) });
  };
  const handleZeroPhaseChange = (value: boolean) => {
    setBandpass({ ...bandpass, zerophase: value });
  };
  return (
    <div>
      <Field label={'Freq min (Hz)'}>
        <Input type="number" min={0.01} value={bandpass.freqmin.toString()} onChange={(_, data) => handleFreqminChange(data.value)} />
      </Field>
      <Field label={'Freq max (Hz)'}>
        <Input type="number" min={0.01} value={bandpass.freqmax.toString()} onChange={(_, data) => handleFreqmaxChange(data.value)} />
      </Field>
      <Field label={'Order'}>
        <Input type="number" min={0} value={bandpass.order.toString()} onChange={(_, data) => handleOrderChange(data.value)} />
      </Field>
      <Switch label={'Zero phase'} checked={bandpass.zerophase} onChange={(e) => handleZeroPhaseChange(e.target.checked)} />
    </div>
  );
};

const LowpassFilter = () => {
  const { lowpass, setLowpass } = useFilterStore();
  const handleFreqChange = (value: string) => {
    if (isNaN(parseFloat(value))) {
      return;
    }
    setLowpass({ ...lowpass, freq: parseFloat(value) });
  };
  const handleOrderChange = (value: string) => {
    if (isNaN(parseFloat(value))) {
      return;
    }
    setLowpass({ ...lowpass, order: parseFloat(value) });
  };
  const handleZeroPhaseChange = (value: boolean) => {
    setLowpass({ ...lowpass, zerophase: value });
  };
  return (
    <div>
      <Field label={'Freq (Hz)'}>
        <Input type="number" min={0.01} value={lowpass.freq.toString()} onChange={(_, data) => handleFreqChange(data.value)} />
      </Field>
      <Field label={'Order'}>
        <Input type="number" min={0} value={lowpass.order.toString()} onChange={(_, data) => handleOrderChange(data.value)} />
      </Field>
      <Switch label={'Zero phase'} checked={lowpass.zerophase} onChange={(e) => handleZeroPhaseChange(e.target.checked)} />
    </div>
  );
};

const HighpassFilter = () => {
  const { highpass, setHighpass } = useFilterStore();
  const handleFreqChange = (value: string) => {
    if (isNaN(parseFloat(value))) {
      return;
    }
    setHighpass({ ...highpass, freq: parseFloat(value) });
  };
  const handleOrderChange = (value: string) => {
    if (isNaN(parseFloat(value))) {
      return;
    }
    setHighpass({ ...highpass, order: parseFloat(value) });
  };
  const handleZeroPhaseChange = (value: boolean) => {
    setHighpass({ ...highpass, zerophase: value });
  };
  return (
    <div>
      <Field label={'Freq (Hz)'}>
        <Input type="number" min={0.01} value={highpass.freq.toString()} onChange={(_, data) => handleFreqChange(data.value)} />
      </Field>
      <Field label={'Order'}>
        <Input type="number" min={0} value={highpass.order.toString()} onChange={(_, data) => handleOrderChange(data.value)} />
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
      return;
    }
    setTaperWidth(parseFloat(value));
  };
  return (
    <div>
      <Field label={'Taper type'}>
        <Select defaultValue={taperType} onChange={(_, data) => handleTaperTypeChange(data.value)}>
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
        <Input type="number" min={0} step={50} value={taperWidth.toString()} onChange={(_, data) => handleTaperWidthChange(data.value)} />
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

  return (
    <div className="p-2 mb-4">
      <div>
        <Field label={'Filter type'}>
          <Select defaultValue={filterType} onChange={(_, data) => handleFilterTypeChange(data.value)}>
            <option value="bandpass">Bandpass</option>
            <option value="lowpass">Lowpass</option>
            <option value="highpass">Highpass</option>
          </Select>
        </Field>
      </div>
      <div className="mt-2">
        <Label>Options</Label>
        {filterType === 'bandpass' && <BandpassFilter />}
        {filterType === 'lowpass' && <LowpassFilter />}
        {filterType === 'highpass' && <HighpassFilter />}
      </div>
      <div className="mt-2">
        <Label>Taper</Label>
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
  );
};

export default FilterToolbox;
