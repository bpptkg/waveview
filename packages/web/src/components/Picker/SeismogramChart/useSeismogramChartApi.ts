import {
  AxisPointerExtension,
  Channel,
  PickerExtension,
  Seismogram,
  SeismogramEventManagerExtension,
  SeismogramEventMarkerOptions,
  SeismogramWebWorker,
  ZoomRectangleExtension,
} from '@waveview/charts';
import { MutableRefObject, useMemo } from 'react';
import { SeismogramChartRef } from './SeismogramChart.types';

export interface SeismogramChartInitOptions {
  chartRef: MutableRefObject<Seismogram | null>;
  webWorkerRef: MutableRefObject<SeismogramWebWorker | null>;
  zoomRectangleExtensionRef: MutableRefObject<ZoomRectangleExtension | null>;
  axisPointerExtensionRef: MutableRefObject<AxisPointerExtension | null>;
  eventManagerExtensionRef: MutableRefObject<SeismogramEventManagerExtension | null>;
  pickerExtensionRef: MutableRefObject<PickerExtension | null>;
  workerRef: MutableRefObject<Worker | null>;
  resizeObserverRef: MutableRefObject<ResizeObserver | null>;
  fetchAllChannelsData: () => void;
  fetchChannelData: (channelId: string) => void;
}

export default function useSeismogramChartApi(options: SeismogramChartInitOptions): SeismogramChartRef {
  const { chartRef, zoomRectangleExtensionRef, pickerExtensionRef, workerRef, resizeObserverRef, fetchAllChannelsData, fetchChannelData } = options;

  return useMemo(() => {
    return {
      getInstance: () => chartRef.current!,
      setChannels: (channels: Channel[]) => {
        if (chartRef.current) {
          chartRef.current.setChannels(channels);
          chartRef.current.render();
          fetchAllChannelsData();
        }
      },
      addChannel: (channel: Channel) => {
        if (chartRef.current) {
          chartRef.current.addChannel(channel);
          chartRef.current.render();
          fetchChannelData(channel.id);
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
          fetchAllChannelsData();
        }
      },
      zoomOut: (by: number) => {
        if (chartRef.current) {
          const [start, end] = chartRef.current.getChartExtent();
          const center = start + (end - start) / 2;
          chartRef.current.zoomOut(center, by);
          chartRef.current.render();
          fetchAllChannelsData();
        }
      },
      scrollLeft: (by: number) => {
        if (chartRef.current) {
          chartRef.current.scrollLeft(by);
          chartRef.current.render();
          fetchAllChannelsData();
        }
      },
      scrollRight: (by: number) => {
        if (chartRef.current) {
          chartRef.current.scrollRight(by);
          chartRef.current.render();
          fetchAllChannelsData();
        }
      },
      scrollToNow: () => {
        if (chartRef.current) {
          chartRef.current.scrollToNow();
          chartRef.current.render();
          fetchAllChannelsData();
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
          chartRef.current.clearData();
          chartRef.current.getXAxis().setExtent(extent);
          chartRef.current.render();
          fetchAllChannelsData();
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
          return zoomRectangleExtensionRef.current.getAPI().isActive();
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
          pickerExtensionRef.current.getAPI().clearRange();
          chartRef.current?.render();
        }
      },
      isPickModeActive: () => {
        if (pickerExtensionRef.current) {
          return pickerExtensionRef.current.isActive();
        }
        return false;
      },
      enablePickMode: () => {
        if (pickerExtensionRef.current) {
          const api = pickerExtensionRef.current.getAPI();
          api.enable();
        }
      },
      disablePickMode: () => {
        if (pickerExtensionRef.current) {
          const api = pickerExtensionRef.current.getAPI();
          api.disable();
          api.clearRange();
          api.clear();
        }
      },
      setPickRange: (range: [number, number]) => {
        if (pickerExtensionRef.current) {
          pickerExtensionRef.current.getAPI().setRange(range);
          chartRef.current?.render();
        }
      },
      clearPickRange: () => {
        if (pickerExtensionRef.current) {
          pickerExtensionRef.current.getAPI().clearRange();
          chartRef.current?.render();
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
      addEventMarker: (marker: SeismogramEventMarkerOptions) => {
        if (chartRef.current) {
          chartRef.current.addEventMarker(marker);
          chartRef.current.render();
        }
      },
      removeEventMarker: (start: number, end: number) => {
        if (chartRef.current) {
          chartRef.current.removeEventMarker(start, end);
          chartRef.current.render();
        }
      },
      clearAllEventMarkers: () => {
        if (chartRef.current) {
          chartRef.current.removeAllMarkers();
          chartRef.current.render();
        }
      },
      dispose: () => {
        chartRef.current?.dispose();
        workerRef.current?.terminate();
        resizeObserverRef.current?.disconnect();
      },
      getChartExtent: () => {
        if (chartRef.current) {
          return chartRef.current.getChartExtent();
        } else {
          return [0, 0];
        }
      },
    };
  }, [chartRef, zoomRectangleExtensionRef, pickerExtensionRef, workerRef, resizeObserverRef, fetchAllChannelsData, fetchChannelData]);
}
