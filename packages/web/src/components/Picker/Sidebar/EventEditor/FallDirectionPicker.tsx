import {
  Button,
  Field,
  InputOnChangeData,
  makeStyles,
  MenuItem,
  MenuList,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  SearchBox,
  SearchBoxChangeEvent,
  tokens,
  Tooltip,
} from '@fluentui/react-components';
import { AddRegular } from '@fluentui/react-icons';
import Fuse from 'fuse.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FallDirection } from '../../../../types/observation';

interface FallDirectionPickerProps {
  directions?: FallDirection[];
  excludes?: FallDirection[];
  onSelected?: (direction: FallDirection) => void;
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

const FallDirectionPicker: React.FC<FallDirectionPickerProps> = ({ directions, excludes, onSelected }) => {
  const [open, setOpen] = useState(false);
  const styles = useStyles();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const fuseRef = useRef<Fuse<FallDirection> | null>(null);

  const candidateDirections = useMemo(() => {
    return directions?.filter((direction) => !excludes?.some((exclude) => exclude.id === direction.id)).sort((a, b) => a.name.localeCompare(b.name)) ?? [];
  }, [directions, excludes]);

  const filterableDirections = useMemo(() => {
    if (!searchQuery || !fuseRef.current) {
      return candidateDirections;
    }

    return searchQuery ? fuseRef.current.search(searchQuery).map((item) => item.item) : candidateDirections;
  }, [searchQuery, candidateDirections]);

  useEffect(() => {
    fuseRef.current = new Fuse(candidateDirections, {
      keys: ['name'],
      threshold: 0.3,
    });

    return () => {
      fuseRef.current = null;
    };
  }, [candidateDirections]);

  const handleSearchChange = useCallback((_: SearchBoxChangeEvent, data: InputOnChangeData) => {
    setSearchQuery(data.value);
  }, []);

  const handleAdd = useCallback(
    (item: FallDirection) => {
      onSelected?.(item);
      setOpen(false);
    },
    [onSelected]
  );

  return (
    <div className="flex items-center justify-between">
      <Field label={'Fall Directions'}></Field>
      <Popover trapFocus open={open} onOpenChange={() => setOpen(!open)} positioning="below">
        <PopoverTrigger disableButtonEnhancement>
          <Tooltip content="Add Fall Direction" relationship="label">
            <Button appearance="transparent" aria-label="Add Fall Direction" icon={<AddRegular />} />
          </Tooltip>
        </PopoverTrigger>
        <PopoverSurface className={styles.popoverSurface}>
          <Field className={styles.searchBoxWrapper}>
            <SearchBox placeholder="Search direction" size="medium" className={styles.searchBox} value={searchQuery} onChange={handleSearchChange} />
          </Field>
          <MenuList>
            {filterableDirections.map((item, index) => (
              <MenuItem key={index} onClick={() => handleAdd(item)}>
                {item.name}
              </MenuItem>
            ))}
          </MenuList>
        </PopoverSurface>
      </Popover>
    </div>
  );
};

export default FallDirectionPicker;
