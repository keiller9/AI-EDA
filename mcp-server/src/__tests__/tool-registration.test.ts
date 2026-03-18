/**
 * Tool Registration Test
 * Verifies all MCP tools register without errors and have no duplicates
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';

// Track registered tool names
const registeredTools: string[] = [];

// Mock McpServer to capture tool registrations
const mockServer = {
  tool: vi.fn((name: string, _desc: string, ..._args: unknown[]) => {
    registeredTools.push(name);
  }),
};

// Mock WSBridge
const mockBridge = {
  sendCommand: vi.fn(),
  isConnected: vi.fn(() => false),
  start: vi.fn(),
  stop: vi.fn(),
  getPort: vi.fn(() => 8765),
};

describe('Tool Registration', () => {
  beforeAll(async () => {
    // Dynamically import and register all tools
    const { registerConnectionTools } = await import('../tools/connection.js');
    const { registerSchematicReadTools } = await import('../tools/schematic-read.js');
    const { registerPcbReadTools } = await import('../tools/pcb-read.js');
    const { registerSchematicWriteTools } = await import('../tools/schematic-write.js');
    const { registerPcbWriteTools } = await import('../tools/pcb-write.js');
    const { registerSystemTools } = await import('../tools/system.js');

    registerConnectionTools(mockServer as any, mockBridge as any);
    registerSchematicReadTools(mockServer as any, mockBridge as any);
    registerPcbReadTools(mockServer as any, mockBridge as any);
    registerSchematicWriteTools(mockServer as any, mockBridge as any);
    registerPcbWriteTools(mockServer as any, mockBridge as any);
    registerSystemTools(mockServer as any, mockBridge as any);
  });

  it('should register tools without errors', () => {
    expect(registeredTools.length).toBeGreaterThan(0);
  });

  it('should have no duplicate tool names', () => {
    const unique = new Set(registeredTools);
    const duplicates = registeredTools.filter((name, i) => registeredTools.indexOf(name) !== i);
    expect(duplicates).toEqual([]);
    expect(unique.size).toBe(registeredTools.length);
  });

  it('all tool names should follow eda_ prefix convention', () => {
    const nonEda = registeredTools.filter(name => !name.startsWith('eda_'));
    expect(nonEda).toEqual([]);
  });

  it('should have expected minimum tool count (>= 120)', () => {
    expect(registeredTools.length).toBeGreaterThanOrEqual(120);
  });

  it('should include key tools from each category', () => {
    // Connection
    expect(registeredTools).toContain('eda_connection_status');
    // Schematic read
    expect(registeredTools).toContain('eda_sch_get_state');
    expect(registeredTools).toContain('eda_sch_list_components');
    // Schematic write
    expect(registeredTools).toContain('eda_sch_place_component');
    expect(registeredTools).toContain('eda_sch_draw_wire');
    // PCB read
    expect(registeredTools).toContain('eda_pcb_get_state');
    expect(registeredTools).toContain('eda_pcb_list_components');
    // PCB write
    expect(registeredTools).toContain('eda_pcb_draw_line');
    expect(registeredTools).toContain('eda_pcb_place_via');
    // System
    expect(registeredTools).toContain('eda_sys_run_drc');
    expect(registeredTools).toContain('eda_get_design_overview');
    // DMT
    expect(registeredTools).toContain('eda_dmt_get_document_info');
    expect(registeredTools).toContain('eda_dmt_create_schematic');
    // LIB
    expect(registeredTools).toContain('eda_lib_search_device');
    expect(registeredTools).toContain('eda_lib_get_device_by_lcsc');
    // Phase 2 tools
    expect(registeredTools).toContain('eda_pcb_get_all_rule_configs');
    expect(registeredTools).toContain('eda_pcb_clear_routing');
    expect(registeredTools).toContain('eda_pcb_start_ratline');
    expect(registeredTools).toContain('eda_sch_navigate_to');
    expect(registeredTools).toContain('eda_sch_create_net_label');
  });
});
