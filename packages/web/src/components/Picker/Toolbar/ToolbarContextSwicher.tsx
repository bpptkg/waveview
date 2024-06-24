import { Menu, MenuButton, MenuItem, MenuList, MenuPopover, MenuTrigger } from '@fluentui/react-components';
import { Checkmark20Regular } from '@fluentui/react-icons';
import { useCallback } from 'react';
import { PickerWorkspace, usePickerStore } from '../../../stores/picker';

const workspaceOptions = [
  { value: 'helicorder', label: 'Helicorder' },
  { value: 'seismogram', label: 'Seismogram' },
] as { value: PickerWorkspace; label: string; secondaryContent: string }[];

const ToolbarContextSwicher = () => {
  const { workspace, setWorkspace } = usePickerStore();

  const handleWorkspaceChange = useCallback(
    (workspace: PickerWorkspace) => {
      setWorkspace(workspace);
    },
    [setWorkspace]
  );

  return (
    <Menu hasIcons>
      <MenuTrigger disableButtonEnhancement>
        <MenuButton appearance="primary" size="medium">
          {workspaceOptions.find((option) => option.value === workspace)?.label}
        </MenuButton>
      </MenuTrigger>

      <MenuPopover>
        <MenuList>
          {workspaceOptions.map((option) => (
            <MenuItem
              key={option.value}
              icon={option.value === workspace ? <Checkmark20Regular /> : undefined}
              onClick={() => {
                handleWorkspaceChange(option.value);
              }}
            >
              {option.label}
            </MenuItem>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

export default ToolbarContextSwicher;
