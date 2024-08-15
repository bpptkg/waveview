import { Channel, Helicorder, HelicorderEventManagerExtension, HelicorderWebWorkerExtension } from '@waveview/charts';
import React, { useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { debounce } from '../../../shared/debounce';
import { HelicorderChartProps, HelicorderChartRef } from './HelicorderChart.types';

export type HelicorderChartType = React.ForwardRefExoticComponent<HelicorderChartProps & React.RefAttributes<HelicorderChartRef>>;

export const HelicorderChart: HelicorderChartType = React.forwardRef((props, ref) => {
  const { initOptions, className, onTrackSelected, onTrackDeselected, onFocus, onBlur, onOffsetChange, onSelectionChange, onReady } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Helicorder | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const initialResizeCompleteRef = useRef<boolean | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const webWorkerExtensionRef = useRef<HelicorderWebWorkerExtension | null>(null);
  const eventManagerExtensionRef = useRef<HelicorderEventManagerExtension | null>(null);

  const fetchDataDebounced = debounce(() => {
    webWorkerExtensionRef.current?.getAPI().fetchAllTracksData();
  }, 250);

  useImperativeHandle(ref, () => ({
    getInstance: () => chartRef.current!,
    shiftViewUp: (by: number = 1) => {
      chartRef.current?.shiftViewUp(by);
    },
    shiftViewDown: (by: number = 1) => {
      chartRef.current?.shiftViewDown(by);
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
    setChannel: (channel: Channel) => {
      chartRef.current?.clearData();
      chartRef.current?.setChannel(channel);
      fetchDataDebounced();
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
    addEventMarker: (value: number, color: string) => {
      if (chartRef.current) {
        chartRef.current.addEventMarker({
          value,
          color,
          width: 3,
        });
        chartRef.current.render();
      }
    },
    removeEventMarker: (value: number) => {
      if (chartRef.current) {
        chartRef.current.removeEventMarker(value);
        chartRef.current.render();
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
    dispose: () => {
      chartRef.current?.dispose();
      workerRef.current?.terminate();
      resizeObserverRef.current?.disconnect();
    },
  }));

  const handleTrackSelected = useCallback(
    (index: number) => {
      onTrackSelected?.(index);
      if (chartRef.current) {
        const value = chartRef.current.getSelection().getValue();
        onSelectionChange?.(value);
      }
    },
    [onTrackSelected, onSelectionChange]
  );

  const handleTrackDeselected = useCallback(() => {
    onTrackDeselected?.();
  }, [onTrackDeselected]);

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

  useEffect(() => {
    async function init() {
      if (canvasRef.current) {
        chartRef.current = new Helicorder(canvasRef.current, initOptions);
        await chartRef.current.init();

        workerRef.current = new Worker(new URL('../../../workers/stream.worker.ts', import.meta.url), { type: 'module' });
        webWorkerExtensionRef.current = new HelicorderWebWorkerExtension(workerRef.current);
        eventManagerExtensionRef.current = new HelicorderEventManagerExtension();

        chartRef.current.use(webWorkerExtensionRef.current);
        chartRef.current.use(eventManagerExtensionRef.current);

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
        webWorkerExtensionRef.current?.getAPI().fetchAllTracksData();
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
    chartRef.current?.on('trackSelected', handleTrackSelected);
    chartRef.current?.on('trackDeselected', handleTrackDeselected);
    chartRef.current?.on('focus', handleFocus);
    chartRef.current?.on('blur', handleBlur);
    chartRef.current?.on('offsetChanged', handleOffsetChange);

    return () => {
      chartRef.current?.off('trackSelected', handleTrackSelected);
      chartRef.current?.off('trackDeselected', handleTrackDeselected);
      chartRef.current?.off('focus', handleFocus);
      chartRef.current?.off('blur', handleBlur);
      chartRef.current?.off('offsetChanged', handleOffsetChange);
    };
  }, [handleTrackSelected, handleTrackDeselected, handleFocus, handleBlur, handleOffsetChange]);

  return (
    <div className={`absolute top-0 right-0 bottom-0 left-0 ${className ?? ''}`}>
      <canvas ref={canvasRef} />
    </div>
  );
});
