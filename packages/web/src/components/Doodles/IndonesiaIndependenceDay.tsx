import { Tooltip } from '@fluentui/react-components';
import React from 'react';
import FlagOfIndonesiaGif from '../../assets/flag-of-indonesia.gif';

const IndonesiaIndependenceDay: React.FC = () => {
  const today = new Date();
  if (today.getMonth() === 7 && today.getDate() === 17) {
    return (
      <div className="flex items-center justify-center p-2 cursor-pointer">
        <Tooltip content="Happy Independence Day, Indonesia!" relationship="label" showDelay={1500}>
          <img src={FlagOfIndonesiaGif} alt="Flag of Indonesia" className="h-[24px] w-auto object-contain rounded border" />
        </Tooltip>
      </div>
    );
  }
  return null;
};

export default IndonesiaIndependenceDay;
