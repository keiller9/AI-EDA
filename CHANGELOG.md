# Changelog

All notable changes to this project will be documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioned per [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Planned
- Add error retry and reconnection logic for WebSocket
- Support multiple concurrent EDA connections
- End-to-end schematic generation from natural language
- Circuit knowledge graph + RAG

---

## [2.1.0] — 2026-03-18

### Added — AI Assistant Panel (full-featured UI in EDA editor)

**New: `ai-panel.html` — 4-tab panel embedded in JLCEDA Pro**
- **Dashboard tab**: MCP connection status, document type detection, real-time stats (component count, net count, wire count, DRC violations), Claude Code execution state
- **Quick Actions tab**: 12 one-click buttons grouped by category (review, operations, documents) — review schematic, review PCB, design check, run DRC, search components, view BOM, export Gerber, design overview, save, import changes, refresh
- **Activity Log tab**: Command history with OK/ERR filtering, last 100 entries, newest first
- **About tab**: Project info, version, tool/skill counts, usage tips with slash command reference

**Extension enhancements (`index.ts`)**:
- `showAIPanel()` — opens full AI assistant panel (500×700)
- Dashboard data auto-collection every 5 seconds (detects SCH/PCB, counts components/nets/wires)
- `__AI_EDA_PANEL_ACTIONS__` callback system — 12 quick action handlers via `dispatchLocal()`
- Menu entry "AI 助手面板" added to home/sch/pcb contexts

**Bug fix: `schematic-write.ts` modify_attribute key normalization**
- Added key normalization map: `Designator`→`designator`, `Value`→`value`, `Name`→`name`, etc.
- JLCEDA API requires lowercase field names; previously `Designator` silently failed
- Fixed `createNetFlag`/`createNetPort` type errors

### Changed
- Extension version bumped to 1.2.0

---

## [1.8.0] — 2026-03-14

### Added — Complete API coverage across all subsystems

**28 New MCP Tools** — total tools: **93** (+28)

SCH Supplement (5):
- `eda_sch_save`, `eda_sch_import_changes` — document persistence
- `eda_sch_clear_selection`, `eda_sch_get_mouse_position` — editor interaction
- `eda_sch_get_primitives_bbox` — spatial queries

PCB Primitive Create (8):
- `eda_pcb_draw_arc` — arc traces
- `eda_pcb_place_text` — silkscreen text
- `eda_pcb_create_pour` — copper pour (polygon fill)
- `eda_pcb_create_region` — keep-out/constraint regions
- `eda_pcb_create_fill` — solid fills
- `eda_pcb_draw_polyline` — multi-segment lines
- `eda_pcb_place_dimension` — dimension annotations
- `eda_pcb_get_mouse_position` — cursor position

DMT Document Tree (6):
- `eda_dmt_get_document_info` — current document type + UUID
- `eda_dmt_open_document` — open document by UUID
- `eda_dmt_get_project_info` — project details
- `eda_dmt_list_boards` — list all boards
- `eda_dmt_get_board_info` — board details (SCH+PCB associations)
- `eda_dmt_list_tabs` — editor tabs

LIB Library (5):
- `eda_lib_search_device` — search component library
- `eda_lib_get_device` — get device details
- `eda_lib_search_footprint` — search footprints
- `eda_lib_get_libraries` — list all libraries
- `eda_lib_get_device_by_lcsc` — lookup by LCSC C-code

SYS System (4):
- `eda_sys_get_environment` — editor version, user, mode
- `eda_sys_get_user_config` — extension configs
- `eda_sys_unit_convert` — mil/mm/inch conversion
- `eda_sys_open_url` — open URL

---

## [1.7.0] — 2026-03-14

### Added — PCB API full coverage

**25 New MCP Tools** — total tools: **65** (+25)

PCB Document Operations (6):
- `eda_pcb_save` — save document
- `eda_pcb_import_changes` — sync changes from schematic
- `eda_pcb_navigate_to` — navigate viewport to coordinates
- `eda_pcb_zoom_to_board` — zoom to fit board outline
- `eda_pcb_get_primitive_at_point` — spatial query at point
- `eda_pcb_get_primitives_in_region` — spatial query in rectangle

PCB Net Operations (5):
- `eda_pcb_highlight_net` / `unhighlight_net` — visual net highlighting
- `eda_pcb_select_net` — select all primitives of a net
- `eda_pcb_get_net_primitives` — get all traces/pads/vias of a net
- `eda_pcb_get_netlist` — get PCB-side netlist

PCB Selection (4):
- `eda_pcb_select_primitives` — select by IDs
- `eda_pcb_cross_probe` — cross-probe by designator/pin/net
- `eda_pcb_get_selection` — get selected IDs
- `eda_pcb_clear_selection` — clear selection

PCB Layer Management (3):
- `eda_pcb_select_layer` — set active layer
- `eda_pcb_set_layer_visibility` — show/hide layers
- `eda_pcb_set_copper_layers` — set copper layer count

PCB DRC Rule Management (5):
- `eda_pcb_get_drc_rules` — read DRC configuration
- `eda_pcb_get_net_classes` / `create_net_class` — net class management
- `eda_pcb_get_diff_pairs` / `create_diff_pair` — differential pair management

PCB Manufacturing Export (2):
- `eda_pcb_export_gerber` — export Gerber fabrication files
- `eda_pcb_export_pick_place` — export pick-and-place assembly data

---

## [1.6.0] — 2026-03-14

### Added — New SCH API coverage + progressive disclosure

**9 New MCP Tools** — total tools: **40** (+9)

Progressive Disclosure (Level 3):
- `eda_sch_get_component_context` — comprehensive component context: details + pins + connected nets + nearby components (mirrors `eda_pcb_get_component_context`)
- `eda_sch_get_selection` — get currently selected primitive IDs from the editor

Schematic Document Operations:
- `eda_sch_auto_layout` — trigger EDA built-in auto layout for schematic components
- `eda_sch_auto_routing` — trigger EDA built-in auto wire routing

Selection & Cross-Probe:
- `eda_sch_select_primitives` — programmatically select primitives in the editor
- `eda_sch_cross_probe` — cross-probe highlight by designator, pin reference, or net name

Net Symbols:
- `eda_sch_create_net_flag` — create power/ground net flags (GND, VCC, 3V3)
- `eda_sch_create_net_port` — create directional net ports (IN, OUT, BI) for multi-page designs

BOM:
- `eda_sch_get_bom` — live BOM data grouped by value/footprint with manufacturer/supplier info

**API Discovery**: Re-read official JLCEDA Pro API docs and found extensive BETA APIs previously undocumented in this project — SCH_PrimitiveComponent has full CRUD, SCH_Document has autoLayout/autoRouting, SCH_SelectControl has cross-probe, SCH_ManufactureData has BOM export.

---

## [1.5.0] — 2026-03-13

### Added — Workflow skills: domain knowledge + MCP tool guidance

**5 New Workflow Skills** (`.claude/commands/`) — total skills: **11** (+5)
- `review-pcb` — PCB layout review with checklist: decoupling capacitors (<100mil from IC), power trace width table, crystal placement, DFM rules, signal integrity quick checks
- `review-sch` — Schematic review: bypass cap audit per IC power pin, I2C/SPI bus pull-up checks, floating pin detection, reset circuit rules, ESD protection checklist
- `design-check` — Pre-fabrication readiness: dual-document DRC, SCH↔PCB designator cross-reference, unrouted net detection, BOM completeness audit, structured PASS/FAIL report
- `place-components` — PCB placement assistant: priority order (connectors→IC→passives), functional grouping rules, grid alignment (25/50mil), orientation conventions, preview-before-execute
- `route-traces` — PCB routing assistant: trace width vs current table, routing priority order, via selection guide, 4-layer stackup strategy, differential pair rules, length matching, 45° routing

**Design Pattern: Skills + Tools Integration**
- API reference skills (6 existing) → tell Claude WHAT methods exist
- Workflow skills (5 new) → tell Claude HOW to combine MCP tools + WHAT domain rules to apply
- Write-oriented skills enforce "preview → confirm → execute" pattern
- All numeric thresholds are concrete and measurable (distances, widths, currents)

---

## [1.4.0] — 2026-03-13

### Added — Figma-inspired tool experience improvements

**New Composite / Intent Tools** — total tools: **31** (+4)
- `eda_get_design_overview` — one-call design overview, auto-detects SCH/PCB, returns components + nets + stats
- `eda_find_component` — smart component search by designator/value/footprint, returns full details + pins
- `eda_check_design` — comprehensive design check: DRC + net analysis + component stats + human-readable report
- `eda_pcb_get_component_context` — progressive disclosure: component + pins + connected nets with lengths + 10 nearest neighbors

**Enhanced Tool Descriptions** — all 27 existing tools
- Every tool description now includes: return format, when to use, relationships to other tools
- Follows Figma MCP pattern: rich descriptions guide the LLM to pick the right tool
- Example: `eda_pcb_list_components` now explains compact format, suggests `get_component` for details and `get_component_context` for spatial context

**Design Patterns**
- Outcomes over Operations: composite tools accomplish user intents in a single call
- Progressive Disclosure: 3 levels of component detail (list → get → context)
- Auto-detection: composite tools detect active document type (SCH/PCB) automatically

---

## [1.3.0] — 2026-03-13

### Added — Performance optimization & batch tools (Figma-inspired)

**New MCP Tools** — total tools: **27** (+4)
- `eda_pcb_batch_modify` — batch modify multiple PCB primitive attributes in parallel
- `eda_pcb_batch_delete` — batch delete multiple PCB primitives in parallel
- `eda_sch_batch_modify` — batch modify multiple schematic primitive attributes in parallel
- `eda_sch_batch_delete` — batch delete multiple schematic primitives in parallel

**Performance — Parallel Execution**
- `pcb.batchMove` handler: sequential `for...of await` → `Promise.allSettled()` (5-10x faster for bulk moves)
- `pcb.drawLine` handler: sequential loop → `Promise.allSettled()` (parallel segment creation)

**Performance — Compact Responses**
- `pcb.listComponents`: returns compact `{id, designator, x, y, rotation, layer, footprint}` instead of full primitive objects (~80% smaller)
- `sch.listComponents`: returns compact `{id, designator, value, x, y, rotation}` instead of full objects
- All MCP tools: removed JSON pretty-printing (`null, 2` → compact), ~30-40% response size reduction
- Optimized filter: targeted field matching instead of `JSON.stringify()` full-object search

### Fixed
- `pcb.listNets`: fixed `netNames.map is not a function` — added `Array.isArray()` guard
- `pcb.listPrimitives`: fixed `netNames is not iterable` — added `Array.isArray()` guard

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
| 1.5.0 | 2026-03-13 | Workflow skills: PCB/SCH review, design check, placement, routing — domain knowledge + tool guidance |
| 1.4.0 | 2026-03-13 | Figma-inspired: composite intent tools, enhanced descriptions, 31 tools total |
| 1.3.0 | 2026-03-13 | Performance: parallel batch ops, compact responses, 27 tools total |
| 1.2.0 | 2026-03-13 | Batch move tool, WebSocket connection fixed, 23 tools total |
| 1.1.0 | 2026-03-13 | All 22 tools functional — write ops use primitive subclass APIs, read ops upgraded |
| 1.0.0 | 2025-03-13 | Initial release — 22 MCP tools, read operations functional, write operations stubbed |
