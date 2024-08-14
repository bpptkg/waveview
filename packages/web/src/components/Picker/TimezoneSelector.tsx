import { Menu, MenuButton, MenuItem, MenuList, MenuPopover, MenuTrigger, makeStyles } from '@fluentui/react-components';
import { Checkmark20Regular } from '@fluentui/react-icons';
import { useAppStore } from '../../stores/app';

const useStyles = makeStyles({
  btn: {
    minWidth: 'auto',
    height: '20px',
  },
});

const UTC = 'UTC';

const TimeZoneSelector = () => {
  const { timeZone, useUTC, setUseUTC } = useAppStore();

  const options = [
    { label: timeZone, value: false },
    { label: UTC, value: true },
  ];

  const styles = useStyles();

  return (
    <Menu hasIcons>
      <MenuTrigger disableButtonEnhancement>
        <MenuButton appearance="transparent" size="small" className={styles.btn}>
          {useUTC ? UTC : timeZone}
        </MenuButton>
      </MenuTrigger>

      <MenuPopover>
        <MenuList>
          {options.map((option, index) => (
            <MenuItem
              aria-label={option.label}
              key={index}
              onClick={() => setUseUTC(option.value)}
              icon={option.value === useUTC ? <Checkmark20Regular /> : undefined}
            >
              {option.label}
            </MenuItem>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

export default TimeZoneSelector;
