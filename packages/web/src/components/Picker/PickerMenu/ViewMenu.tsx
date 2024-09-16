import { Button, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, makeStyles } from '@fluentui/react-components';
import { useCallback } from 'react';
import { usePickerStore } from '../../../stores/picker';
import { useSidebarStore } from '../../../stores/sidebar';
import { usePickerContext } from '../PickerContext';

const useStyles = makeStyles({
  btn: {
    minWidth: 'auto',
  },
});

const ViewMenu = () => {
  const styles = useStyles();
  const { setSelectedChart } = usePickerStore();
  const { props } = usePickerContext();
  const { showHelicorder } = props;

  const handleHelicorder = useCallback(() => {
    setSelectedChart('helicorder');
  }, [setSelectedChart]);

  const handleSeismogram = useCallback(() => {
    setSelectedChart('seismogram');
  }, [setSelectedChart]);

  const { visible, selectedTab, setSelectedTab, setVisible } = useSidebarStore();
  const handleEventEditor = useCallback(() => {
    setSelectedTab('eventEditor');
    if (selectedTab === 'eventEditor') {
      setVisible(!visible);
    }
  }, [visible, selectedTab, setSelectedTab, setVisible]);

  const handleFilterToolbox = useCallback(() => {
    setSelectedTab('filterToolbox');
    if (selectedTab === 'filterToolbox') {
      setVisible(!visible);
    }
  }, [visible, selectedTab, setSelectedTab, setVisible]);

  return (
    <Menu>
      <MenuTrigger>
        <Button appearance="transparent" size="small" className={styles.btn}>
          View
        </Button>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {showHelicorder && (
            <>
              <MenuItem onClick={handleHelicorder}>Helicorder</MenuItem>
              <MenuItem onClick={handleSeismogram}>Seismogram</MenuItem>
            </>
          )}
          <MenuItem onClick={handleEventEditor}>Event Editor</MenuItem>
          <MenuItem onClick={handleFilterToolbox}>Filter Toolbox</MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

export default ViewMenu;
