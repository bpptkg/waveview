import { ElementEvent, Seismogram, SeismogramEventMarkerOptions } from '@waveview/zcharts';
import classNames from 'classnames';
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { debounce } from '../../../shared/debounce';
import { getJwtToken } from '../../../stores/auth/utils';
import { SeismogramChartProps, SeismogramChartRef } from './SeismogramChart.types';
import { SeismogramWebWorker } from './SeismogramWebWorker';
import useSeismogramChartApi from './useSeismogramChartApi';

export type SeismogramChartType = React.ForwardRefExoticComponent<SeismogramChartProps & React.RefAttributes<SeismogramChartRef>>;

export const SeismogramChart: SeismogramChartType = React.forwardRef((props, ref) => {
  const {
    initOptions,
    className,
    appliedFilter,
    onFocus,
    onBlur,
    onExtentChange,
    onTrackDoubleClick,
    onContextMenuRequested,
    onMouseWheel,
    onPick,
    onReady,
    onEventMarkerContextMenu,
    onTrackContextMenu,
    onLoading,
  } = props;

  const parentRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Seismogram | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const webWorkerRef = useRef<SeismogramWebWorker | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const api = useSeismogramChartApi({
    chartRef,
    webWorkerRef,
  });
  useImperativeHandle(ref, () => api);

  const handleFocus = useCallback(() => {
    chartRef.current?.focus();
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

  const handleContextMenuRequested = useCallback(
    (e: ElementEvent) => {
      e.event.preventDefault();
      onContextMenuRequested?.(e);
    },
    [onContextMenuRequested]
  );

  const handleEventMarkerContextMenu = useCallback(
    (e: ElementEvent, marker: SeismogramEventMarkerOptions) => {
      onEventMarkerContextMenu?.(e, marker);
    },
    [onEventMarkerContextMenu]
  );

  const handleTrackContextMenu = useCallback(
    (e: ElementEvent, index: number) => {
      onTrackContextMenu?.(e, index);
    },
    [onTrackContextMenu]
  );

  const handleMouseWheel = useCallback(
    (e: ElementEvent) => {
      onMouseWheel?.(e);
    },
    [onMouseWheel]
  );

  const handlePickRangeChange = useCallback(
    (range: [number, number]) => {
      onPick?.(range);
    },
    [onPick]
  );

  const handleOnLoading = useCallback(
    (loading: boolean) => {
      onLoading?.(loading);
    },
    [onLoading]
  );

  useEffect(() => {
    function init() {
      if (!parentRef.current) {
        return;
      }

      chartRef.current = new Seismogram(parentRef.current, initOptions);
      const token = getJwtToken();

      workerRef.current = new Worker(new URL('../../../workers/stream.worker.ts', import.meta.url), { type: 'module' });
      workerRef.current.postMessage({ type: 'setup', payload: { token } });
      webWorkerRef.current = new SeismogramWebWorker(chartRef.current, workerRef.current);
      const { startTime, endTime } = initOptions || {};
      if (startTime && endTime) {
        webWorkerRef.current.mergeOptions({ selectionWindow: [startTime, endTime] });
      }
      webWorkerRef.current.mergeOptions({ appliedFilter });

      chartRef.current.on('blur', handleBlur);
      chartRef.current.on('extentChanged', handleExtentChange);
      chartRef.current.on('trackDoubleClicked', handleTrackDoubleClick);
      chartRef.current.on('pickChanged', handlePickRangeChange);
      chartRef.current.on('eventMarkerContextMenu', handleEventMarkerContextMenu);
      chartRef.current.on('trackContextMenu', handleTrackContextMenu);
      chartRef.current.on('loading', handleOnLoading);
      chartRef.current.zr.on('click', handleFocus);
      chartRef.current.zr.on('contextmenu', handleContextMenuRequested);
      chartRef.current.zr.on('mousewheel', handleMouseWheel);
      chartRef.current.render();
    }

    const onResize = debounce((entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chartRef.current?.resize({ width, height });
      }
      chartRef.current?.render();
    }, 100);

    resizeObserverRef.current = new ResizeObserver(onResize);
    if (parentRef.current) {
      resizeObserverRef.current.observe(parentRef.current);
    }

    init();

    return () => {
      chartRef.current?.dispose();
      workerRef.current?.terminate();
      resizeObserverRef.current?.disconnect();
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
