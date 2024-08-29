import classNames from 'classnames';
import React, { useEffect, useState } from 'react';

export interface EventDetailDrawerProps {
  children?: React.ReactNode;
  isVisible: boolean;
}

const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({ children, isVisible }) => {
  const [isRendered, setIsRendered] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setIsRendered(true);
    }
  }, [isVisible]);

  const handleAnimationEnd = () => {
    if (!isVisible) {
      setIsRendered(false);
    }
  };

  return (
    isRendered && (
      <div
        className={classNames(
          'flex flex-col fixed top-0 right-0 bottom-0 w-[576px] h-full z-50 bg-white dark:bg-neutral-grey-4 overflow-y-auto overflow-x-hidden transition-transform duration-300',
          {
            'transform translate-x-0': isVisible,
            'transform translate-x-full': !isVisible,
          }
        )}
        onTransitionEnd={handleAnimationEnd}
      >
        {children}
      </div>
    )
  );
};

export default EventDetailDrawer;
