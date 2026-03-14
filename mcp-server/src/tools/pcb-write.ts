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

  // ============ Document ============

  server.tool(
    'eda_pcb_save',
    'Save the current PCB document.\n\nReturns: { success: boolean, message: string }.',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_SAVE);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_import_changes',
    'Import changes from the schematic into the PCB. Synchronizes component additions, deletions, and net changes from the schematic.\n\nReturns: { success: boolean, message: string }.\n\nRun this after making schematic changes to update the PCB accordingly.',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_IMPORT_CHANGES);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  // ============ Net ============

  server.tool(
    'eda_pcb_highlight_net',
    'Highlight a specific net in the PCB editor. All traces, pads, and vias belonging to this net will be visually highlighted.\n\nUse eda_pcb_unhighlight_net to remove the highlight.',
    { net: z.string().describe('Net name to highlight (e.g. "VCC", "GND", "NET1")') },
    async ({ net }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_HIGHLIGHT_NET, { net });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_unhighlight_net',
    'Remove highlight from a specific net in the PCB editor.',
    { net: z.string().describe('Net name to unhighlight') },
    async ({ net }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_UNHIGHLIGHT_NET, { net });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_select_net',
    'Select all primitives belonging to a specific net in the PCB editor. All traces, pads, and vias of this net will be selected.',
    { net: z.string().describe('Net name to select') },
    async ({ net }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_SELECT_NET, { net });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  // ============ Selection ============

  server.tool(
    'eda_pcb_select_primitives',
    'Select specific primitives in the PCB editor by their IDs. This visually selects them in the UI.\n\nCombine with eda_pcb_list_components or eda_pcb_list_primitives to find IDs first.',
    { ids: z.array(z.string()).min(1).describe('Array of primitive IDs to select') },
    async ({ ids }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_SELECT_PRIMITIVES, { ids });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_cross_probe',
    'Cross-probe select in the PCB: highlight and select components, pins, or nets by name.\n\nSpecify designators (e.g. ["U1"]), pin references (e.g. ["U1_1"]), or net names (e.g. ["VCC"]).',
    {
      components: z.array(z.string()).optional().describe('Component designators (e.g. ["U1", "R1"])'),
      pins: z.array(z.string()).optional().describe('Pin references "Designator_PinNumber" (e.g. ["U1_1"])'),
      nets: z.array(z.string()).optional().describe('Net names (e.g. ["VCC", "GND"])'),
      highlight: z.boolean().optional().describe('Whether to highlight (default true)'),
    },
    async ({ components, pins, nets, highlight }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_CROSS_PROBE, { components, pins, nets, highlight });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_clear_selection',
    'Clear all selection in the PCB editor.',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_CLEAR_SELECTION);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  // ============ Layer ============

  server.tool(
    'eda_pcb_select_layer',
    'Select (activate) a specific layer in the PCB editor. New drawing operations will target this layer.\n\nCommon layer names: "TopLayer", "BottomLayer", "InnerLayer1", "InnerLayer2", etc.',
    { layer: z.string().describe('Layer name or ID to select') },
    async ({ layer }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_SELECT_LAYER, { layer });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_set_layer_visibility',
    'Show or hide a specific layer in the PCB editor. When exclusive is true, all other layers are set to the opposite visibility.',
    {
      layer: z.string().describe('Layer name or ID'),
      visible: z.boolean().describe('true to show, false to hide'),
      exclusive: z.boolean().optional().describe('If true, set all other layers to opposite visibility (default false)'),
    },
    async ({ layer, visible, exclusive }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_SET_LAYER_VISIBILITY, { layer, visible, exclusive });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_set_copper_layers',
    'Set the number of copper layers in the PCB stackup. Common values: 2 (default), 4, 6, 8.\n\nThis changes the layer stack configuration. Use eda_pcb_list_layers to see current layers.',
    { numberOfLayers: z.number().describe('Number of copper layers (2, 4, 6, 8, etc.)') },
    async ({ numberOfLayers }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_SET_COPPER_LAYERS, { numberOfLayers });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  // ============ DRC Rules ============

  server.tool(
    'eda_pcb_get_drc_rules',
    'Get the current PCB DRC (Design Rule Check) rule configuration. Returns all clearance, width, and spacing rules.\n\nUse this to understand design constraints before placing traces or checking compliance.',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_GET_DRC_RULES);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_get_net_classes',
    'Get all defined net classes in the PCB. Net classes group nets with similar routing requirements (e.g. power, signal, high-speed).\n\nReturns: Array of net class objects with name, nets, and associated rules.',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_GET_NET_CLASSES);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_create_net_class',
    'Create a new net class grouping multiple nets. Net classes enable applying shared routing rules to a group of nets.\n\nExample: create a "Power" class for VCC, 3V3, 5V nets with wider trace width rules.',
    {
      name: z.string().describe('Net class name (e.g. "Power", "HighSpeed")'),
      nets: z.array(z.string()).describe('Array of net names to include'),
      color: z.string().optional().describe('Optional display color for the net class'),
    },
    async ({ name, nets, color }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_CREATE_NET_CLASS, { name, nets, color });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_get_diff_pairs',
    'Get all defined differential pairs in the PCB. Differential pairs define paired positive/negative signal nets (e.g. USB_D+/USB_D-, HDMI lanes).\n\nReturns: Array of differential pair objects with name, positive net, negative net.',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_GET_DIFF_PAIRS);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_create_diff_pair',
    'Create a differential pair definition. Pairs a positive and negative signal net for matched-impedance routing.\n\nExample: create "USB" pair with positiveNet="USB_D+" and negativeNet="USB_D-".',
    {
      name: z.string().describe('Differential pair name (e.g. "USB", "HDMI_D0")'),
      positiveNet: z.string().describe('Positive signal net name'),
      negativeNet: z.string().describe('Negative signal net name'),
    },
    async ({ name, positiveNet, negativeNet }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_CREATE_DIFF_PAIR, { name, positiveNet, negativeNet });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  // ============ Manufacture Export ============

  server.tool(
    'eda_pcb_export_gerber',
    'Export Gerber manufacturing files for PCB fabrication. Generates standard Gerber RS-274X files for all layers.\n\nReturns: { success: boolean, message: string }.',
    {
      fileName: z.string().optional().describe('Output filename prefix (default "gerber")'),
    },
    async ({ fileName }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_EXPORT_GERBER, { fileName });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_export_pick_place',
    'Export pick-and-place (centroid) file for SMT assembly. Contains component positions, rotations, and layer assignments.\n\nReturns: { success: boolean, message: string }.',
    {
      fileName: z.string().optional().describe('Output filename (default "pick_place")'),
      fileType: z.enum(['xlsx', 'csv']).optional().describe('File format (default "csv")'),
      unit: z.string().optional().describe('Unit for coordinates'),
    },
    async ({ fileName, fileType, unit }) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_EXPORT_PICK_PLACE, { fileName, fileType, unit });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  // ============ PCB Primitive Create ============

  server.tool(
    'eda_pcb_draw_arc',
    'Draw an arc trace on the PCB.\n\nReturns: { success, primitive, message }.',
    {
      net: z.string().describe('Net name'),
      layer: z.string().describe('Layer name'),
      startX: z.number(), startY: z.number(),
      endX: z.number(), endY: z.number(),
      arcAngle: z.number().describe('Arc angle in degrees'),
      lineWidth: z.number().optional().describe('Trace width'),
    },
    async (p) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_DRAW_ARC, p);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_place_text',
    'Place text (silkscreen label) on the PCB.\n\nReturns: { success, primitive, message }.',
    {
      layer: z.string().describe('Layer name (e.g. "TopSilkscreen")'),
      x: z.number(), y: z.number(),
      text: z.string().describe('Text content'),
      fontSize: z.number().optional().describe('Font size (default 40)'),
      rotation: z.number().optional(),
    },
    async (p) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_PLACE_TEXT, p);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_create_pour',
    'Create a copper pour (polygon fill) on the PCB. Define the outline with an array of points.\n\nReturns: { success, primitive, message }.',
    {
      net: z.string().describe('Net name for the pour (e.g. "GND")'),
      layer: z.string().describe('Layer name'),
      points: z.array(z.object({ x: z.number(), y: z.number() })).min(3).describe('Outline points (min 3)'),
    },
    async (p) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_CREATE_POUR, p);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_create_region',
    'Create a keep-out or constraint region on the PCB.\n\nReturns: { success, primitive, message }.',
    {
      layer: z.string().describe('Layer name'),
      points: z.array(z.object({ x: z.number(), y: z.number() })).min(3).describe('Outline points'),
      ruleType: z.string().optional().describe('Region rule type'),
      regionName: z.string().optional(),
    },
    async (p) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_CREATE_REGION, p);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_create_fill',
    'Create a solid fill area on the PCB.\n\nReturns: { success, primitive, message }.',
    {
      layer: z.string().describe('Layer name'),
      points: z.array(z.object({ x: z.number(), y: z.number() })).min(3).describe('Outline points'),
      net: z.string().optional().describe('Net name'),
    },
    async (p) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_CREATE_FILL, p);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_draw_polyline',
    'Draw a polyline (multi-segment line) on the PCB.\n\nReturns: { success, primitive, message }.',
    {
      net: z.string().describe('Net name'),
      layer: z.string().describe('Layer name'),
      points: z.array(z.object({ x: z.number(), y: z.number() })).min(2).describe('Polyline points'),
      lineWidth: z.number().optional(),
    },
    async (p) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_DRAW_POLYLINE, p);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_place_dimension',
    'Place a dimension annotation on the PCB.\n\nReturns: { success, primitive, message }.',
    {
      dimensionType: z.string().describe('Dimension type'),
      coordinateSet: z.any().describe('Coordinate set for the dimension'),
      layer: z.string().optional(),
      unit: z.string().optional(),
    },
    async (p) => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_PLACE_DIMENSION, p);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_pcb_get_mouse_position',
    'Get the current mouse position on the PCB canvas.\n\nReturns: { x: number, y: number }.',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.PCB_GET_MOUSE_POSITION);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );
}
