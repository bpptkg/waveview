import { Button, Checkbox, Field, makeStyles, Popover, PopoverSurface, PopoverTrigger, Tooltip } from '@fluentui/react-components';
import { DismissRegular, FilterRegular } from '@fluentui/react-icons';
import { useCallback, useState } from 'react';
import { EventType } from '../../types/event';
import DatePicker from '../DatePicker/DatePicker';

interface EventTableFilterData {
  eventTypes?: string[];
  startDate?: number;
  endDate?: number;
  isBookmarked?: boolean;
}

export interface EventTableFilterProps {
  eventTypes?: EventType[];
  initialEventTypes?: string[];
  onFilter?: (data: EventTableFilterData) => void;
}

const useEventTableFilterStyles = makeStyles({
  popoverSurface: {
    maxHeight: '500px',
    overflowY: 'auto',
    borderRadius: '16px',
  },
});

const EventTableFilter: React.FC<EventTableFilterProps> = ({ eventTypes = [], initialEventTypes, onFilter }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialEventTypes ? initialEventTypes : eventTypes.map((item) => item.code));
  const [startDate, setStartDate] = useState<number | undefined>();
  const [endDate, setEndDate] = useState<number | undefined>();
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const styles = useEventTableFilterStyles();

  const handleSelect = useCallback(
    (code: string) => {
      if (selectedTypes.includes(code)) {
        setSelectedTypes(selectedTypes.filter((item) => item !== code));
      } else {
        setSelectedTypes([...selectedTypes, code]);
      }
    },
    [selectedTypes]
  );

  const handleSelectAll = useCallback(() => {
    if (selectedTypes.length === eventTypes.length) {
      setSelectedTypes([]);
    } else {
      setSelectedTypes(eventTypes.map((item) => item.code));
    }
  }, [selectedTypes, eventTypes]);

  const handleStartDateChange = useCallback((date: number) => setStartDate(date), []);

  const handleEndDateChange = useCallback((date: number) => setEndDate(date), []);

  const handleApply = useCallback(() => {
    const data: EventTableFilterData = {
      eventTypes: selectedTypes,
      startDate,
      endDate,
      isBookmarked,
    };
    onFilter?.(data);
    setOpen(false);
  }, [onFilter, selectedTypes, startDate, endDate, isBookmarked]);

  const handleReset = useCallback(() => {
    setSelectedTypes([]);
    setStartDate(undefined);
    setEndDate(undefined);
    setIsBookmarked(false);
  }, []);

  return (
    <Popover trapFocus open={open} onOpenChange={() => setOpen(!open)}>
      <PopoverTrigger>
        <Tooltip content={'Filter'} relationship="label" showDelay={1500}>
          <Button appearance="transparent" icon={<FilterRegular fontSize={20} />} />
        </Tooltip>
      </PopoverTrigger>
      <PopoverSurface className={styles.popoverSurface}>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-md">Filter Events</span>
          <Button appearance="transparent" onClick={() => setOpen(false)} icon={<DismissRegular />} />
        </div>
        <div>
          <Field label={'Start date'}>
            <DatePicker selected={startDate} onChange={handleStartDateChange} />
          </Field>
          <Field label={'End date'}>
            <DatePicker selected={endDate} onChange={handleEndDateChange} />
          </Field>
        </div>
        <div className="mt-1">
          <p>Event types</p>
          <Checkbox checked={selectedTypes.length === eventTypes.length} label={'All'} onChange={() => handleSelectAll()}></Checkbox>
          <div className="grid grid-cols-2 gap-0">
            {eventTypes.map((item) => (
              <Checkbox key={item.id} checked={selectedTypes.includes(item.code)} label={item.code} onChange={() => handleSelect(item.code)}></Checkbox>
            ))}
          </div>
        </div>
        <div className="mt-1">
          <Field label={'Bookmark'}>
            <Checkbox checked={isBookmarked} label={'Bookmarked only'} onChange={() => setIsBookmarked(!isBookmarked)} />
          </Field>
        </div>
        <div className="flex items-center justify-end mt-2 gap-2">
          <Button appearance="secondary" onClick={handleReset}>
            Reset
          </Button>
          <Button appearance="primary" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </PopoverSurface>
    </Popover>
  );
};

export default EventTableFilter;
