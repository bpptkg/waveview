import React, { useEffect, useRef } from 'react';
import { usePickerContext } from './PickerContext';
import { usePickerCallback } from './usePickerCallback';

export interface PickerRootProps {
  children?: React.ReactNode;
}

const PickerRoot: React.FC<PickerRootProps> = ({ children }) => {
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const { heliChartRef, seisChartRef, seisChartReadyRef, heliChartReadyRef } = usePickerContext();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (workspaceRef.current && !workspaceRef.current.contains(event.target as Node)) {
        heliChartRef.current?.blur();
        seisChartRef.current?.blur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [heliChartRef, seisChartRef]);

  const { handleUpdateEventMarkers, handleSeismogramOnDestroy } = usePickerCallback();

  // Plot event markers.
  useEffect(() => {
    if (heliChartReadyRef.current && seisChartReadyRef.current) {
      handleUpdateEventMarkers();
    }
  }, [heliChartReadyRef, seisChartReadyRef, handleUpdateEventMarkers]);

  // Cleanup when unmount.
  useEffect(() => {
    return () => {
      handleSeismogramOnDestroy();
    };
  }, [handleSeismogramOnDestroy]);

  return (
    <div className="flex flex-col flex-grow relative overflow-hidden" ref={workspaceRef}>
      {children}
    </div>
  );
};

export default PickerRoot;
