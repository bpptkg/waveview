import { useEffect } from 'react';
import { useAppStore } from '../../stores/app';
import { HelicorderChartRef } from './HelicorderChart';
import { SeismogramChartRef } from './SeismogramChart';

export function useHelicorderThemeEffect(heliChartRef: React.MutableRefObject<HelicorderChartRef | null>) {
  const { darkMode } = useAppStore();

  useEffect(() => {
    if (darkMode) {
      heliChartRef.current?.setTheme('dark');
    } else {
      heliChartRef.current?.setTheme('light');
    }
  }, [heliChartRef, darkMode]);
}

export function useSeismogramThemeEffect(seisChartRef: React.MutableRefObject<SeismogramChartRef | null>) {
  const { darkMode } = useAppStore();

  useEffect(() => {
    if (darkMode) {
      seisChartRef.current?.setTheme('dark');
    } else {
      seisChartRef.current?.setTheme('light');
    }
  }, [seisChartRef, darkMode]);
}
