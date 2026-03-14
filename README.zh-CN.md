# AI-EDA

[English](README.md) | **中文**

MCP（模型上下文协议）桥接器，连接 **Claude Code** 与 **嘉立创EDA专业版**（JLCEDA Pro），让硬件工程师通过自然语言操控原理图和 PCB 设计。

## 为什么选择 AI-EDA？

传统 EDA 工作流需要深度菜单导航和大量手动重复操作。AI-EDA 将 Claude 的推理能力与嘉立创 EDA Pro 的完整 API 接口桥接 — **65 个 MCP 工具**覆盖原理图、PCB、元件库和系统操作。用自然语言提问，在编辑器中得到结果。

**核心能力：**
- **读取** — 列出器件、网络、层叠、DRC 规则；按坐标或区域查询
- **写入** — 放置器件、画走线、创建网络标识、修改属性、批量操作
- **分析** — 运行 DRC、原理图↔PCB 交叉探测、生成 BOM、导出 Gerber
- **导航** — 缩放到板框、高亮网络、选中图元、按位号交叉探测
- **自动化** — 自动布局/布线、批量移动/修改/删除、差分对设置

## 架构

```
Claude Code ◄──Stdio──► MCP Server ◄──WebSocket──► EDA Extension
  (LLM)                (Node.js)       :8765        (嘉立创EDA Pro)
```

| 组件 | 说明 |
|------|------|
| **mcp-server/** | Node.js MCP 服务器 — 65 个工具通过 stdio 暴露，WebSocket 桥接到 EDA |
| **eda-extension/** | 嘉立创 EDA Pro 扩展 — 接收命令，调用 EDA API，返回结果 |
| **.claude/commands/** | 11 个工作流技能 — 领域知识 + MCP 工具引导 |

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

> **重要：** 网页版嘉立创EDA因 HTTPS 混合内容限制无法连接本地 WebSocket。请使用**桌面客户端**。

## 使用示例

```
> 给我当前设计的概览
  → eda_get_design_overview（自动检测原理图/PCB）

> 找到器件 U1 并显示它的上下文
  → eda_find_component → eda_sch_get_component_context

> 检查设计有没有错误
  → eda_check_design（DRC + 网络分析 + 报告）

> 在 PCB 上高亮 VCC 网络
  → eda_pcb_highlight_net，net="VCC"

> 自动布局原理图
  → eda_sch_auto_layout

> 为 VCC、3V3、5V 创建 Power 网络类
  → eda_pcb_create_net_class，name="Power"，nets=["VCC","3V3","5V"]

> 导出 Gerber 制造文件
  → eda_pcb_export_gerber

> /project:review-pcb 去耦电容
  → 带领域规则的系统化 PCB 审查

> /project:design-check all
  → 生产前检查：DRC + 原理图↔PCB 交叉校验 + BOM
```

## MCP 工具（65 个）

### 连接（1）
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
| `eda_sch_get_component_context` | 获取器件 + 连接网络 + 邻居器件 |
| `eda_sch_get_selection` | 获取当前选中的图元 ID |

### 原理图写入（12）
| 工具 | 说明 |
|------|------|
| `eda_sch_place_component` | 放置器件 |
| `eda_sch_draw_wire` | 画导线 |
| `eda_sch_modify_attribute` | 修改属性 |
| `eda_sch_delete_primitive` | 删除图元 |
| `eda_sch_auto_layout` | 自动布局 |
| `eda_sch_auto_routing` | 自动布线 |
| `eda_sch_select_primitives` | 按 ID 选中 |
| `eda_sch_cross_probe` | 交叉探测高亮 |
| `eda_sch_create_net_flag` | 创建网络标识（GND、VCC） |
| `eda_sch_create_net_port` | 创建网络端口（IN、OUT、BI） |
| `eda_sch_batch_modify` | 批量修改 |
| `eda_sch_batch_delete` | 批量删除 |

### PCB 读取（14）
| 工具 | 说明 |
|------|------|
| `eda_pcb_get_state` | 获取 PCB 文档状态 |
| `eda_pcb_list_components` | 列出所有 PCB 器件 |
| `eda_pcb_list_nets` | 列出所有网络及长度 |
| `eda_pcb_list_layers` | 获取层叠信息 |
| `eda_pcb_list_primitives` | 按类型/层列出图元 |
| `eda_pcb_get_component` | 获取器件详情 |
| `eda_pcb_get_component_context` | 获取器件 + 连接网络 + 邻居 |
| `eda_pcb_navigate_to` | 导航到坐标 |
| `eda_pcb_zoom_to_board` | 缩放到板框 |
| `eda_pcb_get_primitive_at_point` | 获取坐标点处图元 |
| `eda_pcb_get_primitives_in_region` | 获取区域内所有图元 |
| `eda_pcb_get_net_primitives` | 获取网络的所有图元 |
| `eda_pcb_get_netlist` | 获取 PCB 网表 |
| `eda_pcb_get_selection` | 获取选中图元 ID |

### PCB 写入（26）
| 工具 | 说明 |
|------|------|
| `eda_pcb_place_component` | 放置器件 |
| `eda_pcb_draw_line` | 画铜箔走线 |
| `eda_pcb_place_via` | 放置过孔 |
| `eda_pcb_modify_attribute` | 修改属性 |
| `eda_pcb_delete_primitive` | 删除图元 |
| `eda_pcb_batch_move` | 批量移动 |
| `eda_pcb_batch_modify` | 批量修改 |
| `eda_pcb_batch_delete` | 批量删除 |
| `eda_pcb_save` | 保存文档 |
| `eda_pcb_import_changes` | 从原理图导入变更 |
| `eda_pcb_highlight_net` | 高亮网络 |
| `eda_pcb_unhighlight_net` | 取消高亮 |
| `eda_pcb_select_net` | 选中网络 |
| `eda_pcb_select_primitives` | 按 ID 选中 |
| `eda_pcb_cross_probe` | 交叉探测 |
| `eda_pcb_clear_selection` | 清除选中 |
| `eda_pcb_select_layer` | 设置活动层 |
| `eda_pcb_set_layer_visibility` | 显示/隐藏层 |
| `eda_pcb_set_copper_layers` | 设置铜层数 |
| `eda_pcb_get_drc_rules` | 获取 DRC 规则 |
| `eda_pcb_get_net_classes` | 获取网络类 |
| `eda_pcb_create_net_class` | 创建网络类 |
| `eda_pcb_get_diff_pairs` | 获取差分对 |
| `eda_pcb_create_diff_pair` | 创建差分对 |
| `eda_pcb_export_gerber` | 导出 Gerber |
| `eda_pcb_export_pick_place` | 导出贴片坐标 |

### 系统与复合（4 + 4）
| 工具 | 说明 |
|------|------|
| `eda_sys_run_drc` | 运行 DRC（原理图或 PCB） |
| `eda_sys_export_bom` | 导出 BOM |
| `eda_sys_get_document_info` | 获取编辑器/文档信息 |
| `eda_sys_show_message` | 显示吐司通知 |
| `eda_get_design_overview` | 一键设计概览 — 自动检测原理图/PCB |
| `eda_find_component` | 智能搜索 — 按位号/值/封装 |
| `eda_check_design` | DRC + 网络分析 + 可读报告 |
| `eda_sch_get_bom` | BOM 数据 — 按值/封装分组 |

## 工作流技能（11 个）

### API 参考技能（6）
| 技能 | 说明 |
|------|------|
| `/project:eda` | EDA API 主参考，调用约定 |
| `/project:eda-sch` | 原理图 API — 15 个类，完整方法签名 |
| `/project:eda-pcb` | PCB API — 22 个类，完整方法签名 |
| `/project:eda-lib` | 综合库 API — 9 个类（器件、符号、封装、3D 模型） |
| `/project:eda-dmt` | 文档树 API — 10 个类（工程、板子、编辑器控制） |
| `/project:eda-sys` | 系统 API — 20+ 个类（文件、对话框、菜单、存储、单位） |

### 设计工作流技能（5）
| 技能 | 说明 |
|------|------|
| `/project:review-pcb` | PCB 布局审查 — 去耦电容、电源走线、DFM、信号完整性 |
| `/project:review-sch` | 原理图审查 — 旁路电容、上拉电阻、浮空引脚、ESD |
| `/project:design-check` | 生产前检查 — DRC + 原理图↔PCB 交叉校验 + BOM + 布线 |
| `/project:place-components` | PCB 布局 — 功能分组、优先级、栅格对齐 |
| `/project:route-traces` | PCB 布线 — 线宽、过孔、差分对、层策略 |

> **设计模式：** 工作流技能结合**领域知识**（EDA 设计规则、数值阈值）和 **MCP 工具序列**（调用什么工具、以什么顺序）。所有方法签名来源于 `@jlceda/pro-api-types` v0.2.15。

## 项目结构

```
AI-EDA/
├── mcp-server/                  # MCP 服务器（Node.js/TypeScript）
│   ├── src/
│   │   ├── index.ts             # 服务器入口 — 注册全部 65 个工具
│   │   ├── ws-bridge.ts         # WebSocket 服务器，请求/响应匹配
│   │   ├── protocol.ts          # 共享命令枚举（与扩展同步）
│   │   └── tools/               # MCP 工具定义（Zod schema）
│   ├── package.json
│   └── tsconfig.json
│
├── eda-extension/               # 嘉立创 EDA Pro 扩展
│   ├── src/
│   │   ├── index.ts             # 扩展入口 — 菜单操作
│   │   ├── ws-client.ts         # WebSocket 客户端
│   │   ├── dispatcher.ts        # 命令路由
│   │   ├── protocol.ts          # 共享命令枚举（与服务器同步）
│   │   └── handlers/            # EDA API 调用实现
│   ├── extension.json           # 扩展清单
│   ├── package.json
│   └── tsconfig.json
│
├── .claude/commands/            # Claude Code 技能（11 个文件）
├── .mcp.json                    # MCP 服务器注册
└── .gitignore
```

## 技术栈

- **MCP 服务器**: `@modelcontextprotocol/sdk`, `ws`, `zod`, TypeScript
- **EDA 扩展**: 嘉立创 EDA Pro 扩展 API, `@jlceda/pro-api-types` v0.2.15, TypeScript
- **协议**: WebSocket（JSON 请求/响应，UUID 匹配）
- **构建**: esbuild（扩展）, tsc（服务器）

## 版本历史

| 版本 | 工具数 | 亮点 |
|------|--------|------|
| v1.7.0 | 65 | PCB 全覆盖 — 文档、网络、选择、层叠、DRC 规则、制造导出 |
| v1.6.0 | 40 | SCH 全覆盖 — 自动布局、交叉探测、BOM、网络标识 |
| v1.5.0 | 31 | 工作流技能 — 领域知识 + MCP 工具引导 |
| v1.4.0 | 31 | Figma 风格 — 富描述、复合意图工具、渐进式披露 |
| v1.3.0 | 27 | 性能优化 — 并行批量操作、紧凑响应 |

## 许可证

MIT
