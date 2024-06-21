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
  const chart = useRef<Helicorder | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);
  const initialResizeComplete = useRef<boolean>(false);
  const webWorker = useRef<HelicorderWebWorkerExtension | null>(null);
  const eventManager = useRef<HelicorderEventManagerExtension | null>(null);

  const worker = new Worker(new URL('../../workers/stream.worker.ts', import.meta.url), { type: 'module' });

  useImperativeHandle(ref, () => ({
    shiftViewUp: () => {
      chart.current?.shiftViewUp();
    },
    shiftViewDown: () => {
      chart.current?.shiftViewDown();
    },
    shiftViewToNow: () => {
      chart.current?.shiftViewToNow();
    },
    increaseAmplitude: (by: number) => {
      chart.current?.increaseAmplitude(by);
      chart.current?.render();
    },
    decreaseAmplitude: (by: number) => {
      chart.current?.decreaseAmplitude(by);
      chart.current?.render();
    },
    resetAmplitude: () => {
      chart.current?.resetAmplitude();
      chart.current?.render();
    },
    setInterval: (interval: number) => {
      chart.current?.setInterval(interval);
      chart.current?.refreshData();
      chart.current?.render();
      webWorker.current?.getInstance().fetchAllTracksData();
    },
    setDuration: (duration: number) => {
      chart.current?.setDuration(duration);
      chart.current?.refreshData();
      chart.current?.render();
      webWorker.current?.getInstance().fetchAllTracksData();
    },
  }));

  useEffect(() => {
    async function init() {
      if (heliRef.current) {
        chart.current = new Helicorder(heliRef.current, {
          channelId,
          interval,
          duration,
          devicePixelRatio: window.devicePixelRatio,
          ...initOptions,
        });
        chart.current.setChannel({ id: 'VG.MEPAS.00.HHZ' });
        chart.current.setTheme('light');
        await chart.current.init();
        chart.current.refreshData();
        chart.current.render();

        webWorker.current = new HelicorderWebWorkerExtension(worker);
        eventManager.current = new HelicorderEventManagerExtension();
        chart.current.use(webWorker.current);
        chart.current.use(eventManager.current);
      }
    }

    const onResizeDebounced = debounce((entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chart.current?.resize(width, height);
        chart.current?.render();
      }
    }, 200);

    const onResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chart.current?.resize(width, height);
        chart.current?.render();
      }
    };

    const handleResize = (entries: ResizeObserverEntry[]) => {
      if (!initialResizeComplete.current) {
        initialResizeComplete.current = true;
        onResize(entries);
      } else {
        onResizeDebounced(entries);
      }
    };

    init()
      .then(() => {
        resizeObserver.current = new ResizeObserver(handleResize);
        if (heliRef.current) {
          resizeObserver.current.observe(heliRef.current.parentElement!);
        }
      })
      .finally(() => {
        webWorker.current?.getInstance().fetchAllTracksData();
      });

    return () => {
      chart.current?.dispose();
      resizeObserver.current?.disconnect();
      webWorker.current?.dispose();
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
