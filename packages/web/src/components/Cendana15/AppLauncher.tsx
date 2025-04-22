import { Tooltip } from '@fluentui/react-components';
import { AppFolderRegular, ArrowUpRightRegular } from '@fluentui/react-icons';
import React from 'react';

const AppLauncher: React.FC = () => {
  return (
    <Tooltip
      content={
        <div className="flex items-center gap-2">
          <span>Cendana15 Apps</span>
          <ArrowUpRightRegular />
        </div>
      }
      relationship="label"
      showDelay={1500}
    >
      <a href="https://cendana15.com" target="_blank" rel="noreferrer" className="flex items-center justify-center">
        <AppFolderRegular fontSize={20} />
      </a>
    </Tooltip>
  );
};

export default AppLauncher;
