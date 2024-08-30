import { WifiWarningFilled } from '@fluentui/react-icons';
import { useEffect, useState } from 'react';
import { useWebSocket } from '../WebSocket/WebSocketContext';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(true);
  const socket = useWebSocket();

  useEffect(() => {
    if (socket) {
      socket.addEventListener('open', () => {
        setIsOnline(true);
      });
      socket.addEventListener('close', () => {
        setIsOnline(false);
      });
    }
  }, [socket]);

  if (isOnline) {
    return null;
  }

  return (
    <div className="bg-[#F4BFAB] rounded-full flex items-center gap-1 px-2 py-1">
      <WifiWarningFilled fontSize={20} color="#8A3707" />
      <span className="text-xs text-[#8A3707]">Offline</span>
    </div>
  );
};

export default OfflineIndicator;
