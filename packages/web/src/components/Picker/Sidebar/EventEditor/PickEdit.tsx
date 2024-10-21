import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Overflow,
  OverflowItem,
  ProgressBar,
  Tab,
  TabList,
  Toast,
  Toaster,
  ToastTitle,
  Tooltip,
  useId,
  useIsOverflowItemVisible,
  useOverflowMenu,
  useToastController,
} from '@fluentui/react-components';
import { AttachRegular, CalendarAgendaRegular, MoreHorizontalRegular, MoreVerticalRegular, SearchVisualRegular } from '@fluentui/react-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { usePickerStore } from '../../../../stores/picker';
import { SeismicEventDetail } from '../../../../types/event';
import { CustomError } from '../../../../types/response';
import { usePickerContext } from '../../PickerContext';
import { usePickerCallback } from '../../usePickerCallback';
import PickEditAmplitude from './PickEditAmplitude';
import PickEditAttachments from './PickEditAttachments';
import PickEditEvent from './PickEditEvent';
import PickEditVisual from './PickEditVisual';

interface EditTabItem {
  value: string;
  label: string;
  icon: JSX.Element;
}

const OverflowMenuItem: React.FC<{ tab: EditTabItem; onTabSelect?: (tab: string) => void }> = (props) => {
  const { tab, onTabSelect } = props;
  const isVisible = useIsOverflowItemVisible(tab.value);

  if (isVisible) {
    return null;
  }

  return <MenuItem onClick={() => onTabSelect?.(tab.value)}>{tab.label}</MenuItem>;
};

const OverflowMenu: React.FC<{ tabs: EditTabItem[]; onTabSelect?: (tab: string) => void }> = ({ tabs, onTabSelect }) => {
  const { ref, isOverflowing } = useOverflowMenu<HTMLButtonElement>();

  if (!isOverflowing) {
    return null;
  }

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <MenuButton ref={ref} appearance="transparent" icon={<MoreHorizontalRegular fontSize={20} />}></MenuButton>
      </MenuTrigger>

      <MenuPopover>
        <MenuList>
          {tabs.map((tab) => {
            return <OverflowMenuItem onTabSelect={onTabSelect} key={tab.value} tab={tab} />;
          })}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

const EditItemTabList: React.FC<{ selectedValue?: string; onTabSelect?: (tab: string) => void }> = ({ selectedValue, onTabSelect }) => {
  const tabs: EditTabItem[] = [
    { value: 'event', label: 'Event', icon: <CalendarAgendaRegular /> },
    { value: 'attachment', label: 'Attachments', icon: <AttachRegular /> },
    { value: 'visual', label: 'Visual', icon: <SearchVisualRegular /> },
  ];

  return (
    <Overflow>
      <div className="flex items-center">
        <TabList selectedValue={selectedValue} onTabSelect={(_, data) => onTabSelect?.(data.value as string)}>
          {tabs.map((tab) => (
            <OverflowItem key={tab.value} id={tab.value}>
              <Tooltip content={tab.label} relationship="label" showDelay={1500}>
                <Tab key={tab.value} value={tab.value} icon={tab.icon}></Tab>
              </Tooltip>
            </OverflowItem>
          ))}
        </TabList>
        <OverflowMenu onTabSelect={onTabSelect} tabs={tabs} />
      </div>
    </Overflow>
  );
};

const PickEdit = () => {
  const [tab, setTab] = useState('event');
  const handleTabSelect = useCallback((tab: string) => {
    setTab(tab);
  }, []);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const handleCancel = useCallback(() => {
    setCancelDialogOpen(true);
  }, []);

  const { resetEditing } = usePickerStore();
  const { seisChartRef, props } = usePickerContext();
  const { onCancel, onSave } = props;
  const { handleUpdateEventMarkers } = usePickerCallback();
  const handleResetPick = useCallback(() => {
    resetEditing();
    setCancelDialogOpen(false);
    seisChartRef.current?.clearPickRange();
    handleUpdateEventMarkers();
    onCancel?.();
  }, [seisChartRef, resetEditing, onCancel, handleUpdateEventMarkers]);

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
  const { eventId, time, duration, eventTypeId, stationOfFirstArrivalId, savePickedEvent, addEventMarker, deleteEvent, removeEventMarker } = usePickerStore();

  const canSave = useMemo(() => {
    return time !== 0 && duration !== 0 && eventTypeId !== '' && stationOfFirstArrivalId !== '';
  }, [time, duration, eventTypeId, stationOfFirstArrivalId]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const onSavedCallback = useCallback(
    (event: SeismicEventDetail) => {
      seisChartRef.current?.clearPickRange();
      resetEditing();
      addEventMarker(event);
      handleUpdateEventMarkers();
      onSave?.(event);
    },
    [seisChartRef, resetEditing, addEventMarker, handleUpdateEventMarkers, onSave]
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

  const handleDelete = useCallback(async () => {
    if (!eventId) {
      return;
    }
    setLoading(true);
    try {
      await deleteEvent(eventId);
      seisChartRef.current?.clearPickRange();
      resetEditing();
      removeEventMarker(eventId);
      handleUpdateEventMarkers();
      setDeleteDialogOpen(false);
    } catch (error) {
      showErrorToast(error as CustomError);
    } finally {
      setLoading(false);
    }
  }, [eventId, seisChartRef, deleteEvent, showErrorToast, removeEventMarker, handleUpdateEventMarkers, resetEditing]);

  return (
    <div className="h-full w-full overflow-hidden relative">
      <div className="absolute top-0 right-0 left-0 bottom-0 overflow-y-auto">
        {loading && <ProgressBar shape="square" />}
        <div className="flex items-center justify-between px-2 py-2 border-b dark:border-b-gray-800">
          <div className="font-semibold">Editor</div>
          <div className="flex items-center gap-1">
            <Button size="small" appearance="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="small" appearance="primary" onClick={handleSave} disabled={loading || !canSave}>
              Save
            </Button>
            {eventId && (
              <Menu>
                <MenuTrigger disableButtonEnhancement>
                  <Tooltip content={'More Options'} relationship="label" showDelay={1500}>
                    <Button icon={<MoreVerticalRegular fontSize={20} />} appearance="transparent" />
                  </Tooltip>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <span className="text-red-500">Delete...</span>
                    </MenuItem>
                  </MenuList>
                </MenuPopover>
              </Menu>
            )}
          </div>
        </div>

        <EditItemTabList selectedValue={tab} onTabSelect={handleTabSelect} />
        {tab === 'event' && <PickEditEvent />}
        {tab === 'attachment' && <PickEditAttachments />}
        {tab === 'visual' && <PickEditVisual />}
        {tab === 'amplitude' && <PickEditAmplitude />}

        <Toaster toasterId={toasterId} />

        <Dialog open={cancelDialogOpen} onOpenChange={(_, data) => setCancelDialogOpen(data.open)}>
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

        <Dialog open={deleteDialogOpen} onOpenChange={(_, data) => setDeleteDialogOpen(data.open)}>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Delete Event</DialogTitle>
              <DialogContent>Are you sure you want to delete this event?</DialogContent>
              <DialogActions>
                <DialogTrigger disableButtonEnhancement>
                  <Button appearance="secondary" onClick={() => setDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                </DialogTrigger>
                <Button appearance="primary" color="red" onClick={handleDelete} disabled={loading}>
                  Delete
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </div>
    </div>
  );
};

export default PickEdit;
