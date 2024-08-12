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
  useTableSort,
} from '@fluentui/react-components';
import { MoreHorizontal20Regular } from '@fluentui/react-icons';
import React, { useEffect } from 'react';
import { useCatalogStore } from '../../stores/catalog';
import { SeismicEvent } from '../../types/event';

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
  const { events, fetchEvents, fetchNextEvents, hasNextEvents } = useCatalogStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const styles = useEventTableStyles();

  const {
    getRows,
    sort: { getSortDirection, toggleColumnSort, sort },
  } = useTableFeatures<Item>(
    {
      columns,
      items: events.map((event) => ({ ...event })),
    },
    [
      useTableSort({
        defaultSortState: { sortColumn: 'time', sortDirection: 'descending' },
      }),
    ]
  );

  const headerSortProps = (columnId: TableColumnId) => ({
    onClick: (e: React.MouseEvent) => toggleColumnSort(e, columnId),
    sortDirection: getSortDirection(columnId),
  });

  const rows = sort(getRows());

  return (
    <div className="p-2">
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
          {rows.map(({ item }) => (
            <TableRow key={item.id}>
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
    </div>
  );
};

export default EventTable;
