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
  makeStyles,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Tab,
  TabList,
  TabListProps,
  Toast,
  Toaster,
  ToastTitle,
  Tooltip,
  useId,
  useToastController,
} from '@fluentui/react-components';
import { Dismiss20Regular, Edit20Regular, MoreHorizontal20Regular, Star20Filled, Star20Regular } from '@fluentui/react-icons';
import React, { useCallback, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCatalogStore } from '../../stores/catalog';
import { useEventDetailStore } from '../../stores/eventDetail';
import { SeismicEventDetail } from '../../types/event';
import { CustomError } from '../../types/response';
import EventDetailEditor from './EventDetailEditor';

export interface EventDetailProps {}

const useEventDetailStyles = makeStyles({
  divider: {
    flexGrow: 0,
  },
});

const EventDetail: React.FC<EventDetailProps> = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const styles = useEventDetailStyles();

  const handleTabSelect: TabListProps['onTabSelect'] = (_, data) => {
    navigate(data.value as string);
  };

  const handleClose = () => {
    navigate('/catalog/events');
  };

  const toasterId = useId('event-detail');
  const { dispatchToast } = useToastController(toasterId);

  const { event, bookmarkEvent, deleteEvent, fetchEvent, setEvent } = useEventDetailStore();
  const { removeEvent, updateEvent } = useCatalogStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

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

  const handleToggleBookmark = useCallback(() => {
    bookmarkEvent().catch((error: CustomError) => {
      showErrorToast(error);
    });
  }, [bookmarkEvent, showErrorToast]);

  const handleDelete = useCallback(() => {
    deleteEvent()
      .then(() => {
        removeEvent(eventId!);
        navigate('/catalog/events');
      })
      .catch((error: CustomError) => {
        showErrorToast(error);
      })
      .finally(() => {
        setDeleteDialogOpen(false);
      });
  }, [deleteEvent, navigate, showErrorToast, removeEvent, eventId]);

  const handleRefresh = useCallback(() => {
    if (!eventId) {
      return;
    }
    fetchEvent(eventId, { clearCache: true }).catch((error: CustomError) => {
      showErrorToast(error);
    });
  }, [fetchEvent, showErrorToast, eventId]);

  const handleCopyPermalink = useCallback(() => {
    const permalink = `${window.location.origin}/catalog/events/${eventId}`;
    navigator.clipboard
      .writeText(permalink)
      .then(() => {})
      .catch((error) => {
        showErrorToast(error);
      });
  }, [eventId, showErrorToast]);

  const handleEventSave = useCallback(
    (event: SeismicEventDetail) => {
      setEvent(event);
      setShowEditor(false);
      updateEvent({ ...event });
    },
    [setEvent, updateEvent]
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-md font-semibold p-4">Event Detail</h2>
        <div className="flex items-center">
          <Tooltip content={'Bookmark Event'} relationship="label" showDelay={1500}>
            <Button icon={event?.is_bookmarked ? <Star20Filled color="orange" /> : <Star20Regular />} appearance="transparent" onClick={handleToggleBookmark} />
          </Tooltip>
          <Tooltip content={'Edit Event'} relationship="label" showDelay={1500}>
            <Button icon={<Edit20Regular />} appearance="transparent" onClick={() => setShowEditor(true)} />
          </Tooltip>
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Tooltip content={'More Options'} relationship="label" showDelay={1500}>
                <Button icon={<MoreHorizontal20Regular />} appearance="transparent" />
              </Tooltip>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem onClick={handleRefresh}>Refresh</MenuItem>
                <MenuItem onClick={handleCopyPermalink}>Copy Permalink</MenuItem>
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
          <Tooltip content={'Close'} relationship="label" showDelay={1500}>
            <Button icon={<Dismiss20Regular />} appearance="transparent" onClick={handleClose} />
          </Tooltip>
        </div>
      </div>

      <Divider alignContent="center" className={styles.divider} />

      <TabList onTabSelect={handleTabSelect} selectedValue={location.pathname}>
        <Tab value={`/catalog/events/${eventId}/summary`}>Summary</Tab>
        <Tab value={`/catalog/events/${eventId}/amplitude`}>Amplitude</Tab>
        <Tab value={`/catalog/events/${eventId}/magnitude`}>Magnitude</Tab>
        <Tab value={`/catalog/events/${eventId}/location`}>Location</Tab>
        <Tab value={`/catalog/events/${eventId}/waveform`}>Waveform</Tab>
        <Tab value={`/catalog/events/${eventId}/attachments`}>Attachments</Tab>
      </TabList>
      <Outlet />

      <Toaster toasterId={toasterId} />

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
              <Button appearance="primary" onClick={handleDelete}>
                Delete
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {showEditor && event && (
        <EventDetailEditor
          event={event}
          onSave={handleEventSave}
          onClose={() => {
            setShowEditor(false);
          }}
        />
      )}
    </>
  );
};

export default EventDetail;
