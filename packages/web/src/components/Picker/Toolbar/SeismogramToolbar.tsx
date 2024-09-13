import {
  Field,
  InputOnChangeData,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  SearchBox,
  SearchBoxChangeEvent,
  Switch,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarProps,
  ToolbarToggleButton,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Add20Regular,
  AutoFitHeight20Regular,
  BezierCurveSquareRegular,
  Checkmark20Regular,
  ChevronDown12Regular,
  ChevronDownUp20Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
  ChevronUpDown20Regular,
  ZoomIn20Regular,
  ZoomOut20Regular,
} from '@fluentui/react-icons';
import Fuse from 'fuse.js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Channel } from '../../../types/channel';

export interface SeismogramToolbarProps {
  showEvent?: boolean;
  checkedValues?: Record<string, string[]>;
  isExpandMode?: boolean;
  component?: string;
  availableChannels?: Channel[];
  selectedChannels?: Channel[];
  onChannelAdd?: (trace: Channel) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onScrollLeft?: () => void;
  onScrollRight?: () => void;
  onScrollToDate?: (date: number) => void;
  onIncreaseAmplitude?: () => void;
  onDecreaseAmplitude?: () => void;
  onResetAmplitude?: () => void;
  onComponentChange?: (component: string) => void;
  onShowEventChange?: (showEvent: boolean) => void;
  onCheckedValueChange?: (name: string, values: string[]) => void;
  onSpectrogramChange?: (active: boolean) => void;
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
      color: tokens.colorNeutralForeground2BrandHover,
    },
    color: tokens.colorNeutralForeground1,
  },
  searchBoxWrapper: {
    marginBottom: tokens.spacingVerticalMNudge,
  },
  searchBox: {
    width: '200px',
  },
  popoverSurface: {
    maxHeight: '500px',
    overflowY: 'auto',
  },
  zoomInButton: {
    marginLeft: '5px',
  },
});

const SeismogramToolbar: React.FC<SeismogramToolbarProps> = (props) => {
  const {
    showEvent = true,
    checkedValues = {},
    isExpandMode,
    component = 'Z',
    availableChannels = [],
    selectedChannels = [],
    onChannelAdd,
    onZoomIn,
    onZoomOut,
    onScrollLeft,
    onScrollRight,
    onIncreaseAmplitude,
    onDecreaseAmplitude,
    onResetAmplitude,
    onComponentChange,
    onShowEventChange,
    onCheckedValueChange,
    onSpectrogramChange,
  } = props;

  const styles = useStyles();

  const handleShowEventChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onShowEventChange?.(event.currentTarget.checked);
    },
    [onShowEventChange]
  );

  const handleComponentChange = useCallback(
    (value: string) => {
      if (value !== component) {
        onComponentChange?.(value);
      }
    },
    [component, onComponentChange]
  );

  const handleToolbarCheckedValueChange = useCallback<NonNullable<ToolbarProps['onCheckedValueChange']>>(
    (_e, { name, checkedItems }) => {
      if (name === 'options') {
        if (checkedItems.includes('spectrogram')) {
          onSpectrogramChange?.(true);
        } else {
          onSpectrogramChange?.(false);
        }
      }

      onCheckedValueChange?.(name, checkedItems);
    },
    [onCheckedValueChange, onSpectrogramChange]
  );

  const handleChannelAdd = useCallback(
    (channel: Channel) => {
      onChannelAdd?.(channel);
    },
    [onChannelAdd]
  );

  const [open, setOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const fuseRef = useRef<Fuse<Channel> | null>(null);

  const candidateChannels = useMemo(
    () => availableChannels.filter((channel) => !selectedChannels.map((c) => c.id).includes(channel.id) && channel.code.includes(component)),
    [availableChannels, selectedChannels, component]
  );

  const filterableChannels = useMemo(() => {
    if (!searchQuery || !fuseRef.current) {
      return candidateChannels;
    }

    return searchQuery ? fuseRef.current.search(searchQuery).map((item) => item.item) : candidateChannels;
  }, [searchQuery, candidateChannels]);

  useEffect(() => {
    fuseRef.current = new Fuse(candidateChannels, {
      keys: ['network_station_code'],
      threshold: 0.3,
    });

    return () => {
      fuseRef.current = null;
    };
  }, [candidateChannels]);

  const handleSearchChange = useCallback((_: SearchBoxChangeEvent, data: InputOnChangeData) => {
    setSearchQuery(data.value);
  }, []);

  return (
    <div className="bg-white dark:bg-black mx-2 mt-1 border dark:border-transparent rounded flex justify-between items-center">
      <Toolbar aria-label="Seismogram Toolbar" checkedValues={checkedValues} onCheckedValueChange={handleToolbarCheckedValueChange}>
        <Popover trapFocus open={open} onOpenChange={() => setOpen(!open)}>
          <PopoverTrigger disableButtonEnhancement>
            <ToolbarButton appearance="primary" aria-label="Add station" icon={<Add20Regular />} disabled={!!isExpandMode}>
              <span className="font-normal">Add station</span>
            </ToolbarButton>
          </PopoverTrigger>
          <PopoverSurface className={styles.popoverSurface}>
            <Field className={styles.searchBoxWrapper}>
              <SearchBox placeholder="Search station" size="medium" className={styles.searchBox} value={searchQuery} onChange={handleSearchChange} />
            </Field>
            <MenuList>
              {filterableChannels.map((channel, index) => (
                <MenuItem
                  key={index}
                  onClick={() => {
                    handleChannelAdd(channel);
                    setOpen(false);
                  }}
                >
                  {channel.network_station_code}
                </MenuItem>
              ))}
            </MenuList>
          </PopoverSurface>
        </Popover>

        <Tooltip content="Zoom In" relationship="label" showDelay={1500}>
          <ToolbarButton className={styles.zoomInButton} aria-label="Zoom In" icon={<ZoomIn20Regular />} onClick={onZoomIn} />
        </Tooltip>
        <Tooltip content="Zoom Out" relationship="label" showDelay={1500}>
          <ToolbarButton aria-label="Zoom Out" icon={<ZoomOut20Regular />} onClick={onZoomOut} />
        </Tooltip>

        <Tooltip content="Scroll Left" relationship="label" showDelay={1500}>
          <ToolbarButton aria-label="Scroll Left" icon={<ChevronLeft20Regular />} onClick={onScrollLeft} />
        </Tooltip>
        <Tooltip content="Scroll Right" relationship="label" showDelay={1500}>
          <ToolbarButton aria-label="Scroll Right" icon={<ChevronRight20Regular />} onClick={onScrollRight} />
        </Tooltip>
        <Tooltip content="Increase Amplitude" relationship="label" showDelay={1500}>
          <ToolbarButton aria-label="Increase Amplitude" icon={<ChevronUpDown20Regular />} onClick={onIncreaseAmplitude} />
        </Tooltip>
        <Tooltip content="Decrease Amplitude" relationship="label" showDelay={1500}>
          <ToolbarButton aria-label="Decrease Amplitude" icon={<ChevronDownUp20Regular />} onClick={onDecreaseAmplitude} />
        </Tooltip>
        <Tooltip content="Reset Amplitude" relationship="label" showDelay={1500}>
          <ToolbarButton aria-label="Reset Amplitude" icon={<AutoFitHeight20Regular />} onClick={onResetAmplitude} />
        </Tooltip>
        <ToolbarDivider />

        <Menu hasIcons>
          <MenuTrigger>
            <Tooltip content="Select Component" relationship="label" showDelay={1500}>
              <ToolbarButton aria-label="Select Component" className={styles.btn} disabled={!!isExpandMode}>
                <span className="font-normal">{componentOptions.find((option) => option.value === component)?.label}</span> <ChevronDown12Regular />
              </ToolbarButton>
            </Tooltip>
          </MenuTrigger>

          <MenuPopover>
            <MenuList>
              {componentOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  onClick={() => handleComponentChange(option.value)}
                  icon={option.value === component ? <Checkmark20Regular /> : undefined}
                >
                  {option.label}
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>

        <Tooltip content="Toggle Spectrogram" relationship="label" showDelay={1500}>
          <ToolbarToggleButton
            aria-label="Toggle Spectrogram"
            icon={<BezierCurveSquareRegular className={styles.iconPick} />}
            name="options"
            value="spectrogram"
            appearance="subtle"
          />
        </Tooltip>

        <ToolbarDivider />

        <Switch checked={showEvent} label={showEvent ? 'Hide Event' : 'Show Event'} onChange={handleShowEventChange} />
      </Toolbar>
    </div>
  );
};

export default SeismogramToolbar;
