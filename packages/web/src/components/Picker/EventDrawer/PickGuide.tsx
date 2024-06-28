import { Button } from '@fluentui/react-components';
import { Dismiss20Regular } from '@fluentui/react-icons';
import React from 'react';

export interface PickGuideProps {
  onClose?: () => void;
}

const PickGuide: React.FC<PickGuideProps> = (props) => {
  const { onClose } = props;

  return (
    <div className="p-2">
      <div className="flex p-2 items-center justify-between h-[60px]">
        <h1 className="font-bold">Pick New Event</h1>
        <div className="flex gap-1 items-center">
          <Button size="small" appearance="transparent" onClick={() => onClose?.()} icon={<Dismiss20Regular />} />
        </div>
      </div>

      <div className="h-full w-full flex flex-col justify-center p-2">
        <img src="/images/pick-guide.svg" alt="Pick Guide" className="w-1/2 mx-auto" />
        <h1 className="font-bold text-center text-base">Pick a new event</h1>
        <p className="text-center">Click or click and drag on the seismogram chart to pick a new event.</p>
      </div>
    </div>
  );
};

export default PickGuide;
