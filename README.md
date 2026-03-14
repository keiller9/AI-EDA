# AI-EDA

**English** | [中文](README.zh-CN.md)

MCP (Model Context Protocol) bridge that connects **Claude Code** with **JLCEDA Pro** (嘉立创EDA专业版), enabling hardware engineers to interact with schematic and PCB designs through natural language.

## Why AI-EDA?

Traditional EDA workflows require deep menu navigation and manual repetition. AI-EDA bridges Claude's reasoning with JLCEDA Pro's full API surface — **93 MCP tools** covering schematic, PCB, library, and system operations. Ask in natural language, get results in the editor.

**Key capabilities:**
- **Read** — List components, nets, layers, DRC rules; query by coordinates or region
- **Write** — Place components, draw traces, create net flags, modify attributes, batch operations
- **Analyze** — Run DRC, cross-probe between SCH↔PCB, generate BOM, export Gerber
- **Navigate** — Zoom to board, highlight nets, select primitives, cross-probe by designator
- **Automate** — Auto layout/routing, batch move/modify/delete, differential pair setup

## Architecture

```
Claude Code ◄──Stdio──► MCP Server ◄──WebSocket──► EDA Extension
  (LLM)                (Node.js)       :8765        (JLCEDA Pro)
```

| Component | Description |
|-----------|-------------|
| **mcp-server/** | Node.js MCP server — 93 tools via stdio, WebSocket bridge to EDA |
| **eda-extension/** | JLCEDA Pro extension — receives commands, calls EDA API, returns results |
| **.claude/commands/** | 11 workflow skills — domain knowledge + MCP tool guidance |

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) >= 18
- [JLCEDA Pro](https://lceda.cn/) >= 2.3.0
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)

### 1. Build MCP Server

```bash
cd mcp-server
npm install
npm run build
```

### 2. Build EDA Extension

```bash
cd eda-extension
npm install
npm run build
```

This produces a `.eext` file in `eda-extension/build/dist/`.

### 3. Install EDA Extension

1. Open JLCEDA Pro
2. Go to **Extension Manager**
3. Import the `.eext` file

### 4. Register MCP Server with Claude Code

The project includes `.mcp.json` — update the path if needed:

```json
{
  "mcpServers": {
    "jlceda-bridge": {
      "command": "node",
      "args": ["<path-to>/mcp-server/dist/index.js"],
      "env": { "WS_PORT": "8765" }
    }
  }
}
```

### 5. Connect

1. In JLCEDA Pro **desktop client**, click **AI Bridge → 连接 AI**
2. You should see a success toast: "Connected to MCP Server"
3. In Claude Code, use any `eda_*` tool to interact with the design

> **Important:** The web version of JLCEDA Pro cannot connect to local WebSocket due to HTTPS mixed content restrictions. Use the **desktop client**.

## Usage Examples

```
> Give me an overview of the current design
  → eda_get_design_overview (auto-detects SCH/PCB)

> Find component U1 and show its context
  → eda_find_component → eda_sch_get_component_context

> Check the design for errors
  → eda_check_design (DRC + net analysis + report)

> Highlight the VCC net on the PCB
  → eda_pcb_highlight_net with net="VCC"

> Auto-layout the schematic
  → eda_sch_auto_layout

> Create a Power net class for VCC, 3V3, 5V
  → eda_pcb_create_net_class with name="Power", nets=["VCC","3V3","5V"]

> Export Gerber files for fabrication
  → eda_pcb_export_gerber

> /project:review-pcb decoupling capacitors
  → systematic PCB review with domain rules

> /project:design-check all
  → pre-fabrication check: DRC + SCH↔PCB cross-ref + BOM
```

## MCP Tools (93)

### Connection (1)
| Tool | Description |
|------|-------------|
| `eda_connection_status` | Check EDA extension connection status |

### Schematic Read (8)
| Tool | Description |
|------|-------------|
| `eda_sch_get_state` | Get schematic document state |
| `eda_sch_list_components` | List all components with attributes |
| `eda_sch_list_nets` | List all nets and connections |
| `eda_sch_list_wires` | List all wires |
| `eda_sch_list_primitives` | List primitives by type |
| `eda_sch_get_component` | Get detailed component info by ID |
| `eda_sch_get_component_context` | Get component + connected nets + nearby components |
| `eda_sch_get_selection` | Get currently selected primitive IDs |

### Schematic Write (12)
| Tool | Description |
|------|-------------|
| `eda_sch_place_component` | Place a component on the schematic |
| `eda_sch_draw_wire` | Draw a wire between points |
| `eda_sch_modify_attribute` | Modify component attributes |
| `eda_sch_delete_primitive` | Delete a primitive |
| `eda_sch_auto_layout` | Trigger automatic schematic layout |
| `eda_sch_auto_routing` | Trigger automatic schematic wire routing |
| `eda_sch_select_primitives` | Select primitives in the editor by IDs |
| `eda_sch_cross_probe` | Cross-probe highlight components/pins/nets |
| `eda_sch_create_net_flag` | Create a net flag (GND, VCC, etc.) |
| `eda_sch_create_net_port` | Create a net port (IN, OUT, BI) |
| `eda_sch_batch_modify` | Batch modify multiple attributes |
| `eda_sch_batch_delete` | Batch delete multiple primitives |

### PCB Read (14)
| Tool | Description |
|------|-------------|
| `eda_pcb_get_state` | Get PCB document state |
| `eda_pcb_list_components` | List all PCB components |
| `eda_pcb_list_nets` | List all PCB nets with lengths |
| `eda_pcb_list_layers` | Get layer stack info |
| `eda_pcb_list_primitives` | List primitives by type/layer |
| `eda_pcb_get_component` | Get detailed PCB component info |
| `eda_pcb_get_component_context` | Get component + connected nets + nearby components |
| `eda_pcb_navigate_to` | Navigate editor view to coordinates |
| `eda_pcb_zoom_to_board` | Zoom to fit board outline |
| `eda_pcb_get_primitive_at_point` | Get primitive at specific coordinates |
| `eda_pcb_get_primitives_in_region` | Get all primitives in a rectangular area |
| `eda_pcb_get_net_primitives` | Get all primitives belonging to a net |
| `eda_pcb_get_netlist` | Get PCB netlist data |
| `eda_pcb_get_selection` | Get currently selected primitive IDs |

### PCB Write (26)
| Tool | Description |
|------|-------------|
| `eda_pcb_place_component` | Place a component on PCB |
| `eda_pcb_draw_line` | Draw a copper trace |
| `eda_pcb_place_via` | Place a via |
| `eda_pcb_modify_attribute` | Modify PCB primitive attributes |
| `eda_pcb_delete_primitive` | Delete a PCB primitive |
| `eda_pcb_batch_move` | Batch move multiple components |
| `eda_pcb_batch_modify` | Batch modify multiple attributes |
| `eda_pcb_batch_delete` | Batch delete multiple primitives |
| `eda_pcb_save` | Save PCB document |
| `eda_pcb_import_changes` | Import changes from schematic |
| `eda_pcb_highlight_net` | Highlight a net |
| `eda_pcb_unhighlight_net` | Remove net highlight |
| `eda_pcb_select_net` | Select all primitives of a net |
| `eda_pcb_select_primitives` | Select primitives by IDs |
| `eda_pcb_cross_probe` | Cross-probe highlight components/pins/nets |
| `eda_pcb_clear_selection` | Clear all selection |
| `eda_pcb_select_layer` | Set active layer |
| `eda_pcb_set_layer_visibility` | Show/hide a layer |
| `eda_pcb_set_copper_layers` | Set number of copper layers |
| `eda_pcb_get_drc_rules` | Get current DRC rule configuration |
| `eda_pcb_get_net_classes` | Get all net class definitions |
| `eda_pcb_create_net_class` | Create a net class grouping |
| `eda_pcb_get_diff_pairs` | Get all differential pair definitions |
| `eda_pcb_create_diff_pair` | Create a differential pair |
| `eda_pcb_export_gerber` | Export Gerber manufacturing files |
| `eda_pcb_export_pick_place` | Export pick-and-place file |

### System & Composite (4 + 4)
| Tool | Description |
|------|-------------|
| `eda_sys_run_drc` | Run Design Rule Check (SCH or PCB) |
| `eda_sys_export_bom` | Export Bill of Materials |
| `eda_sys_get_document_info` | Get editor/document info |
| `eda_sys_show_message` | Show toast notification in EDA |
| `eda_get_design_overview` | One-call design overview — auto-detects SCH/PCB |
| `eda_find_component` | Smart search by designator/value/footprint |
| `eda_check_design` | DRC + net analysis + human-readable report |
| `eda_sch_get_bom` | BOM data grouped by value/footprint |

## Workflow Skills (11)

In addition to the 93 MCP tools, the project includes **workflow skills** — slash commands that inject EDA domain knowledge and guide Claude through multi-step design tasks.

### API Reference Skills (6)
| Skill | Description |
|-------|-------------|
| `/project:eda` | Master EDA API reference with calling conventions |
| `/project:eda-sch` | Schematic API — 15 classes, full method signatures |
| `/project:eda-pcb` | PCB API — 22 classes, full method signatures |
| `/project:eda-lib` | Library API — 9 classes (device, symbol, footprint, 3D model) |
| `/project:eda-dmt` | Document tree API — 10 classes (project, board, editor control) |
| `/project:eda-sys` | System API — 20+ classes (file, dialog, menu, storage, unit) |

### Design Workflow Skills (5)
| Skill | Description |
|-------|-------------|
| `/project:review-pcb` | PCB layout review — decoupling caps, power traces, DFM, SI |
| `/project:review-sch` | Schematic review — bypass caps, pull-ups, floating pins, ESD |
| `/project:design-check` | Pre-fab check — DRC + SCH↔PCB cross-ref + BOM + routing |
| `/project:place-components` | PCB placement — functional grouping, priority, grid alignment |
| `/project:route-traces` | PCB routing — trace width, vias, diff pairs, layer strategy |

> **Design pattern:** Workflow skills combine **domain knowledge** (EDA design rules, numeric thresholds) with **MCP tool sequences** (which tools to call and in what order). All method signatures sourced from `@jlceda/pro-api-types` v0.2.15.

## Project Structure

```
AI-EDA/
├── mcp-server/                  # MCP Server (Node.js/TypeScript)
│   ├── src/
│   │   ├── index.ts             # Server entry — registers all 93 tools
│   │   ├── ws-bridge.ts         # WebSocket server, request/response matching
│   │   ├── protocol.ts          # Shared command enum (synced with extension)
│   │   └── tools/               # MCP tool definitions (Zod schemas)
│   │       ├── connection.ts    # 1 tool
│   │       ├── schematic-read.ts  # 8 tools
│   │       ├── schematic-write.ts # 12 tools
│   │       ├── pcb-read.ts      # 14 tools
│   │       ├── pcb-write.ts     # 26 tools
│   │       └── system.ts        # 4+4 tools
│   ├── package.json
│   └── tsconfig.json
│
├── eda-extension/               # JLCEDA Pro Extension
│   ├── src/
│   │   ├── index.ts             # Extension entry — menu actions
│   │   ├── ws-client.ts         # WebSocket client via eda.sys_WebSocket
│   │   ├── dispatcher.ts        # Command router (BridgeCommand → handler)
│   │   ├── protocol.ts          # Shared command enum (synced with server)
│   │   └── handlers/            # EDA API call implementations
│   │       ├── schematic-read.ts  # 8 handlers
│   │       ├── schematic-write.ts # 12 handlers
│   │       ├── pcb-read.ts      # 14 handlers
│   │       ├── pcb-write.ts     # 26 handlers
│   │       └── system.ts        # 8 handlers
│   ├── extension.json           # Extension manifest
│   ├── package.json
│   └── tsconfig.json
│
├── .claude/commands/            # Claude Code skills (11 files)
│   ├── eda.md                  # Master API reference
│   ├── eda-sch.md              # Schematic API (15 classes)
│   ├── eda-pcb.md              # PCB API (22 classes)
│   ├── eda-lib.md              # Library API (9 classes)
│   ├── eda-dmt.md              # Document tree API (10 classes)
│   ├── eda-sys.md              # System API (20+ classes)
│   ├── review-pcb.md           # PCB layout review workflow
│   ├── review-sch.md           # Schematic review workflow
│   ├── design-check.md         # Pre-fabrication design check
│   ├── place-components.md     # PCB component placement
│   └── route-traces.md         # PCB trace routing
│
├── .mcp.json                    # MCP server registration
└── .gitignore
```

## Tech Stack

- **MCP Server**: `@modelcontextprotocol/sdk`, `ws`, `zod`, TypeScript
- **EDA Extension**: JLCEDA Pro Extension API, `@jlceda/pro-api-types` v0.2.15, TypeScript
- **Protocol**: WebSocket (JSON request/response with UUID matching)
- **Build**: esbuild (extension), tsc (server)

## Version History

| Version | Tools | Highlights |
|---------|-------|------------|
| v1.8.0 | 93 | Complete coverage — SCH/PCB primitives, DMT, LIB, SYS |
| v1.7.0 | 65 | PCB full coverage — document, net, selection, layer, DRC rules, manufacturing |
| v1.6.0 | 40 | SCH full coverage — auto layout, cross-probe, BOM, net flags |
| v1.5.0 | 31 | Workflow skills — domain knowledge + MCP tool guidance |
| v1.4.0 | 31 | Figma-inspired — rich descriptions, composite intent tools, progressive disclosure |
| v1.3.0 | 27 | Performance — parallel batch ops, compact responses |

## License

MIT
