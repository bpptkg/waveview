import { Button, makeStyles, MenuButton, MenuItem, MenuList, Popover, PopoverProps, PopoverSurface, PopoverTrigger } from '@fluentui/react-components';
import { Checkmark20Regular, Dismiss16Regular, Folder20Regular } from '@fluentui/react-icons';
import { useState } from 'react';
import { useCatalogStore } from '../../stores/catalog';

const useCatalogPickerStyles = makeStyles({
  popoverSurface: {
    padding: '8px',
  },
});

const CatalogPicker = () => {
  const { currentCatalog, allCatalogs, setCurrentCatalog } = useCatalogStore();
  const styles = useCatalogPickerStyles();
  const [open, setOpen] = useState(false);
  const handleOpenChange: PopoverProps['onOpenChange'] = (_, data) => setOpen(data.open || false);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger disableButtonEnhancement>
        <MenuButton size="small" appearance="transparent" icon={<Folder20Regular />}>
          <span className="font-normal text-nowrap text-black dark:text-white">{currentCatalog?.name}</span>
        </MenuButton>
      </PopoverTrigger>

      <PopoverSurface tabIndex={-1} className={styles.popoverSurface}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold">Select catalog</span>
            <Button appearance="transparent" icon={<Dismiss16Regular />} onClick={() => setOpen(false)} />
          </div>
          <MenuList hasIcons>
            {allCatalogs.map((catalog) => (
              <MenuItem
                key={catalog.id}
                onClick={() => {
                  setCurrentCatalog(catalog);
                  setOpen(false);
                }}
                icon={catalog.id === currentCatalog?.id ? <Checkmark20Regular /> : undefined}
              >
                <span className="font-normal">
                  {catalog.name} {catalog.is_default ? '(Default)' : ''}
                </span>
              </MenuItem>
            ))}
          </MenuList>
        </div>
      </PopoverSurface>
    </Popover>
  );
};

export default CatalogPicker;
