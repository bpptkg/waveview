import { Button, makeStyles, Table, TableBody, TableHeader, TableHeaderCell, TableRow, Tooltip } from '@fluentui/react-components';
import { ArrowLeft20Regular, Checkmark16Regular } from '@fluentui/react-icons';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EventDetailErrorMessage from '../../components/Loading/EventDetailErrorMessage';
import EventDetailLoadingIndicator from '../../components/Loading/EventDetailLoadingIndicator';
import { useEventDetailStore } from '../../stores/eventDetail';
import { Magnitude } from '../../types/event';

const useEventDetailMagnitudeStyles = makeStyles({
  table: {
    tableLayout: 'auto',
  },
});

const EventDetailMagnitude = () => {
  const { eventId } = useParams();
  const { loading, event, error, fetchEvent, hasEventId } = useEventDetailStore();
  const styles = useEventDetailMagnitudeStyles();
  const [currentMagnitude, setCurrentMagnitude] = useState<Magnitude | null>(null);

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
          <div>
            <div className="flex items-center justify-between">
              <div>ID</div>
              <div>{currentMagnitude.id}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Type</div>
              <div>{currentMagnitude.type}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Method</div>
              <div>{currentMagnitude.method}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Station count</div>
              <div>{currentMagnitude.station_count}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Azimuthal gap</div>
              <div>{currentMagnitude.azimuthal_gap}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Evaluation status</div>
              <div>{currentMagnitude.evaluation_status}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Is Preferred</div>
              <div>{currentMagnitude.is_preferred ? 'yes' : 'no'}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Last updated</div>
              <div>
                <Tooltip content={currentMagnitude.updated_at} relationship="label">
                  <span>{formatDistanceToNow(new Date(currentMagnitude.updated_at), { addSuffix: true })}</span>
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
              <TableHeaderCell>Magnitude</TableHeaderCell>
              <TableHeaderCell>Method</TableHeaderCell>
              <TableHeaderCell>Station Count</TableHeaderCell>
              <TableHeaderCell>Evaluation Status</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {event?.magnitudes.length ? (
              event?.magnitudes.map((magnitude) => (
                <TableRow
                  key={magnitude.id}
                  onClick={() => {
                    setCurrentMagnitude(magnitude);
                  }}
                >
                  <TableHeaderCell>{magnitude.is_preferred ? <Checkmark16Regular /> : null}</TableHeaderCell>
                  <TableHeaderCell>{magnitude.type}</TableHeaderCell>
                  <TableHeaderCell>{magnitude.magnitude}</TableHeaderCell>
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
      )}
    </div>
  );
};

export default EventDetailMagnitude;
