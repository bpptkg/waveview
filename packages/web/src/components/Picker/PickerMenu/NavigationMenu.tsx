import { Button, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, makeStyles } from '@fluentui/react-components';

const useStyles = makeStyles({
  btn: {
    minWidth: 'auto',
  },
});

const NavigationMenu = () => {
  const styles = useStyles();
  return (
    <Menu>
      <MenuTrigger>
        <Button appearance="transparent" size="small" className={styles.btn}>
          Navigation
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

export default NavigationMenu;
