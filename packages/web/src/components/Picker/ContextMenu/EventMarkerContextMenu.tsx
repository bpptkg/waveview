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
  makeStyles,
  tokens,
  useId,
  useToastController,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components';
import { CircleFilled, DeleteRegular, EditRegular } from '@fluentui/react-icons';
import { ElementEvent, SeismogramEventMarkerOptions } from '@waveview/zcharts';
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getEventTypeColor } from '../../../shared/theme';
import { useAppStore } from '../../../stores/app';
import { usePickerStore } from '../../../stores/picker';
import { SeismicEvent } from '../../../types/event';
import { CustomError } from '../../../types/response';
import { usePickerCallback } from '../usePickerCallback';

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
        { intent: 'error' }
      );
    },
    [dispatchToast]
  );

  const { fetchEditedEvent, deleteEvent, removeEventMarker } = usePickerStore();
  const { handleSetupEventEditing, handleUpdateEventMarkers } = usePickerCallback();

  const handleEditEvent = useCallback(() => {
    if (!selectedEvent) {
      return;
    }
    fetchEditedEvent(selectedEvent.id)
      .then((event) => {
        handleSetupEventEditing(event);
      })
      .catch((error) => {
        showErrorToast(error);
      })
      .finally(() => {
        handleClose();
      });
  }, [selectedEvent, fetchEditedEvent, showErrorToast, handleSetupEventEditing, handleClose]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const handleDeleteEvent = useCallback(async () => {
    if (!selectedEvent) {
      return;
    }
    try {
      await deleteEvent(selectedEvent.id);
      removeEventMarker(selectedEvent.id);
      handleClose();
      handleUpdateEventMarkers();
    } catch (e) {
      showErrorToast(e as CustomError);
    }
  }, [selectedEvent, deleteEvent, removeEventMarker, handleClose, handleUpdateEventMarkers, showErrorToast]);

  return createPortal(
    <FluentProvider theme={darkMode ? webDarkTheme : webLightTheme}>
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
          <MenuItem onClick={handleEditEvent} icon={<EditRegular />}>
            Edit Event...
          </MenuItem>
          <MenuItem onClick={() => setDialogOpen(true)} icon={<DeleteRegular />}>
            Delete
          </MenuItem>
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
                <Button appearance="primary" onClick={handleDeleteEvent}>
                  Yes
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </div>
    </FluentProvider>,
    document.getElementById('root') as HTMLElement
  );
});

export default EventMarkerContextMenu;
