# Changelog

All notable changes to this project will be documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioned per [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Planned
- Implement schematic write operations when EDA API exposes them (place component, draw wire, modify attribute, delete primitive)
- Implement PCB write operations (place component, draw trace, place via, modify/delete)
- Add BOM export via `eda.sch_ManufactureData` when API is documented
- Add error retry and reconnection logic for WebSocket
- Add unit/integration tests
- Support multiple concurrent EDA connections

---

## [1.0.0] — 2025-03-13

### Added

**MCP Server (`mcp-server/`)**
- MCP server with stdio transport for Claude Code integration
- WebSocket server (port 8765) bridging commands to EDA extension
- Request/response matching via UUID with 30s timeout
- 22 MCP tools registered with Zod input validation:
  - 1 connection tool (`eda_connection_status`)
  - 6 schematic read tools
  - 4 schematic write tools (stubbed)
  - 6 PCB read tools
  - 5 PCB write tools (stubbed)
  - 4 system tools

**EDA Extension (`eda-extension/`)**
- JLCEDA Pro extension with `AI Bridge` menu (连接/断开/状态)
- WebSocket client using `eda.sys_WebSocket` API
- Command dispatcher routing 22 commands to handlers
- Schematic read handlers:
  - `sch.getState` — document state via `eda.sch_Netlist`
  - `sch.listComponents` — components via netlist data
  - `sch.listNets` — nets via `eda.sch_Netlist.getNetlist()`
  - `sch.listWires` — wires via `eda.sch_SelectControl`
  - `sch.listPrimitives` — primitives by type
  - `sch.getComponent` — single component via `eda.sch_Primitive.getPrimitiveByPrimitiveId()`
- PCB read handlers:
  - `pcb.getState` — canvas origin, layer count, net count
  - `pcb.listComponents` — components via `eda.pcb_Net.getNetlist()`
  - `pcb.listNets` — all nets with lengths via `eda.pcb_Net.getAllNetName()` + `getNetLength()`
  - `pcb.listLayers` — layers via `eda.pcb_Layer.getAllLayers()`
  - `pcb.listPrimitives` — primitives filtered by type/layer
  - `pcb.getComponent` — search component across nets
- System handlers:
  - `sys.runDrc` — DRC via `eda.sch_Drc.check()` / `eda.pcb_Drc.check()`
  - `sys.exportBom` — netlist export as BOM proxy
  - `sys.getDocumentInfo` — editor version, user info, environment flags
  - `sys.showMessage` — toast notification via `eda.sys_ToastMessage`
- Write handlers (stubbed with informational messages):
  - Schematic: place component, draw wire, modify attribute, delete primitive
  - PCB: place component, draw trace, place via, modify attribute, delete primitive

**Claude Code Integration**
- `.mcp.json` for MCP server registration
- 6 Claude Code skills (`.claude/commands/`):
  - `eda.md` — main entry with calling conventions, enums, examples
  - `eda-sch.md` — schematic API reference (SCH_*)
  - `eda-pcb.md` — PCB API reference (PCB_*)
  - `eda-lib.md` — library API reference (LIB_*)
  - `eda-dmt.md` — document tree API reference (DMT_*)
  - `eda-sys.md` — system API reference (SYS_*)

**Project**
- Project structure with shared protocol definitions
- `.gitignore` for node_modules, dist, .env, .eext
- README with architecture diagram, tool reference, setup guide

### Known Limitations
- **Write operations not available**: JLCEDA Pro extension API only exposes read methods for `SCH_Primitive` and `PCB_Primitive`. All write tool calls return stub responses with descriptive messages.
- **BOM export**: `SCH_ManufactureData` API not documented; uses netlist as proxy.
- **PCB primitive listing**: `PCB_LIST_PRIMITIVES` depends on selected primitives (`getAllSelectedPrimitives`), not a global query.
- **No reconnection**: WebSocket does not auto-reconnect on disconnect.

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 1.0.0 | 2025-03-13 | Initial release — 22 MCP tools, read operations functional, write operations stubbed |
