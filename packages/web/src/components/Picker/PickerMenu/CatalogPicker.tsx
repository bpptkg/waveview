import { Menu, MenuButton, MenuItem, MenuList, MenuPopover, MenuTrigger } from '@fluentui/react-components';
import { Folder20Regular } from '@fluentui/react-icons';

const CatalogPicker = () => {
  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <MenuButton icon={<Folder20Regular />} size="small" appearance="transparent">
          Catalog
        </MenuButton>
      </MenuTrigger>

      <MenuPopover>
        <MenuList>
          <MenuItem>Catalog A</MenuItem>
          <MenuItem>Catalog B</MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

export default CatalogPicker;
