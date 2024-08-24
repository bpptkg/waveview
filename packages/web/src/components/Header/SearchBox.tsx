import { SearchBox as FluentSearchBox, InputOnChangeData, makeStyles, SearchBoxChangeEvent } from '@fluentui/react-components';
import { SearchRegular } from '@fluentui/react-icons';
import Fuse from 'fuse.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles({
  searchBox: {
    width: '364px',
    position: 'relative',
  },
});

interface SearchItem {
  url: string;
  title: string;
}

const searchIndex: SearchItem[] = [
  { url: '/', title: 'Dashboard' },
  { url: '/picker', title: 'Picker' },
  { url: '/catalog', title: 'Catalog' },
  { url: '/catalog/events', title: 'Events' },
  { url: '/catalog/seismicity', title: 'Seismicity' },
  { url: '/catalog/hypocenter', title: 'Hypocenter' },
  { url: '/help', title: 'Help' },
  { url: '/about', title: 'About' },
  { url: '/profile', title: 'Profile' },
  { url: '/terms-of-service', title: 'Terms of Service' },
];

const SearchBox = () => {
  const navigate = useNavigate();
  const styles = useStyles();
  const ref = useRef<HTMLDivElement | null>(null);
  const fuseRef = useRef<Fuse<SearchItem> | null>(null);
  const searchBoxRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fuseRef.current = new Fuse(searchIndex, {
      keys: ['title'],
      threshold: 0.3,
    });

    return () => {
      fuseRef.current = null;
    };
  }, []);

  const filteredItems = useMemo(() => {
    if (!fuseRef.current) {
      return [];
    }

    return fuseRef.current
      .search(searchQuery)
      .map((item) => item.item)
      .slice(0, 10);
  }, [searchQuery]);

  const handleSearchChange = useCallback((_: SearchBoxChangeEvent, data: InputOnChangeData) => {
    setSearchQuery(data.value);
  }, []);

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setFocusedIndex((prev) => (prev === null ? 0 : Math.min(prev + 1, filteredItems.length - 1)));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setFocusedIndex((prev) => (prev === null ? 0 : Math.max(prev - 1, 0)));
    } else if (event.key === 'Enter' && focusedIndex !== null) {
      navigate(filteredItems[focusedIndex].url);
      setSearchQuery('');
      setFocusedIndex(null);
      searchBoxRef.current?.blur();
    }
  };

  useEffect(() => {
    setFocusedIndex(null);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setSearchQuery('');
        setFocusedIndex(null);
        searchBoxRef.current?.blur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <FluentSearchBox
        ref={searchBoxRef}
        value={searchQuery}
        onChange={handleSearchChange}
        appearance="filled-lighter"
        placeholder="Search"
        className={styles.searchBox}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocusedIndex(null)}
      />
      <ul className="z-50 absolute left-0 right-0 bg-white dark:bg-black rounded-b-lg">
        {filteredItems.map((item, index) => (
          <li key={index} role="presentation" tabIndex={0} className={focusedIndex === index ? 'bg-gray-100 dark:bg-gray-800' : ''}>
            <a
              onClick={() => {
                navigate(item.url);
                setSearchQuery('');
              }}
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <div className="flex items-center gap-1">
                <SearchRegular fontSize={20} />
                <span>{item.title}</span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchBox;
