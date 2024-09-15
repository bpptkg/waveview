import React, { useCallback, useEffect } from 'react';
import { SeismogramChartRef } from './SeismogramChart';

export function useSeismogramKeyboardShortcuts(seisChartRef: React.MutableRefObject<SeismogramChartRef | null>) {
  const onArrowLeft = useCallback(() => {
    seisChartRef.current?.scrollLeft(0.1);
    seisChartRef.current?.render();
  }, [seisChartRef]);

  const onArrowRight = useCallback(() => {
    seisChartRef.current?.scrollRight(0.1);
    seisChartRef.current?.render();
  }, [seisChartRef]);

  const onArrowUp = useCallback(() => {
    seisChartRef.current?.increaseAmplitude(0.1);
    seisChartRef.current?.render();
  }, [seisChartRef]);

  const onArrowDown = useCallback(() => {
    seisChartRef.current?.decreaseAmplitude(0.1);
    seisChartRef.current?.render();
  }, [seisChartRef]);

  const onArrowUpShift = useCallback(() => {
    seisChartRef.current?.zoomIn(0.1);
    seisChartRef.current?.render();
  }, [seisChartRef]);

  const onArrowDownShift = useCallback(() => {
    seisChartRef.current?.zoomOut(0.1);
    seisChartRef.current?.render();
  }, [seisChartRef]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!seisChartRef.current || !seisChartRef.current.isFocused()) {
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
  }, [seisChartRef, onArrowLeft, onArrowRight, onArrowUp, onArrowDown, onArrowUpShift, onArrowDownShift]);
}
