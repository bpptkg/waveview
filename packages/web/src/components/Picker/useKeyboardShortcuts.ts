import React, { useCallback, useEffect } from 'react';
import { usePickerStore } from '../../stores/picker';
import { HelicorderChartRef } from './HelicorderChart';
import { SeismogramChartRef } from './SeismogramChart';

export function useSeismogramKeyboardShortcuts(chartRef: React.MutableRefObject<SeismogramChartRef | null>) {
  const { isSpectrogramVisible, isSignalVisible, seismogramToolbarAddCheckedValue, seismogramToolbarRemoveCheckedValue } = usePickerStore();

  const onArrowLeft = useCallback(() => {
    chartRef.current?.scrollLeft(0.1);
  }, [chartRef]);

  const onArrowRight = useCallback(() => {
    chartRef.current?.scrollRight(0.1);
  }, [chartRef]);

  const onArrowUp = useCallback(() => {
    chartRef.current?.increaseAmplitude(0.1);
  }, [chartRef]);

  const onArrowDown = useCallback(() => {
    chartRef.current?.decreaseAmplitude(0.1);
  }, [chartRef]);

  const onArrowUpShift = useCallback(() => {
    chartRef.current?.zoomIn(0.1);
  }, [chartRef]);

  const onArrowDownShift = useCallback(() => {
    chartRef.current?.zoomOut(0.1);
  }, [chartRef]);

  const onSKey = useCallback(() => {
    if (isSpectrogramVisible()) {
      chartRef.current?.hideSpectrogram();
      seismogramToolbarRemoveCheckedValue('options', 'spectrogram');
    } else {
      seismogramToolbarAddCheckedValue('options', 'spectrogram');
      chartRef.current?.showSpectrogram();
    }
  }, [chartRef, isSpectrogramVisible, seismogramToolbarAddCheckedValue, seismogramToolbarRemoveCheckedValue]);

  const onTKey = useCallback(() => {
    if (isSignalVisible()) {
      chartRef.current?.hideSignal();
      seismogramToolbarRemoveCheckedValue('options', 'signal');
    } else {
      seismogramToolbarAddCheckedValue('options', 'signal');
      chartRef.current?.showSignal();
    }
  }, [chartRef, isSignalVisible, seismogramToolbarAddCheckedValue, seismogramToolbarRemoveCheckedValue]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!chartRef.current || !chartRef.current.isFocused()) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          onArrowLeft();
          break;
        case 'ArrowRight':
          onArrowRight();
          break;
        case 'ArrowUp': {
          if (event.shiftKey) {
            onArrowUpShift();
          } else {
            onArrowUp();
          }
          break;
        }
        case 'ArrowDown': {
          if (event.shiftKey) {
            onArrowDownShift();
          } else {
            onArrowDown();
          }
          break;
        }
        case 's':
          onSKey();
          break;
        case 't':
          onTKey();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [chartRef, onArrowLeft, onArrowRight, onArrowUp, onArrowDown, onArrowUpShift, onArrowDownShift, onSKey, onTKey]);
}

export function useHelicorderKeyboardShortcuts(chartRef: React.MutableRefObject<HelicorderChartRef | null>) {
  const onArrowUp = useCallback(() => {
    chartRef.current?.shiftViewUp();
  }, [chartRef]);

  const onArrowDown = useCallback(() => {
    chartRef.current?.shiftViewDown();
  }, [chartRef]);

  const onArrowUpShift = useCallback(() => {
    chartRef.current?.increaseAmplitude(0.1);
  }, [chartRef]);

  const onArrowDownShift = useCallback(() => {
    chartRef.current?.decreaseAmplitude(0.1);
  }, [chartRef]);

  const onArrowLeft = useCallback(() => {
    chartRef.current?.previousSelection();
  }, [chartRef]);

  const onArrowRight = useCallback(() => {
    chartRef.current?.nextSelection();
  }, [chartRef]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!chartRef.current || !chartRef.current.isFocused()) {
        return;
      }

      switch (event.key) {
        case 'ArrowUp': {
          if (event.shiftKey) {
            onArrowUpShift();
          } else {
            onArrowUp();
          }
          break;
        }
        case 'ArrowDown': {
          if (event.shiftKey) {
            onArrowDownShift();
          } else {
            onArrowDown();
          }
          break;
        }
        case 'ArrowLeft':
          onArrowLeft();
          break;
        case 'ArrowRight':
          onArrowRight();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [chartRef, onArrowUp, onArrowDown, onArrowUpShift, onArrowDownShift, onArrowLeft, onArrowRight]);
}
