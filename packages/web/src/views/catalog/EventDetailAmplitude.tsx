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
import { formatNumber, formatTime } from '../../shared/formatting';
import { useAppStore } from '../../stores/app';
import { useEventDetailStore } from '../../stores/eventDetail';
import { useInventoryStore } from '../../stores/inventory';
import { Amplitude } from '../../types/event';

const useEventDetailAmplitudeStyles = makeStyles({
  table: {
    tableLayout: 'auto',
  },
});

const AmplitudeDetail: React.FC<{ currentAmplitude: Amplitude; useUTC: boolean }> = ({ currentAmplitude, useUTC }) => {
  const { getChannelById } = useInventoryStore();

  const items = [
    { label: 'ID', value: currentAmplitude.id },
    { label: 'Type', value: currentAmplitude.type },
    { label: 'Amplitude', value: formatNumber(currentAmplitude.amplitude, { unit: ` ${currentAmplitude.unit}`, precision: 2 }) },
    { label: 'Category', value: currentAmplitude.category },
    { label: 'Time', value: formatTime(currentAmplitude.time, { useUTC }) },
    { label: 'Begin', value: formatNumber(currentAmplitude.begin, { unit: ' sec', precision: 2 }) },
    { label: 'End', value: formatNumber(currentAmplitude.end, { unit: ' sec', precision: 2 }) },
    { label: 'Duration', value: formatNumber(currentAmplitude.duration, { unit: ' sec', precision: 2 }) },
    { label: 'SNR', value: currentAmplitude.snr },
    { label: 'Unit', value: currentAmplitude.unit },
    { label: 'Stream ID', value: getChannelById(currentAmplitude.waveform_id)?.stream_id },
    { label: 'Label', value: currentAmplitude.label ?? 'none' },
    { label: 'Method', value: currentAmplitude.method },
    { label: 'Evaluation Mode', value: currentAmplitude.evaluation_mode },
    { label: 'Is Preferred', value: currentAmplitude.is_preferred ? 'yes' : 'no' },
    {
      label: 'Last updated',
      value: (
        <Tooltip content={currentAmplitude.updated_at} relationship="label">
          <span>{formatDistanceToNow(new Date(currentAmplitude.updated_at), { addSuffix: true })}</span>
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

interface SearchableAmplitude extends Amplitude {
  stream_id: string;
}

const EventDetailAmplitude = () => {
  const { eventId } = useParams();
  const { useUTC } = useAppStore();
  const { loading, event, error, fetchEvent, hasEventId } = useEventDetailStore();
  const { getChannelById } = useInventoryStore();
  const styles = useEventDetailAmplitudeStyles();
  const [currentAmplitude, setCurrentAmplitude] = useState<Amplitude | null>(null);
  const fuseRef = useRef<Fuse<Amplitude> | null>(null);
  const searchBoxRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const searchableAmplitudes = useMemo(() => {
    return event?.amplitudes
      ? event?.amplitudes.map((amplitude) => {
          return {
            ...amplitude,
            stream_id: amplitude.label ?? getChannelById(amplitude.waveform_id)?.stream_id,
          } as SearchableAmplitude;
        })
      : [];
  }, [event, getChannelById]);

  const amplitudes = useMemo(() => {
    if (!fuseRef.current || !searchQuery) {
      return searchableAmplitudes;
    }

    return fuseRef.current
      .search(searchQuery)
      .map((item) => item.item)
      .slice(0, 10);
  }, [searchQuery, searchableAmplitudes]);

  const handleSearchChange = useCallback((_: SearchBoxChangeEvent, data: InputOnChangeData) => {
    setSearchQuery(data.value);
  }, []);

  useEffect(() => {
    if (eventId && !hasEventId(eventId)) {
      fetchEvent(eventId);
    }
  }, [eventId, fetchEvent, hasEventId]);

  useEffect(() => {
    fuseRef.current = new Fuse(searchableAmplitudes, {
      keys: ['stream_id', 'type', 'category', 'unit', 'method'],
      threshold: 0.3,
    });

    return () => {
      fuseRef.current = null;
    };
  }, [searchableAmplitudes]);

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
      {currentAmplitude && (
        <div className="flex items-center justify-start">
          <div className="flex items-center">
            <Button
              icon={<ArrowLeft20Regular />}
              appearance="transparent"
              onClick={() => {
                setCurrentAmplitude(null);
              }}
            />
          </div>
        </div>
      )}
      {currentAmplitude ? (
        <div className="flex flex-col gap-2">
          <div className="font-semibold">Amplitude Detail</div>
          <AmplitudeDetail currentAmplitude={currentAmplitude} useUTC={useUTC} />
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
                <TableHeaderCell>Amplitude</TableHeaderCell>
                <TableHeaderCell>Unit</TableHeaderCell>
                <TableHeaderCell>Category</TableHeaderCell>
                <TableHeaderCell>Method</TableHeaderCell>
                <TableHeaderCell>Stream ID</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {amplitudes.length > 0 ? (
                amplitudes.map((amplitude) => (
                  <TableRow
                    key={amplitude.id}
                    onClick={() => {
                      setCurrentAmplitude(amplitude);
                    }}
                  >
                    <TableHeaderCell>{amplitude.is_preferred ? <Checkmark16Regular /> : null}</TableHeaderCell>
                    <TableHeaderCell>{amplitude.type}</TableHeaderCell>
                    <TableHeaderCell>{formatNumber(amplitude.amplitude, { precision: 2 })}</TableHeaderCell>
                    <TableHeaderCell>{amplitude.unit}</TableHeaderCell>
                    <TableHeaderCell>{amplitude.category}</TableHeaderCell>
                    <TableHeaderCell>{amplitude.method}</TableHeaderCell>
                    <TableHeaderCell>{amplitude.label ?? getChannelById(amplitude.waveform_id)?.stream_id}</TableHeaderCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableHeaderCell colSpan={6}>
                    <span className="text-center w-full">No amplitudes available</span>
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

export default EventDetailAmplitude;
