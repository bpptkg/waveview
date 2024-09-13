import { Channel, Helicorder } from '@waveview/zcharts';
import classNames from 'classnames';
import React, { useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { getJwtToken } from '../../../stores/auth/utils';
import { HelicorderChartProps, HelicorderChartRef } from './HelicorderChart.types';
import { HelicorderWebWorker } from './HelicorderWebWorker';

export type HelicorderChartType = React.ForwardRefExoticComponent<HelicorderChartProps & React.RefAttributes<HelicorderChartRef>>;

export const HelicorderChart: HelicorderChartType = React.forwardRef((props, ref) => {
  const { initOptions, className, onFocus, onSelectionChange, onReady } = props;

  const parentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Helicorder | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const webWorkerRef = useRef<HelicorderWebWorker | null>(null);

  const fetchDataDebounced = useCallback(() => {
    webWorkerRef.current?.fetchAllTracksData();
  }, []);

  useImperativeHandle(ref, () => ({
    getInstance: () => chartRef.current!,
    shiftViewUp: (by: number = 1) => {
      if (chartRef.current) {
        chartRef.current.shiftViewUp(by);
        chartRef.current.render();
        fetchDataDebounced();
      }
    },
    shiftViewDown: (by: number = 1) => {
      if (chartRef.current) {
        chartRef.current.shiftViewDown(by);
        chartRef.current.render();
        fetchDataDebounced();
      }
    },
    shiftViewToNow: () => {
      if (chartRef.current) {
        chartRef.current.shiftViewToNow();
        chartRef.current.render();
        fetchDataDebounced();
      }
    },
    increaseAmplitude: (by: number) => {
      if (chartRef.current) {
        chartRef.current.increaseAmplitude(by);
        chartRef.current.render();
      }
    },
    decreaseAmplitude: (by: number) => {
      if (chartRef.current) {
        chartRef.current.decreaseAmplitude(by);
        chartRef.current.render();
      }
    },
    resetAmplitude: () => {
      if (chartRef.current) {
        chartRef.current.resetAmplitude();
        chartRef.current.render();
      }
    },
    setChannel: (channel: Channel) => {
      if (chartRef.current) {
        chartRef.current.clearData();
        chartRef.current.setChannel(channel);
        fetchDataDebounced();
      }
    },
    setOffsetDate: (date: number) => {
      if (chartRef.current) {
        chartRef.current.setOffsetDate(date);
        chartRef.current.render();
        fetchDataDebounced();
      }
    },
    setInterval: (interval: number) => {
      if (chartRef.current) {
        chartRef.current.setInterval(interval);
        chartRef.current.render();
        fetchDataDebounced();
      }
    },
    setDuration: (duration: number) => {
      if (chartRef.current) {
        chartRef.current.setDuration(duration);
        chartRef.current.render();
        fetchDataDebounced();
      }
    },
    setTheme: (theme: 'light' | 'dark') => {
      if (chartRef.current) {
        chartRef.current.setTheme(theme);
        chartRef.current.render();
      }
    },
    setUseUTC: (useUTC: boolean) => {
      if (chartRef.current) {
        chartRef.current.setUseUTC(useUTC);
        chartRef.current.render();
      }
    },
    focus: () => {
      if (chartRef.current) {
        chartRef.current.focus();
      }
    },
    blur: () => {
      if (chartRef.current) {
        chartRef.current?.blur();
      }
    },
    isFocused: () => {
      return chartRef.current?.isFocused() ?? false;
    },

    addEventMarker: (marker) => {
      if (chartRef.current) {
        chartRef.current.addEventMarker(marker);
        chartRef.current.render();
      }
    },
    addEventMarkers: (markers) => {
      if (chartRef.current) {
        chartRef.current.addEventMarkers(markers);
        chartRef.current.render();
      }
    },
    removeEventMarker: (start, end) => {
      if (chartRef.current) {
        chartRef.current.removeEventMarker(start, end);
        chartRef.current.render();
      }
    },
    showEventMarkers: () => {
      if (chartRef.current) {
        chartRef.current.showEventMarkers();
        chartRef.current.render();
      }
    },
    hideEventMarkers: () => {
      if (chartRef.current) {
        chartRef.current.hideEventMarkers();
        chartRef.current.render();
      }
    },
    clearEventMarkers: () => {
      if (chartRef.current) {
        chartRef.current.clearEventMarkers();
        chartRef.current.render();
      }
    },
    dispose: () => {
      if (chartRef.current) {
        chartRef.current?.dispose();
      }
    },
    getChartExtent: () => {
      if (chartRef.current) {
        return chartRef.current.getChartExtent();
      } else {
        return [0, 0];
      }
    },
  }));

  const handleSelectionChange = useCallback(
    (range: [number, number]) => {
      if (chartRef.current) {
        onSelectionChange?.(range);
      }
    },
    [onSelectionChange]
  );

  const handleFocus = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  useEffect(() => {
    function init() {
      if (!parentRef.current) {
        return;
      }

      canvasRef.current?.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });

      chartRef.current = new Helicorder(parentRef.current, initOptions);
      const token = getJwtToken();
      workerRef.current = new Worker(new URL('../../../workers/stream.worker.ts', import.meta.url), { type: 'module' });
      workerRef.current.postMessage({ type: 'setup', payload: { token } });
      webWorkerRef.current = new HelicorderWebWorker(chartRef.current, workerRef.current);
      chartRef.current.on('click', handleFocus);
      chartRef.current.on('selectionChanged', handleSelectionChange);
      chartRef.current.render();
    }

    const onResize = () => {
      chartRef.current?.resize();
      chartRef.current?.render();
    };

    resizeObserverRef.current = new ResizeObserver(onResize);
    if (parentRef.current) {
      resizeObserverRef.current.observe(parentRef.current);
    }

    init();
    onReady?.(chartRef.current!);

    setTimeout(() => {
      webWorkerRef.current?.fetchAllTracksData({ mode: 'cache' });
    }, 100);

    return () => {
      chartRef.current?.dispose();
      workerRef.current?.terminate();
      resizeObserverRef.current?.disconnect();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={classNames('absolute top-0 right-0 bottom-0 left-0', className)} ref={parentRef}>
      <canvas ref={canvasRef} />
    </div>
  );
});
