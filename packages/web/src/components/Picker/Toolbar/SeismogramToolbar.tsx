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
  ToolbarProps,
  ToolbarToggleButton,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Add20Regular,
  AutoFitHeight20Regular,
  ChevronDoubleRight20Regular,
  ChevronDown12Regular,
  ChevronDownUp20Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
  ChevronUpDown20Regular,
  FullScreenMaximize20Regular,
  MoreHorizontal24Filled,
  ZoomIn20Regular,
  ZoomOut20Regular,
} from '@fluentui/react-icons';
import React, { useCallback, useState } from 'react';
import PickIcon from '../../Icons/PickIcon';

export interface SeismogramToolbarProps {
  showEvent?: boolean;
  checkedValues?: Record<string, string[]>;
  isExpandMode?: boolean;
  onChannelAdd?: (channelId: string) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onScrollLeft?: () => void;
  onScrollRight?: () => void;
  onScrollToNow?: () => void;
  onScrollToDate?: (date: number) => void;
  onIncreaseAmplitude?: () => void;
  onDecreaseAmplitude?: () => void;
  onResetAmplitude?: () => void;
  onPickModeChange?: (active: boolean) => void;
  onComponentChange?: (component: string) => void;
  onShowEventChange?: (showEvent: boolean) => void;
  onZoomRectangleChange?: (active: boolean) => void;
  onCheckedValueChange?: (name: string, values: string[]) => void;
}

const componentOptions = [
  { value: 'E', label: 'E' },
  { value: 'N', label: 'N' },
  { value: 'Z', label: 'Z' },
];

const useStyles = makeStyles({
  btn: {
    minWidth: 'auto',
  },
  iconZoom: {
    color: tokens.colorNeutralForeground1,
    '&:hover': {
      color: tokens.colorNeutralForeground2BrandHover,
    },
  },
  iconPick: {
    fill: tokens.colorNeutralForeground1,
    '&:hover': {
      fill: tokens.colorNeutralForeground2BrandHover,
    },
  },
  searchBoxWrapper: {
    marginBottom: tokens.spacingVerticalMNudge,
  },
  searchBox: {
    width: '200px',
  },
});

const SeismogramToolbar: React.FC<SeismogramToolbarProps> = (props) => {
  const {
    showEvent = true,
    checkedValues = {},
    isExpandMode,
    onChannelAdd,
    onZoomIn,
    onZoomOut,
    onScrollLeft,
    onScrollRight,
    onScrollToNow,
    onIncreaseAmplitude,
    onDecreaseAmplitude,
    onResetAmplitude,
    onPickModeChange,
    onComponentChange,
    onShowEventChange,
    onZoomRectangleChange,
    onCheckedValueChange,
  } = props;

  const styles = useStyles();

  const [component, setComponent] = useState('Z');

  const handleShowEventChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onShowEventChange?.(event.currentTarget.checked);
    },
    [onShowEventChange]
  );

  const handleComponentChange = useCallback(
    (component: string) => {
      setComponent(component);
      onComponentChange?.(component);
    },
    [setComponent, onComponentChange]
  );

  const handleToolbarCheckedValueChange = useCallback<NonNullable<ToolbarProps['onCheckedValueChange']>>(
    (_e, { name, checkedItems }) => {
      if (name === 'options') {
        if (checkedItems.includes('pick-mode')) {
          onPickModeChange?.(true);
        } else {
          onPickModeChange?.(false);
        }
        if (checkedItems.includes('zoom-rectangle')) {
          onZoomRectangleChange?.(true);
        } else {
          onZoomRectangleChange?.(false);
        }
      }

      onCheckedValueChange?.(name, checkedItems);
    },
    [onPickModeChange, onZoomRectangleChange, onCheckedValueChange]
  );

  const handleChannelAdd = useCallback(
    (channelId: string) => {
      onChannelAdd?.(channelId);
    },
    [onChannelAdd]
  );

  const [open, setOpen] = React.useState<boolean>(false);

  return (
    <div className="bg-white dark:bg-black mx-2 drop-shadow rounded">
      <Toolbar aria-label="Seismogram Toolbar" checkedValues={checkedValues} onCheckedValueChange={handleToolbarCheckedValueChange}>
        <Popover trapFocus open={open} onOpenChange={() => setOpen(!open)}>
          <PopoverTrigger disableButtonEnhancement>
            <ToolbarButton appearance="primary" aria-label="Add Channel" icon={<Add20Regular />} disabled={!!isExpandMode}>
              <span className="font-normal">Add channel</span>
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
              ].map((channelId, index) => (
                <MenuItem
                  key={index}
                  onClick={() => {
                    handleChannelAdd(channelId);
                    setOpen(false);
                  }}
                >
                  {channelId}
                </MenuItem>
              ))}
            </MenuList>
          </PopoverSurface>
        </Popover>

        <ToolbarButton aria-label="Zoom In" icon={<ZoomIn20Regular />} onClick={onZoomIn} />
        <ToolbarButton aria-label="Zoom Out" icon={<ZoomOut20Regular />} onClick={onZoomOut} />
        <ToolbarToggleButton
          aria-label="Zoom Area"
          icon={<FullScreenMaximize20Regular className={styles.iconZoom} />}
          name="options"
          value="zoom-rectangle"
          appearance="subtle"
        />
        <ToolbarButton aria-label="Scroll Left" icon={<ChevronLeft20Regular />} onClick={onScrollLeft} />
        <ToolbarButton aria-label="Scroll Right" icon={<ChevronRight20Regular />} onClick={onScrollRight} />
        <ToolbarButton aria-label="Scroll to Now" icon={<ChevronDoubleRight20Regular />} onClick={onScrollToNow} />
        <ToolbarButton aria-label="Increase Amplitude" icon={<ChevronUpDown20Regular />} onClick={onIncreaseAmplitude} />
        <ToolbarButton aria-label="Decrease Amplitude" icon={<ChevronDownUp20Regular />} onClick={onDecreaseAmplitude} />
        <ToolbarButton aria-label="Reset Amplitude" icon={<AutoFitHeight20Regular />} onClick={onResetAmplitude} />
        <ToolbarDivider />
        <ToolbarToggleButton aria-label="Pick mode" icon={<PickIcon className={styles.iconPick} />} name="options" value="pick-mode" appearance="subtle" />

        <Menu>
          <MenuTrigger>
            <ToolbarButton aria-label="Select Component" className={styles.btn} disabled={!!isExpandMode}>
              <span className="font-normal">{componentOptions.find((option) => option.value === 'Z')?.label}</span> <ChevronDown12Regular />
            </ToolbarButton>
          </MenuTrigger>

          <MenuPopover>
            <MenuList>
              {componentOptions.map((option) => (
                <MenuItem key={option.value} onClick={() => handleComponentChange(option.value)}>
                  {option.label}
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>

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

export default SeismogramToolbar;
