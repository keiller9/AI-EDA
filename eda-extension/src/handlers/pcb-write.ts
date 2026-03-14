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

    // Create all line segments in parallel
    const settled = await Promise.allSettled(
      Array.from({ length: points.length - 1 }, (_, i) =>
        eda.pcb_PrimitiveLine.create(
          net ?? '',
          layer as any,
          points[i].x,
          points[i].y,
          points[i + 1].x,
          points[i + 1].y,
          width,
          false,
        )
      )
    );

    const segments = settled
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value)
      .map(r => r.value);

    if (segments.length === 0) {
      throw new Error('Failed to draw any trace segments');
    }

    return {
      success: true,
      segments,
      message: `Drew ${segments.length} trace segment(s) on ${layer}, width=${width}mil, net=${net ?? 'none'}`,
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

    // Execute all moves in parallel
    const settled = await Promise.allSettled(
      moves.map(move => {
        const property: Record<string, any> = { x: move.x, y: move.y };
        if (move.rotation !== undefined) property.rotation = move.rotation;
        return eda.pcb_PrimitiveComponent.modify(move.id, property)
          .then(() => ({ id: move.id, success: true as const }));
      })
    );

    const results = settled.map((r, i) =>
      r.status === 'fulfilled'
        ? r.value
        : { id: moves[i].id, success: false as const, error: String((r as PromiseRejectedResult).reason) }
    );
    const errors = results.filter(r => !r.success).map(r => `${r.id}: ${'error' in r ? r.error : ''}`);

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

  // Batch modify — modify multiple PCB primitives in parallel
  registerHandler(BridgeCommand.PCB_BATCH_MODIFY, async (params) => {
    const { modifications } = params as {
      modifications: Array<{ id: string; key: string; value: string }>;
    };
    if (!modifications || modifications.length === 0) throw new Error('No modifications specified');

    const buildProp = (key: string, value: string) => {
      const prop: Record<string, any> = {};
      const num = Number(value);
      if (['x', 'y', 'startX', 'startY', 'endX', 'endY', 'rotation', 'lineWidth',
           'holeDiameter', 'diameter'].includes(key)) {
        prop[key] = num;
      } else if (['primitiveLock', 'addIntoBom', 'metallization'].includes(key)) {
        prop[key] = value === 'true';
      } else {
        prop[key] = value;
      }
      return prop;
    };

    const settled = await Promise.allSettled(
      modifications.map(async (m) => {
        const prop = buildProp(m.key, m.value);
        let result: any;
        try { result = await eda.pcb_PrimitiveComponent.modify(m.id, prop); } catch (_) {}
        if (!result) try { result = await eda.pcb_PrimitiveLine.modify(m.id, prop); } catch (_) {}
        if (!result) try { result = await eda.pcb_PrimitiveVia.modify(m.id, prop); } catch (_) {}
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

  // Batch delete — delete multiple PCB primitives in parallel
  registerHandler(BridgeCommand.PCB_BATCH_DELETE, async (params) => {
    const { ids } = params as { ids: string[] };
    if (!ids || ids.length === 0) throw new Error('No IDs specified');

    const settled = await Promise.allSettled(
      ids.map(async (id) => {
        let ok = false;
        try { ok = await eda.pcb_PrimitiveComponent.delete(id); } catch (_) {}
        if (!ok) try { ok = await eda.pcb_PrimitiveLine.delete(id); } catch (_) {}
        if (!ok) try { ok = await eda.pcb_PrimitiveVia.delete(id); } catch (_) {}
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

  // ============ Document ============

  // Save PCB document
  registerHandler(BridgeCommand.PCB_SAVE, async () => {
    await eda.pcb_Document.save();
    return { success: true, message: 'PCB document saved' };
  });

  // Import changes from schematic
  registerHandler(BridgeCommand.PCB_IMPORT_CHANGES, async () => {
    await eda.pcb_Document.importChanges();
    return { success: true, message: 'Changes imported from schematic' };
  });

  // ============ Net Write ============

  // Highlight a net
  registerHandler(BridgeCommand.PCB_HIGHLIGHT_NET, async (params) => {
    const net = params.net as string;
    eda.pcb_Net.highlightNet(net);
    return { success: true, message: `Net "${net}" highlighted` };
  });

  // Unhighlight a net
  registerHandler(BridgeCommand.PCB_UNHIGHLIGHT_NET, async (params) => {
    const net = params.net as string;
    eda.pcb_Net.unhighlightNet(net);
    return { success: true, message: `Net "${net}" unhighlighted` };
  });

  // Select a net
  registerHandler(BridgeCommand.PCB_SELECT_NET, async (params) => {
    const net = params.net as string;
    eda.pcb_Net.selectNet(net);
    return { success: true, message: `Net "${net}" selected` };
  });

  // ============ Selection Write ============

  // Select primitives by IDs
  registerHandler(BridgeCommand.PCB_SELECT_PRIMITIVES, async (params) => {
    const ids = params.ids as string[];
    if (!ids || ids.length === 0) throw new Error('No IDs specified');
    eda.pcb_SelectControl.doSelectPrimitives(ids);
    return { success: true, selectedCount: ids.length, message: `Selected ${ids.length} primitives` };
  });

  // Cross-probe select
  registerHandler(BridgeCommand.PCB_CROSS_PROBE, async (params) => {
    const components = params.components as string[] | undefined;
    const pins = params.pins as string[] | undefined;
    const nets = params.nets as string[] | undefined;
    const highlight = params.highlight as boolean | undefined;
    const result = eda.pcb_SelectControl.doCrossProbeSelect(components, pins, nets, highlight ?? true, true);
    return { success: result, message: result ? 'Cross-probe selection applied' : 'Cross-probe selection failed' };
  });

  // Clear selection
  registerHandler(BridgeCommand.PCB_CLEAR_SELECTION, async () => {
    eda.pcb_SelectControl.clearSelected();
    return { success: true, message: 'Selection cleared' };
  });

  // ============ Layer ============

  // Select a layer
  registerHandler(BridgeCommand.PCB_SELECT_LAYER, async (params) => {
    const layer = params.layer as string;
    eda.pcb_Layer.selectLayer(layer as any);
    return { success: true, message: `Layer "${layer}" selected` };
  });

  // Set layer visibility
  registerHandler(BridgeCommand.PCB_SET_LAYER_VISIBILITY, async (params) => {
    const layer = params.layer as string;
    const visible = params.visible as boolean;
    const exclusive = params.exclusive as boolean | undefined;
    if (visible) {
      eda.pcb_Layer.setLayerVisible(layer as any, exclusive ?? false);
    } else {
      eda.pcb_Layer.setLayerInvisible(layer as any, exclusive ?? false);
    }
    return { success: true, message: `Layer "${layer}" ${visible ? 'visible' : 'hidden'}${exclusive ? ' (exclusive)' : ''}` };
  });

  // Set number of copper layers
  registerHandler(BridgeCommand.PCB_SET_COPPER_LAYERS, async (params) => {
    const numberOfLayers = params.numberOfLayers as number;
    eda.pcb_Layer.setTheNumberOfCopperLayers(numberOfLayers);
    return { success: true, message: `Copper layers set to ${numberOfLayers}` };
  });

  // ============ DRC Rules ============

  // Get current DRC rule configuration
  registerHandler(BridgeCommand.PCB_GET_DRC_RULES, async () => {
    const config = eda.pcb_Drc.getCurrentRuleConfiguration();
    return config ?? {};
  });

  // Get all net classes
  registerHandler(BridgeCommand.PCB_GET_NET_CLASSES, async () => {
    const netClasses = eda.pcb_Drc.getAllNetClasses();
    return netClasses ?? [];
  });

  // Create a net class
  registerHandler(BridgeCommand.PCB_CREATE_NET_CLASS, async (params) => {
    const { name, nets, color } = params as { name: string; nets: string[]; color?: string };
    eda.pcb_Drc.createNetClass(name, nets, color);
    return { success: true, message: `Net class "${name}" created with ${nets.length} nets` };
  });

  // Get all differential pairs
  registerHandler(BridgeCommand.PCB_GET_DIFF_PAIRS, async () => {
    const pairs = eda.pcb_Drc.getAllDifferentialPairs();
    return pairs ?? [];
  });

  // Create a differential pair
  registerHandler(BridgeCommand.PCB_CREATE_DIFF_PAIR, async (params) => {
    const { name, positiveNet, negativeNet } = params as { name: string; positiveNet: string; negativeNet: string };
    eda.pcb_Drc.createDifferentialPair(name, positiveNet, negativeNet);
    return { success: true, message: `Differential pair "${name}" created: +${positiveNet} / -${negativeNet}` };
  });

  // ============ Manufacture Export ============

  // Export Gerber files
  registerHandler(BridgeCommand.PCB_EXPORT_GERBER, async (params) => {
    const fileName = params.fileName as string | undefined;
    try {
      const file = await eda.pcb_ManufactureData.getGerberFile(fileName ?? 'gerber');
      return { success: true, message: 'Gerber files exported', hasFile: !!file };
    } catch (e: any) {
      return { success: false, message: `Gerber export failed: ${e.message}` };
    }
  });

  // Export pick-and-place file
  registerHandler(BridgeCommand.PCB_EXPORT_PICK_PLACE, async (params) => {
    const fileName = params.fileName as string | undefined;
    const fileType = params.fileType as 'xlsx' | 'csv' | undefined;
    const unit = params.unit as string | undefined;
    try {
      const file = await eda.pcb_ManufactureData.getPickAndPlaceFile(fileName ?? 'pick_place', fileType ?? 'csv', unit as any);
      return { success: true, message: 'Pick-and-place file exported', hasFile: !!file };
    } catch (e: any) {
      return { success: false, message: `Pick-and-place export failed: ${e.message}` };
    }
  });
}
