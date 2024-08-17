import { CircleFilled } from '@fluentui/react-icons';
import React, { useMemo } from 'react';
import { useAppStore } from '../../stores/app';
import { EventType } from '../../types/event';

export interface EventTypeLabelProps {
  eventType?: EventType;
  showIcon?: boolean;
}

const EventTypeLabel: React.FC<EventTypeLabelProps> = (props) => {
  const { eventType, showIcon = true } = props;
  const { darkMode } = useAppStore();

  const color = useMemo(() => {
    if (!eventType) {
      return '';
    }
    return darkMode ? eventType.color_dark : eventType.color_light;
  }, [darkMode, eventType]);

  return eventType ? (
    <div className="flex items-center gap-1">
      {showIcon && <CircleFilled fontSize={16} color={color} />}
      <span>{eventType.code}</span>
    </div>
  ) : null;
};

export default EventTypeLabel;
