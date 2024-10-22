import { BandpassFilterOptions, FilterOperationOptions, FilterType, HighpassFilterOptions, LowpassFilterOptions, TaperType } from '../../types/filter';

export interface FilterStore {
  appliedFilter: FilterOperationOptions | null;
  filterType: FilterType;
  bandpass: BandpassFilterOptions;
  lowpass: LowpassFilterOptions;
  highpass: HighpassFilterOptions;
  taperType: TaperType;
  taperWidth: number;
  setFilterType: (filterType: FilterType) => void;
  setBandpass: (bandpass: BandpassFilterOptions) => void;
  setLowpass: (lowpass: LowpassFilterOptions) => void;
  setHighpass: (highpass: HighpassFilterOptions) => void;
  clearFilter: () => void;
  setTaperType: (taperType: TaperType) => void;
  setTaperWidth: (taperWidth: number) => void;
  setAppliedFilter: (filter: FilterOperationOptions | null) => void;
  buildFilterOptions: () => FilterOperationOptions | null;
  resetFilterState: () => void;
}
