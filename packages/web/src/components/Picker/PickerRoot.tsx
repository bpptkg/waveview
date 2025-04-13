import React, { useEffect, useRef } from 'react';
import { usePickerContext } from './PickerContext';
import { usePickerCallback } from './usePickerCallback';
import { useCatalogStore } from '../../stores/catalog';

export interface PickerRootProps {
  children?: React.ReactNode;
}

const PickerRoot: React.FC<PickerRootProps> = ({ children }) => {
  const { seisChartReadyRef, heliChartReadyRef } = usePickerContext();
  const { handleUpdateEventMarkers, handleSeismogramOnDestroy, handleFetchEvents } = usePickerCallback();
  const previousCatalogIdRef = useRef<string>('');
  const { currentCatalog } = useCatalogStore();

  // Plot event markers.
  useEffect(() => {
    if (heliChartReadyRef.current && seisChartReadyRef.current) {
      handleUpdateEventMarkers();

      if (currentCatalog && !previousCatalogIdRef.current) {
        previousCatalogIdRef.current = currentCatalog.id;
      }
    }
  }, [heliChartReadyRef, seisChartReadyRef, currentCatalog, handleUpdateEventMarkers]);

  // Cleanup when unmount.
  useEffect(() => {
    return () => {
      handleSeismogramOnDestroy();
      previousCatalogIdRef.current = '';
    };
  }, [handleSeismogramOnDestroy]);

  // Update event markers when catalog changes.
  useEffect(() => {
    if (currentCatalog && previousCatalogIdRef.current) {
      if (previousCatalogIdRef.current !== currentCatalog.id) {
        handleFetchEvents()
      }
      previousCatalogIdRef.current = currentCatalog.id;
    }
  }, [currentCatalog, heliChartReadyRef, seisChartReadyRef, handleFetchEvents]);

  return <div className="flex flex-col flex-grow relative overflow-hidden">{children}</div>;
};

export default PickerRoot;
