import { useMemo } from 'react';
import { EmissionColorOptions, EventSizeOptions, ObservationFormOptions } from '../types/observation';

export const useVisualHook = () => {
  const getObservationFormLabel = (value?: string | undefined | null): string => {
    if (!value) {
      return '';
    }
    const label = ObservationFormOptions.find((option) => option.value === value)?.label;
    if (!label) {
      return '';
    }
    return label;
  };
  const getEmissionColorLabel = (value?: string | undefined | null): string => {
    if (!value) {
      return '';
    }
    const label = EmissionColorOptions.find((option) => option.value === value)?.label;
    if (!label) {
      return '';
    }
    return label;
  };
  const getEventSizeLabel = (value?: string | undefined | null): string => {
    if (!value) {
      return '';
    }
    const label = EventSizeOptions.find((option) => option.value === value)?.label;
    if (!label) {
      return '';
    }
    return label;
  };

  return useMemo(
    () => ({
      getObservationFormLabel,
      getEmissionColorLabel,
      getEventSizeLabel,
    }),
    []
  );
};
