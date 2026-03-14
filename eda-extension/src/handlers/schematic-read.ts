/**
 * Schematic Read Handlers
 * Uses EDA API to read schematic document state and primitives
 *
 * API used:
 *   eda.sch_PrimitiveComponent.getAll(componentType?, allSchematicPages?) — list all components
 *   eda.sch_PrimitiveComponent.get(primitiveIds) — get component details
 *   eda.sch_PrimitiveComponent.getAllPinsByPrimitiveId(id) — get component pins
 *   eda.sch_PrimitiveWire.getAll(net?) — list all wires
 *   eda.sch_Netlist.getNetlist(type) — get netlist
 *   eda.sch_Primitive.getPrimitiveByPrimitiveId(id) — get any primitive by ID
 *   eda.sch_Primitive.getPrimitiveTypeByPrimitiveId(id) — get primitive type
 *   eda.sch_SelectControl.getAllSelectedPrimitives() — get selected primitives
 */

import { BridgeCommand } from '../protocol.js';
import { registerHandler } from '../dispatcher.js';

export function registerSchematicReadHandlers(): void {

  // Get current schematic document state
  registerHandler(BridgeCommand.SCH_GET_STATE, async () => {
    const netlist = eda.sch_Netlist.getNetlist(ESYS_NetlistType.STANDARD);
    const components = await eda.sch_PrimitiveComponent.getAll();
    const wires = await eda.sch_PrimitiveWire.getAll();

    return {
      componentCount: components?.length ?? 0,
      wireCount: wires?.length ?? 0,
      hasNetlist: !!netlist,
    };
  });

  // List all components in the schematic
  registerHandler(BridgeCommand.SCH_LIST_COMPONENTS, async (params) => {
    const filter = params.filter as string | undefined;

    const components = await eda.sch_PrimitiveComponent.getAll();
    if (!components) return [];

    // Return compact format
    const compact = components.map((c: any) => ({
      id: c.primitiveId ?? c.id,
      designator: c.designator ?? c.name,
      value: c.value,
      x: c.x,
      y: c.y,
      rotation: c.rotation ?? 0,
    }));

    if (filter) {
      const lf = filter.toLowerCase();
      return compact.filter((c: any) =>
        (c.designator?.toLowerCase().includes(lf)) ||
        (c.value?.toLowerCase().includes(lf))
      );
    }

    return compact;
  });

  // List all nets
  registerHandler(BridgeCommand.SCH_LIST_NETS, async () => {
    const netlist = eda.sch_Netlist.getNetlist(ESYS_NetlistType.STANDARD);
    return netlist ?? [];
  });

  // List all wires
  registerHandler(BridgeCommand.SCH_LIST_WIRES, async () => {
    const wires = await eda.sch_PrimitiveWire.getAll();
    return wires ?? [];
  });

  // List primitives of a specified type
  registerHandler(BridgeCommand.SCH_LIST_PRIMITIVES, async (params) => {
    const typeStr = params.type as string;

    const validTypes = ['COMPONENT', 'WIRE', 'PIN', 'TEXT', 'ARC', 'RECTANGLE', 'POLYGON', 'CIRCLE', 'BUS', 'ATTRIBUTE'];
    if (!validTypes.includes(typeStr)) {
      throw new Error(`Invalid primitive type: ${typeStr}. Valid types: ${validTypes.join(', ')}`);
    }

    // Use specific getAll for known types, fallback to selected primitives
    if (typeStr === 'COMPONENT') {
      const items = await eda.sch_PrimitiveComponent.getAll();
      return items ?? [];
    }
    if (typeStr === 'WIRE') {
      const items = await eda.sch_PrimitiveWire.getAll();
      return items ?? [];
    }

    // For other types, use selected primitives filtered by type
    const allPrimitives = eda.sch_SelectControl.getAllSelectedPrimitives();
    if (!allPrimitives) return [];

    return allPrimitives.filter((p: any) => {
      const pType = eda.sch_Primitive.getPrimitiveTypeByPrimitiveId(p.id);
      return String(pType) === typeStr;
    });
  });

  // Get detailed component info by ID
  registerHandler(BridgeCommand.SCH_GET_COMPONENT, async (params) => {
    const id = params.id as string;

    const result = await eda.sch_PrimitiveComponent.get(id);
    if (!result) {
      // Fallback to generic primitive lookup
      const comp = eda.sch_Primitive.getPrimitiveByPrimitiveId(id);
      if (!comp) throw new Error(`Component not found: ${id}`);
      return comp;
    }

    // Also get pins
    const pins = await eda.sch_PrimitiveComponent.getAllPinsByPrimitiveId(id);

    return {
      ...result,
      pins: pins ?? [],
    };
  });

  // ============ Progressive Disclosure ============

  // Get comprehensive component context: details + pins + connected nets + nearby components
  registerHandler(BridgeCommand.SCH_GET_COMPONENT_CONTEXT, async (params) => {
    const id = params.id as string;

    // Get the component itself
    const component = await eda.sch_PrimitiveComponent.get(id);
    if (!component) {
      throw new Error(`SCH component not found: ${id}`);
    }

    // Get pins for this component
    const pins = await eda.sch_PrimitiveComponent.getAllPinsByPrimitiveId(id);

    // Get netlist to find which nets this component connects to
    const netlist = eda.sch_Netlist.getNetlist(ESYS_NetlistType.STANDARD);
    const connectedNets: Array<{ name: string; pinCount: number }> = [];

    if (netlist && Array.isArray(netlist)) {
      const compDesignator = (component as any).designator ?? (component as any).name;
      // Parse netlist — each net entry typically has net name and connected pins
      for (const net of netlist) {
        const netName = (net as any).name ?? (net as any).net;
        const netPins = (net as any).pins ?? (net as any).connections ?? [];
        // Check if any pin belongs to this component
        const matchingPins = netPins.filter((p: any) => {
          const pinComp = p.designator ?? p.component ?? p.ref;
          return pinComp === compDesignator;
        });
        if (matchingPins.length > 0) {
          connectedNets.push({ name: netName, pinCount: matchingPins.length });
        }
      }
    }

    // Get all components to find neighbors
    const allComponents = await eda.sch_PrimitiveComponent.getAll();
    const cx = (component as any).x ?? 0;
    const cy = (component as any).y ?? 0;

    let nearbyComponents: Array<{ id: string; designator: string; value: string; distance: number }> = [];

    if (allComponents) {
      const others = allComponents
        .filter((c: any) => (c.primitiveId ?? c.id) !== id)
        .map((c: any) => {
          const dx = (c.x ?? 0) - cx;
          const dy = (c.y ?? 0) - cy;
          const distance = Math.round(Math.sqrt(dx * dx + dy * dy));
          return {
            id: c.primitiveId ?? c.id,
            designator: c.designator ?? c.name,
            value: c.value,
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

  // ============ Selection ============

  // Get currently selected primitive IDs
  registerHandler(BridgeCommand.SCH_GET_SELECTION, async () => {
    const ids = eda.sch_SelectControl.getSelectedPrimitives_PrimitiveId();
    return { selectedIds: ids ?? [] };
  });
}
