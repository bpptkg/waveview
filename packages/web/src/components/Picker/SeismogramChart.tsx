import {
  AxisPointerExtension,
  Seismogram,
  SeismogramChartOptions,
  SeismogramEventManagerExtension,
  SeismogramWebWorker,
  ZoomRectangleExtension,
} from '@waveview/charts';
import React, { useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { debounce } from '../../shared/debounce';

export interface SeismogramChartProps {
  initOptions?: Partial<SeismogramChartOptions>;
  className?: string;
  onFocused?: () => void;
  onBlurred?: () => void;
}

export interface SeismogramChartRef {
  addChannel: (channelId: string) => void;
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
  focus(): void;
  blur(): void;
}

const SeismogramChart: React.ForwardRefExoticComponent<SeismogramChartProps & React.RefAttributes<SeismogramChartRef>> = React.forwardRef((props, ref) => {
  const { initOptions, className, onFocused, onBlurred } = props;

  const seisRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Seismogram | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const initialResizeCompleteRef = useRef<boolean>(false);

  const workerRef = useRef<Worker>(new Worker(new URL('../../workers/stream.worker.ts', import.meta.url), { type: 'module' }));
  const webWorkerRef = useRef<SeismogramWebWorker | null>(null);
  const zoomRectangleExtensionRef = useRef<ZoomRectangleExtension | null>(null);
  const axisPointerExtensionRef = useRef<AxisPointerExtension | null>(null);
  const eventManagerExtensionRef = useRef<SeismogramEventManagerExtension | null>(null);

  const fetchDataDebounced = debounce(() => {
    webWorkerRef.current?.fetchAllChannelsData();
  }, 250);

  useImperativeHandle(ref, () => ({
    addChannel: (channelId: string) => {
      if (chartRef.current) {
        chartRef.current.addChannel({ id: channelId });
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
  }));

  const handleZoomRectangle = (extent: [number, number]) => {
    if (chartRef.current) {
      chartRef.current.getXAxis().setExtent(extent);
      chartRef.current.render();
      fetchDataDebounced();
    }
  };

  const handleFocus = useCallback(() => {
    onFocused?.();
  }, [onFocused]);

  const handleBlur = useCallback(() => {
    onBlurred?.();
  }, [onBlurred]);

  useEffect(() => {
    async function init() {
      if (seisRef.current) {
        chartRef.current = new Seismogram(seisRef.current, {
          devicePixelRatio: window.devicePixelRatio,
          ...initOptions,
        });
        await chartRef.current.init();
        chartRef.current.on('focus', handleFocus);
        chartRef.current.on('blur', handleBlur);
        chartRef.current.refreshData();
        chartRef.current.render();

        webWorkerRef.current = new SeismogramWebWorker(chartRef.current, workerRef.current);
        axisPointerExtensionRef.current = new AxisPointerExtension();
        eventManagerExtensionRef.current = new SeismogramEventManagerExtension({
          refreshDataAfterEvent: true,
          fetchData: fetchDataDebounced,
        });
        zoomRectangleExtensionRef.current = new ZoomRectangleExtension();

        chartRef.current.use(axisPointerExtensionRef.current);
        chartRef.current.use(zoomRectangleExtensionRef.current);
        chartRef.current.use(eventManagerExtensionRef.current);

        zoomRectangleExtensionRef.current.getInstance().on('extentSelected', handleZoomRectangle);
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

    const worker = workerRef.current;

    return () => {
      chartRef.current?.dispose();
      webWorkerRef.current?.dispose();
      worker.terminate();
      resizeObserverRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`absolute top-0 right-0 bottom-0 left-0 ${className ?? ''}`}>
      <canvas ref={seisRef} />
    </div>
  );
});

export default SeismogramChart;
