import {
  Avatar,
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
  Tooltip,
  useId,
  useToastController,
} from '@fluentui/react-components';
import { AlertRegular } from '@fluentui/react-icons';
import { formatDistanceToNow } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { formatTimezonedDate } from '../../shared/time';
import { useAppStore } from '../../stores/app';
import { NewEventNotificationData, NotificationMessage, WebSocketResponse } from '../../types/websocket';
import EventTypeLabel from '../Catalog/EventTypeLabel';
import { useWebSocket } from '../WebSocket/WebSocketContext';

const useNotificationPanelStyles = makeStyles({
  popoverSurface: {
    padding: '0px',
    width: '300px',
  },
});

interface NotificationToast {
  title: string;
  body?: string;
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
    ({ title, body }: NotificationToast) => {
      dispatchToast(
        <Toast>
          <ToastTitle>{title}</ToastTitle>
          <ToastBody>{body}</ToastBody>
        </Toast>,
        { intent: 'info', timeout: 5000 }
      );
    },
    [dispatchToast]
  );

  const handleNotiticationMessage = useCallback(
    (event: MessageEvent<string>) => {
      const response = JSON.parse(event.data);
      const { type, data } = response as WebSocketResponse;
      if (type === 'notify') {
        const notification = data as NotificationMessage;
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        showNotificationToast({ title: notification.title, body: notification.body });
      }
    },
    [showNotificationToast]
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
    const { event } = data;
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
          </div>
          <Tooltip content={event.author.name} relationship="label">
            <Avatar aria-label={event.author.name} name={event.author.name} color="colorful" image={{ src: event.author.avatar }} />
          </Tooltip>
        </div>
      </div>
    );
  };

  const renderNotification = (notification: NotificationMessage) => {
    switch (notification.type) {
      case 'new_event':
        return renderNewEventNotification(notification.data as NewEventNotificationData);
      default:
        return null;
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={handleOpenChange} withArrow>
        <PopoverTrigger disableButtonEnhancement>
          <div className="relative">
            <Button size="small" appearance="transparent" icon={<AlertRegular fontSize={20} />} />
            {unreadCount > 0 && (
              <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
                <CounterBadge count={unreadCount} size="small" appearance="filled" color="danger" />
              </div>
            )}
          </div>
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

            <div className="p-2 max-h-[476px] overflow-y-auto overflow-x-hidden">
              {notifications.length ? (
                <div className="flex flex-col">
                  {notifications.map((notification, index) => (
                    <div key={index} className="p-2 border-b border-gray-200">
                      {renderNotification(notification)}
                    </div>
                  ))}
                </div>
              ) : (
                <span>No notification</span>
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
