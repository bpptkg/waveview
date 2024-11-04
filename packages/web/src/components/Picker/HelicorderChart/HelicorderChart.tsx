import { Helicorder, HelicorderEventMarkerOptions } from '@waveview/zcharts';
import classNames from 'classnames';
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { debounce } from '../../../shared/debounce';
import { HelicorderChartProps, HelicorderChartRef } from './HelicorderChart.types';
import { HelicorderWebWorker } from './HelicorderWebWorker';
import { useHelicorderChartApi } from './useHelicorderApi';

export type HelicorderChartType = React.ForwardRefExoticComponent<HelicorderChartProps & React.RefAttributes<HelicorderChartRef>>;

export const HelicorderChart: HelicorderChartType = React.forwardRef((props, ref) => {
  const { initOptions, className, appliedFilter, onFocus, onSelectionChange, onReady, onEventMarkerClick, onLoading, onOffsetDateChange } = props;

  const parentRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Helicorder | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const webWorkerRef = useRef<HelicorderWebWorker | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const api = useHelicorderChartApi({
    chartRef,
    webWorkerRef,
  });
  useImperativeHandle(ref, () => api);

  const handleSelectionChange = useCallback(
    (range: [number, number]) => {
      if (chartRef.current) {
        onSelectionChange?.(range);
      }
    },
    [onSelectionChange]
  );

  const handleFocus = useCallback(() => {
    chartRef.current?.focus();
    onFocus?.();
  }, [onFocus]);

  const handleEventMarkerClick = useCallback(
    (marker: HelicorderEventMarkerOptions) => {
      onEventMarkerClick?.(marker);
    },
    [onEventMarkerClick]
  );

  const handleOnLoading = useCallback(
    (loading: boolean) => {
      onLoading?.(loading);
    },
    [onLoading]
  );

  const handleOffsetDateChange = useCallback(
    (date: number) => {
      onOffsetDateChange?.(date);
    },
    [onOffsetDateChange]
  );

  useEffect(() => {
    function init() {
      if (!parentRef.current) {
        return;
      }

      chartRef.current = new Helicorder(parentRef.current, initOptions);
      workerRef.current = new Worker(new URL('../../../workers/stream.worker.ts', import.meta.url), { type: 'module' });
      webWorkerRef.current = new HelicorderWebWorker(chartRef.current, workerRef.current);
      webWorkerRef.current.setup();
      webWorkerRef.current.mergeOptions({ appliedFilter });
      chartRef.current.on('selectionChanged', handleSelectionChange);
      chartRef.current.on('eventMarkerClicked', handleEventMarkerClick);
      chartRef.current.on('loading', handleOnLoading);
      chartRef.current.on('offsetDateChanged', handleOffsetDateChange);
      chartRef.current.zr.on('click', handleFocus);
      chartRef.current.render();
    }

    const onResize = debounce((entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chartRef.current?.resize({ width, height });
      }
      chartRef.current?.render({ refreshSignal: true });
    }, 100);

    resizeObserverRef.current = new ResizeObserver(onResize);
    if (parentRef.current) {
      resizeObserverRef.current.observe(parentRef.current);
    }

    init();

    setTimeout(() => {
      webWorkerRef.current?.restoreAllTracksData();
    }, 100);

    return () => {
      chartRef.current?.dispose();
      if (chartRef.current) {
        chartRef.current.dispose();
        chartRef.current = null;
      }
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      if (webWorkerRef.current) {
        webWorkerRef.current.dispose();
        webWorkerRef.current = null;
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsMounted(true);

    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (isMounted) {
      onReady?.(chartRef.current!);
    }
  }, [isMounted, onReady]);

  return <div className={classNames('absolute top-0 right-0 bottom-0 left-0', className)} ref={parentRef}></div>;
});
