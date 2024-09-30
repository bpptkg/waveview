import React from 'react';
import { formatNumber } from '../../../../shared/formatting';
import { usePickerStore } from '../../../../stores/picker';

const PickEditAmplitude: React.FC = () => {
  const { amplitudes } = usePickerStore();
  return (
    <div className="p-2">
      {amplitudes.length ? (
        amplitudes.map((amplitude, index) => (
          <div key={index} className="grid grid-cols-2 hover:bg-gray-100 dark:hover:bg-gray-800">
            <div>{amplitude.stream_id}</div>
            <div>{formatNumber(amplitude.amplitude, { precision: 2, unit: ` ${amplitude.unit}` })}</div>
          </div>
        ))
      ) : (
        <div>No amplitude data</div>
      )}
    </div>
  );
};

export default PickEditAmplitude;
