import { Button, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger } from '@fluentui/react-components';

const HelpMenu = () => {
  return (
    <div>
      <Menu>
        <MenuTrigger>
          <Button appearance="transparent" size="small">
            Help
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

export default HelpMenu;
