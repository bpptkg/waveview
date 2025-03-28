import { Button, Checkbox, Field, makeStyles, Popover, PopoverSurface, PopoverTrigger, Select, Tooltip } from '@fluentui/react-components';
import { DismissRegular, FilterRegular } from '@fluentui/react-icons';
import { useCallback, useState } from 'react';
import { OrderingType } from '../../stores/catalog';
import { EventType } from '../../types/event';
import DatePicker from '../DatePicker/DatePicker';

interface EventTableFilterData {
  eventTypes?: string[];
  startDate?: number;
  endDate?: number;
  isBookmarked?: boolean;
  ordering?: OrderingType;
}

export interface EventTableFilterProps {
  eventTypes?: EventType[];
  initialEventTypes?: string[];
  onFilter?: (data: EventTableFilterData) => void;
}

const useEventTableFilterStyles = makeStyles({
  popoverSurface: {
    maxHeight: 'calc(100vh - 100px)',
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
  const [ordering, setOrdering] = useState<OrderingType>('desc');

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

  const handleOrderingChange = useCallback((value: string) => setOrdering(value as OrderingType), []);

  const handleApply = useCallback(() => {
    const data: EventTableFilterData = {
      eventTypes: selectedTypes,
      startDate,
      endDate,
      isBookmarked,
      ordering,
    };
    onFilter?.(data);
    setOpen(false);
  }, [onFilter, selectedTypes, startDate, endDate, isBookmarked, ordering]);

  const handleReset = useCallback(() => {
    setSelectedTypes([]);
    setStartDate(undefined);
    setEndDate(undefined);
    setIsBookmarked(false);
  }, []);

  return (
    <Popover trapFocus open={open} onOpenChange={() => setOpen(!open)} positioning="before-top">
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
          <Field label={'Sort By'}>
            <Select appearance="outline" defaultValue={ordering} onChange={(_, data) => handleOrderingChange(data.value)}>
              <option value="asc">Oldest First</option>
              <option value="desc">Newest First</option>
            </Select>
          </Field>
        </div>
        <div className="mt-1">
          <p>Event types</p>
          <Checkbox checked={selectedTypes.length === eventTypes.length} label={'All'} onChange={() => handleSelectAll()}></Checkbox>
          <div className="grid grid-cols-3 gap-0">
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
