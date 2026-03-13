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

    // Return compact format
    const compact = components.map((c: any) => ({
      id: c.primitiveId ?? c.id,
      designator: c.designator ?? c.name,
      x: c.x,
      y: c.y,
      rotation: c.rotation ?? 0,
      layer: c.layer,
      footprint: c.footprint ?? c.footprintName,
    }));

    if (filter) {
      const lf = filter.toLowerCase();
      return compact.filter((c: any) =>
        (c.designator?.toLowerCase().includes(lf)) ||
        (c.footprint?.toLowerCase().includes(lf))
      );
    }

    return compact;
  });

  // List all PCB nets with lengths
  registerHandler(BridgeCommand.PCB_LIST_NETS, async () => {
    const netNames = eda.pcb_Net.getAllNetName();
    if (!netNames || !Array.isArray(netNames)) return [];

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
    const netNames2 = eda.pcb_Net.getAllNetName();
    if (!netNames2 || !Array.isArray(netNames2)) return [];

    const allPrimitives: any[] = [];
    for (const net of netNames2) {
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

  // ============ Progressive Disclosure ============

  // Get comprehensive component context: details + pins + connected nets + nearby components
  registerHandler(BridgeCommand.PCB_GET_COMPONENT_CONTEXT, async (params) => {
    const id = params.id as string;

    // Get the component itself
    const component = await eda.pcb_PrimitiveComponent.get(id);
    if (!component) {
      throw new Error(`PCB component not found: ${id}`);
    }

    // Get pins for this component
    const pins = await eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId(id);

    // Collect unique net names from the pins
    const netNameSet = new Set<string>();
    if (pins) {
      for (const pin of pins) {
        if ((pin as any).net) netNameSet.add((pin as any).net);
      }
    }

    // Get net lengths for each connected net
    const connectedNets = Array.from(netNameSet).map(name => ({
      name,
      length: eda.pcb_Net.getNetLength(name),
    }));

    // Get all components to find neighbors
    const allComponents = await eda.pcb_PrimitiveComponent.getAll();
    const cx = (component as any).x ?? 0;
    const cy = (component as any).y ?? 0;

    let nearbyComponents: Array<{ id: string; designator: string; footprint: string; distance: number }> = [];

    if (allComponents) {
      // Calculate distance to all other components, return closest 10
      const others = allComponents
        .filter((c: any) => (c.primitiveId ?? c.id) !== id)
        .map((c: any) => {
          const dx = (c.x ?? 0) - cx;
          const dy = (c.y ?? 0) - cy;
          const distance = Math.round(Math.sqrt(dx * dx + dy * dy));
          return {
            id: c.primitiveId ?? c.id,
            designator: c.designator ?? c.name,
            footprint: c.footprint ?? c.footprintName,
            distance,
          };
        });

      others.sort((a: any, b: any) => a.distance - b.distance);
      nearbyComponents = others.slice(0, 10);
    }

    return {
      component,
      pins: pins ?? [],
      connectedNets,
      nearbyComponents,
    };
  });
}
