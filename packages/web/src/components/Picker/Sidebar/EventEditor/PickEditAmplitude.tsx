import { Spinner } from '@fluentui/react-components';
import React from 'react';
import { formatNumber } from '../../../../shared/formatting';
import { usePickerStore } from '../../../../stores/picker';

const PickEditAmplitude: React.FC = () => {
  const { amplitudes, isCalculatingAmplitudes } = usePickerStore();
  if (isCalculatingAmplitudes) {
    return (
      <div className="p-2">
        <Spinner label="Calculating amplitudes..." size="tiny" />
      </div>
    );
  }
  return (
    <div className="p-2">
      {amplitudes.length ? (
        amplitudes.map((amplitude, index) => (
          <div key={index} className="grid grid-cols-2 hover:bg-gray-100 dark:hover:bg-gray-800">
            <div className="text-sm">{amplitude.stream_id}</div>
            <div className="text-sm">{formatNumber(amplitude.amplitude, { precision: 2, unit: ` ${amplitude.unit}` })}</div>
          </div>
        ))
      ) : (
        <div>No amplitude data</div>
      )}
    </div>
  );
};

export default PickEditAmplitude;
