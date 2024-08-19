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
} from '@fluentui/react-components';
import { MoreHorizontalRegular } from '@fluentui/react-icons';
import { ReactECharts } from '@waveview/react-echarts';
import { format, sub } from 'date-fns';
import { BarChart } from 'echarts/charts';
import { GridComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import EventTypeLabel from '../../components/Catalog/EventTypeLabel';
import DateRangePicker from '../../components/DatePicker/DateRangePicker';
import { formatNumber } from '../../shared/formatting';
import { max, mean, min, sum } from '../../shared/statistics';
import { useSeismicityStore } from '../../stores/seismicity';
import { Sampling } from '../../types/seismicity';

echarts.use([BarChart, GridComponent, CanvasRenderer, TitleComponent, TooltipComponent]);

const Seismicity = () => {
  const chartRef = useRef<ReactECharts>(null);

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

  const periods = useMemo(() => {
    return sampling === 'day' ? periodsDay : periodsHour;
  }, [periodsDay, periodsHour, sampling]);

  const updatePlot = useCallback(() => {
    fetchSeismicity().then(() => {
      const option = getEChartsOption();
      chartRef.current?.setOption(option, true, true);
    });
  }, [fetchSeismicity, getEChartsOption]);

  const startDateFormatted = useMemo(() => {
    return format(startDate, 'MMMM dd, yyyy');
  }, [startDate]);

  const endDateFormatted = useMemo(() => {
    return format(endDate, 'MMMM dd, yyyy');
  }, [endDate]);

  useEffect(() => {
    updatePlot();
  }, [updatePlot]);

  const chartStyle = useMemo(() => {
    return {
      height: 100 * seismicity.length,
    };
  }, [seismicity]);

  const handleDateRangeChange = useCallback(
    (index: number, start: Date, end: Date) => {
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
        const end = new Date();
        const start = sub(end, { [period.unit]: period.value });
        setTimeRange(start, end);
      } else {
        const period = periodsHour[0];
        const end = new Date();
        const start = sub(end, { [period.unit]: period.value });
        setTimeRange(start, end);
      }

      updatePlot();
    },
    [periodsDay, periodsHour, setSampling, setPeriodIndex, setTimeRange, updatePlot]
  );

  const handleRefresh = useCallback(() => {
    updatePlot();
  }, [updatePlot]);

  return (
    <div className="relative h-full">
      <div className="absolute bottom-0 top-0 overflow-auto">
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
            <div className="flex items-center gap-2">
              <DateRangePicker periods={periods} defaultIndex={periodIndex} startDate={startDate} endDate={endDate} onChange={handleDateRangeChange} />
              <Select appearance="underline" defaultValue={sampling} onChange={(_, data) => handleSamplingChange(data.value)}>
                <option value={'day'}>Daily</option>
                <option value={'hour'}>Hourly</option>
              </Select>
            </div>
          </div>

          <ReactECharts ref={chartRef} style={chartStyle} option={{}} notMerge={true} lazyUpdate={true} />

          <Table aria-label="Seismicity Table" className="mt-2">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Event type</TableHeaderCell>
                <TableHeaderCell>Min</TableHeaderCell>
                <TableHeaderCell>Max</TableHeaderCell>
                <TableHeaderCell>Average</TableHeaderCell>
                <TableHeaderCell>Total</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seismicity.map((item) => (
                <TableRow key={item.event_type.id}>
                  <TableCell>
                    <EventTypeLabel eventType={item.event_type} />
                  </TableCell>
                  <TableCell>{formatNumber(min(item.data.map((v) => v.count)), { precision: 0 })}</TableCell>
                  <TableCell>{formatNumber(max(item.data.map((v) => v.count)), { precision: 0 })}</TableCell>
                  <TableCell>{formatNumber(mean(item.data.map((v) => v.count)), { precision: 1 })}</TableCell>
                  <TableCell>{formatNumber(sum(item.data.map((v) => v.count)), { precision: 0 })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Seismicity;
