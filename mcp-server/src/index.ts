#!/usr/bin/env node

/**
 * JLCEDA Pro MCP Server
 *
 * Architecture: Claude Code <--Stdio--> MCP Server <--WebSocket--> EDA Extension
 *
 * This server exposes JLCEDA Pro functionality as MCP tools.
 * It communicates with the EDA extension running inside JLCEDA Pro via WebSocket.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { WSBridge } from './ws-bridge.js';
import { registerConnectionTools } from './tools/connection.js';
import { registerSchematicReadTools } from './tools/schematic-read.js';
import { registerPcbReadTools } from './tools/pcb-read.js';
import { registerSchematicWriteTools } from './tools/schematic-write.js';
import { registerPcbWriteTools } from './tools/pcb-write.js';
import { registerSystemTools } from './tools/system.js';

async function main() {
  // Create WebSocket bridge
  const bridge = new WSBridge();

  // Create MCP server
  const server = new McpServer({
    name: 'jlceda-bridge',
    version: '1.0.0',
  });

  // Register all tools
  registerConnectionTools(server, bridge);
  registerSchematicReadTools(server, bridge);
  registerPcbReadTools(server, bridge);
  registerSchematicWriteTools(server, bridge);
  registerPcbWriteTools(server, bridge);
  registerSystemTools(server, bridge);

  // Start WebSocket server (for EDA extension to connect to)
  await bridge.start();

  // Start MCP server with stdio transport (for Claude Code)
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[MCP] JLCEDA Bridge MCP Server started');
  console.error(`[MCP] WebSocket server ready on port ${bridge.getPort()}`);
  console.error('[MCP] Waiting for EDA extension to connect...');

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.error('[MCP] Shutting down...');
    await bridge.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.error('[MCP] Shutting down...');
    await bridge.stop();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('[MCP] Fatal error:', err);
  process.exit(1);
});
