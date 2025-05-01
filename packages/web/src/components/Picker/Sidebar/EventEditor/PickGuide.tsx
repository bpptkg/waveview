import { Button, Tooltip } from '@fluentui/react-components';
import { CursorClickRegular, DismissRegular } from '@fluentui/react-icons';
import React from 'react';
import { usePickerCallback } from '../../usePickerCallback';

const PickGuide: React.FC = () => {
  const { handleSeismogramPickModeChange } = usePickerCallback();
  const handleClose = () => {
    handleSeismogramPickModeChange(false);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between h-[40px] border-b dark:border-b-gray-800 px-2">
        <h1 className="font-bold text-sm">Picking</h1>
        <Tooltip content={'Deactivate pick mode'} relationship="label" showDelay={1500}>
          <Button size="small" appearance="transparent" onClick={handleClose} icon={<DismissRegular fontSize={20} />} />
        </Tooltip>
      </div>

      <div className="flex-grow flex flex-col justify-center items-center p-2">
        <CursorClickRegular fontSize={40} className="text-neutral-grey-60 dark:text-neutral-grey-84" />
        <h1 className="font-bold text-center text-base">Pick a new event</h1>
        <p className="text-center">Click and drag on the seismogram chart to pick a new event.</p>
      </div>
    </div>
  );
};

export default PickGuide;
