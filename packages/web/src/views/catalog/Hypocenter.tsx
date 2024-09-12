import {
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Toast,
  Toaster,
  ToastTitle,
  Toolbar,
  ToolbarButton,
  Tooltip,
  useId,
  useToastController,
} from '@fluentui/react-components';
import { ReactECharts } from '@waveview/react-echarts';
import * as echarts from 'echarts/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHypocenterStore } from '../../stores/hypocenter';
import { CustomError } from '../../types/response';

import { ArrowCounterclockwiseRegular, ArrowDownloadRegular } from '@fluentui/react-icons';
import { VisualMapCustomPiecewiseComponent } from '@waveview/custompiecewise';
import { Scatter3DChart, SurfaceChart } from 'echarts-gl/charts';
import { Grid3DComponent } from 'echarts-gl/components';
import { TooltipComponent, VisualMapComponent, VisualMapPiecewiseComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import DateRangePicker from '../../components/DatePicker/DateRangePicker';
import EventTypeFilter from '../../components/Hypocenter/EventTypeFilter';
import HypocenterWorkspaceSwitcher from '../../components/Hypocenter/HypocenterWorkspaceSwitcher';
import MethodFilter from '../../components/Hypocenter/MethodFilter';
import { useMount } from '../../hooks/useMount';
import { formatNumber, formatTime, shortUUID } from '../../shared/formatting';
import { useAppStore } from '../../stores/app';
import { useDemXyzStore } from '../../stores/demxyz';
import { useEventTypeStore } from '../../stores/eventType';
import { HypocenterWorkspace } from '../../types/hypocenter';

echarts.use([
  TooltipComponent,
  VisualMapComponent,
  VisualMapPiecewiseComponent,
  VisualMapCustomPiecewiseComponent,
  CanvasRenderer,
  Grid3DComponent,
  Scatter3DChart,
  SurfaceChart,
]);

interface UpdateOptions {
  refreshHypo?: boolean;
  refreshDem?: boolean | 'auto';
}

const useHypocenterStyles = makeStyles({
  table: {
    tableLayout: 'auto',
  },
});

const Hypocenter = () => {
  const chartRef = useRef<ReactECharts | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const styles = useHypocenterStyles();

  const {
    workspace,
    startDate,
    endDate,
    periods,
    periodIndex,
    currentMethod,
    methods,
    eventTypesFilter,
    hypocenter,
    setCurrentMethod,
    setPeriodIndex,
    setTimeRange,
    setEventTypesFilter,
    fetchHypocenter,
    getEChartsOption,
    setWorkspace,
  } = useHypocenterStore();
  const { demxyz, fetchDemXyz } = useDemXyzStore();
  const { useUTC, darkMode } = useAppStore();
  const { eventTypes } = useEventTypeStore();

  const toasterId = useId('hypocenter');
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

  const updatePlot = useCallback(
    async (options: UpdateOptions = {}) => {
      const { refreshHypo = true, refreshDem = 'auto' } = options;
      try {
        chartRef.current?.clear();
        chartRef.current?.showLoading();
        if (refreshHypo) {
          await fetchHypocenter();
        }
        if (refreshDem === true) {
          await fetchDemXyz();
        } else if (refreshDem === 'auto') {
          if (!demxyz) {
            await fetchDemXyz();
          }
        }

        const option = getEChartsOption();
        chartRef.current?.setOption(option, true);
      } catch (error) {
        showErrorToast(error as CustomError);
      } finally {
        chartRef.current?.hideLoading();
      }
    },
    [demxyz, fetchHypocenter, fetchDemXyz, getEChartsOption, showErrorToast]
  );

  useEffect(() => {
    if (!isMounted) return;
    updatePlot({ refreshHypo: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useUTC, darkMode]);

  useMount(() => {
    updatePlot({ refreshHypo: true, refreshDem: 'auto' });
    setIsMounted(true);
  });

  const handleDateRangeChange = useCallback(
    (index: number, start: number, end: number) => {
      setTimeRange(start, end);
      setPeriodIndex(index);
      updatePlot();
    },
    [setTimeRange, setPeriodIndex, updatePlot]
  );

  const handleMethodChange = useCallback(
    (method: string) => {
      setCurrentMethod(method);
      updatePlot();
    },
    [setCurrentMethod, updatePlot]
  );

  const handleMethodReset = useCallback(() => {
    setCurrentMethod('');
    updatePlot();
  }, [setCurrentMethod, updatePlot]);

  const handleEventTypesFilterChange = useCallback(
    (types: string[]) => {
      setEventTypesFilter(types);
      updatePlot();
    },
    [setEventTypesFilter, updatePlot]
  );

  const handleRefresh = useCallback(() => {
    updatePlot();
  }, [updatePlot]);

  const handleDownload = useCallback(async () => {
    const dataURL = chartRef.current?.toDataURL({ type: 'png', pixelRatio: 3 });
    if (dataURL) {
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = 'hypocenter.png';
      a.click();
      a.remove();
    }
  }, []);

  const handleWorkspaceChange = useCallback(
    (workspace: HypocenterWorkspace) => {
      setWorkspace(workspace);
    },
    [setWorkspace]
  );

  return (
    <div className="relative h-full w-full flex flex-col">
      <div className="bg-white dark:bg-black mx-2 mt-1 border dark:border-none rounded flex justify-between items-center relative z-10">
        <Toolbar aria-label="Hypocenter Toolbar">
          <div className="flex gap-1 mr-1">
            <HypocenterWorkspaceSwitcher workspace={workspace} onChange={handleWorkspaceChange} />
            <DateRangePicker periods={periods} defaultIndex={periodIndex} startDate={startDate} endDate={endDate} onChange={handleDateRangeChange} />
          </div>

          <MethodFilter methods={methods} selected={currentMethod} onChange={handleMethodChange} onReset={handleMethodReset} />

          <EventTypeFilter eventTypes={eventTypes} selected={eventTypesFilter} onChange={handleEventTypesFilterChange} />

          <Tooltip content={'Refresh'} relationship="label" showDelay={1500}>
            <ToolbarButton icon={<ArrowCounterclockwiseRegular fontSize={20} />} onClick={handleRefresh} />
          </Tooltip>

          <Tooltip content={'Save as Image'} relationship="label" showDelay={1500}>
            <ToolbarButton icon={<ArrowDownloadRegular fontSize={20} onClick={handleDownload} />} />
          </Tooltip>
        </Toolbar>
      </div>
      {workspace === '3d' && (
        <div className="flex-grow mt-2">
          <ReactECharts
            ref={chartRef}
            echarts={echarts}
            style={{
              width: '100%',
              height: '100%',
            }}
            option={getEChartsOption()}
            notMerge={true}
          />
        </div>
      )}
      {workspace === 'table' && (
        <div className="flex-grow relative mt-2">
          <div className="absolute top-0 right-0 bottom-0 left-0 overflow-auto">
            <Table aria-label="Hypocenter Table" className={styles.table}>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Event ID</TableHeaderCell>
                  <TableHeaderCell>Time</TableHeaderCell>
                  <TableHeaderCell>Event type</TableHeaderCell>
                  <TableHeaderCell>Duration</TableHeaderCell>
                  <TableHeaderCell>Origin ID</TableHeaderCell>
                  <TableHeaderCell>Latitude</TableHeaderCell>
                  <TableHeaderCell>Longitude</TableHeaderCell>
                  <TableHeaderCell>Depth</TableHeaderCell>
                  <TableHeaderCell>Magnitude</TableHeaderCell>
                  <TableHeaderCell>Method</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hypocenter?.hypocenters.length ? (
                  hypocenter.hypocenters.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{shortUUID(item.id)}</TableCell>
                      <TableCell>{formatTime(item.time, { useUTC })}</TableCell>
                      <TableCell>{item.event_type}</TableCell>
                      <TableCell>{formatNumber(item.duration, { unit: ' sec', precision: 2 })}</TableCell>
                      <TableCell>{shortUUID(item.origin_id)}</TableCell>
                      <TableCell>{formatNumber(item.latitude, { unit: '°', precision: 5 })}</TableCell>
                      <TableCell>{formatNumber(item.longitude, { unit: '°', precision: 5 })}</TableCell>
                      <TableCell>{formatNumber(item.depth, { unit: ' km', precision: 2 })}</TableCell>
                      <TableCell>{formatNumber(item.magnitude_value, { precision: 2 })}</TableCell>
                      <TableCell>{item.origin_method}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableHeaderCell colSpan={9}>
                      <span className="text-center w-full">No data found</span>
                    </TableHeaderCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      <Toaster toasterId={toasterId} />
    </div>
  );
};

export default Hypocenter;
