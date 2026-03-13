/**
 * Schematic read tools - Canvas awareness for schematic documents
 */

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WSBridge } from '../ws-bridge.js';
import { BridgeCommand } from '../protocol.js';

export function registerSchematicReadTools(server: McpServer, bridge: WSBridge): void {

  server.tool(
    'eda_sch_get_state',
    'Get the current schematic document state including document name, page count, and basic info',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_GET_STATE);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'eda_sch_list_components',
    'List all components (devices) in the current schematic with their IDs, names, positions, and attributes',
    { filter: z.string().optional().describe('Optional filter string to match component name or designator') },
    async ({ filter }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_LIST_COMPONENTS, { filter });
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'eda_sch_list_nets',
    'List all nets (electrical connections) in the current schematic with connected pins',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_LIST_NETS);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'eda_sch_list_wires',
    'List all wires in the current schematic with their coordinates',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_LIST_WIRES);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'eda_sch_list_primitives',
    'List all primitives of a specified type in the current schematic',
    { type: z.string().describe('Primitive type: COMPONENT, WIRE, PIN, TEXT, ARC, RECTANGLE, POLYGON, CIRCLE, BUS, ATTRIBUTE') },
    async ({ type }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_LIST_PRIMITIVES, { type });
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'eda_sch_get_component',
    'Get detailed information about a specific component by its ID',
    { id: z.string().describe('Component ID') },
    async ({ id }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_GET_COMPONENT, { id });
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );
}
