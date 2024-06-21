import { Button, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, makeStyles } from '@fluentui/react-components';

const useStyles = makeStyles({
  btn: {
    minWidth: 'auto',
  },
});

const FileMenu = () => {
  const styles = useStyles();
  return (
    <Menu>
      <MenuTrigger>
        <Button appearance="transparent" size="small" className={styles.btn}>
          File
        </Button>
      </MenuTrigger>

      <MenuPopover>
        <MenuList>
          <MenuItem>Action</MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

export default FileMenu;
