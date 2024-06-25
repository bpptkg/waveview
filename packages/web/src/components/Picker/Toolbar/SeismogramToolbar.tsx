import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
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
  Calendar20Regular,
  ChevronDoubleRight20Regular,
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
import ToolbarContextSwicher from './ToolbarContextSwicher';

export interface SeismogramToolbarProps {
  showEvent?: boolean;
  checkedValues?: Record<string, string[]>;
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
});

const SeismogramToolbar: React.FC<SeismogramToolbarProps> = (props) => {
  const {
    showEvent = true,
    checkedValues = {},
    onChannelAdd,
    onZoomIn,
    onZoomOut,
    onScrollLeft,
    onScrollRight,
    onScrollToNow,
    onScrollToDate,
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

  return (
    <div className="bg-white dark:bg-black mx-2 drop-shadow rounded">
      <Toolbar aria-label="Seismogram Toolbar" checkedValues={checkedValues} onCheckedValueChange={handleToolbarCheckedValueChange}>
        <ToolbarContextSwicher />
        <ToolbarDivider />
        <ToolbarButton aria-label="Add Channel" icon={<Add20Regular />} />
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
        <ToolbarButton aria-label="Scroll to Date" icon={<Calendar20Regular />} />
        <ToolbarButton aria-label="Increase Amplitude" icon={<ChevronUpDown20Regular />} onClick={onIncreaseAmplitude} />
        <ToolbarButton aria-label="Decrease Amplitude" icon={<ChevronDownUp20Regular />} onClick={onDecreaseAmplitude} />
        <ToolbarButton aria-label="Reset Amplitude" icon={<AutoFitHeight20Regular />} onClick={onResetAmplitude} />
        <ToolbarDivider />
        <ToolbarToggleButton aria-label="Pick mode" icon={<PickIcon className={styles.iconPick} />} name="options" value="pick-mode" appearance="subtle" />
        <Menu>
          <MenuTrigger>
            <MenuButton appearance="transparent" size="small" aria-label="Select Component">
              {componentOptions.find((option) => option.value === 'Z')?.label}
            </MenuButton>
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
