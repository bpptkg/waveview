import React from 'react';

export interface EventDrawerProps {
  children?: React.ReactNode;
}

const EventDrawer: React.FC<EventDrawerProps> = ({ children }) => {
  return <div className="flex flex-col absolute right-0 top-0 bg-white dark:bg-neutral-grey-4 w-full h-full overflow-auto">{children}</div>;
};

export default EventDrawer;
