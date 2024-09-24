import {
  Button,
  ColorSwatch,
  EmptySwatch,
  Field,
  InputOnChangeData,
  Label,
  makeStyles,
  MenuItem,
  MenuList,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  SearchBox,
  SearchBoxChangeEvent,
  SwatchPicker,
  SwatchPickerOnSelectEventHandler,
  tokens,
  Tooltip,
} from '@fluentui/react-components';
import { AddRegular, ArrowDownRegular, ArrowUpRegular, DeleteRegular, DismissRegular } from '@fluentui/react-icons';
import Fuse from 'fuse.js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInventoryStore } from '../../../stores/inventory';
import { ChannelConfig } from '../../../stores/picker/slices';
import { Channel } from '../../../types/channel';

interface ColorPickerProps {
  color?: string;
  onChange?: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const defaultColor = color ?? 'transparent';
  const defaultValue = defaultColor === 'transparent' ? 'none' : defaultColor;

  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);
  const [selectedColor, setSelectedColor] = useState<string>(defaultColor);

  const handleSelect: SwatchPickerOnSelectEventHandler = (_, data) => {
    const value = data.selectedValue;
    const color = value === 'none' ? 'transparent' : value;
    setSelectedValue(value);
    setSelectedColor(color);
    onChange?.(value);
  };

  return (
    <Popover>
      <PopoverTrigger disableButtonEnhancement>
        {selectedColor !== 'transparent' ? <ColorSwatch color={selectedColor} value={selectedColor} /> : <EmptySwatch />}
      </PopoverTrigger>

      <PopoverSurface tabIndex={-1}>
        <SwatchPicker aria-label="SwatchPicker" selectedValue={selectedValue} onSelectionChange={handleSelect}>
          <ColorSwatch color="#FF1921" value="#FF1921" aria-label="red" />
          <ColorSwatch color="#FF7A00" value="#FF7A00" aria-label="orange" />
          <ColorSwatch color="#90D057" value="#90D057" aria-label="light green" />
          <ColorSwatch color="#00B053" value="#00B053" aria-label="green" />
          <ColorSwatch color="#00AFED" value="#00AFED" aria-label="light blue" />
          <ColorSwatch color="#006EBD" value="#006EBD" aria-label="blue" />
          <ColorSwatch color="#712F9E" value="#712F9E" aria-label="purple" />
          <ColorSwatch color="#FFD500" value="#FFD500" aria-label="yellow" />
          <ColorSwatch color="#FFD1F9" value="#FFD1F9" aria-label="pink" />
          <ColorSwatch color="#D1D5D8" value="#D1D5D8" aria-label="gray" />
          <ColorSwatch color="#000000" value="#000000" aria-label="black" />
          <ColorSwatch color="transparent" value="none" aria-label="none" icon={<DismissRegular fontSize={20} />} />
        </SwatchPicker>
      </PopoverSurface>
    </Popover>
  );
};

export interface SeismogramChannelListProps {
  channelList: ChannelConfig[];
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  onAdd?: (channel: Channel) => void;
  onDelete?: (index: number) => void;
  onColorChange?: (index: number, color?: string) => void;
}

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
    maxHeight: '300px',
    overflowY: 'auto',
  },
  toolbar: {
    gap: '3px',
  },
});

const SeismogramChannelList: React.FC<SeismogramChannelListProps> = ({ channelList, onMoveUp, onMoveDown, onAdd, onDelete, onColorChange }) => {
  const [open, setOpen] = useState(false);
  const styles = useStyles();

  const handleMoveUp = useCallback(
    (index: number) => {
      onMoveUp?.(index);
    },
    [onMoveUp]
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      onMoveDown?.(index);
    },
    [onMoveDown]
  );

  const handleAdd = useCallback(
    (channel: Channel) => {
      onAdd?.(channel);
      setOpen(false);
    },
    [onAdd]
  );

  const handleDelete = useCallback(
    (index: number) => {
      onDelete?.(index);
    },
    [onDelete]
  );

  const handleColorChange = useCallback(
    (index: number, color?: string) => {
      onColorChange?.(index, color);
    },
    [onColorChange]
  );

  const [searchQuery, setSearchQuery] = useState<string>('');
  const fuseRef = useRef<Fuse<Channel> | null>(null);
  const { channels } = useInventoryStore();

  const candidateChannels = useMemo(() => channels().filter((channel) => !channelList.map((c) => c.channel.id).includes(channel.id)), [channels, channelList]);

  const filterableChannels = useMemo(() => {
    if (!searchQuery || !fuseRef.current) {
      return candidateChannels;
    }

    return searchQuery ? fuseRef.current.search(searchQuery).map((item) => item.item) : candidateChannels;
  }, [searchQuery, candidateChannels]);

  useEffect(() => {
    fuseRef.current = new Fuse(candidateChannels, {
      keys: ['net_sta_code'],
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
    <div>
      <div className="flex items-center justify-between">
        <Label>Seismogram Channel List</Label>
        <Popover trapFocus open={open} onOpenChange={() => setOpen(!open)} positioning="below">
          <PopoverTrigger disableButtonEnhancement>
            <Tooltip content="Add Channel" relationship="label">
              <Button appearance="transparent" aria-label="Select Channel ID" icon={<AddRegular />} />
            </Tooltip>
          </PopoverTrigger>
          <PopoverSurface className={styles.popoverSurface}>
            <Field className={styles.searchBoxWrapper}>
              <SearchBox placeholder="Search channel" size="medium" className={styles.searchBox} value={searchQuery} onChange={handleSearchChange} />
            </Field>
            <MenuList>
              {filterableChannels.map((channel, index) => (
                <MenuItem key={index} onClick={() => handleAdd(channel)}>
                  {channel.stream_id}
                </MenuItem>
              ))}
            </MenuList>
          </PopoverSurface>
        </Popover>
      </div>
      <div className="border border-gray-300 dark:border-gray-700 p-2 h-[300px] overflow-auto">
        {channelList.map((channelListItem, index) => (
          <div key={channelListItem.channel.id} className="flex gap-1 items-center relative group h-[40px]">
            <ColorPicker color={channelListItem.color} onChange={(color) => handleColorChange(index, color)} />
            <span>{channelListItem.channel.stream_id}</span>
            <div className="absolute top-0 right-0 hidden group-hover:flex space-x-2">
              <Button size="small" icon={<ArrowUpRegular />} onClick={() => handleMoveUp(index)} />
              <Button size="small" icon={<ArrowDownRegular />} onClick={() => handleMoveDown(index)} />
              <Button size="small" icon={<DeleteRegular />} onClick={() => handleDelete(index)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeismogramChannelList;
