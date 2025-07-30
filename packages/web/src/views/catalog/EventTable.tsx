import {
  Button,
  createTableColumn,
  InputOnChangeData,
  makeStyles,
  SearchBox,
  SearchBoxChangeEvent,
  Select,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableColumnDefinition,
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
import {
  ArrowCounterclockwiseRegular,
  ChevronDoubleLeftRegular,
  ChevronDoubleRightRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
} from '@fluentui/react-icons';
import Fuse from 'fuse.js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CatalogDownload from '../../components/Catalog/CatalogDownload';
import EventTableFilter from '../../components/Catalog/EventTableFilter';
import EventTypeLabel from '../../components/Catalog/EventTypeLabel';
import Collaborators from '../../components/Common/Collaborators';
import { formatNumber, formatTime } from '../../shared/formatting';
import { useAppStore } from '../../stores/app';
import { FilterData, useCatalogStore } from '../../stores/catalog';
import { useEventDetailStore } from '../../stores/eventDetail';
import { useEventTypeStore } from '../../stores/eventType';
import { useOrganizationStore } from '../../stores/organization';
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

const EventTable = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { useUTC } = useAppStore();
  const {
    events,
    loading,
    filterData,
    hasNext,
    hasPrevious,
    itemsPerPage,
    currentPage,
    totalEvents,
    setItemsPerPage,
    fetchEvents,
    setFilterData,
    setCurrentPage,
  } = useCatalogStore();
  const { clearCache } = useEventDetailStore();
  const { eventTypes } = useEventTypeStore();
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
    fetchEvents().catch((error: CustomError) => {
      showErrorToast(error);
    });
    return () => {
      clearCache();
    };
  }, [fetchEvents, clearCache, showErrorToast]);

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
    sort: { sort },
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

  const handleFetchPreviousEvents = useCallback(() => {
    fetchEvents({ mode: 'previous' }).catch((error: CustomError) => {
      showErrorToast(error);
    });
  }, [fetchEvents, showErrorToast]);

  const handleFetchNextEvents = useCallback(() => {
    fetchEvents({ mode: 'next' }).catch((error: CustomError) => {
      showErrorToast(error);
    });
  }, [fetchEvents, showErrorToast]);

  const handleFetchFirstEvents = useCallback(() => {
    fetchEvents({ mode: 'first' }).catch((error: CustomError) => {
      showErrorToast(error);
    });
  }, [fetchEvents, showErrorToast]);

  const handleFetchLastEvents = useCallback(() => {
    fetchEvents({ mode: 'last' }).catch((error: CustomError) => {
      showErrorToast(error);
    });
  }, [fetchEvents, showErrorToast]);

  const [gotoPage, setGotoPage] = useState<number>(currentPage);

  const handleItemPerPageChange = useCallback(
    (value: string) => {
      const pageSize = parseInt(value, 10);
      setCurrentPage(1);
      setGotoPage(1);
      setItemsPerPage(pageSize);
      fetchEvents({ mode: 'first' }).catch((error: CustomError) => {
        showErrorToast(error);
      });
    },
    [setItemsPerPage, setCurrentPage, fetchEvents, showErrorToast]
  );

  const handleRefresh = useCallback(() => {
    fetchEvents().catch((error: CustomError) => {
      showErrorToast(error);
    });
  }, [fetchEvents, showErrorToast]);

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

  const previousCatalogIdRef = useRef<string>('');
  const { currentCatalog } = useCatalogStore();

  useEffect(() => {
    if (currentCatalog && !previousCatalogIdRef.current) {
      previousCatalogIdRef.current = currentCatalog.id;
    }
  }, [currentCatalog]);

  useEffect(() => {
    if (currentCatalog && previousCatalogIdRef.current) {
      if (previousCatalogIdRef.current !== currentCatalog.id) {
        fetchEvents({ mode: 'first' }).catch((error: CustomError) => {
          showErrorToast(error);
        });
      }
      previousCatalogIdRef.current = currentCatalog.id;
    }
  }, [currentCatalog, fetchEvents, showErrorToast]);

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-0 right-0 bottom-0 left-0 overflow-auto p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <SearchBox placeholder="Search events" className={styles.searchBox} value={searchQuery} onChange={handleSearchChange} />
          </div>
          <div className="flex items-center">
            <EventTableFilter eventTypes={eventTypes} initialEventTypes={filterData.eventTypes} onFilter={handleFilter} />

            <CatalogDownload />

            <Tooltip content={'Refresh'} relationship="label" showDelay={1500}>
              <Button
                appearance="transparent"
                icon={loading ? <Spinner size="extra-tiny" /> : <ArrowCounterclockwiseRegular fontSize={20} />}
                onClick={handleRefresh}
                disabled={loading}
              />
            </Tooltip>
          </div>
        </div>

        <Table aria-label="Event Table" className={styles.table} sortable>
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
            {rows.length ? (
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
        <div className="flex items-center justify-end gap-2 mt-2">
          <div className="flex items-center gap-2">
            <span>Items per page:</span>
            <Select appearance="outline" defaultValue={itemsPerPage} onChange={(_, data) => handleItemPerPageChange(data.value)}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span>
              Page {gotoPage.toString()} of {Math.ceil(totalEvents / itemsPerPage)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip content={'Go to first page'} relationship="label" showDelay={1500}>
              <Button size="medium" icon={<ChevronDoubleLeftRegular fontSize={16} />} onClick={handleFetchFirstEvents} />
            </Tooltip>
            <Tooltip content={'Go to previous page'} relationship="label" showDelay={1500}>
              <Button size="medium" icon={<ChevronLeftRegular fontSize={16} />} onClick={handleFetchPreviousEvents} disabled={!hasPrevious} />
            </Tooltip>
            <Tooltip content={'Go to next page'} relationship="label" showDelay={1500}>
              <Button size="medium" icon={<ChevronRightRegular fontSize={16} />} onClick={handleFetchNextEvents} disabled={!hasNext} />
            </Tooltip>
            <Tooltip content={'Go to last page'} relationship="label" showDelay={1500}>
              <Button size="medium" icon={<ChevronDoubleRightRegular fontSize={16} />} onClick={handleFetchLastEvents} />
            </Tooltip>
          </div>
        </div>
        <EventDetailDrawer isVisible={!!eventId}>
          <EventDetail />
        </EventDetailDrawer>
      </div>
      <Toaster toasterId={toasterId} />
    </div>
  );
};

export default EventTable;
