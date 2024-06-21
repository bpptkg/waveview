import { Helicorder, HelicorderChartOptions, HelicorderEventManagerExtension, HelicorderWebWorkerExtension } from '@waveview/charts';
import React, { useEffect, useImperativeHandle, useRef } from 'react';
import { debounce } from '../../shared/debounce';

export interface HelicorderChartProps {
  channelId: string;
  interval: number;
  duration: number;
  initOptions?: Partial<HelicorderChartOptions>;
}

export interface HelicorderChartRef {
  shiftViewUp: () => void;
  shiftViewDown: () => void;
  shiftViewToNow: () => void;
  increaseAmplitude: (by: number) => void;
  decreaseAmplitude: (by: number) => void;
  resetAmplitude: () => void;
  setInterval: (interval: number) => void;
  setDuration: (duration: number) => void;
}

const HelicorderChart: React.ForwardRefExoticComponent<HelicorderChartProps & React.RefAttributes<HelicorderChartRef>> = React.forwardRef((props, ref) => {
  const { channelId, interval, duration, initOptions } = props;

  const heliRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Helicorder | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const initialResizeCompleteRef = useRef<boolean>(false);
  const webWorkerRef = useRef<HelicorderWebWorkerExtension | null>(null);
  const eventManagerRef = useRef<HelicorderEventManagerExtension | null>(null);
  const workerRef = useRef<Worker>(new Worker(new URL('../../workers/stream.worker.ts', import.meta.url), { type: 'module' }));

  useImperativeHandle(ref, () => ({
    shiftViewUp: () => {
      chartRef.current?.shiftViewUp();
    },
    shiftViewDown: () => {
      chartRef.current?.shiftViewDown();
    },
    shiftViewToNow: () => {
      chartRef.current?.shiftViewToNow();
    },
    increaseAmplitude: (by: number) => {
      chartRef.current?.increaseAmplitude(by);
      chartRef.current?.render();
    },
    decreaseAmplitude: (by: number) => {
      chartRef.current?.decreaseAmplitude(by);
      chartRef.current?.render();
    },
    resetAmplitude: () => {
      chartRef.current?.resetAmplitude();
      chartRef.current?.render();
    },
    setInterval: (interval: number) => {
      chartRef.current?.setInterval(interval);
      chartRef.current?.refreshData();
      chartRef.current?.render();
      webWorkerRef.current?.getInstance().fetchAllTracksData();
    },
    setDuration: (duration: number) => {
      chartRef.current?.setDuration(duration);
      chartRef.current?.refreshData();
      chartRef.current?.render();
      webWorkerRef.current?.getInstance().fetchAllTracksData();
    },
  }));

  useEffect(() => {
    async function init() {
      if (heliRef.current) {
        chartRef.current = new Helicorder(heliRef.current, {
          channelId,
          interval,
          duration,
          devicePixelRatio: window.devicePixelRatio,
          ...initOptions,
        });
        chartRef.current.setChannel({ id: 'VG.MEPAS.00.HHZ' });
        chartRef.current.setTheme('light');
        await chartRef.current.init();
        chartRef.current.refreshData();
        chartRef.current.render();

        webWorkerRef.current = new HelicorderWebWorkerExtension(workerRef.current);
        eventManagerRef.current = new HelicorderEventManagerExtension();
        chartRef.current.use(webWorkerRef.current);
        chartRef.current.use(eventManagerRef.current);
      }
    }

    const onResizeDebounced = debounce((entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chartRef.current?.resize(width, height);
        chartRef.current?.render();
      }
    }, 200);

    const onResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chartRef.current?.resize(width, height);
        chartRef.current?.render();
      }
    };

    const handleResize = (entries: ResizeObserverEntry[]) => {
      if (!initialResizeCompleteRef.current) {
        initialResizeCompleteRef.current = true;
        onResize(entries);
      } else {
        onResizeDebounced(entries);
      }
    };

    init()
      .then(() => {
        resizeObserverRef.current = new ResizeObserver(handleResize);
        if (heliRef.current) {
          resizeObserverRef.current.observe(heliRef.current.parentElement!);
        }
      })
      .finally(() => {
        webWorkerRef.current?.getInstance().fetchAllTracksData();
      });

    return () => {
      chartRef.current?.dispose();
      resizeObserverRef.current?.disconnect();
      webWorkerRef.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute top-0 right-0 bottom-0 left-0">
      <canvas ref={heliRef} />
    </div>
  );
});

export default HelicorderChart;
