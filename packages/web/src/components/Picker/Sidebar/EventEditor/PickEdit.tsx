import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Tab,
  TabList,
  TabListProps,
  Toast,
  ToastTitle,
  useId,
  useToastController,
} from '@fluentui/react-components';
import { useCallback, useMemo, useState } from 'react';
import { usePickerStore } from '../../../../stores/picker';
import { SeismicEventDetail } from '../../../../types/event';
import { CustomError } from '../../../../types/response';
import { usePickerContext } from '../../PickerContext';
import { usePickerCallback } from '../../usePickerCallback';
import PickEditAttachments from './PickEditAttachments';
import PickEditEvent from './PickEditEvent';
import PickEditVisual from './PickEditVisual';

const PickEdit = () => {
  const [tab, setTab] = useState('event');
  const handleTabSelect: TabListProps['onTabSelect'] = (_, data) => {
    setTab(data.value as string);
  };

  const [cancelDialogOptn, setCancelDialogOpen] = useState(false);
  const handleCancel = useCallback(() => {
    setCancelDialogOpen(true);
  }, []);

  const { resetEditing } = usePickerStore();
  const { seisChartRef, props } = usePickerContext();
  const { onCancel, onSave } = props;
  const handleResetPick = useCallback(() => {
    resetEditing();
    setCancelDialogOpen(false);
    seisChartRef.current?.clearPickRange();
    onCancel?.();
  }, [resetEditing, onCancel, seisChartRef]);

  const toasterId = useId('pick-editor');
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

  const [loading, setLoading] = useState(false);
  const { time, duration, eventTypeId, stationOfFirstArrivalId, savePickedEvent, addEventMarker } = usePickerStore();
  const { handleUpdateEventMarkers } = usePickerCallback();

  const canSave = useMemo(() => {
    return time !== 0 && duration !== 0 && eventTypeId !== '' && stationOfFirstArrivalId !== '';
  }, [time, duration, eventTypeId, stationOfFirstArrivalId]);

  const onSavedCallback = useCallback(
    (event: SeismicEventDetail) => {
      seisChartRef.current?.clearPickRange();
      resetEditing();
      addEventMarker(event);
      handleUpdateEventMarkers();
      onSave?.(event);
    },
    [resetEditing, addEventMarker, handleUpdateEventMarkers, onSave, seisChartRef]
  );

  const handleSave = useCallback(async () => {
    setLoading(true);
    try {
      const event = await savePickedEvent();
      onSavedCallback(event);
    } catch (error) {
      showErrorToast(error as CustomError);
    } finally {
      setLoading(false);
    }
  }, [savePickedEvent, showErrorToast, onSavedCallback]);

  return (
    <div>
      <div className="flex items-center justify-between px-2 border-b h-[60px]">
        <h1 className="font-bold">Create</h1>
        <div className="flex items-center gap-1">
          <Button size="small" appearance="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="small" appearance="primary" onClick={handleSave} disabled={loading || !canSave}>
            Save
          </Button>
        </div>
      </div>
      <TabList selectedValue={tab} onTabSelect={handleTabSelect}>
        <Tab value={'event'}>Event</Tab>
        <Tab value={'attachment'}>Attachments</Tab>
        <Tab value={'visual'}>Visual</Tab>
      </TabList>
      {tab === 'event' && <PickEditEvent />}
      {tab === 'attachment' && <PickEditAttachments />}
      {tab === 'visual' && <PickEditVisual />}

      <Dialog open={cancelDialogOptn} onOpenChange={(_, data) => setCancelDialogOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Cancel Pick</DialogTitle>
            <DialogContent>Are you sure you want to cancel pick?</DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary" onClick={() => setCancelDialogOpen(false)}>
                  No
                </Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleResetPick}>
                Yes
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default PickEdit;
