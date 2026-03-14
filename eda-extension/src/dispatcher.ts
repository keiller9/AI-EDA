/**
 * Command Dispatcher
 * Routes incoming bridge requests to the appropriate handler
 */

import { BridgeRequest, BridgeResponse, BridgeCommand, createResponse } from './protocol.js';

type CommandHandler = (params: Record<string, unknown>) => Promise<unknown>;

const handlers = new Map<string, CommandHandler>();

// ============ Command Logging ============

export interface CommandLogEntry {
  command: string;
  timestamp: number;
  durationMs: number;
  success: boolean;
  error?: string;
}

const MAX_LOG_ENTRIES = 50;
const commandLog: CommandLogEntry[] = [];
let totalCommands = 0;
let totalSucceeded = 0;
let totalDurationMs = 0;

export function getCommandLog(): CommandLogEntry[] {
  return commandLog;
}

export function getCommandStats(): { total: number; succeeded: number; failed: number; avgDurationMs: number } {
  return {
    total: totalCommands,
    succeeded: totalSucceeded,
    failed: totalCommands - totalSucceeded,
    avgDurationMs: totalCommands > 0 ? Math.round(totalDurationMs / totalCommands) : 0,
  };
}

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

  const startTime = Date.now();
  let success = false;
  let errorMsg: string | undefined;

  try {
    const data = await handler(request.params);
    success = true;
    return createResponse(request.id, true, data);
  } catch (e: any) {
    errorMsg = e?.message ?? String(e);
    console.error(`[Dispatcher] Error handling ${request.command}:`, errorMsg);
    return createResponse(request.id, false, undefined, errorMsg);
  } finally {
    const durationMs = Date.now() - startTime;
    totalCommands++;
    if (success) totalSucceeded++;
    totalDurationMs += durationMs;

    const entry: CommandLogEntry = {
      command: request.command,
      timestamp: startTime,
      durationMs,
      success,
      error: errorMsg,
    };
    commandLog.push(entry);
    if (commandLog.length > MAX_LOG_ENTRIES) {
      commandLog.shift();
    }
  }
}
