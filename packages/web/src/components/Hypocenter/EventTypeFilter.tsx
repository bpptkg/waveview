import { Button, Checkbox, makeStyles, Popover, PopoverSurface, PopoverTrigger, Tooltip } from '@fluentui/react-components';
import { CalendarAgendaRegular } from '@fluentui/react-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { EventType } from '../../types/event';

export interface EventTypeFilterProps {
  eventTypes?: EventType[];
  selected?: string[];
  onChange?: (types: string[]) => void;
}

const useStyles = makeStyles({
  popoverSurface: {
    padding: '8px',
    borderRadius: '16px',
  },
});

const EventTypeFilter: React.FC<EventTypeFilterProps> = ({ eventTypes = [], selected = [], onChange }) => {
  const styles = useStyles();
  const [open, setOpen] = useState<boolean>(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(selected);

  useEffect(() => {
    setSelectedTypes(selected);
  }, [selected]);

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

  const handleApply = useCallback(() => {
    onChange?.(selectedTypes);
    setOpen(false);
  }, [selectedTypes, onChange]);

  return (
    <Popover trapFocus open={open} onOpenChange={() => setOpen(!open)}>
      <PopoverTrigger disableButtonEnhancement>
        <Tooltip content={'Filter by event type'} relationship="label" showDelay={1500}>
          <Button appearance="transparent" aria-label="Filter by event" icon={<CalendarAgendaRegular fontSize={20} />} />
        </Tooltip>
      </PopoverTrigger>
      <PopoverSurface className={styles.popoverSurface}>
        <div className="p-2 text-md font-semibold">Filter by Event Type</div>
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-1">
            {eventTypes.map((item) => (
              <Checkbox key={item.id} checked={selectedTypes.includes(item.code)} label={item.code} onChange={() => handleSelect(item.code)}></Checkbox>
            ))}
          </div>
          <div className="flex items-center justify-end">
            <Button appearance="primary" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverSurface>
    </Popover>
  );
};

export default EventTypeFilter;
