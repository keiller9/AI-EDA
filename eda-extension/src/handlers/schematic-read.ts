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
}
