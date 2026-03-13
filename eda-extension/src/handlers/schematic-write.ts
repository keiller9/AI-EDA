/**
 * Schematic Write Handlers
 * Uses EDA API to create, modify, and delete schematic primitives
 *
 * API used:
 *   eda.sch_PrimitiveComponent.create(component, x, y, subPartName, rotation, mirror, addIntoBom, addIntoPcb)
 *   eda.sch_PrimitiveComponent.modify(primitiveId, property)
 *   eda.sch_PrimitiveComponent.delete(primitiveIds)
 *   eda.sch_PrimitiveComponent.createNetFlag(identification, net, x, y, rotation, mirror)
 *   eda.sch_PrimitiveWire.create(line, net, color, lineWidth, lineType)
 *   eda.sch_PrimitiveWire.modify(primitiveId, property)
 *   eda.sch_PrimitiveWire.delete(primitiveIds)
 *   eda.sch_Primitive.getPrimitiveTypeByPrimitiveId(id) — determine primitive type
 */

import { BridgeCommand } from '../protocol.js';
import { registerHandler } from '../dispatcher.js';

export function registerSchematicWriteHandlers(): void {

  // Place a component on the schematic
  registerHandler(BridgeCommand.SCH_PLACE_COMPONENT, async (params) => {
    const { deviceId, x, y, rotation } = params as {
      deviceId: string;
      x: number;
      y: number;
      rotation?: number;
    };

    // deviceId format: "libraryUuid:uuid" or just a device search object
    // Try to parse as libraryUuid:uuid first
    let component: { libraryUuid: string; uuid: string };
    if (deviceId.includes(':')) {
      const [libraryUuid, uuid] = deviceId.split(':');
      component = { libraryUuid, uuid };
    } else {
      // Assume it's a uuid with default library
      component = { libraryUuid: '', uuid: deviceId };
    }

    const result = await eda.sch_PrimitiveComponent.create(
      component,
      x,
      y,
      undefined,        // subPartName
      rotation ?? 0,
      false,             // mirror
      true,              // addIntoBom
      true,              // addIntoPcb
    );

    if (!result) {
      throw new Error(`Failed to place component: deviceId=${deviceId} at (${x}, ${y})`);
    }

    return {
      success: true,
      primitive: result,
      message: `Component placed at (${x}, ${y}) with rotation=${rotation ?? 0}`,
    };
  });

  // Draw a wire on the schematic
  registerHandler(BridgeCommand.SCH_DRAW_WIRE, async (params) => {
    const { points } = params as {
      points: Array<{ x: number; y: number }>;
    };

    if (!points || points.length < 2) {
      throw new Error('At least 2 points are required to draw a wire');
    }

    // Convert [{x,y}, ...] to flat array [x1,y1,x2,y2,...] for the API
    const line: number[] = [];
    for (const p of points) {
      line.push(p.x, p.y);
    }

    const result = await eda.sch_PrimitiveWire.create(line);

    if (!result) {
      throw new Error('Failed to draw wire');
    }

    return {
      success: true,
      primitive: result,
      message: `Wire drawn with ${points.length} points`,
    };
  });

  // Modify a schematic primitive attribute
  registerHandler(BridgeCommand.SCH_MODIFY_ATTRIBUTE, async (params) => {
    const { id, key, value } = params as {
      id: string;
      key: string;
      value: string;
    };

    // Determine the primitive type to call the right modify method
    const pType = eda.sch_Primitive.getPrimitiveTypeByPrimitiveId(id);
    if (!pType) {
      throw new Error(`Primitive not found: ${id}`);
    }

    // Build property object from key-value pair
    const property: Record<string, any> = {};

    // Handle numeric values
    const numValue = Number(value);
    if (['x', 'y', 'rotation', 'lineWidth'].includes(key)) {
      property[key] = numValue;
    } else if (['mirror', 'addIntoBom', 'addIntoPcb'].includes(key)) {
      property[key] = value === 'true';
    } else {
      property[key] = value;
    }

    let result: any;

    if (String(pType) === 'COMPONENT' || String(pType) === String(ESCH_PrimitiveType.COMPONENT)) {
      result = await eda.sch_PrimitiveComponent.modify(id, property);
    } else if (String(pType) === 'WIRE' || String(pType) === String(ESCH_PrimitiveType.WIRE)) {
      result = await eda.sch_PrimitiveWire.modify(id, property);
    } else {
      // Fallback: try component modify
      result = await eda.sch_PrimitiveComponent.modify(id, property);
    }

    if (!result) {
      throw new Error(`Failed to modify primitive ${id}: set "${key}" to "${value}"`);
    }

    return {
      success: true,
      primitive: result,
      message: `Modified "${key}" to "${value}" on primitive ${id}`,
    };
  });

  // Delete a schematic primitive
  registerHandler(BridgeCommand.SCH_DELETE_PRIMITIVE, async (params) => {
    const { id } = params as { id: string };

    // Determine the primitive type
    const pType = eda.sch_Primitive.getPrimitiveTypeByPrimitiveId(id);
    if (!pType) {
      throw new Error(`Primitive not found: ${id}`);
    }

    let success = false;

    if (String(pType) === 'COMPONENT' || String(pType) === String(ESCH_PrimitiveType.COMPONENT)) {
      success = await eda.sch_PrimitiveComponent.delete(id);
    } else if (String(pType) === 'WIRE' || String(pType) === String(ESCH_PrimitiveType.WIRE)) {
      success = await eda.sch_PrimitiveWire.delete(id);
    } else {
      // Try component delete as fallback
      success = await eda.sch_PrimitiveComponent.delete(id);
    }

    return {
      success,
      message: success
        ? `Primitive ${id} deleted`
        : `Failed to delete primitive ${id}`,
    };
  });

  // Batch modify — modify multiple schematic primitives in parallel
  registerHandler(BridgeCommand.SCH_BATCH_MODIFY, async (params) => {
    const { modifications } = params as {
      modifications: Array<{ id: string; key: string; value: string }>;
    };
    if (!modifications || modifications.length === 0) throw new Error('No modifications specified');

    const buildProp = (key: string, value: string) => {
      const prop: Record<string, any> = {};
      const num = Number(value);
      if (['x', 'y', 'rotation', 'lineWidth'].includes(key)) {
        prop[key] = num;
      } else if (['mirror', 'addIntoBom', 'addIntoPcb'].includes(key)) {
        prop[key] = value === 'true';
      } else {
        prop[key] = value;
      }
      return prop;
    };

    const settled = await Promise.allSettled(
      modifications.map(async (m) => {
        const prop = buildProp(m.key, m.value);
        const pType = eda.sch_Primitive.getPrimitiveTypeByPrimitiveId(m.id);
        let result: any;
        if (String(pType) === 'WIRE' || String(pType) === String(ESCH_PrimitiveType.WIRE)) {
          result = await eda.sch_PrimitiveWire.modify(m.id, prop);
        } else {
          result = await eda.sch_PrimitiveComponent.modify(m.id, prop);
        }
        if (!result) throw new Error(`Failed to modify ${m.id}`);
        return { id: m.id, success: true as const };
      })
    );

    const results = settled.map((r, i) =>
      r.status === 'fulfilled' ? r.value
        : { id: modifications[i].id, success: false as const, error: String((r as PromiseRejectedResult).reason) }
    );

    return {
      total: modifications.length,
      succeeded: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  });

  // Batch delete — delete multiple schematic primitives in parallel
  registerHandler(BridgeCommand.SCH_BATCH_DELETE, async (params) => {
    const { ids } = params as { ids: string[] };
    if (!ids || ids.length === 0) throw new Error('No IDs specified');

    const settled = await Promise.allSettled(
      ids.map(async (id) => {
        const pType = eda.sch_Primitive.getPrimitiveTypeByPrimitiveId(id);
        let ok = false;
        if (String(pType) === 'WIRE' || String(pType) === String(ESCH_PrimitiveType.WIRE)) {
          ok = await eda.sch_PrimitiveWire.delete(id);
        } else {
          ok = await eda.sch_PrimitiveComponent.delete(id);
        }
        if (!ok) throw new Error(`Failed to delete ${id}`);
        return { id, success: true as const };
      })
    );

    const results = settled.map((r, i) =>
      r.status === 'fulfilled' ? r.value
        : { id: ids[i], success: false as const, error: String((r as PromiseRejectedResult).reason) }
    );

    return {
      total: ids.length,
      succeeded: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  });
}
