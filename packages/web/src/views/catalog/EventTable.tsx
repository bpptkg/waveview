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
import React, { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EventTypeLabel from '../../components/Catalog/EventTypeLabel';
import { formatNumber, formatTime } from '../../shared/formatting';
import { useAppStore } from '../../stores/app';
import { useCatalogStore } from '../../stores/catalog';
import { useEventDetailStore } from '../../stores/eventDetail';
import { SeismicEvent } from '../../types/event';
import EventDetail from './EventDetail';
import EventDetailDrawer from './EventDetailDrawer';

const useEventTableStyles = makeStyles({
  table: {
    tableLayout: 'auto',
  },
  emptyColumn: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
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
  const { useUTC } = useAppStore();
  const { events, loading, fetchEvents, fetchNextEvents, hasNextEvents } = useCatalogStore();
  const { clearCache } = useEventDetailStore();

  useEffect(() => {
    fetchEvents();

    return () => {
      clearCache();
    };
  }, [fetchEvents, clearCache]);

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

  const handleFetchNextEvents = useCallback(() => {
    fetchNextEvents();
  }, [fetchNextEvents]);

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-0 right-0 bottom-0 left-0 overflow-auto p-2">
        <Table aria-label="Event Table" className={styles.table} sortable>
          <TableHeader>
            <TableRow>
              <TableHeaderCell {...headerSortProps('time')}>Time</TableHeaderCell>
              <TableHeaderCell>Duration</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Amplitude</TableHeaderCell>
              <TableHeaderCell>Magnitude</TableHeaderCell>
              <TableHeaderCell>Latitude</TableHeaderCell>
              <TableHeaderCell>Longitude</TableHeaderCell>
              <TableHeaderCell>Depth</TableHeaderCell>
              <TableHeaderCell>Evaluation Mode</TableHeaderCell>
              <TableHeaderCell>Evaluation Status</TableHeaderCell>
              <TableHeaderCell>Author</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map(({ item, onClick, onKeyDown, selected, appearance }) => (
                <TableRow key={item.id} onClick={onClick} onKeyDown={onKeyDown} aria-selected={selected} appearance={appearance}>
                  <TableCell>{formatTime(item.time, { useUTC })}</TableCell>
                  <TableCell>{formatNumber(item.duration, { unit: ' sec', precision: 2 })}</TableCell>
                  <TableCell>
                    <EventTypeLabel eventType={item.type} />
                  </TableCell>
                  <TableCell>{formatNumber(item.preferred_amplitude?.amplitude, { unit: item.preferred_amplitude?.unit, precision: 2 })}</TableCell>
                  <TableCell>{formatNumber(item.preferred_magnitude?.magnitude, { precision: 2 })}</TableCell>
                  <TableCell>{formatNumber(item.preferred_origin?.latitude, { unit: '°', precision: 5 })}</TableCell>
                  <TableCell>{formatNumber(item.preferred_origin?.longitude, { unit: '°', precision: 5 })}</TableCell>
                  <TableCell>{formatNumber(item.preferred_origin?.depth, { unit: ' km', precision: 2 })}</TableCell>
                  <TableCell>{item.evaluation_mode}</TableCell>
                  <TableCell>{item.evaluation_status}</TableCell>
                  <TableCell>
                    <TableCellLayout
                      media={
                        <Tooltip content={item.author.name} relationship="label">
                          <Avatar aria-label={item.author.name} name={item.author.name} color="colorful" image={{ src: item.author.avatar }} />
                        </Tooltip>
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableHeaderCell colSpan={11}>
                  <span className="text-center w-full">No events found</span>
                </TableHeaderCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {hasNextEvents() && (
          <div className="flex justify-center mt-2">
            <Button appearance="transparent" onClick={handleFetchNextEvents}>
              {loading ? 'Loading...' : 'Load more'}
            </Button>
          </div>
        )}
        {eventId && (
          <EventDetailDrawer>
            <EventDetail />
          </EventDetailDrawer>
        )}
      </div>
    </div>
  );
};

export default EventTable;
