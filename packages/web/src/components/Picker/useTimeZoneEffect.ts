import { useEffect } from 'react';
import { useAppStore } from '../../stores/app';
import { HelicorderChartRef } from './HelicorderChart';
import { SeismogramChartRef } from './SeismogramChart';

export function useHelicorderTimeZoneEffect(heliChartRef: React.MutableRefObject<HelicorderChartRef | null>) {
  const { useUTC } = useAppStore();

  useEffect(() => {
    heliChartRef.current?.setUseUTC(useUTC);
  }, [heliChartRef, useUTC]);
}

export function useSeismogramTimeZoneEffect(seisChartRef: React.MutableRefObject<SeismogramChartRef | null>) {
  const { useUTC } = useAppStore();

  useEffect(() => {
    seisChartRef.current?.setUseUTC(useUTC);
  }, [seisChartRef, useUTC]);
}
