import { MenuButton, MenuItem, MenuList, Popover, PopoverSurface, PopoverTrigger } from '@fluentui/react-components';
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
  { label: '3D', value: '3d' },
  { label: 'Table', value: 'table' },
];

const HypocenterWorkspaceSwitcher: React.FC<HypocenterWorkspaceSwitcherProps> = ({ workspace, onChange }) => {
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
    <Popover trapFocus open={open} onOpenChange={() => setOpen(!open)}>
      <PopoverTrigger>
        <MenuButton appearance="primary">{workspaceOptions.find((item) => item.value === workspace)?.label}</MenuButton>
      </PopoverTrigger>
      <PopoverSurface>
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
