import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Toast,
  Toaster,
  ToastTitle,
  Tooltip,
  useId,
  useToastController,
} from '@fluentui/react-components';
import { ArrowAutofitWidthDottedRegular, ArrowDownRegular, MoreHorizontalRegular } from '@fluentui/react-icons';
import { ReactECharts, ReactEChartsType } from '@waveview/react-echarts';
import { BarChart } from 'echarts/charts';
import { GridComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import DateRangePicker from '../../components/DatePicker/DateRangePicker';
import { formatTimezonedDate } from '../../shared/time';
import { useAppStore } from '../../stores/app';
import { useCatalogStore } from '../../stores/catalog';
import { useRfApDirectionStore } from '../../stores/rfapDirection';
import { CustomError } from '../../types/response';

echarts.use([BarChart, GridComponent, CanvasRenderer, TitleComponent, TooltipComponent]);

const RfApDirection: React.FC = () => {
  const roseChartRef = useRef<ReactEChartsType>(null);
  const barChartRef = useRef<ReactEChartsType>(null);
  const distChartRef = useRef<ReactEChartsType>(null);

  const {
    startDate,
    endDate,
    periods,
    periodIndex,
    barAxisType,
    roseAxisType,
    setBarAxisType,
    setRoseAxisType,
    setPeriodIndex,
    setTimeRange,
    fetchRfApDirection,
    getDistributionChartOption,
    getDirectionRoseChartOption,
    getDirectionBarChartOption,
  } = useRfApDirectionStore();

  const toasterId = useId('visual');
  const { dispatchToast } = useToastController(toasterId);

  const showErrorToast = useCallback(
    (error: CustomError) => {
      dispatchToast(
        <Toast>
          <ToastTitle>{error.message}</ToastTitle>
        </Toast>,
        { intent: 'error' }
      );
    },
    [dispatchToast]
  );

  const { useUTC } = useAppStore();

  const startDateFormatted = useMemo(() => {
    const template = 'MMM dd, yyyy';
    return formatTimezonedDate(startDate, template, useUTC);
  }, [startDate, useUTC]);

  const endDateFormatted = useMemo(() => {
    const template = 'MMM dd, yyyy';
    return formatTimezonedDate(endDate, template, useUTC);
  }, [endDate, useUTC]);

  const updatePlot = useCallback(() => {
    fetchRfApDirection()
      .then(() => {
        roseChartRef.current?.setOption(getDirectionRoseChartOption(), true, true);
        barChartRef.current?.setOption(getDirectionBarChartOption(), true, true);
        distChartRef.current?.setOption(getDistributionChartOption(), true, true);
      })
      .catch(() => {
        showErrorToast(new CustomError('Failed to fetch RF & AP data'));
      });
  }, [fetchRfApDirection, getDirectionBarChartOption, getDirectionRoseChartOption, getDistributionChartOption, showErrorToast]);

  useEffect(() => {
    updatePlot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateRangeChange = useCallback(
    (index: number, start: number, end: number) => {
      setTimeRange(start, end);
      setPeriodIndex(index);
      updatePlot();
    },
    [setTimeRange, setPeriodIndex, updatePlot]
  );

  const handleRefresh = useCallback(() => {
    updatePlot();
  }, [updatePlot]);

  const handleToggleRoseAxisType = useCallback(() => {
    setRoseAxisType(roseAxisType === 'count' ? 'distance' : 'count');
    roseChartRef.current?.setOption(getDirectionRoseChartOption(), true, true);
  }, [roseAxisType, roseChartRef, setRoseAxisType, getDirectionRoseChartOption]);

  const handleToggleBarAxisType = useCallback(() => {
    setBarAxisType(barAxisType === 'count' ? 'distance' : 'count');
    barChartRef.current?.setOption(getDirectionBarChartOption(), true, true);
  }, [barAxisType, barChartRef, setBarAxisType, getDirectionBarChartOption]);

  const handleRoseChartDownload = useCallback(() => {
    const dataURL = roseChartRef.current?.toDataURL({ type: 'png' });
    if (dataURL) {
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = 'rfap-direction-rose.png';
      a.click();
      a.remove();
    }
  }, [roseChartRef]);

  const handleBarChartDownload = useCallback(() => {
    const dataURL = barChartRef.current?.toDataURL({ type: 'png' });
    if (dataURL) {
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = 'rfap-direction-bar.png';
      a.click();
      a.remove();
    }
  }, [barChartRef]);

  const handleDistChartDownload = useCallback(() => {
    const dataURL = distChartRef.current?.toDataURL({ type: 'png' });
    if (dataURL) {
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = 'rfap-direction-distribution.png';
      a.click();
      a.remove();
    }
  }, [distChartRef]);

  const previousCatalogIdRef = useRef<string>('');
  const { currentCatalog } = useCatalogStore();

  useEffect(() => {
    if (currentCatalog && !previousCatalogIdRef.current) {
      previousCatalogIdRef.current = currentCatalog.id;
    }
  }, [currentCatalog]);

  useEffect(() => {
    if (currentCatalog && previousCatalogIdRef.current) {
      if (previousCatalogIdRef.current !== currentCatalog.id) {
        updatePlot();
      }
      previousCatalogIdRef.current = currentCatalog.id;
    }
  }, [currentCatalog, updatePlot]);

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-0 right-0 bottom-0 left-0 overflow-auto">
        <div className="p-2 mb-4">
          <div>
            <div>
              <div className="flex items-center justify-between">
                <h1 className="font-bold text-md">Rockfall & Awan Panas Direction</h1>
                <Menu>
                  <MenuTrigger disableButtonEnhancement>
                    <Button icon={<MoreHorizontalRegular fontSize={20} />} appearance="transparent" />
                  </MenuTrigger>
                  <MenuPopover>
                    <MenuList>
                      <MenuItem onClick={handleRefresh}>Refresh</MenuItem>
                    </MenuList>
                  </MenuPopover>
                </Menu>
              </div>
              <div>
                <span className="text-gray-400">Date range: </span>
                <span className="font-semibold">
                  {startDateFormatted} - {endDateFormatted}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <DateRangePicker periods={periods} defaultIndex={periodIndex} startDate={startDate} endDate={endDate} onChange={handleDateRangeChange} />
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg p-1">
                <div className="flex items-center justify-end gap-1 mx-2">
                  <Tooltip content="Download as image" relationship="label" showDelay={1500}>
                    <Button appearance="transparent" size="small" icon={<ArrowDownRegular fontSize={16} />} onClick={handleRoseChartDownload} />
                  </Tooltip>
                  <Tooltip content={roseAxisType === 'count' ? 'Switch to distance' : 'Switch to count'} relationship="label" showDelay={1500}>
                    <Button appearance="transparent" size="small" icon={<ArrowAutofitWidthDottedRegular fontSize={16} />} onClick={handleToggleRoseAxisType} />
                  </Tooltip>
                </div>
                <ReactECharts
                  ref={roseChartRef}
                  style={{
                    height: '300px',
                    width: '100%',
                  }}
                />
              </div>
              <div className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg p-1">
                <div className="flex items-center justify-end gap-1 mx-2">
                  <Tooltip content="Download as image" relationship="label" showDelay={1500}>
                    <Button appearance="transparent" size="small" icon={<ArrowDownRegular fontSize={16} />} onClick={handleBarChartDownload} />
                  </Tooltip>
                  <Tooltip content={barAxisType === 'count' ? 'Switch to distance' : 'Switch to count'} relationship="label" showDelay={1500}>
                    <Button appearance="transparent" size="small" icon={<ArrowAutofitWidthDottedRegular fontSize={16} />} onClick={handleToggleBarAxisType} />
                  </Tooltip>
                </div>
                <ReactECharts
                  ref={barChartRef}
                  style={{
                    height: '300px',
                    width: '100%',
                  }}
                />
              </div>
            </div>
            <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-1">
              <div className="flex items-center justify-end gap-1 mx-2">
                <Tooltip content="Download as image" relationship="label" showDelay={1500}>
                  <Button appearance="transparent" size="small" icon={<ArrowDownRegular fontSize={16} />} onClick={handleDistChartDownload} />
                </Tooltip>
              </div>
              <ReactECharts
                ref={distChartRef}
                style={{
                  height: '300px',
                  width: '100%',
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <Toaster toasterId={toasterId} />
    </div>
  );
};

export default RfApDirection;
