import { Channel, Seismogram, SeismogramEventMarkerOptions } from '@waveview/zcharts';
import { MutableRefObject, useCallback, useMemo } from 'react';
import { ONE_MINUTE } from '../../../shared/time';
import { SeismogramChartRef, SetExtentOptions } from './SeismogramChart.types';
import { SeismogramWebWorker } from './SeismogramWebWorker';

export interface SeismogramChartInitOptions {
  chartRef: MutableRefObject<Seismogram | null>;
  webWorkerRef: MutableRefObject<SeismogramWebWorker | null>;
}

export function useSeismogramChartApi(options: SeismogramChartInitOptions): SeismogramChartRef {
  const { chartRef, webWorkerRef } = options;

  const fetchData = useCallback(() => {
    if (chartRef.current && webWorkerRef.current) {
      if (webWorkerRef.current.hasFilter()) {
        webWorkerRef.current.fetchAllFiltersData();
      } else {
        webWorkerRef.current.fetchAllChannelsData();
      }
      if (chartRef.current.isSpectrogramShown()) {
        webWorkerRef.current.fetchAllSpectrogramData();
      }
    }
  }, [chartRef, webWorkerRef]);

  return useMemo(() => {
    return {
      getInstance: () => chartRef.current!,
      setChannels: (channels: Channel[]) => {
        if (chartRef.current) {
          chartRef.current.setChannels(channels);
          chartRef.current.render();
          fetchData();
        }
      },
      addChannel: (channel: Channel) => {
        if (chartRef.current) {
          chartRef.current.addChannel(channel);
          chartRef.current.render();
          fetchData();
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
        }
      },
      zoomOut: (by: number) => {
        if (chartRef.current) {
          const [start, end] = chartRef.current.getChartExtent();
          const center = start + (end - start) / 2;
          chartRef.current.zoomOut(center, by);
          chartRef.current.render();
        }
      },
      scrollLeft: (by: number) => {
        if (chartRef.current) {
          chartRef.current.scrollLeft(by);
          chartRef.current.render();
        }
      },
      scrollRight: (by: number) => {
        if (chartRef.current) {
          chartRef.current.scrollRight(by);
          chartRef.current.render();
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
      setExtent: (extent: [number, number], options?: SetExtentOptions) => {
        if (chartRef.current && webWorkerRef.current) {
          chartRef.current.clearChannelData();
          chartRef.current.clearSpectrogramData();

          const { autoZoom = false } = options || {};
          if (autoZoom) {
            // Set the extent of the chart to the first minute of the selection
            // window so that the user can see the initial signal.
            const [start] = extent;
            const end = start + ONE_MINUTE;
            chartRef.current.getXAxis().setExtent([start, end]);
          } else {
            chartRef.current.getXAxis().setExtent(extent);
          }

          webWorkerRef.current.mergeOptions({ selectionWindow: extent });
          chartRef.current.render();
          fetchData();
        }
      },
      zoomFirstMinute: () => {
        if (!chartRef.current || !webWorkerRef.current) {
          return;
        }
        const { selectionWindow } = webWorkerRef.current.getOptions();
        const [start] = selectionWindow;
        const firstMinute = start + ONE_MINUTE;
        chartRef.current.getXAxis().setExtent([start, firstMinute]);
        chartRef.current.render();
      },
      fitToWindow: () => {
        if (!chartRef.current || !webWorkerRef.current) {
          return;
        }
        const { selectionWindow } = webWorkerRef.current.getOptions();
        const [start, end] = selectionWindow;
        chartRef.current.getXAxis().setExtent([start, end]);
        chartRef.current.render();
      },
      setTheme: (theme: 'light' | 'dark') => {
        if (chartRef.current) {
          chartRef.current.setTheme(theme);
          chartRef.current.render();
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
      isPickModeEnabled: () => {
        if (chartRef.current) {
          const picker = chartRef.current.getPicker();
          return picker.isEnabled();
        }
        return false;
      },
      enablePickMode: () => {
        if (chartRef.current) {
          const picker = chartRef.current.getPicker();
          picker.enable();
        }
      },
      disablePickMode: () => {
        if (chartRef.current) {
          const picker = chartRef.current.getPicker();
          picker.disable();
        }
      },
      setPickRange: (range: [number, number]) => {
        if (chartRef.current) {
          const picker = chartRef.current.getPicker();
          picker.setRange(range);
          chartRef.current.render();
        }
      },
      clearPickRange: () => {
        if (chartRef.current) {
          const picker = chartRef.current.getPicker();
          picker.clearRange();
          chartRef.current.render();
        }
      },
      showEventMarkers: () => {
        if (chartRef.current) {
          chartRef.current.showEventMarkers();
          chartRef.current.render();
        }
      },
      hideEventMarkers: () => {
        if (chartRef.current) {
          chartRef.current.hideEventMarkers();
          chartRef.current.render();
        }
      },
      addEventMarker: (markerOptions: SeismogramEventMarkerOptions, options) => {
        if (chartRef.current) {
          chartRef.current.addEventMarker(markerOptions, options);
          chartRef.current.render();
        }
      },
      addEventMarkers: (markersOptions: SeismogramEventMarkerOptions[], options) => {
        if (chartRef.current) {
          chartRef.current.addEventMarkers(markersOptions, options);
          chartRef.current.render();
        }
      },
      removeEventMarker: (start: number, end: number) => {
        if (chartRef.current) {
          chartRef.current.removeEventMarker(start, end);
          chartRef.current.render();
        }
      },
      clearEventMarkers: () => {
        if (chartRef.current) {
          chartRef.current.clearEventMarkers();
          chartRef.current.render();
        }
      },
      dispose: () => {
        if (chartRef.current) {
          chartRef.current.dispose();
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
        chartRef.current?.render();
      },
      fetchAllChannelsData: () => {
        webWorkerRef.current?.fetchAllChannelsData();
      },
      applyFilter: (options) => {
        webWorkerRef.current?.mergeOptions({ appliedFilter: options });
        webWorkerRef.current?.fetchAllFiltersData();
      },
      resetFilter: () => {
        webWorkerRef.current?.fetchAllChannelsData();
        webWorkerRef.current?.mergeOptions({ appliedFilter: null });
      },
      showSpectrogram: () => {
        if (chartRef.current) {
          chartRef.current.showSpectrograms();
          chartRef.current.render();
          webWorkerRef.current?.fetchAllSpectrogramData({ mode: 'cache' });
        }
      },
      hideSpectrogram: () => {
        if (chartRef.current) {
          chartRef.current.hideSpectrograms();
          chartRef.current.render();
        }
      },
      showSignal: () => {
        if (chartRef.current) {
          chartRef.current.showSignals();
          chartRef.current.render();
        }
      },
      hideSignal: () => {
        if (chartRef.current) {
          chartRef.current.hideSignals();
          chartRef.current.render();
        }
      },
      toDataURL: (type?: string, quality?: number) => {
        if (chartRef.current) {
          return chartRef.current.toDataURL(type, quality);
        } else {
          return '';
        }
      },
      expandView: (index: number) => {
        if (chartRef.current) {
          chartRef.current.expandView(index);
          chartRef.current.render();
        }
      },
      restoreView: () => {
        if (chartRef.current) {
          chartRef.current.restoreView();
          chartRef.current.render();
        }
      },
      setForceCenter: (forceCenter: boolean) => {
        if (webWorkerRef.current) {
          webWorkerRef.current.mergeOptions({ forceCenter });
        }
      },
      getFirstArrialChannelId: () => {
        if (chartRef.current) {
          const picker = chartRef.current.getPicker();
          const { y } = picker.dragStart;
          const trackManager = chartRef.current.getTrackManager();
          const index = trackManager.getTrackIndexByY(y);
          return trackManager.getChannelByIndex(index)?.id;
        } else {
          return undefined;
        }
      },
      setScaling: (scaling) => {
        if (chartRef.current) {
          chartRef.current.setScaling(scaling);
          chartRef.current.refreshChannelData();
          chartRef.current.render();
        }
      },
      setWorkerOptions: (options) => {
        if (webWorkerRef.current) {
          webWorkerRef.current.mergeOptions(options);
        }
      },
    };
  }, [chartRef, webWorkerRef, fetchData]);
}
