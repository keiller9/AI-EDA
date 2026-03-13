/**
 * Schematic Write Handlers
 * Uses EDA API to modify the schematic canvas
 *
 * NOTE: The documented SCH_Primitive API only has read methods:
 *   getPrimitiveByPrimitiveId, getPrimitivesBBox, getPrimitiveTypeByPrimitiveId
 *
 * Write operations (place/draw/modify/delete) are not yet exposed in the
 * official extension API. These handlers use placeholder calls that will
 * need to be updated when the API becomes available.
 *
 * For now, these operations return informational messages about what would
 * be performed, allowing the MCP tool interface to remain stable.
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

    // TODO: SCH write API not yet available in extension API
    // When available, use the appropriate eda.sch_* method
    return {
      success: false,
      message: `Schematic component placement not yet supported via extension API. ` +
               `Requested: deviceId=${deviceId} at (${x}, ${y}) rotation=${rotation ?? 0}`,
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

    // TODO: SCH wire drawing API not yet available in extension API
    return {
      success: false,
      message: `Schematic wire drawing not yet supported via extension API. ` +
               `Requested: ${points.length} points`,
    };
  });

  // Modify a schematic primitive attribute
  registerHandler(BridgeCommand.SCH_MODIFY_ATTRIBUTE, async (params) => {
    const { id, key, value } = params as {
      id: string;
      key: string;
      value: string;
    };

    // Verify the primitive exists first
    const primitive = eda.sch_Primitive.getPrimitiveByPrimitiveId(id);
    if (!primitive) {
      throw new Error(`Primitive not found: ${id}`);
    }

    // TODO: Attribute modification API not yet documented
    return {
      success: false,
      message: `Schematic attribute modification not yet supported via extension API. ` +
               `Requested: set "${key}" to "${value}" on primitive ${id}`,
    };
  });

  // Delete a schematic primitive
  registerHandler(BridgeCommand.SCH_DELETE_PRIMITIVE, async (params) => {
    const { id } = params as { id: string };

    // Verify the primitive exists first
    const primitive = eda.sch_Primitive.getPrimitiveByPrimitiveId(id);
    if (!primitive) {
      throw new Error(`Primitive not found: ${id}`);
    }

    // TODO: Primitive deletion API not yet documented
    return {
      success: false,
      message: `Schematic primitive deletion not yet supported via extension API. ` +
               `Requested: delete primitive ${id}`,
    };
  });
}
