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
  PCB_BATCH_MODIFY = 'pcb.batchModify',
  PCB_BATCH_DELETE = 'pcb.batchDelete',

  // Schematic Batch
  SCH_BATCH_MODIFY = 'sch.batchModify',
  SCH_BATCH_DELETE = 'sch.batchDelete',

  // System
  SYS_RUN_DRC = 'sys.runDrc',
  SYS_EXPORT_BOM = 'sys.exportBom',
  SYS_GET_DOCUMENT_INFO = 'sys.getDocumentInfo',
  SYS_SHOW_MESSAGE = 'sys.showMessage',

  // Composite / Intent
  SYS_GET_DESIGN_OVERVIEW = 'sys.getDesignOverview',
  SYS_FIND_COMPONENT = 'sys.findComponent',
  SYS_CHECK_DESIGN = 'sys.checkDesign',

  // Progressive Disclosure
  PCB_GET_COMPONENT_CONTEXT = 'pcb.getComponentContext',
  SCH_GET_COMPONENT_CONTEXT = 'sch.getComponentContext',

  // Schematic Document
  SCH_AUTO_LAYOUT = 'sch.autoLayout',
  SCH_AUTO_ROUTING = 'sch.autoRouting',

  // Schematic Selection
  SCH_SELECT_PRIMITIVES = 'sch.selectPrimitives',
  SCH_CROSS_PROBE = 'sch.crossProbe',
  SCH_GET_SELECTION = 'sch.getSelection',

  // Schematic Net Symbols
  SCH_CREATE_NET_FLAG = 'sch.createNetFlag',
  SCH_CREATE_NET_PORT = 'sch.createNetPort',

  // Schematic BOM
  SCH_GET_BOM = 'sch.getBom',

  // PCB Document
  PCB_SAVE = 'pcb.save',
  PCB_IMPORT_CHANGES = 'pcb.importChanges',
  PCB_NAVIGATE_TO = 'pcb.navigateTo',
  PCB_ZOOM_TO_BOARD = 'pcb.zoomToBoard',
  PCB_GET_PRIMITIVE_AT_POINT = 'pcb.getPrimitiveAtPoint',
  PCB_GET_PRIMITIVES_IN_REGION = 'pcb.getPrimitivesInRegion',

  // PCB Net
  PCB_HIGHLIGHT_NET = 'pcb.highlightNet',
  PCB_UNHIGHLIGHT_NET = 'pcb.unhighlightNet',
  PCB_SELECT_NET = 'pcb.selectNet',
  PCB_GET_NET_PRIMITIVES = 'pcb.getNetPrimitives',
  PCB_GET_NETLIST = 'pcb.getNetlist',

  // PCB Selection
  PCB_SELECT_PRIMITIVES = 'pcb.selectPrimitives',
  PCB_CROSS_PROBE = 'pcb.crossProbe',
  PCB_GET_SELECTION = 'pcb.getSelection',
  PCB_CLEAR_SELECTION = 'pcb.clearSelection',

  // PCB Layer
  PCB_SELECT_LAYER = 'pcb.selectLayer',
  PCB_SET_LAYER_VISIBILITY = 'pcb.setLayerVisibility',
  PCB_SET_COPPER_LAYERS = 'pcb.setCopperLayers',

  // PCB DRC Rules
  PCB_GET_DRC_RULES = 'pcb.getDrcRules',
  PCB_GET_NET_CLASSES = 'pcb.getNetClasses',
  PCB_CREATE_NET_CLASS = 'pcb.createNetClass',
  PCB_GET_DIFF_PAIRS = 'pcb.getDiffPairs',
  PCB_CREATE_DIFF_PAIR = 'pcb.createDiffPair',

  // PCB DRC Rule Management
  PCB_GET_ALL_RULE_CONFIGS = 'pcb.getAllRuleConfigs',
  PCB_SAVE_RULE_CONFIG = 'pcb.saveRuleConfig',
  PCB_RENAME_RULE_CONFIG = 'pcb.renameRuleConfig',
  PCB_DELETE_RULE_CONFIG = 'pcb.deleteRuleConfig',
  PCB_OVERWRITE_NET_RULES = 'pcb.overwriteNetRules',
  PCB_GET_NET_BY_NET_RULES = 'pcb.getNetByNetRules',
  PCB_OVERWRITE_REGION_RULES = 'pcb.overwriteRegionRules',
  PCB_DELETE_NET_CLASS = 'pcb.deleteNetClass',
  PCB_ADD_NET_TO_NET_CLASS = 'pcb.addNetToNetClass',
  PCB_REMOVE_NET_FROM_NET_CLASS = 'pcb.removeNetFromNetClass',
  PCB_DELETE_DIFF_PAIR = 'pcb.deleteDiffPair',
  PCB_GET_EQUAL_LENGTH_GROUPS = 'pcb.getEqualLengthGroups',
  PCB_CREATE_EQUAL_LENGTH_GROUP = 'pcb.createEqualLengthGroup',
  PCB_DELETE_EQUAL_LENGTH_GROUP = 'pcb.deleteEqualLengthGroup',
  PCB_GET_PAD_PAIR_GROUPS = 'pcb.getPadPairGroups',

  // PCB Routing Control
  PCB_CLEAR_ROUTING = 'pcb.clearRouting',
  PCB_START_RATLINE = 'pcb.startRatline',
  PCB_STOP_RATLINE = 'pcb.stopRatline',
  PCB_GET_RATLINE_STATUS = 'pcb.getRatlineStatus',

  // PCB Coordinate Transform
  PCB_CONVERT_CANVAS_TO_DATA = 'pcb.convertCanvasToData',
  PCB_CONVERT_DATA_TO_CANVAS = 'pcb.convertDataToCanvas',

  // SCH Navigation & Net Label
  SCH_NAVIGATE_TO = 'sch.navigateTo',
  SCH_NAVIGATE_TO_REGION = 'sch.navigateToRegion',
  SCH_CREATE_NET_LABEL = 'sch.createNetLabel',

  // PCB Manufacture
  PCB_EXPORT_GERBER = 'pcb.exportGerber',
  PCB_EXPORT_PICK_PLACE = 'pcb.exportPickPlace',

  // SCH Supplement
  SCH_SAVE = 'sch.save',
  SCH_IMPORT_CHANGES = 'sch.importChanges',
  SCH_CLEAR_SELECTION = 'sch.clearSelection',
  SCH_GET_MOUSE_POSITION = 'sch.getMousePosition',
  SCH_GET_PRIMITIVES_BBOX = 'sch.getPrimitivesBBox',

  // PCB Primitive Create
  PCB_DRAW_ARC = 'pcb.drawArc',
  PCB_PLACE_TEXT = 'pcb.placeText',
  PCB_CREATE_POUR = 'pcb.createPour',
  PCB_CREATE_REGION = 'pcb.createRegion',
  PCB_CREATE_FILL = 'pcb.createFill',
  PCB_DRAW_POLYLINE = 'pcb.drawPolyline',
  PCB_PLACE_DIMENSION = 'pcb.placeDimension',
  PCB_GET_MOUSE_POSITION = 'pcb.getMousePosition',

  // DMT Document Tree
  DMT_GET_DOCUMENT_INFO = 'dmt.getDocumentInfo',
  DMT_OPEN_DOCUMENT = 'dmt.openDocument',
  DMT_GET_PROJECT_INFO = 'dmt.getProjectInfo',
  DMT_LIST_BOARDS = 'dmt.listBoards',
  DMT_GET_BOARD_INFO = 'dmt.getBoardInfo',
  DMT_LIST_TABS = 'dmt.listTabs',

  // DMT Document Creation
  DMT_CREATE_PROJECT = 'dmt.createProject',
  DMT_CREATE_SCHEMATIC = 'dmt.createSchematic',
  DMT_CREATE_SCHEMATIC_PAGE = 'dmt.createSchematicPage',
  DMT_CREATE_PCB = 'dmt.createPcb',
  DMT_CREATE_BOARD = 'dmt.createBoard',

  // LIB Library
  LIB_SEARCH_DEVICE = 'lib.searchDevice',
  LIB_GET_DEVICE = 'lib.getDevice',
  LIB_SEARCH_FOOTPRINT = 'lib.searchFootprint',
  LIB_GET_LIBRARIES = 'lib.getLibraries',
  LIB_GET_DEVICE_BY_LCSC = 'lib.getDeviceByLcsc',

  // SYS Supplement
  SYS_GET_ENVIRONMENT = 'sys.getEnvironment',
  SYS_GET_USER_CONFIG = 'sys.getUserConfig',
  SYS_UNIT_CONVERT = 'sys.unitConvert',
  SYS_OPEN_URL = 'sys.openUrl',
}

// ============ Helper ============

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
