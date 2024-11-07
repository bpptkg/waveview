import { Button, Menu, MenuDivider, MenuItem, MenuList, MenuPopover, MenuTrigger, makeStyles } from '@fluentui/react-components';
import { usePickerStore } from '../../../stores/picker';
import { usePickerCallback } from '../usePickerCallback';

const useStyles = makeStyles({
  btn: {
    minWidth: 'auto',
  },
  menuPopover: {
    borderRadius: '16px',
  },
});

const HelicorderSignalMenuList = () => {
  const {
    handleHelicorderShiftViewUp,
    handleHelicorderShiftViewDown,
    handleHelicorderShiftViewToNow,
    handleHelicorderIncreaseAmplitude,
    handleHelicorderDecreaseAmplitude,
    handleHelicorderResetAmplitude,
  } = usePickerCallback();
  return (
    <MenuList>
      <MenuItem onClick={handleHelicorderShiftViewUp}>Shift View Up</MenuItem>
      <MenuItem onClick={handleHelicorderShiftViewDown}>Shift View Down</MenuItem>
      <MenuItem onClick={handleHelicorderShiftViewToNow}>Shift View to Now</MenuItem>
      <MenuDivider />
      <MenuItem onClick={handleHelicorderIncreaseAmplitude}>Increase Amplitude</MenuItem>
      <MenuItem onClick={handleHelicorderDecreaseAmplitude}>Decrease Amplitude</MenuItem>
      <MenuItem onClick={handleHelicorderResetAmplitude}>Reset Amplitude</MenuItem>
    </MenuList>
  );
};

const SeismogramSignalMenuList = () => {
  const {
    handleSeismogramScrollLeft,
    handleSeismogramScrollRight,
    handleSeismogramIncreaseAmplitude,
    handleSeismogramDecreaseAmplitude,
    handleSeismogramZoomIn,
    handleSeismogramZoomOut,
    handleSeismogramResetAmplitude,
  } = usePickerCallback();
  return (
    <MenuList>
      <MenuItem onClick={handleSeismogramScrollLeft}>Scroll Left</MenuItem>
      <MenuItem onClick={handleSeismogramScrollRight}>Scroll Right</MenuItem>
      <MenuDivider />
      <MenuItem onClick={handleSeismogramIncreaseAmplitude}>Increase Amplitude</MenuItem>
      <MenuItem onClick={handleSeismogramDecreaseAmplitude}>Decrease Amplitude</MenuItem>
      <MenuItem onClick={handleSeismogramResetAmplitude}>Reset Amplitude</MenuItem>
      <MenuDivider />
      <MenuItem onClick={handleSeismogramZoomIn}>Zoom In</MenuItem>
      <MenuItem onClick={handleSeismogramZoomOut}>Zoom Out</MenuItem>
    </MenuList>
  );
};

const SignalMenu = () => {
  const styles = useStyles();
  const { selectedChart } = usePickerStore();

  return (
    <Menu>
      <MenuTrigger>
        <Button appearance="transparent" size="small" className={styles.btn}>
          Signal
        </Button>
      </MenuTrigger>
      <MenuPopover className={styles.menuPopover}>
        {selectedChart === 'helicorder' && <HelicorderSignalMenuList />}
        {selectedChart === 'seismogram' && <SeismogramSignalMenuList />}
      </MenuPopover>
    </Menu>
  );
};

export default SignalMenu;
