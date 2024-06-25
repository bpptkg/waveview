import {
  Field,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  SearchBox,
  Switch,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  AutoFitHeight20Regular,
  Calendar20Regular,
  ChevronDoubleDown20Regular,
  ChevronDown12Regular,
  ChevronDown20Regular,
  ChevronDownUp20Regular,
  ChevronUp20Regular,
  ChevronUpDown20Regular,
  MoreHorizontal24Filled,
  Search20Regular,
} from '@fluentui/react-icons';
import React, { useCallback } from 'react';
import ToolbarContextSwicher from './ToolbarContextSwicher';

export interface HelicorderToolbarProps {
  channel: string;
  interval?: number;
  duration?: number;
  showEvent?: boolean;
  onChannelChange?: (channelId: string) => void;
  onDurationChange?: (duration: number) => void;
  onIntervalChange?: (interval: number) => void;
  onShiftViewDown?: () => void;
  onShiftViewUp?: () => void;
  onShiftViewToNow?: () => void;
  onOffsetDateChange?: () => void;
  onIncreaseAmplitude?: () => void;
  onDecreaseAmplitude?: () => void;
  onResetAmplitude?: () => void;
  onShowEventChange?: (showEvent: boolean) => void;
}

const durationOptions = [
  { value: 3, label: '3h' },
  { value: 6, label: '6h' },
  { value: 12, label: '12h' },
  { value: 1 * 24, label: '1d' },
];

const intervalOptions = [
  { value: 15, label: '15m' },
  { value: 30, label: '30m' },
  { value: 1 * 60, label: '1h' },
];

const useStyles = makeStyles({
  btn: {
    minWidth: 'auto',
  },
  searchBoxWrapper: {
    marginBottom: tokens.spacingVerticalMNudge,
  },
  searchBox: {
    width: '200px',
  },
});

const HelicorderToolbar: React.FC<HelicorderToolbarProps> = (props) => {
  const {
    channel,
    interval = 30,
    duration = 12,
    showEvent,
    onChannelChange,
    onDurationChange,
    onIntervalChange,
    onShiftViewDown,
    onShiftViewUp,
    onShiftViewToNow,
    onIncreaseAmplitude,
    onDecreaseAmplitude,
    onResetAmplitude,
    onShowEventChange,
  } = props;

  const styles = useStyles();

  const handleChannelChange = useCallback(
    (id: string) => {
      onChannelChange?.(id);
    },
    [onChannelChange]
  );

  const handleDurationChange = useCallback(
    (duration: number) => {
      onDurationChange?.(duration);
    },
    [onDurationChange]
  );

  const handleIntervalChange = useCallback(
    (interval: number) => {
      onIntervalChange?.(interval);
    },
    [onIntervalChange]
  );

  const handleShowEventChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onShowEventChange?.(event.target.checked);
    },
    [onShowEventChange]
  );

  const [open, setOpen] = React.useState<boolean>(false);

  return (
    <div className="bg-white dark:bg-black mx-2 drop-shadow rounded">
      <Toolbar aria-label="Helicorder Toolbar">
        <ToolbarContextSwicher />

        <Popover trapFocus open={open} onOpenChange={() => setOpen(!open)}>
          <PopoverTrigger disableButtonEnhancement>
            <ToolbarButton aria-label="Select Channel ID" icon={<Search20Regular />} className={styles.btn}>
              <span className="font-normal">{channel}</span>
            </ToolbarButton>
          </PopoverTrigger>
          <PopoverSurface>
            <Field className={styles.searchBoxWrapper}>
              <SearchBox placeholder="Search channel" size="medium" className={styles.searchBox} />
            </Field>
            <MenuList>
              {[
                'VG.MEPAS.00.HHZ',
                'VG.MEPAS.00.HHN',
                'VG.MEPAS.00.HHE',
                'VG.MEKAL.00.HHZ',
                'VG.MEKAL.00.HHN',
                'VG.MEKAL.00.HHE',
                'VG.MELAB.00.HHZ',
                'VG.MELAB.00.HHN',
                'VG.MELAB.00.HHE',
              ].map((id, index) => (
                <MenuItem
                  key={index}
                  onClick={() => {
                    if (channel !== id) {
                      handleChannelChange(id);
                    }
                    setOpen(false);
                  }}
                >
                  {id}
                </MenuItem>
              ))}
            </MenuList>
          </PopoverSurface>
        </Popover>

        <Menu>
          <MenuTrigger>
            <ToolbarButton aria-label="Select Duration" className={styles.btn}>
              <span className="font-normal">{durationOptions.find((option) => option.value === duration)?.label}</span> <ChevronDown12Regular />
            </ToolbarButton>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {durationOptions.map((option) => (
                <MenuItem key={option.value} onClick={() => handleDurationChange(option.value)}>
                  {option.label}
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>
        <Menu>
          <MenuTrigger>
            <ToolbarButton aria-label="Select Interval" className={styles.btn}>
              <span className="font-normal">{intervalOptions.find((option) => option.value === interval)?.label}</span> <ChevronDown12Regular />
            </ToolbarButton>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {intervalOptions.map((option) => (
                <MenuItem key={option.value} onClick={() => handleIntervalChange(option.value)}>
                  {option.label}
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>
        <ToolbarDivider />
        <ToolbarButton aria-label="Shift View Up" icon={<ChevronUp20Regular />} onClick={onShiftViewUp} />
        <ToolbarButton aria-label="Shift View Down" icon={<ChevronDown20Regular />} onClick={onShiftViewDown} />
        <ToolbarButton aria-label="Shift View to Now" icon={<ChevronDoubleDown20Regular />} onClick={onShiftViewToNow} />
        <ToolbarButton aria-label="Change Offset Date" icon={<Calendar20Regular />} />
        <ToolbarButton aria-label="Increase Amplitude" icon={<ChevronUpDown20Regular />} onClick={onIncreaseAmplitude} />
        <ToolbarButton aria-label="Decrease Amplitude" icon={<ChevronDownUp20Regular />} onClick={onDecreaseAmplitude} />
        <ToolbarButton aria-label="Reset Amplitude" icon={<AutoFitHeight20Regular />} onClick={onResetAmplitude} />
        <ToolbarDivider />
        <Switch checked={showEvent} label={showEvent ? 'Hide Event' : 'Show Event'} onChange={handleShowEventChange} />
        <ToolbarDivider />
        <Menu>
          <MenuTrigger>
            <ToolbarButton aria-label="More" icon={<MoreHorizontal24Filled />} />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem>More</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </Toolbar>
    </div>
  );
};

export default HelicorderToolbar;
