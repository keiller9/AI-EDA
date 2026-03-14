# AI-EDA

[English](README.md) | **中文**

MCP（模型上下文协议）桥接器，连接 **Claude Code** 与 **嘉立创EDA专业版**（JLCEDA Pro），让硬件工程师通过自然语言操控原理图和 PCB 设计。

## 架构

```
Claude Code ◄──Stdio──► MCP Server ◄──WebSocket──► EDA Extension
  (LLM)                (Node.js)       :8765        (嘉立创EDA Pro)
```

| 组件 | 说明 |
|------|------|
| **mcp-server/** | Node.js MCP 服务器 — 通过 stdio 暴露 65 个工具，通过 WebSocket 桥接命令到 EDA |
| **eda-extension/** | 嘉立创EDA Pro 扩展 — 接收 WebSocket 命令，调用 EDA API，返回结果 |

## MCP 工具（65 个）

### 连接
| 工具 | 说明 |
|------|------|
| `eda_connection_status` | 检查 EDA 扩展连接状态 |

### 原理图读取（8）
| 工具 | 说明 |
|------|------|
| `eda_sch_get_state` | 获取原理图文档状态 |
| `eda_sch_list_components` | 列出所有器件及属性 |
| `eda_sch_list_nets` | 列出所有网络和连接 |
| `eda_sch_list_wires` | 列出所有导线 |
| `eda_sch_list_primitives` | 按类型列出图元 |
| `eda_sch_get_component` | 按 ID 获取器件详情 |
| `eda_sch_get_component_context` | 获取器件上下文（连接网络+邻居器件） |
| `eda_sch_get_selection` | 获取当前选中的图元 ID |

### 原理图写入（12）
| 工具 | 说明 |
|------|------|
| `eda_sch_place_component` | 放置器件到原理图 |
| `eda_sch_draw_wire` | 画导线连接两点 |
| `eda_sch_modify_attribute` | 修改器件属性 |
| `eda_sch_delete_primitive` | 删除图元 |
| `eda_sch_auto_layout` | 触发自动布局 |
| `eda_sch_auto_routing` | 触发自动布线 |
| `eda_sch_select_primitives` | 按 ID 选中图元 |
| `eda_sch_cross_probe` | 交叉探测高亮器件/引脚/网络 |
| `eda_sch_create_net_flag` | 创建网络标识（GND、VCC 等） |
| `eda_sch_create_net_port` | 创建网络端口（IN、OUT、BI） |
| `eda_sch_batch_modify` | 批量修改多个原理图属性 |
| `eda_sch_batch_delete` | 批量删除多个原理图图元 |

### PCB 读取（14）
| 工具 | 说明 |
|------|------|
| `eda_pcb_get_state` | 获取 PCB 文档状态 |
| `eda_pcb_list_components` | 列出所有 PCB 器件 |
| `eda_pcb_list_nets` | 列出所有 PCB 网络及长度 |
| `eda_pcb_list_layers` | 获取层叠信息 |
| `eda_pcb_list_primitives` | 按类型/层列出图元 |
| `eda_pcb_get_component` | 获取 PCB 器件详情 |
| `eda_pcb_get_component_context` | 获取器件上下文（连接网络+邻居） |
| `eda_pcb_navigate_to` | 导航编辑器视图到指定坐标 |
| `eda_pcb_zoom_to_board` | 缩放到板框 |
| `eda_pcb_get_primitive_at_point` | 获取坐标点处的图元 |
| `eda_pcb_get_primitives_in_region` | 获取矩形区域内的所有图元 |
| `eda_pcb_get_net_primitives` | 获取指定网络的所有图元 |
| `eda_pcb_get_netlist` | 获取 PCB 网表数据 |
| `eda_pcb_get_selection` | 获取当前选中的图元 ID |

### PCB 写入（19）
| 工具 | 说明 |
|------|------|
| `eda_pcb_place_component` | 放置器件到 PCB |
| `eda_pcb_draw_line` | 画铜箔走线 |
| `eda_pcb_place_via` | 放置过孔 |
| `eda_pcb_batch_move` | 批量移动多个器件 |
| `eda_pcb_batch_modify` | 批量修改多个 PCB 属性 |
| `eda_pcb_batch_delete` | 批量删除多个 PCB 图元 |
| `eda_pcb_modify_attribute` | 修改 PCB 图元属性 |
| `eda_pcb_delete_primitive` | 删除 PCB 图元 |
| `eda_pcb_save` | 保存 PCB 文档 |
| `eda_pcb_import_changes` | 从原理图导入变更 |
| `eda_pcb_highlight_net` | 高亮网络 |
| `eda_pcb_unhighlight_net` | 取消网络高亮 |
| `eda_pcb_select_net` | 选中网络的所有图元 |
| `eda_pcb_select_primitives` | 按 ID 选中图元 |
| `eda_pcb_cross_probe` | 交叉探测高亮器件/引脚/网络 |
| `eda_pcb_clear_selection` | 清除所有选中 |
| `eda_pcb_select_layer` | 设置活动层 |
| `eda_pcb_set_layer_visibility` | 显示/隐藏图层 |
| `eda_pcb_set_copper_layers` | 设置铜层数量 |
| `eda_pcb_get_drc_rules` | 获取当前 DRC 规则配置 |
| `eda_pcb_get_net_classes` | 获取所有网络类定义 |
| `eda_pcb_create_net_class` | 创建网络类 |
| `eda_pcb_get_diff_pairs` | 获取所有差分对定义 |
| `eda_pcb_create_diff_pair` | 创建差分对 |
| `eda_pcb_export_gerber` | 导出 Gerber 制造文件 |
| `eda_pcb_export_pick_place` | 导出贴片坐标文件 |

### 系统（4）
| 工具 | 说明 |
|------|------|
| `eda_sys_run_drc` | 运行设计规则检查（原理图或 PCB） |
| `eda_sys_export_bom` | 导出物料清单 |
| `eda_sys_get_document_info` | 获取编辑器/文档信息 |
| `eda_sys_show_message` | 在 EDA 中显示吐司通知 |

### 复合/意图驱动（Figma 风格）（4）
| 工具 | 说明 |
|------|------|
| `eda_get_design_overview` | 一键设计概览 — 自动检测原理图/PCB，返回器件+网络+统计 |
| `eda_find_component` | 智能器件搜索 — 按位号/值/封装搜索，返回完整详情+引脚 |
| `eda_check_design` | 综合设计检查 — DRC + 网络分析 + 可读报告 |
| `eda_sch_get_bom` | 获取原理图 BOM 数据 — 按值/封装分组 |

> **说明：** 全部 65 个工具均可用。写操作使用图元子类 API（`SCH_PrimitiveComponent`、`PCB_PrimitiveLine` 等）。批量操作使用 `Promise.allSettled()` 并行执行。复合工具将多个 API 调用组合为单个高级操作。所有 EDA 方法均标记为 BETA。

## 快速开始

### 前提条件
- [Node.js](https://nodejs.org/) >= 18
- [嘉立创EDA专业版](https://lceda.cn/) >= 2.3.0
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)

### 1. 编译 MCP Server

```bash
cd mcp-server
npm install
npm run build
```

### 2. 编译 EDA 扩展

```bash
cd eda-extension
npm install
npm run build
```

将在 `eda-extension/build/dist/` 生成 `.eext` 文件。

### 3. 安装 EDA 扩展

1. 打开嘉立创EDA专业版
2. 进入**扩展管理器**
3. 导入 `.eext` 文件

### 4. 注册 MCP Server 到 Claude Code

项目包含 `.mcp.json` — 按需修改路径：

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

### 5. 连接

1. 在嘉立创EDA专业版**桌面客户端**中，点击 **AI Bridge → 连接 AI**
2. 看到成功提示："Connected to MCP Server"
3. 在 Claude Code 中使用任意 `eda_*` 工具与设计交互

> **重要：** 网页版嘉立创EDA因 HTTPS 混合内容限制无法连接本地 WebSocket。请使用**桌面客户端**（全在线模式）。

## 工作流技能（5 个）

除了 65 个 MCP 工具外，项目还包含**工作流技能**（斜杠命令），注入 EDA 领域知识并引导 Claude 完成多步设计任务。

### API 参考技能
| 技能 | 说明 |
|------|------|
| `/project:eda` | EDA API 主参考，调用约定 |
| `/project:eda-sch` | 原理图 API（SCH_*）参考 |
| `/project:eda-pcb` | PCB API（PCB_*）参考 |
| `/project:eda-lib` | 综合库 API（LIB_*）参考 |
| `/project:eda-dmt` | 文档树 API（DMT_*）参考 |
| `/project:eda-sys` | 系统 API（SYS_*）参考 |

### 设计工作流技能
| 技能 | 说明 |
|------|------|
| `/project:review-pcb` | PCB 布局审查 — 去耦电容、电源、DFM、信号完整性 |
| `/project:review-sch` | 原理图审查 — 旁路电容、总线上拉、浮空引脚、ESD |
| `/project:design-check` | 生产前检查 — DRC + 原理图↔PCB 交叉校验 + BOM + 布线完整性 |
| `/project:place-components` | PCB 布局助手 — 功能分组、优先级、栅格对齐 |
| `/project:route-traces` | PCB 布线助手 — 线宽、过孔选择、差分对、层策略 |

> **设计模式：** 工作流技能结合**领域知识**（EDA 设计规则、数值阈值）和 **MCP 工具序列**（调用什么工具、以什么顺序）。API 参考技能提供方法级文档用于扩展开发。

## 使用示例

```
> 给我当前设计的概览
  → 使用 eda_get_design_overview（自动检测原理图/PCB）

> 找到器件 U1
  → 使用 eda_find_component，query="U1"

> 检查设计有没有错误
  → 使用 eda_check_design（DRC + 网络分析 + 报告）

> 列出当前原理图的所有器件
  → 使用 eda_sch_list_components

> PCB 有哪些网络？显示它们的长度
  → 使用 eda_pcb_list_nets

> 显示 R1 的上下文（连接的网络、邻居器件）
  → 使用 eda_pcb_get_component_context 或 eda_sch_get_component_context

> 获取这个原理图的 BOM
  → 使用 eda_sch_get_bom

> 自动布局原理图
  → 使用 eda_sch_auto_layout

> 高亮 U1 和它连接的网络
  → 使用 eda_sch_cross_probe，components=["U1"]

> 对原理图跑 DRC
  → 使用 eda_sys_run_drc，type="sch"

> /project:review-pcb 去耦电容
  → 系统化 PCB 审查，聚焦去耦电容布局

> /project:review-sch 电源引脚
  → 原理图审查，检查旁路电容和浮空引脚

> /project:design-check all
  → 生产前检查：DRC + 原理图↔PCB 交叉校验 + BOM

> /project:place-components 功能分组
  → 带领域规则的引导式器件布局

> /project:route-traces VCC_3V3
  → 带线宽/过孔/层推荐的引导式布线
```

## 项目结构

```
AI-EDA/
├── mcp-server/                  # MCP 服务器（Node.js/TypeScript）
│   ├── src/
│   │   ├── index.ts             # 服务器入口 — 注册所有 MCP 工具
│   │   ├── ws-bridge.ts         # WebSocket 服务器，请求/响应匹配
│   │   ├── protocol.ts          # 共享命令定义
│   │   └── tools/               # MCP 工具定义（Zod schema）
│   │       ├── connection.ts
│   │       ├── schematic-read.ts
│   │       ├── schematic-write.ts
│   │       ├── pcb-read.ts
│   │       ├── pcb-write.ts
│   │       └── system.ts
│   ├── package.json
│   └── tsconfig.json
│
├── eda-extension/               # 嘉立创EDA Pro 扩展
│   ├── src/
│   │   ├── index.ts             # 扩展入口 — 菜单操作
│   │   ├── ws-client.ts         # WebSocket 客户端（通过 eda.sys_WebSocket）
│   │   ├── dispatcher.ts        # 命令路由
│   │   ├── protocol.ts          # 共享命令定义
│   │   └── handlers/            # EDA API 调用实现
│   │       ├── schematic-read.ts
│   │       ├── schematic-write.ts
│   │       ├── pcb-read.ts
│   │       ├── pcb-write.ts
│   │       └── system.ts
│   ├── extension.json           # 扩展清单
│   ├── package.json
│   └── tsconfig.json
│
├── .claude/commands/            # Claude Code 技能
│   ├── eda.md                  # EDA API 参考（主入口）
│   ├── eda-sch.md              # 原理图 API 参考
│   ├── eda-pcb.md              # PCB API 参考
│   ├── eda-lib.md              # 综合库 API 参考
│   ├── eda-dmt.md              # 文档树 API 参考
│   ├── eda-sys.md              # 系统 API 参考
│   ├── review-pcb.md           # PCB 布局审查工作流
│   ├── review-sch.md           # 原理图审查工作流
│   ├── design-check.md         # 生产前设计检查
│   ├── place-components.md     # PCB 器件布局指南
│   └── route-traces.md         # PCB 走线布线指南
├── .mcp.json                    # MCP 服务器注册
└── .gitignore
```

## 技术栈

- **MCP 服务器**: `@modelcontextprotocol/sdk`, `ws`, `zod`, TypeScript
- **EDA 扩展**: 嘉立创EDA Pro 扩展 API (`pro-api-sdk`), TypeScript
- **协议**: WebSocket（JSON 请求/响应，UUID 匹配）

## 许可证

MIT
