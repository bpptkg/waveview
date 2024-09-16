import { useFilterStore } from '../../../stores/filter';
import { BandpassFilterOptions, HighpassFilterOptions, LowpassFilterOptions } from '../../../types/filter';

const FilterStatus = () => {
  const { appliedFilter } = useFilterStore();
  if (!appliedFilter) {
    return null;
  }

  let text = '';
  const { filterType, filterOptions } = appliedFilter;
  if (filterType === 'bandpass') {
    const bandpass = filterOptions as BandpassFilterOptions;
    text = `BP: ${bandpass.freqmin} - ${bandpass.freqmax} Hz, order ${bandpass.order}`;
  } else if (filterType === 'lowpass') {
    const lowpass = filterOptions as LowpassFilterOptions;
    text = `LP: ${lowpass.freq} Hz, order ${lowpass.order}`;
  } else if (filterType === 'highpass') {
    const highpass = filterOptions as HighpassFilterOptions;
    text = `HP: ${highpass.freq} Hz, order ${highpass.order}`;
  }
  return <span className="text-xs dark:text-neutral-grey-84">{text}</span>;
};

export default FilterStatus;
