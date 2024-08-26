import { useCallback, useMemo } from 'react';
import { getEventTypeColor } from '../../shared/theme';
import { useAppStore } from '../../stores/app';
import { usePickerStore } from '../../stores/picker';
import { SeismicEventDetail } from '../../types/event';
import { usePickerContext } from './PickerContext';

export const useEventEditCallback = () => {
  const { pickStart, pickEnd, clearPick, addEventMarker, setPickRange } = usePickerStore();
  const { seisChartRef, heliChartRef, props } = usePickerContext();
  const { event, onCancel, onSave } = props;
  const { darkMode } = useAppStore();

  const isEditMode = useMemo(() => {
    return !!event;
  }, [event]);

  const handlePickDurationChange = useCallback(
    (duration: number) => {
      const end = pickStart + duration * 1000;
      setPickRange([pickStart, end]);
      seisChartRef.current?.setPickRange([pickStart, end]);
    },
    [seisChartRef, pickStart, setPickRange]
  );

  const handlePickCancel = useCallback(() => {
    clearPick();
    seisChartRef.current?.clearPickRange();
    onCancel?.();
  }, [seisChartRef, clearPick, onCancel]);

  const handlePickSave = useCallback(
    (savedEvent: SeismicEventDetail) => {
      onSave?.(savedEvent);

      if (!isEditMode) {
        addEventMarker(savedEvent);
      }

      if (pickStart && pickEnd) {
        const { time, duration } = savedEvent;
        const start = new Date(time).getTime();
        const end = start + duration * 1_000;
        const color = getEventTypeColor(savedEvent.type, darkMode);
        seisChartRef.current?.addEventMarker({
          start,
          end,
          color,
        });
        heliChartRef.current?.addEventMarker({ value: start, color, width: 3 });
        seisChartRef.current?.clearPickRange();
        clearPick();
      }
    },
    [seisChartRef, heliChartRef, pickStart, pickEnd, isEditMode, darkMode, clearPick, addEventMarker, onSave]
  );
  return { handlePickDurationChange, handlePickCancel, handlePickSave };
};
