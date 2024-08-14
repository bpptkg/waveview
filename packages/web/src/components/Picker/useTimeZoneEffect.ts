import { useEffect, useRef } from 'react';
import { useAppStore } from '../../stores/app';
import { HelicorderChartRef } from './HelicorderChart';
import { SeismogramChartRef } from './SeismogramChart';

export function useTimeZoneEffect(
  heliChartRef: React.MutableRefObject<HelicorderChartRef | null>,
  seisChartRef: React.MutableRefObject<SeismogramChartRef | null>
) {
  const { useUTC } = useAppStore();

  const initialRenderCompleteRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (!initialRenderCompleteRef.current) {
      initialRenderCompleteRef.current = true;
      return;
    }

    heliChartRef.current?.setUseUTC(useUTC);
    seisChartRef.current?.setUseUTC(useUTC);
  }, [heliChartRef, seisChartRef, useUTC]);
}
