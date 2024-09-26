import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Toast,
  Toaster,
  ToastTitle,
  useId,
  useToastController,
} from '@fluentui/react-components';
import { MoreHorizontalRegular } from '@fluentui/react-icons';
import { ReactECharts, ReactEChartsType } from '@waveview/react-echarts';
import { sub } from 'date-fns';
import { BarChart } from 'echarts/charts';
import { GridComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import EventTypeLabel from '../../components/Catalog/EventTypeLabel';
import DateRangePicker from '../../components/DatePicker/DateRangePicker';
import { formatNumber } from '../../shared/formatting';
import { max, mean, median, minNonZero, standardDeviation, sum } from '../../shared/statistics';
import { formatTimezonedDate } from '../../shared/time';
import { useAppStore } from '../../stores/app';
import { useSeismicityStore } from '../../stores/seismicity';
import { CustomError } from '../../types/response';
import { Sampling } from '../../types/seismicity';

echarts.use([BarChart, GridComponent, CanvasRenderer, TitleComponent, TooltipComponent]);

const Seismicity = () => {
  const chartRef = useRef<ReactEChartsType>(null);

  const {
    seismicity,
    startDate,
    endDate,
    periodIndex,
    periodsDay,
    periodsHour,
    sampling,
    fetchSeismicity,
    getEChartsOption,
    setTimeRange,
    setSampling,
    setPeriodIndex,
  } = useSeismicityStore();

  const toasterId = useId('seismicity');
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

  const periods = useMemo(() => {
    return sampling === 'day' ? periodsDay : periodsHour;
  }, [periodsDay, periodsHour, sampling]);

  const updatePlot = useCallback(() => {
    fetchSeismicity()
      .then(() => {
        const option = getEChartsOption();
        chartRef.current?.setOption(option, true, true);
      })
      .catch(() => {
        showErrorToast(new CustomError('Failed to fetch seismicity data'));
      });
  }, [fetchSeismicity, getEChartsOption, showErrorToast]);

  const startDateFormatted = useMemo(() => {
    const template = sampling === 'day' ? 'MMMM dd, yyyy' : 'MMMM dd, yyyy HH:mm';
    return formatTimezonedDate(startDate, template, useUTC);
  }, [startDate, sampling, useUTC]);

  const endDateFormatted = useMemo(() => {
    const template = sampling === 'day' ? 'MMMM dd, yyyy' : 'MMMM dd, yyyy HH:mm';
    return formatTimezonedDate(endDate, template, useUTC);
  }, [endDate, sampling, useUTC]);

  useEffect(() => {
    if (!seismicity) {
      updatePlot();
    } else {
      const option = getEChartsOption();
      chartRef.current?.setOption(option, true, true);
    }
  }, [seismicity, chartRef, getEChartsOption, updatePlot]);

  const chartStyle = useMemo(() => {
    const length = seismicity?.length || 0;
    return {
      height: 100 * length,
    };
  }, [seismicity]);

  const handleDateRangeChange = useCallback(
    (index: number, start: number, end: number) => {
      setTimeRange(start, end);
      setPeriodIndex(index);
      updatePlot();
    },
    [setTimeRange, setPeriodIndex, updatePlot]
  );

  const handleSamplingChange = useCallback(
    (value: string) => {
      const sample = value as Sampling;
      setSampling(sample);
      setPeriodIndex(0);

      if (sample === 'day') {
        const period = periodsDay[0];
        const end = Date.now();
        const start = sub(end, { [period.unit]: period.value }).getTime();
        setTimeRange(start, end);
      } else {
        const period = periodsHour[0];
        const end = Date.now();
        const start = sub(end, { [period.unit]: period.value }).getTime();
        setTimeRange(start, end);
      }

      updatePlot();
    },
    [periodsDay, periodsHour, setSampling, setPeriodIndex, setTimeRange, updatePlot]
  );

  const handleRefresh = useCallback(() => {
    updatePlot();
  }, [updatePlot]);

  const handleDownload = useCallback(async () => {
    const dataURL = chartRef.current?.toDataURL({ type: 'png', pixelRatio: 3 });
    if (dataURL) {
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = 'seismicity.png';
      a.click();
      a.remove();
    }
  }, []);

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-0 right-0 bottom-0 left-0 overflow-auto">
        <div className="p-3 bg-white dark:bg-black">
          <div>
            <div>
              <div className="flex items-center justify-between">
                <h1 className="font-bold text-md">Seismicity</h1>
                <Menu>
                  <MenuTrigger disableButtonEnhancement>
                    <Button icon={<MoreHorizontalRegular fontSize={20} />} appearance="transparent" />
                  </MenuTrigger>
                  <MenuPopover>
                    <MenuList>
                      <MenuItem onClick={handleRefresh}>Refresh</MenuItem>
                      <MenuItem onClick={handleDownload}>Save as Image</MenuItem>
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
              <Select appearance="outline" defaultValue={sampling} onChange={(_, data) => handleSamplingChange(data.value)}>
                <option value={'day'}>Daily</option>
                <option value={'hour'}>Hourly</option>
              </Select>
            </div>
          </div>

          <ReactECharts ref={chartRef} style={chartStyle} option={{}} notMerge={true} lazyUpdate={true} autoResize={true} />

          <Table aria-label="Seismicity Table" className="mt-2">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Event type</TableHeaderCell>
                <TableHeaderCell>Min</TableHeaderCell>
                <TableHeaderCell>Max</TableHeaderCell>
                <TableHeaderCell>Average</TableHeaderCell>
                <TableHeaderCell>Total</TableHeaderCell>
                <TableHeaderCell>Median</TableHeaderCell>
                <TableHeaderCell>Std Dev</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seismicity ? (
                seismicity.map((item) => (
                  <TableRow key={item.event_type.id}>
                    <TableCell>
                      <EventTypeLabel eventType={item.event_type} />
                    </TableCell>
                    <TableCell>{formatNumber(minNonZero(item.data.map((v) => v.count)), { precision: 0 })}</TableCell>
                    <TableCell>{formatNumber(max(item.data.map((v) => v.count)), { precision: 0 })}</TableCell>
                    <TableCell>{formatNumber(mean(item.data.map((v) => v.count)), { precision: 1 })}</TableCell>
                    <TableCell>{formatNumber(sum(item.data.map((v) => v.count)), { precision: 0 })}</TableCell>
                    <TableCell>{formatNumber(median(item.data.map((v) => v.count)), { precision: 1 })}</TableCell>
                    <TableCell>{formatNumber(standardDeviation(item.data.map((v) => v.count)), { precision: 1 })}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableHeaderCell colSpan={7}>
                    <span className="text-center w-full">No data found</span>
                  </TableHeaderCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <Toaster toasterId={toasterId} />
    </div>
  );
};

export default Seismicity;
