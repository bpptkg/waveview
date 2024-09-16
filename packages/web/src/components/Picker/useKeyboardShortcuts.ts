import React, { useCallback, useEffect } from 'react';
import { SeismogramChartRef } from './SeismogramChart';
import { HelicorderChartRef } from './HelicorderChart';

export function useSeismogramKeyboardShortcuts(chartRef: React.MutableRefObject<SeismogramChartRef | null>) {
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
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [chartRef, onArrowLeft, onArrowRight, onArrowUp, onArrowDown, onArrowUpShift, onArrowDownShift]);
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
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [chartRef, onArrowUp, onArrowDown, onArrowUpShift, onArrowDownShift]);
}
