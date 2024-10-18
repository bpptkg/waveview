import { Tooltip } from '@fluentui/react-components';
import React, { useMemo } from 'react';
import { useInventoryStore } from '../../../stores/inventory';
import { usePickerStore } from '../../../stores/picker';

const HelicorderChannel: React.FC = () => {
  const { channelId } = usePickerStore();
  const { channels } = useInventoryStore();
  const streamId = useMemo(() => channels().find((channel) => channel.id === channelId)?.stream_id, [channels, channelId]);
  return (
    <Tooltip content={`Current helicorder channel: ${streamId}`} relationship="description" showDelay={1500}>
      <span className="text-xs dark:text-neutral-grey-84">{channels().find((channel) => channel.id === channelId)?.stream_id}</span>
    </Tooltip>
  );
};

export default HelicorderChannel;
