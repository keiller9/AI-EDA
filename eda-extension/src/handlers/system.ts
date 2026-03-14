/**
 * System Handlers
 * Uses EDA API for DRC, BOM export, document info, notifications,
 * and composite intent tools (design overview, find component, check design)
 *
 * API used:
 *   eda.sch_Drc.check(strict, userInterface, includeVerboseError) — run schematic DRC
 *   eda.pcb_Drc.check(strict, userInterface, includeVerboseError) — run PCB DRC
 *   eda.sys_Environment.getEditorCurrentVersion() — editor version
 *   eda.sys_Environment.getUserInfo() — current user info
 *   eda.sys_Environment.isClient() — is desktop client
 *   eda.sys_Environment.isJLCEDAProEdition() — is JLCEDA Pro
 *   eda.sys_ToastMessage.showMessage(msg, type) — show notification
 *   eda.sch_PrimitiveComponent.getAll() — list all schematic components
 *   eda.pcb_PrimitiveComponent.getAll() — list all PCB components
 *   eda.pcb_Net.getAllNetName() / getNetLength() — PCB net data
 */

import { BridgeCommand } from '../protocol.js';
import { registerHandler } from '../dispatcher.js';

export function registerSystemHandlers(): void {

  // Run DRC (Design Rule Check)
  // API: eda.sch_Drc.check(strict, userInterface, includeVerboseError)
  //      eda.pcb_Drc.check(strict, userInterface, includeVerboseError)
  registerHandler(BridgeCommand.SYS_RUN_DRC, async (params) => {
    const { type } = params as { type: 'sch' | 'pcb' };

    if (type === 'sch') {
      const result = eda.sch_Drc.check(true, false, true);
      return {
        type: 'schematic',
        result,
        message: 'Schematic DRC completed',
      };
    } else if (type === 'pcb') {
      const result = eda.pcb_Drc.check(true, false, true);
      return {
        type: 'pcb',
        result,
        message: 'PCB DRC completed',
      };
    } else {
      throw new Error(`Invalid DRC type: ${type}. Use "sch" or "pcb"`);
    }
  });

  // Export BOM
  // Note: SCH_ManufactureData methods not fully documented yet
  registerHandler(BridgeCommand.SYS_EXPORT_BOM, async () => {
    // Get netlist as a proxy for BOM data
    const netlist = eda.sch_Netlist.getNetlist(ESYS_NetlistType.STANDARD);
    return {
      netlist,
      message: 'Netlist/BOM data exported',
    };
  });

  // Get current document info
  registerHandler(BridgeCommand.SYS_GET_DOCUMENT_INFO, async () => {
    const env = eda.sys_Environment;
    return {
      editorVersion: env.getEditorCurrentVersion(),
      editorCompileDate: env.getEditorCompliedDate(),
      userInfo: env.getUserInfo(),
      isClient: env.isClient(),
      isWeb: env.isWeb(),
      isOnlineMode: env.isOnlineMode(),
      isJLCEDAPro: env.isJLCEDAProEdition(),
    };
  });

  // Show a toast message in EDA
  registerHandler(BridgeCommand.SYS_SHOW_MESSAGE, async (params) => {
    const { message, type } = params as { message: string; type: string };

    let msgType: number;
    switch (type) {
      case 'success': msgType = ESYS_ToastMessageType.SUCCESS; break;
      case 'warning': msgType = ESYS_ToastMessageType.WARNING; break;
      case 'error': msgType = ESYS_ToastMessageType.ERROR; break;
      default: msgType = ESYS_ToastMessageType.INFO; break;
    }

    eda.sys_ToastMessage.showMessage(message, msgType);

    return {
      success: true,
      message: `Toast message displayed: "${message}"`,
    };
  });

  // ============ Composite / Intent Tools ============

  // Get design overview — auto-detect document type, return combined data
  registerHandler(BridgeCommand.SYS_GET_DESIGN_OVERVIEW, async () => {
    // Try PCB first — if pcb_PrimitiveComponent.getAll() returns data, we're in a PCB document
    let pcbComponents: any = null;
    try {
      pcbComponents = await eda.pcb_PrimitiveComponent.getAll();
    } catch {
      // Not a PCB document, will try SCH
    }

    if (pcbComponents && pcbComponents.length > 0) {
      // PCB document
      const netNames = eda.pcb_Net.getAllNetName();
      const layers = eda.pcb_Layer.getAllLayers();
      const origin = eda.pcb_Document.getCanvasOrigin();

      const compact = pcbComponents.map((c: any) => ({
        id: c.primitiveId ?? c.id,
        designator: c.designator ?? c.name,
        x: c.x,
        y: c.y,
        rotation: c.rotation ?? 0,
        layer: c.layer,
        footprint: c.footprint ?? c.footprintName,
      }));

      const nets = (netNames && Array.isArray(netNames))
        ? netNames.map((name: string) => ({
            name,
            length: eda.pcb_Net.getNetLength(name),
          }))
        : [];

      return {
        documentType: 'pcb',
        components: compact,
        componentCount: compact.length,
        nets,
        netCount: nets.length,
        layerCount: layers?.length ?? 0,
        canvasOrigin: origin,
      };
    }

    // Try schematic
    let schComponents: any = null;
    try {
      schComponents = await eda.sch_PrimitiveComponent.getAll();
    } catch {
      // Not a schematic document either
    }

    if (schComponents) {
      const wires = await eda.sch_PrimitiveWire.getAll();
      const netlist = eda.sch_Netlist.getNetlist(ESYS_NetlistType.STANDARD);

      const compact = (schComponents ?? []).map((c: any) => ({
        id: c.primitiveId ?? c.id,
        designator: c.designator ?? c.name,
        value: c.value,
        x: c.x,
        y: c.y,
        rotation: c.rotation ?? 0,
      }));

      return {
        documentType: 'schematic',
        components: compact,
        componentCount: compact.length,
        wireCount: wires?.length ?? 0,
        netCount: Array.isArray(netlist) ? netlist.length : 0,
      };
    }

    throw new Error('No active schematic or PCB document found. Please open a document in JLCEDA Pro.');
  });

  // Find component — search by designator/value/footprint with full details
  registerHandler(BridgeCommand.SYS_FIND_COMPONENT, async (params) => {
    const { query } = params as { query: string };
    const lq = query.toLowerCase();

    // Try PCB first
    let pcbComponents: any = null;
    try {
      pcbComponents = await eda.pcb_PrimitiveComponent.getAll();
    } catch {
      // Not a PCB document
    }

    if (pcbComponents && pcbComponents.length > 0) {
      const matches: any[] = [];
      for (const c of pcbComponents) {
        const designator = (c.designator ?? c.name ?? '').toLowerCase();
        const footprint = (c.footprint ?? c.footprintName ?? '').toLowerCase();
        if (designator.includes(lq) || footprint.includes(lq)) {
          const id = c.primitiveId ?? c.id;
          let full = c;
          try {
            const detail = await eda.pcb_PrimitiveComponent.get(id);
            if (detail) full = detail;
          } catch { /* use original */ }
          let pins: any = [];
          try {
            pins = await eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId(id);
          } catch { /* no pins */ }
          matches.push({ ...full, pins: pins ?? [] });
        }
      }
      return {
        documentType: 'pcb',
        matches,
        query,
        totalComponents: pcbComponents.length,
      };
    }

    // Try schematic
    let schComponents: any = null;
    try {
      schComponents = await eda.sch_PrimitiveComponent.getAll();
    } catch {
      // Not a schematic document
    }

    if (schComponents) {
      const matches: any[] = [];
      for (const c of schComponents) {
        const designator = (c.designator ?? c.name ?? '').toLowerCase();
        const value = (c.value ?? '').toLowerCase();
        if (designator.includes(lq) || value.includes(lq)) {
          const id = c.primitiveId ?? c.id;
          let full = c;
          try {
            const detail = await eda.sch_PrimitiveComponent.get(id);
            if (detail) full = detail;
          } catch { /* use original */ }
          let pins: any = [];
          try {
            pins = await eda.sch_PrimitiveComponent.getAllPinsByPrimitiveId(id);
          } catch { /* no pins */ }
          matches.push({ ...full, pins: pins ?? [] });
        }
      }
      return {
        documentType: 'schematic',
        matches,
        query,
        totalComponents: schComponents.length,
      };
    }

    throw new Error('No active schematic or PCB document found.');
  });

  // Check design — DRC + net analysis + statistics in one report
  registerHandler(BridgeCommand.SYS_CHECK_DESIGN, async (params) => {
    let { type } = params as { type?: 'sch' | 'pcb' };

    // Auto-detect if not specified
    if (!type) {
      let pcbComponents: any = null;
      try {
        pcbComponents = await eda.pcb_PrimitiveComponent.getAll();
      } catch { /* not PCB */ }
      if (pcbComponents && pcbComponents.length > 0) {
        type = 'pcb';
      } else {
        type = 'sch';
      }
    }

    if (type === 'sch') {
      const drcResult = eda.sch_Drc.check(true, false, true);
      const components = await eda.sch_PrimitiveComponent.getAll();
      const netlist = eda.sch_Netlist.getNetlist(ESYS_NetlistType.STANDARD);

      const componentCount = components?.length ?? 0;
      const netCount = Array.isArray(netlist) ? netlist.length : 0;
      const violationCount = Array.isArray(drcResult) ? drcResult.length : 0;

      const report = [
        'Schematic Design Check Report',
        `Components: ${componentCount}`,
        `Nets: ${netCount}`,
        `DRC violations: ${violationCount}`,
        violationCount === 0
          ? 'Status: PASS — No DRC violations found.'
          : `Status: FAIL — ${violationCount} violation(s) found.`,
      ].join('\n');

      return {
        documentType: 'schematic',
        drc: { result: drcResult, violationCount },
        stats: { componentCount, netCount },
        report,
      };
    } else {
      const drcResult = eda.pcb_Drc.check(true, false, true);
      const components = await eda.pcb_PrimitiveComponent.getAll();
      const netNames = eda.pcb_Net.getAllNetName();

      const componentCount = components?.length ?? 0;
      const netCount = (netNames && Array.isArray(netNames)) ? netNames.length : 0;

      // Count nets with zero length (potentially unrouted)
      let unroutedNets = 0;
      if (netNames && Array.isArray(netNames)) {
        for (const name of netNames) {
          const len = eda.pcb_Net.getNetLength(name);
          if (!len || len === 0) unroutedNets++;
        }
      }

      const violationCount = Array.isArray(drcResult) ? drcResult.length : 0;

      const report = [
        'PCB Design Check Report',
        `Components: ${componentCount}`,
        `Nets: ${netCount}`,
        `Potentially unrouted nets: ${unroutedNets}`,
        `DRC violations: ${violationCount}`,
        violationCount === 0 && unroutedNets === 0
          ? 'Status: PASS — No issues found.'
          : `Status: NEEDS ATTENTION — ${violationCount} DRC violation(s), ${unroutedNets} potentially unrouted net(s).`,
      ].join('\n');

      return {
        documentType: 'pcb',
        drc: { result: drcResult, violationCount },
        stats: { componentCount, netCount, unroutedNets },
        report,
      };
    }
  });

  // ============ BOM ============

  // Get BOM data from schematic (built from components + netlist)
  registerHandler(BridgeCommand.SCH_GET_BOM, async () => {
    // Get all components across all schematic pages
    const components = await eda.sch_PrimitiveComponent.getAll(undefined, true);
    if (!components || components.length === 0) {
      return { items: [], totalComponents: 0, uniqueValues: 0 };
    }

    // Build BOM: group by value + footprint
    const bomMap = new Map<string, { designators: string[]; value: string; footprint: string; count: number; properties: Record<string, any> }>();

    for (const c of components) {
      const comp = c as any;
      const value = comp.value ?? '';
      const footprint = comp.footprint ?? comp.footprintName ?? '';
      const designator = comp.designator ?? comp.name ?? '';
      const key = `${value}||${footprint}`;

      if (bomMap.has(key)) {
        const entry = bomMap.get(key)!;
        entry.designators.push(designator);
        entry.count++;
      } else {
        bomMap.set(key, {
          designators: [designator],
          value,
          footprint,
          count: 1,
          properties: {
            manufacturer: comp.manufacturer,
            manufacturerId: comp.manufacturerId,
            supplier: comp.supplier,
            supplierId: comp.supplierId,
          },
        });
      }
    }

    const items = Array.from(bomMap.values()).map(entry => ({
      ...entry,
      designators: entry.designators.sort().join(', '),
    }));

    // Sort by designator prefix (R, C, U, etc.)
    items.sort((a, b) => a.designators.localeCompare(b.designators));

    return {
      items,
      totalComponents: components.length,
      uniqueValues: items.length,
    };
  });

  // ============ DMT Document Tree ============

  registerHandler(BridgeCommand.DMT_GET_DOCUMENT_INFO, async () => {
    const info = await eda.dmt_SelectControl.getCurrentDocumentInfo();
    return info ?? {};
  });

  registerHandler(BridgeCommand.DMT_OPEN_DOCUMENT, async (params) => {
    const uuid = params.uuid as string;
    await eda.dmt_EditorControl.openDocument(uuid);
    return { success: true, message: `Document ${uuid} opened` };
  });

  registerHandler(BridgeCommand.DMT_GET_PROJECT_INFO, async (params) => {
    const uuid = params.uuid as string;
    const info = await eda.dmt_Project.getProjectInfo(uuid);
    return info ?? {};
  });

  registerHandler(BridgeCommand.DMT_LIST_BOARDS, async () => {
    const boards = await eda.dmt_Board.getAllBoardsName();
    return boards ?? [];
  });

  registerHandler(BridgeCommand.DMT_GET_BOARD_INFO, async (params) => {
    const name = params.name as string;
    const info = await eda.dmt_Board.getBoardInfo(name);
    return info ?? {};
  });

  registerHandler(BridgeCommand.DMT_LIST_TABS, async () => {
    const tabs = await eda.dmt_EditorControl.getAllTabs();
    return tabs ?? [];
  });

  // ============ LIB Library ============

  registerHandler(BridgeCommand.LIB_SEARCH_DEVICE, async (params) => {
    const { key, libraryUuid, classification, itemsOfPage, page } = params as any;
    const results = await eda.lib_Device.search(key, libraryUuid, classification, undefined, itemsOfPage ?? 20, page ?? 1);
    return results ?? [];
  });

  registerHandler(BridgeCommand.LIB_GET_DEVICE, async (params) => {
    const { deviceUuid, libraryUuid } = params as any;
    const device = await eda.lib_Device.get(deviceUuid, libraryUuid);
    return device ?? {};
  });

  registerHandler(BridgeCommand.LIB_SEARCH_FOOTPRINT, async (params) => {
    const { key, libraryUuid, classification, itemsOfPage, page } = params as any;
    const results = await eda.lib_Footprint.search(key, libraryUuid, classification, itemsOfPage ?? 20, page ?? 1);
    return results ?? [];
  });

  registerHandler(BridgeCommand.LIB_GET_LIBRARIES, async () => {
    const libs = await eda.lib_LibrariesList.getAllLibrariesInfo();
    return libs ?? [];
  });

  registerHandler(BridgeCommand.LIB_GET_DEVICE_BY_LCSC, async (params) => {
    const { lcscIds, libraryUuid } = params as any;
    const results = await eda.lib_Device.getByLcscIds(lcscIds, libraryUuid, true);
    return results ?? [];
  });

  // ============ SYS Supplement ============

  registerHandler(BridgeCommand.SYS_GET_ENVIRONMENT, async () => {
    return {
      version: await eda.sys_Environment.getEditorCurrentVersion(),
      user: await eda.sys_Environment.getUserInfo(),
      isClient: await eda.sys_Environment.isClient(),
      isWeb: await eda.sys_Environment.isWeb(),
      isJLCEDA: await eda.sys_Environment.isJLCEDAProEdition(),
      isOnline: await eda.sys_Environment.isOnlineMode(),
    };
  });

  registerHandler(BridgeCommand.SYS_GET_USER_CONFIG, async () => {
    const configs = await eda.sys_Storage.getExtensionAllUserConfigs();
    return configs ?? {};
  });

  registerHandler(BridgeCommand.SYS_UNIT_CONVERT, async (params) => {
    const { value, from, to } = params as { value: number; from: string; to: string };
    let result: number;
    const key = `${from}_${to}`;
    switch (key) {
      case 'mil_mm': result = await eda.sys_Unit.milToMm(value); break;
      case 'mm_mil': result = await eda.sys_Unit.mmToMil(value); break;
      case 'mil_inch': result = await eda.sys_Unit.milToInch(value); break;
      case 'inch_mil': result = await eda.sys_Unit.inchToMil(value); break;
      case 'mm_inch': result = await eda.sys_Unit.mmToInch(value); break;
      case 'inch_mm': result = await eda.sys_Unit.inchToMm(value); break;
      default: throw new Error(`Unsupported conversion: ${from} → ${to}. Use: mil, mm, inch`);
    }
    return { value, from, to, result };
  });

  registerHandler(BridgeCommand.SYS_OPEN_URL, async (params) => {
    const { url, target } = params as { url: string; target?: string };
    eda.sys_Window.open(url, target as any);
    return { success: true, message: `Opened ${url}` };
  });
}
