/**
 * WebSocket Client for EDA Extension
 * Connects to the MCP Server's WebSocket bridge
 * Uses eda.sys_WebSocket.register / send / close API
 */

import { BridgeRequest, BridgeResponse, isRequest, createResponse } from './protocol.js';

type RequestHandler = (request: BridgeRequest) => Promise<BridgeResponse>;

const WS_ID = 'ai-eda-bridge';
let onRequestHandler: RequestHandler | null = null;
let connected = false;

/**
 * Set the handler for incoming requests from MCP Server
 */
export function setRequestHandler(handler: RequestHandler): void {
  onRequestHandler = handler;
}

/**
 * Connect to the MCP Server WebSocket bridge
 */
export function connectToServer(url: string = 'ws://localhost:8765'): void {
  if (connected) {
    disconnectFromServer();
  }

  try {
    eda.sys_WebSocket.register(
      WS_ID,
      url,
      // receiveMessageCallFn — called when a message arrives
      async (data: string) => {
        try {
          const msg = JSON.parse(data);
          if (isRequest(msg) && onRequestHandler) {
            const response = await onRequestHandler(msg);
            eda.sys_WebSocket.send(WS_ID, JSON.stringify(response));
          }
        } catch (e) {
          console.error('[AI Bridge] Failed to handle message:', e);
        }
      },
      // connectedCallFn — called when connection is established
      () => {
        connected = true;
        eda.sys_ToastMessage.showMessage(
          'AI Bridge: Connected to MCP Server',
          ESYS_ToastMessageType.SUCCESS,
        );
      },
      // protocols
      '',
    );
  } catch (e) {
    console.error('[AI Bridge] Failed to connect:', e);
    eda.sys_ToastMessage.showMessage(
      `AI Bridge: Connection failed - ${e}`,
      ESYS_ToastMessageType.ERROR,
    );
  }
}

/**
 * Disconnect from the MCP Server
 */
export function disconnectFromServer(): void {
  try {
    eda.sys_WebSocket.close(WS_ID);
  } catch (e) {
    // Ignore close errors if not connected
  }
  connected = false;
}

/**
 * Check if connected to MCP Server
 */
export function isConnected(): boolean {
  return connected;
}
