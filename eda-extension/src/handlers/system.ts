/**
 * System Handlers
 * Uses EDA API for DRC, BOM export, document info, and notifications
 *
 * API used:
 *   eda.sch_Drc.check(strict, userInterface, includeVerboseError) — run schematic DRC
 *   eda.pcb_Drc.check(strict, userInterface, includeVerboseError) — run PCB DRC
 *   eda.sys_Environment.getEditorCurrentVersion() — editor version
 *   eda.sys_Environment.getUserInfo() — current user info
 *   eda.sys_Environment.isClient() — is desktop client
 *   eda.sys_Environment.isJLCEDAProEdition() — is JLCEDA Pro
 *   eda.sys_ToastMessage.showMessage(msg, type) — show notification
 */

import { BridgeCommand } from '../protocol.js';
import { registerHandler } from '../dispatcher.js';

export function registerSystemHandlers(): void {

  // Run DRC (Design Rule Check)
  // API: eda.sch_Drc.check(strict, userInterface, includeVerboseError)
  //      eda.pcb_Drc.check(strict, userInterface, includeVerboseError)
  registerHandler(BridgeCommand.SYS_RUN_DRC, async (params) => {
    const { type } = params as { type: 'sch' | 'pcb' };

    if (type === 'sch') {
      const result = eda.sch_Drc.check(true, false, true);
      return {
        type: 'schematic',
        result,
        message: 'Schematic DRC completed',
      };
    } else if (type === 'pcb') {
      const result = eda.pcb_Drc.check(true, false, true);
      return {
        type: 'pcb',
        result,
        message: 'PCB DRC completed',
      };
    } else {
      throw new Error(`Invalid DRC type: ${type}. Use "sch" or "pcb"`);
    }
  });

  // Export BOM
  // Note: SCH_ManufactureData methods not fully documented yet
  registerHandler(BridgeCommand.SYS_EXPORT_BOM, async () => {
    // Get netlist as a proxy for BOM data
    const netlist = eda.sch_Netlist.getNetlist(ESYS_NetlistType.STANDARD);
    return {
      netlist,
      message: 'Netlist/BOM data exported',
    };
  });

  // Get current document info
  registerHandler(BridgeCommand.SYS_GET_DOCUMENT_INFO, async () => {
    const env = eda.sys_Environment;
    return {
      editorVersion: env.getEditorCurrentVersion(),
      editorCompileDate: env.getEditorCompliedDate(),
      userInfo: env.getUserInfo(),
      isClient: env.isClient(),
      isWeb: env.isWeb(),
      isOnlineMode: env.isOnlineMode(),
      isJLCEDAPro: env.isJLCEDAProEdition(),
    };
  });

  // Show a toast message in EDA
  registerHandler(BridgeCommand.SYS_SHOW_MESSAGE, async (params) => {
    const { message, type } = params as { message: string; type: string };

    let msgType: number;
    switch (type) {
      case 'success': msgType = ESYS_ToastMessageType.SUCCESS; break;
      case 'warning': msgType = ESYS_ToastMessageType.WARNING; break;
      case 'error': msgType = ESYS_ToastMessageType.ERROR; break;
      default: msgType = ESYS_ToastMessageType.INFO; break;
    }

    eda.sys_ToastMessage.showMessage(message, msgType);

    return {
      success: true,
      message: `Toast message displayed: "${message}"`,
    };
  });
}
