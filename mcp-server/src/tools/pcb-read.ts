/**
 * PCB read tools - Canvas awareness for PCB documents
 */

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WSBridge } from '../ws-bridge.js';
import { BridgeCommand } from '../protocol.js';

export function registerPcbReadTools(server: McpServer, bridge: WSBridge): void {

  server.tool(
    'eda_pcb_get_state',
    'Get the current PCB document state including board outline, layer stack, and basic info',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_GET_STATE);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_list_components',
    'List all components on the PCB with their positions, layers, and footprints',
    { filter: z.string().optional().describe('Optional filter string to match component designator or footprint') },
    async ({ filter }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_LIST_COMPONENTS, { filter });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_list_nets',
    'List all nets in the current PCB with their names and connected pads',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_LIST_NETS);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_list_layers',
    'Get information about all PCB layers including copper layers, silkscreen, solder mask, etc.',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_LIST_LAYERS);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_list_primitives',
    'List PCB primitives of a specified type, optionally filtered by layer',
    {
      type: z.string().describe('Primitive type: COMPONENT, LINE, ARC, VIA, PAD, POUR, POURED, FILL, STRING, REGION, DIMENSION, POLYLINE, IMAGE, OBJECT'),
      layer: z.string().optional().describe('Optional layer name to filter primitives'),
    },
    async ({ type, layer }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_LIST_PRIMITIVES, { type, layer });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_get_component',
    'Get detailed information about a specific PCB component by its ID',
    { id: z.string().describe('Component ID') },
    async ({ id }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_GET_COMPONENT, { id });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );
}
