import { Seismogram } from '@waveview/charts';
import { useEffect, useRef } from 'react';
import { debounce } from '../../shared/debounce';

const SeismogramChart = () => {
  const seisRef = useRef<HTMLCanvasElement>(null);
  const chart = useRef<Seismogram | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);
  const initialResizeComplete = useRef<boolean>(false);

  useEffect(() => {
    async function init() {
      if (seisRef.current) {
        chart.current = new Seismogram(seisRef.current, {
          channels: [
            { id: 'VG.MEPAS.00.HHZ', label: 'MEPAS' },
            { id: 'VG.MELAB.00.HHZ', label: 'MELAB' },
            { id: 'VG.MEKAL.00.HHZ', label: 'MEKAL' },
          ],
        });
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
      if (seisRef.current) {
        resizeObserver.current.observe(seisRef.current.parentElement!);
      }
    });

    return () => {
      chart.current?.dispose();
      resizeObserver.current?.disconnect();
    };
  }, []);

  return (
    <div className="absolute top-0 right-0 bottom-0 left-0">
      <canvas ref={seisRef} />
    </div>
  );
};

export default SeismogramChart;
