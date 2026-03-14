/**
 * AI EDA Bridge Extension
 *
 * Entry point for the JLCEDA Pro extension.
 * Connects to the local MCP Server via WebSocket and
 * dispatches commands to the appropriate EDA API handlers.
 */

import { connectToServer, disconnectFromServer, isConnected, setRequestHandler, setPort, getPort, getConnectedSince } from './ws-client.js';
import { dispatch, getCommandLog, getCommandStats } from './dispatcher.js';
import { BridgeCommand } from './protocol.js';
import { registerSchematicReadHandlers } from './handlers/schematic-read.js';
import { registerPcbReadHandlers } from './handlers/pcb-read.js';
import { registerSchematicWriteHandlers } from './handlers/schematic-write.js';
import { registerPcbWriteHandlers } from './handlers/pcb-write.js';
import { registerSystemHandlers } from './handlers/system.js';

// ============ Register All Handlers ============

registerSchematicReadHandlers();
registerPcbReadHandlers();
registerSchematicWriteHandlers();
registerPcbWriteHandlers();
registerSystemHandlers();

// Set the dispatcher as the WebSocket request handler
setRequestHandler(dispatch);

// ============ Status Panel Data ============

let panelUpdateTimer: any = null;

function updatePanelData(): void {
  (globalThis as any).__AI_EDA_PANEL_DATA__ = {
    connected: isConnected(),
    port: getPort(),
    connectedSince: getConnectedSince(),
    stats: getCommandStats(),
    log: getCommandLog(),
    updatedAt: Date.now(),
  };
}

function startPanelUpdates(): void {
  updatePanelData();
  if (panelUpdateTimer) return;
  panelUpdateTimer = setInterval(updatePanelData, 2000);
}

function stopPanelUpdates(): void {
  if (panelUpdateTimer) {
    clearInterval(panelUpdateTimer);
    panelUpdateTimer = null;
  }
}

// ============ Lifecycle (exported for activationEvents) ============

/**
 * Called on extension startup (activationEvents.onStartupFinished)
 * Loads stored port config and auto-connects
 */
export function activate(): void {
  const storedPort = eda.sys_Storage.getExtensionUserConfig('wsPort');
  if (typeof storedPort === 'number' && storedPort >= 1024 && storedPort <= 65535) {
    setPort(storedPort);
  }
  connectToServer();
}

// ============ Menu Functions (exported for extension.json registerFn) ============

/**
 * Connect to the MCP Server
 * Registered as menu item: AI Bridge -> 连接 AI
 */
export function connect(): void {
  if (isConnected()) {
    eda.sys_ToastMessage.showMessage(
      'AI Bridge: Already connected',
      ESYS_ToastMessageType.INFO,
    );
    return;
  }

  connectToServer();
}

/**
 * Disconnect from the MCP Server
 * Registered as menu item: AI Bridge -> 断开连接
 */
export function disconnect(): void {
  disconnectFromServer();
  eda.sys_ToastMessage.showMessage(
    'AI Bridge: Disconnected',
    ESYS_ToastMessageType.INFO,
  );
}

/**
 * Show connection status
 * Registered as menu item: AI Bridge -> 连接状态
 */
export function status(): void {
  const conn = isConnected();
  eda.sys_ToastMessage.showMessage(
    conn
      ? 'AI Bridge: Connected to MCP Server'
      : 'AI Bridge: Not connected',
    conn ? ESYS_ToastMessageType.SUCCESS : ESYS_ToastMessageType.WARNING,
  );
}

/**
 * Configure WebSocket port via dialog
 * Registered as menu item: AI Bridge -> 配置端口
 */
export function configurePort(): void {
  eda.sys_Dialog.showInputDialog(
    'WebSocket 端口 (1024-65535)',
    '',
    '配置端口',
    'number',
    getPort(),
    { min: 1024, max: 65535 },
    (value: any) => {
      if (value === undefined || value === null || value === '') return;
      const port = Number(value);
      if (isNaN(port) || port < 1024 || port > 65535) {
        eda.sys_ToastMessage.showMessage(
          'AI Bridge: Invalid port number',
          ESYS_ToastMessageType.ERROR,
        );
        return;
      }
      setPort(port);
      eda.sys_Storage.setExtensionUserConfig('wsPort', port);
      eda.sys_ToastMessage.showMessage(
        `AI Bridge: Port set to ${port}`,
        ESYS_ToastMessageType.SUCCESS,
      );
    },
  );
}

/**
 * Open the IFrame status panel
 * Registered as menu item: AI Bridge -> 状态面板
 */
export function showStatusPanel(): void {
  startPanelUpdates();
  eda.sys_IFrame.openIFrame('./iframe/panel.html', 420, 520, 'ai-status-panel', {
    title: 'AI Bridge 状态',
    maximizeButton: true,
    minimizeButton: true,
    minimizeStyle: 'collapsed',
    buttonCallbackFn: (button: string) => {
      if (button === 'close') {
        stopPanelUpdates();
      }
    },
  });
}

// ============ Context Menu AI Actions ============

/**
 * Helper: dispatch a command locally (runs through handlers directly)
 */
async function dispatchLocal(command: BridgeCommand, params: Record<string, unknown> = {}): Promise<any> {
  const request = { id: `local-${Date.now()}`, command, params };
  return dispatch(request);
}

/**
 * Analyze the selected schematic component
 * Registered as menu item (sch): AI 分析选中元件
 */
export async function analyzeSelectedSch(): Promise<void> {
  try {
    const ids = eda.sch_SelectControl.getSelectedPrimitives_PrimitiveId();
    if (!ids || ids.length === 0) {
      eda.sys_ToastMessage.showMessage('请先选中一个元件', ESYS_ToastMessageType.WARNING);
      return;
    }

    // The selected ID might be a sub-primitive; find the parent component
    const allComponents = await eda.sch_PrimitiveComponent.getAll();
    if (!allComponents || allComponents.length === 0) {
      eda.sys_ToastMessage.showMessage('无法获取元件列表', ESYS_ToastMessageType.ERROR);
      return;
    }

    // Try to match selected ID directly as a component, or find the component that owns the selected primitive
    const selectedSet = new Set(ids);
    let matchedComponent: any = null;

    for (const comp of allComponents) {
      const compId = (comp as any).primitiveId ?? (comp as any).id;
      if (selectedSet.has(compId)) {
        matchedComponent = comp;
        break;
      }
    }

    // If no direct match, try the first selected ID with get()
    if (!matchedComponent) {
      for (const selId of ids) {
        try {
          const comp = await eda.sch_PrimitiveComponent.get(selId);
          if (comp) {
            matchedComponent = comp;
            break;
          }
        } catch { /* not a component ID, try next */ }
      }
    }

    if (!matchedComponent) {
      eda.sys_ToastMessage.showMessage('请选中一个元件（非导线）', ESYS_ToastMessageType.WARNING);
      return;
    }

    const compId = (matchedComponent as any).primitiveId ?? (matchedComponent as any).id;
    const response = await dispatchLocal(BridgeCommand.SCH_GET_COMPONENT_CONTEXT, { id: compId });
    if (response.success) {
      const data = response.data as any;
      const designator = data?.component?.designator ?? 'Unknown';
      const value = data?.component?.value ?? '';
      const netCount = data?.connectedNets?.length ?? 0;
      const nearbyCount = data?.nearbyComponents?.length ?? 0;
      eda.sys_ToastMessage.showMessage(
        `${designator}${value ? ' (' + value + ')' : ''}: ${netCount} nets, ${nearbyCount} nearby`,
        ESYS_ToastMessageType.SUCCESS,
      );
    } else {
      eda.sys_ToastMessage.showMessage(`分析失败: ${response.error}`, ESYS_ToastMessageType.ERROR);
    }
  } catch (e: any) {
    eda.sys_ToastMessage.showMessage(`Error: ${e?.message || e}`, ESYS_ToastMessageType.ERROR);
  }
}

/**
 * Run design check on current schematic
 * Registered as menu item (sch): AI 检查设计
 */
export async function checkDesignSch(): Promise<void> {
  try {
    eda.sys_ToastMessage.showMessage('正在检查原理图...', ESYS_ToastMessageType.INFO);
    const response = await dispatchLocal(BridgeCommand.SYS_CHECK_DESIGN, { type: 'sch' });
    if (response.success) {
      const data = response.data as any;
      const violations = data?.drc?.violationCount ?? 0;
      const components = data?.stats?.componentCount ?? 0;
      eda.sys_ToastMessage.showMessage(
        `原理图检查: ${components} components, ${violations} violations`,
        violations > 0 ? ESYS_ToastMessageType.WARNING : ESYS_ToastMessageType.SUCCESS,
      );
    } else {
      eda.sys_ToastMessage.showMessage(`检查失败: ${response.error}`, ESYS_ToastMessageType.ERROR);
    }
  } catch (e: any) {
    eda.sys_ToastMessage.showMessage(`Error: ${e?.message || e}`, ESYS_ToastMessageType.ERROR);
  }
}

/**
 * Run design check on current PCB layout
 * Registered as menu item (pcb): AI 审查布局
 */
export async function reviewLayoutPcb(): Promise<void> {
  try {
    eda.sys_ToastMessage.showMessage('正在审查PCB布局...', ESYS_ToastMessageType.INFO);
    const response = await dispatchLocal(BridgeCommand.SYS_CHECK_DESIGN, { type: 'pcb' });
    if (response.success) {
      const data = response.data as any;
      const violations = data?.drc?.violationCount ?? 0;
      const components = data?.stats?.componentCount ?? 0;
      const unrouted = data?.stats?.unroutedNets ?? 0;
      eda.sys_ToastMessage.showMessage(
        `PCB审查: ${components} components, ${violations} violations, ${unrouted} unrouted`,
        violations > 0 || unrouted > 0 ? ESYS_ToastMessageType.WARNING : ESYS_ToastMessageType.SUCCESS,
      );
    } else {
      eda.sys_ToastMessage.showMessage(`审查失败: ${response.error}`, ESYS_ToastMessageType.ERROR);
    }
  } catch (e: any) {
    eda.sys_ToastMessage.showMessage(`Error: ${e?.message || e}`, ESYS_ToastMessageType.ERROR);
  }
}

/**
 * Run DRC check on current PCB
 * Registered as menu item (pcb): AI 检查DRC
 */
export async function checkDrcPcb(): Promise<void> {
  try {
    eda.sys_ToastMessage.showMessage('正在运行DRC检查...', ESYS_ToastMessageType.INFO);
    const response = await dispatchLocal(BridgeCommand.SYS_RUN_DRC, { type: 'pcb' });
    if (response.success) {
      const data = response.data as any;
      const result = data?.result;
      const count = Array.isArray(result) ? result.length : 0;
      eda.sys_ToastMessage.showMessage(
        count > 0 ? `DRC: ${count} violations found` : 'DRC: No violations',
        count > 0 ? ESYS_ToastMessageType.WARNING : ESYS_ToastMessageType.SUCCESS,
      );
    } else {
      eda.sys_ToastMessage.showMessage(`DRC失败: ${response.error}`, ESYS_ToastMessageType.ERROR);
    }
  } catch (e: any) {
    eda.sys_ToastMessage.showMessage(`Error: ${e?.message || e}`, ESYS_ToastMessageType.ERROR);
  }
}
