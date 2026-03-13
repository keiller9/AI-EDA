/**
 * System tools - DRC, export, document info, notifications
 */

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WSBridge } from '../ws-bridge.js';
import { BridgeCommand } from '../protocol.js';

export function registerSystemTools(server: McpServer, bridge: WSBridge): void {

  server.tool(
    'eda_sys_run_drc',
    'Run Design Rule Check (DRC) on the current schematic or PCB document',
    {
      type: z.enum(['sch', 'pcb']).describe('Document type to run DRC on: "sch" for schematic, "pcb" for PCB'),
    },
    async ({ type }) => {
      const data = await bridge.sendCommand(BridgeCommand.SYS_RUN_DRC, { type });
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'eda_sys_export_bom',
    'Export Bill of Materials (BOM) from the current schematic',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.SYS_EXPORT_BOM);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'eda_sys_get_document_info',
    'Get information about the currently active document (type, name, project)',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.SYS_GET_DOCUMENT_INFO);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'eda_sys_show_message',
    'Show a toast notification message in the JLCEDA editor',
    {
      message: z.string().describe('Message text to display'),
      type: z.enum(['info', 'success', 'warning', 'error']).optional().describe('Message type. Defaults to "info"'),
    },
    async ({ message, type }) => {
      const data = await bridge.sendCommand(BridgeCommand.SYS_SHOW_MESSAGE, { message, type: type ?? 'info' });
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );
}
