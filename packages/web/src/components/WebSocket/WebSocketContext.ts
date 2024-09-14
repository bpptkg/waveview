import React from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

export const WebSocketContext = React.createContext<ReconnectingWebSocket | null>(null);

export const useWebSocket = () => {
  const context = React.useContext(WebSocketContext);
  return context;
};
