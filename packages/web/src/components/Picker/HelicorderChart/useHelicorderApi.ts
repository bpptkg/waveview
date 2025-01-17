import { Channel, Helicorder } from '@waveview/zcharts';
import { MutableRefObject, useCallback, useMemo } from 'react';
import { HelicorderChartRef } from './HelicorderChart.types';
import { HelicorderWebWorker, RefreshOptions } from './HelicorderWebWorker';

export interface HelicorderChartInitOptions {
  chartRef: MutableRefObject<Helicorder | null>;
  webWorkerRef: MutableRefObject<HelicorderWebWorker | null>;
}

export function useHelicorderChartApi(options: HelicorderChartInitOptions): HelicorderChartRef {
  const { chartRef, webWorkerRef } = options;

  const fetchData = useCallback(
    (options?: RefreshOptions) => {
      if (webWorkerRef.current?.hasFilter()) {
        webWorkerRef.current?.fetchAllFiltersDataDebounced(options);
      } else {
        webWorkerRef.current?.fetchAllTracksDataDebounced(options);
      }
    },
    [webWorkerRef]
  );

  return useMemo(() => {
    return {
      getInstance: () => chartRef.current!,
      shiftViewUp: (by: number = 1) => {
        if (chartRef.current) {
          chartRef.current.shiftViewUp(by);
          chartRef.current.render();
          fetchData();
        }
      },
      shiftViewDown: (by: number = 1) => {
        if (chartRef.current) {
          chartRef.current.shiftViewDown(by);
          chartRef.current.render();
          fetchData();
        }
      },
      shiftViewToNow: () => {
        if (chartRef.current) {
          chartRef.current.shiftViewToNow();
          chartRef.current.render();
          fetchData();
        }
      },
      increaseAmplitude: (by: number) => {
        if (chartRef.current) {
          chartRef.current.increaseAmplitude(by);
          chartRef.current.render({ refreshSignal: true });
        }
      },
      decreaseAmplitude: (by: number) => {
        if (chartRef.current) {
          chartRef.current.decreaseAmplitude(by);
          chartRef.current.render({ refreshSignal: true });
        }
      },
      resetAmplitude: () => {
        if (chartRef.current) {
          chartRef.current.resetAmplitude();
          chartRef.current.render({ refreshSignal: true });
        }
      },
      setChannel: (channel: Channel) => {
        if (chartRef.current) {
          chartRef.current.clearData();
          chartRef.current.setChannel(channel);
          fetchData({ mode: 'force' });
        }
      },
      getChannel: () => {
        if (chartRef.current) {
          return chartRef.current?.getChannel();
        } else {
          return { id: '', label: '' };
        }
      },
      setOffsetDate: (date: number) => {
        if (chartRef.current) {
          chartRef.current.setOffsetDate(date);
          chartRef.current.render({ refreshSignal: true });
          fetchData();
        }
      },
      setInterval: (interval: number) => {
        if (chartRef.current) {
          chartRef.current.setInterval(interval);
          chartRef.current.render({ refreshSignal: true });
          fetchData();
        }
      },
      setDuration: (duration: number) => {
        if (chartRef.current) {
          chartRef.current.setDuration(duration);
          chartRef.current.render({ refreshSignal: true });
          fetchData();
        }
      },
      setTheme: (theme: 'light' | 'dark') => {
        if (chartRef.current) {
          chartRef.current.setTheme(theme);
          chartRef.current.render({ refreshSignal: true });
        }
      },
      setUseUTC: (useUTC: boolean) => {
        if (chartRef.current) {
          chartRef.current.setUseUTC(useUTC);
          chartRef.current.render({ refreshSignal: false });
        }
      },
      focus: () => {
        if (chartRef.current) {
          chartRef.current.focus();
        }
      },
      blur: () => {
        if (chartRef.current) {
          chartRef.current?.blur();
        }
      },
      isFocused: () => {
        return chartRef.current?.isFocused() ?? false;
      },

      addEventMarker: (markerOptions, options) => {
        if (chartRef.current) {
          chartRef.current.addEventMarker(markerOptions, options);
          chartRef.current.render({ refreshSignal: false });
        }
      },
      addEventMarkers: (markersOptions, options) => {
        if (chartRef.current) {
          chartRef.current.addEventMarkers(markersOptions, options);
          chartRef.current.render({ refreshSignal: false });
        }
      },
      removeEventMarker: (start, end) => {
        if (chartRef.current) {
          chartRef.current.removeEventMarker(start, end);
          chartRef.current.render({ refreshSignal: false });
        }
      },
      showEventMarkers: () => {
        if (chartRef.current) {
          chartRef.current.showEventMarkers();
          chartRef.current.render({ refreshSignal: false });
        }
      },
      hideEventMarkers: () => {
        if (chartRef.current) {
          chartRef.current.hideEventMarkers();
          chartRef.current.render({ refreshSignal: false });
        }
      },
      clearEventMarkers: () => {
        if (chartRef.current) {
          chartRef.current.clearEventMarkers();
          chartRef.current.render({ refreshSignal: false });
        }
      },
      dispose: () => {
        if (chartRef.current) {
          chartRef.current?.dispose();
        }
      },
      getChartExtent: () => {
        if (chartRef.current) {
          return chartRef.current.getChartExtent();
        } else {
          return [0, 0];
        }
      },
      render: () => {
        if (chartRef.current) {
          chartRef.current.render({ refreshSignal: false });
        }
      },
      toDataURL: (type?: string, quality?: number) => {
        if (chartRef.current) {
          return chartRef.current.toDataURL(type, quality);
        } else {
          return '';
        }
      },
      fetchAllData: (options) => {
        if (webWorkerRef.current?.hasFilter()) {
          webWorkerRef.current.fetchAllFiltersData(options);
        } else {
          webWorkerRef.current?.fetchAllTracksData(options);
        }
      },
      setWindowSize: (size: number) => {
        if (chartRef.current) {
          const selectionWindow = chartRef.current.getSelectionWindow();
          selectionWindow.getModel().setSize(size);
          chartRef.current.render({ refreshSignal: false });
        }
      },
      setForceCenter: (forceCenter: boolean) => {
        if (chartRef.current) {
          webWorkerRef.current?.mergeOptions({ forceCenter });
        }
      },
      setScaling: (scaling) => {
        if (chartRef.current) {
          chartRef.current.setScaling(scaling);
          chartRef.current.render({ refreshSignal: true });
        }
      },
      nextSelection: () => {
        if (chartRef.current) {
          const selectionWindow = chartRef.current.getSelectionWindow();
          selectionWindow.nextWindow();
          const { startTime } = selectionWindow.getModel().getOptions();
          const [, end] = chartRef.current.getChartExtent();
          if (startTime >= end) {
            chartRef.current.shiftViewDown();
            chartRef.current.render({ refreshSignal: true });
          }
        }
      },
      previousSelection: () => {
        if (chartRef.current) {
          const selectionWindow = chartRef.current.getSelectionWindow();
          selectionWindow.previousWindow();
          const { startTime } = selectionWindow.getModel().getOptions();
          const [start] = chartRef.current.getChartExtent();
          if (startTime <= start) {
            chartRef.current.shiftViewUp();
            chartRef.current.render({ refreshSignal: true });
          }
        }
      },
      applyFilter: (options) => {
        if (webWorkerRef.current) {
          // Fetch data is handled when .setChannel() is applied. So no need to
          // fetch filter data here.
          webWorkerRef.current.mergeOptions({ appliedFilter: options });
        }
      },
    };
  }, [chartRef, webWorkerRef, fetchData]);
}
