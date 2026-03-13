/**
 * Schematic write tools - Canvas operations for schematic documents
 */

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WSBridge } from '../ws-bridge.js';
import { BridgeCommand } from '../protocol.js';

export function registerSchematicWriteTools(server: McpServer, bridge: WSBridge): void {

  server.tool(
    'eda_sch_place_component',
    'Place a component (device) on the schematic at the specified position. Use a device ID from the JLCEDA library.',
    {
      deviceId: z.string().describe('Device ID from JLCEDA library (e.g., component UUID)'),
      x: z.number().describe('X coordinate on the schematic canvas'),
      y: z.number().describe('Y coordinate on the schematic canvas'),
      rotation: z.number().optional().describe('Rotation angle in degrees (0, 90, 180, 270)'),
    },
    async ({ deviceId, x, y, rotation }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_PLACE_COMPONENT, { deviceId, x, y, rotation });
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'eda_sch_draw_wire',
    'Draw a wire (electrical connection) on the schematic by specifying a sequence of points',
    {
      points: z.array(z.object({
        x: z.number().describe('X coordinate'),
        y: z.number().describe('Y coordinate'),
      })).min(2).describe('Array of points defining the wire path (minimum 2 points)'),
    },
    async ({ points }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_DRAW_WIRE, { points });
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'eda_sch_modify_attribute',
    'Modify an attribute of a schematic primitive (e.g., change component value, designator)',
    {
      id: z.string().describe('Primitive ID to modify'),
      key: z.string().describe('Attribute key (e.g., "Value", "Designator", "Name")'),
      value: z.string().describe('New attribute value'),
    },
    async ({ id, key, value }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_MODIFY_ATTRIBUTE, { id, key, value });
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'eda_sch_delete_primitive',
    'Delete a primitive from the schematic by its ID',
    {
      id: z.string().describe('Primitive ID to delete'),
    },
    async ({ id }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_DELETE_PRIMITIVE, { id });
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );
}
