import { Button, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, makeStyles } from '@fluentui/react-components';
import { useCallback } from 'react';
import { useSidebarStore } from '../../../stores/sidebar';

const useStyles = makeStyles({
  btn: {
    minWidth: 'auto',
  },
  menuPopover: {
    borderRadius: '16px',
  },
});

const ViewMenu = () => {
  const styles = useStyles();

  const { selectedTab, showSidebar, setSelectedTab, setShowSidebar } = useSidebarStore();
  const handleSelectEventEditor = useCallback(() => {
    setSelectedTab('eventEditor');
    if (selectedTab === 'eventEditor') {
      setShowSidebar(!showSidebar);
    }
  }, [showSidebar, selectedTab, setSelectedTab, setShowSidebar]);

  const handleSelectFilterToolbox = useCallback(() => {
    setSelectedTab('filterToolbox');
    if (selectedTab === 'filterToolbox') {
      setShowSidebar(!showSidebar);
    }
  }, [showSidebar, selectedTab, setSelectedTab, setShowSidebar]);

  const handleSelectInstrumentResponseToolbox = useCallback(() => {
    setSelectedTab('instrumentResponse');
    if (selectedTab === 'instrumentResponse') {
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
      <MenuPopover className={styles.menuPopover}>
        <MenuList>
          <MenuItem onClick={handleSelectEventEditor}>Event Editor</MenuItem>
          <MenuItem onClick={handleSelectFilterToolbox}>Filter Toolbox</MenuItem>
          <MenuItem onClick={handleSelectInstrumentResponseToolbox}>Instrument Response</MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

export default ViewMenu;
