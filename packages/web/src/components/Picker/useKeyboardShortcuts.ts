import React, { useEffect } from 'react';
import { SeismogramChartRef } from './SeismogramChart';
import { usePickerStore } from '../../stores/picker';

export function useKeyboardShortcuts(seisChartRef: React.MutableRefObject<SeismogramChartRef | null>) {
  const { seismogramToolbarAddCheckedValue, seismogramToolbarRemoveCheckedValue } = usePickerStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!seisChartRef.current || !seisChartRef.current.isFocused()) {
        return;
      }

      switch (event.key) {
        case 'z':
        case 'Z': {
          if (seisChartRef.current.isZoomRectangleActive()) {
            seisChartRef.current.deactivateZoomRectangle();
            seismogramToolbarRemoveCheckedValue('options', 'zoom-rectangle');
          } else {
            seisChartRef.current?.activateZoomRectangle();
            seismogramToolbarAddCheckedValue('options', 'zoom-rectangle');
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [seisChartRef, seismogramToolbarAddCheckedValue, seismogramToolbarRemoveCheckedValue]);
}
