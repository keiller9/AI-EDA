/**
 * WSBridge Unit Tests
 * Tests WebSocket bridge server behavior with a real WebSocket client
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import WebSocket from 'ws';
import { WSBridge } from '../ws-bridge.js';
import { BridgeCommand } from '../protocol.js';

const TEST_PORT = 19765; // Avoid conflict with production port

describe('WSBridge', () => {
  let bridge: WSBridge;

  beforeAll(async () => {
    bridge = new WSBridge(TEST_PORT);
    await bridge.start();
  });

  afterAll(async () => {
    await bridge.stop();
  });

  it('should start and listen on configured port', () => {
    expect(bridge.getPort()).toBe(TEST_PORT);
  });

  it('should report not connected when no client', () => {
    expect(bridge.isConnected()).toBe(false);
  });

  it('should throw when sending command without client', async () => {
    await expect(
      bridge.sendCommand(BridgeCommand.SCH_GET_STATE)
    ).rejects.toThrow('not connected');
  });

  describe('with connected client', () => {
    let client: WebSocket;

    beforeAll(async () => {
      client = new WebSocket(`ws://localhost:${TEST_PORT}`);
      await new Promise<void>((resolve, reject) => {
        client.on('open', resolve);
        client.on('error', reject);
      });
      // Wait for bridge to register the client
      await new Promise(r => setTimeout(r, 50));
    });

    afterAll(() => {
      if (client.readyState === WebSocket.OPEN) {
        client.close();
      }
    });

    it('should report connected', () => {
      expect(bridge.isConnected()).toBe(true);
    });

    it('should send request and receive response', async () => {
      // Set up client to echo back a success response
      client.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'request') {
          client.send(JSON.stringify({
            id: msg.id,
            type: 'response',
            success: true,
            data: { test: 'ok', command: msg.command },
          }));
        }
      });

      const result = await bridge.sendCommand(BridgeCommand.SCH_GET_STATE);
      expect(result).toEqual({ test: 'ok', command: 'sch.getState' });
    });

    it('should reject on error response', async () => {
      // Remove previous listener and add error-sending one
      client.removeAllListeners('message');
      client.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'request') {
          client.send(JSON.stringify({
            id: msg.id,
            type: 'response',
            success: false,
            error: 'Test error message',
          }));
        }
      });

      await expect(
        bridge.sendCommand(BridgeCommand.PCB_GET_STATE)
      ).rejects.toThrow('Test error message');
    });

    it('should ignore ping messages', async () => {
      // Send a ping — bridge should not crash
      client.send(JSON.stringify({ type: 'ping' }));
      // If bridge crashed, isConnected would become false
      await new Promise(r => setTimeout(r, 50));
      expect(bridge.isConnected()).toBe(true);
    });
  });
});
