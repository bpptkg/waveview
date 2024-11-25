import { Button, makeStyles, Popover, PopoverSurface, PopoverTrigger, Tooltip } from '@fluentui/react-components';
import { AppFolderRegular } from '@fluentui/react-icons';
import React from 'react';
import AssignmentIcon from '../../assets/cendana15-apps/assignment.svg';
import BroadcastIcon from '../../assets/cendana15-apps/broadcast.jpg';
import ChartStudioIcon from '../../assets/cendana15-apps/chart-studio.svg';
import DataEntryIcon from '../../assets/cendana15-apps/data-entry.svg';
import DataVisualizationIcon from '../../assets/cendana15-apps/data-visualization.svg';
import FileManagerIcon from '../../assets/cendana15-apps/file-manager.svg';
import GalleryIcon from '../../assets/cendana15-apps/gallery.jpg';
import GeneralServiceIcon from '../../assets/cendana15-apps/general-service.png';
import LimsIcon from '../../assets/cendana15-apps/lims.png';
import MonitoringNetworkIcon from '../../assets/cendana15-apps/monitoring-network.svg';
import AppLauncherItem from './AppLauncherItem';

const useStyles = makeStyles({
  popoverSurface: {
    width: 'auto',
    padding: '8px',
    borderRadius: '16px',
  },
});

const AppLauncher: React.FC = () => {
  const styles = useStyles();
  return (
    <Popover positioning="below">
      <PopoverTrigger>
        <Tooltip content={'Cendana15 Apps'} relationship="label" showDelay={1500}>
          <Button icon={<AppFolderRegular fontSize={20} />} appearance="transparent" size="small" />
        </Tooltip>
      </PopoverTrigger>
      <PopoverSurface tabIndex={-1} className={styles.popoverSurface}>
        <div className="flex flex-col gap-2">
          <div className="bg-neutral-grey-96 dark:bg-neutral-grey-12 p-1 rounded-2xl">
            <ul className="grid grid-cols-3 gap-1">
              <AppLauncherItem href="https://cendana15.com/file-manager" src={FileManagerIcon} title="File Manager" />
              <AppLauncherItem href="https://cendana15.com/data-entry" src={DataEntryIcon} title="Data Entry" />
              <AppLauncherItem href="https://cendana15.com/assignment" src={AssignmentIcon} title="Assignment" />
              <AppLauncherItem href="https://cendana15.com/display-device" src={DataVisualizationIcon} title="Data Visualization" />
              <AppLauncherItem href="https://cendana15.com/chart-studio" src={ChartStudioIcon} title="Chart Studio" />
              <AppLauncherItem href="https://cendana15.com/maintenance" src={MonitoringNetworkIcon} title="Monitoring Network" />
              <AppLauncherItem href="https://cendana15.com/lims" src={LimsIcon} title="LIMS" />
              <AppLauncherItem href="https://cendana15.com/broadcasting" src={BroadcastIcon} title="Broadcast" />
              <AppLauncherItem href="https://cendana15.com/gallery" src={GalleryIcon} title="Gallery" />
              <AppLauncherItem href="https://cendana15.com/layananumum" src={GeneralServiceIcon} title="General Service" />
            </ul>
          </div>
          <a
            href="https://cendana15.com"
            className="flex items-center justify-center p-3 bg-neutral-grey-96 dark:bg-neutral-grey-12 rounded-2xl cursor-pointer"
          >
            More from Cendana15
          </a>
        </div>
      </PopoverSurface>
    </Popover>
  );
};

export default AppLauncher;
