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
  useId,
  useIsOverflowItemVisible,
  useOverflowMenu,
  useToastController,
} from '@fluentui/react-components';
import { MoreHorizontalRegular } from '@fluentui/react-icons';
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
    { value: 'event', label: 'Event' },
    { value: 'attachment', label: 'Attachments' },
    { value: 'visual', label: 'Visual' },
    { value: 'amplitude', label: 'Amplitude' },
  ];

  return (
    <Overflow>
      <div className="flex items-center gap-1">
        <TabList selectedValue={selectedValue} onTabSelect={(_, data) => onTabSelect?.(data.value as string)}>
          {tabs.map((tab) => (
            <OverflowItem key={tab.value} id={tab.value}>
              <Tab key={tab.value} value={tab.value}>
                {tab.label}
              </Tab>
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
  const { eventId, time, duration, eventTypeId, stationOfFirstArrivalId, savePickedEvent, addEventMarker } = usePickerStore();

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

  return (
    <div>
      {loading && <ProgressBar shape="square" />}
      <div className="flex items-center justify-between px-2 py-2 border-b dark:border-b-gray-800">
        <h1 className="font-bold">{eventId ? 'Edit' : 'Create'}</h1>
        <div className="flex items-center gap-1">
          <Button size="small" appearance="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="small" appearance="primary" onClick={handleSave} disabled={loading || !canSave}>
            Save
          </Button>
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
    </div>
  );
};

export default PickEdit;
