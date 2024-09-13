import { Seismogram } from '@waveview/zcharts';
import classNames from 'classnames';
import React, { useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { getJwtToken } from '../../../stores/auth/utils';
import { SeismogramChartProps, SeismogramChartRef } from './SeismogramChart.types';
import { SeismogramWebWorker } from './SeismogramWebWorker';
import useSeismogramChartApi from './useSeismogramChartApi';

export type SeismogramChartType = React.ForwardRefExoticComponent<SeismogramChartProps & React.RefAttributes<SeismogramChartRef>>;

export const SeismogramChart: SeismogramChartType = React.forwardRef((props, ref) => {
  const { initOptions, className, onFocus, onBlur, onExtentChange, onTrackDoubleClick, onContextMenuRequested, onPick, onReady } = props;

  const parentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Seismogram | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const webWorkerRef = useRef<SeismogramWebWorker | null>(null);

  const api = useSeismogramChartApi({
    chartRef,
    webWorkerRef,
  });
  useImperativeHandle(ref, () => api);

  const handleFocus = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    onBlur?.();
  }, [onBlur]);

  const handleExtentChange = useCallback(
    (extent: [number, number]) => {
      onExtentChange?.(extent);
    },
    [onExtentChange]
  );

  const handleTrackDoubleClick = useCallback(
    (index: number) => {
      onTrackDoubleClick?.(index);
    },
    [onTrackDoubleClick]
  );

  const handleContextMenuRequested = useCallback(() => {
    onContextMenuRequested?.();
  }, [onContextMenuRequested]);

  const handlePickRangeChange = useCallback(
    (range: [number, number]) => {
      onPick?.(range);
    },
    [onPick]
  );

  useEffect(() => {
    function init() {
      if (!parentRef.current) {
        return;
      }

      canvasRef.current?.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });

      chartRef.current = new Seismogram(parentRef.current, initOptions);
      const token = getJwtToken();
      workerRef.current = new Worker(new URL('../../../workers/stream.worker.ts', import.meta.url), { type: 'module' });
      workerRef.current.postMessage({ type: 'setup', payload: { token } });
      webWorkerRef.current = new SeismogramWebWorker(chartRef.current, workerRef.current, {
        window: chartRef.current.getChartExtent(),
      });
      chartRef.current.on('click', handleFocus);
      chartRef.current.on('blur', handleBlur);
      chartRef.current.on('extentChanged', handleExtentChange);
      chartRef.current.on('trackDoubleClicked', handleTrackDoubleClick);
      chartRef.current.on('contextMenuRequested', handleContextMenuRequested);
      chartRef.current.on('pickChanged', handlePickRangeChange);
      chartRef.current.render();
    }

    const onResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chartRef.current?.resize({ width, height });
      }
      chartRef.current?.render();
    };

    resizeObserverRef.current = new ResizeObserver(onResize);
    if (parentRef.current) {
      resizeObserverRef.current.observe(parentRef.current);
    }

    init();
    onReady?.(chartRef.current!);

    setTimeout(() => {
      webWorkerRef.current?.fetchAllChannelsData();
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
