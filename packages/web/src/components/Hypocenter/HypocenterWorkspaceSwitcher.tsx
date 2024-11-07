import { makeStyles, MenuButton, MenuItem, MenuList, Popover, PopoverSurface, PopoverTrigger } from '@fluentui/react-components';
import React, { useCallback, useState } from 'react';
import { HypocenterWorkspace } from '../../types/hypocenter';

export interface HypocenterWorkspaceSwitcherProps {
  workspace?: string;
  onChange?: (workspace: HypocenterWorkspace) => void;
}

const workspaceOptions: {
  label: string;
  value: HypocenterWorkspace;
}[] = [
  { label: '3D View', value: '3d' },
  { label: 'Table View', value: 'table' },
];

const useStyles = makeStyles({
  popoverSurface: {
    padding: '8px',
    borderRadius: '16px',
  },
});

const HypocenterWorkspaceSwitcher: React.FC<HypocenterWorkspaceSwitcherProps> = ({ workspace, onChange }) => {
  const styles = useStyles();
  const [open, setOpen] = useState<boolean>(false);

  const handleChange = useCallback(
    (value: HypocenterWorkspace) => {
      setOpen(false);
      if (value === workspace) return;
      onChange?.(value);
    },
    [workspace, onChange]
  );

  return (
    <Popover trapFocus open={open} onOpenChange={() => setOpen(!open)} positioning="below">
      <PopoverTrigger>
        <MenuButton appearance="primary">{workspaceOptions.find((item) => item.value === workspace)?.label}</MenuButton>
      </PopoverTrigger>
      <PopoverSurface className={styles.popoverSurface}>
        <MenuList>
          {workspaceOptions.map((item) => (
            <MenuItem key={item.value} onClick={() => handleChange(item.value)}>
              {item.label}
            </MenuItem>
          ))}
        </MenuList>
      </PopoverSurface>
    </Popover>
  );
};

export default HypocenterWorkspaceSwitcher;
