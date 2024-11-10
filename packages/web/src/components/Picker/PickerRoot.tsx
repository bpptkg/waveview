import React, { useEffect } from 'react';
import { usePickerContext } from './PickerContext';
import { usePickerCallback } from './usePickerCallback';

export interface PickerRootProps {
  children?: React.ReactNode;
}

const PickerRoot: React.FC<PickerRootProps> = ({ children }) => {
  const { seisChartReadyRef, heliChartReadyRef } = usePickerContext();
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

  return <div className="flex flex-col flex-grow relative overflow-hidden">{children}</div>;
};

export default PickerRoot;
