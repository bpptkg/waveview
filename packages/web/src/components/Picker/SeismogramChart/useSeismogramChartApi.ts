import { Channel, Seismogram, SeismogramEventMarkerOptions } from '@waveview/zcharts';
import { MutableRefObject, useMemo } from 'react';
import { SeismogramChartRef } from './SeismogramChart.types';
import { SeismogramWebWorker } from './SeismogramWebWorker';

export interface SeismogramChartInitOptions {
  chartRef: MutableRefObject<Seismogram | null>;
  webWorkerRef: MutableRefObject<SeismogramWebWorker | null>;
}

export default function useSeismogramChartApi(options: SeismogramChartInitOptions): SeismogramChartRef {
  const { chartRef, webWorkerRef } = options;

  return useMemo(() => {
    return {
      getInstance: () => chartRef.current!,
      setChannels: (channels: Channel[]) => {
        if (chartRef.current) {
          chartRef.current.setChannels(channels);
          chartRef.current.render();
          webWorkerRef.current?.fetchAllChannelsData();
          if (chartRef.current.isSpectrogramShown()) {
            webWorkerRef.current?.fetchAllSpectrogramData();
          }
        }
      },
      addChannel: (channel: Channel) => {
        if (chartRef.current) {
          chartRef.current.addChannel(channel);
          chartRef.current.render();
          if (chartRef.current.isSpectrogramShown()) {
            webWorkerRef.current?.fetchSpecrogramData(channel.id);
          }
          webWorkerRef.current?.fetchChannelData(channel.id);
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
      setExtent: (extent: [number, number]) => {
        if (chartRef.current) {
          chartRef.current.clearChannelData();
          chartRef.current.clearSpectrogramData();
          chartRef.current.getXAxis().setExtent(extent);

          webWorkerRef.current?.setSelectionWindow(extent);
          webWorkerRef.current?.fetchAllChannelsData();
          if (chartRef.current.isSpectrogramShown()) {
            webWorkerRef.current?.fetchAllSpectrogramData();
          }
          chartRef.current.render();
        }
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
      addEventMarker: (marker: SeismogramEventMarkerOptions) => {
        if (chartRef.current) {
          chartRef.current.addEventMarker(marker);
          chartRef.current.render();
        }
      },
      addEventMarkers: (markers: SeismogramEventMarkerOptions[]) => {
        if (chartRef.current) {
          chartRef.current.addEventMarkers(markers);
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
        webWorkerRef.current?.fetchAllFiltersData(options);
      },
      resetFilter: () => {
        webWorkerRef.current?.fetchAllChannelsData();
      },
      showSpectrogram: () => {
        if (chartRef.current) {
          chartRef.current.showSpectrograms();
          chartRef.current.render();
          webWorkerRef.current?.fetchAllSpectrogramData();
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
    };
  }, [chartRef, webWorkerRef]);
}
