import { useAppStore } from '../../stores/app';
import { usePickerStore } from '../../stores/picker';
import EventDrawer from './EventDrawer/EventDrawer';
import PickEdit from './EventDrawer/PickEdit';
import PickGuide from './EventDrawer/PickGuide';
import { usePickerCallback } from './usePickerCallback';

const EventEditor = () => {
  const { isPickEmpty, pickEnd, pickStart, editedEvent } = usePickerStore();
  const { handleSeismogramDeactivatePickMode, handlePickDurationChange, handlePickCancel, handlePickSave } = usePickerCallback();
  const { useUTC } = useAppStore();

  return (
    <div className="relative w-[300px] h-full">
      <EventDrawer>
        {isPickEmpty() ? (
          <PickGuide onClose={handleSeismogramDeactivatePickMode} />
        ) : (
          <PickEdit
            eventId={editedEvent?.id}
            time={pickStart}
            duration={(pickEnd - pickStart) / 1000}
            eventType={editedEvent?.type.id}
            stationOfFirstArrival={editedEvent?.station_of_first_arrival_id}
            note={editedEvent?.note}
            useUTC={useUTC}
            attachments={editedEvent?.attachments}
            onDurationChange={handlePickDurationChange}
            onCancel={handlePickCancel}
            onSave={handlePickSave}
          />
        )}
      </EventDrawer>
    </div>
  );
};

export default EventEditor;
