import React, { useCallback, useEffect } from 'react';
import { usePickerStore } from '../../stores/picker';
import { HelicorderChartRef } from './HelicorderChart';
import { SeismogramChartRef } from './SeismogramChart';
import { usePickerCallback } from './usePickerCallback';

export function useSeismogramKeyboardShortcuts(chartRef: React.MutableRefObject<SeismogramChartRef | null>) {
  const { isSpectrogramVisible, isSignalVisible, seismogramToolbarAddCheckedValue, seismogramToolbarRemoveCheckedValue } = usePickerStore();

  const onArrowLeft = useCallback(() => {
    chartRef.current?.scrollLeft(0.1);
    chartRef.current?.render();
  }, [chartRef]);

  const onArrowRight = useCallback(() => {
    chartRef.current?.scrollRight(0.1);
    chartRef.current?.render();
  }, [chartRef]);

  const onArrowUp = useCallback(() => {
    chartRef.current?.increaseAmplitude(0.1);
    chartRef.current?.render();
  }, [chartRef]);

  const onArrowDown = useCallback(() => {
    chartRef.current?.decreaseAmplitude(0.1);
    chartRef.current?.render();
  }, [chartRef]);

  const onArrowUpShift = useCallback(() => {
    chartRef.current?.zoomIn(0.1);
    chartRef.current?.render();
  }, [chartRef]);

  const onArrowDownShift = useCallback(() => {
    chartRef.current?.zoomOut(0.1);
    chartRef.current?.render();
  }, [chartRef]);

  const onSKey = useCallback(() => {
    if (isSpectrogramVisible()) {
      chartRef.current?.hideSpectrogram();
      seismogramToolbarRemoveCheckedValue('options', 'spectrogram');
    } else {
      seismogramToolbarAddCheckedValue('options', 'spectrogram');
      chartRef.current?.showSpectrogram();
    }
    chartRef.current?.render();
  }, [chartRef, isSpectrogramVisible, seismogramToolbarAddCheckedValue, seismogramToolbarRemoveCheckedValue]);

  const onTKey = useCallback(() => {
    if (isSignalVisible()) {
      chartRef.current?.hideSignal();
      seismogramToolbarRemoveCheckedValue('options', 'signal');
    } else {
      seismogramToolbarAddCheckedValue('options', 'signal');
      chartRef.current?.showSignal();
    }
    chartRef.current?.render();
  }, [chartRef, isSignalVisible, seismogramToolbarAddCheckedValue, seismogramToolbarRemoveCheckedValue]);

  const onEKey = useCallback(() => {
    chartRef.current?.zoomFirstMinute();
    chartRef.current?.render();
  }, [chartRef]);

  const onFKey = useCallback(() => {
    chartRef.current?.fitToWindow();
    chartRef.current?.render();
  }, [chartRef]);

  const onRKey = useCallback(() => {
    chartRef.current?.resetAmplitude();
    chartRef.current?.render();
  }, [chartRef]);

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
        case 'S':
          onSKey();
          break;
        case 't':
        case 'T':
          onTKey();
          break;
        case 'e':
        case 'E':
          onEKey();
          break;
        case 'f':
        case 'F':
          onFKey();
          break;
        case 'r':
        case 'R':
          onRKey();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [chartRef, onArrowLeft, onArrowRight, onArrowUp, onArrowDown, onArrowUpShift, onArrowDownShift, onSKey, onTKey, onEKey, onFKey, onRKey]);
}

export function useHelicorderKeyboardShortcuts(chartRef: React.MutableRefObject<HelicorderChartRef | null>) {
  const { handleFetchEvents } = usePickerCallback();

  const onArrowUp = useCallback(() => {
    chartRef.current?.shiftViewUp();
    chartRef.current?.render();
    chartRef.current?.fetchAllData({ debounce: true });
    handleFetchEvents({ debounce: true });
  }, [chartRef, handleFetchEvents]);

  const onArrowDown = useCallback(() => {
    chartRef.current?.shiftViewDown();
    chartRef.current?.render();
    chartRef.current?.fetchAllData({ debounce: true });
    handleFetchEvents({ debounce: true });
  }, [chartRef, handleFetchEvents]);

  const onArrowUpShift = useCallback(() => {
    chartRef.current?.increaseAmplitude(0.1);
    chartRef.current?.render({ refreshSignal: true });
  }, [chartRef]);

  const onArrowDownShift = useCallback(() => {
    chartRef.current?.decreaseAmplitude(0.1);
    chartRef.current?.render({ refreshSignal: true });
  }, [chartRef]);

  const onArrowLeft = useCallback(() => {
    chartRef.current?.previousSelection();
    chartRef.current?.render();
  }, [chartRef]);

  const onArrowRight = useCallback(() => {
    chartRef.current?.nextSelection();
    chartRef.current?.render();
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
