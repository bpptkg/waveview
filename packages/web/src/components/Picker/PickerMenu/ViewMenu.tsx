import { Button, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, makeStyles } from '@fluentui/react-components';
import { useCallback } from 'react';
import { useSidebarStore } from '../../../stores/sidebar';

const useStyles = makeStyles({
  btn: {
    minWidth: 'auto',
  },
});

const ViewMenu = () => {
  const styles = useStyles();

  const { selectedTab, showSidebar, setSelectedTab, setShowSidebar } = useSidebarStore();
  const handleEventEditor = useCallback(() => {
    setSelectedTab('eventEditor');
    if (selectedTab === 'eventEditor') {
      setShowSidebar(!showSidebar);
    }
  }, [showSidebar, selectedTab, setSelectedTab, setShowSidebar]);

  const handleFilterToolbox = useCallback(() => {
    setSelectedTab('filterToolbox');
    if (selectedTab === 'filterToolbox') {
      setShowSidebar(!showSidebar);
    }
  }, [showSidebar, selectedTab, setSelectedTab, setShowSidebar]);

  return (
    <Menu>
      <MenuTrigger>
        <Button appearance="transparent" size="small" className={styles.btn}>
          View
        </Button>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItem onClick={handleEventEditor}>Event Editor</MenuItem>
          <MenuItem onClick={handleFilterToolbox}>Filter Toolbox</MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

export default ViewMenu;
