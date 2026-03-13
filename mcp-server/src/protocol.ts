/**
 * Bridge Communication Protocol
 * Shared protocol between MCP Server and EDA Extension
 */

// ============ Message Types ============

export interface BridgeRequest {
  id: string;
  type: 'request';
  command: BridgeCommand;
  params: Record<string, unknown>;
}

export interface BridgeResponse {
  id: string;
  type: 'response';
  success: boolean;
  data?: unknown;
  error?: string;
}

export type BridgeMessage = BridgeRequest | BridgeResponse;

// ============ Commands ============

export enum BridgeCommand {
  // Schematic Read
  SCH_GET_STATE = 'sch.getState',
  SCH_LIST_COMPONENTS = 'sch.listComponents',
  SCH_LIST_NETS = 'sch.listNets',
  SCH_LIST_WIRES = 'sch.listWires',
  SCH_LIST_PRIMITIVES = 'sch.listPrimitives',
  SCH_GET_COMPONENT = 'sch.getComponent',

  // PCB Read
  PCB_GET_STATE = 'pcb.getState',
  PCB_LIST_COMPONENTS = 'pcb.listComponents',
  PCB_LIST_NETS = 'pcb.listNets',
  PCB_LIST_LAYERS = 'pcb.listLayers',
  PCB_LIST_PRIMITIVES = 'pcb.listPrimitives',
  PCB_GET_COMPONENT = 'pcb.getComponent',

  // Schematic Write
  SCH_PLACE_COMPONENT = 'sch.placeComponent',
  SCH_DRAW_WIRE = 'sch.drawWire',
  SCH_MODIFY_ATTRIBUTE = 'sch.modifyAttribute',
  SCH_DELETE_PRIMITIVE = 'sch.deletePrimitive',

  // PCB Write
  PCB_PLACE_COMPONENT = 'pcb.placeComponent',
  PCB_DRAW_LINE = 'pcb.drawLine',
  PCB_PLACE_VIA = 'pcb.placeVia',
  PCB_MODIFY_ATTRIBUTE = 'pcb.modifyAttribute',
  PCB_DELETE_PRIMITIVE = 'pcb.deletePrimitive',
  PCB_BATCH_MOVE = 'pcb.batchMove',

  // System
  SYS_RUN_DRC = 'sys.runDrc',
  SYS_EXPORT_BOM = 'sys.exportBom',
  SYS_GET_DOCUMENT_INFO = 'sys.getDocumentInfo',
  SYS_SHOW_MESSAGE = 'sys.showMessage',
}

// ============ Helper ============

let counter = 0;

export function createRequest(command: BridgeCommand, params: Record<string, unknown> = {}): BridgeRequest {
  return {
    id: `req_${Date.now()}_${++counter}`,
    type: 'request',
    command,
    params,
  };
}

export function createResponse(id: string, success: boolean, data?: unknown, error?: string): BridgeResponse {
  return {
    id,
    type: 'response',
    success,
    data,
    error,
  };
}

export function isRequest(msg: BridgeMessage): msg is BridgeRequest {
  return msg.type === 'request';
}

export function isResponse(msg: BridgeMessage): msg is BridgeResponse {
  return msg.type === 'response';
}
