import React from 'react';
import { useInventoryStore } from '../../../stores/inventory';
import { usePickerStore } from '../../../stores/picker';

const HelicorderChannel: React.FC = () => {
  const { channelId } = usePickerStore();
  const { channels } = useInventoryStore();
  return <span className="text-xs dark:text-neutral-grey-84">{channels().find((channel) => channel.id === channelId)?.stream_id}</span>;
};

export default HelicorderChannel;
