/**
 * AI EDA Bridge Extension
 *
 * Entry point for the JLCEDA Pro extension.
 * Connects to the local MCP Server via WebSocket and
 * dispatches commands to the appropriate EDA API handlers.
 */

import { connectToServer, disconnectFromServer, isConnected, setRequestHandler } from './ws-client.js';
import { dispatch } from './dispatcher.js';
import { registerSchematicReadHandlers } from './handlers/schematic-read.js';
import { registerPcbReadHandlers } from './handlers/pcb-read.js';
import { registerSchematicWriteHandlers } from './handlers/schematic-write.js';
import { registerPcbWriteHandlers } from './handlers/pcb-write.js';
import { registerSystemHandlers } from './handlers/system.js';

// ============ Register All Handlers ============

registerSchematicReadHandlers();
registerPcbReadHandlers();
registerSchematicWriteHandlers();
registerPcbWriteHandlers();
registerSystemHandlers();

// Set the dispatcher as the WebSocket request handler
setRequestHandler(dispatch);

// ============ Menu Functions (exported for extension.json registerFn) ============

/**
 * Connect to the MCP Server
 * Registered as menu item: AI Bridge -> 连接 AI
 */
export function connect(): void {
  if (isConnected()) {
    eda.sys_ToastMessage.showMessage(
      'AI Bridge: Already connected',
      ESYS_ToastMessageType.INFO,
    );
    return;
  }

  const url = 'ws://127.0.0.1:8765';
  connectToServer(url);
}

/**
 * Disconnect from the MCP Server
 * Registered as menu item: AI Bridge -> 断开连接
 */
export function disconnect(): void {
  disconnectFromServer();
  eda.sys_ToastMessage.showMessage(
    'AI Bridge: Disconnected',
    ESYS_ToastMessageType.INFO,
  );
}

/**
 * Show connection status
 * Registered as menu item: AI Bridge -> 连接状态
 */
export function status(): void {
  const connected = isConnected();
  eda.sys_ToastMessage.showMessage(
    connected
      ? 'AI Bridge: Connected to MCP Server'
      : 'AI Bridge: Not connected',
    connected ? ESYS_ToastMessageType.SUCCESS : ESYS_ToastMessageType.WARNING,
  );
}
