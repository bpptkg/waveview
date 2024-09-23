import { Button, Tooltip } from '@fluentui/react-components';
import { Dismiss20Regular } from '@fluentui/react-icons';
import React from 'react';
import { usePickerCallback } from '../../usePickerCallback';

const PickGuide: React.FC = () => {
  const { handleSeismogramPickModeChange } = usePickerCallback();
  const handleClose = () => {
    handleSeismogramPickModeChange(false);
  };

  return (
    <div className="p-2 h-full w-full flex flex-col">
      <div className="flex px-1 items-center justify-between">
        <h1 className="font-bold text-sm">Picking</h1>
        <Tooltip content={'Deactivate pick mode'} relationship="label" showDelay={1500}>
          <Button size="small" appearance="transparent" onClick={handleClose} icon={<Dismiss20Regular />} />
        </Tooltip>
      </div>

      <div className="flex-grow flex flex-col justify-center p-2">
        <h1 className="font-bold text-center text-base">Pick a new event</h1>
        <p className="text-center">Click and drag on the seismogram chart to pick a new event.</p>
      </div>
    </div>
  );
};

export default PickGuide;
