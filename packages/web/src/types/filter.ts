export type FilterType = 'bandpass' | 'lowpass' | 'highpass' | 'none';
export type TaperType =
  | 'cosine'
  | 'barthann'
  | 'bartlett'
  | 'blackman'
  | 'blackmanharris'
  | 'bohman'
  | 'boxcar'
  | 'chebwin'
  | 'flattop'
  | 'gaussian'
  | 'general_gaussian'
  | 'hamming'
  | 'hann'
  | 'kaiser'
  | 'nuttall'
  | 'parzen'
  | 'slepian'
  | 'triang';

export interface BandpassFilterOptions {
  freqmin: number;
  freqmax: number;
  order: number;
  zerophase: boolean;
}

export interface LowpassFilterOptions {
  freq: number;
  order: number;
  zerophase: boolean;
}

export interface HighpassFilterOptions {
  freq: number;
  order: number;
  zerophase: boolean;
}

export type FilterOptions = BandpassFilterOptions | LowpassFilterOptions | HighpassFilterOptions;

export interface FilterOperationOptions {
  filterType: FilterType;
  filterOptions: FilterOptions;
  taperType: TaperType;
  taperWidth: number;
}
