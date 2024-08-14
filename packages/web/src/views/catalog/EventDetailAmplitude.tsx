import { Button, makeStyles, Table, TableBody, TableHeader, TableHeaderCell, TableRow, Tooltip } from '@fluentui/react-components';
import { ArrowLeft20Regular, Checkmark16Regular } from '@fluentui/react-icons';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
          <div>
            <div className="flex items-center justify-between">
              <div>ID</div>
              <div>{currentAmplitude.id}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Amplitude</div>
              <div>{currentAmplitude.amplitude}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Type</div>
              <div>{currentAmplitude.type}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Category</div>
              <div>{currentAmplitude.category}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Time</div>
              <div>{formatTime(currentAmplitude.time, { useUTC })}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Begin</div>
              <div>{formatNumber(currentAmplitude.begin, { unit: ' sec' })}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>End</div>
              <div>{formatNumber(currentAmplitude.end, { unit: ' sec' })}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Duration</div>
              <div>{formatNumber(currentAmplitude.duration, { unit: ' sec' })}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>SNR</div>
              <div>{currentAmplitude.snr}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Unit</div>
              <div>{currentAmplitude.unit}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Stream ID</div>
              <div>{getChannelById(currentAmplitude.waveform_id)?.stream_id}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Method</div>
              <div>{currentAmplitude.method}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Evaluation Mode</div>
              <div>{currentAmplitude.evaluation_mode}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Is Preferred</div>
              <div>{currentAmplitude.is_preferred ? 'yes' : 'no'}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Last updated</div>
              <div>
                <Tooltip content={currentAmplitude.updated_at} relationship="label">
                  <span>{formatDistanceToNow(new Date(currentAmplitude.updated_at), { addSuffix: true })}</span>
                </Tooltip>
              </div>
            </div>
          </div>
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
                  <TableHeaderCell>{amplitude.amplitude}</TableHeaderCell>
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
