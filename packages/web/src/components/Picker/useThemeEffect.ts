import { useEffect, useRef } from 'react';
import { useAppStore } from '../../stores/app';
import { HelicorderChartRef } from './HelicorderChart';
import { SeismogramChartRef } from './SeismogramChart';

export function useThemeEffect(
  heliChartRef: React.MutableRefObject<HelicorderChartRef | null>,
  seisChartRef: React.MutableRefObject<SeismogramChartRef | null>
) {
  const { darkMode } = useAppStore();

  const initialRenderCompleteRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (!initialRenderCompleteRef.current) {
      initialRenderCompleteRef.current = true;
      return;
    }

    if (darkMode) {
      heliChartRef.current?.setTheme('dark');
      seisChartRef.current?.setTheme('dark');
    } else {
      heliChartRef.current?.setTheme('light');
      seisChartRef.current?.setTheme('light');
    }
  }, [heliChartRef, seisChartRef, darkMode]);
}
