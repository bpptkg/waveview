import { Avatar, Divider, makeStyles, Popover, PopoverProps, PopoverSurface, PopoverTrigger, Tooltip } from '@fluentui/react-components';
import { CircleFilled } from '@fluentui/react-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { media } from '../../shared/media';
import { useUserStore } from '../../stores/user';
import { User } from '../../types/user';
import { WebSocketResponse } from '../../types/websocket';
import { useWebSocket } from '../WebSocket/WebSocketContext';

const useJoinedUsersStyles = makeStyles({
  popoverSurface: {
    padding: '0px',
    width: '240px',
    borderRadius: '16px',
  },
});

interface JoinedUsersData {
  users: User[];
}

const MAX_USERS = 3;

const JoinedUsers: React.FC = () => {
  const { user } = useUserStore();
  const styles = useJoinedUsersStyles();
  const [open, setOpen] = useState(false);
  const socket = useWebSocket();
  const [joinedUsers, setJoinedUsers] = useState<User[]>([]);

  const handleWebSocketMessage = useCallback(
    (event: MessageEvent) => {
      const data = JSON.parse(event.data) as WebSocketResponse<JoinedUsersData>;
      if (data.command === 'join') {
        setJoinedUsers(data.data.users.filter((u) => u.username !== user?.username));
      }
    },
    [user, setJoinedUsers]
  );

  const handleWebSocketClose = useCallback(() => {
    setJoinedUsers([]);
  }, [setJoinedUsers]);

  useEffect(() => {
    if (socket) {
      socket.addEventListener('message', handleWebSocketMessage);
      socket.addEventListener('close', handleWebSocketClose);
    }
    return () => {
      if (socket) {
        socket.removeEventListener('message', handleWebSocketMessage);
        socket.removeEventListener('close', handleWebSocketClose);
      }
    };
  }, [socket, handleWebSocketMessage, handleWebSocketClose]);

  const handleOpenChange: PopoverProps['onOpenChange'] = (_, data) => setOpen(data.open || false);

  const remainingUsersLength = joinedUsers.length - MAX_USERS;

  return (
    <Popover open={open} onOpenChange={handleOpenChange} withArrow>
      <PopoverTrigger disableButtonEnhancement>
        <Tooltip content="Live Participants" relationship="label" showDelay={1500}>
          <div className="flex items-center ">
            {joinedUsers.slice(0, MAX_USERS).map((user, index) => (
              <Avatar
                key={index}
                size={32}
                className="ml-[-10px] border-2 border-neutral-grey-94 dark:border-neutral-grey-4"
                color="colorful"
                name={user?.name ?? user?.username}
                image={{ src: media(user?.avatar) }}
              />
            ))}
            {remainingUsersLength > 0 ? <span>+{remainingUsersLength}</span> : null}
          </div>
        </Tooltip>
      </PopoverTrigger>

      <PopoverSurface tabIndex={-1} className={styles.popoverSurface}>
        <div className="flex items-center px-2">
          <CircleFilled fontSize={16} color="green" />
          <h2 className="text-md font-semibold p-2">Live Participants ({joinedUsers.length})</h2>
        </div>
        <Divider />
        <div className="p-2 max-h-[476px] overflow-y-auto overflow-x-hidden">
          {joinedUsers.length > 0 ? (
            <div className="flex flex-col gap-2">
              {joinedUsers.map((joinedUser, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Avatar color="colorful" name={joinedUser?.name ?? joinedUser?.username} image={{ src: media(joinedUser?.avatar) }} />
                  <div className="flex flex-col">
                    <span>{joinedUser?.name && joinedUser.name.length > 0 ? joinedUser.name : joinedUser.username}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <span>Nothing to display</span>
          )}
        </div>
      </PopoverSurface>
    </Popover>
  );
};

export default JoinedUsers;
