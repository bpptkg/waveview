import {
  AxisPointerExtension,
  Channel,
  PickerExtension,
  Seismogram,
  SeismogramEventManagerExtension,
  SeismogramEventMarkerOptions,
  SeismogramWebWorker,
  ZoomRectangleExtension,
} from '@waveview/charts';
import { FederatedPointerEvent } from 'pixi.js';
import React, { useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { debounce } from '../../../shared/debounce';
import { SeismogramChartProps, SeismogramChartRef } from './SeismogramChart.types';

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

  const fetchDataDebounced = debounce(() => {
    webWorkerRef.current?.fetchAllChannelsData();
  }, 250);

  const fetchChannelData = (channelId: string): void => {
    webWorkerRef.current?.fetchChannelData(channelId);
  };

  useImperativeHandle(ref, () => ({
    getInstance: () => chartRef.current!,
    setChannels: (channels: Channel[]) => {
      if (chartRef.current) {
        chartRef.current.setChannels(channels);
        chartRef.current.render();
        fetchDataDebounced();
      }
    },
    addChannel: (channel: Channel) => {
      if (chartRef.current) {
        chartRef.current.addChannel(channel);
        chartRef.current.render();
        fetchChannelData(channel.id);
      }
    },
    removeChannel: (index: number) => {
      if (chartRef.current) {
        chartRef.current.removeChannel(index);
        chartRef.current.render();
      }
    },
    moveChannelUp: (index: number) => {
      if (chartRef.current) {
        chartRef.current.moveChannelUp(index);
        chartRef.current.render();
      }
    },
    moveChannelDown: (index: number) => {
      if (chartRef.current) {
        chartRef.current.moveChannelDown(index);
        chartRef.current.render();
      }
    },
    zoomIn: (by: number) => {
      if (chartRef.current) {
        const [start, end] = chartRef.current.getChartExtent();
        const center = start + (end - start) / 2;
        chartRef.current.zoomIn(center, by);
        chartRef.current.render();
        fetchDataDebounced();
      }
    },
    zoomOut: (by: number) => {
      if (chartRef.current) {
        const [start, end] = chartRef.current.getChartExtent();
        const center = start + (end - start) / 2;
        chartRef.current.zoomOut(center, by);
        chartRef.current.render();
        fetchDataDebounced();
      }
    },
    scrollLeft: (by: number) => {
      if (chartRef.current) {
        chartRef.current.scrollLeft(by);
        chartRef.current.render();
        fetchDataDebounced();
      }
    },
    scrollRight: (by: number) => {
      if (chartRef.current) {
        chartRef.current.scrollRight(by);
        chartRef.current.render();
        fetchDataDebounced();
      }
    },
    scrollToNow: () => {
      if (chartRef.current) {
        chartRef.current.scrollToNow();
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
    setExtent: (extent: [number, number]) => {
      if (chartRef.current) {
        chartRef.current.clearData();
        chartRef.current.getXAxis().setExtent(extent);
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
    activateZoomRectangle: () => {
      if (zoomRectangleExtensionRef.current) {
        zoomRectangleExtensionRef.current.activate();
      }
    },
    deactivateZoomRectangle: () => {
      if (zoomRectangleExtensionRef.current) {
        zoomRectangleExtensionRef.current.deactivate();
      }
    },
    isZoomRectangleActive: () => {
      if (zoomRectangleExtensionRef.current) {
        return zoomRectangleExtensionRef.current.getAPI().isActive();
      }
      return false;
    },
    focus: () => {
      if (chartRef.current) {
        chartRef.current.focus();
      }
    },
    blur: () => {
      if (chartRef.current) {
        chartRef.current.blur();
      }
    },
    isFocused: () => {
      if (chartRef.current) {
        return chartRef.current.isFocused();
      }
      return false;
    },
    setUseUTC: (useUTC: boolean) => {
      if (chartRef.current) {
        chartRef.current.setUseUTC(useUTC);
        chartRef.current.render();
      }
    },
    activatePickMode: () => {
      if (pickerExtensionRef.current) {
        pickerExtensionRef.current.activate();
      }
    },
    deactivatePickMode: () => {
      if (pickerExtensionRef.current) {
        pickerExtensionRef.current.deactivate();
      }
    },
    isPickModeActive: () => {
      if (pickerExtensionRef.current) {
        return pickerExtensionRef.current.isActive();
      }
      return false;
    },
    setPickRange: (range: [number, number]) => {
      if (pickerExtensionRef.current) {
        pickerExtensionRef.current.getAPI().setRange(range);
        chartRef.current?.render();
      }
    },
    clearPickRange: () => {
      if (pickerExtensionRef.current) {
        pickerExtensionRef.current.getAPI().clearRange();
        chartRef.current?.render();
      }
    },
    showAllEventMarkers: () => {
      if (chartRef.current) {
        chartRef.current.showAllEventMarkers();
        chartRef.current.render();
      }
    },
    hideAllEventMarkers: () => {
      if (chartRef.current) {
        chartRef.current.hideAllEventMarkers();
        chartRef.current.render();
      }
    },
    addEventMarker: (marker: SeismogramEventMarkerOptions) => {
      if (chartRef.current) {
        chartRef.current.addEventMarker(marker);
        chartRef.current.render();
      }
    },
    removeEventMarker: (start: number, end: number) => {
      if (chartRef.current) {
        chartRef.current.removeEventMarker(start, end);
        chartRef.current.render();
      }
    },
    clearAllEventMarkers: () => {
      if (chartRef.current) {
        chartRef.current.removeAllMarkers();
        chartRef.current.render();
      }
    },
    dispose: () => {
      chartRef.current?.dispose();
      workerRef.current?.terminate();
      resizeObserverRef.current?.disconnect();
    },
    getChartExtent: () => {
      if (chartRef.current) {
        return chartRef.current.getChartExtent();
      } else {
        return [0, 0];
      }
    },
  }));

  const handleZoomRectangle = useCallback(
    (extent: [number, number]) => {
      if (chartRef.current) {
        chartRef.current.getXAxis().setExtent(extent);
        chartRef.current.render();
        fetchDataDebounced();
      }
    },
    [fetchDataDebounced]
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
      if (canvasRef.current) {
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
          fetchData: fetchDataDebounced,
        });
        zoomRectangleExtensionRef.current = new ZoomRectangleExtension();
        pickerExtensionRef.current = new PickerExtension();

        chartRef.current.use(axisPointerExtensionRef.current);
        chartRef.current.use(zoomRectangleExtensionRef.current);
        chartRef.current.use(eventManagerExtensionRef.current);
        chartRef.current.use(pickerExtensionRef.current);

        chartRef.current.render();
      }
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

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.on('focus', handleFocus);
      chartRef.current.on('blur', handleBlur);
      chartRef.current.on('extentChange', handleExtentChange);
      chartRef.current.on('trackDoubleClick', handleTrackDoubleClick);
      chartRef.current.app.stage.on('rightclick', handleContextMenuRequested);
    }

    zoomRectangleExtensionRef.current?.getAPI().on('extentSelected', handleZoomRectangle);
    pickerExtensionRef.current?.getAPI().on('change', handlePickRangeChange);
  }, [handleFocus, handleBlur, handleExtentChange, handleTrackDoubleClick, handleContextMenuRequested, handlePickRangeChange, handleZoomRectangle]);

  return (
    <div className={`absolute top-0 right-0 bottom-0 left-0 ${className ?? ''}`}>
      <canvas ref={canvasRef} />
    </div>
  );
});
