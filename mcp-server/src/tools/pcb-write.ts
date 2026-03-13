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
    'Place a component on the PCB at the specified position and layer',
    {
      id: z.string().describe('Component ID (matching schematic designator)'),
      x: z.number().describe('X coordinate on the PCB canvas (in mils)'),
      y: z.number().describe('Y coordinate on the PCB canvas (in mils)'),
      layer: z.string().optional().describe('Target layer (e.g., "TopLayer", "BottomLayer"). Defaults to TopLayer'),
      rotation: z.number().optional().describe('Rotation angle in degrees'),
    },
    async ({ id, x, y, layer, rotation }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_PLACE_COMPONENT, { id, x, y, layer, rotation });
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'eda_pcb_draw_line',
    'Draw a copper trace on the PCB by specifying a sequence of points, layer, and width',
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
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'eda_pcb_place_via',
    'Place a via (through-hole or blind/buried) on the PCB',
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
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'eda_pcb_batch_move',
    'Batch move multiple PCB components to new positions in a single call. Much more efficient than modifying one at a time.',
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
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'eda_pcb_modify_attribute',
    'Modify an attribute of a PCB primitive (e.g., change pad size, net assignment)',
    {
      id: z.string().describe('Primitive ID to modify'),
      key: z.string().describe('Attribute key'),
      value: z.string().describe('New attribute value'),
    },
    async ({ id, key, value }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_MODIFY_ATTRIBUTE, { id, key, value });
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'eda_pcb_delete_primitive',
    'Delete a PCB primitive by its ID',
    {
      id: z.string().describe('Primitive ID to delete'),
    },
    async ({ id }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_DELETE_PRIMITIVE, { id });
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );
}
