import { Helicorder, HelicorderChartOptions, HelicorderEventManagerExtension, HelicorderWebWorkerExtension } from '@waveview/charts';
import React, { useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { debounce } from '../../shared/debounce';

export interface HelicorderChartProps {
  className?: string;
  initOptions?: Partial<HelicorderChartOptions>;
  onTrackSelected?: (index: number) => void;
  onTrackDeselected?: (index: number) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onOffsetChange?: (date: number) => void;
  onSelectionChange?: (value: number) => void;
}

export interface HelicorderChartRef {
  shiftViewUp: () => void;
  shiftViewDown: () => void;
  shiftViewToNow: () => void;
  increaseAmplitude: (by: number) => void;
  decreaseAmplitude: (by: number) => void;
  resetAmplitude: () => void;
  setUseUTC: (useUTC: boolean) => void;
  setOffsetDate: (date: number) => void;
  setInterval: (interval: number) => void;
  setDuration: (duration: number) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  getTrackExtent: (index: number) => [number, number];
  focus: () => void;
  blur: () => void;
  isFocused: () => boolean;
  selectTrack: (index: number) => void;
  setSelection: (value: number) => void;
}

const HelicorderChart: React.ForwardRefExoticComponent<HelicorderChartProps & React.RefAttributes<HelicorderChartRef>> = React.forwardRef((props, ref) => {
  const { initOptions, className, onTrackSelected, onTrackDeselected, onFocus, onBlur, onOffsetChange, onSelectionChange } = props;

  const heliRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Helicorder | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const initialResizeCompleteRef = useRef<boolean | null>(null);
  const webWorkerRef = useRef<HelicorderWebWorkerExtension | null>(null);
  const eventManagerRef = useRef<HelicorderEventManagerExtension | null>(null);
  const workerRef = useRef<Worker | null>(null);

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
    setOffsetDate: (date: number) => {
      chartRef.current?.setOffsetDate(date);
      chartRef.current?.refreshData();
      chartRef.current?.render();
      fetchDataDebounced();
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
    setUseUTC: (useUTC: boolean) => {
      chartRef.current?.setUseUTC(useUTC);
      chartRef.current?.render();
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
    isFocused: () => {
      return chartRef.current?.isFocused() ?? false;
    },
    selectTrack: (index: number) => {
      if (chartRef.current) {
        chartRef.current.selectTrack(index);
      }
    },
    setSelection: (value: number) => {
      if (chartRef.current) {
        chartRef.current.getSelection().setValue(value);
        chartRef.current.render();
      }
    },
  }));

  const handleTrackSelected = useCallback(
    (index: number) => {
      onTrackSelected?.(index);
    },
    [onTrackSelected]
  );

  const handleTrackDeselected = useCallback(
    (index: number) => {
      onTrackDeselected?.(index);
    },
    [onTrackDeselected]
  );

  const handleFocus = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    onBlur?.();
  }, [onBlur]);

  const handleOffsetChange = useCallback(
    (date: number) => {
      onOffsetChange?.(date);
    },
    [onOffsetChange]
  );

  const handleSelectionChange = useCallback(
    (value: number) => {
      onSelectionChange?.(value);
    },
    [onSelectionChange]
  );

  useEffect(() => {
    async function init() {
      if (heliRef.current) {
        chartRef.current = new Helicorder(heliRef.current, initOptions);
        await chartRef.current.init();
        chartRef.current.on('trackSelected', handleTrackSelected);
        chartRef.current.on('trackDeselected', handleTrackDeselected);
        chartRef.current.on('focus', handleFocus);
        chartRef.current.on('blur', handleBlur);
        chartRef.current.on('offsetChanged', handleOffsetChange);
        chartRef.current.on('selectionChanged', handleSelectionChange);

        workerRef.current = new Worker(new URL('../../workers/stream.worker.ts', import.meta.url), { type: 'module' });
        webWorkerRef.current = new HelicorderWebWorkerExtension(workerRef.current);
        eventManagerRef.current = new HelicorderEventManagerExtension();

        chartRef.current.use(webWorkerRef.current);
        chartRef.current.use(eventManagerRef.current);

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
        if (heliRef.current) {
          resizeObserverRef.current.observe(heliRef.current.parentElement!);
        }
      })
      .finally(() => {
        webWorkerRef.current?.getInstance().fetchAllTracksData();
      });

    return () => {
      chartRef.current?.dispose();
      workerRef.current?.terminate();
      resizeObserverRef.current?.disconnect();
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
