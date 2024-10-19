import {
  Avatar,
  Button,
  createTableColumn,
  InputOnChangeData,
  makeStyles,
  SearchBox,
  SearchBoxChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableColumnDefinition,
  TableColumnId,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Toast,
  Toaster,
  ToastTitle,
  Tooltip,
  useId,
  useTableFeatures,
  useTableSelection,
  useTableSort,
  useToastController,
} from '@fluentui/react-components';
import { ArrowCounterclockwiseRegular, ArrowDownloadRegular } from '@fluentui/react-icons';
import Fuse from 'fuse.js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EventTableFilter from '../../components/Catalog/EventTableFilter';
import EventTypeLabel from '../../components/Catalog/EventTypeLabel';
import { formatNumber, formatTime } from '../../shared/formatting';
import { useAppStore } from '../../stores/app';
import { FilterData, useCatalogStore } from '../../stores/catalog';
import { useEventDetailStore } from '../../stores/eventDetail';
import { useEventTypeStore } from '../../stores/eventType';
import { useOrganizationStore } from '../../stores/organization';
import { useUserStore } from '../../stores/user';
import { useVolcanoStore } from '../../stores/volcano/useVolcanoStore';
import { SeismicEvent } from '../../types/event';
import { CustomError } from '../../types/response';
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
  searchBox: {
    width: '250px',
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
  const { events, loading, filterData, initialFetch, fetchEvents, fetchNextEvents, hasNextEvents, setFilterData, setInitialFetch } = useCatalogStore();
  const { clearCache } = useEventDetailStore();
  const { eventTypes } = useEventTypeStore();
  const { hasPermission } = useUserStore();
  const { currentOrganization } = useOrganizationStore();
  const { currentVolcano } = useVolcanoStore();

  const toasterId = useId('event-table');
  const { dispatchToast } = useToastController(toasterId);

  const showErrorToast = useCallback(
    (error: CustomError) => {
      dispatchToast(
        <Toast>
          <ToastTitle>{error.message}</ToastTitle>
        </Toast>,
        { intent: 'error' }
      );
    },
    [dispatchToast]
  );

  useEffect(() => {
    if (!initialFetch) {
      fetchEvents().catch((error: CustomError) => {
        showErrorToast(error);
      });
      setInitialFetch(true);
    }

    return () => {
      clearCache();
    };
  }, [initialFetch, setInitialFetch, fetchEvents, clearCache, showErrorToast]);

  const styles = useEventTableStyles();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const fuseRef = useRef<Fuse<Item> | null>(null);

  useEffect(() => {
    fuseRef.current = new Fuse(
      events.map((e) => ({ ...e, formattedTime: formatTime(e.time, { useUTC }) })),
      {
        keys: [
          'time',
          'formattedTime',
          'type.code',
          'preferred_amplitude.amplitude',
          'preferred_magnitude.magnitude',
          'preferred_origin.latitude',
          'preferred_origin.longitude',
          'preferred_origin.depth',
          'evaluation_mode',
          'evaluation_status',
          'author.name',
          'author.username',
        ],
        threshold: 0.3,
      }
    );

    return () => {
      fuseRef.current = null;
    };
  }, [events, useUTC]);

  const handleSearchChange = useCallback((_: SearchBoxChangeEvent, data: InputOnChangeData) => {
    setSearchQuery(data.value);
  }, []);

  const filterableEvents = useMemo(() => {
    if (!searchQuery || !fuseRef.current) {
      return events;
    }

    return searchQuery ? fuseRef.current.search(searchQuery).map((item) => item.item) : events;
  }, [searchQuery, events]);

  const {
    getRows,
    sort: { getSortDirection, toggleColumnSort, sort },
    selection: { toggleRow, isRowSelected },
  } = useTableFeatures<Item>(
    {
      columns,
      items: filterableEvents.map((event) => ({ ...event })),
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
          navigate(`/${currentOrganization?.slug}/${currentVolcano?.slug}/catalog/events/${row.item.id}/summary`);
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
    fetchNextEvents().catch((error: CustomError) => {
      showErrorToast(error);
    });
  }, [fetchNextEvents, showErrorToast]);

  const handleRefresh = useCallback(() => {
    fetchEvents().catch((error: CustomError) => {
      showErrorToast(error);
    });
  }, [fetchEvents, showErrorToast]);

  const handleDownload = useCallback(() => {
    if (!hasPermission('event:download')) {
      showErrorToast(new CustomError('You do not have permission to download events.'));
      return;
    }

    const header =
      [
        'Time (UTC)',
        'Duration (s)',
        'Type',
        'Amplitude (mm)',
        'Magnitude',
        'Latitude (°)',
        'Longitude (°)',
        'Depth (km)',
        'Method',
        'Evaluation Mode',
        'Evaluation Status',
        'Author',
      ].join(',') + '\n';

    const content =
      'data:text/csv;charset=utf-8,' +
      header +
      rows
        .map((row) =>
          [
            row.item.time,
            row.item.duration,
            row.item.type.code,
            row.item.preferred_amplitude?.amplitude,
            row.item.preferred_magnitude?.magnitude,
            row.item.preferred_origin?.latitude,
            row.item.preferred_origin?.longitude,
            row.item.preferred_origin?.depth,
            row.item.method,
            row.item.evaluation_mode,
            row.item.evaluation_status,
            row.item.author.name || row.item.author.username,
          ].join(',')
        )
        .join('\n');

    const encodedUri = encodeURI(content);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'events.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [rows, showErrorToast, hasPermission]);

  const handleFilter = useCallback(
    (data: FilterData) => {
      setFilterData(data);
      setSearchQuery('');
      fetchEvents().catch((error: CustomError) => {
        showErrorToast(error);
      });
    },
    [fetchEvents, setFilterData, showErrorToast]
  );

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-0 right-0 bottom-0 left-0 overflow-auto p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <SearchBox placeholder="Search events" className={styles.searchBox} value={searchQuery} onChange={handleSearchChange} />
          </div>
          <div className="flex items-center">
            <EventTableFilter eventTypes={eventTypes} initialEventTypes={filterData.eventTypes} onFilter={handleFilter} />

            <Tooltip content={'Download'} relationship="label" showDelay={1500}>
              <Button appearance="transparent" icon={<ArrowDownloadRegular fontSize={20} />} onClick={handleDownload} />
            </Tooltip>
            <Tooltip content={'Refresh'} relationship="label" showDelay={1500}>
              <Button appearance="transparent" icon={<ArrowCounterclockwiseRegular fontSize={20} />} onClick={handleRefresh} />
            </Tooltip>
          </div>
        </div>

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
              <TableHeaderCell>Method</TableHeaderCell>
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
                  <TableCell>{formatNumber(item.preferred_amplitude?.amplitude, { unit: ` ${item.preferred_amplitude?.unit}`, precision: 2 })}</TableCell>
                  <TableCell>{formatNumber(item.preferred_magnitude?.magnitude, { precision: 2 })}</TableCell>
                  <TableCell>{formatNumber(item.preferred_origin?.latitude, { unit: '°', precision: 5 })}</TableCell>
                  <TableCell>{formatNumber(item.preferred_origin?.longitude, { unit: '°', precision: 5 })}</TableCell>
                  <TableCell>{formatNumber(item.preferred_origin?.depth, { unit: ' km', precision: 2 })}</TableCell>
                  <TableCell>{item.method}</TableCell>
                  <TableCell>{item.evaluation_mode}</TableCell>
                  <TableCell>{item.evaluation_status}</TableCell>
                  <TableCell>
                    <TableCellLayout
                      media={
                        <Tooltip content={item.author.name || item.author.username} relationship="label">
                          <Avatar aria-label={item.author.name} name={item.author.name} color="colorful" image={{ src: item.author.avatar }} />
                        </Tooltip>
                      }
                    />
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
        {hasNextEvents() && (
          <div className="flex justify-center mt-2">
            <Button appearance="transparent" onClick={handleFetchNextEvents}>
              {loading ? 'Loading...' : 'Load more'}
            </Button>
          </div>
        )}
        <EventDetailDrawer isVisible={!!eventId}>
          <EventDetail />
        </EventDetailDrawer>
      </div>
      <Toaster toasterId={toasterId} />
    </div>
  );
};

export default EventTable;
