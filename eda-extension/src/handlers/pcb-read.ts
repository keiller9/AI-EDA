/**
 * PCB Read Handlers
 * Uses EDA API to read PCB document state and primitives
 *
 * API used:
 *   eda.pcb_PrimitiveComponent.getAll(layer?, primitiveLock?) — list all PCB components
 *   eda.pcb_PrimitiveComponent.get(primitiveIds) — get component details
 *   eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId(id) — get component pins
 *   eda.pcb_PrimitiveLine.getAll(net?, layer?, primitiveLock?) — list all traces
 *   eda.pcb_PrimitiveVia.getAll(net?, primitiveLock?) — list all vias
 *   eda.pcb_PrimitivePad.getAll(layer?, net?, primitiveLock?, padType?) — list all pads
 *   eda.pcb_Net.getAllNetName() — get all net names
 *   eda.pcb_Net.getNetLength(net) — get net wire length
 *   eda.pcb_Layer.getAllLayers() — get all layer properties
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
    const components = await eda.pcb_PrimitiveComponent.getAll();

    return {
      canvasOrigin: origin,
      layerCount: layers?.length ?? 0,
      netCount: netNames?.length ?? 0,
      componentCount: components?.length ?? 0,
    };
  });

  // List all components on the PCB
  registerHandler(BridgeCommand.PCB_LIST_COMPONENTS, async (params) => {
    const filter = params.filter as string | undefined;

    const components = await eda.pcb_PrimitiveComponent.getAll();
    if (!components) return [];

    if (filter) {
      const lowerFilter = filter.toLowerCase();
      return components.filter((c: any) => {
        const str = JSON.stringify(c).toLowerCase();
        return str.includes(lowerFilter);
      });
    }

    return components;
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

  // List PCB primitives by type, optionally filtered by layer
  registerHandler(BridgeCommand.PCB_LIST_PRIMITIVES, async (params) => {
    const typeStr = params.type as string;
    const layer = params.layer as string | undefined;

    const validTypes = ['COMPONENT', 'LINE', 'ARC', 'VIA', 'PAD', 'POUR', 'POURED', 'FILL', 'STRING', 'REGION', 'DIMENSION', 'POLYLINE', 'IMAGE', 'OBJECT'];
    if (!validTypes.includes(typeStr)) {
      throw new Error(`Invalid primitive type: ${typeStr}. Valid types: ${validTypes.join(', ')}`);
    }

    // Use specific getAll for known primitive types
    if (typeStr === 'COMPONENT') {
      const items = await eda.pcb_PrimitiveComponent.getAll(layer as any);
      return items ?? [];
    }
    if (typeStr === 'LINE') {
      const items = await eda.pcb_PrimitiveLine.getAll(undefined, layer as any);
      return items ?? [];
    }
    if (typeStr === 'VIA') {
      const items = await eda.pcb_PrimitiveVia.getAll();
      return items ?? [];
    }
    if (typeStr === 'PAD') {
      const items = await eda.pcb_PrimitivePad.getAll(layer as any);
      return items ?? [];
    }

    // For other types, use net-based search as fallback
    const netNames = eda.pcb_Net.getAllNetName();
    if (!netNames) return [];

    const allPrimitives: any[] = [];
    for (const net of netNames) {
      const primitives = eda.pcb_Net.getAllPrimitivesByNet(net, [typeStr as any]);
      if (primitives) {
        allPrimitives.push(...primitives);
      }
    }

    if (layer) {
      return allPrimitives.filter((p: any) => p.layer === layer);
    }

    return allPrimitives;
  });

  // Get detailed PCB component info by ID
  registerHandler(BridgeCommand.PCB_GET_COMPONENT, async (params) => {
    const id = params.id as string;

    const result = await eda.pcb_PrimitiveComponent.get(id);
    if (!result) {
      throw new Error(`PCB component not found: ${id}`);
    }

    // Also get pins
    const pins = await eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId(id);

    return {
      ...result,
      pins: pins ?? [],
    };
  });
}
