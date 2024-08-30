import React from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

export const WebSocketContext = React.createContext<ReconnectingWebSocket | null>(null);

export const useWebSocket = () => {
  const context = React.useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }

  return context;
};

