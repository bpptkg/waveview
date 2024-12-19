import {
  Button,
  InputOnChangeData,
  makeStyles,
  SearchBox,
  SearchBoxChangeEvent,
  Table,
  TableBody,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Tooltip,
} from '@fluentui/react-components';
import { ArrowLeft20Regular, Checkmark16Regular } from '@fluentui/react-icons';
import { formatDistanceToNow } from 'date-fns';
import Fuse from 'fuse.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import KeyValuePair from '../../components/Common/KeyValuePair';
import EventDetailErrorMessage from '../../components/Loading/EventDetailErrorMessage';
import EventDetailLoadingIndicator from '../../components/Loading/EventDetailLoadingIndicator';
import { formatNumber } from '../../shared/formatting';
import { useAppStore } from '../../stores/app';
import { useEventDetailStore } from '../../stores/eventDetail';
import { Magnitude } from '../../types/event';

const useEventDetailMagnitudeStyles = makeStyles({
  table: {
    tableLayout: 'auto',
  },
});

const MagnitudeDetail: React.FC<{ currentMagnitude: Magnitude }> = ({ currentMagnitude }) => {
  const items = [
    { label: 'ID', value: currentMagnitude.id },
    { label: 'Type', value: currentMagnitude.type },
    { label: 'Magnitude', value: formatNumber(currentMagnitude.magnitude, { precision: 2 }) },
    { label: 'Method', value: currentMagnitude.method },
    { label: 'Station count', value: currentMagnitude.station_count },
    { label: 'Azimuthal gap', value: formatNumber(currentMagnitude.azimuthal_gap, { unit: '°', precision: 5 }) },
    { label: 'Evaluation status', value: currentMagnitude.evaluation_status },
    { label: 'Is preferred', value: currentMagnitude.is_preferred ? 'yes' : 'no' },
    {
      label: 'Last updated',
      value: (
        <Tooltip content={currentMagnitude.updated_at} relationship="label">
          <span>{formatDistanceToNow(new Date(currentMagnitude.updated_at), { addSuffix: true })}</span>
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      {items.map((item, index) => (
        <KeyValuePair key={index} label={item.label} value={item.value} />
      ))}
    </div>
  );
};

const EventDetailMagnitude = () => {
  const { eventId } = useParams();
  const { loading, event, error, fetchEvent, hasEventId } = useEventDetailStore();
  const styles = useEventDetailMagnitudeStyles();
  const [currentMagnitude, setCurrentMagnitude] = useState<Magnitude | null>(null);
  const fuseRef = useRef<Fuse<Magnitude> | null>(null);
  const searchBoxRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const searchableMagnitude = useMemo(() => event?.magnitudes ?? [], [event]);
  const magnitudes = useMemo(() => {
    if (!fuseRef.current || !searchQuery) {
      return searchableMagnitude;
    }

    return fuseRef.current
      .search(searchQuery)
      .map((result) => result.item)
      .slice(0, 10);
  }, [searchQuery, searchableMagnitude]);
  const handleSearchChange = useCallback((_: SearchBoxChangeEvent, data: InputOnChangeData) => {
    setSearchQuery(data.value);
  }, []);

  useEffect(() => {
    fuseRef.current = new Fuse(searchableMagnitude, {
      keys: ['type', 'magnitude', 'method', 'station_count', 'evaluation_status'],
      threshold: 0.3,
    });

    return () => {
      fuseRef.current = null;
    };
  }, [searchableMagnitude]);

  useEffect(() => {
    if (eventId && !hasEventId(eventId)) {
      fetchEvent(eventId);
    }
  }, [eventId, fetchEvent, hasEventId]);

  const { darkMode } = useAppStore();
  const appearance = useMemo(() => {
    return darkMode ? 'filled-lighter' : 'filled-darker';
  }, [darkMode]);

  if (loading) {
    return <EventDetailLoadingIndicator message="Loading event details..." />;
  }

  if (error) {
    return <EventDetailErrorMessage message={error} onRetry={() => fetchEvent(eventId!)} />;
  }

  return (
    <div className="p-2 flex flex-col gap-2 mr-2">
      {currentMagnitude && (
        <div className="flex items-center justify-start">
          <div className="flex items-center">
            <Button
              icon={<ArrowLeft20Regular />}
              appearance="transparent"
              onClick={() => {
                setCurrentMagnitude(null);
              }}
            />
          </div>
        </div>
      )}
      {currentMagnitude ? (
        <div className="flex flex-col gap-2">
          <div className="font-semibold">Magnitude Detail</div>
          <MagnitudeDetail currentMagnitude={currentMagnitude} />
        </div>
      ) : (
        <div>
          <div>
            <SearchBox ref={searchBoxRef} value={searchQuery} onChange={handleSearchChange} appearance={appearance} placeholder="Search" />
          </div>
          <Table className={styles.table}>
            <TableHeader>
              <TableRow>
                <TableHeaderCell></TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Magnitude</TableHeaderCell>
                <TableHeaderCell>Method</TableHeaderCell>
                <TableHeaderCell>Station Count</TableHeaderCell>
                <TableHeaderCell>Evaluation Status</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {magnitudes.length > 0 ? (
                magnitudes.map((magnitude) => (
                  <TableRow
                    key={magnitude.id}
                    onClick={() => {
                      setCurrentMagnitude(magnitude);
                    }}
                  >
                    <TableHeaderCell>{magnitude.is_preferred ? <Checkmark16Regular /> : null}</TableHeaderCell>
                    <TableHeaderCell>{magnitude.type}</TableHeaderCell>
                    <TableHeaderCell>{formatNumber(magnitude.magnitude, { precision: 2 })}</TableHeaderCell>
                    <TableHeaderCell>{magnitude.method}</TableHeaderCell>
                    <TableHeaderCell>{magnitude.station_count}</TableHeaderCell>
                    <TableHeaderCell>{magnitude.evaluation_status}</TableHeaderCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableHeaderCell colSpan={6}>
                    <span className="text-center w-full">No magnitudes available</span>
                  </TableHeaderCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default EventDetailMagnitude;
