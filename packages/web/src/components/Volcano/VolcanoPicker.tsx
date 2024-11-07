import { Button, makeStyles, MenuButton, MenuItem, MenuList, Popover, PopoverProps, PopoverSurface, PopoverTrigger } from '@fluentui/react-components';
import { CheckmarkRegular, Dismiss16Regular } from '@fluentui/react-icons';
import { useCallback, useState } from 'react';
import { useOrganizationStore } from '../../stores/organization';
import { useVolcanoStore } from '../../stores/volcano/useVolcanoStore';

const useVolcanoPickerStyles = makeStyles({
  popoverSurface: {
    padding: '8px',
    borderRadius: '16px',
  },
});

const VolcanoPicker = () => {
  const { currentVolcano, allVolcanoes } = useVolcanoStore();
  const styles = useVolcanoPickerStyles();
  const [open, setOpen] = useState(false);
  const handleOpenChange: PopoverProps['onOpenChange'] = (_, data) => setOpen(data.open || false);

  const { currentOrganization } = useOrganizationStore();
  const handleVolcanoChange = useCallback(
    (slug: string) => {
      const volcano = allVolcanoes.find((v) => v.slug === slug);
      if (volcano && volcano.slug !== currentVolcano?.slug) {
        const url = `/${currentOrganization?.slug}/${volcano.slug}`;
        window.location.href = url;
      }
      setOpen(false);
    },
    [currentOrganization, currentVolcano, allVolcanoes]
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger disableButtonEnhancement>
        <MenuButton size="medium" appearance="transparent">
          <span className="font-normal text-black dark:text-white">{currentVolcano?.name}</span>
        </MenuButton>
      </PopoverTrigger>

      <PopoverSurface tabIndex={-1} className={styles.popoverSurface}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold">Switch volcano context</span>
            <Button appearance="transparent" icon={<Dismiss16Regular />} onClick={() => setOpen(false)} />
          </div>
          <MenuList hasIcons>
            {allVolcanoes.map((volcano) => (
              <MenuItem
                key={volcano.id}
                onClick={() => handleVolcanoChange(volcano.slug)}
                icon={volcano.id === currentVolcano?.id ? <CheckmarkRegular /> : <CheckmarkRegular color="transparent" />}
              >
                <span className="font-normal">{volcano.name}</span>
              </MenuItem>
            ))}
          </MenuList>
        </div>
      </PopoverSurface>
    </Popover>
  );
};

export default VolcanoPicker;
