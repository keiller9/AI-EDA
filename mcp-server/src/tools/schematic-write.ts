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
    'Place a component (device) on the schematic at the specified position.\n\nParameters: deviceId is a JLCEDA library reference in "libraryUuid:uuid" format or a bare uuid. Coordinates are in schematic canvas units. Rotation is 0, 90, 180, or 270 degrees.\n\nReturns: { success: boolean, primitive: object, message: string } where primitive is the created component object.\n\nThe component will be added to both BOM and PCB by default. To find valid deviceId values, use eda_lib_search_device first.\n\nBEFORE placing: verify the device is correct for the circuit (check datasheet for pin count, voltage ratings). After placing, you MUST connect all power pins (VCC→power net, GND→ground net) and add decoupling capacitors near IC power pins.',
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
    'Draw a wire (electrical connection) on the schematic by specifying a sequence of points.\n\nThe points array defines the wire path with minimum 2 points. Coordinates are in schematic canvas units. Wire segments connect consecutive points.\n\nReturns: { success: boolean, primitive: object, message: string }.\n\nTo connect two component pins, you need their exact pin positions (get these from eda_sch_get_component) and draw a wire between them.\n\nELECTRICAL SAFETY: Before drawing, verify the connection is electrically valid — do NOT connect two outputs together, do NOT short VCC to GND, do NOT leave power pins unconnected. Use eda_sch_get_component_context to check pin types and existing connections first.',
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

  // ============ Auto Layout / Routing ============

  server.tool(
    'eda_sch_auto_layout',
    'Trigger automatic layout for the current schematic. Rearranges components for better readability.\n\nOptionally specify component UUIDs to lay out only specific components. If omitted, all components are laid out.\n\nReturns: { success: boolean, result: any, message: string }.\n\nThis calls the EDA built-in auto layout algorithm. Results may vary — review the layout after execution.',
    {
      uuids: z.array(z.string()).optional().describe('Optional array of component UUIDs to lay out. If omitted, all components are included.'),
    },
    async ({ uuids }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_AUTO_LAYOUT, { uuids });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_sch_auto_routing',
    'Trigger automatic wire routing for the current schematic. Draws wires to connect component pins based on netlist.\n\nOptionally specify component UUIDs to route only specific components. If omitted, all connections are routed.\n\nReturns: { success: boolean, result: any, message: string }.\n\nThis calls the EDA built-in auto routing algorithm. Best used after auto layout or manual component placement.',
    {
      uuids: z.array(z.string()).optional().describe('Optional array of component UUIDs to route. If omitted, all connections are routed.'),
    },
    async ({ uuids }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_AUTO_ROUTING, { uuids });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  // ============ Document ============

  server.tool(
    'eda_sch_save',
    'Save the current schematic document.',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_SAVE);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_sch_import_changes',
    'Import changes from PCB back into the schematic. Synchronizes modifications made in the PCB editor.',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_IMPORT_CHANGES);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_sch_clear_selection',
    'Clear all selection in the schematic editor.',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_CLEAR_SELECTION);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  // ============ Selection Control ============

  server.tool(
    'eda_sch_select_primitives',
    'Select specific primitives in the schematic editor by their IDs. This visually selects them in the UI.\n\nReturns: { success: boolean, selectedCount: number, message: string }.\n\nUse this to highlight specific components or wires for the user to see. Combine with eda_sch_list_components to find IDs first.',
    {
      ids: z.array(z.string()).min(1).describe('Array of primitive IDs to select'),
    },
    async ({ ids }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_SELECT_PRIMITIVES, { ids });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_sch_cross_probe',
    'Cross-probe select in the schematic: highlight and select components, pins, or nets by name.\n\nThis is the schematic equivalent of clicking on a component in PCB to highlight it in schematic. Specify designators (e.g. ["U1", "R1"]), pin references (e.g. ["U1_1", "U1_2"]), or net names (e.g. ["VCC", "GND"]).\n\nReturns: { success: boolean, message: string }.',
    {
      components: z.array(z.string()).optional().describe('Component designators to highlight (e.g. ["U1", "R1"])'),
      pins: z.array(z.string()).optional().describe('Pin references in "Designator_PinNumber" format (e.g. ["U1_1", "U1_2"])'),
      nets: z.array(z.string()).optional().describe('Net names to highlight (e.g. ["VCC", "GND"])'),
      highlight: z.boolean().optional().describe('Whether to highlight (default true)'),
    },
    async ({ components, pins, nets, highlight }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_CROSS_PROBE, { components, pins, nets, highlight });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  // ============ Net Symbols ============

  server.tool(
    'eda_sch_create_net_flag',
    'Create a net flag (power symbol) on the schematic — such as GND, VCC, 3V3, etc.\n\nNet flags are the power/ground symbols that label nets without drawing wires between them. Place them near IC power pins to establish power connections.\n\nParameters:\n- identification: the flag type identifier (Power, Ground, AnalogGround, ProtectGround)\n- net: the net name this flag represents (e.g. "GND", "VCC")\n- x, y: canvas coordinates\n\nReturns: { success: boolean, primitive: object, message: string }.\n\nELECTRICAL SAFETY: Only place GND flags on ground pins, VCC/power flags on power pins. Verify the pin you are connecting to is indeed a power/ground pin by checking eda_sch_get_component_context first. Do NOT place a VCC flag on a signal pin.',
    {
      identification: z.string().describe('Net flag type identifier'),
      net: z.string().describe('Net name (e.g. "GND", "VCC", "3V3")'),
      x: z.number().describe('X coordinate on canvas'),
      y: z.number().describe('Y coordinate on canvas'),
      rotation: z.number().optional().describe('Rotation in degrees (default 0)'),
      mirror: z.boolean().optional().describe('Mirror the symbol (default false)'),
    },
    async ({ identification, net, x, y, rotation, mirror }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_CREATE_NET_FLAG, { identification, net, x, y, rotation, mirror });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_sch_create_net_port',
    'Create a net port on the schematic — a directional port symbol (IN, OUT, BI) for inter-sheet connectivity.\n\nNet ports connect signals across different schematic pages. The direction indicates signal flow.\n\nReturns: { success: boolean, primitive: object, message: string }.',
    {
      direction: z.string().describe('Port direction: "IN", "OUT", or "BI" (bidirectional)'),
      net: z.string().describe('Net name for this port'),
      x: z.number().describe('X coordinate on canvas'),
      y: z.number().describe('Y coordinate on canvas'),
      rotation: z.number().optional().describe('Rotation in degrees (default 0)'),
      mirror: z.boolean().optional().describe('Mirror the symbol (default false)'),
    },
    async ({ direction, net, x, y, rotation, mirror }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_CREATE_NET_PORT, { direction, net, x, y, rotation, mirror });
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

  // ============ Navigation ============

  server.tool(
    'eda_sch_navigate_to',
    'Navigate the schematic view to center on specific coordinates.',
    {
      x: z.number().describe('X coordinate to navigate to'),
      y: z.number().describe('Y coordinate to navigate to'),
    },
    async ({ x, y }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_NAVIGATE_TO, { x, y });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_sch_navigate_to_region',
    'Navigate and zoom the schematic view to fit a specific region.',
    {
      left: z.number().describe('Left boundary'),
      right: z.number().describe('Right boundary'),
      top: z.number().describe('Top boundary'),
      bottom: z.number().describe('Bottom boundary'),
    },
    async ({ left, right, top, bottom }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_NAVIGATE_TO_REGION, { left, right, top, bottom });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_sch_create_net_label',
    'Place a net label on the schematic at the specified position. Net labels name signals and create logical connections between same-named labels.',
    {
      x: z.number().describe('X coordinate'),
      y: z.number().describe('Y coordinate'),
      net: z.string().describe('Net name for the label (e.g. "SDA", "SCL", "RESET")'),
    },
    async ({ x, y, net }) => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_CREATE_NET_LABEL, { x, y, net });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );
}
