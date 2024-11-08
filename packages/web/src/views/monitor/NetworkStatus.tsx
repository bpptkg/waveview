import { Button, Spinner, Tooltip } from '@fluentui/react-components';
import { ArrowClockwiseRegular, CircleFilled } from '@fluentui/react-icons';
import { formatDistanceToNow } from 'date-fns';
import React, { useCallback, useEffect } from 'react';
import { useSeismicNetworkStatusStore } from '../../stores/networkStatus';
import { ChannelInfo, SeismicNetworkStatus } from '../../types/networkStatus';

const NetworkState: React.FC<{ status: SeismicNetworkStatus }> = ({ status }) => {
  const tooltipContent = useCallback((channel: ChannelInfo) => {
    const lastReceivedPacket = channel.last_packet;
    const formattedTime = lastReceivedPacket ? formatDistanceToNow(new Date(lastReceivedPacket), { addSuffix: true }) : 'unknown';
    return <span>Last received data: {formattedTime}</span>;
  }, []);

  return (
    <div className="bg-white dark:bg-black mb-4 rounded-2xl w-1/2 p-3">
      <h1 className="text-xl font-bold mb-4" style={{ color: status.color }}>
        {status.state_label}
      </h1>
      <p className="mb-4">{status.state_description}</p>
      <div className="grid grid-cols-3 gap-2">
        {status.channels.map((channel) => (
          <Tooltip key={channel.stream_id} content={tooltipContent(channel)} relationship="label">
            <div key={channel.stream_id} className="flex items-center gap-1">
              <CircleFilled color={status.color} fontSize={20} />
              <span>{channel.stream_id}</span>
            </div>
          </Tooltip>
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-500">Number of channels: {status.channels.length}</p>
    </div>
  );
};

const NetworkStateList: React.FC<{ networkStatus: SeismicNetworkStatus[] }> = ({ networkStatus }) => {
  return (
    <div className="flex gap-2 px-2">
      {networkStatus.map((status) => (
        <NetworkState key={status.state_type} status={status} />
      ))}
    </div>
  );
};

const NetworkStatus: React.FC = () => {
  const { loading, networkStatus, fetchNetworkStatus } = useSeismicNetworkStatusStore();

  useEffect(() => {
    fetchNetworkStatus();
  }, [fetchNetworkStatus]);

  const handleRefresh = useCallback(() => {
    fetchNetworkStatus();
  }, [fetchNetworkStatus]);

  const buttonIcon = loading ? null : <ArrowClockwiseRegular />;
  const buttonContent = loading ? <Spinner size="tiny" label="Loading..." /> : 'Refresh';

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-0 right-0 bottom-0 left-0 overflow-auto">
        <div className="flex items-center justify-end">
          <Button appearance="transparent" icon={buttonIcon} onClick={handleRefresh} disabled={loading}>
            {buttonContent}
          </Button>
        </div>
        <NetworkStateList networkStatus={networkStatus} />
      </div>
    </div>
  );
};

export default NetworkStatus;
