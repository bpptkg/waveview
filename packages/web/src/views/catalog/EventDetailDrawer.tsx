import React from 'react';

export interface EventDetailDrawerProps {
  children?: React.ReactNode;
}

const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({ children }) => {
  return <div className="flex flex-col absolute top-0 right-0 bottom-0 w-[576px] h-full bg-white dark:bg-neutral-grey-4 overflow-y-auto">{children}</div>;
};

export default EventDetailDrawer;
