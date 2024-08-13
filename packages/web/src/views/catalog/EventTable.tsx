import {
  Avatar,
  Button,
  createTableColumn,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableColumnDefinition,
  TableColumnId,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Tooltip,
  useTableFeatures,
  useTableSelection,
  useTableSort,
} from '@fluentui/react-components';
import { MoreHorizontal20Regular } from '@fluentui/react-icons';
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCatalogStore } from '../../stores/catalog';
import { SeismicEvent } from '../../types/event';
import EventDetail from './EventDetail';
import EventDetailDrawer from './EventDetailDrawer';

const useEventTableStyles = makeStyles({
  table: {
    tableLayout: 'auto',
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

const EventTable = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { events, fetchEvents, fetchNextEvents, hasNextEvents } = useCatalogStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const styles = useEventTableStyles();

  const {
    getRows,
    sort: { getSortDirection, toggleColumnSort, sort },
    selection: { toggleRow, isRowSelected },
  } = useTableFeatures<Item>(
    {
      columns,
      items: events.map((event) => ({ ...event })),
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

  const headerSortProps = (columnId: TableColumnId) => ({
    onClick: (e: React.MouseEvent) => toggleColumnSort(e, columnId),
    sortDirection: getSortDirection(columnId),
  });

  const rows = sort(
    getRows((row) => {
      const selected = isRowSelected(row.rowId);
      return {
        ...row,
        onClick: (e: React.MouseEvent) => {
          toggleRow(e, row.rowId);
          navigate(`/catalog/events/${row.item.id}/summary`);
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
    <div className="p-2 relative h-full">
      <Table aria-label="Event Table" className={styles.table} sortable>
        <TableHeader>
          <TableRow>
            <TableHeaderCell {...headerSortProps('time')}>Time</TableHeaderCell>
            <TableHeaderCell>Duration (s)</TableHeaderCell>
            <TableHeaderCell>Type</TableHeaderCell>
            <TableHeaderCell>Amplitude</TableHeaderCell>
            <TableHeaderCell>Magnitude</TableHeaderCell>
            <TableHeaderCell>Author</TableHeaderCell>
            <TableHeaderCell>Evaluation Mode</TableHeaderCell>
            <TableHeaderCell>Evaluation Status</TableHeaderCell>
            <TableHeaderCell></TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ item, onClick, onKeyDown, selected, appearance }) => (
            <TableRow key={item.id} onClick={onClick} onKeyDown={onKeyDown} aria-selected={selected} appearance={appearance}>
              <TableCell>{item.time}</TableCell>
              <TableCell>{item.duration}</TableCell>
              <TableCell>{item.type.code}</TableCell>
              <TableCell>{item.preferred_amplitude?.amplitude}</TableCell>
              <TableCell>{item.preferred_magnitude?.magnitude}</TableCell>
              <TableCell>
                <TableCellLayout
                  media={
                    <Tooltip content={item.author.name} relationship="label">
                      <Avatar aria-label={item.author.name} name={item.author.name} color="colorful" image={{ src: item.author.avatar }} />
                    </Tooltip>
                  }
                />
              </TableCell>
              <TableCell>{item.evaluation_mode}</TableCell>
              <TableCell>{item.evaluation_status}</TableCell>
              <TableCell>
                <Button icon={<MoreHorizontal20Regular />} appearance="transparent" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {hasNextEvents() && (
        <div className="flex justify-center mt-2">
          <Button appearance="transparent" onClick={fetchNextEvents}>
            Load more
          </Button>
        </div>
      )}
      {eventId && (
        <EventDetailDrawer>
          <EventDetail />
        </EventDetailDrawer>
      )}
    </div>
  );
};

export default EventTable;
