import { Spinner } from '@fluentui/react-components';
import React, { useEffect, useRef } from 'react';
import { useCatalogStore } from '../../stores/catalog';
import { useStatusBarStore } from '../../stores/statusbar/useStatusBarStore';
import { usePickerContext } from './PickerContext';
import { usePickerCallback } from './usePickerCallback';

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

  const { setMessage, clearMessage } = useStatusBarStore();

  // Update event markers when catalog changes.
  useEffect(() => {
    if (currentCatalog && previousCatalogIdRef.current) {
      if (previousCatalogIdRef.current !== currentCatalog.id) {
        handleFetchEvents({
          before: () => {
            setMessage(
              <Spinner size="extra-tiny" label={<span className="text-xs dark:text-neutral-grey-84">{`Changing catalog to ${currentCatalog.name}...`}</span>} />
            );
          },
          after: () => {
            clearMessage();
          },
        });
      }
      previousCatalogIdRef.current = currentCatalog.id;
    }
  }, [currentCatalog, heliChartReadyRef, seisChartReadyRef, handleFetchEvents, setMessage, clearMessage]);

  return <div className="flex flex-col flex-grow relative overflow-hidden">{children}</div>;
};

export default PickerRoot;
