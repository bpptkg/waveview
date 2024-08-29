import { Button, makeStyles, MenuButton, MenuItem, MenuList, Popover, PopoverProps, PopoverSurface, PopoverTrigger } from '@fluentui/react-components';
import { Checkmark20Regular, Dismiss16Regular } from '@fluentui/react-icons';
import { useState } from 'react';
import { useVolcanoStore } from '../../stores/volcano/useVolcanoStore';

const useVolcanoPickerStyles = makeStyles({
  popoverSurface: {
    padding: '8px',
  },
});

const VolcanoPicker = () => {
  const { currentVolcano, allVolcanoes, setCurrentVolcano } = useVolcanoStore();
  const styles = useVolcanoPickerStyles();
  const [open, setOpen] = useState(false);
  const handleOpenChange: PopoverProps['onOpenChange'] = (_, data) => setOpen(data.open || false);

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
          <MenuList>
            {allVolcanoes.map((volcano) => (
              <MenuItem
                key={volcano.id}
                onClick={() => {
                  setCurrentVolcano(volcano);
                  setOpen(false);
                }}
                icon={volcano.id === currentVolcano?.id ? <Checkmark20Regular /> : undefined}
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
