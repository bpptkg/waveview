import { Button, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger } from '@fluentui/react-components';

const FileMenu = () => {
  return (
    <div>
      <Menu>
        <MenuTrigger>
          <Button appearance="transparent" size="small">
            File
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

export default FileMenu;
