import { Helicorder } from '@waveview/charts';
import React, { useEffect, useRef } from 'react';
import { debounce } from '../../shared/debounce';

export interface HelicorderChartProps {
  className?: string;
}

const HelicorderChart: React.FC<HelicorderChartProps> = () => {
  const heliRef = useRef<HTMLCanvasElement>(null);
  const chart = useRef<Helicorder | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);
  const initialResizeComplete = useRef<boolean>(false);

  useEffect(() => {
    async function init() {
      if (heliRef.current) {
        chart.current = new Helicorder(heliRef.current);
        chart.current.setChannel({ id: 'VG.MEPAS.00.HHZ' });
        chart.current.setTheme('light');
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
      if (heliRef.current) {
        resizeObserver.current.observe(heliRef.current.parentElement!);
      }
    });

    return () => {
      chart.current?.dispose();
      resizeObserver.current?.disconnect();
    };
  }, []);

  return (
    <div className="absolute top-0 right-0 bottom-0 left-0">
      <canvas ref={heliRef} />
    </div>
  );
};

export default HelicorderChart;
