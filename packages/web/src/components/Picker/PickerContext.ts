import { createContext, MutableRefObject, useContext } from 'react';
import { HelicorderChartRef } from './HelicorderChart';
import { PickerProps } from './Picker.types';
import { SeismogramChartRef } from './SeismogramChart';
import { ContextMenuRef } from './SeismogramContextMenu';

export interface PickerContextValue {
  props: PickerProps;
  seisChartRef: MutableRefObject<SeismogramChartRef | null>;
  heliChartRef: MutableRefObject<HelicorderChartRef | null>;
  contextMenuRef: MutableRefObject<ContextMenuRef | null>;
  seisChartReadyRef: MutableRefObject<boolean>;
  heliChartReadyRef: MutableRefObject<boolean>;
  setSeisChartRef: (ref: SeismogramChartRef | null) => void;
  setHeliChartRef: (ref: HelicorderChartRef | null) => void;
  setContextMenuRef: (ref: ContextMenuRef | null) => void;
  setSeisChartReady: (ready: boolean) => void;
  setHeliChartReady: (ready: boolean) => void;
}

export const PickerContext = createContext<PickerContextValue | null>(null);

export const usePickerContext = (): PickerContextValue => {
  const value = useContext(PickerContext);
  if (!value) {
    throw new Error('usePickerContext must be used within a PickerContextProvider');
  }
  return value;
};

export const useDefaultProps = (props: PickerProps): PickerProps => {
  return {
    ...props,
  };
};
