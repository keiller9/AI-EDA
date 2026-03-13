/**
 * WebSocket Bridge Server
 * Manages WebSocket connections between MCP Server and EDA Extension
 */

import { WebSocketServer, WebSocket } from 'ws';
import { BridgeCommand, BridgeResponse, createRequest, isResponse } from './protocol.js';

const DEFAULT_PORT = 8765;
const REQUEST_TIMEOUT_MS = 30_000;

interface PendingRequest {
  resolve: (response: BridgeResponse) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export class WSBridge {
  private wss: WebSocketServer | null = null;
  private client: WebSocket | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private port: number;

  constructor(port?: number) {
    this.port = port ?? (Number(process.env.WS_PORT) || DEFAULT_PORT);
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.wss = new WebSocketServer({ port: this.port });

      this.wss.on('listening', () => {
        console.error(`[WSBridge] WebSocket server listening on port ${this.port}`);
        resolve();
      });

      this.wss.on('error', (err) => {
        console.error(`[WSBridge] Server error:`, err);
        reject(err);
      });

      this.wss.on('connection', (ws, req) => {
        console.error(`[WSBridge] EDA extension connected from ${req.socket.remoteAddress}`);

        if (this.client) {
          console.error(`[WSBridge] Closing previous connection`);
          this.client.close();
        }

        this.client = ws;

        ws.on('message', (data) => {
          try {
            const msg = JSON.parse(data.toString());
            if (isResponse(msg)) {
              this.handleResponse(msg);
            }
          } catch (e) {
            console.error(`[WSBridge] Failed to parse message:`, e);
          }
        });

        ws.on('close', () => {
          console.error(`[WSBridge] EDA extension disconnected`);
          if (this.client === ws) {
            this.client = null;
          }
          this.rejectAllPending('EDA extension disconnected');
        });

        ws.on('error', (err) => {
          console.error(`[WSBridge] WebSocket error:`, err);
        });
      });
    });
  }

  isConnected(): boolean {
    return this.client !== null && this.client.readyState === WebSocket.OPEN;
  }

  getPort(): number {
    return this.port;
  }

  async sendCommand(command: BridgeCommand, params: Record<string, unknown> = {}): Promise<unknown> {
    if (!this.isConnected()) {
      throw new Error('EDA extension is not connected. Please open JLCEDA Pro and connect the AI Bridge extension.');
    }

    const request = createRequest(command, params);

    return new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(request.id);
        reject(new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms for command: ${command}`));
      }, REQUEST_TIMEOUT_MS);

      this.pendingRequests.set(request.id, {
        resolve: (response: BridgeResponse) => {
          if (response.success) {
            resolve(response.data);
          } else {
            reject(new Error(response.error ?? 'Unknown error from EDA extension'));
          }
        },
        reject,
        timer,
      });

      this.client!.send(JSON.stringify(request));
    });
  }

  private handleResponse(response: BridgeResponse): void {
    const pending = this.pendingRequests.get(response.id);
    if (!pending) {
      console.error(`[WSBridge] Received response for unknown request: ${response.id}`);
      return;
    }

    clearTimeout(pending.timer);
    this.pendingRequests.delete(response.id);
    pending.resolve(response);
  }

  private rejectAllPending(reason: string): void {
    for (const [id, pending] of this.pendingRequests) {
      clearTimeout(pending.timer);
      pending.reject(new Error(reason));
    }
    this.pendingRequests.clear();
  }

  async stop(): Promise<void> {
    this.rejectAllPending('Server shutting down');
    if (this.client) {
      this.client.close();
      this.client = null;
    }
    if (this.wss) {
      return new Promise((resolve) => {
        this.wss!.close(() => {
          console.error(`[WSBridge] Server stopped`);
          resolve();
        });
      });
    }
  }
}
