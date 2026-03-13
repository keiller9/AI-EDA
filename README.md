# AI-EDA

MCP (Model Context Protocol) bridge that connects **Claude Code** with **JLCEDA Pro** (嘉立创EDA专业版), enabling hardware engineers to interact with schematic and PCB designs through natural language.

## Architecture

```
Claude Code ◄──Stdio──► MCP Server ◄──WebSocket──► EDA Extension
  (LLM)                (Node.js)       :8765        (JLCEDA Pro)
```

| Component | Description |
|-----------|-------------|
| **mcp-server/** | Node.js MCP server — exposes 23 tools via stdio, bridges commands to EDA over WebSocket |
| **eda-extension/** | JLCEDA Pro extension — receives commands via WebSocket, calls EDA API, returns results |

## MCP Tools (23)

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

### Schematic Write
| Tool | Description |
|------|-------------|
| `eda_sch_place_component` | Place a component on the schematic |
| `eda_sch_draw_wire` | Draw a wire between points |
| `eda_sch_modify_attribute` | Modify component attributes |
| `eda_sch_delete_primitive` | Delete a primitive |

### PCB Read
| Tool | Description |
|------|-------------|
| `eda_pcb_get_state` | Get PCB document state |
| `eda_pcb_list_components` | List all PCB components |
| `eda_pcb_list_nets` | List all PCB nets with lengths |
| `eda_pcb_list_layers` | Get layer stack info |
| `eda_pcb_list_primitives` | List primitives by type/layer |
| `eda_pcb_get_component` | Get detailed PCB component info |

### PCB Write
| Tool | Description |
|------|-------------|
| `eda_pcb_place_component` | Place a component on PCB |
| `eda_pcb_draw_line` | Draw a copper trace |
| `eda_pcb_place_via` | Place a via |
| `eda_pcb_batch_move` | Batch move multiple components at once |
| `eda_pcb_modify_attribute` | Modify PCB primitive attributes |
| `eda_pcb_delete_primitive` | Delete a PCB primitive |

### System
| Tool | Description |
|------|-------------|
| `eda_sys_run_drc` | Run Design Rule Check (schematic or PCB) |
| `eda_sys_export_bom` | Export Bill of Materials |
| `eda_sys_get_document_info` | Get editor/document info |
| `eda_sys_show_message` | Show toast notification in EDA |

> **Note:** All 23 tools are functional. Write operations use the primitive subclass APIs (`SCH_PrimitiveComponent`, `PCB_PrimitiveLine`, etc.) discovered in the JLCEDA Pro extension API. All methods are marked BETA by the EDA vendor.

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

## Usage Examples

```
> List all components in the current schematic
  → uses eda_sch_list_components

> What nets are in the PCB? Show their lengths
  → uses eda_pcb_list_nets

> Run DRC on the schematic
  → uses eda_sys_run_drc with type="sch"

> Show a message "Hello" in the EDA editor
  → uses eda_sys_show_message
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
├── .claude/commands/            # Claude Code skills (EDA API reference)
├── .mcp.json                    # MCP server registration
└── .gitignore
```

## Tech Stack

- **MCP Server**: `@modelcontextprotocol/sdk`, `ws`, `zod`, TypeScript
- **EDA Extension**: JLCEDA Pro Extension API (`pro-api-sdk`), TypeScript
- **Protocol**: WebSocket (JSON request/response with UUID matching)

## License

MIT
