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
    'Get a high-level summary of the current PCB document.\n\nReturns: { canvasOrigin: {x, y}, layerCount: number, netCount: number, componentCount: number }.\n\nUse this as a lightweight check to understand the PCB scope. The canvasOrigin is needed to interpret absolute coordinates. For a richer overview including component list and net data, use eda_get_design_overview instead. Only works when a PCB document is active in JLCEDA Pro.',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_GET_STATE);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_list_components',
    'List all components on the PCB in compact format.\n\nReturns: Array of { id, designator, x, y, rotation, layer, footprint }. Coordinates are in mils. Use the optional filter parameter to narrow results by designator or footprint (case-insensitive substring match).\n\nThis returns a compact summary. To get full details for a specific component including pads/pins, call eda_pcb_get_component. For spatial context including connected nets and nearby components, use eda_pcb_get_component_context.',
    { filter: z.string().optional().describe('Optional filter string to match component designator or footprint') },
    async ({ filter }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_LIST_COMPONENTS, { filter });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_list_nets',
    'List all nets in the current PCB with their names and routed trace lengths.\n\nReturns: Array of { name: string, length: number }. Length is the total routed copper length in mils.\n\nUse this to analyze routing completeness, identify unrouted nets (length 0), or find specific nets by name. For schematic-level net/connectivity data, use eda_sch_list_nets instead.',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_LIST_NETS);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_list_layers',
    'Get information about all PCB layers including copper, silkscreen, solder mask, paste, and mechanical layers.\n\nReturns: Array of layer objects with properties like name, type, color, and visibility.\n\nUse this to understand the PCB layer stack before placing components or drawing traces. Layer names returned here (e.g., "TopLayer", "BottomLayer", "Inner1") are the valid values for the layer parameter in eda_pcb_draw_line and eda_pcb_place_component.',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_LIST_LAYERS);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_list_primitives',
    'List PCB primitives of a specified type, optionally filtered by layer.\n\nSupported types: COMPONENT, LINE, ARC, VIA, PAD, POUR, POURED, FILL, STRING, REGION, DIMENSION, POLYLINE, IMAGE, OBJECT.\n\nReturns: Array of primitive objects. For COMPONENT, LINE, VIA, and PAD types, returns complete results via dedicated APIs. For other types, results are gathered by scanning all nets.\n\nPrefer eda_pcb_list_components for component data (compact format). Use this tool when you need to enumerate specific primitive types like VIA, PAD, LINE, or POUR across the board.',
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
    'Get detailed information about a specific PCB component by its primitive ID, including all pads/pins.\n\nReturns: Full component object with all attributes, plus a pins array listing each pad with its properties (position, net, shape, size).\n\nUse this after calling eda_pcb_list_components to drill into a specific component. For even richer context including connected net lengths and neighboring components, use eda_pcb_get_component_context instead.',
    { id: z.string().describe('Component ID') },
    async ({ id }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_GET_COMPONENT, { id });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  // ============ Progressive Disclosure ============

  server.tool(
    'eda_pcb_get_component_context',
    'Get comprehensive context for a PCB component: full details, pins, connected nets with lengths, and nearby components.\n\nThis is the richest level of component information, combining data that would otherwise require multiple tool calls.\n\nReturns: { component: object, pins: array, connectedNets: Array<{name, length}>, nearbyComponents: Array<{id, designator, footprint, distance}> }.\n\nThe three levels of PCB component detail:\n1. eda_pcb_list_components — compact list for all components\n2. eda_pcb_get_component — full attributes + pins for one component\n3. eda_pcb_get_component_context (this tool) — component + connected nets + spatial neighbors\n\nUse this when you need to understand a component in its circuit and layout context.',
    {
      id: z.string().describe('Component primitive ID. Get this from eda_pcb_list_components results.'),
    },
    async ({ id }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_GET_COMPONENT_CONTEXT, { id });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );
}
