import { Button, makeStyles, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger } from '@fluentui/react-components';
import { NavigationFilled } from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';
import { useNavigationUrls } from '../../hooks/useNavigationUrls';
import { useAppStore } from '../../stores/app';
import CatalogIcon from '../Icons/CatalogIcon';
import HelpIcon from '../Icons/HelpIcon';
import PickerIcon from '../Icons/PickerIcon';
import StatusIcon from '../Icons/StatusIcon';

const useStyles = makeStyles({
  menuPopover: {
    borderRadius: '16px',
  },
});

const NavigationMenu = () => {
  const styles = useStyles();
  const { pickerUrl, catalogUrl, statusUrl, helpUrl } = useNavigationUrls();
  const { isActivityBarVisible } = useAppStore();

  const navigate = useNavigate();
  const handleClick = (url: string) => {
    navigate(url);
  };

  if (isActivityBarVisible) {
    return null;
  }

  return (
    <Menu positioning={{ autoSize: true }}>
      <MenuTrigger disableButtonEnhancement>
        <Button appearance="transparent" icon={<NavigationFilled />}>
          Menu
        </Button>
      </MenuTrigger>

      <MenuPopover className={styles.menuPopover}>
        <MenuList>
          <MenuItem icon={<PickerIcon />} onClick={() => handleClick(pickerUrl)}>
            Picker{' '}
          </MenuItem>
          <MenuItem icon={<CatalogIcon />} onClick={() => handleClick(catalogUrl)}>
            Catalog
          </MenuItem>
          <MenuItem icon={<StatusIcon />} onClick={() => handleClick(statusUrl)}>
            Status
          </MenuItem>
          <MenuItem icon={<HelpIcon />} onClick={() => handleClick(helpUrl)}>
            Help
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

export default NavigationMenu;
