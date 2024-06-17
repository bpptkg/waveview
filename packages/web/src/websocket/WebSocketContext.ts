import React from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

const WebSocketContext = React.createContext<ReconnectingWebSocket | null>(null);

export default WebSocketContext;
