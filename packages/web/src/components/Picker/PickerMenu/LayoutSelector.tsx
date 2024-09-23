import { Button, Tooltip } from '@fluentui/react-components';
import { LayoutColumnTwoFocusLeftFilled, LayoutColumnTwoFocusRightFilled } from '@fluentui/react-icons';
import React, { useCallback } from 'react';
import { useSidebarStore } from '../../../stores/sidebar';

const LayoutSelector: React.FC = () => {
  const { showSidebar, showHelicorder, setShowSidebar, setShowHelicorder } = useSidebarStore();

  const handleToggleHelicorder = useCallback(() => {
    setShowHelicorder(!showHelicorder);
  }, [showHelicorder, setShowHelicorder]);

  const handleToggleSidebar = useCallback(() => {
    setShowSidebar(!showSidebar);
  }, [showSidebar, setShowSidebar]);

  return (
    <div className="flex items-center">
      <Tooltip content="Toggle Helicorder" relationship="label" showDelay={1500}>
        <Button size="small" appearance="transparent" icon={<LayoutColumnTwoFocusLeftFilled />} onClick={handleToggleHelicorder} />
      </Tooltip>
      <Tooltip content="Toggle Side Bar" relationship="label" showDelay={1500}>
        <Button size="small" appearance="transparent" icon={<LayoutColumnTwoFocusRightFilled />} onClick={handleToggleSidebar} />
      </Tooltip>
    </div>
  );
};

export default LayoutSelector;
