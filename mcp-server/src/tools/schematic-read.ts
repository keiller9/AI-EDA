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
    'List primitives of a specified type in the current schematic.\n\nSupported types: COMPONENT, WIRE, PIN, TEXT, ARC, RECTANGLE, POLYGON, CIRCLE, BUS, ATTRIBUTE.\n\nReturns: Array of primitive objects matching the specified type.\n\nIMPORTANT: For COMPONENT and WIRE types, this returns ALL primitives via dedicated APIs. For other types (PIN, TEXT, ARC, etc.), this can only return currently SELECTED primitives of that type — it does NOT list all primitives of that type in the document.\n\nPrefer eda_sch_list_components for component data or eda_sch_list_wires for wire data.',
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

  // ============ Progressive Disclosure (Level 3) ============

  server.tool(
    'eda_sch_get_component_context',
    'Get comprehensive context for a schematic component: full details, pins, connected nets, and nearby components.\n\nThis is the richest level of component information, combining data that would otherwise require multiple tool calls.\n\nReturns: { component: object, pins: array, connectedNets: Array<{name, pinCount}>, nearbyComponents: Array<{id, designator, value, distance}> }.\n\nThe three levels of SCH component detail:\n1. eda_sch_list_components — compact list for all components\n2. eda_sch_get_component — full attributes + pins for one component\n3. eda_sch_get_component_context (this tool) — component + connected nets + spatial neighbors\n\nUse this when you need to understand a component in its circuit context.',
    { id: z.string().describe('Component primitive ID. Get this from eda_sch_list_components results.') },
    async ({ id }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_GET_COMPONENT_CONTEXT, { id });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  // ============ Selection ============

  server.tool(
    'eda_sch_get_selection',
    'Get the primitive IDs of all currently selected elements in the schematic editor.\n\nReturns: { selectedIds: string[] }.\n\nUse this to discover what the user has selected in the editor, then inspect those elements with eda_sch_get_component or other tools.',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_GET_SELECTION);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_sch_get_mouse_position',
    'Get the current mouse position on the schematic canvas.\n\nReturns: { x: number, y: number }.',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_GET_MOUSE_POSITION);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_sch_get_primitives_bbox',
    'Get the bounding box of specified schematic primitives.\n\nReturns: { left, top, right, bottom } or null.',
    { ids: z.array(z.string()).min(1).describe('Array of primitive IDs') },
    async ({ ids }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_GET_PRIMITIVES_BBOX, { ids });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );
}
