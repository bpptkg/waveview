import { Calendar } from '@fluentui/react-calendar-compat';
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
  Search20Regular,
} from '@fluentui/react-icons';
import Fuse from 'fuse.js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Channel } from '../../../types/channel';
import CatalogPicker from '../../Catalog/CatalogPicker';

export interface HelicorderToolbarProps {
  channelId: string;
  interval?: number;
  duration?: number;
  showEvent?: boolean;
  offsetDate?: Date;
  availableChannels?: Channel[];
  onChannelChange?: (channel: Channel) => void;
  onDurationChange?: (duration: number) => void;
  onIntervalChange?: (interval: number) => void;
  onShiftViewDown?: () => void;
  onShiftViewUp?: () => void;
  onShiftViewToNow?: () => void;
  onOffsetDateChange?: (date: Date) => void;
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
  popoverSurface: {
    maxHeight: '500px',
    overflowY: 'auto',
  },
});

const HelicorderToolbar: React.FC<HelicorderToolbarProps> = (props) => {
  const {
    channelId,
    interval = 30,
    duration = 12,
    showEvent,
    offsetDate,
    availableChannels = [],
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
    onOffsetDateChange,
  } = props;

  const styles = useStyles();

  const handleChannelChange = useCallback(
    (channel: Channel) => {
      onChannelChange?.(channel);
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

  const handleSelectDate = useCallback(
    (date: Date) => {
      onOffsetDateChange?.(date);
      setOffsetDatePickerOpen(false);
    },
    [onOffsetDateChange]
  );

  const [open, setOpen] = useState<boolean>(false);
  const [offsetDatePickerOpen, setOffsetDatePickerOpen] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const fuseRef = useRef<Fuse<Channel> | null>(null);

  const candidateChannels = useMemo(() => availableChannels.filter((channel) => channel.id !== channelId), [availableChannels, channelId]);

  useEffect(() => {
    fuseRef.current = new Fuse(candidateChannels, {
      keys: ['stream_id'],
      threshold: 0.3,
    });

    return () => {
      fuseRef.current = null;
    };
  }, [candidateChannels]);

  const handleSearchChange = useCallback((_: SearchBoxChangeEvent, data: InputOnChangeData) => {
    setSearchQuery(data.value);
  }, []);

  const filterableChannels = useMemo(() => {
    if (!searchQuery || !fuseRef.current) {
      return candidateChannels;
    }

    return searchQuery ? fuseRef.current.search(searchQuery).map((item) => item.item) : candidateChannels;
  }, [searchQuery, candidateChannels]);

  return (
    <div className="bg-white dark:bg-black mx-2 mt-1 drop-shadow rounded flex justify-between items-center">
      <Toolbar aria-label="Helicorder Toolbar">
        <Popover trapFocus open={open} onOpenChange={() => setOpen(!open)}>
          <PopoverTrigger disableButtonEnhancement>
            <ToolbarButton appearance="primary" aria-label="Select Channel ID" icon={<Search20Regular />} className={styles.btn}>
              <span className="font-normal">{availableChannels.find((channel) => channel.id === channelId)?.stream_id}</span>
            </ToolbarButton>
          </PopoverTrigger>
          <PopoverSurface className={styles.popoverSurface}>
            <Field className={styles.searchBoxWrapper}>
              <SearchBox placeholder="Search channel" size="medium" className={styles.searchBox} value={searchQuery} onChange={handleSearchChange} />
            </Field>
            <MenuList>
              {filterableChannels.map((channel, index) => (
                <MenuItem
                  key={index}
                  onClick={() => {
                    if (channelId !== channel.id) {
                      handleChannelChange(channel);
                    }
                    setOpen(false);
                  }}
                >
                  {channel.stream_id}
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

        <Popover trapFocus open={offsetDatePickerOpen} onOpenChange={() => setOffsetDatePickerOpen(!offsetDatePickerOpen)}>
          <PopoverTrigger disableButtonEnhancement>
            <ToolbarButton aria-label="Change Offset Date" icon={<Calendar20Regular />} />
          </PopoverTrigger>
          <PopoverSurface>
            <Calendar value={offsetDate} onSelectDate={handleSelectDate} />
          </PopoverSurface>
        </Popover>

        <ToolbarButton aria-label="Increase Amplitude" icon={<ChevronUpDown20Regular />} onClick={onIncreaseAmplitude} />
        <ToolbarButton aria-label="Decrease Amplitude" icon={<ChevronDownUp20Regular />} onClick={onDecreaseAmplitude} />
        <ToolbarButton aria-label="Reset Amplitude" icon={<AutoFitHeight20Regular />} onClick={onResetAmplitude} />
        <ToolbarDivider />
        <Switch checked={showEvent} label={showEvent ? 'Hide Event' : 'Show Event'} onChange={handleShowEventChange} />
      </Toolbar>
      <CatalogPicker />
    </div>
  );
};

export default HelicorderToolbar;
