import { useRef } from 'react';
import SeismogramToolbar from './Toolbar/SeismogramToolbar';
import SeismogramChart, { SeismogramChartRef } from './SeismogramChart';
import SeismogramBottomToolbar from './Toolbar/SeismogramBottomToolbar';

const SeismogramWorkspace = () => {
  const seisChart = useRef<SeismogramChartRef | null>(null);

  return (
    <>
      <SeismogramToolbar />
      <div className="flex-grow relative mt-1 flex h-full">
        <SeismogramChart
          ref={seisChart}
          initOptions={{
            channels: [
              { id: 'VG.MEPAS.00.HHZ', label: 'VG.MEPAS' },
              { id: 'VG.MEPAS.00.HHE', label: 'VG.MEPAS' },
            ],
            grid: {
              top: 30,
              right: 10,
              bottom: 5,
              left: 80,
            },
          }}
        />
      </div>
      <div className=" bg-white dark:bg-black">
        <SeismogramBottomToolbar />
      </div>
    </>
  );
};

export default SeismogramWorkspace;
