import { Field, InputOnChangeData, makeStyles, MenuItem, MenuList, SearchBox, SearchBoxChangeEvent } from '@fluentui/react-components';
import Fuse from 'fuse.js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInventoryStore } from '../../../stores/inventory';
import { Channel } from '../../../types/channel';

export interface HelicorderDefaultChannelProps {
  channelId: string;
  onChange?: (channel: Channel) => void;
}

const useStyles = makeStyles({
  btn: {
    minWidth: 'auto',
  },
  searchBox: {
    width: '100%',
    maxWidth: '100%',
  },
  toolbar: {
    gap: '3px',
  },
  menuItem: {
    width: '100%',
    maxWidth: '100%',
  },
});

const HelicorderDefaultChannel: React.FC<HelicorderDefaultChannelProps> = ({ channelId, onChange }) => {
  const { channels } = useInventoryStore();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const fuseRef = useRef<Fuse<Channel> | null>(null);
  const styles = useStyles();

  const candidateChannels = useMemo(() => channels().filter((channel) => channel.id !== channelId), [channels, channelId]);

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
    <div>
      <p className="mb-2">Select helicorder default channel.</p>
      <Field>
        <SearchBox className={styles.searchBox} placeholder="Search channel" size="medium" value={searchQuery} onChange={handleSearchChange} />
      </Field>
      <div className="h-[300px] overflow-auto border mt-2">
        <MenuList>
          {filterableChannels.map((channel, index) => (
            <MenuItem key={index} onClick={() => onChange?.(channel)} className={styles.menuItem}>
              {channel.stream_id}
            </MenuItem>
          ))}
        </MenuList>
      </div>
    </div>
  );
};

export default HelicorderDefaultChannel;
