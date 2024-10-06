import { Button, makeStyles, Table, TableBody, TableHeader, TableHeaderCell, TableRow, Tooltip } from '@fluentui/react-components';
import { ArrowLeft20Regular, Checkmark16Regular } from '@fluentui/react-icons';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
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
    { label: 'Category', value: currentAmplitude.category },
    { label: 'Time', value: formatTime(currentAmplitude.time, { useUTC }) },
    { label: 'Begin', value: formatNumber(currentAmplitude.begin, { unit: ' sec', precision: 2 }) },
    { label: 'End', value: formatNumber(currentAmplitude.end, { unit: ' sec', precision: 2 }) },
    { label: 'Duration', value: formatNumber(currentAmplitude.duration, { unit: ' sec', precision: 2 }) },
    { label: 'SNR', value: currentAmplitude.snr },
    { label: 'Unit', value: currentAmplitude.unit },
    { label: 'Stream ID', value: getChannelById(currentAmplitude.waveform_id)?.stream_id },
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

const EventDetailAmplitude = () => {
  const { eventId } = useParams();
  const { useUTC } = useAppStore();
  const { loading, event, error, fetchEvent, hasEventId } = useEventDetailStore();
  const { getChannelById } = useInventoryStore();
  const styles = useEventDetailAmplitudeStyles();
  const [currentAmplitude, setCurrentAmplitude] = useState<Amplitude | null>(null);

  useEffect(() => {
    if (eventId && !hasEventId(eventId)) {
      fetchEvent(eventId);
    }
  }, [eventId, fetchEvent, hasEventId]);

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
        <Table className={styles.table}>
          <TableHeader>
            <TableRow>
              <TableHeaderCell></TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Amplitude</TableHeaderCell>
              <TableHeaderCell>Unit</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Stream ID</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {event?.amplitudes.length ? (
              event?.amplitudes.map((amplitude) => (
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
                  <TableHeaderCell>{getChannelById(amplitude.waveform_id)?.stream_id}</TableHeaderCell>
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
      )}
    </div>
  );
};

export default EventDetailAmplitude;
