import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Divider,
  FluentProvider,
  MenuItem,
  MenuList,
  Toast,
  ToastTitle,
  Toaster,
  makeStyles,
  tokens,
  useId,
  useToastController,
} from '@fluentui/react-components';
import { CircleFilled, DeleteRegular, EditRegular, SendRegular } from '@fluentui/react-icons';
import { ElementEvent, SeismogramEventMarkerOptions } from '@waveview/zcharts';
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getEventTypeColor } from '../../../shared/theme';
import { useAppStore } from '../../../stores/app';
import { usePickerStore } from '../../../stores/picker';
import { themes } from '../../../theme';
import { SeismicEvent, SeismicEventDetail } from '../../../types/event';
import { CustomError } from '../../../types/response';
import { usePickerCallback } from '../usePickerCallback';
import { PyroclasticFlowEvent } from '../../../types/observation';
import { api } from '../../../services/api';
import apiVersion from '../../../services/apiVersion';

const useStyles = makeStyles({
  root: {
    position: 'fixed',
    visibility: 'hidden',
    left: 0,
    top: 0,
    width: '200px',
    maxHeight: '500px',
    overflowY: 'auto',
    overflowX: 'hidden',
    backgroundColor: tokens.colorNeutralBackground1,
    padding: '4px',
    borderRadius: '4px',
    boxShadow: `${tokens.shadow16}`,
    zIndex: 100,
  },
});

export interface EventMarkerContextMenuRef {
  open: (e: ElementEvent, marker: SeismogramEventMarkerOptions) => void;
  close: () => void;
}

const EventMarkerContextMenu: React.ForwardRefExoticComponent<React.RefAttributes<EventMarkerContextMenuRef>> = React.forwardRef((_, ref) => {
  const styles = useStyles();
  const { darkMode } = useAppStore();

  const menuRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<SeismicEvent | null>(null);

  const handleOpen = useCallback((e: ElementEvent, marker: SeismogramEventMarkerOptions) => {
    if (!menuRef.current) {
      return;
    }
    const ev = e.event as unknown as PointerEvent;
    let px = ev.x;
    let py = ev.y;
    const width = 200;
    const height = menuRef.current.clientHeight;
    if (px > window.innerWidth - width) {
      px -= width;
    }

    if (py > window.innerHeight - height) {
      py -= height;
    }

    setLeft(px);
    setTop(py);
    setVisible(true);
    const event = marker.data as SeismicEvent;
    setSelectedEvent(event);
  }, []);

  const handleClose = useCallback(() => {
    if (menuRef.current) {
      menuRef.current.style.visibility = 'hidden';
    }
    setVisible(false);
  }, []);

  useImperativeHandle(ref, () => ({
    open: handleOpen,
    close: handleClose,
  }));

  useEffect(() => {
    if (!menuRef.current) {
      return;
    }
    if (visible) {
      menuRef.current.style.visibility = 'visible';
    }
  }, [visible]);

  useEffect(() => {
    const hide = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', hide);

    return () => {
      document.removeEventListener('mousedown', hide);
    };
  }, [handleClose]);

  const toasterId = useId('seismogram-contextmneu');
  const { dispatchToast } = useToastController(toasterId);

  const showErrorToast = useCallback(
    (error: CustomError) => {
      dispatchToast(
        <Toast>
          <ToastTitle>{error.message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    },
    [dispatchToast],
  );

  const { fetchEditedEvent, deleteEvent, removeEventMarker } = usePickerStore();
  const { handleSetupEventEditing, handleUpdateEventMarkers } = usePickerCallback();
  const [loading, setLoading] = useState(false);

  const handleEditEvent = useCallback(() => {
    if (!selectedEvent) {
      return;
    }
    setLoading(true);
    fetchEditedEvent(selectedEvent.id)
      .then((event) => {
        handleSetupEventEditing(event);
      })
      .catch((error) => {
        showErrorToast(error);
      })
      .finally(() => {
        handleClose();
        setLoading(false);
      });
  }, [selectedEvent, fetchEditedEvent, showErrorToast, handleSetupEventEditing, handleClose]);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDeleteDialog = useCallback(() => {
    setDialogOpen(true);
    handleClose();
  }, [handleClose]);

  const handleDeleteEvent = useCallback(async () => {
    if (!selectedEvent) {
      return;
    }

    setLoading(true);
    try {
      await deleteEvent(selectedEvent.id);
      setDialogOpen(false);
      removeEventMarker(selectedEvent.id);
      handleUpdateEventMarkers();
    } catch (e) {
      showErrorToast(e as CustomError);
    } finally {
      setLoading(false);
    }
  }, [selectedEvent, deleteEvent, removeEventMarker, handleUpdateEventMarkers, showErrorToast]);

  const [dialogNotifyOpen, setDialogNotifyOpen] = useState(false);
  const [eventDetails, setEventDetails] = useState<SeismicEventDetail | null>(null);

  const isNotifyVisible = useMemo(() => {
    if (!selectedEvent) {
      return false;
    }
    return selectedEvent.type.code === 'AWANPANAS';
  }, [selectedEvent]);

  const handleOpenNotifyDialog = useCallback(() => {
    setDialogNotifyOpen(true);
    handleClose();
  }, [handleClose]);

  useEffect(() => {
    if (!selectedEvent) {
      return;
    }
    if (!isNotifyVisible) {
      return;
    }
    setLoading(true);
    fetchEditedEvent(selectedEvent.id)
      .then((event) => {
        setEventDetails(event);
      })
      .catch((error) => {
        showErrorToast(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedEvent, isNotifyVisible, fetchEditedEvent, showErrorToast]);

  const pfEvent = useMemo(() => {
    if (!eventDetails) {
      return null;
    }
    const obs = eventDetails.observation as PyroclasticFlowEvent;
    if (!obs) {
      return null;
    }
    return obs;
  }, [eventDetails]);

  const [sendLoading, setSendLoading] = useState(false);

  const handleNotifyEvent = useCallback(async () => {
    setSendLoading(true);
    try {
      const response = await api(apiVersion.sendToWA.v1, {
        method: 'POST',
        body: {
          event_id: selectedEvent?.id,
        },
      });
      await response.json();
      dispatchToast(
        <Toast>
          <ToastTitle>Event sent to WhatsApp successfully</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
    } catch (e) {
      showErrorToast(e as CustomError);
    } finally {
      setDialogNotifyOpen(false);
      setSendLoading(false);
    }
  }, [selectedEvent, dispatchToast, showErrorToast]);

  return createPortal(
    <FluentProvider theme={darkMode ? themes.defaultDark : themes.defaultLight}>
      <div
        className={styles.root}
        ref={menuRef}
        style={{
          left: `${left}px`,
          top: `${top}px`,
        }}
      >
        <div className="flex items-center gap-1 p-1">
          <CircleFilled fontSize={20} color={selectedEvent ? getEventTypeColor(selectedEvent.type, darkMode) : undefined} />
          <span>{selectedEvent?.type.code}</span>
        </div>
        <Divider />
        <MenuList hasIcons>
          <MenuItem onClick={handleEditEvent} icon={<EditRegular />} disabled={loading}>
            Edit Event...
          </MenuItem>
          <MenuItem onClick={handleOpenDeleteDialog} icon={<DeleteRegular />}>
            <span className="text-red-500">Delete...</span>
          </MenuItem>
          {isNotifyVisible && (
            <>
              <Divider />
              <MenuItem onClick={handleOpenNotifyDialog} icon={<SendRegular />}>
                Send to WhatsApp...
              </MenuItem>
            </>
          )}
        </MenuList>

        <Dialog open={dialogOpen} onOpenChange={(_, data) => setDialogOpen(data.open)}>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Delete Event</DialogTitle>
              <DialogContent>Are you sure you want to delete this event?</DialogContent>
              <DialogActions>
                <DialogTrigger disableButtonEnhancement>
                  <Button appearance="secondary" onClick={() => setDialogOpen(false)}>
                    No
                  </Button>
                </DialogTrigger>
                <Button appearance="primary" onClick={handleDeleteEvent} disabled={loading}>
                  Yes
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>

        <Dialog open={dialogNotifyOpen} onOpenChange={(_, data) => setDialogNotifyOpen(data.open)}>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Send to WhatsApp</DialogTitle>
              <DialogContent>
                <div>Are you sure you want to send this event information to WhatsApp?</div>
                <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Event ID: {eventDetails ? eventDetails.id : 'N/A'}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Event type: {eventDetails ? eventDetails.type.code : 'N/A'}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Runout distance: {pfEvent ? `${pfEvent.runout_distance} m` : 'N/A'}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Fall directions: {pfEvent ? pfEvent.fall_directions.map((d) => d.name).join(', ') : 'N/A'}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Amplitude: {pfEvent ? `${pfEvent.amplitude} mm` : 'N/A'}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Duration: {pfEvent ? `${eventDetails?.duration} seconds` : 'N/A'}</div>
                </div>
              </DialogContent>
              <DialogActions>
                <DialogTrigger disableButtonEnhancement>
                  <Button appearance="secondary" onClick={() => setDialogNotifyOpen(false)}>
                    No
                  </Button>
                </DialogTrigger>
                <Button appearance="primary" onClick={handleNotifyEvent} disabled={sendLoading}>
                  {sendLoading ? 'Sending...' : 'Yes'}
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
        <Toaster toasterId={toasterId} />
      </div>
    </FluentProvider>,
    document.getElementById('root') as HTMLElement,
  );
});

export default EventMarkerContextMenu;
