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
import { Origin } from '../../types/event';

const useEventDetailLocationStyles = makeStyles({
  table: {
    tableLayout: 'auto',
  },
});

const EventDetailLocation = () => {
  const { eventId } = useParams();
  const { useUTC } = useAppStore();
  const { loading, event, error, fetchEvent, hasEventId } = useEventDetailStore();
  const styles = useEventDetailLocationStyles();
  const [currentOrigin, setCurrentOrigin] = useState<Origin | null>(null);

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
      {currentOrigin && (
        <div className="flex items-center justify-start">
          <div className="flex items-center">
            <Button
              icon={<ArrowLeft20Regular />}
              appearance="transparent"
              onClick={() => {
                setCurrentOrigin(null);
              }}
            />
          </div>
        </div>
      )}
      {currentOrigin ? (
        <div className="flex flex-col gap-2">
          <div className="font-semibold">Origin Detail</div>
          <div>
            <div className="flex items-center justify-between">
              <div>ID</div>
              <div>{currentOrigin.id}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Time</div>
              <div>{formatTime(currentOrigin.time, { useUTC })}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Latitude</div>
              <div>{formatNumber(currentOrigin.latitude, { unit: '°', precision: 5 })}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Longitude</div>
              <div>{formatNumber(currentOrigin.longitude, { unit: '°', precision: 5 })}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Depth</div>
              <div>{formatNumber(currentOrigin.depth, { unit: 'km', precision: 2 })}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Earth model</div>
              <div>{currentOrigin.earth_model}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Evaluation mode</div>
              <div>{currentOrigin.evaluation_mode}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Evaluation status</div>
              <div>{currentOrigin.evaluation_status}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Is preferred</div>
              <div>{currentOrigin.is_preferred ? 'yes' : 'no'}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Last updated</div>
              <div>
                <Tooltip content={currentOrigin.updated_at} relationship="label">
                  <span>{formatDistanceToNow(new Date(currentOrigin.updated_at), { addSuffix: true })}</span>
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
              <TableHeaderCell>Time</TableHeaderCell>
              <TableHeaderCell>Latitude</TableHeaderCell>
              <TableHeaderCell>Longitude</TableHeaderCell>
              <TableHeaderCell>Depth</TableHeaderCell>
              <TableHeaderCell>Method</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {event?.origins.length ? (
              event?.origins.map((origin) => (
                <TableRow
                  key={origin.id}
                  onClick={() => {
                    setCurrentOrigin(origin);
                  }}
                >
                  <TableHeaderCell>{origin.is_preferred ? <Checkmark16Regular /> : null}</TableHeaderCell>
                  <TableHeaderCell>{formatTime(origin.time, { useUTC })}</TableHeaderCell>
                  <TableHeaderCell>{formatNumber(origin.latitude, { unit: '°', precision: 5 })}</TableHeaderCell>
                  <TableHeaderCell>{formatNumber(origin.longitude, { unit: '°', precision: 5 })}</TableHeaderCell>
                  <TableHeaderCell>{formatNumber(origin.depth, { unit: ' km', precision: 2 })}</TableHeaderCell>
                  <TableHeaderCell>{origin.method}</TableHeaderCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableHeaderCell colSpan={6}>
                  <span className="text-center w-full">No origins available</span>
                </TableHeaderCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default EventDetailLocation;
