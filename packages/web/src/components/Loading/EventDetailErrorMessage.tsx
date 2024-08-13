import { Button } from '@fluentui/react-components';
import { ArrowClockwise20Regular } from '@fluentui/react-icons';
import React from 'react';

interface EventDetailErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const EventDetailErrorMessage: React.FC<EventDetailErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <p className="text-red-600">{message}</p>
      <Button appearance="transparent" onClick={onRetry} icon={<ArrowClockwise20Regular />}>
        Retry
      </Button>
    </div>
  );
};

export default EventDetailErrorMessage;
