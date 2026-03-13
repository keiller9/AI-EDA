/**
 * PCB Write Handlers
 * Uses EDA API to modify the PCB canvas
 *
 * NOTE: The documented PCB_Primitive API only has getPrimitivesBBox.
 * Write operations are not yet exposed in the official extension API.
 * These handlers use placeholder calls that will need updating.
 *
 * Available PCB write-adjacent APIs:
 *   eda.pcb_Net.highlightNet(net) / unhighlightNet(net) / selectNet(net)
 *   eda.pcb_Layer.selectLayer(layer) / setLayerVisible(layer, ...)
 *   eda.pcb_SelectControl.doSelectPrimitives(ids)
 *   eda.pcb_Document.navigateToCoordinates(x, y)
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

    // Navigate to the target coordinates at least
    eda.pcb_Document.navigateToCoordinates(x, y);

    // TODO: PCB component placement API not yet available
    return {
      success: false,
      message: `PCB component placement not yet supported via extension API. ` +
               `Navigated to (${x}, ${y}). ` +
               `Requested: id=${id} on ${layer ?? 'TopLayer'} rotation=${rotation ?? 0}`,
    };
  });

  // Draw a copper trace on the PCB
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

    // Select the target layer
    eda.pcb_Layer.selectLayer(layer as any);

    // TODO: PCB trace drawing API not yet available
    return {
      success: false,
      message: `PCB trace drawing not yet supported via extension API. ` +
               `Selected layer: ${layer}. ` +
               `Requested: ${points.length} points, width=${width}mil, net=${net ?? 'none'}`,
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

    eda.pcb_Document.navigateToCoordinates(x, y);

    // TODO: PCB via placement API not yet available
    return {
      success: false,
      message: `PCB via placement not yet supported via extension API. ` +
               `Navigated to (${x}, ${y}). ` +
               `Requested: type=${type ?? 'through'}, net=${net ?? 'none'}`,
    };
  });

  // Modify a PCB primitive attribute
  registerHandler(BridgeCommand.PCB_MODIFY_ATTRIBUTE, async (params) => {
    const { id, key, value } = params as {
      id: string;
      key: string;
      value: string;
    };

    // TODO: PCB primitive attribute modification not yet available
    return {
      success: false,
      message: `PCB attribute modification not yet supported via extension API. ` +
               `Requested: set "${key}" to "${value}" on primitive ${id}`,
    };
  });

  // Delete a PCB primitive
  registerHandler(BridgeCommand.PCB_DELETE_PRIMITIVE, async (params) => {
    const { id } = params as { id: string };

    // TODO: PCB primitive deletion not yet available
    return {
      success: false,
      message: `PCB primitive deletion not yet supported via extension API. ` +
               `Requested: delete primitive ${id}`,
    };
  });
}
