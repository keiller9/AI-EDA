/**
 * WebSocket Client for EDA Extension
 * Connects to the MCP Server's WebSocket bridge
 * Uses eda.sys_WebSocket.register / send / close API
 */

import { BridgeRequest, BridgeResponse, isRequest, createResponse } from './protocol.js';

type RequestHandler = (request: BridgeRequest) => Promise<BridgeResponse>;

const WS_ID_PREFIX = 'ai-eda-bridge';
const HEARTBEAT_INTERVAL_MS = 15_000; // Check connection every 15s
let currentWsId: string | null = null;
let onRequestHandler: RequestHandler | null = null;
let connected = false;
let heartbeatTimer: any = null;
let lastMessageTime = 0;

/**
 * Set the handler for incoming requests from MCP Server
 */
export function setRequestHandler(handler: RequestHandler): void {
  onRequestHandler = handler;
}

/**
 * Connect to the MCP Server WebSocket bridge
 */
export function connectToServer(url: string = 'ws://127.0.0.1:8765'): void {
  if (connected && currentWsId) {
    disconnectFromServer();
  }

  // Use a unique ID each time to avoid ID conflicts in EDA's internal state
  const wsId = WS_ID_PREFIX + '-' + Date.now();

  // Close any previous connection first (if any)
  if (currentWsId) {
    try { eda.sys_WebSocket.close(currentWsId); } catch (_) { /* ignore */ }
    currentWsId = null;
  }

  // Message handler — EDA passes MessageEvent, not raw string
  function onMessage(event: any) {
    lastMessageTime = Date.now();
    try {
      const raw = typeof event === 'string' ? event : (event?.data ?? event);
      const data = typeof raw === 'string' ? raw : String(raw);
      const msg = JSON.parse(data);
      if (isRequest(msg) && onRequestHandler) {
        onRequestHandler(msg).then((response) => {
          eda.sys_WebSocket.send(wsId, JSON.stringify(response));
        }).catch((e) => {
          const errResponse = createResponse(msg.id, false, undefined, String(e));
          eda.sys_WebSocket.send(wsId, JSON.stringify(errResponse));
        });
      }
    } catch (e) {
      console.error('[AI Bridge] Failed to handle message:', e);
    }
  }

  function onConnected() {
    connected = true;
    currentWsId = wsId;
    lastMessageTime = Date.now();
    startHeartbeat(wsId);
    eda.sys_ToastMessage.showMessage(
      'AI Bridge: Connected to MCP Server',
      ESYS_ToastMessageType.SUCCESS,
    );
  }

  eda.sys_ToastMessage.showMessage(
    `AI Bridge: Connecting to ${url} ...`,
    ESYS_ToastMessageType.INFO,
  );

  try {
    eda.sys_WebSocket.register(wsId, url, onMessage, onConnected);
    currentWsId = wsId;
    // Note: register() is async internally — if it fails, connectedCallFn won't fire
    // and EDA may show its own error toast. We set a timeout to detect silent failures.
    setTimeout(() => {
      if (!connected) {
        eda.sys_ToastMessage.showMessage(
          'AI Bridge: Connection timed out. Make sure MCP Server is running (port 8765).',
          ESYS_ToastMessageType.WARNING,
        );
      }
    }, 8000);
  } catch (e: any) {
    connected = false;
    currentWsId = null;
    const errMsg = e?.message || e?.toString() || String(e);
    eda.sys_ToastMessage.showMessage(
      `AI Bridge: Connection failed - ${errMsg}`,
      ESYS_ToastMessageType.ERROR,
    );
  }
}

/**
 * Start heartbeat to detect connection loss.
 * Sends a small ping message periodically. If the send fails,
 * the connection is considered lost and we mark as disconnected.
 */
function startHeartbeat(wsId: string): void {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (!connected || !currentWsId || currentWsId !== wsId) {
      stopHeartbeat();
      return;
    }
    try {
      // Send a ping — if the connection is broken, this will throw
      eda.sys_WebSocket.send(wsId, JSON.stringify({ type: 'ping', ts: Date.now() }));
    } catch {
      // Connection lost
      connected = false;
      stopHeartbeat();
      eda.sys_ToastMessage.showMessage(
        'AI Bridge: Connection lost. Use AI Bridge → Connect to reconnect.',
        ESYS_ToastMessageType.WARNING,
      );
    }
  }, HEARTBEAT_INTERVAL_MS);
}

function stopHeartbeat(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

/**
 * Disconnect from the MCP Server
 */
export function disconnectFromServer(): void {
  stopHeartbeat();
  if (currentWsId) {
    try {
      eda.sys_WebSocket.close(currentWsId);
    } catch (e) {
      // Ignore close errors if not connected
    }
    currentWsId = null;
  }
  connected = false;
}

/**
 * Check if connected to MCP Server
 */
export function isConnected(): boolean {
  return connected;
}

/**
 * Get the current WebSocket connection ID (for diagnostics)
 */
export function getCurrentWsId(): string | null {
  return currentWsId;
}
