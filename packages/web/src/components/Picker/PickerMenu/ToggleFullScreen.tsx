import { Button, Tooltip } from '@fluentui/react-components';
import { FullScreenMaximizeRegular, FullScreenMinimizeRegular } from '@fluentui/react-icons';
import React, { useState, useEffect } from 'react';

const ToggleFullScreen: React.FC = () => {
  const [isFullScreen, setIsFullScreen] = useState(document.fullscreenElement !== null);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement !== null);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  const buttonLabel = isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen';
  const buttonIcon = isFullScreen ? <FullScreenMinimizeRegular /> : <FullScreenMaximizeRegular />;

  return (
    <Tooltip content={buttonLabel} relationship="label" showDelay={1500}>
      <Button size="small" appearance="transparent" icon={buttonIcon} onClick={toggleFullScreen} />
    </Tooltip>
  );
};

export default ToggleFullScreen;
