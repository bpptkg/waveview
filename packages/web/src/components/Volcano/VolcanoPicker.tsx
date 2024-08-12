import { Menu, MenuButton, MenuItem, MenuList, MenuPopover, MenuTrigger } from '@fluentui/react-components';
import { Checkmark20Regular } from '@fluentui/react-icons';
import { useVolcanoStore } from '../../stores/volcano/useVolcanoStore';

const VolcanoPicker = () => {
  const { currentVolcano, allVolcanoes, setCurrentVolcano } = useVolcanoStore();

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <MenuButton size="medium" appearance="transparent">
          <span className="text-nowrap">{currentVolcano?.name ?? 'Select Volcano'}</span>
        </MenuButton>
      </MenuTrigger>

      <MenuPopover>
        <MenuList>
          {allVolcanoes.map((volcano) => (
            <MenuItem key={volcano.id} onClick={() => setCurrentVolcano(volcano)} icon={volcano.id === volcano?.id ? <Checkmark20Regular /> : undefined}>
              {volcano.name}
            </MenuItem>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

export default VolcanoPicker;
