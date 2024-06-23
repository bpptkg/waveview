import { Helicorder, HelicorderChartOptions, HelicorderEventManagerExtension, HelicorderWebWorkerExtension } from '@waveview/charts';
import React, { useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { debounce } from '../../shared/debounce';

export interface HelicorderChartProps {
  className?: string;
  channelId: string;
  interval: number;
  duration: number;
  initOptions?: Partial<HelicorderChartOptions>;
  onTrackSelected?: (trackId: number) => void;
  onTrackDeselected?: (trackId: number) => void;
  onFocused?: () => void;
  onBlurred?: () => void;
}

export interface HelicorderChartRef {
  shiftViewUp: () => void;
  shiftViewDown: () => void;
  shiftViewToNow: () => void;
  increaseAmplitude: (by: number) => void;
  decreaseAmplitude: (by: number) => void;
  resetAmplitude: () => void;
  setInterval: (interval: number) => void;
  setDuration: (duration: number) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  getTrackExtent: (trackId: number) => [number, number];
  focus: () => void;
  blur: () => void;
}

const HelicorderChart: React.ForwardRefExoticComponent<HelicorderChartProps & React.RefAttributes<HelicorderChartRef>> = React.forwardRef((props, ref) => {
  const { channelId, interval, duration, initOptions, className, onTrackSelected, onTrackDeselected, onFocused, onBlurred } = props;

  const heliRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Helicorder | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const initialResizeCompleteRef = useRef<boolean>(false);
  const webWorkerRef = useRef<HelicorderWebWorkerExtension | null>(null);
  const eventManagerRef = useRef<HelicorderEventManagerExtension | null>(null);
  const workerRef = useRef<Worker>(new Worker(new URL('../../workers/stream.worker.ts', import.meta.url), { type: 'module' }));

  const fetchDataDebounced = debounce(() => {
    webWorkerRef.current?.getInstance().fetchAllTracksData();
  }, 250);

  useImperativeHandle(ref, () => ({
    shiftViewUp: () => {
      chartRef.current?.shiftViewUp();
    },
    shiftViewDown: () => {
      chartRef.current?.shiftViewDown();
    },
    shiftViewToNow: () => {
      chartRef.current?.shiftViewToNow();
    },
    increaseAmplitude: (by: number) => {
      chartRef.current?.increaseAmplitude(by);
      chartRef.current?.render();
    },
    decreaseAmplitude: (by: number) => {
      chartRef.current?.decreaseAmplitude(by);
      chartRef.current?.render();
    },
    resetAmplitude: () => {
      chartRef.current?.resetAmplitude();
      chartRef.current?.render();
    },
    setInterval: (interval: number) => {
      chartRef.current?.setInterval(interval);
      chartRef.current?.refreshData();
      chartRef.current?.render();
      fetchDataDebounced();
    },
    setDuration: (duration: number) => {
      chartRef.current?.setDuration(duration);
      chartRef.current?.refreshData();
      chartRef.current?.render();
      fetchDataDebounced();
    },
    setTheme: (theme: 'light' | 'dark') => {
      if (chartRef.current) {
        chartRef.current.setTheme(theme);
        chartRef.current.render();
      }
    },
    getTrackExtent: (trackId: number) => {
      if (chartRef.current) {
        return chartRef.current?.getTrackExtentAt(trackId);
      } else {
        return [0, 0];
      }
    },
    focus: () => {
      chartRef.current?.focus();
    },
    blur: () => {
      chartRef.current?.blur();
    },
  }));

  const handleTrackSelected = useCallback(
    (trackId: number) => {
      onTrackSelected?.(trackId);
    },
    [onTrackSelected]
  );

  const handleTrackDeselected = useCallback(
    (trackId: number) => {
      onTrackDeselected?.(trackId);
    },
    [onTrackDeselected]
  );

  const handleFocus = useCallback(() => {
    onFocused?.();
  }, [onFocused]);

  const handleBlur = useCallback(() => {
    onBlurred?.();
  }, [onBlurred]);

  useEffect(() => {
    async function init() {
      if (heliRef.current) {
        chartRef.current = new Helicorder(heliRef.current, {
          channelId,
          interval,
          duration,
          devicePixelRatio: window.devicePixelRatio,
          ...initOptions,
        });
        await chartRef.current.init();
        chartRef.current.on('trackSelected', handleTrackSelected);
        chartRef.current.on('trackDeselected', handleTrackDeselected);
        chartRef.current.on('focus', handleFocus);
        chartRef.current.on('blur', handleBlur);
        chartRef.current.refreshData();
        chartRef.current.render();

        webWorkerRef.current = new HelicorderWebWorkerExtension(workerRef.current);
        eventManagerRef.current = new HelicorderEventManagerExtension();
        chartRef.current.use(webWorkerRef.current);
        chartRef.current.use(eventManagerRef.current);
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
        if (heliRef.current) {
          resizeObserverRef.current.observe(heliRef.current.parentElement!);
        }
      })
      .finally(() => {
        webWorkerRef.current?.getInstance().fetchAllTracksData();
      });

    return () => {
      chartRef.current?.dispose();
      resizeObserverRef.current?.disconnect();
      webWorkerRef.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`absolute top-0 right-0 bottom-0 left-0 ${className ?? ''}`}>
      <canvas ref={heliRef} />
    </div>
  );
});

export default HelicorderChart;
