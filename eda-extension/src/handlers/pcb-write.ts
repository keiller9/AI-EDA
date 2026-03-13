/**
 * PCB Write Handlers
 * Uses EDA API to create, modify, and delete PCB primitives
 *
 * API used:
 *   eda.pcb_PrimitiveComponent.create(component, layer, x, y, rotation, primitiveLock)
 *   eda.pcb_PrimitiveComponent.modify(primitiveId, property)
 *   eda.pcb_PrimitiveComponent.delete(primitiveIds)
 *   eda.pcb_PrimitiveLine.create(net, layer, startX, startY, endX, endY, lineWidth, primitiveLock)
 *   eda.pcb_PrimitiveLine.modify(primitiveId, property)
 *   eda.pcb_PrimitiveLine.delete(primitiveIds)
 *   eda.pcb_PrimitiveVia.create(net, x, y, holeDiameter, diameter, viaType, ...)
 *   eda.pcb_PrimitiveVia.modify(primitiveId, property)
 *   eda.pcb_PrimitiveVia.delete(primitiveIds)
 */

import { BridgeCommand } from '../protocol.js';
import { registerHandler } from '../dispatcher.js';

export function registerPcbWriteHandlers(): void {

  // Place a component on the PCB
  registerHandler(BridgeCommand.PCB_PLACE_COMPONENT, async (params) => {
    const { id, x, y, layer, rotation } = params as {
      id: string;
      x: number;
      y: number;
      layer?: string;
      rotation?: number;
    };

    // Parse component identifier (libraryUuid:uuid format)
    let component: { libraryUuid: string; uuid: string };
    if (id.includes(':')) {
      const [libraryUuid, uuid] = id.split(':');
      component = { libraryUuid, uuid };
    } else {
      component = { libraryUuid: '', uuid: id };
    }

    const result = await eda.pcb_PrimitiveComponent.create(
      component,
      (layer ?? 'TopLayer') as any,
      x,
      y,
      rotation ?? 0,
      false,  // primitiveLock
    );

    if (!result) {
      throw new Error(`Failed to place PCB component at (${x}, ${y}) on ${layer ?? 'TopLayer'}`);
    }

    return {
      success: true,
      primitive: result,
      message: `PCB component placed at (${x}, ${y}) on ${layer ?? 'TopLayer'} rotation=${rotation ?? 0}`,
    };
  });

  // Draw a copper trace on the PCB
  // Creates line segments between consecutive points
  registerHandler(BridgeCommand.PCB_DRAW_LINE, async (params) => {
    const { points, layer, width, net } = params as {
      points: Array<{ x: number; y: number }>;
      layer: string;
      width: number;
      net?: string;
    };

    if (!points || points.length < 2) {
      throw new Error('At least 2 points are required to draw a trace');
    }

    const results: any[] = [];

    // Create a line segment for each consecutive pair of points
    for (let i = 0; i < points.length - 1; i++) {
      const result = await eda.pcb_PrimitiveLine.create(
        net ?? '',
        layer as any,
        points[i].x,
        points[i].y,
        points[i + 1].x,
        points[i + 1].y,
        width,
        false,  // primitiveLock
      );

      if (result) {
        results.push(result);
      }
    }

    if (results.length === 0) {
      throw new Error('Failed to draw any trace segments');
    }

    return {
      success: true,
      segments: results,
      message: `Drew ${results.length} trace segment(s) on ${layer}, width=${width}mil, net=${net ?? 'none'}`,
    };
  });

  // Place a via on the PCB
  registerHandler(BridgeCommand.PCB_PLACE_VIA, async (params) => {
    const { x, y, holeRadius, radius, net, type } = params as {
      x: number;
      y: number;
      holeRadius?: number;
      radius?: number;
      net?: string;
      type?: string;
    };

    // Convert radius to diameter for the API
    const holeDiameter = (holeRadius ?? 6) * 2;  // default 12mil hole
    const diameter = (radius ?? 12) * 2;          // default 24mil via

    // Map type string to enum
    let viaType: any;
    switch (type) {
      case 'blind': viaType = EPCB_PrimitiveViaType.blind; break;
      case 'buried': viaType = EPCB_PrimitiveViaType.buried; break;
      default: viaType = EPCB_PrimitiveViaType.through; break;
    }

    const result = await eda.pcb_PrimitiveVia.create(
      net ?? '',
      x,
      y,
      holeDiameter,
      diameter,
      viaType,
    );

    if (!result) {
      throw new Error(`Failed to place via at (${x}, ${y})`);
    }

    return {
      success: true,
      primitive: result,
      message: `Via placed at (${x}, ${y}), type=${type ?? 'through'}, net=${net ?? 'none'}`,
    };
  });

  // Modify a PCB primitive attribute
  registerHandler(BridgeCommand.PCB_MODIFY_ATTRIBUTE, async (params) => {
    const { id, key, value } = params as {
      id: string;
      key: string;
      value: string;
    };

    // Build property object
    const property: Record<string, any> = {};
    const numValue = Number(value);

    if (['x', 'y', 'startX', 'startY', 'endX', 'endY', 'rotation', 'lineWidth',
         'holeDiameter', 'diameter', 'holeOffsetX', 'holeOffsetY', 'holeRotation'].includes(key)) {
      property[key] = numValue;
    } else if (['primitiveLock', 'addIntoBom', 'metallization'].includes(key)) {
      property[key] = value === 'true';
    } else {
      property[key] = value;
    }

    // Try component modify first, then line, then via
    let result: any;
    try {
      result = await eda.pcb_PrimitiveComponent.modify(id, property);
    } catch (_) { /* not a component */ }

    if (!result) {
      try {
        result = await eda.pcb_PrimitiveLine.modify(id, property);
      } catch (_) { /* not a line */ }
    }

    if (!result) {
      try {
        result = await eda.pcb_PrimitiveVia.modify(id, property);
      } catch (_) { /* not a via */ }
    }

    if (!result) {
      throw new Error(`Failed to modify PCB primitive ${id}: set "${key}" to "${value}"`);
    }

    return {
      success: true,
      primitive: result,
      message: `Modified "${key}" to "${value}" on PCB primitive ${id}`,
    };
  });

  // Batch move components — move multiple components in one call
  registerHandler(BridgeCommand.PCB_BATCH_MOVE, async (params) => {
    const { moves } = params as {
      moves: Array<{
        id: string;
        x: number;
        y: number;
        rotation?: number;
      }>;
    };

    if (!moves || moves.length === 0) {
      throw new Error('No moves specified');
    }

    const results: any[] = [];
    const errors: string[] = [];

    for (const move of moves) {
      try {
        const property: Record<string, any> = { x: move.x, y: move.y };
        if (move.rotation !== undefined) {
          property.rotation = move.rotation;
        }
        const result = await eda.pcb_PrimitiveComponent.modify(move.id, property);
        results.push({ id: move.id, success: true });
      } catch (e) {
        errors.push(`${move.id}: ${String(e)}`);
        results.push({ id: move.id, success: false, error: String(e) });
      }
    }

    return {
      total: moves.length,
      succeeded: results.filter(r => r.success).length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
      results,
    };
  });

  // Delete a PCB primitive
  registerHandler(BridgeCommand.PCB_DELETE_PRIMITIVE, async (params) => {
    const { id } = params as { id: string };

    // Try deleting from each primitive type
    let success = false;

    try {
      success = await eda.pcb_PrimitiveComponent.delete(id);
    } catch (_) { /* not a component */ }

    if (!success) {
      try {
        success = await eda.pcb_PrimitiveLine.delete(id);
      } catch (_) { /* not a line */ }
    }

    if (!success) {
      try {
        success = await eda.pcb_PrimitiveVia.delete(id);
      } catch (_) { /* not a via */ }
    }

    return {
      success,
      message: success
        ? `PCB primitive ${id} deleted`
        : `Failed to delete PCB primitive ${id}`,
    };
  });
}
