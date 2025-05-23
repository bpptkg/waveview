import {
  Button,
  CounterBadge,
  Divider,
  makeStyles,
  Popover,
  PopoverProps,
  PopoverSurface,
  PopoverTrigger,
  Toast,
  ToastBody,
  Toaster,
  ToastTitle,
  ToastTrigger,
  Tooltip,
  useId,
  useToastController,
} from '@fluentui/react-components';
import { AlertRegular, DismissRegular } from '@fluentui/react-icons';
import classNames from 'classnames';
import { formatDistanceToNow } from 'date-fns';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { formatTimezonedDate } from '../../shared/time';
import { useAppStore } from '../../stores/app';
import { usePickerStore } from '../../stores/picker';
import {
  EventDeleteNotificationData,
  EventUpdateNotificationData,
  NewAppVersionNotificationData,
  NewEventNotificationData,
  NotificationMessage,
  WebSocketResponse,
} from '../../types/websocket';
import EventTypeLabel from '../Catalog/EventTypeLabel';
import Author from '../Common/Author';
import { useWebSocket } from '../WebSocket/WebSocketContext';

const useNotificationPanelStyles = makeStyles({
  popoverSurface: {
    padding: '0px',
    width: '270px',
    borderRadius: '16px',
  },
});

interface NotificationToast {
  title: ReactNode;
  body?: ReactNode;
  timeout?: number;
}

const NotificationPanel = () => {
  const styles = useNotificationPanelStyles();
  const [open, setOpen] = useState(false);
  const socket = useWebSocket();
  const { useUTC } = useAppStore();
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const toasterId = useId('notification-panel');
  const { dispatchToast } = useToastController(toasterId);

  const showNotificationToast = useCallback(
    ({ title, body, timeout = 5000 }: NotificationToast) => {
      dispatchToast(
        <Toast>
          <ToastTitle
            action={
              <ToastTrigger>
                <Button icon={<DismissRegular fontSize={16} />} appearance="transparent" aria-label="Close" />
              </ToastTrigger>
            }
          >
            {title}
          </ToastTitle>
          <ToastBody>{body}</ToastBody>
        </Toast>,
        { intent: 'info', timeout }
      );
    },
    [dispatchToast]
  );

  // Fetch event markers when event notification is received.
  const { fetchEventMarkers, getHelicorderExtent } = usePickerStore();
  const handleUpdateEventMarkers = useCallback(() => {
    const [start, end] = getHelicorderExtent();
    fetchEventMarkers(start, end);
  }, [fetchEventMarkers, getHelicorderExtent]);

  const handleNotiticationMessage = useCallback(
    (event: MessageEvent<string>) => {
      const response = JSON.parse(event.data);
      const { type, data } = response as WebSocketResponse;
      if (type === 'notify') {
        const notification = data as NotificationMessage;
        if (notification.type === 'new_app_version') {
          const { version, reload, reload_timeout } = notification.data as NewAppVersionNotificationData;
          showNotificationToast({
            title: 'New App Version Available',
            body: (
              <div>
                <div>A new version of the app is available: {version}.</div>
                {reload ? <div>The app will be reloaded in {reload_timeout} seconds.</div> : <div>Please reload the app to get the latest version.</div>}
              </div>
            ),
            timeout: notification.timeout,
          });
          if (reload) {
            setTimeout(() => {
              window.location.reload();
            }, reload_timeout * 1000);
          }
        } else {
          showNotificationToast({ title: notification.title, body: notification.body, timeout: notification.timeout });
        }

        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        if (notification.dirty) {
          handleUpdateEventMarkers();
        }
      }
    },
    [showNotificationToast, handleUpdateEventMarkers]
  );

  useEffect(() => {
    if (socket) {
      socket.addEventListener('message', handleNotiticationMessage);
    }

    return () => {
      if (socket) {
        socket.removeEventListener('message', handleNotiticationMessage);
      }
    };
  }, [socket, handleNotiticationMessage]);

  useEffect(() => {
    if (open) {
      setUnreadCount(0);
    }
  }, [open]);

  const handleOpenChange: PopoverProps['onOpenChange'] = (_, data) => setOpen(data.open || false);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const renderNewEventNotification = (data: NewEventNotificationData) => {
    const { event, actor, catalog_name } = data;
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">New Event</div>
          <span className="text-xs">{formatDistanceToNow(new Date(event.updated_at), { addSuffix: false })}</span>
        </div>
        <div className="flex justify-between">
          <div>
            <EventTypeLabel eventType={event.type} />
            <div className="text-xs">{formatTimezonedDate(event.time, 'yyyy-MM-dd HH:mm:ss', useUTC)}</div>
            <div className="text-xs">{catalog_name}</div>
          </div>
          <Author author={actor} />
        </div>
      </div>
    );
  };

  const renderEventUpdateNotification = (data: EventUpdateNotificationData) => {
    const { event, actor, catalog_name } = data;
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Event Updated</div>
          <span className="text-xs">{formatDistanceToNow(new Date(event.updated_at), { addSuffix: false })}</span>
        </div>
        <div className="flex justify-between">
          <div>
            <EventTypeLabel eventType={event.type} />
            <div className="text-xs">{formatTimezonedDate(event.time, 'yyyy-MM-dd HH:mm:ss', useUTC)}</div>
            <div className="text-xs">{catalog_name}</div>
          </div>
          <Author author={actor} />
        </div>
      </div>
    );
  };

  const renderEventDeleteNotification = (data: EventDeleteNotificationData) => {
    const { event, actor, catalog_name } = data;
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Event Deleted</div>
          <span className="text-xs">{formatDistanceToNow(new Date(event.deleted_at), { addSuffix: false })}</span>
        </div>
        <div className="flex justify-between">
          <div>
            <EventTypeLabel eventType={event.type} />
            <div className="text-xs">{formatTimezonedDate(event.time, 'yyyy-MM-dd HH:mm:ss', useUTC)}</div>
            <div className="text-xs">{catalog_name}</div>
          </div>
          <Author author={actor} />
        </div>
      </div>
    );
  };

  const renderNewAppVersionNotification = (data: NewAppVersionNotificationData) => {
    const { version } = data;
    return (
      <div className="flex flex-col gap-1">
        <div className="text-sm font-semibold">New App Version Available</div>
        <div className="text-xs">Version: {version}</div>
      </div>
    );
  };

  const renderNotification = (notification: NotificationMessage) => {
    switch (notification.type) {
      case 'new_event':
        return renderNewEventNotification(notification.data as NewEventNotificationData);
      case 'event_update':
        return renderEventUpdateNotification(notification.data as EventUpdateNotificationData);
      case 'event_delete':
        return renderEventDeleteNotification(notification.data as EventDeleteNotificationData);
      case 'new_app_version':
        return renderNewAppVersionNotification(notification.data as NewAppVersionNotificationData);
      default:
        return null;
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={handleOpenChange} withArrow>
        <PopoverTrigger disableButtonEnhancement>
          <Tooltip content={'Notifications'} relationship="label" showDelay={1500}>
            <div className="relative">
              <Button size="small" appearance="transparent" icon={<AlertRegular fontSize={20} />} />
              {unreadCount > 0 && (
                <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <CounterBadge count={unreadCount} size="small" appearance="filled" color="danger" />
                </div>
              )}
            </div>
          </Tooltip>
        </PopoverTrigger>

        <PopoverSurface tabIndex={-1} className={styles.popoverSurface}>
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-md font-semibold p-2">Notifications</h2>
              <Button size="small" appearance="transparent" onClick={clearNotifications} disabled={notifications.length === 0}>
                Clear all
              </Button>
            </div>

            <Divider />

            <div className="max-h-[476px] overflow-y-auto overflow-x-hidden">
              {notifications.length ? (
                <div className="flex flex-col">
                  {notifications.map((notification, index) => (
                    <div key={index} className={classNames('p-2', { 'border-b border-gray-200 dark:border-gray-700': index !== notifications.length - 1 })}>
                      {renderNotification(notification)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1 h-[150px]">
                  <AlertRegular fontSize={24} className="text-gray-400" />
                  <span className="text-gray-400 text-sm">No notifications</span>
                </div>
              )}
            </div>
          </div>
        </PopoverSurface>
      </Popover>
      <Toaster toasterId={toasterId} />
    </>
  );
};

export default NotificationPanel;
