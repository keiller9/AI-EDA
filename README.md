# AI-EDA

MCP (Model Context Protocol) bridge that connects **Claude Code** with **JLCEDA Pro** (嘉立创EDA专业版), enabling hardware engineers to interact with schematic and PCB designs through natural language.

## Architecture

```
Claude Code ◄──Stdio──► MCP Server ◄──WebSocket──► EDA Extension
  (LLM)                (Node.js)       :8765        (JLCEDA Pro)
```

| Component | Description |
|-----------|-------------|
| **mcp-server/** | Node.js MCP server — exposes 40 tools via stdio, bridges commands to EDA over WebSocket |
| **eda-extension/** | JLCEDA Pro extension — receives commands via WebSocket, calls EDA API, returns results |

## MCP Tools (40)

### Connection
| Tool | Description |
|------|-------------|
| `eda_connection_status` | Check EDA extension connection status |

### Schematic Read
| Tool | Description |
|------|-------------|
| `eda_sch_get_state` | Get schematic document state |
| `eda_sch_list_components` | List all components with attributes |
| `eda_sch_list_nets` | List all nets and connections |
| `eda_sch_list_wires` | List all wires |
| `eda_sch_list_primitives` | List primitives by type |
| `eda_sch_get_component` | Get detailed component info by ID |
| `eda_sch_get_component_context` | Get component with connected nets and nearby components |
| `eda_sch_get_selection` | Get currently selected primitive IDs |

### Schematic Write
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
| `eda_sch_batch_modify` | Batch modify multiple schematic attributes |
| `eda_sch_batch_delete` | Batch delete multiple schematic primitives |

### PCB Read
| Tool | Description |
|------|-------------|
| `eda_pcb_get_state` | Get PCB document state |
| `eda_pcb_list_components` | List all PCB components |
| `eda_pcb_list_nets` | List all PCB nets with lengths |
| `eda_pcb_list_layers` | Get layer stack info |
| `eda_pcb_list_primitives` | List primitives by type/layer |
| `eda_pcb_get_component` | Get detailed PCB component info |
| `eda_pcb_get_component_context` | Get component with connected nets and nearby components |

### PCB Write
| Tool | Description |
|------|-------------|
| `eda_pcb_place_component` | Place a component on PCB |
| `eda_pcb_draw_line` | Draw a copper trace |
| `eda_pcb_place_via` | Place a via |
| `eda_pcb_batch_move` | Batch move multiple components at once |
| `eda_pcb_batch_modify` | Batch modify multiple PCB attributes |
| `eda_pcb_batch_delete` | Batch delete multiple PCB primitives |
| `eda_pcb_modify_attribute` | Modify PCB primitive attributes |
| `eda_pcb_delete_primitive` | Delete a PCB primitive |

### System
| Tool | Description |
|------|-------------|
| `eda_sys_run_drc` | Run Design Rule Check (schematic or PCB) |
| `eda_sys_export_bom` | Export Bill of Materials |
| `eda_sys_get_document_info` | Get editor/document info |
| `eda_sys_show_message` | Show toast notification in EDA |

### Composite / Intent (Figma-inspired)
| Tool | Description |
|------|-------------|
| `eda_get_design_overview` | One-call design overview — auto-detects SCH/PCB, returns components + nets + stats |
| `eda_find_component` | Smart component search by designator/value/footprint with full details + pins |
| `eda_check_design` | Comprehensive design check — DRC + net analysis + human-readable report |
| `eda_sch_get_bom` | Get BOM data from schematic — grouped by value/footprint |

> **Note:** All 40 tools are functional. Write operations use the primitive subclass APIs (`SCH_PrimitiveComponent`, `PCB_PrimitiveLine`, etc.). Batch operations use `Promise.allSettled()` for parallel execution. Composite tools combine multiple API calls into single high-level operations. All EDA methods are marked BETA by the vendor.

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

> **Important:** The web version of JLCEDA Pro cannot connect to local WebSocket due to HTTPS mixed content restrictions. Use the **desktop client** (全在线 mode).

## Workflow Skills (5)

In addition to the 31 MCP tools, the project includes **workflow skills** (slash commands) that inject EDA domain knowledge and guide Claude through multi-step design tasks.

### API Reference Skills
| Skill | Description |
|-------|-------------|
| `/project:eda` | Master EDA API reference with calling conventions |
| `/project:eda-sch` | Schematic API (SCH_*) reference |
| `/project:eda-pcb` | PCB API (PCB_*) reference |
| `/project:eda-lib` | Library API (LIB_*) reference |
| `/project:eda-dmt` | Document tree API (DMT_*) reference |
| `/project:eda-sys` | System API (SYS_*) reference |

### Design Workflow Skills
| Skill | Description |
|-------|-------------|
| `/project:review-pcb` | PCB layout review — decoupling, power, DFM, signal integrity checklist |
| `/project:review-sch` | Schematic review — bypass caps, bus pull-ups, floating pins, ESD protection |
| `/project:design-check` | Pre-fabrication check — DRC + SCH↔PCB cross-reference + BOM + routing completeness |
| `/project:place-components` | PCB placement assistant — functional grouping, priority order, grid alignment |
| `/project:route-traces` | PCB routing assistant — trace width, via selection, differential pairs, layer strategy |

> **Design pattern:** Workflow skills combine **domain knowledge** (EDA design rules, numeric thresholds) with **MCP tool sequences** (which tools to call and in what order). API reference skills provide method-level documentation for extension development.

## Usage Examples

```
> Give me an overview of the current design
  → uses eda_get_design_overview (auto-detects SCH/PCB)

> Find component U1
  → uses eda_find_component with query="U1"

> Check the design for errors
  → uses eda_check_design (DRC + net analysis + report)

> List all components in the current schematic
  → uses eda_sch_list_components

> What nets are in the PCB? Show their lengths
  → uses eda_pcb_list_nets

> Show me the context of component R1 (connected nets, neighbors)
  → uses eda_pcb_get_component_context or eda_sch_get_component_context

> Get the BOM for this schematic
  → uses eda_sch_get_bom

> Auto-layout the schematic
  → uses eda_sch_auto_layout

> Highlight U1 and its connected nets
  → uses eda_sch_cross_probe with components=["U1"]

> Run DRC on the schematic
  → uses eda_sys_run_drc with type="sch"

> /project:review-pcb decoupling capacitors
  → systematic PCB review focused on decoupling cap placement

> /project:review-sch power pins
  → schematic review checking bypass caps and floating pins

> /project:design-check all
  → pre-fabrication check: DRC + SCH↔PCB cross-reference + BOM

> /project:place-components functional grouping
  → guided component placement with domain rules

> /project:route-traces VCC_3V3
  → guided trace routing with width/via/layer recommendations
```

## Project Structure

```
AI-EDA/
├── mcp-server/                  # MCP Server (Node.js/TypeScript)
│   ├── src/
│   │   ├── index.ts             # Server entry — registers all MCP tools
│   │   ├── ws-bridge.ts         # WebSocket server, request/response matching
│   │   ├── protocol.ts          # Shared command definitions
│   │   └── tools/               # MCP tool definitions (Zod schemas)
│   │       ├── connection.ts
│   │       ├── schematic-read.ts
│   │       ├── schematic-write.ts
│   │       ├── pcb-read.ts
│   │       ├── pcb-write.ts
│   │       └── system.ts
│   ├── package.json
│   └── tsconfig.json
│
├── eda-extension/               # JLCEDA Pro Extension
│   ├── src/
│   │   ├── index.ts             # Extension entry — menu actions
│   │   ├── ws-client.ts         # WebSocket client via eda.sys_WebSocket
│   │   ├── dispatcher.ts        # Command router
│   │   ├── protocol.ts          # Shared command definitions
│   │   └── handlers/            # EDA API call implementations
│   │       ├── schematic-read.ts
│   │       ├── schematic-write.ts
│   │       ├── pcb-read.ts
│   │       ├── pcb-write.ts
│   │       └── system.ts
│   ├── extension.json           # Extension manifest
│   ├── package.json
│   └── tsconfig.json
│
├── .claude/commands/            # Claude Code skills
│   ├── eda.md                  # EDA API reference (master)
│   ├── eda-sch.md              # Schematic API reference
│   ├── eda-pcb.md              # PCB API reference
│   ├── eda-lib.md              # Library API reference
│   ├── eda-dmt.md              # Document tree API reference
│   ├── eda-sys.md              # System API reference
│   ├── review-pcb.md           # PCB layout review workflow
│   ├── review-sch.md           # Schematic review workflow
│   ├── design-check.md         # Pre-fabrication design check
│   ├── place-components.md     # PCB component placement guide
│   └── route-traces.md         # PCB trace routing guide
├── .mcp.json                    # MCP server registration
└── .gitignore
```

## Tech Stack

- **MCP Server**: `@modelcontextprotocol/sdk`, `ws`, `zod`, TypeScript
- **EDA Extension**: JLCEDA Pro Extension API (`pro-api-sdk`), TypeScript
- **Protocol**: WebSocket (JSON request/response with UUID matching)

## License

MIT
