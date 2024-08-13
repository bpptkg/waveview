import { Spinner } from '@fluentui/react-components';
import React from 'react';

interface EventDetailLoadingIndicatorProps {
  message?: string;
}

const EventDetailLoadingIndicator: React.FC<EventDetailLoadingIndicatorProps> = (props) => {
  const { message = 'Loading...' } = props;
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Spinner label={message} />
    </div>
  );
};

export default EventDetailLoadingIndicator;
