/**
 * System tools - DRC, export, document info, notifications, composite intent tools
 */

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WSBridge } from '../ws-bridge.js';
import { BridgeCommand } from '../protocol.js';

export function registerSystemTools(server: McpServer, bridge: WSBridge): void {

  server.tool(
    'eda_sys_run_drc',
    'Run Design Rule Check (DRC) on the current schematic or PCB document.\n\nThe type parameter must be "sch" for schematic or "pcb" for PCB.\n\nReturns: { type: string, result: object, message: string } where result contains the DRC violations found.\n\nDRC checks electrical and physical rule violations. For a comprehensive design health check that combines DRC with net analysis and component statistics, use eda_check_design instead.',
    {
      type: z.enum(['sch', 'pcb']).describe('Document type to run DRC on: "sch" for schematic, "pcb" for PCB'),
    },
    async ({ type }) => {
      const data = await bridge.sendCommand(BridgeCommand.SYS_RUN_DRC, { type });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_sys_export_bom',
    'Export Bill of Materials (BOM) from the current schematic. Currently exports the standard netlist as a proxy for BOM data.\n\nReturns: { netlist: object, message: string }.\n\nThis requires an active schematic document. For component-level detail, use eda_sch_list_components which returns designators and values directly.',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.SYS_EXPORT_BOM);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_sys_get_document_info',
    'Get environment information about the JLCEDA Pro editor, not the current document content.\n\nReturns: { editorVersion: string, editorCompileDate: string, userInfo: object, isClient: boolean, isWeb: boolean, isOnlineMode: boolean, isJLCEDAPro: boolean }.\n\nUse this to verify the editor environment. This does NOT return document content — for document state use eda_sch_get_state or eda_pcb_get_state. For a combined overview, use eda_get_design_overview.',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.SYS_GET_DOCUMENT_INFO);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_sys_show_message',
    'Show a toast notification message in the JLCEDA Pro editor UI.\n\nThe message appears briefly in the editor as a non-blocking toast. Type can be "info", "success", "warning", or "error" (defaults to "info").\n\nReturns: { success: boolean, message: string }.\n\nUse this to provide user-visible feedback in the EDA editor. This is a UI-only action with no effect on the design.',
    {
      message: z.string().describe('Message text to display'),
      type: z.enum(['info', 'success', 'warning', 'error']).optional().describe('Message type. Defaults to "info"'),
    },
    async ({ message, type }) => {
      const data = await bridge.sendCommand(BridgeCommand.SYS_SHOW_MESSAGE, { message, type: type ?? 'info' });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  // ============ Composite / Intent Tools ============

  server.tool(
    'eda_get_design_overview',
    'Get a comprehensive overview of the currently active design document in a single call. This is the recommended FIRST tool to call when starting work with a design.\n\nAuto-detects whether the active document is a schematic or PCB and returns combined data.\n\nFor schematic, returns: { documentType: "schematic", components: Array<{id, designator, value, x, y, rotation}>, componentCount, wireCount, netCount }.\n\nFor PCB, returns: { documentType: "pcb", components: Array<{id, designator, x, y, rotation, layer, footprint}>, nets: Array<{name, length}>, componentCount, netCount, layerCount, canvasOrigin }.\n\nThis replaces the need to call get_state + list_components + list_nets separately.',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.SYS_GET_DESIGN_OVERVIEW);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_find_component',
    'Search for components by designator, value, or footprint in the currently active document.\n\nAuto-detects document type (schematic or PCB). The query is a case-insensitive substring match against designator, value (schematic), and footprint (PCB).\n\nReturns: { documentType: "schematic"|"pcb", matches: Array<component with pins>, query: string, totalComponents: number }. Each match includes full component details and pins.\n\nUse this when you want to find a specific component like "U1", "100nF", or "TSSOP-20". More intention-driven than list_components(filter=...) because it returns full details with pins for each match.',
    {
      query: z.string().describe('Search string to match against component designator, value, or footprint (case-insensitive)'),
    },
    async ({ query }) => {
      const data = await bridge.sendCommand(BridgeCommand.SYS_FIND_COMPONENT, { query });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  server.tool(
    'eda_check_design',
    'Run a comprehensive design health check on the current document.\n\nCombines DRC (Design Rule Check) with net analysis and component statistics into a single structured report. Auto-detects document type if not specified.\n\nReturns: { documentType, drc: { result, violationCount }, stats: { componentCount, netCount, unroutedNets? }, report: string }.\n\nThe report field is a human-readable summary. This replaces the need to call eda_sys_run_drc + manually interpreting results. Use eda_sys_run_drc directly only if you need raw DRC data without the summary.',
    {
      type: z.enum(['sch', 'pcb']).optional().describe('Document type: "sch" or "pcb". If omitted, auto-detects from the active document.'),
    },
    async ({ type }) => {
      const data = await bridge.sendCommand(BridgeCommand.SYS_CHECK_DESIGN, { type });
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );

  // ============ BOM ============

  server.tool(
    'eda_sch_get_bom',
    'Get BOM (Bill of Materials) data from the current schematic, grouped by value and footprint.\n\nReturns: { items: Array<{designators, value, footprint, count, properties}>, totalComponents: number, uniqueValues: number }.\n\nEach item groups components with the same value and footprint. The designators field lists all matching component references (e.g. "C1, C2, C3"). Properties include manufacturer and supplier info when available.\n\nThis builds BOM data from live schematic components — no file export needed.',
    {},
    async () => {
      const data = await bridge.sendCommand(BridgeCommand.SCH_GET_BOM);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    },
  );
}
