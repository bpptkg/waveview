import React, { useEffect, useState } from 'react';
import WebSocketContext from './WebSocketContext';
import ReconnectingWebSocket from 'reconnecting-websocket';

interface WebSocketProviderProps {
  children: React.ReactNode;
}

const WebSocketProvider: React.FC<WebSocketProviderProps> = (props) => {
  const { children } = props;
  const [webSocket, setWebSocket] = useState<ReconnectingWebSocket | null>(null);

  useEffect(() => {
    const ws = new ReconnectingWebSocket('ws://127.0.0.1:8000/ws/stream/');
    setWebSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  return <WebSocketContext.Provider value={webSocket}>{children}</WebSocketContext.Provider>;
};

export default WebSocketProvider;
