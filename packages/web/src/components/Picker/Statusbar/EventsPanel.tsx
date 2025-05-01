import {
  Button,
  createTableColumn,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableColumnDefinition,
  TableHeader,
  TableHeaderCell,
  TableRow,
  useTableFeatures,
  useTableSelection,
  useTableSort,
} from '@fluentui/react-components';
import { ChevronDownRegular } from '@fluentui/react-icons';
import classNames from 'classnames';
import { useState } from 'react';
import { formatNumber, formatTime } from '../../../shared/formatting';
import { useAppStore } from '../../../stores/app';
import { usePickerStore } from '../../../stores/picker';
import { SeismicEvent } from '../../../types/event';
import EventTypeLabel from '../../Catalog/EventTypeLabel';
import Collaborators from '../../Common/Collaborators';
import { usePickerCallback } from '../usePickerCallback';

const useTableStyles = makeStyles({
  table: {
    tableLayout: 'auto',
  },
  tableRow: {
    cursor: 'pointer',
  },
});

type Item = SeismicEvent;

const columns: TableColumnDefinition<Item>[] = [
  createTableColumn<Item>({
    columnId: 'time',
    compare: (a, b) => {
      return new Date(a.time).getTime() - new Date(b.time).getTime();
    },
  }),
  createTableColumn<Item>({
    columnId: 'duration',
    compare: (a, b) => {
      return a.duration - b.duration;
    },
  }),
];

const EventsPanel = () => {
  const [open, setOpen] = useState(true);
  const styles = useTableStyles();

  const { eventMarkers } = usePickerStore();
  const { useUTC } = useAppStore();

  const { handleEditEvent } = usePickerCallback();

  const {
    getRows,
    sort: { sort },
    selection: { toggleRow, isRowSelected },
  } = useTableFeatures<Item>(
    {
      columns,
      items: eventMarkers,
    },
    [
      useTableSort({
        defaultSortState: { sortColumn: 'time', sortDirection: 'descending' },
      }),
      useTableSelection({
        selectionMode: 'single',
      }),
    ]
  );

  const rows = sort(
    getRows((row) => {
      const selected = isRowSelected(row.rowId);
      return {
        ...row,
        onClick: (e: React.MouseEvent) => {
          toggleRow(e, row.rowId);
          handleEditEvent(row.item);
        },
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === ' ') {
            e.preventDefault();
            toggleRow(e, row.rowId);
          }
        },
        selected,
        appearance: selected ? ('brand' as const) : ('none' as const),
      };
    })
  );

  return (
    <div>
      <div
        className={classNames(
          `absolute right-0 bottom-[20px] h-[300px] left-0 rounded-t-lg border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-grey-6`,
          open ? 'block' : 'hidden'
        )}
      >
        <div className="flex items-center justify-between px-2 h-[40px] border-b dark:border-b-gray-800">
          <div className="font-semibold">Events</div>
          <Button icon={<ChevronDownRegular />} appearance="transparent" onClick={() => setOpen(!open)} className="ml-auto" />
        </div>
        <div className="p-2 overflow-auto h-[calc(100%-40px)]">
          <Table aria-label="Events" className={styles.table}>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Time</TableHeaderCell>
                <TableHeaderCell>Duration</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Amplitude</TableHeaderCell>
                <TableHeaderCell>Magnitude</TableHeaderCell>
                <TableHeaderCell>Latitude</TableHeaderCell>
                <TableHeaderCell>Longitude</TableHeaderCell>
                <TableHeaderCell>Depth</TableHeaderCell>
                <TableHeaderCell>Method</TableHeaderCell>
                <TableHeaderCell>Mode</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Collaborators</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length > 0 ? (
                rows.map(({ item, onClick, onKeyDown, selected, appearance }) => (
                  <TableRow key={item.id} onClick={onClick} onKeyDown={onKeyDown} aria-selected={selected} appearance={appearance} className={styles.tableRow}>
                    <TableCell>{formatTime(item.time, { useUTC })}</TableCell>
                    <TableCell>{formatNumber(item.duration, { unit: ' sec', precision: 2 })}</TableCell>
                    <TableCell>
                      <EventTypeLabel eventType={item.type} />
                    </TableCell>
                    <TableCell>{formatNumber(item.preferred_amplitude?.amplitude, { unit: ` ${item.preferred_amplitude?.unit}`, precision: 2 })}</TableCell>
                    <TableCell>{formatNumber(item.preferred_magnitude?.magnitude, { precision: 2 })}</TableCell>
                    <TableCell>{formatNumber(item.preferred_origin?.latitude, { unit: '°', precision: 5 })}</TableCell>
                    <TableCell>{formatNumber(item.preferred_origin?.longitude, { unit: '°', precision: 5 })}</TableCell>
                    <TableCell>{formatNumber(item.preferred_origin?.depth, { unit: ' km', precision: 2 })}</TableCell>
                    <TableCell>{item.method}</TableCell>
                    <TableCell>{item.evaluation_mode}</TableCell>
                    <TableCell>{item.evaluation_status}</TableCell>
                    <TableCell>
                      <TableCellLayout media={<Collaborators collaborators={item.collaborators} enableShowAll={false} avatarSize={24} maxShown={3} />} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableHeaderCell colSpan={12}>
                    <span className="text-center w-full">No events found</span>
                  </TableHeaderCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <button className="flex items-center gap-1 hover:bg-neutral-grey-90 dark:hover:bg-neutral-grey-16 px-1 h-[20px]" onClick={() => setOpen(!open)}>
        <span className="text-xs dark:text-neutral-grey-84">Events</span>
      </button>
    </div>
  );
};

export default EventsPanel;
