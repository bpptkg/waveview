import { Button, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, makeStyles } from '@fluentui/react-components';
import { useCallback } from 'react';
import { usePickerStore } from '../../../stores/picker';
import { usePickerContext } from '../PickerContext';

const useStyles = makeStyles({
  btn: {
    minWidth: 'auto',
  },
});

const FileMenu = () => {
  const styles = useStyles();

  const { selectedChart } = usePickerStore();
  const { seisChartRef, heliChartRef } = usePickerContext();
  const handleExportToImage = useCallback(() => {
    let image: string | undefined = '';
    let downloadName = '';
    if (selectedChart === 'seismogram') {
      image = seisChartRef.current?.toDataURL('image/png', 1.0);
      downloadName = 'seismogram.png';
    } else if (selectedChart === 'helicorder') {
      image = heliChartRef.current?.toDataURL('image/png', 1.0);
      downloadName = 'helicorder.png';
    }

    if (!image) {
      return;
    }
    const link = document.createElement('a');
    link.href = image;
    link.download = downloadName;
    link.click();
    link.remove();
  }, [seisChartRef, heliChartRef, selectedChart]);

  return (
    <Menu>
      <MenuTrigger>
        <Button appearance="transparent" size="small" className={styles.btn}>
          File
        </Button>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItem onClick={handleExportToImage}>Export to Image</MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

export default FileMenu;
