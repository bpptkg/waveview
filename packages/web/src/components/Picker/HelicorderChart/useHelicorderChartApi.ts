import { Channel, Helicorder } from '@waveview/zcharts';
import { MutableRefObject, useMemo } from 'react';
import { HelicorderChartRef } from './HelicorderChart.types';
import { HelicorderWebWorker } from './HelicorderWebWorker';

export interface HelicorderChartInitOptions {
  chartRef: MutableRefObject<Helicorder | null>;
  webWorkerRef: MutableRefObject<HelicorderWebWorker | null>;
}

export function useHelicorderChartApi(options: HelicorderChartInitOptions): HelicorderChartRef {
  const { chartRef, webWorkerRef } = options;

  return useMemo(() => {
    return {
      getInstance: () => chartRef.current!,
      shiftViewUp: (by: number = 1) => {
        if (chartRef.current) {
          chartRef.current.shiftViewUp(by);
        }
      },
      shiftViewDown: (by: number = 1) => {
        if (chartRef.current) {
          chartRef.current.shiftViewDown(by);
        }
      },
      shiftViewToNow: () => {
        if (chartRef.current) {
          chartRef.current.shiftViewToNow();
        }
      },
      increaseAmplitude: (by: number) => {
        if (chartRef.current) {
          chartRef.current.increaseAmplitude(by);
        }
      },
      decreaseAmplitude: (by: number) => {
        if (chartRef.current) {
          chartRef.current.decreaseAmplitude(by);
        }
      },
      resetAmplitude: () => {
        if (chartRef.current) {
          chartRef.current.resetAmplitude();
        }
      },
      clearData: () => {
        if (chartRef.current) {
          chartRef.current.clearData();
        }
      },
      setChannel: (channel: Channel) => {
        if (chartRef.current) {
          chartRef.current.setChannel(channel);
        }
      },
      getChannel: () => {
        return chartRef.current?.getChannel();
      },
      setOffsetDate: (date: number) => {
        if (chartRef.current) {
          chartRef.current.setOffsetDate(date);
        }
      },
      setInterval: (interval: number) => {
        if (chartRef.current) {
          chartRef.current.setInterval(interval);
        }
      },
      setDuration: (duration: number) => {
        if (chartRef.current) {
          chartRef.current.setDuration(duration);
        }
      },
      setTheme: (theme: 'light' | 'dark') => {
        if (chartRef.current) {
          chartRef.current.setTheme(theme);
        }
      },
      setUseUTC: (useUTC: boolean) => {
        if (chartRef.current) {
          chartRef.current.setUseUTC(useUTC);
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
        }
      },
      addEventMarkers: (markersOptions, options) => {
        if (chartRef.current) {
          chartRef.current.addEventMarkers(markersOptions, options);
        }
      },
      removeEventMarker: (start, end) => {
        if (chartRef.current) {
          chartRef.current.removeEventMarker(start, end);
        }
      },
      showEventMarkers: () => {
        if (chartRef.current) {
          chartRef.current.showEventMarkers();
        }
      },
      hideEventMarkers: () => {
        if (chartRef.current) {
          chartRef.current.hideEventMarkers();
        }
      },
      clearEventMarkers: () => {
        if (chartRef.current) {
          chartRef.current.clearEventMarkers();
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
      render: (options) => {
        if (chartRef.current) {
          chartRef.current.render(options);
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
        if (!webWorkerRef.current) {
          return;
        }
        const { debounce } = options || {};
        if (debounce) {
          if (webWorkerRef.current?.hasFilter()) {
            webWorkerRef.current?.fetchAllFiltersDataDebounced(options);
          } else {
            webWorkerRef.current?.fetchAllTracksDataDebounced(options);
          }
        } else {
          if (webWorkerRef.current?.hasFilter()) {
            webWorkerRef.current?.fetchAllFiltersData(options);
          } else {
            webWorkerRef.current?.fetchAllTracksData(options);
          }
        }
      },
      setWindowSize: (size: number) => {
        if (chartRef.current) {
          const selectionWindow = chartRef.current.getSelectionWindow();
          selectionWindow.getModel().setSize(size);
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
          }
        }
      },
      applyFilter: (options) => {
        if (webWorkerRef.current) {
          webWorkerRef.current.mergeOptions({ appliedFilter: options });
        }
      },
    };
  }, [chartRef, webWorkerRef]);
}
