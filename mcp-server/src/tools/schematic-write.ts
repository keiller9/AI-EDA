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
    'Place a component (device) on the schematic at the specified position.\n\nParameters: deviceId is a JLCEDA library reference in "libraryUuid:uuid" format or a bare uuid. Coordinates are in schematic canvas units. Rotation is 0, 90, 180, or 270 degrees.\n\nReturns: { success: boolean, primitive: object, message: string } where primitive is the created component object.\n\nThe component will be added to both BOM and PCB by default. To find valid deviceId values, search the JLCEDA component library.',
    {
      deviceId: z.string().describe('Device ID from JLCEDA library (e.g., component UUID)'),
      x: z.number().describe('X coordinate on the schematic canvas'),
      y: z.number().describe('Y coordinate on the schematic canvas'),
      rotation: z.number().optional().describe('Rotation angle in degrees (0, 90, 180, 270)'),
    },
    async ({ deviceId, x, y, rotation }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_PLACE_COMPONENT, { deviceId, x, y, rotation });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_sch_draw_wire',
    'Draw a wire (electrical connection) on the schematic by specifying a sequence of points.\n\nThe points array defines the wire path with minimum 2 points. Coordinates are in schematic canvas units. Wire segments connect consecutive points.\n\nReturns: { success: boolean, primitive: object, message: string }.\n\nTo connect two component pins, you need their exact pin positions (get these from eda_sch_get_component) and draw a wire between them. Wires create electrical connections between pins they touch.',
    {
      points: z.array(z.object({
        x: z.number().describe('X coordinate'),
        y: z.number().describe('Y coordinate'),
      })).min(2).describe('Array of points defining the wire path (minimum 2 points)'),
    },
    async ({ points }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_DRAW_WIRE, { points });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_sch_modify_attribute',
    'Modify an attribute of a schematic primitive (component or wire).\n\nThe tool auto-detects the primitive type (COMPONENT or WIRE) and calls the appropriate API. Common attribute keys for components: "Value", "Designator", "x", "y", "rotation", "mirror". For wires: "x", "y", "lineWidth".\n\nReturns: { success: boolean, primitive: object, message: string }.\n\nFor bulk modifications, use eda_sch_batch_modify instead — it is significantly more efficient for multiple changes.',
    {
      id: z.string().describe('Primitive ID to modify'),
      key: z.string().describe('Attribute key (e.g., "Value", "Designator", "Name")'),
      value: z.string().describe('New attribute value'),
    },
    async ({ id, key, value }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_MODIFY_ATTRIBUTE, { id, key, value });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_sch_delete_primitive',
    'Delete a primitive from the schematic by its primitive ID.\n\nThe tool auto-detects the primitive type and calls the appropriate delete API. Works for both components and wires.\n\nReturns: { success: boolean, message: string }.\n\nFor deleting multiple primitives, use eda_sch_batch_delete instead — it processes all deletions in parallel.',
    {
      id: z.string().describe('Primitive ID to delete'),
    },
    async ({ id }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_DELETE_PRIMITIVE, { id });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_sch_batch_modify',
    'Batch modify multiple schematic primitive attributes in a single call. Much more efficient than calling eda_sch_modify_attribute repeatedly.\n\nEach modification specifies an id, key, and value. All modifications are executed in parallel.\n\nReturns: { total: number, succeeded: number, failed: number, results: Array<{id, success, error?}> }.\n\nUse this when you need to change attributes on 2 or more primitives. Supports the same attribute keys as eda_sch_modify_attribute.',
    {
      modifications: z.array(z.object({
        id: z.string().describe('Primitive ID to modify'),
        key: z.string().describe('Attribute key'),
        value: z.string().describe('New attribute value'),
      })).min(1).describe('Array of modifications'),
    },
    async ({ modifications }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_BATCH_MODIFY, { modifications });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_sch_batch_delete',
    'Batch delete multiple schematic primitives in a single call. Much more efficient than calling eda_sch_delete_primitive repeatedly.\n\nAll deletions are executed in parallel.\n\nReturns: { total: number, succeeded: number, failed: number, results: Array<{id, success, error?}> }.\n\nUse this when you need to delete 2 or more primitives at once.',
    {
      ids: z.array(z.string()).min(1).describe('Array of primitive IDs to delete'),
    },
    async ({ ids }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_BATCH_DELETE, { ids });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );
}
