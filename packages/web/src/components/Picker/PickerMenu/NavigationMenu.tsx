import { Button, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger } from '@fluentui/react-components';

const NavigationMenu = () => {
  return (
    <div>
      <Menu>
        <MenuTrigger>
          <Button appearance="transparent" size="small">
            Navigation
          </Button>
        </MenuTrigger>

        <MenuPopover>
          <MenuList>
            <MenuItem>Action</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </div>
  );
};

export default NavigationMenu;
