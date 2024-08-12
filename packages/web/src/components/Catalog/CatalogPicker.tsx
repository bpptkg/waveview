import { Menu, MenuButton, MenuItem, MenuList, MenuPopover, MenuTrigger } from '@fluentui/react-components';
import { Checkmark20Regular, Folder20Regular } from '@fluentui/react-icons';
import { useCatalogStore } from '../../stores/catalog';

const CatalogPicker = () => {
  const { currentCatalog, allCatalogs, setCurrentCatalog } = useCatalogStore();

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <MenuButton icon={<Folder20Regular />} size="small" appearance="transparent">
          <span className="text-nowrap">{currentCatalog?.name ?? 'Select Catalog'}</span>
        </MenuButton>
      </MenuTrigger>

      <MenuPopover>
        <MenuList>
          {allCatalogs.map((catalog) => (
            <MenuItem key={catalog.id} onClick={() => setCurrentCatalog(catalog)} icon={catalog.id === currentCatalog?.id ? <Checkmark20Regular /> : undefined}>
              {catalog.name}
            </MenuItem>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

export default CatalogPicker;
