/**
 * Command Dispatcher
 * Routes incoming bridge requests to the appropriate handler
 */

import { BridgeRequest, BridgeResponse, BridgeCommand, createResponse } from './protocol.js';

type CommandHandler = (params: Record<string, unknown>) => Promise<unknown>;

const handlers = new Map<string, CommandHandler>();

/**
 * Register a handler for a specific command
 */
export function registerHandler(command: BridgeCommand, handler: CommandHandler): void {
  handlers.set(command, handler);
}

/**
 * Dispatch an incoming request to the appropriate handler
 */
export async function dispatch(request: BridgeRequest): Promise<BridgeResponse> {
  const handler = handlers.get(request.command);

  if (!handler) {
    return createResponse(request.id, false, undefined, `Unknown command: ${request.command}`);
  }

  try {
    const data = await handler(request.params);
    return createResponse(request.id, true, data);
  } catch (e: any) {
    const errorMsg = e?.message ?? String(e);
    console.error(`[Dispatcher] Error handling ${request.command}:`, errorMsg);
    return createResponse(request.id, false, undefined, errorMsg);
  }
}
