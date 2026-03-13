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
    'Get a high-level summary of the current schematic document.\n\nReturns: { componentCount: number, wireCount: number, hasNetlist: boolean }.\n\nUse this as a lightweight check to understand the schematic scope before drilling into details. For a richer overview including component list and net data, use eda_get_design_overview instead. Only works when a schematic document is active in JLCEDA Pro.',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_GET_STATE);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_sch_list_components',
    'List all components in the current schematic in compact format.\n\nReturns: Array of { id, designator, value, x, y, rotation }. Use the optional filter parameter to narrow results by designator or value (case-insensitive substring match).\n\nThis returns a compact summary. To get full details for a specific component including its pins, call eda_sch_get_component with the id from this list. For finding a component by name when you do not know the exact designator, consider eda_find_component which searches with full details.',
    { filter: z.string().optional().describe('Optional filter string to match component name or designator') },
    async ({ filter }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_LIST_COMPONENTS, { filter });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_sch_list_nets',
    'List all nets (electrical connections) in the current schematic.\n\nReturns: The full netlist in STANDARD format, typically an array of net objects with connected pin references.\n\nUse this to understand electrical connectivity between components. For PCB nets with physical trace lengths, use eda_pcb_list_nets instead.',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_LIST_NETS);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_sch_list_wires',
    'List all wire primitives in the current schematic with their coordinates.\n\nReturns: Array of wire primitive objects, each containing start/end coordinates and properties.\n\nWires are the graphical line segments that form electrical connections on the schematic. This returns raw wire primitives, not logical net connections. For logical net information, use eda_sch_list_nets instead.',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_LIST_WIRES);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_sch_list_primitives',
    'List all primitives of a specified type in the current schematic.\n\nSupported types: COMPONENT, WIRE, PIN, TEXT, ARC, RECTANGLE, POLYGON, CIRCLE, BUS, ATTRIBUTE.\n\nReturns: Array of primitive objects matching the specified type. For COMPONENT and WIRE types, this calls dedicated APIs and returns complete results. For other types, results depend on the current selection in the editor.\n\nPrefer eda_sch_list_components for component data (compact format with filter support) or eda_sch_list_wires for wire data. Use this tool when you need other primitive types like TEXT, ARC, or BUS.',
    { type: z.string().describe('Primitive type: COMPONENT, WIRE, PIN, TEXT, ARC, RECTANGLE, POLYGON, CIRCLE, BUS, ATTRIBUTE') },
    async ({ type }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_LIST_PRIMITIVES, { type });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_sch_get_component',
    'Get detailed information about a specific schematic component by its primitive ID, including all pins.\n\nReturns: Full component object with all attributes, plus a pins array listing each pin with its properties.\n\nUse this after calling eda_sch_list_components to drill into a specific component. The id parameter must be a primitiveId from the list_components result. This is the second level of detail: list_components gives compact summaries, this gives full attributes and pin data.',
    { id: z.string().describe('Component ID') },
    async ({ id }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_GET_COMPONENT, { id });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );
}
