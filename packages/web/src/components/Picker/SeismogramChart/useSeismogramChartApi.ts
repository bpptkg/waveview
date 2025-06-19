import { Channel, Seismogram, SeismogramEventMarkerOptions } from '@waveview/zcharts';
import { MutableRefObject, useMemo } from 'react';
import { ONE_MINUTE } from '../../../shared/time';
import { SeismogramChartRef, SetExtentOptions } from './SeismogramChart.types';
import { SeismogramWebWorker } from './SeismogramWebWorker';

export interface SeismogramChartInitOptions {
  chartRef: MutableRefObject<Seismogram | null>;
  webWorkerRef: MutableRefObject<SeismogramWebWorker | null>;
}

export function useSeismogramChartApi(options: SeismogramChartInitOptions): SeismogramChartRef {
  const { chartRef, webWorkerRef } = options;

  return useMemo(() => {
    return {
      getInstance: () => chartRef.current!,
      setChannels: (channels: Channel[]) => {
        if (chartRef.current) {
          chartRef.current.setChannels(channels);
        }
      },
      addChannel: (channel: Channel) => {
        if (chartRef.current) {
          chartRef.current.addChannel(channel);
        }
      },
      removeChannel: (index: number) => {
        if (chartRef.current) {
          chartRef.current.removeChannel(index);
        }
      },
      moveChannelUp: (index: number) => {
        if (chartRef.current) {
          chartRef.current.moveChannelUp(index);
        }
      },
      moveChannelDown: (index: number) => {
        if (chartRef.current) {
          chartRef.current.moveChannelDown(index);
        }
      },
      zoomIn: (by: number) => {
        if (chartRef.current) {
          const [start, end] = chartRef.current.getChartExtent();
          const center = start + (end - start) / 2;
          chartRef.current.zoomIn(center, by);
        }
      },
      zoomOut: (by: number) => {
        if (chartRef.current) {
          const [start, end] = chartRef.current.getChartExtent();
          const center = start + (end - start) / 2;
          chartRef.current.zoomOut(center, by);
        }
      },
      scrollLeft: (by: number) => {
        if (chartRef.current) {
          chartRef.current.scrollLeft(by);
        }
      },
      scrollRight: (by: number) => {
        if (chartRef.current) {
          chartRef.current.scrollRight(by);
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
      setExtent: (extent: [number, number], options?: SetExtentOptions) => {
        if (chartRef.current && webWorkerRef.current) {
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
      },
      fitToWindow: () => {
        if (!chartRef.current || !webWorkerRef.current) {
          return;
        }
        const { selectionWindow } = webWorkerRef.current.getOptions();
        const [start, end] = selectionWindow;
        chartRef.current.getXAxis().setExtent([start, end]);
      },
      setTheme: (theme: 'light' | 'dark') => {
        if (chartRef.current) {
          chartRef.current.setTheme(theme);
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
        }
      },
      clearPickRange: () => {
        if (chartRef.current) {
          const picker = chartRef.current.getPicker();
          picker.clearRange();
          const pickAssistant = chartRef.current.getPickAssistant();
          pickAssistant.clearRange();
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
      addEventMarker: (markerOptions: SeismogramEventMarkerOptions, options) => {
        if (chartRef.current) {
          chartRef.current.addEventMarker(markerOptions, options);
        }
      },
      addEventMarkers: (markersOptions: SeismogramEventMarkerOptions[], options) => {
        if (chartRef.current) {
          chartRef.current.addEventMarkers(markersOptions, options);
        }
      },
      removeEventMarker: (start: number, end: number) => {
        if (chartRef.current) {
          chartRef.current.removeEventMarker(start, end);
        }
      },
      clearEventMarkers: () => {
        if (chartRef.current) {
          chartRef.current.clearEventMarkers();
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
      fetchAllChannelsData: (options) => {
        if (chartRef.current && webWorkerRef.current) {
          if (webWorkerRef.current.hasFilter()) {
            webWorkerRef.current.fetchAllFiltersData();
          } else {
            webWorkerRef.current.fetchAllChannelsData(options);
          }
          if (chartRef.current.isSpectrogramVisible()) {
            webWorkerRef.current.fetchAllSpectrogramData(options);
          }
        }
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
          webWorkerRef.current?.fetchAllSpectrogramData({ mode: 'cache' });
        }
      },
      hideSpectrogram: () => {
        if (chartRef.current) {
          chartRef.current.hideSpectrograms();
        }
      },
      showSignal: () => {
        if (chartRef.current) {
          chartRef.current.showSignals();
        }
      },
      hideSignal: () => {
        if (chartRef.current) {
          chartRef.current.hideSignals();
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
        }
      },
      restoreView: () => {
        if (chartRef.current) {
          chartRef.current.restoreView();
        }
      },
      setForceCenter: (forceCenter: boolean) => {
        if (webWorkerRef.current) {
          webWorkerRef.current.mergeOptions({ forceCenter });
        }
      },
      getFirstArrivalChannelId: () => {
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
        }
      },
      setWorkerOptions: (options) => {
        if (webWorkerRef.current) {
          webWorkerRef.current.mergeOptions(options);
        }
      },
      clearChannelData: () => {
        if (chartRef.current) {
          chartRef.current.clearChannelData();
        }
      },
      clearSpectrogramData: () => {
        if (chartRef.current) {
          chartRef.current.clearSpectrogramData();
        }
      },
      setPickAssistantRange: (start: number, end: number) => {
        if (chartRef.current) {
          const pickAssistant = chartRef.current.getPickAssistant();
          pickAssistant.setRange(start, end);
        }
      },
      clearPickAssistantRange: () => {
        if (chartRef.current) {
          const pickAssistant = chartRef.current.getPickAssistant();
          pickAssistant.clearRange();
        }
      },
    };
  }, [chartRef, webWorkerRef]);
}
