import { BandpassFilterOptions, FilterOperationOptions, LowpassFilterOptions } from '../types/filter';
import { FilterOptions } from '../types/picker';

export const extractFilterOperationOptions = (appliedFilter: FilterOperationOptions | null): FilterOptions | null => {
  if (!appliedFilter) {
    return null;
  }
  const taper = appliedFilter.taperType;
  const taper_width = appliedFilter.taperWidth;
  const id = appliedFilter.id;
  if (appliedFilter.filterType === 'bandpass') {
    const { freqmin, freqmax, zerophase, order } = appliedFilter.filterOptions as BandpassFilterOptions;
    return {
      type: 'bandpass',
      id,
      freqmin,
      freqmax,
      zerophase,
      order,
      taper,
      taper_width,
    };
  } else if (appliedFilter.filterType === 'lowpass') {
    const { freq, zerophase, order } = appliedFilter.filterOptions as LowpassFilterOptions;
    return {
      type: 'lowpass',
      id,
      freq,
      zerophase,
      order,
      taper,
      taper_width,
    };
  } else if (appliedFilter.filterType === 'highpass') {
    const { freq, zerophase, order } = appliedFilter.filterOptions as LowpassFilterOptions;
    return {
      type: 'highpass',
      id,
      freq,
      zerophase,
      order,
      taper,
      taper_width,
    };
  } else {
    throw new Error('Invalid filter type');
  }
};
