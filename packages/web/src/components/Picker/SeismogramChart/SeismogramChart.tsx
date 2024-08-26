import {
  AxisPointerExtension,
  PickerExtension,
  Seismogram,
  SeismogramEventManagerExtension,
  SeismogramWebWorker,
  ZoomRectangleExtension,
} from '@waveview/charts';
import classNames from 'classnames';
import { FederatedPointerEvent } from 'pixi.js';
import React, { useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { debounce } from '../../../shared/debounce';
import { SeismogramChartProps, SeismogramChartRef } from './SeismogramChart.types';
import useSeismogramChartApi from './useSeismogramChartApi';

export type SeismogramChartType = React.ForwardRefExoticComponent<SeismogramChartProps & React.RefAttributes<SeismogramChartRef>>;

export const SeismogramChart: SeismogramChartType = React.forwardRef((props, ref) => {
  const { initOptions, className, onFocus, onBlur, onExtentChange, onTrackDoubleClick, onContextMenuRequested, onPick, onReady } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Seismogram | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const initialResizeCompleteRef = useRef<boolean | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const webWorkerRef = useRef<SeismogramWebWorker | null>(null);
  const zoomRectangleExtensionRef = useRef<ZoomRectangleExtension | null>(null);
  const axisPointerExtensionRef = useRef<AxisPointerExtension | null>(null);
  const eventManagerExtensionRef = useRef<SeismogramEventManagerExtension | null>(null);
  const pickerExtensionRef = useRef<PickerExtension | null>(null);

  const fetchAllChannelsData = useCallback(() => {
    webWorkerRef.current?.fetchAllChannelsDataDebounced();
  }, []);

  const fetchChannelData = useCallback(
    (channelId: string): void => {
      webWorkerRef.current?.fetchChannelData(channelId);
    },
    [webWorkerRef]
  );

  const api = useSeismogramChartApi({
    chartRef,
    webWorkerRef,
    zoomRectangleExtensionRef,
    axisPointerExtensionRef,
    eventManagerExtensionRef,
    pickerExtensionRef,
    workerRef,
    resizeObserverRef,
    fetchAllChannelsData,
    fetchChannelData,
  });
  useImperativeHandle(ref, () => api);

  const handleZoomRectangle = useCallback(
    (extent: [number, number]) => {
      if (chartRef.current) {
        chartRef.current.getXAxis().setExtent(extent);
        chartRef.current.render();
        fetchAllChannelsData();
      }
    },
    [fetchAllChannelsData]
  );

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

  const handleContextMenuRequested = useCallback(
    (e: FederatedPointerEvent) => {
      onContextMenuRequested?.(e);
    },
    [onContextMenuRequested]
  );

  const handlePickRangeChange = useCallback(
    (range: [number, number]) => {
      onPick?.(range);
    },
    [onPick]
  );

  useEffect(() => {
    async function init() {
      if (!canvasRef.current) {
        return;
      }

      canvasRef.current.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
      canvasRef.current.addEventListener('dblclick', (e) => {
        e.preventDefault();
      });

      chartRef.current = new Seismogram(canvasRef.current, initOptions);
      await chartRef.current.init();

      workerRef.current = new Worker(new URL('../../../workers/stream.worker.ts', import.meta.url), { type: 'module' });
      webWorkerRef.current = new SeismogramWebWorker(chartRef.current, workerRef.current);
      axisPointerExtensionRef.current = new AxisPointerExtension();
      eventManagerExtensionRef.current = new SeismogramEventManagerExtension({
        refreshDataAfterEvent: true,
        enableNKey: false,
        fetchData: fetchAllChannelsData,
      });
      zoomRectangleExtensionRef.current = new ZoomRectangleExtension();
      pickerExtensionRef.current = new PickerExtension();
      chartRef.current.use(axisPointerExtensionRef.current);
      chartRef.current.use(zoomRectangleExtensionRef.current);
      chartRef.current.use(eventManagerExtensionRef.current);
      chartRef.current.use(pickerExtensionRef.current);
      chartRef.current.on('focus', handleFocus);
      chartRef.current.on('blur', handleBlur);
      chartRef.current.on('extentChanged', handleExtentChange);
      chartRef.current.on('trackDoubleClick', handleTrackDoubleClick);
      chartRef.current.app.stage.on('rightclick', handleContextMenuRequested);
      zoomRectangleExtensionRef.current?.getAPI().on('extentSelected', handleZoomRectangle);
      pickerExtensionRef.current?.getAPI().on('change', handlePickRangeChange);
      chartRef.current.render();
    }

    const onResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chartRef.current?.resize({ width, height });
        chartRef.current?.render();
      }
    };

    const onResizeDebounced = debounce(onResize, 200);

    const handleResize = (entries: ResizeObserverEntry[]) => {
      if (!initialResizeCompleteRef.current) {
        initialResizeCompleteRef.current = true;
        onResize(entries);
      } else {
        onResizeDebounced(entries);
      }
    };

    init()
      .then(() => {
        resizeObserverRef.current = new ResizeObserver(handleResize);
        if (canvasRef.current) {
          resizeObserverRef.current.observe(canvasRef.current.parentElement!);
        }
      })
      .finally(() => {
        webWorkerRef.current?.fetchAllChannelsData();
        onReady?.();
      });

    return () => {
      chartRef.current?.dispose();
      workerRef.current?.terminate();
      resizeObserverRef.current?.disconnect();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={classNames('absolute top-0 right-0 bottom-0 left-0', className)}>
      <canvas ref={canvasRef} />
    </div>
  );
});
