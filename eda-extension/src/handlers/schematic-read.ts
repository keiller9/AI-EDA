/**
 * Schematic Read Handlers
 * Uses EDA API to read schematic document state and primitives
 *
 * API used:
 *   eda.sch_Primitive.getPrimitiveByPrimitiveId(id) — get primitive by ID
 *   eda.sch_Primitive.getPrimitiveTypeByPrimitiveId(id) — get type by ID
 *   eda.sch_SelectControl.getSelectedPrimitives_PrimitiveId() — selected IDs
 *   eda.sch_SelectControl.getAllSelectedPrimitives() — all selected primitives
 *   eda.sch_Netlist.getNetlist(type) — get netlist
 */

import { BridgeCommand } from '../protocol.js';
import { registerHandler } from '../dispatcher.js';

export function registerSchematicReadHandlers(): void {

  // Get current schematic document state
  // Note: SCH_Document only has save/importChanges/autoLayout/autoRouting
  // We use SelectControl and Netlist to gather state info
  registerHandler(BridgeCommand.SCH_GET_STATE, async () => {
    // Get netlist to derive document info
    const netlist = eda.sch_Netlist.getNetlist(ESYS_NetlistType.STANDARD);
    return {
      documentName: 'current schematic',
      hasNetlist: !!netlist,
      netlistData: netlist,
    };
  });

  // List all components in the schematic
  // Uses getSelectedPrimitives approach since there's no getAll method
  // The MCP tool description says "list all components" — this requires
  // selecting all first, or using netlist to discover components
  registerHandler(BridgeCommand.SCH_LIST_COMPONENTS, async (params) => {
    const filter = params.filter as string | undefined;

    // Get netlist which contains component/pin/net info
    const netlist = eda.sch_Netlist.getNetlist(ESYS_NetlistType.STANDARD);

    if (!netlist) {
      return [];
    }

    // Extract component information from netlist data
    // The netlist structure contains components with their connections
    let components = netlist;

    if (filter && Array.isArray(components)) {
      const lowerFilter = filter.toLowerCase();
      return components.filter((c: any) => {
        const str = JSON.stringify(c).toLowerCase();
        return str.includes(lowerFilter);
      });
    }

    return components;
  });

  // List all nets
  registerHandler(BridgeCommand.SCH_LIST_NETS, async () => {
    const netlist = eda.sch_Netlist.getNetlist(ESYS_NetlistType.STANDARD);
    return netlist ?? [];
  });

  // List all wires — get selected wire primitives info
  registerHandler(BridgeCommand.SCH_LIST_WIRES, async () => {
    // Select all, get primitives, filter wires
    const allPrimitives = eda.sch_SelectControl.getAllSelectedPrimitives();
    if (!allPrimitives) return [];

    return allPrimitives.filter((p: any) => {
      const pType = eda.sch_Primitive.getPrimitiveTypeByPrimitiveId(p.id);
      return pType === ESCH_PrimitiveType.WIRE;
    });
  });

  // List primitives of a specified type
  registerHandler(BridgeCommand.SCH_LIST_PRIMITIVES, async (params) => {
    const typeStr = params.type as string;

    // Validate the type
    const validTypes = ['COMPONENT', 'WIRE', 'PIN', 'TEXT', 'ARC', 'RECTANGLE', 'POLYGON', 'CIRCLE', 'BUS', 'ATTRIBUTE'];
    if (!validTypes.includes(typeStr)) {
      throw new Error(`Invalid primitive type: ${typeStr}. Valid types: ${validTypes.join(', ')}`);
    }

    // Get all selected primitives and filter by type
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
    const comp = eda.sch_Primitive.getPrimitiveByPrimitiveId(id);

    if (!comp) {
      throw new Error(`Component not found: ${id}`);
    }

    return comp;
  });
}
