/**
 * PCB write tools - Canvas operations for PCB documents
 */

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WSBridge } from '../ws-bridge.js';
import { BridgeCommand } from '../protocol.js';

export function registerPcbWriteTools(server: McpServer, bridge: WSBridge): void {

  server.tool(
    'eda_pcb_place_component',
    'Place a component on the PCB at the specified position and layer.\n\nThe id parameter is a component identifier in "libraryUuid:uuid" or bare uuid format. Coordinates are in mils. Default layer is TopLayer.\n\nReturns: { success: boolean, primitive: object, message: string }.\n\nUse eda_pcb_list_layers to see valid layer names before placing. The component will appear at the specified (x, y) coordinates with the given rotation on the target layer.',
    {
      id: z.string().describe('Component ID (matching schematic designator)'),
      x: z.number().describe('X coordinate on the PCB canvas (in mils)'),
      y: z.number().describe('Y coordinate on the PCB canvas (in mils)'),
      layer: z.string().optional().describe('Target layer (e.g., "TopLayer", "BottomLayer"). Defaults to TopLayer'),
      rotation: z.number().optional().describe('Rotation angle in degrees'),
    },
    async ({ id, x, y, layer, rotation }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_PLACE_COMPONENT, { id, x, y, layer, rotation });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_draw_line',
    'Draw a copper trace on the PCB by specifying a sequence of points, target layer, and trace width.\n\nPoints define the trace path (minimum 2). Coordinates and width are in mils. The layer must be a valid copper layer name (e.g., "TopLayer", "BottomLayer", "Inner1"). Optionally assign a net name.\n\nReturns: { success: boolean, segments: array, message: string } where segments lists each created line primitive.\n\nMultiple segments between consecutive points are created in parallel. For traces that need to switch layers, place a via (eda_pcb_place_via) at the transition point and draw separate traces on each layer.',
    {
      points: z.array(z.object({
        x: z.number().describe('X coordinate (in mils)'),
        y: z.number().describe('Y coordinate (in mils)'),
      })).min(2).describe('Array of points defining the trace path'),
      layer: z.string().describe('Target copper layer (e.g., "TopLayer", "BottomLayer", "Inner1")'),
      width: z.number().describe('Trace width in mils'),
      net: z.string().optional().describe('Net name to assign to the trace'),
    },
    async ({ points, layer, width, net }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_DRAW_LINE, { points, layer, width, net });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_place_via',
    'Place a via (through-hole, blind, or buried) on the PCB at the specified position.\n\nCoordinates are in mils. holeRadius and radius default to 6mil and 12mil respectively. Assign a net to electrically connect layers.\n\nReturns: { success: boolean, primitive: object, message: string }.\n\nUse vias to transition traces between copper layers. Place the via at the desired transition point, then draw traces on each layer connecting to the via position.',
    {
      x: z.number().describe('X coordinate (in mils)'),
      y: z.number().describe('Y coordinate (in mils)'),
      holeRadius: z.number().optional().describe('Via hole radius in mils'),
      radius: z.number().optional().describe('Via copper annular ring radius in mils'),
      net: z.string().optional().describe('Net name to assign to the via'),
      type: z.string().optional().describe('Via type: "through", "blind", "buried". Defaults to "through"'),
    },
    async ({ x, y, holeRadius, radius, net, type }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_PLACE_VIA, { x, y, holeRadius, radius, net, type });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_batch_move',
    'Batch move multiple PCB components to new positions in a single call. Much more efficient than calling eda_pcb_modify_attribute for each component.\n\nEach move specifies a component primitiveId, new x/y coordinates (in mils), and optional rotation. All moves execute in parallel.\n\nReturns: { total: number, succeeded: number, failed: number, results: Array<{id, success, error?}> }.\n\nUse this for layout rearrangement when you need to reposition 2 or more components. Get component IDs from eda_pcb_list_components first.',
    {
      moves: z.array(z.object({
        id: z.string().describe('Component primitiveId'),
        x: z.number().describe('New X coordinate (in mils)'),
        y: z.number().describe('New Y coordinate (in mils)'),
        rotation: z.number().optional().describe('New rotation angle in degrees'),
      })).min(1).describe('Array of component moves'),
    },
    async ({ moves }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_BATCH_MOVE, { moves });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_modify_attribute',
    'Modify an attribute of a PCB primitive (component, trace, or via).\n\nThe tool auto-detects the primitive type by trying component, then line, then via modify APIs. Numeric attribute keys: x, y, startX, startY, endX, endY, rotation, lineWidth, holeDiameter, diameter. Boolean keys: primitiveLock. String keys: all others (e.g., net, layer, designator).\n\nReturns: { success: boolean, primitive: object, message: string }.\n\nFor bulk modifications, use eda_pcb_batch_modify instead.',
    {
      id: z.string().describe('Primitive ID to modify'),
      key: z.string().describe('Attribute key'),
      value: z.string().describe('New attribute value'),
    },
    async ({ id, key, value }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_MODIFY_ATTRIBUTE, { id, key, value });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_delete_primitive',
    'Delete a PCB primitive by its ID. Works for components, traces (lines), and vias.\n\nThe tool auto-detects the primitive type by trying component, then line, then via delete APIs.\n\nReturns: { success: boolean, message: string }.\n\nFor deleting multiple primitives, use eda_pcb_batch_delete instead — it processes all deletions in parallel.',
    {
      id: z.string().describe('Primitive ID to delete'),
    },
    async ({ id }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_DELETE_PRIMITIVE, { id });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_batch_modify',
    'Batch modify multiple PCB primitive attributes in a single call. Much more efficient than calling eda_pcb_modify_attribute repeatedly.\n\nEach modification specifies an id, key, and value. All modifications execute in parallel. Supports the same attribute keys as eda_pcb_modify_attribute.\n\nReturns: { total: number, succeeded: number, failed: number, results: Array<{id, success, error?}> }.',
    {
      modifications: z.array(z.object({
        id: z.string().describe('Primitive ID to modify'),
        key: z.string().describe('Attribute key'),
        value: z.string().describe('New attribute value'),
      })).min(1).describe('Array of modifications'),
    },
    async ({ modifications }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_BATCH_MODIFY, { modifications });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_batch_delete',
    'Batch delete multiple PCB primitives in a single call. Much more efficient than calling eda_pcb_delete_primitive repeatedly.\n\nAll deletions execute in parallel. Works for any combination of components, traces, and vias.\n\nReturns: { total: number, succeeded: number, failed: number, results: Array<{id, success, error?}> }.',
    {
      ids: z.array(z.string()).min(1).describe('Array of primitive IDs to delete'),
    },
    async ({ ids }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_BATCH_DELETE, { ids });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );
}
