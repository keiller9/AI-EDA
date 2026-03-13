# Changelog

All notable changes to this project will be documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioned per [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Planned
- Add BOM export via `eda.sch_ManufactureData` when API is documented
- Add error retry and reconnection logic for WebSocket
- Add unit/integration tests
- Support multiple concurrent EDA connections

---

## [1.2.0] — 2026-03-13

### Added — Batch move & WebSocket stability

**New MCP Tool**
- `eda_pcb_batch_move` — move multiple PCB components in a single call, using `eda.pcb_PrimitiveComponent.modify()` for each move. Accepts array of `{id, x, y, rotation?}`. Total tools: **23**.
- New bridge command `pcb.batchMove` added to protocol

**WebSocket Connection Fixes**
- Use unique WebSocket ID per connection (`ai-eda-bridge-<timestamp>`) to avoid EDA internal ID conflicts
- Removed pre-close of non-existent connections that could poison EDA internal state
- Added "Connecting to..." diagnostic toast before attempting connection
- Added 8-second timeout detection for silent connection failures
- Disabled `perMessageDeflate` compression on MCP Server WebSocket for broader client compatibility

**Documentation**
- README: updated tool count to 23, added desktop client requirement note
- README: added important note about web version HTTPS mixed content restriction

### Fixed
- WebSocket connection from EDA extension to MCP Server now works reliably on JLCEDA Pro desktop client (v3.2.91)
- Previously failed with "无法建立 WebSocket 连接" due to stale ID conflicts and compression negotiation issues

---

## [1.1.0] — 2026-03-13

### Changed — Write operations now functional

**Schematic Write Handlers** — replaced stubs with real API calls:
- `sch.placeComponent` → `eda.sch_PrimitiveComponent.create(component, x, y, rotation, ...)`
- `sch.drawWire` → `eda.sch_PrimitiveWire.create(line, net, ...)`
- `sch.modifyAttribute` → `eda.sch_PrimitiveComponent.modify()` / `eda.sch_PrimitiveWire.modify()` (auto-detects type)
- `sch.deletePrimitive` → `eda.sch_PrimitiveComponent.delete()` / `eda.sch_PrimitiveWire.delete()` (auto-detects type)

**PCB Write Handlers** — replaced stubs with real API calls:
- `pcb.placeComponent` → `eda.pcb_PrimitiveComponent.create(component, layer, x, y, rotation, ...)`
- `pcb.drawLine` → `eda.pcb_PrimitiveLine.create(net, layer, startX, startY, endX, endY, width)` (multi-segment support)
- `pcb.placeVia` → `eda.pcb_PrimitiveVia.create(net, x, y, holeDiameter, diameter, viaType)`
- `pcb.modifyAttribute` → tries Component → Line → Via modify (auto-detects type)
- `pcb.deletePrimitive` → tries Component → Line → Via delete (auto-detects type)

**Schematic Read Handlers** — upgraded to use primitive subclass APIs:
- `sch.listComponents` → `eda.sch_PrimitiveComponent.getAll()` (was netlist-based)
- `sch.listWires` → `eda.sch_PrimitiveWire.getAll()` (was selection-based)
- `sch.getComponent` → `eda.sch_PrimitiveComponent.get(id)` + `getAllPinsByPrimitiveId(id)`
- `sch.getState` → includes component/wire counts

**PCB Read Handlers** — upgraded to use primitive subclass APIs:
- `pcb.listComponents` → `eda.pcb_PrimitiveComponent.getAll()` (was netlist-based)
- `pcb.listPrimitives` → uses `getAll()` for COMPONENT/LINE/VIA/PAD types
- `pcb.getComponent` → `eda.pcb_PrimitiveComponent.get(id)` + `getAllPinsByPrimitiveId(id)`
- `pcb.getState` → includes component count

**Claude Code Skills** — added primitive CRUD API reference:
- `eda-sch.md` → added SCH_PrimitiveComponent (12 methods) and SCH_PrimitiveWire (6 methods)
- `eda-pcb.md` → added PCB_PrimitiveComponent, PCB_PrimitiveLine, PCB_PrimitiveVia, PCB_PrimitivePad (7 methods each)

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
| 1.2.0 | 2026-03-13 | Batch move tool, WebSocket connection fixed, 23 tools total |
| 1.1.0 | 2026-03-13 | All 22 tools functional — write ops use primitive subclass APIs, read ops upgraded |
| 1.0.0 | 2025-03-13 | Initial release — 22 MCP tools, read operations functional, write operations stubbed |
