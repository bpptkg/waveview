import { Seismogram, SeismogramChartOptions } from '@waveview/charts';
import React, { useEffect, useImperativeHandle, useRef } from 'react';
import { debounce } from '../../shared/debounce';

export interface SeismogramChartProps {
  channels?: string[];
  initOptions?: Partial<SeismogramChartOptions>;
}

export interface SeismogramChartRef {
  scrollLeft: (by: number) => void;
  scrollRight: (by: number) => void;
}

const SeismogramChart: React.ForwardRefExoticComponent<SeismogramChartProps & React.RefAttributes<SeismogramChartRef>> = React.forwardRef((props, ref) => {
  const { initOptions } = props;

  const seisRef = useRef<HTMLCanvasElement>(null);
  const chart = useRef<Seismogram | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);
  const initialResizeComplete = useRef<boolean>(false);

  useImperativeHandle(ref, () => ({
    scrollLeft: (by: number) => {
      chart.current?.scrollLeft(by);
      chart.current?.render();
    },
    scrollRight(by) {
      chart.current?.scrollRight(by);
      chart.current?.render();
    },
  }));

  useEffect(() => {
    async function init() {
      if (seisRef.current) {
        chart.current = new Seismogram(seisRef.current, {
          devicePixelRatio: window.devicePixelRatio,
          ...initOptions,
        });
        await chart.current.init();
        chart.current.refreshData();
        chart.current.render();
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

    init().then(() => {
      resizeObserver.current = new ResizeObserver(handleResize);
      if (seisRef.current) {
        resizeObserver.current.observe(seisRef.current.parentElement!);
      }
    });

    return () => {
      chart.current?.dispose();
      resizeObserver.current?.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute top-0 right-0 bottom-0 left-0">
      <canvas ref={seisRef} />
    </div>
  );
});

export default SeismogramChart;
