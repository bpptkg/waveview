import { Menu, MenuButton, MenuItem, MenuList, MenuPopover, MenuTrigger } from '@fluentui/react-components';

const ToolbarContextSwicher = () => {
  return (
    <Menu>
      <MenuTrigger>
        <MenuButton appearance="primary" size="medium">
          Helicorder
        </MenuButton>
      </MenuTrigger>

      <MenuPopover>
        <MenuList>
          <MenuItem>Helicorder</MenuItem>
          <MenuItem>Seismogram</MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

export default ToolbarContextSwicher;
