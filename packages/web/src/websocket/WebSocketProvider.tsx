import React, { useEffect, useState } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { wsUrl } from '../services/api';
import WebSocketContext from './WebSocketContext';

interface WebSocketProviderProps {
  children: React.ReactNode;
}

const WebSocketProvider: React.FC<WebSocketProviderProps> = (props) => {
  const { children } = props;
  const [webSocket, setWebSocket] = useState<ReconnectingWebSocket | null>(null);

  useEffect(() => {
    const url = `${wsUrl}/ws/stream/`;
    const ws = new ReconnectingWebSocket(url);
    setWebSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  return <WebSocketContext.Provider value={webSocket}>{children}</WebSocketContext.Provider>;
};

export default WebSocketProvider;
