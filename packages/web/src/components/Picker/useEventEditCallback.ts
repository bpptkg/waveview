import { useCallback } from 'react';
import { usePickerStore } from '../../stores/picker';
import { SeismicEventDetail } from '../../types/event';
import { usePickerContext } from './PickerContext';
import { useHelicorderCallback } from './useHelicorderCallback';

export const useEventEditCallback = () => {
  const { pickStart, clearPick, addEventMarker, setPickRange, resetEditedEvent } = usePickerStore();
  const { seisChartRef, props } = usePickerContext();
  const { onCancel, onSave } = props;

  const handlePickDurationChange = useCallback(
    (duration: number) => {
      const end = pickStart + duration * 1000;
      setPickRange([pickStart, end]);
      seisChartRef.current?.setPickRange([pickStart, end]);
    },
    [seisChartRef, pickStart, setPickRange]
  );

  const { handlePlotEventMarkers } = useHelicorderCallback();

  const handlePickCancel = useCallback(() => {
    resetEditedEvent();
    handlePlotEventMarkers();
    clearPick();
    onCancel?.();
    seisChartRef.current?.clearPickRange();
  }, [seisChartRef, clearPick, onCancel, handlePlotEventMarkers, resetEditedEvent]);

  const handlePickSave = useCallback(
    (savedEvent: SeismicEventDetail) => {
      resetEditedEvent();
      addEventMarker(savedEvent);
      handlePlotEventMarkers();
      clearPick();
      onSave?.(savedEvent);
      seisChartRef.current?.clearPickRange();
    },
    [seisChartRef, clearPick, addEventMarker, onSave, handlePlotEventMarkers, resetEditedEvent]
  );
  return { handlePickDurationChange, handlePickCancel, handlePickSave };
};
