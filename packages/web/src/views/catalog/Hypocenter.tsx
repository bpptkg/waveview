import { Select, Toast, ToastTitle, Toolbar, ToolbarButton, useId, useToastController } from '@fluentui/react-components';
import { ReactECharts } from '@waveview/react-echarts';
import * as echarts from 'echarts/core';
import { useCallback, useEffect, useRef } from 'react';
import { useHypocenterStore } from '../../stores/hypocenter';
import { CustomError } from '../../types/response';

import { ArrowCounterclockwiseRegular, ArrowDownloadRegular } from '@fluentui/react-icons';
import { Scatter3DChart, SurfaceChart } from 'echarts-gl/charts';
import { Grid3DComponent } from 'echarts-gl/components';
import { TooltipComponent, VisualMapComponent, VisualMapPiecewiseComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import DateRangePicker from '../../components/DatePicker/DateRangePicker';
import { useMount } from '../../hooks';
import { useAppStore } from '../../stores/app';
import { useDemXyzStore } from '../../stores/demxyz';

echarts.use([TooltipComponent, VisualMapComponent, VisualMapPiecewiseComponent, Grid3DComponent, Scatter3DChart, SurfaceChart, CanvasRenderer]);

interface UpdateOptions {
  refreshHypo?: boolean;
  refreshDem?: boolean | 'auto';
}

const Hypocenter = () => {
  const chartRef = useRef<ReactECharts | null>(null);

  const { startDate, endDate, periods, periodIndex, setPeriodIndex, setTimeRange, fetchHypocenter, getEChartsOption } = useHypocenterStore();
  const { demxyz, fetchDemXyz } = useDemXyzStore();
  const { useUTC, darkMode } = useAppStore();

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
    updatePlot({ refreshHypo: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useUTC, darkMode]);

  useMount(async () => {
    updatePlot({ refreshHypo: true, refreshDem: 'auto' });
  });

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

  return (
    <div className="relative h-full w-full flex flex-col">
      <div className="bg-white dark:bg-black mx-2 drop-shadow rounded flex justify-between items-center">
        <Toolbar aria-label="Hypocenter Toolbar">
          <div className="flex gap-1 mr-1">
            <DateRangePicker periods={periods} defaultIndex={periodIndex} startDate={startDate} endDate={endDate} onChange={handleDateRangeChange} />
            <Select appearance="outline">
              <option value={'automatic'}>Automatic</option>
              <option value={'manual'}>Manual</option>
            </Select>
          </div>
          <ToolbarButton icon={<ArrowCounterclockwiseRegular fontSize={20} />} onClick={handleRefresh} />
          <ToolbarButton icon={<ArrowDownloadRegular fontSize={20} onClick={handleDownload} />} />
        </Toolbar>
      </div>
      <div className="flex-grow mt-2">
        <ReactECharts
          ref={chartRef}
          echarts={echarts}
          style={{
            width: '100%',
            height: '100%',
          }}
          option={{}}
          notMerge={true}
        />
      </div>
    </div>
  );
};

export default Hypocenter;
