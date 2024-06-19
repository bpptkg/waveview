import { Button, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger } from '@fluentui/react-components';

const SignalMenu = () => {
  return (
    <div>
      <Menu>
        <MenuTrigger>
          <Button appearance="transparent" size="small">
            Signal
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

export default SignalMenu;
