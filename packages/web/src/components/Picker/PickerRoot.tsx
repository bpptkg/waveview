import React, { useEffect, useRef } from 'react';
import { usePickerContext } from './PickerContext';

export interface PickerRootProps {
  children?: React.ReactNode;
}

const PickerRoot: React.FC<PickerRootProps> = ({ children }) => {
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const { heliChartRef, seisChartRef } = usePickerContext();

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

  return (
    <div className="flex flex-col flex-grow relative overflow-hidden" ref={workspaceRef}>
      {children}
    </div>
  );
};

export default PickerRoot;
