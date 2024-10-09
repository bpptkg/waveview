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
  MenuButton,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Overflow,
  OverflowItem,
  Tab,
  TabList,
  TabListProps,
  Toast,
  Toaster,
  ToastTitle,
  Tooltip,
  useId,
  useIsOverflowItemVisible,
  useOverflowMenu,
  useToastController,
} from '@fluentui/react-components';
import {
  ArrowCounterclockwiseRegular,
  Dismiss20Regular,
  Edit20Regular,
  MoreHorizontal20Regular,
  MoreHorizontalRegular,
  Star20Filled,
  Star20Regular,
} from '@fluentui/react-icons';
import React, { useCallback, useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useCatalogStore } from '../../stores/catalog';
import { useEventDetailStore } from '../../stores/eventDetail';
import { useOrganizationStore } from '../../stores/organization';
import { useVolcanoStore } from '../../stores/volcano/useVolcanoStore';
import { SeismicEventDetail } from '../../types/event';
import { CustomError } from '../../types/response';
import EventDetailEditor from './EventDetailEditor';

export interface EventDetailProps {}

const useEventDetailStyles = makeStyles({
  divider: {
    flexGrow: 0,
  },
});

interface EventTabItem {
  value: string;
  label: string;
}

const OverflowMenuItem: React.FC<{ tab: EventTabItem }> = (props) => {
  const { tab } = props;
  const isVisible = useIsOverflowItemVisible(tab.value);
  const navigate = useNavigate();

  if (isVisible) {
    return null;
  }

  return <MenuItem onClick={() => navigate(tab.value)}>{tab.label}</MenuItem>;
};

const OverflowMenu: React.FC<{ tabs: EventTabItem[] }> = ({ tabs }) => {
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
            return <OverflowMenuItem key={tab.value} tab={tab} />;
          })}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

interface EventDetailTabsProps {
  eventId?: string;
}

export const EventDetailTabs: React.FC<EventDetailTabsProps> = ({ eventId }) => {
  const navigate = useNavigate();
  const handleTabSelect: TabListProps['onTabSelect'] = (_, data) => {
    navigate(data.value as string);
  };

  const { currentOrganization } = useOrganizationStore();
  const { currentVolcano } = useVolcanoStore();

  const tabs = [
    { value: `/${currentOrganization?.slug}/${currentVolcano?.slug}/catalog/events/${eventId}/summary`, label: 'Summary' },
    { value: `/${currentOrganization?.slug}/${currentVolcano?.slug}/catalog/events/${eventId}/amplitude`, label: 'Amplitude' },
    { value: `/${currentOrganization?.slug}/${currentVolcano?.slug}/catalog/events/${eventId}/magnitude`, label: 'Magnitude' },
    { value: `/${currentOrganization?.slug}/${currentVolcano?.slug}/catalog/events/${eventId}/location`, label: 'Location' },
    { value: `/${currentOrganization?.slug}/${currentVolcano?.slug}/catalog/events/${eventId}/waveform`, label: 'Waveform' },
    { value: `/${currentOrganization?.slug}/${currentVolcano?.slug}/catalog/events/${eventId}/attachments`, label: 'Attachments' },
    { value: `/${currentOrganization?.slug}/${currentVolcano?.slug}/catalog/events/${eventId}/visual`, label: 'Visual' },
  ];

  if (!eventId) {
    return null;
  }

  return (
    <Overflow>
      <div className="flex items-center gap-1">
        <TabList onTabSelect={handleTabSelect} selectedValue={location.pathname}>
          {tabs.map((tab) => (
            <OverflowItem key={tab.value} id={tab.value}>
              <Tab value={tab.value}>{tab.label}</Tab>
            </OverflowItem>
          ))}
        </TabList>
        <OverflowMenu tabs={tabs} />
      </div>
    </Overflow>
  );
};

const EventDetail: React.FC<EventDetailProps> = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const styles = useEventDetailStyles();

  const { currentOrganization } = useOrganizationStore();
  const { currentVolcano } = useVolcanoStore();

  const handleClose = useCallback(() => {
    navigate(`/${currentOrganization?.slug}/${currentVolcano?.slug}/catalog/events`);
  }, [currentOrganization, currentVolcano, navigate]);

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
        handleClose();
      })
      .catch((error: CustomError) => {
        showErrorToast(error);
      })
      .finally(() => {
        setDeleteDialogOpen(false);
      });
  }, [eventId, deleteEvent, showErrorToast, removeEvent, handleClose]);

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
          <Tooltip content={'Refresh'} relationship="label" showDelay={1500}>
            <Button icon={<ArrowCounterclockwiseRegular />} appearance="transparent" onClick={handleRefresh} />
          </Tooltip>
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Tooltip content={'More Options'} relationship="label" showDelay={1500}>
                <Button icon={<MoreHorizontal20Regular />} appearance="transparent" />
              </Tooltip>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
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
      <EventDetailTabs eventId={eventId} />
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
