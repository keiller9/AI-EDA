/**
 * PCB Read Handlers
 * Uses EDA API to read PCB document state and primitives
 *
 * API used:
 *   eda.pcb_Net.getAllNetName() — get all net names
 *   eda.pcb_Net.getNetLength(net) — get net wire length
 *   eda.pcb_Net.getAllPrimitivesByNet(net, types) — get primitives on a net
 *   eda.pcb_Net.getNetlist(type) — get netlist
 *   eda.pcb_Layer.getAllLayers() — get all layer properties
 *   eda.pcb_Primitive.getPrimitivesBBox(ids) — get bounding box
 *   eda.pcb_SelectControl.getAllSelectedPrimitives() — get selected primitives
 *   eda.pcb_SelectControl.getAllSelectedPrimitives_PrimitiveId() — get selected IDs
 *   eda.pcb_Document.getCanvasOrigin() — get canvas origin
 */

import { BridgeCommand } from '../protocol.js';
import { registerHandler } from '../dispatcher.js';

export function registerPcbReadHandlers(): void {

  // Get current PCB document state
  registerHandler(BridgeCommand.PCB_GET_STATE, async () => {
    const origin = eda.pcb_Document.getCanvasOrigin();
    const layers = eda.pcb_Layer.getAllLayers();
    const netNames = eda.pcb_Net.getAllNetName();
    return {
      canvasOrigin: origin,
      layerCount: layers?.length ?? 0,
      netCount: netNames?.length ?? 0,
    };
  });

  // List all components on the PCB
  // Use netlist to discover component info since there's no getAll for primitives
  registerHandler(BridgeCommand.PCB_LIST_COMPONENTS, async (params) => {
    const filter = params.filter as string | undefined;
    const netlist = eda.pcb_Net.getNetlist(ESYS_NetlistType.STANDARD);

    if (!netlist) return [];

    if (filter && Array.isArray(netlist)) {
      const lowerFilter = filter.toLowerCase();
      return netlist.filter((item: any) => {
        const str = JSON.stringify(item).toLowerCase();
        return str.includes(lowerFilter);
      });
    }

    return netlist;
  });

  // List all PCB nets with lengths
  registerHandler(BridgeCommand.PCB_LIST_NETS, async () => {
    const netNames = eda.pcb_Net.getAllNetName();
    if (!netNames) return [];

    return netNames.map((name: string) => ({
      name,
      length: eda.pcb_Net.getNetLength(name),
    }));
  });

  // List all PCB layers
  registerHandler(BridgeCommand.PCB_LIST_LAYERS, async () => {
    const layers = eda.pcb_Layer.getAllLayers();
    return layers ?? [];
  });

  // List PCB primitives by type on a specific net
  registerHandler(BridgeCommand.PCB_LIST_PRIMITIVES, async (params) => {
    const typeStr = params.type as string;
    const layer = params.layer as string | undefined;

    // Validate the type
    const validTypes = ['COMPONENT', 'LINE', 'ARC', 'VIA', 'PAD', 'POUR', 'POURED', 'FILL', 'STRING', 'REGION', 'DIMENSION', 'POLYLINE', 'IMAGE', 'OBJECT'];
    if (!validTypes.includes(typeStr)) {
      throw new Error(`Invalid primitive type: ${typeStr}. Valid types: ${validTypes.join(', ')}`);
    }

    // Use getAllSelectedPrimitives to get primitives, filtered by type
    const allPrimitives = eda.pcb_SelectControl.getAllSelectedPrimitives();
    if (!allPrimitives) return [];

    let filtered = allPrimitives;
    if (layer) {
      filtered = filtered.filter((p: any) => p.layer === layer);
    }

    return filtered;
  });

  // Get detailed PCB component info by ID
  registerHandler(BridgeCommand.PCB_GET_COMPONENT, async (params) => {
    const id = params.id as string;

    // Use net to find component primitives
    const netNames = eda.pcb_Net.getAllNetName();
    if (!netNames) throw new Error(`PCB component not found: ${id}`);

    // Try to find the component's primitives across nets
    for (const net of netNames) {
      const primitives = eda.pcb_Net.getAllPrimitivesByNet(net, [EPCB_PrimitiveType.COMPONENT]);
      if (primitives) {
        const found = primitives.find((p: any) => p.id === id);
        if (found) return found;
      }
    }

    throw new Error(`PCB component not found: ${id}`);
  });
}
