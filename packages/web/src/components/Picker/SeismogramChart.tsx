import {
  AxisPointerExtension,
  PickerExtension,
  Seismogram,
  SeismogramChartOptions,
  SeismogramEventManagerExtension,
  SeismogramWebWorker,
  ZoomRectangleExtension,
} from '@waveview/charts';
import { FederatedPointerEvent } from 'pixi.js';
import React, { useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { debounce } from '../../shared/debounce';

export interface SeismogramChartProps {
  initOptions?: Partial<SeismogramChartOptions>;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onExtentChange?: (extent: [number, number]) => void;
  onRemoveChannel?: (index: number) => void;
  onMoveChannelUp?: (index: number) => void;
  onMoveChannelDown?: (index: number) => void;
  onTrackDoubleClick?: (index: number) => void;
  onContextMenuRequested?: (e: FederatedPointerEvent) => void;
}

export interface SeismogramChartRef {
  getInstance: () => Seismogram;
  setChannels: (channels: string[]) => void;
  addChannel: (channelId: string) => void;
  removeChannel: (index: number) => void;
  moveChannelUp: (index: number) => void;
  moveChannelDown: (index: number) => void;
  zoomIn: (by: number) => void;
  zoomOut: (by: number) => void;
  scrollLeft: (by: number) => void;
  scrollRight: (by: number) => void;
  scrollToNow: () => void;
  increaseAmplitude: (by: number) => void;
  decreaseAmplitude: (by: number) => void;
  resetAmplitude: () => void;
  showVisibleMarkers: () => void;
  hideVisibleMarkers: () => void;
  setExtent: (extent: [number, number]) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  activateZoomRectangle: () => void;
  deactivateZoomRectangle: () => void;
  isZoomRectangleActive: () => boolean;
  focus(): void;
  blur(): void;
  isFocused(): boolean;
  setUseUTC: (useUTC: boolean) => void;
  activatePickMode: () => void;
  deactivatePickMode: () => void;
  isPickModeActive: () => boolean;
}

const SeismogramChart: React.ForwardRefExoticComponent<SeismogramChartProps & React.RefAttributes<SeismogramChartRef>> = React.forwardRef((props, ref) => {
  const { initOptions, className, onFocus, onBlur, onExtentChange, onTrackDoubleClick, onContextMenuRequested } = props;

  const seisRef = useRef<HTMLCanvasElement>(null);
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
    setChannels: (channels: string[]) => {
      if (chartRef.current) {
        chartRef.current.setChannels(channels);
        chartRef.current.render();
        fetchDataDebounced();
      }
    },
    addChannel: (channelId: string) => {
      if (chartRef.current) {
        chartRef.current.addChannel(channelId);
        chartRef.current.render();
        fetchChannelData(channelId);
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
    showVisibleMarkers: () => {
      if (chartRef.current) {
        chartRef.current.showVisibleMarkers();
        chartRef.current.render();
      }
    },
    hideVisibleMarkers: () => {
      if (chartRef.current) {
        chartRef.current.hideVisibleMarkers();
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
        return zoomRectangleExtensionRef.current.getInstance().isActive();
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
  }));

  const handleZoomRectangle = (extent: [number, number]) => {
    if (chartRef.current) {
      chartRef.current.getXAxis().setExtent(extent);
      chartRef.current.render();
      fetchDataDebounced();
    }
  };

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

  useEffect(() => {
    async function init() {
      if (seisRef.current) {
        seisRef.current.addEventListener('contextmenu', (e) => {
          e.preventDefault();
        });
        seisRef.current.addEventListener('dblclick', (e) => {
          e.preventDefault();
        });

        chartRef.current = new Seismogram(seisRef.current, initOptions);
        await chartRef.current.init();
        chartRef.current.on('focus', handleFocus);
        chartRef.current.on('blur', handleBlur);
        chartRef.current.on('extentChanged', handleExtentChange);
        chartRef.current.on('trackDoubleClicked', handleTrackDoubleClick);

        workerRef.current = new Worker(new URL('../../workers/stream.worker.ts', import.meta.url), { type: 'module' });
        webWorkerRef.current = new SeismogramWebWorker(chartRef.current, workerRef.current);
        axisPointerExtensionRef.current = new AxisPointerExtension();
        eventManagerExtensionRef.current = new SeismogramEventManagerExtension({
          refreshDataAfterEvent: true,
          fetchData: fetchDataDebounced,
        });
        zoomRectangleExtensionRef.current = new ZoomRectangleExtension();
        pickerExtensionRef.current = new PickerExtension();

        chartRef.current.use(axisPointerExtensionRef.current);
        chartRef.current.use(zoomRectangleExtensionRef.current);
        chartRef.current.use(eventManagerExtensionRef.current);
        chartRef.current.use(pickerExtensionRef.current);

        zoomRectangleExtensionRef.current.getInstance().on('extentSelected', handleZoomRectangle);

        chartRef.current.refreshData();
        chartRef.current.render();
      }
    }

    const onResizeDebounced = debounce((entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chartRef.current?.resize(width, height);
        chartRef.current?.render();
      }
    }, 200);

    const onResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chartRef.current?.resize(width, height);
        chartRef.current?.render();
      }
    };

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
        if (seisRef.current) {
          resizeObserverRef.current.observe(seisRef.current.parentElement!);
        }
      })
      .finally(() => {
        webWorkerRef.current?.fetchAllChannelsData();
      });

    return () => {
      chartRef.current?.dispose();
      workerRef.current?.terminate();
      resizeObserverRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: FederatedPointerEvent) => {
      handleContextMenuRequested(e);
    };

    if (chartRef.current) {
      chartRef.current.app.stage.on('rightclick', handleContextMenu);
    }
  }, [handleContextMenuRequested]);

  return (
    <div className={`absolute top-0 right-0 bottom-0 left-0 ${className ?? ''}`}>
      <canvas ref={seisRef} />
    </div>
  );
});

export default SeismogramChart;
