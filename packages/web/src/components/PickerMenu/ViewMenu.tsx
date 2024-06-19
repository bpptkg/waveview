import { Button, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger } from '@fluentui/react-components';

const ViewMenu = () => {
  return (
    <div>
      <Menu>
        <MenuTrigger>
          <Button appearance="transparent" size="small">
            View
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

export default ViewMenu;
